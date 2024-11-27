import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RealityWaveGenerator } from '../services/audio/RealityWaveGenerator';
import { AudioTrackAccess } from '../types/audio';

type AudioScreenType = 'SessionPlayer' | 'BonusPlayer' | null;

interface AudioContextType {
  currentPlayingScreen: AudioScreenType;
  setCurrentPlayingScreen: (screen: AudioScreenType) => void;
  playTrack: (screen: AudioScreenType, track: AudioTrackAccess) => Promise<void>;
  stopPlayback: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlayingScreen, setCurrentPlayingScreen] = useState<AudioScreenType>(null);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);
  const audioPlayer = RealityWaveGenerator.getInstance();

  // Sync screen state with audio player state
  useEffect(() => {
    const checkAudioState = () => {
      try {
        const isPlaying = audioPlayer?.getIsPlaying?.();
        if (isPlaying === false && currentPlayingScreen !== null) {
          console.log('[AudioContext] Audio stopped playing, resetting screen state');
          setCurrentPlayingScreen(null);
        }
      } catch (error) {
        console.error('[AudioContext] Error checking audio state:', error);
      }
    };

    const interval = setInterval(checkAudioState, 500);
    return () => clearInterval(interval);
  }, [currentPlayingScreen]);

  const stopPlayback = useCallback(async () => {
    if (isOperationInProgress) {
      console.log('[AudioContext] Operation in progress, skipping stopPlayback');
      return;
    }

    try {
      setIsOperationInProgress(true);
      if (!audioPlayer) {
        console.error('[AudioContext] Audio player not initialized');
        return;
      }

      console.log(`[AudioContext] Stopping playback on ${currentPlayingScreen}`);
      await audioPlayer.stopRealityWave();
      setCurrentPlayingScreen(null);
    } catch (error) {
      console.error('[AudioContext] Error stopping playback:', error);
      setCurrentPlayingScreen(null);
    } finally {
      setIsOperationInProgress(false);
    }
  }, [currentPlayingScreen, isOperationInProgress]);

  const playTrack = useCallback(async (screen: AudioScreenType, track: AudioTrackAccess) => {
    if (isOperationInProgress) {
      console.log('[AudioContext] Operation in progress, skipping playTrack');
      return;
    }

    try {
      setIsOperationInProgress(true);
      if (!audioPlayer) {
        throw new Error('Audio player not initialized');
      }

      console.log(`[AudioContext] Starting playback on ${screen}`, {
        screen,
        trackId: track.id,
        currentScreen: currentPlayingScreen
      });
      
      // Stop any current playback
      if (currentPlayingScreen && currentPlayingScreen !== screen) {
        await stopPlayback();
      }

      // Start new playback
      await audioPlayer.startRealityWave(track, true);
      setCurrentPlayingScreen(screen);
    } catch (error) {
      console.error('[AudioContext] Error playing track:', error);
      setCurrentPlayingScreen(null);
      throw error;
    } finally {
      setIsOperationInProgress(false);
    }
  }, [currentPlayingScreen, stopPlayback, isOperationInProgress]);

  return (
    <AudioContext.Provider
      value={{
        currentPlayingScreen,
        setCurrentPlayingScreen,
        playTrack,
        stopPlayback,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
