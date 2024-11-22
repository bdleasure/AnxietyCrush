import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { SessionType } from '../../types/session';
import { AudioTrackAccess } from '../subscription/types';

// Define audio sources
const AUDIO_SOURCES = {
  anxietyCrusher: require('../../../assets/audio/11-Minute Anxiety Crusher.mp3'),
  emergencyReset: require('../../../assets/audio/3-Minute Emergency Reset.mp3'),
  deepProgramming: require('../../../assets/audio/30-Minute Deep Reality Programming.mp3'),
} as const;

// Map track IDs to audio sources
const TRACK_AUDIO_MAP: Record<string, number> = {
  'anxiety-relief': AUDIO_SOURCES.anxietyCrusher,
  'emergency-reset': AUDIO_SOURCES.emergencyReset,
  'deep-reality': AUDIO_SOURCES.deepProgramming,
};

export interface AudioTrack {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: SessionType;
  audioSource: number;
  frequency?: number;
}

export const AVAILABLE_TRACKS: AudioTrack[] = [
  {
    id: 'anxiety-relief',
    name: 'Anxiety Crusher™',
    description: 'Transform anxiety with our primary Reality Wave session',
    duration: 11,
    type: SessionType.ANXIETY_CRUSHER,
    frequency: 10,
    audioSource: AUDIO_SOURCES.anxietyCrusher
  },
  {
    id: 'emergency-reset',
    name: 'Emergency Reset™',
    description: 'Quick anxiety relief for urgent situations',
    duration: 3,
    type: SessionType.EMERGENCY_RESET,
    frequency: 10,
    audioSource: AUDIO_SOURCES.emergencyReset
  },
  {
    id: 'deep-reality',
    name: 'Deep Reality Programming™',
    description: 'Extended session for deep anxiety transformation',
    duration: 30,
    type: SessionType.DEEP_PROGRAMMING,
    frequency: 10,
    audioSource: AUDIO_SOURCES.deepProgramming
  }
];

export class RealityWaveGenerator {
  private sound: Audio.Sound | null = null;
  private onPlaybackStatusUpdateCallback: ((status: any) => void) | null = null;
  private currentTrack: AudioTrackAccess | null = null;

  constructor() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }

  private isSoundPlayable(sound: Audio.Sound | null): boolean {
    return sound !== null && 
           typeof sound.getStatusAsync === 'function' &&
           typeof sound.unloadAsync === 'function';
  }

  private async cleanupSound() {
    try {
      if (!this.isSoundPlayable(this.sound)) {
        this.sound = null;
        return;
      }

      try {
        const status = await this.sound!.getStatusAsync();
        if (status.isLoaded) {
          await this.sound!.unloadAsync();
        }
      } catch (error) {
        console.error('Error during sound cleanup:', error);
      }
      
      this.sound = null;
    } catch (error) {
      console.error('Error in cleanupSound:', error);
      this.sound = null;
    }
  }

  async startRealityWave(track: AudioTrackAccess): Promise<void> {
    try {
      await this.cleanupSound();

      const audioSource = TRACK_AUDIO_MAP[track.id];
      if (!audioSource) {
        throw new Error(`No audio source found for track: ${track.id}`);
      }

      const { sound } = await Audio.Sound.createAsync(
        audioSource,
        { shouldPlay: true },
        this.handlePlaybackStatusUpdate
      );

      this.sound = sound;
      this.currentTrack = track;
    } catch (error) {
      console.error('Error starting reality wave:', error);
      throw error;
    }
  }

  private handlePlaybackStatusUpdate = (status: any) => {
    if (this.onPlaybackStatusUpdateCallback) {
      this.onPlaybackStatusUpdateCallback(status);
    }
  };

  setOnPlaybackStatusUpdate(callback: ((status: any) => void) | null) {
    this.onPlaybackStatusUpdateCallback = callback;
  }

  async stopRealityWave(): Promise<void> {
    try {
      await this.cleanupSound();
      this.currentTrack = null;
      
      // Notify that playback has stopped
      if (this.onPlaybackStatusUpdateCallback) {
        this.onPlaybackStatusUpdateCallback({
          isLoaded: false,
          isPlaying: false,
          positionMillis: 0,
          durationMillis: 0,
          didJustFinish: true
        });
      }
    } catch (error) {
      console.error('Error stopping reality wave:', error);
      // Even if there's an error, try to notify UI
      if (this.onPlaybackStatusUpdateCallback) {
        this.onPlaybackStatusUpdateCallback({
          isLoaded: false,
          isPlaying: false,
          positionMillis: 0,
          durationMillis: 0,
          didJustFinish: true
        });
      }
    }
  }

  async getCurrentPosition(): Promise<number> {
    try {
      if (!this.isSoundPlayable(this.sound)) return 0;
      
      const status = await this.sound!.getStatusAsync();
      return status.isLoaded ? Math.floor(status.positionMillis / 1000) : 0;
    } catch (error) {
      console.error('Error getting position:', error);
      return 0;
    }
  }

  async getDuration(): Promise<number> {
    if (!this.currentTrack) return 0;
    return this.currentTrack.duration * 60; // Convert minutes to seconds
  }

  async seekTo(position: number): Promise<void> {
    try {
      if (!this.currentTrack) return;

      let wasPlaying = false;
      if (this.isSoundPlayable(this.sound)) {
        const status = await this.sound!.getStatusAsync();
        wasPlaying = status.isLoaded && status.isPlaying;
      }

      await this.cleanupSound();

      const audioSource = TRACK_AUDIO_MAP[this.currentTrack.id];
      if (!audioSource) return;

      const { sound } = await Audio.Sound.createAsync(
        audioSource,
        { 
          shouldPlay: wasPlaying,
          positionMillis: Math.floor(position * 1000)
        },
        this.handlePlaybackStatusUpdate
      );

      this.sound = sound;
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }
}
