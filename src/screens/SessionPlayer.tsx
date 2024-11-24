import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { RealityWaveGenerator } from '../services/audio/RealityWaveGenerator';
import { theme } from '../theme';
import { getWebStyles } from '../theme/webStyles';
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

const { width, height } = Dimensions.get('window');

export const SessionPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(() => {
    // Find the first unlocked track
    const firstUnlockedTrack = AUDIO_TRACKS.find(track => featureAccess.hasAccessToTrack(track.id));
    return firstUnlockedTrack || AUDIO_TRACKS[0];
  });
  const [realityWaveGenerator] = useState(() => new RealityWaveGenerator());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackDurations, setTrackDurations] = useState<Record<string, number>>({});
  const [isSeeking, setIsSeeking] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webStyles = getWebStyles();

  // Load initial track duration immediately
  useEffect(() => {
    const loadInitialDuration = async () => {
      if (!selectedTrack) return;
      
      try {
        // Create a new temporary generator for initial load
        const tempGenerator = new RealityWaveGenerator();
        await tempGenerator.startRealityWave(selectedTrack, false);
        const actualDuration = await tempGenerator.getDuration();
        await tempGenerator.stopRealityWave();
        
        // Update both duration and trackDurations
        setDuration(actualDuration);
        setTrackDurations(prev => ({
          ...prev,
          [selectedTrack.id]: actualDuration
        }));
      } catch (error) {
        console.error('Error loading initial duration:', error);
        const fallbackDuration = selectedTrack.duration * 60;
        setDuration(fallbackDuration);
        setTrackDurations(prev => ({
          ...prev,
          [selectedTrack.id]: fallbackDuration
        }));
      } finally {
        setLoading(false);
      }
    };

    loadInitialDuration();
  }, [selectedTrack]);

  // Load remaining track durations after initial load
  useEffect(() => {
    if (loading) return; // Don't load other tracks until initial track is loaded
    
    const loadRemainingDurations = async () => {
      const durations = { ...trackDurations };
      
      for (const track of AUDIO_TRACKS) {
        if (track.id === selectedTrack.id) continue; // Skip selected track
        if (durations[track.id]) continue; // Skip already loaded durations
        
        try {
          const tempGenerator = new RealityWaveGenerator();
          await tempGenerator.startRealityWave(track, false);
          const actualDuration = await tempGenerator.getDuration();
          await tempGenerator.stopRealityWave();
          durations[track.id] = actualDuration;
        } catch (error) {
          console.error(`Error loading duration for track ${track.id}:`, error);
          durations[track.id] = track.duration * 60;
        }
      }
      
      setTrackDurations(durations);
    };

    loadRemainingDurations();
  }, [loading, selectedTrack]);

  // Update duration when selected track changes
  const handleTrackPress = async (track: AudioTrackAccess) => {
    if (isLocked(track)) {
      navigation.navigate('Upgrade');
      return;
    }

    try {
      setLoading(true);
      
      // If a track is currently playing, stop it
      if (isPlaying) {
        await realityWaveGenerator.stopRealityWave();
        setIsPlaying(false);
      }

      // Set the new track
      setSelectedTrack(track);
      setSessionTime(0);
      setProgress(0);
      
      // Use the pre-loaded duration if available
      if (trackDurations[track.id]) {
        setDuration(trackDurations[track.id]);
        setLoading(false);
      } else {
        // Load duration if not available
        try {
          const tempGenerator = new RealityWaveGenerator();
          await tempGenerator.startRealityWave(track, false);
          const actualDuration = await tempGenerator.getDuration();
          await tempGenerator.stopRealityWave();
          
          setDuration(actualDuration);
          setTrackDurations(prev => ({
            ...prev,
            [track.id]: actualDuration
          }));
        } catch (error) {
          console.error('Error loading track duration:', error);
          setDuration(track.duration * 60);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error changing track:', error);
      setLoading(false);
    }
  };

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update progress and handle audio state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isSeeking) {
      interval = setInterval(async () => {
        try {
          const currentPosition = await realityWaveGenerator.getCurrentPosition();
          if (currentPosition >= 0) {
            setSessionTime(currentPosition);
            setProgress(currentPosition / duration);
          }
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, isSeeking, realityWaveGenerator, duration]);

  // Initialize duration when track changes
  useEffect(() => {
    setSessionTime(0);
    setProgress(0);
  }, [selectedTrack]);

  // Handle audio state changes
  const handlePlaybackStatusUpdate = useCallback(async (status: any) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      setSessionTime(0);
      setProgress(0);
      
      // Record completed session
      await metricsService.recordSession({
        trackId: selectedTrack.id,
        duration: duration / 60, // Convert seconds back to minutes for metrics
        completed: true,
      });
    } else if (status.isLoaded && status.durationMillis) {
      const newDuration = status.durationMillis / 1000;
      // Only update duration if it's significantly different
      if (Math.abs(newDuration - duration) > 1) {
        setDuration(newDuration);
      }
    }
  }, [selectedTrack, duration]);

  useEffect(() => {
    realityWaveGenerator.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
    return () => {
      realityWaveGenerator.setOnPlaybackStatusUpdate(null);
    };
  }, [realityWaveGenerator, handlePlaybackStatusUpdate]);

  // Handle play/pause
  const handlePlayPause = async () => {
    try {
      if (!isPlaying) {
        await realityWaveGenerator.startRealityWave(selectedTrack, false);
        setIsPlaying(true);
      } else {
        await realityWaveGenerator.pauseRealityWave();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
    }
  };

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

  // Handle seek
  const handleSeek = useCallback(async (position: number) => {
    try {
      setIsSeeking(true);
      await realityWaveGenerator.seekTo(position);
      setSessionTime(position);
      setProgress(position / duration);
    } catch (error) {
      console.error('Error seeking:', error);
    } finally {
      setIsSeeking(false);
    }
  }, [realityWaveGenerator, duration]);

  const handleSeeking = useCallback((value: number) => {
    setSessionTime(value);
    setProgress(value / duration);
  }, [duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        realityWaveGenerator?.pauseRealityWave();
      }
    };
  }, [isPlaying, realityWaveGenerator]);

  const isLocked = (track: AudioTrackAccess) => {
    return !featureAccess.hasAccessToTrack(track.id);
  };

  // Group tracks by category
  const groupedTracks = AUDIO_TRACKS.reduce((acc, track) => {
    if (!acc[track.category]) {
      acc[track.category] = [];
    }
    acc[track.category].push(track);
    return acc;
  }, {} as Record<string, AudioTrackAccess[]>);

  return (
    <SafeAreaView style={[styles.container, webStyles.container]}>
      <View style={styles.header}>
        <H1 style={styles.title}>Transform Now</H1>
        <BodyMedium style={styles.subtitle}>Select your reality wave session</BodyMedium>
      </View>

      <ScrollView
        style={[styles.scrollView, webStyles.scrollView]}
        contentContainerStyle={[styles.scrollContent, webStyles.contentContainer]}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedTracks).map(([category, tracks]) => (
          <View key={category} style={styles.categorySection}>
            {tracks.map((track) => (
              <Card 
                key={track.id} 
                style={styles.trackCard}
                isSelected={selectedTrack.id === track.id}
              >
                <TouchableOpacity
                  onPress={() => handleTrackPress(track)}
                  style={styles.trackButton}
                >
                  {isLocked(track) && (
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
                      {trackDurations[track.id] ? 
                        `${Math.floor(trackDurations[track.id] / 60)} minutes ${Math.floor(trackDurations[track.id] % 60)} seconds` :
                        `${track.duration} minutes`}
                    </BodySmall>
                    <BodyMedium style={styles.trackDescription}>
                      {track.description}
                    </BodyMedium>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        ))}
      </ScrollView>

      <BlurView intensity={100} style={[styles.audioControlsContainer, webStyles.player, { paddingBottom: insets.bottom + 60 }]}>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.screenPadding,
    paddingBottom: Platform.OS === 'ios' ? 180 : 160,
  },
  categorySection: {
    marginBottom: theme.spacing.sectionSpacing,
    paddingHorizontal: theme.spacing.xs,
  },
  trackCard: {
    marginBottom: theme.spacing.md,
  },
  trackButton: {
    position: 'relative',
  },
  unlockContainer: {
    position: 'absolute',
    top: -theme.spacing.sm,
    right: 0,
    zIndex: 1,
  },
  unlockButton: {
    minWidth: 80,
  },
  trackInfo: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  trackTitle: {
    marginBottom: theme.spacing.xxs,
    color: theme.colors.textPrimary,
  },
  trackDuration: {
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  trackDescription: {
    color: theme.colors.textSecondary,
  },
  audioControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
    zIndex: 2,
  },
});
