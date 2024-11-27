import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RealityWaveGenerator } from '../services/audio/RealityWaveGenerator';
import { colors } from '../theme/colors';
import { BlurView } from 'expo-blur';
import { featureAccess, AUDIO_TRACKS } from '../services/subscription/featureAccess';
import { AudioTrackAccess, SubscriptionTier } from '../services/subscription/types';
import { LinearGradient } from 'expo-linear-gradient';
import { AudioControls } from '../components/AudioControls';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { metricsService } from '../services/metrics/metricsService';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/shared/Card';
import { H1, H2, H3, BodyMedium, BodySmall, Label } from '../components/shared/Typography';
import { Button } from '../components/shared/Button';
import { useSettings } from '../contexts/SettingsContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Category icons mapping
const CATEGORY_ICONS = {
  'Core Reality Wave': 'radio-outline',
  'Advanced Reality Wave': 'star-outline',
} as const;

// Pre-compute grouped tracks - excluding bonus tracks
const { availableTracks, lockedTracks } = (() => {
  const nonBonusTracks = AUDIO_TRACKS.filter(track => track.category !== 'Bonus Reality Waves');
  return {
    availableTracks: nonBonusTracks.filter(track => featureAccess.hasAccessToTrack(track.id)),
    lockedTracks: nonBonusTracks.filter(track => !featureAccess.hasAccessToTrack(track.id))
  };
})();

// Pre-compute initial track
const initialTrack = availableTracks[0] || AUDIO_TRACKS[0];

