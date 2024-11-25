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
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(AUDIO_TRACKS[0]);
  const [realityWaveGenerator] = useState(() => new RealityWaveGenerator());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(AUDIO_TRACKS[0].duration * 60); // Convert minutes to seconds
  const [isSeeking, setIsSeeking] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Get available tracks based on user's subscription
  const availableTracks = featureAccess.getAvailableTracks();
  const lockedTracks = AUDIO_TRACKS.filter(track => !featureAccess.hasAccessToTrack(track.id));

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
    setDuration(selectedTrack.duration * 60); // Convert minutes to seconds
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
        duration: selectedTrack.duration,
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
      if (isPlaying) {
        await realityWaveGenerator?.pauseRealityWave();
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

  // Handle session selection
  const selectSession = async (track: AudioTrackAccess) => {
    if (!featureAccess.hasAccessToTrack(track.id)) {
      showUpgradeDialog(track);
      return;
    }

    try {
      if (isPlaying) {
        await realityWaveGenerator?.pauseRealityWave();
        setIsPlaying(false);
      }
      setSelectedTrack(track);
      setSessionTime(0);
      setProgress(0);
    } catch (error) {
      console.error('Error selecting session:', error);
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

  const handleTrackPress = (track: AudioTrackAccess) => {
    selectSession(track);
  };

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedTracks).map(([category, tracks]) => (
          <View key={category} style={styles.categorySection}>
            <H2 style={styles.categoryHeader}>{category}</H2>
            {tracks.map((track) => (
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
                      {track.description}
                    </BodyMedium>
                  </View>
                  {isLocked(track) && (
                    <Button
                      label="Unlock"
                      size="small"
                      onPress={() => navigation.navigate('Upgrade')}
                      style={styles.unlockButton}
                    />
                  )}
                </TouchableOpacity>
              </Card>
            ))}
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
  categorySection: {
    paddingHorizontal: theme.spacing.screenPadding,
    marginBottom: theme.spacing.sectionSpacing,
  },
  categoryHeader: {
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
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
});
