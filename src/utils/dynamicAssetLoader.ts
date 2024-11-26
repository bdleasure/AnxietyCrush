import { Platform } from 'react-native';
import { Asset } from 'expo-asset';

// Type definitions for our assets
export interface AudioAsset {
  id: string;
  name: string;
  duration: number;
  module: any;
}

// Function to convert filename to readable name
const formatAudioName = (filename: string): string => {
  return filename
    .replace('.mp3', '')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Define our audio files with their require statements
const audioFiles = {
  anxietyCrusher: {
    filename: '11-Minute Anxiety Crusher.mp3',
    module: require('../../assets/audio/11-Minute Anxiety Crusher.mp3'),
  },
  emergencyReset: {
    filename: '3-Minute Emergency Reset.mp3',
    module: require('../../assets/audio/3-Minute Emergency Reset.mp3'),
  },
  deepProgramming: {
    filename: '30-Minute Deep Reality Programming.mp3',
    module: require('../../assets/audio/30-Minute Deep Reality Programming.mp3'),
  },
  focusField: {
    filename: 'focus-field.mp3',
    module: require('../../assets/audio/focus-field.mp3'),
  },
  sleepWave: {
    filename: 'sleep-wave.mp3',
    module: require('../../assets/audio/sleep-wave.mp3'),
  },
  successPattern: {
    filename: 'success-pattern.mp3',
    module: require('../../assets/audio/success-pattern.mp3'),
  },
};

// Get all audio assets
export const getAudioAssets = (): { [key: string]: AudioAsset } => {
  const audioModules: { [key: string]: AudioAsset } = {};

  Object.entries(audioFiles).forEach(([id, { filename, module }]) => {
    if (filename.includes('placeholder')) return;

    audioModules[id] = {
      id,
      name: formatAudioName(filename),
      duration: 0, // This will be updated when the audio is loaded
      module: Asset.fromModule(module),
    };
  });

  return audioModules;
};

// Function to get asset path based on platform
export const getAssetPath = (filename: string): string => {
  if (Platform.OS === 'android') {
    return `asset:/audio/${filename}`;
  }
  return filename;
};

// Export audio assets for use in the app
export const AudioAssets = getAudioAssets();

/**
 * To add a new audio file:
 * 1. Add the file to the assets/audio directory
 * 2. Add a new entry to the audioFiles object above with the correct require statement
 * 3. The system will automatically handle loading and making it available
 */
