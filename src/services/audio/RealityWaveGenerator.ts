import { Audio } from 'expo-av';

export enum SessionType {
  ANXIETY_CRUSHER = 'anxiety_crusher',
  EMERGENCY_RESET = 'emergency_reset',
  DEEP_PROGRAMMING = 'deep_programming'
}

interface AudioTrack {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  type: SessionType;
  file: any;
  frequency?: number; // Alpha wave frequency in Hz
}

export const AVAILABLE_TRACKS: AudioTrack[] = [
  {
    id: 'anxiety_crusher_1',
    name: '11-Minute Anxiety Crusher™',
    description: 'Transform anxiety with our primary Reality Wave™ session',
    duration: 11,
    type: SessionType.ANXIETY_CRUSHER,
    frequency: 10, // 10 Hz Alpha waves
    file: require('../../../assets/audio/11-Minute Anxiety Crusher.mp3'),
  },
  {
    id: 'emergency_reset_1',
    name: '3-Minute Emergency Reset™',
    description: 'Quick anxiety relief for urgent situations',
    duration: 3,
    type: SessionType.EMERGENCY_RESET,
    frequency: 10,
    file: require('../../../assets/audio/3-Minute Emergency Reset.mp3'),
  },
  {
    id: 'deep_programming_1',
    name: '30-Minute Deep Reality Programming™',
    description: 'Extended session for deep anxiety transformation',
    duration: 30,
    type: SessionType.DEEP_PROGRAMMING,
    frequency: 10,
    file: require('../../../assets/audio/30-Minute Deep Reality Programming.mp3'),
  }
];

export class RealityWaveGenerator {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private currentTrack: AudioTrack | null = null;
  private sessionStartTime: Date | null = null;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw error;
    }
  }

  async loadTrack(track: AudioTrack) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      console.log('Loading track:', track.name);
      const { sound } = await Audio.Sound.createAsync(track.file, {
        shouldPlay: false,
        volume: this.volume,
        isLooping: false, // We'll handle session completion
      });

      this.sound = sound;
      this.currentTrack = track;
      console.log('Successfully loaded track:', track.name);
    } catch (error) {
      console.error('Failed to load track:', error);
      this.sound = null;
      this.currentTrack = null;
      throw error;
    }
  }

  async startRealityWave(track?: AudioTrack) {
    try {
      if (track && (!this.currentTrack || this.currentTrack.id !== track.id)) {
        await this.loadTrack(track);
      }

      if (!this.sound || !this.currentTrack) {
        throw new Error('No track loaded');
      }

      this.sessionStartTime = new Date();
      await this.sound.playAsync();
      this.isPlaying = true;

      // Set up completion handler
      this.sound.setOnPlaybackStatusUpdate(async (status: any) => {
        if (status.didJustFinish) {
          await this.handleSessionComplete();
        }
      });

    } catch (error) {
      console.error('Failed to start Reality Wave:', error);
      throw error;
    }
  }

  private async handleSessionComplete() {
    if (this.currentTrack && this.sessionStartTime) {
      const sessionEndTime = new Date();
      const duration = (sessionEndTime.getTime() - this.sessionStartTime.getTime()) / 1000 / 60; // in minutes
      
      // Here we'll add progress tracking later
      console.log('Session completed:', {
        trackName: this.currentTrack.name,
        duration: duration,
        type: this.currentTrack.type
      });
    }
    
    this.isPlaying = false;
    this.sessionStartTime = null;
  }

  async stopRealityWave() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.isPlaying = false;
        this.sessionStartTime = null;
      }
    } catch (error) {
      console.error('Failed to stop Reality Wave:', error);
      throw error;
    }
  }

  async setVolume(volume: number) {
    try {
      this.volume = Math.max(0, Math.min(1, volume));
      if (this.sound) {
        await this.sound.setVolumeAsync(this.volume);
      }
    } catch (error) {
      console.error('Failed to set volume:', error);
      throw error;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  getSessionProgress(): number {
    if (!this.sessionStartTime || !this.currentTrack) {
      return 0;
    }
    const elapsed = (new Date().getTime() - this.sessionStartTime.getTime()) / 1000 / 60; // in minutes
    return Math.min(1, elapsed / this.currentTrack.duration);
  }
}
