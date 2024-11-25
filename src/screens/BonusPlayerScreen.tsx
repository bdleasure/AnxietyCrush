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
import { featureAccess } from '../services/subscription/featureAccess';
import { AudioTrackAccess, SubscriptionTier } from '../services/subscription/types';
import { LinearGradient } from 'expo-linear-gradient';
import { AudioControls } from '../components/AudioControls';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { metricsService } from '../services/metrics/metricsService';

const { width, height } = Dimensions.get('window');

// Define bonus content as AudioTrackAccess type for compatibility
const BONUS_TRACKS: AudioTrackAccess[] = [
  {
    id: 'success-pattern',
    name: 'Success Pattern Activator™',
    duration: 600, // 10 minutes in seconds
    description: 'Activate your natural success patterns',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'success-pattern.mp3'
  },
  {
    id: 'focus-field',
    name: 'Focus Field Generator™',
    duration: 420, // 7 minutes in seconds
    description: 'Generate laser-sharp focus instantly',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'focus-field.mp3'
  },
  {
    id: 'sleep-wave',
    name: 'Sleep Enhancement Wave™',
    duration: 600, // 10 minutes in seconds
    description: 'Enhance your sleep quality naturally',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'sleep-wave.mp3'
  }
];

export const BonusPlayerScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(BONUS_TRACKS[0]);
  const [realityWave] = useState(() => new RealityWaveGenerator());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const insets = useSafeAreaInsets();

  // Get available tracks based on user's subscription
  const availableTracks = featureAccess.getAvailableTracks();
  const lockedTracks = BONUS_TRACKS.filter(track => !featureAccess.hasAccessToTrack(track.id));

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
          const currentPosition = await realityWave.getCurrentPosition();
          const totalDuration = await realityWave.getDuration();
          
          if (totalDuration > 0) {
            setProgress(currentPosition / totalDuration);
            setSessionTime(currentPosition);
            setDuration(totalDuration);
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
  }, [isPlaying, isSeeking, realityWave]);

  // Handle audio state changes
  const handlePlaybackStatusUpdate = useCallback(async (status: any) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      setSessionTime(0);
      setProgress(0);
      
      // Record completed bonus session
      await metricsService.recordSession({
        trackId: selectedTrack.id,
        duration: selectedTrack.duration,
        completed: true,
        isBonus: true
      });
    }
  }, [selectedTrack]);

  useEffect(() => {
    realityWave.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
    return () => {
      realityWave.setOnPlaybackStatusUpdate(null);
    };
  }, [realityWave, handlePlaybackStatusUpdate]);

  // Handle play/pause
  const togglePlayPause = useCallback(async () => {
    if (!featureAccess.hasAccessToTrack(selectedTrack.id)) {
      showUpgradeDialog(selectedTrack);
      return;
    }

    try {
      setLoading(true);
      if (!isPlaying) {
        await realityWave.startRealityWave(selectedTrack);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        await realityWave.stopRealityWave();
        setSessionTime(0);
        setProgress(0);
      }
    } catch (error) {
      console.error('Error toggling bonus session:', error);
      Alert.alert(
        'Bonus Session Error',
        'There was an error with the bonus session. Please try again.',
        [{ text: 'OK' }]
      );
      setIsPlaying(false);
      setSessionTime(0);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }, [isPlaying, realityWave, selectedTrack]);

  // Handle session selection
  const selectSession = async (track: AudioTrackAccess) => {
    if (!featureAccess.hasAccessToTrack(track.id)) {
      showUpgradeDialog(track);
      return;
    }

    try {
      if (isPlaying) {
        setIsPlaying(false);
        await realityWave.stopRealityWave();
      }
      setSelectedTrack(track);
      setSessionTime(0);
      setProgress(0);
    } catch (error) {
      console.error('Error selecting bonus session:', error);
    }
  };

  // Show upgrade dialog
  const showUpgradeDialog = (track: AudioTrackAccess) => {
    Alert.alert(
      'Upgrade Required',
      `This ${track.name} bonus is part of the ${track.requiredTier} package. Upgrade to access this and other premium features.`,
      [
        {
          text: 'Maybe Later',
          style: 'cancel',
        },
        {
          text: 'Learn More',
          onPress: () => {
            // Navigate to upgrade screen
            // navigation.navigate('Upgrade');
          },
        },
      ]
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realityWave.stopRealityWave();
    };
  }, [realityWave]);

  const handleSeek = useCallback(async (position: number) => {
    try {
      setIsSeeking(true);
      await realityWave.seekTo(position);
      setSessionTime(position);
      setProgress(position / selectedTrack.duration);
    } catch (error) {
      console.error('Error seeking:', error);
    } finally {
      setIsSeeking(false);
    }
  }, [realityWave, selectedTrack.duration]);

  const handleSeeking = useCallback((value: number) => {
    setSessionTime(value);
    setProgress(value / selectedTrack.duration);
  }, [selectedTrack.duration]);

  const BonusCard = ({ track }: { track: AudioTrackAccess }) => {
    const isLocked = !featureAccess.hasAccessToTrack(track.id);
    const isSelected = selectedTrack.id === track.id;

    return (
      <TouchableOpacity
        style={[
          styles.sessionCard,
          isSelected && styles.selectedCard,
          isLocked && styles.lockedCard,
        ]}
        onPress={() => selectSession(track)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isSelected ? ['#FFD700', '#9400D3'] : ['transparent', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.sessionTitle, isLocked && styles.lockedText]}>
              {track.name}
            </Text>
            <Text style={[styles.sessionDescription, isLocked && styles.lockedText]}>
              {track.description}
            </Text>
            <Text style={[styles.sessionDuration, isLocked && styles.lockedText]}>
              {Math.floor(track.duration / 60)} minutes
            </Text>
            {isLocked && (
              <View style={styles.lockContainer}>
                <Text style={styles.lockText}>Premium</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

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
            <BonusCard key={track.id} track={track} />
          ))}
        </View>
      </ScrollView>

      <BlurView intensity={100} style={styles.playerContainer}>
        <AudioControls
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          progress={progress}
          duration={duration}
          currentTime={sessionTime}
          onSeek={handleSeek}
          onSeeking={handleSeeking}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sessionsContainer: {
    gap: 16,
  },
  sessionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    marginBottom: 12,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  lockedCard: {
    opacity: 0.7,
  },
  cardGradient: {
    padding: 2,
  },
  cardContent: {
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  sessionDuration: {
    fontSize: 13,
    color: colors.accent,
  },
  lockedText: {
    color: colors.textSecondary,
  },
  lockContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lockText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: colors.cardBackground,
    }),
    paddingTop: 16,
    paddingBottom: Platform.select({
      ios: 34,
      android: 16,
    }),
    paddingHorizontal: 20,
  },
});
