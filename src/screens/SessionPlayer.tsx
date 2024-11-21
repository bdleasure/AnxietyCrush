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
import { featureAccess, AUDIO_TRACKS } from '../services/subscription/featureAccess';
import { AudioTrackAccess, SubscriptionTier } from '../services/subscription/types';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const SessionPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(AUDIO_TRACKS[0]);
  const [realityWave] = useState(() => new RealityWaveGenerator());
  const [progress, setProgress] = useState(0);

  // Get available tracks based on user's subscription
  const availableTracks = featureAccess.getAvailableTracks();
  const lockedTracks = AUDIO_TRACKS.filter(track => !featureAccess.hasAccessToTrack(track.id));

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        const progress = realityWave.getSessionProgress();
        setProgress(progress);
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, realityWave]);

  // Handle session selection
  const selectSession = async (track: AudioTrackAccess) => {
    if (!featureAccess.hasAccessToTrack(track.id)) {
      showUpgradeDialog(track);
      return;
    }

    if (isPlaying) {
      await realityWave.stopRealityWave();
      setIsPlaying(false);
    }
    setSelectedTrack(track);
    setSessionTime(0);
    setProgress(0);
  };

  // Show upgrade dialog
  const showUpgradeDialog = (track: AudioTrackAccess) => {
    Alert.alert(
      'Upgrade Required',
      `This ${track.name} is part of the ${track.requiredTier} package. Upgrade to access this and other premium features.`,
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
        await realityWave.stopRealityWave();
        setIsPlaying(false);
        setSessionTime(0);
        setProgress(0);
      }
    } catch (error) {
      console.error('Error toggling session:', error);
      Alert.alert(
        'Session Error',
        'There was an error with the session. Please try again.',
        [{ text: 'OK' }]
      );
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  }, [isPlaying, realityWave, selectedTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realityWave.stopRealityWave();
    };
  }, [realityWave]);

  const SessionCard = ({ track }: { track: AudioTrackAccess }) => {
    const isLocked = !featureAccess.hasAccessToTrack(track.id);

    return (
      <TouchableOpacity
        style={[
          styles.sessionCard,
          selectedTrack.id === track.id && styles.selectedCard,
          isLocked && styles.lockedCard,
        ]}
        onPress={() => selectSession(track)}
        disabled={isPlaying}
      >
        <View style={styles.sessionCardContent}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>
              {track.name}
              {isLocked && ' 🔒'}
            </Text>
            <Text style={styles.sessionDescription}>
              {isLocked ? `Unlock with ${track.requiredTier} Package` : `${track.duration} min • ${track.category}`}
            </Text>
          </View>
          {selectedTrack.id === track.id && !isLocked && (
            <View style={styles.selectedIndicator} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryHeader = (category: string) => (
    <Text style={styles.categoryHeader}>{category}</Text>
  );

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
      <View style={styles.header}>
        <Text style={styles.heading}>Reality Wave™</Text>
        <Text style={styles.subheading}>Select your session</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedTracks).map(([category, tracks]) => (
          <View key={category}>
            {renderCategoryHeader(category)}
            {tracks.map((track) => (
              <SessionCard key={track.id} track={track} />
            ))}
          </View>
        ))}
      </ScrollView>

      <BlurView intensity={100} tint="dark" style={styles.playerContainer}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(sessionTime)}</Text>
            <Text style={styles.sessionName} numberOfLines={1}>
              {selectedTrack.name}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, isPlaying && styles.buttonActive]}
            onPress={togglePlayPause}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>
                {isPlaying ? 'Stop' : 'Start'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  heading: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 180 : 160, // Increased padding for tab bar + player
  },
  sessionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  sessionCardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    marginRight: 15,
  },
  sessionMeta: {
    alignItems: 'flex-end',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 8,
  },
  sessionTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '500',
  },
  playerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 85 : 60, // Height of the tab bar
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
    paddingBottom: 20, // Reduced padding since we moved up the container
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
  categoryHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
    marginTop: 20,
    marginBottom: 10,
  },
  lockedCard: {
    opacity: 0.8,
    borderColor: colors.secondary,
  },
});
