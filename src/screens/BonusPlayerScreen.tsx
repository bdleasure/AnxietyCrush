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
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Define bonus content as AudioTrackAccess type for compatibility
const BONUS_TRACKS: AudioTrackAccess[] = [
  {
    id: 'success-pattern',
    name: 'Success Pattern Activator™',
    duration: 600,
    description: 'Activate your natural success patterns',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'success-pattern.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Unlock your natural success patterns'
  },
  {
    id: 'focus-field',
    name: 'Focus Field Generator™',
    duration: 420,
    description: 'Generate laser-sharp focus instantly',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'focus-field.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Achieve peak mental clarity'
  },
  {
    id: 'sleep-wave',
    name: 'Sleep Enhancement Wave™',
    duration: 600,
    description: 'Enhance your sleep quality naturally',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'sleep-wave.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Experience deep, restorative sleep'
  }
];

export const BonusPlayerScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(BONUS_TRACKS[0]);
  const [realityWaveGenerator] = useState(() => new RealityWaveGenerator());
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
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
          onPress: () => navigation.navigate('Subscription')
        }
      ]
    );
  }, [navigation]);

  // Get available tracks based on user's subscription
  const availableTracks = featureAccess.getAvailableTracks();
  const lockedTracks = BONUS_TRACKS.filter(track => !featureAccess.hasAccessToTrack(track.id));

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) {
      return '00:00';
    }
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
          const totalDuration = await realityWaveGenerator.getDuration();
          
          if (totalDuration > 0) {
            setProgress(currentPosition / totalDuration);
            setSessionTime(currentPosition);
            setDuration(totalDuration);
          } else {
            setSessionTime(0);
            setDuration(selectedTrack.duration);
          }
        } catch (error) {
          console.error('Error updating progress:', error);
          setSessionTime(0);
          setDuration(selectedTrack.duration);
        }
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, isSeeking, realityWaveGenerator, selectedTrack]);

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
    realityWaveGenerator.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
    return () => {
      realityWaveGenerator.setOnPlaybackStatusUpdate(null);
    };
  }, [realityWaveGenerator, handlePlaybackStatusUpdate]);

  const handleTrackPress = async (track: AudioTrackAccess) => {
    try {
      if (isLocked(track)) {
        showUpgradeDialog(track);
        return;
      }

      // Stop current track if playing
      if (isPlaying) {
        await realityWaveGenerator.stopRealityWave();
      }

      setSelectedTrack(track);
      setIsPlaying(true);
      await realityWaveGenerator.startRealityWave(track);
      
      // Track the bonus session start in metrics
      metricsService.trackBonusSessionStart(track.id);
    } catch (error) {
      console.error('Error playing bonus track:', error);
      Alert.alert('Playback Error', 'There was an error playing this track. Please try again.');
    }
  };

  const handlePlayPause = async () => {
    if (!selectedTrack) return;

    try {
      if (isPlaying) {
        await realityWaveGenerator.stopRealityWave();
        setIsPlaying(false);
      } else {
        await realityWaveGenerator.startRealityWave(selectedTrack);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Playback Error', 'There was an error controlling playback. Please try again.');
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
        await realityWaveGenerator.stopRealityWave();
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
    setDuration(selectedTrack.duration);
    setProgress(0);
  }, [selectedTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realityWaveGenerator.stopRealityWave();
    };
  }, [realityWaveGenerator]);

  const handleSeek = useCallback(async (position: number) => {
    try {
      setIsSeeking(true);
      await realityWaveGenerator.seekTo(position);
      setSessionTime(position);
      setProgress(position / selectedTrack.duration);
    } catch (error) {
      console.error('Error seeking:', error);
    } finally {
      setIsSeeking(false);
    }
  }, [realityWaveGenerator, selectedTrack.duration]);

  const handleSeeking = useCallback((value: number) => {
    setSessionTime(value);
    setProgress(value / selectedTrack.duration);
  }, [selectedTrack.duration]);

  const renderTrackCard = (track: AudioTrackAccess, isSelected: boolean) => {
    const locked = isLocked(track);
    
    return (
      <TouchableOpacity
        key={track.id}
        style={[
          styles.sessionCard,
          isSelected && styles.selectedCard,
          locked && styles.lockedCard,
        ]}
        onPress={() => handleTrackPress(track)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isSelected ? ['#FFD700', '#9400D3'] : ['transparent', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.sessionTitle, locked && styles.lockedText]}>
              {track.name}
            </Text>
            <Text style={[styles.sessionDescription, locked && styles.lockedText]}>
              {track.description}
            </Text>
            <Text style={[styles.sessionSubtitle, locked && styles.lockedText]}>
              {track.subtitle}
            </Text>
            <Text style={[styles.sessionDuration, locked && styles.lockedText]}>
              {Math.floor(track.duration / 60)} minutes
            </Text>
            {locked && (
              <View style={styles.lockContainer}>
                <Text style={styles.lockText}>Premium Only</Text>
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
            renderTrackCard(track, selectedTrack.id === track.id)
          ))}
        </View>
      </ScrollView>

      <BlurView intensity={100} style={styles.playerContainer}>
        <AudioControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
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
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
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
    bottom: Platform.select({
      ios: 90,
      android: 80,
    }),
    left: 0,
    right: 0,
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: colors.cardBackground,
    }),
    paddingTop: 16,
    paddingBottom: Platform.select({
      ios: 16,
      android: 16,
    }),
    paddingHorizontal: 20,
  },
});
