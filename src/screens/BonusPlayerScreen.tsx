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
import { LinearGradient } from 'expo-linear-gradient';
import { AudioControls } from '../components/AudioControls';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioTrackAccess } from '../services/subscription/types';
import { featureAccess } from '../services/subscription/featureAccess';
import { metricsService } from '../services/metrics/metricsService';
import { useNavigation } from '@react-navigation/native';
import { BONUS_TRACKS } from '../constants/tracks';
import { Card } from '../components/shared/Card';
import { H1, H2, H3, BodyMedium, BodySmall, Label } from '../components/shared/Typography';
import { Button } from '../components/shared/Button';
import { useSettings } from '../contexts/SettingsContext';

const { width, height } = Dimensions.get('window');

const BonusPlayerScreen: React.FC = () => {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(() => {
    // Find the first unlocked track
    const firstUnlockedTrack = BONUS_TRACKS.find(track => featureAccess.hasAccessToTrack(track.id));
    return firstUnlockedTrack || BONUS_TRACKS[0];
  });
  const [realityWaveGenerator] = useState(() => new RealityWaveGenerator());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackDurations, setTrackDurations] = useState<Record<string, number>>({});
  const [isSeeking, setIsSeeking] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Memoize available and locked tracks
  const { availableTracks, lockedTracks } = useMemo(() => ({
    availableTracks: featureAccess.getAvailableTracks(),
    lockedTracks: BONUS_TRACKS.filter(track => !featureAccess.hasAccessToTrack(track.id))
  }), []);

  // Format time as mm:ss
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
  }, []);

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
      const remainingTracks = BONUS_TRACKS.filter(track => track.id !== selectedTrack?.id);
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

  // Update duration when selected track changes
  useEffect(() => {
    if (selectedTrack && trackDurations[selectedTrack.id]) {
      setDuration(trackDurations[selectedTrack.id]);
      setSessionTime(0);
      setProgress(0);
    }
  }, [selectedTrack, trackDurations]);

  // Check if a track is locked based on subscription tier
  const isLocked = useCallback((track: AudioTrackAccess) => {
    return !featureAccess.hasAccessToTrack(track.id);
  }, []);

  // Show upgrade dialog for locked content
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

  // Handle playback status updates
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

  useEffect(() => {
    realityWaveGenerator.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
    return () => {
      realityWaveGenerator.setOnPlaybackStatusUpdate(null);
    };
  }, [realityWaveGenerator, handlePlaybackStatusUpdate]);

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

  // Handle track selection and playback
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

  // Handle play/pause
  const handlePlayPause = async () => {
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
            type: selectedTrack.type || 'bonus',
            completed: progress >= 0.99,
          };
          await metricsService.recordSession(sessionRecord);
        }
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
    }
  };

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
            type: selectedTrack.type || 'bonus',
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

  useEffect(() => {
    const checkSubscriptionAndReset = async () => {
      const locked = !featureAccess.hasAccessToTrack(selectedTrack.id);
      if (locked && isPlaying) {
        await handlePlayPause();
        showUpgradeDialog(selectedTrack);
      }
    };

    checkSubscriptionAndReset();
  }, [selectedTrack, isLocked, isPlaying, realityWaveGenerator, showUpgradeDialog]);

  // Initialize duration when track changes
  useEffect(() => {
    setSessionTime(0);
    setProgress(0);
  }, [selectedTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        realityWaveGenerator.pauseRealityWave();
      }
    };
  }, [isPlaying, realityWaveGenerator]);

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

  const renderTrackCard = useCallback((track: AudioTrackAccess) => {
    const locked = !featureAccess.hasAccessToTrack(track.id);
    const isSelected = selectedTrack?.id === track.id;
    
    return (
      <Card 
        key={track.id} 
        style={[styles.trackCard, { borderWidth: 0 }]} 
        isSelected={isSelected}
      >
        <TouchableOpacity
          onPress={() => handleTrackPress(track)}
          style={styles.trackButton}
          disabled={loading}
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
    );
  }, [selectedTrack?.id, loading, navigation, trackDurations, handleTrackPress, isLocked]);

  // Memoize the track list
  const trackList = useMemo(() => 
    BONUS_TRACKS.map((track) => renderTrackCard(track)),
    [renderTrackCard]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <H1 style={styles.title}>Bonus Sessions</H1>
        <BodyMedium style={styles.subtitle}>Enhance your transformation</BodyMedium>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categorySection}>
          {trackList}
        </View>
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
    backgroundColor: theme.colors.background,
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
  trackInfo: {
    flex: 1,
    paddingTop: theme.spacing.lg,
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
  header: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.lg,
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
});

export default BonusPlayerScreen;