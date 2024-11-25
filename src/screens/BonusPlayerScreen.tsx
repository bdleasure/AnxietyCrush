import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { RealityWaveGenerator } from '../services/audio/RealityWaveGenerator';
import { colors } from '../theme/colors';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { AudioControls } from '../components/AudioControls';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioTrackAccess } from '../services/subscription/types';
import { featureAccess } from '../services/subscription/featureAccess';
import { metricsService } from '../services/metrics/metricsService';
import { useNavigation } from '@react-navigation/native';
import { BONUS_TRACKS } from '../constants/tracks';

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
      <View style={styles.sessionCardContainer}>
        {isSelected ? (
          <LinearGradient
            colors={['#FFD700', '#9400D3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sessionCardBorder}
          >
            <View style={[styles.sessionCard, locked && styles.lockedCard]}>
              <TouchableOpacity
                onPress={() => handleTrackPress(track)}
                disabled={isPlaying}
                style={styles.sessionCardContent}
              >
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{track.name}</Text>
                  <Text style={styles.sessionSubtitle}>{track.subtitle}</Text>
                  <Text style={styles.sessionDescription}>
                    {locked ? `Unlock with ${track.requiredTier} Package` : track.description}
                  </Text>
                  <Text style={styles.sessionDuration}>
                    {Math.floor(track.duration / 60)} minutes
                  </Text>
                </View>
                {locked && (
                  <View style={styles.lockContainer}>
                    <Text style={styles.lockText}>Premium Only</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ) : (
          <TouchableOpacity
            style={[styles.sessionCard, locked && styles.lockedCard]}
            onPress={() => handleTrackPress(track)}
            disabled={isPlaying}
          >
            <View style={styles.sessionCardContent}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{track.name}</Text>
                <Text style={styles.sessionSubtitle}>{track.subtitle}</Text>
                <Text style={styles.sessionDescription}>
                  {locked ? `Unlock with ${track.requiredTier} Package` : track.description}
                </Text>
                <Text style={styles.sessionDuration}>
                  {Math.floor(track.duration / 60)} minutes
                </Text>
              </View>
              {locked && (
                <View style={styles.lockContainer}>
                  <Text style={styles.lockText}>Premium Only</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [selectedTrack, handleTrackPress, isPlaying]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bonus Vault</Text>
        <Text style={styles.subtitle}>Premium Reality Tools</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
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

      {/* Audio Controls */}
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

      {/* Expanded Player */}
      {isPlaying && (
        <BlurView
          intensity={100}
          style={[styles.expandedPlayer, { paddingBottom: insets.bottom + 60 }]}
        >
          <View style={styles.expandedContent}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {selectedTrack?.title || 'No track selected'}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(sessionTime)} / {formatTime(duration)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, isPlaying && styles.buttonActive]}
            onPress={handlePlayPause}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={[styles.buttonText, isPlaying && styles.buttonTextActive]}>
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
            )}
          </TouchableOpacity>
        </BlurView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 180 : 160,
  },
  playerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 85 : 60,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground + '80',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  progressContainer: {
    height: 3,
    backgroundColor: colors.secondary + '40',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 20,
  },
  timerContainer: {
    flex: 1,
    marginRight: 20,
  },
  timerText: {
    fontSize: 19,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  sessionName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  audioControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: 16,
    zIndex: 2,
  },
  sessionsContainer: {
    gap: 16,
  },
  sessionCardContainer: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sessionCardBorder: {
    padding: 2.5,
    borderRadius: 16,
  },
  sessionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sessionCardContent: {
    padding: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    marginRight: 15,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '500',
  },
  lockContainer: {
    position: 'absolute',
    top: 8,
    right: 16,
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    zIndex: 2,
  },
  lockText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  lockedCard: {
  },
  expandedPlayer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 85 : 60,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground + '80',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  expandedContent: {
    padding: 20,
    paddingBottom: 20,
  },
  trackTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
