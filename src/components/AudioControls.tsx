import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { RealityWaveGenerator } from '../services/audio/RealityWaveGenerator';

interface AudioControlsProps {
  audioPlayer: RealityWaveGenerator;
  isPlaying: boolean;
  duration: number;
  position: number;
  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onSeeking?: (position: number) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  audioPlayer,
  isPlaying,
  duration,
  position,
  onPlayPause,
  onSeek,
  onSeeking,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
      
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onValueChange={onSeeking}
        onSlidingComplete={onSeek}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.secondary}
        thumbTintColor={colors.accent}
      />
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.button, isPlaying && styles.buttonActive]}
          onPress={onPlayPause}
        >
          <Text style={styles.buttonText}>
            {isPlaying ? 'Stop' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
