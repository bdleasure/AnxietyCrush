import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
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
  loading?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  audioPlayer,
  isPlaying,
  duration,
  position,
  onPlayPause,
  onSeek,
  onSeeking,
  loading,
}) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (!isSeeking) {
      setSliderValue(position);
    }
  }, [position, isSeeking]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSliderValueChange = (value: number) => {
    setIsSeeking(true);
    setSliderValue(value);
    onSeeking?.(value);
  };

  const handleSlidingComplete = (value: number) => {
    setIsSeeking(false);
    onSeek(value);
  };

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={sliderValue}
        onValueChange={handleSliderValueChange}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.secondary}
        thumbTintColor={colors.accent}
      />
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={onPlayPause}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={colors.textPrimary}
            />
          )}
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
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: colors.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
