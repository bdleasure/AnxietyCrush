import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const { width, height } = Dimensions.get('window');

// Pre-compute grouped tracks
const { availableTracks, lockedTracks } = (() => ({
  availableTracks: AUDIO_TRACKS.filter(track => featureAccess.hasAccessToTrack(track.id)),
  lockedTracks: AUDIO_TRACKS.filter(track => !featureAccess.hasAccessToTrack(track.id))
}))();

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

  // Load initial track duration immediately
  useEffect(() => {
    let mounted = true;
    
    const loadInitialDuration = async () => {
      if (!selectedTrack) return;
      
      try {
        const durations = await loadTrackDurations([selectedTrack]);
        if (!mounted) return;
        
        setTrackDurations(durations);
        if (durations[selectedTrack.id]) {
          setDuration(durations[selectedTrack.id]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialDuration();
    return () => { mounted = false; };
  }, [selectedTrack, loadTrackDurations]);

  // Load remaining track durations after initial load
  useEffect(() => {
    if (loading) return;
    
    let mounted = true;
    const loadRemainingDurations = async () => {
      const remainingTracks = AUDIO_TRACKS.filter(track => track.id !== selectedTrack?.id);
      try {
        const durations = await loadTrackDurations(remainingTracks);
        if (mounted) {
          setTrackDurations(prev => ({ ...prev, ...durations }));
        }
      } catch (error) {
        console.error('Error loading remaining durations:', error);
      }
    };

    loadRemainingDurations();
    return () => { mounted = false; };
  }, [loading, selectedTrack?.id, loadTrackDurations]);

  // Update progress with requestAnimationFrame for smoother updates
  useEffect(() => {
    if (!isPlaying || isSeeking) return;
    
    let mounted = true;
    let animationFrame: number;
    
    const updateProgress = async () => {
      try {
        const currentPosition = await realityWaveGenerator.getCurrentPosition();
        if (!mounted) return;
        
        if (currentPosition >= 0) {
          setSessionTime(currentPosition);
          setProgress(currentPosition / duration);
        }
        
        if (mounted && isPlaying && !isSeeking) {
          animationFrame = requestAnimationFrame(updateProgress);
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);
    
    return () => {
      mounted = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, isSeeking, duration]);

  // Handle track selection with proper cleanup
  const handleTrackPress = useCallback(async (track: AudioTrackAccess) => {
    if (isLocked(track)) {
      navigation.navigate('Upgrade');
      return;
    }

    try {
      setLoading(true);
      
      if (isPlaying) {
        await realityWaveGenerator.stopRealityWave();
        setIsPlaying(false);
      }

      setSelectedTrack(track);
      setSessionTime(0);
      setProgress(0);
      
      if (trackDurations[track.id]) {
        setDuration(trackDurations[track.id]);
        setLoading(false);
      } else {
        try {
          const durations = await loadTrackDurations([track]);
          setTrackDurations(prev => ({ ...prev, ...durations }));
          if (durations[track.id]) {
            setDuration(durations[track.id]);
          }
        } catch (error) {
          console.error('Error loading track duration:', error);
          setDuration(track.duration * 60);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error changing track:', error);
      setLoading(false);
    }
  }, [isPlaying, trackDurations, loadTrackDurations, navigation]);

  // Check if a track is locked (memoized)
  const isLocked = useCallback((track: AudioTrackAccess) => {
    return !featureAccess.hasAccessToTrack(track.id);
  }, []);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    try {
      if (!isPlaying) {
        await realityWaveGenerator.startRealityWave(selectedTrack, false);
        setIsPlaying(true);
      } else {
        await realityWaveGenerator.pauseRealityWave();
        setIsPlaying(false);

        // Record any session with meaningful progress (>10 seconds)
        if (sessionTime > 10) {
          const sessionRecord = {
            id: `${selectedTrack.id}_${Date.now()}`,
            trackId: selectedTrack.id,
            startTime: new Date().toISOString(),
            duration: sessionTime,
            type: selectedTrack.type || 'regular',
            completed: progress >= 0.99,
          };
          await metricsService.recordSession(sessionRecord);
        }
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
    }
  }, [isPlaying, realityWaveGenerator, selectedTrack, progress, sessionTime]);

  // Handle session completion
  useEffect(() => {
    if (progress >= 0.99 && isPlaying) {
      const completeSession = async () => {
        try {
          await realityWaveGenerator.pauseRealityWave();
          setIsPlaying(false);

          const sessionRecord = {
            id: `${selectedTrack.id}_${Date.now()}`,
            trackId: selectedTrack.id,
            startTime: new Date().toISOString(),
            duration: sessionTime,
            type: selectedTrack.type || 'regular',
            completed: true,
          };
          await metricsService.recordSession(sessionRecord);
        } catch (error) {
          console.error('Error completing session:', error);
        }
      };
      completeSession();
    }
  }, [progress, isPlaying, selectedTrack, sessionTime]);

  // Handle track completion and auto-play
  const handleTrackComplete = useCallback(async () => {
    if (settings.autoPlayEnabled) {
      // Find the next track in the available tracks list
      const currentIndex = availableTracks.findIndex(track => track.id === selectedTrack.id);
      const nextTrack = availableTracks[currentIndex + 1];
      
      if (nextTrack) {
        setSelectedTrack(nextTrack);
        await realityWaveGenerator.startRealityWave(nextTrack, true);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  }, [settings.autoPlayEnabled, selectedTrack, availableTracks]);

  // Update playback status
  const handlePlaybackStatusUpdate = useCallback(
    async (status: any) => {
      if (!status.isLoaded) return;

      if (!isSeeking) {
        setProgress(status.positionMillis / 1000);
        setSessionTime(status.positionMillis / 1000);
      }

      // Check if track has completed
      if (status.didJustFinish) {
        handleTrackComplete();
      }
    },
    [isSeeking, handleTrackComplete]
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <H1 style={styles.title}>Transform Now</H1>
        <BodyMedium style={styles.subtitle}>Select your reality wave session</BodyMedium>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedTracks).map(([category, tracks]) => (
          <View key={category} style={styles.categorySection}>
            {tracks.map((track) => (
              <Card 
                key={track.id} 
                style={[styles.trackCard, { borderWidth: 0 }]}
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
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
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

export default SessionPlayer;
