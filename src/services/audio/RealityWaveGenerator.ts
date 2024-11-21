import { Audio } from 'expo-av';

interface AudioTrack {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  file: any; // require('../../../assets/audio/filename.mp3')
}

export const AVAILABLE_TRACKS: AudioTrack[] = [
  {
    id: 'alpha_wave_1',
    name: 'Alpha Wave Meditation',
    description: 'Deep relaxation with 10Hz alpha waves',
    duration: 10,
    file: require('../../../assets/audio/placeholder.mp3'), // You'll need to add your audio file
  },
  // Add more tracks here
];

export class RealityWaveGenerator {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private currentTrack: AudioTrack | null = null;

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
      // Unload previous track if exists
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        track.file,
        { 
          isLooping: true,
          volume: this.volume,
          shouldPlay: false,
        },
        (status) => {
          // Handle playback status updates
          if (status.didJustFinish) {
            // Handle track completion if needed
            console.log('Track finished playing');
          }
        }
      );

      this.sound = sound;
      this.currentTrack = track;
    } catch (error) {
      console.error('Failed to load track:', error);
      throw error;
    }
  }

  async startRealityWave(track?: AudioTrack) {
    try {
      if (this.isPlaying) {
        return;
      }

      // If a new track is specified or no track is loaded, load it
      if (track && track !== this.currentTrack) {
        await this.loadTrack(track);
      } else if (!this.sound && AVAILABLE_TRACKS.length > 0) {
        // Load default track if none specified
        await this.loadTrack(AVAILABLE_TRACKS[0]);
      }

      if (this.sound) {
        await this.sound.playAsync();
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('Failed to start Reality Wave:', error);
      throw error;
    }
  }

  async stopRealityWave() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.isPlaying = false;
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

  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  getVolume(): number {
    return this.volume;
  }
}
