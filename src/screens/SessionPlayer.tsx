import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { RealityWaveGenerator } from '../services/audio/RealityWaveGenerator';
import { colors } from '../theme/colors';

export const SessionPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [realityWave] = useState(() => new RealityWaveGenerator());

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying]);

  // Handle play/pause
  const togglePlayPause = useCallback(async () => {
    try {
      if (!isPlaying) {
        await realityWave.startRealityWave();
        setIsPlaying(true);
      } else {
        await realityWave.stopRealityWave();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error toggling session:', error);
      Alert.alert(
        'Session Error',
        'There was an error starting the session. Please ensure your device is not in silent mode and try again.',
        [{ text: 'OK' }]
      );
      setIsPlaying(false);
    }
  }, [isPlaying, realityWave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realityWave.stopRealityWave();
    };
  }, [realityWave]);

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(sessionTime)}</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, isPlaying && styles.buttonActive]}
        onPress={togglePlayPause}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          {isPlaying ? 'Stop Session' : 'Start Session'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timerContainer: {
    marginBottom: 40,
  },
  timerText: {
    fontSize: 48,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