const SessionPlayer: React.FC = () => {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(initialTrack);
  const [realityWaveGenerator] = useState(() => new RealityWaveGenerator());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackDurations, setTrackDurations] = useState<Record<string, number>>({});
  const [isSeeking, setIsSeeking] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Group tracks by category - memoized
  const groupedTracks = useMemo(() => {
    return [...availableTracks, ...lockedTracks].reduce((acc, track) => {
      if (!acc[track.category]) {
        acc[track.category] = [];
      }
      acc[track.category].push(track);
      return acc;
    }, {} as Record<string, AudioTrackAccess[]>);
  }, []); // Empty dependency array since tracks are pre-computed

  // Format time as mm:ss (memoized)
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Load track durations in parallel
  const loadTrackDurations = useCallback(async (tracks: AudioTrackAccess[]) => {
    const durationPromises = tracks.map(async track => {
      if (trackDurations[track.id]) return { id: track.id, duration: trackDurations[track.id] }; // Use existing duration

      try {
        const tempGenerator = new RealityWaveGenerator();
        await tempGenerator.startRealityWave(track, false);
        const duration = await tempGenerator.getDuration();
        await tempGenerator.stopRealityWave();
        return { id: track.id, duration };
      } catch (error) {
        console.error(`Error loading duration for track ${track.id}:`, error);
        return { id: track.id, duration: track.duration * 60 };
      }
    });

    try {
      const results = await Promise.all(durationPromises);
      const newDurations = { ...trackDurations };
      results.forEach(result => {
        if (result) newDurations[result.id] = result.duration;
      });
      return newDurations;
    } catch (error) {
      console.error('Error loading track duration:', error);
      return trackDurations; // Return existing durations on error
    }
  }, []); // Remove trackDurations dependency to prevent infinite loop

  // Load track duration when track changes
  useEffect(() => {
    let mounted = true;

    const loadTrackDuration = async () => {
      if (!selectedTrack) return;

      try {
        setLoading(true);
        const tempGenerator = new RealityWaveGenerator();
        await tempGenerator.startRealityWave(selectedTrack, false);
        const duration = await tempGenerator.getDuration();
        await tempGenerator.stopRealityWave();

        if (mounted) {
          setDuration(duration);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading track duration:', error);
        if (mounted) {
          setDuration(selectedTrack.duration * 60); // Fallback to metadata duration
          setLoading(false);
        }
      }
    };

    loadTrackDuration();
    return () => {
      mounted = false;
    };
  }, [selectedTrack]);

  // Update playback status
  useEffect(() => {
    realityWaveGenerator.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setProgress(status.positionMillis / (status.durationMillis || 1));
        setSessionTime(Math.floor(status.positionMillis / 1000));
        setDuration(Math.floor(status.durationMillis / 1000));
        setIsPlaying(status.isPlaying);

        // Handle track completion
        if (status.didJustFinish) {
          setIsPlaying(false);
          setProgress(0);
          setSessionTime(0);

          // Record completed session
          if (selectedTrack && sessionTime > 10) {
            metricsService.recordSession({
              trackId: selectedTrack.id,
              duration: sessionTime,
              completed: true,
            });
          }
        }
      }
    });

    return () => {
      realityWaveGenerator.setOnPlaybackStatusUpdate(null);
    };
  }, [selectedTrack]);

  // Handle track selection
  const handleTrackSelect = useCallback(async (track: AudioTrackAccess) => {
    if (!featureAccess.hasAccessToTrack(track.id)) {
      showUpgradeDialog(track);
      return;
    }

    try {
      setLoading(true);
      setSelectedTrack(track);
      setProgress(0);
      setSessionTime(0);

      // Stop current playback if playing
      if (isPlaying) {
        await realityWaveGenerator.stopRealityWave();
        setIsPlaying(false);
      }

      // Load the track without playing
      await realityWaveGenerator.startRealityWave(track, false);
      const duration = await realityWaveGenerator.getDuration();
      setDuration(duration);
      setLoading(false);
    } catch (error) {
      console.error('Error selecting track:', error);
      Alert.alert('Error', 'Failed to load the selected track. Please try again.');
      setLoading(false);
    }
  }, [isPlaying]);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (!selectedTrack) return;

    try {
      if (!isPlaying) {
        await realityWaveGenerator.startRealityWave(selectedTrack, true);
        setIsPlaying(true);
      } else {
        await realityWaveGenerator.pauseRealityWave();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Playback Error', 'Failed to play/pause the track. Please try again.');
    }
  }, [isPlaying, selectedTrack]);

  // Handle seeking
  const handleSeek = useCallback(async (position: number) => {
    try {
      await realityWaveGenerator.seekTo(position);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, []);

  const handleSeeking = useCallback((position: number) => {
    setSessionTime(position);
    setProgress(position / duration);
  }, [duration]);

  // Show upgrade dialog
  const showUpgradeDialog = useCallback((track: AudioTrackAccess) => {
    Alert.alert(
      'Premium Content',
      'This bonus session is only available to premium subscribers. Upgrade now to unlock all bonus content!',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Upgrade',
          onPress: () => navigation.navigate('Upgrade')
        }
      ]
    );
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <H1 style={styles.title}>Transform Your Reality</H1>
        <BodyMedium style={styles.subtitle}>Turn Anxiety into Your Greatest Asset</BodyMedium>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedTracks).map(([category, tracks]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons 
                name={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || 'radio-outline'} 
                size={24} 
                color={colors.accent} 
              />
              <H2 style={styles.categoryTitle}>{category}</H2>
            </View>
            
            {tracks.map((track) => (
              <Card 
                key={track.id} 
                style={[styles.trackCard, { borderWidth: 0 }]}
                isSelected={selectedTrack?.id === track.id}
              >
                <TouchableOpacity
                  onPress={() => handleTrackSelect(track)}
                  style={styles.trackButton}
                >
                  {!featureAccess.hasAccessToTrack(track.id) && (
                    <View style={styles.unlockContainer}>
                      <Button
                        label="Unlock"
                        size="small"
                        onPress={() => navigation.navigate('Upgrade')}
                        style={styles.unlockButton}
                      />
                    </View>
                  )}
                  <View style={styles.trackInfo}>
                    <H3 style={styles.trackTitle}>{track.name}</H3>
                    <BodySmall style={styles.trackDuration}>
                      {duration ? 
                        `${Math.floor(duration / 60)} minutes ${Math.floor(duration % 60)} seconds` :
                        `${track.duration} minutes`}
                    </BodySmall>
                    <BodyMedium style={styles.trackDescription}>
                      {track.description}
                    </BodyMedium>
                    {track.subtitle && (
                      <BodySmall style={styles.trackSubtitle}>
                        {track.subtitle}
                      </BodySmall>
                    )}
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        ))}
      </ScrollView>

      <BlurView intensity={100} style={[styles.audioControlsContainer, { paddingBottom: insets.bottom + 60 }]} >
        <AudioControls
          audioPlayer={realityWaveGenerator}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onSeeking={handleSeeking}
          progress={progress}
          position={sessionTime}
          duration={duration}
          loading={loading}
        />
      </BlurView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 180,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  trackCard: {
    marginBottom: 16,
  },
  trackButton: {
    position: 'relative',
  },
  unlockContainer: {
    position: 'absolute',
    top: -8,
    right: 0,
    zIndex: 1,
  },
  unlockButton: {
    minWidth: 80,
  },
  trackInfo: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 8,
  },
  trackTitle: {
    fontSize: 15,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  trackDuration: {
    fontSize: 11,
    color: colors.accent,
    marginBottom: 12,
  },
  trackDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  trackSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  audioControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

export default SessionPlayer;
