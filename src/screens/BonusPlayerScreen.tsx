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

const { width, height } = Dimensions.get('window');

export const BonusPlayerScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(() => {
    // Find the first unlocked track
    const firstUnlockedTrack = BONUS_TRACKS.find(track => featureAccess.hasAccessToTrack(track.id));
    return firstUnlockedTrack || BONUS_TRACKS[0];
  });
  const [realityWaveGenerator] = useState(() => new RealityWaveGenerator());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Set initial duration when component mounts
  useEffect(() => {
    setDuration(selectedTrack.duration * 60);
  }, []);

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

  // Get available tracks based on user's subscription
  const availableTracks = featureAccess.getAvailableTracks();
  const lockedTracks = BONUS_TRACKS.filter(track => !featureAccess.hasAccessToTrack(track.id));

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
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

  // Handle audio state changes
  const handlePlaybackStatusUpdate = useCallback(async (status: any) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      setSessionTime(0);
      setProgress(0);
    } else if (status.isLoaded && status.durationMillis) {
      const newDuration = status.durationMillis / 1000;
      // Only update duration if it's significantly different
      if (Math.abs(newDuration - duration) > 1) {
        setDuration(newDuration);
      }
    }
  }, [duration]);

  useEffect(() => {
    realityWaveGenerator.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
    return () => {
      realityWaveGenerator.setOnPlaybackStatusUpdate(null);
    };
  }, [realityWaveGenerator, handlePlaybackStatusUpdate]);

  // Handle track selection
  const handleTrackPress = async (track: AudioTrackAccess) => {
    if (isLocked(track) || loading) {
      showUpgradeDialog(track);
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
      setDuration(track.duration * 60);
      setLoading(false);
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
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
    }
  };

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
    setDuration(selectedTrack.duration * 60); // Convert minutes to seconds
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
      <Card key={track.id} style={styles.trackCard} isSelected={isSelected}>
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
              {track.duration} minutes
            </BodySmall>
            <BodyMedium style={styles.trackDescription}>
              {track.description}
            </BodyMedium>
          </View>
        </TouchableOpacity>
      </Card>
    );
  }, [selectedTrack, isLocked, loading, showUpgradeDialog, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <H1 style={styles.title}>Bonus Vault</H1>
        <BodyMedium style={styles.subtitle}>Premium Reality Tools</BodyMedium>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {BONUS_TRACKS.map((track) => (
          <View key={track.id}>
            {renderTrackCard(track)}
          </View>
        ))}
      </ScrollView>

      <BlurView intensity={100} style={[styles.audioControlsContainer, { paddingBottom: insets.bottom + 60 }]}>
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
  sessionsContainer: {
    gap: theme.spacing.md,
  },
  trackCard: {
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
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
});
