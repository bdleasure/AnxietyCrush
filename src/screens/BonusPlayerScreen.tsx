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
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(BONUS_TRACKS[0]);
  const [realityWaveGenerator] = useState(() => new RealityWaveGenerator());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(BONUS_TRACKS[0].duration * 60); // Convert minutes to seconds
  const [isSeeking, setIsSeeking] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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

  const handleTrackPress = useCallback(async (track: AudioTrackAccess) => {
    const locked = !featureAccess.hasAccessToTrack(track.id);
    if (locked) {
      showUpgradeDialog(track);
      return;
    }

    try {
      if (isPlaying) {
        setIsPlaying(false);
        await realityWaveGenerator.pauseRealityWave();
      }
      setSelectedTrack(track);
      setSessionTime(0);
      setProgress(0);
      // Initialize duration with track metadata
      setDuration(track.duration * 60); // Convert minutes to seconds
    } catch (error) {
      console.error('Error selecting track:', error);
    }
  }, [isPlaying, realityWaveGenerator, showUpgradeDialog]);

  useEffect(() => {
    const checkSubscriptionAndReset = async () => {
      const locked = !featureAccess.hasAccessToTrack(selectedTrack.id);
      if (locked && isPlaying) {
        await handlePause();
        showUpgradeDialog(selectedTrack);
      }
    };

    checkSubscriptionAndReset();
  }, [selectedTrack, isLocked, isPlaying, realityWaveGenerator, showUpgradeDialog]);

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await realityWaveGenerator.pauseRealityWave();
        setIsPlaying(false);
      } else {
        if (realityWaveGenerator) {
          await realityWaveGenerator.startRealityWave(selectedTrack, true);
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error handling play/pause:', error);
    }
  };

  const handlePause = async () => {
    try {
      await realityWaveGenerator.pauseRealityWave();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  // Handle session selection
  const selectSession = async (track: AudioTrackAccess) => {
    if (!featureAccess.hasAccessToTrack(track.id)) {
      showUpgradeDialog(track);
      return;
    }

    try {
      if (isPlaying) {
        setIsPlaying(false);
        await realityWaveGenerator.pauseRealityWave();
      }
      setSelectedTrack(track);
      setSessionTime(0);
      setProgress(0);
    } catch (error) {
      console.error('Error selecting bonus session:', error);
    }
  };

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
      <Card key={track.id} style={styles.trackCard}>
        <TouchableOpacity
          onPress={() => handleTrackPress(track)}
          style={styles.trackButton}
        >
          <View style={styles.trackInfo}>
            <H3 style={styles.trackTitle}>{track.name}</H3>
            <BodySmall style={styles.trackDuration}>
              {track.duration} minutes
            </BodySmall>
            <BodyMedium style={styles.trackDescription}>
              {locked ? `Unlock with ${track.requiredTier} Package` : track.description}
            </BodyMedium>
          </View>
          {locked && (
            <Button
              label="Unlock"
              size="small"
              onPress={() => navigation.navigate('Upgrade')}
              style={styles.unlockButton}
            />
          )}
        </TouchableOpacity>
      </Card>
    );
  }, [selectedTrack, handleTrackPress, navigation]);

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
        <View style={styles.sessionsContainer}>
          {BONUS_TRACKS.map((track) => (
            <View key={track.id}>
              {renderTrackCard(track)}
            </View>
          ))}
        </View>
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
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
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
  unlockButton: {
    minWidth: 80,
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
