import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { AudioControls } from './AudioControls';
import { RealityWaveGenerator } from '../services/audio/RealityWaveGenerator';
import { AudioTrackAccess } from '../services/subscription/types';
import { useMetrics } from '../hooks/useMetrics';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useEdgeInsets } from '../hooks/useEdgeInsets';
import { colors } from '../theme/colors';

interface AudioPlayerProps {
  selectedTrack: AudioTrackAccess | null;
  onTrackSelect: (track: AudioTrackAccess) => void;
  showUpgradeDialog: (track: AudioTrackAccess) => void;
  style?: any;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  selectedTrack,
  onTrackSelect,
  showUpgradeDialog,
  style,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const insets = useEdgeInsets();
  const metricsService = useMetrics();
  const featureAccess = useFeatureAccess();
  const realityWaveGenerator = React.useMemo(() => new RealityWaveGenerator(), []);

  // Update playback status
  useEffect(() => {
    realityWaveGenerator.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setProgress(status.positionMillis / (status.durationMillis || 1));
        setSessionTime(Math.floor(status.positionMillis / 1000));
        setDuration(Math.floor(status.durationMillis / 1000));
        setIsPlaying(status.isPlaying);
        
        // Handle track completion
        if (status.didJustFinish) {
          setIsPlaying(false);
          setProgress(0);
          setSessionTime(0);
          
          // Record completed session
          if (selectedTrack && sessionTime > 10) {
            metricsService.recordSession({
              trackId: selectedTrack.id,
              duration: sessionTime,
              completed: true,
            });
          }
        }
      }
    });

    return () => {
      realityWaveGenerator.setOnPlaybackStatusUpdate(null);
    };
  }, [selectedTrack]);

  // Handle track selection
  const handleTrackSelect = useCallback(async (track: AudioTrackAccess) => {
    if (!featureAccess.hasAccessToTrack(track.id)) {
      showUpgradeDialog(track);
      return;
    }

    try {
      setLoading(true);
      
      // Stop current playback if playing
      if (isPlaying) {
        await realityWaveGenerator.stopRealityWave();
      }
      
      onTrackSelect(track);
      setProgress(0);
      setSessionTime(0);
      setIsPlaying(false);

      // Load the track without playing
      await realityWaveGenerator.startRealityWave(track, false);
      const duration = await realityWaveGenerator.getDuration();
      setDuration(duration);
    } catch (error) {
      console.error('Error selecting track:', error);
      Alert.alert('Error', 'Failed to load the selected track. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isPlaying, onTrackSelect]);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (!selectedTrack || loading) return;

    try {
      if (!isPlaying) {
        await realityWaveGenerator.startRealityWave(selectedTrack, true);
        setIsPlaying(true);
      } else {
        await realityWaveGenerator.pauseRealityWave();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Playback Error', 'Failed to play/pause the track. Please try again.');
    }
  }, [isPlaying, selectedTrack, loading]);

  // Handle seeking
  const handleSeek = useCallback(async (position: number) => {
    try {
      await realityWaveGenerator.seekTo(position);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, []);

  const handleSeeking = useCallback((position: number) => {
    setSessionTime(position);
    setProgress(position / duration);
  }, [duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        realityWaveGenerator.pauseRealityWave();
      }
    };
  }, [isPlaying]);

  return (
    <View style={[styles.audioControlsContainer, { paddingBottom: insets.bottom + 60 }, style]} >
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
    </View>
  );
};

const styles = StyleSheet.create({
  audioControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: 16,
    zIndex: 2,
  },
});
