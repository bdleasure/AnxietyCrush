import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio } from 'expo-av';
import { colors } from '../theme/colors';
import { formatDuration } from '../utils/timeUtils';
import { useSettings } from '../contexts/SettingsContext';

interface SessionCompleteProps {
  duration: number;
  streak: number;
  pointsEarned: number;
  onContinue: () => void;
}

export const SessionComplete: React.FC<SessionCompleteProps> = ({
  duration,
  streak,
  pointsEarned,
  onContinue,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [sound, setSound] = useState<Audio.Sound>();
  const { soundEnabled } = useSettings();

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Play success sound
    async function playSound() {
      if (soundEnabled) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/success.mp3'),
          { shouldPlay: true }
        );
        setSound(sound);
      }
    }

    playSound();

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  return (
    <BlurView intensity={80} style={styles.container}>
      <ConfettiCannon
        count={100}
        origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
        autoStart={true}
        fadeOut={true}
        fallSpeed={3000}
        colors={['#FFD700', '#9370DB', '#E6BE8A', '#8A2BE2']}
      />
      
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Session Complete!</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time Listened</Text>
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Current Streak</Text>
            <Text style={styles.statValue}>{streak} days</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Reality Points</Text>
            <Text style={styles.statValue}>+{pointsEarned}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  continueButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
