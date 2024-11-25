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
      // Check subscription status before allowing playback
      if (isLocked(selectedTrack)) {
        showUpgradeDialog(selectedTrack);
        return;
      }

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

  useEffect(() => {
    // Stop playback and reset state when subscription status changes
    const checkSubscriptionAndReset = async () => {
      if (selectedTrack && isLocked(selectedTrack) && isPlaying) {
        await realityWaveGenerator.stopRealityWave();
        setIsPlaying(false);
        setProgress(0);
        setSessionTime(0);
        showUpgradeDialog(selectedTrack);
      }
    };

    checkSubscriptionAndReset();
  }, [selectedTrack, isLocked, isPlaying, realityWaveGenerator, showUpgradeDialog]);

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
