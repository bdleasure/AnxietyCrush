import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Assets } from '../utils/assetLoader';
import { AudioAsset } from '../utils/dynamicAssetLoader';

interface UseAudioAssetReturn {
  sound: Audio.Sound | null;
  isLoading: boolean;
  isPlaying: boolean;
  duration: number;
  position: number;
  error: Error | null;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
}

export const useAudioAsset = (audioId: string): UseAudioAssetReturn => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const audioAsset = Assets.audio[audioId] as AudioAsset;

  useEffect(() => {
    let isMounted = true;
    let positionUpdateInterval: NodeJS.Timeout;

    const loadSound = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { sound: newSound } = await Audio.Sound.createAsync(
          audioAsset.module,
          { shouldPlay: false },
          (status) => {
            if (status.isLoaded) {
              setPosition(status.positionMillis);
              setIsPlaying(status.isPlaying);
            }
          }
        );

        if (isMounted) {
          setSound(newSound);
          setIsLoading(false);

          // Start position update interval when playing
          positionUpdateInterval = setInterval(async () => {
            if (sound && isPlaying) {
              const status = await sound.getStatusAsync();
              if (status.isLoaded) {
                setPosition(status.positionMillis);
              }
            }
          }, 1000);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      if (positionUpdateInterval) {
        clearInterval(positionUpdateInterval);
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioId]);

  const play = async () => {
    try {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      setError(err as Error);
    }
  };

  const pause = async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (err) {
      setError(err as Error);
    }
  };

  const stop = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(false);
        setPosition(0);
      }
    } catch (err) {
      setError(err as Error);
    }
  };

  const seekTo = async (newPosition: number) => {
    try {
      if (sound) {
        await sound.setPositionAsync(newPosition);
        setPosition(newPosition);
      }
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    sound,
    isLoading,
    isPlaying,
    duration: audioAsset.duration,
    position,
    error,
    play,
    pause,
    stop,
    seekTo,
  };
};
