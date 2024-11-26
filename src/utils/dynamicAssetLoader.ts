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

// Define our audio files
const audioFiles = {
  'anxietyCrusher': '11-Minute Anxiety Crusher.mp3',
  'emergencyReset': '3-Minute Emergency Reset.mp3',
  'deepProgramming': '30-Minute Deep Reality Programming.mp3',
  'focusField': 'focus-field.mp3',
  'sleepWave': 'sleep-wave.mp3',
  'successPattern': 'success-pattern.mp3',
};

// Get all audio assets
export const getAudioAssets = (): { [key: string]: AudioAsset } => {
  const audioModules: { [key: string]: AudioAsset } = {};

  Object.entries(audioFiles).forEach(([id, filename]) => {
    if (filename.includes('placeholder')) return;

    audioModules[id] = {
      id,
      name: formatAudioName(filename),
      duration: 0, // This will be updated when the audio is loaded
      module: Asset.fromModule(require(`../../assets/audio/${filename}`)),
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

// Function to register a new audio asset
export const registerAudioAsset = (id: string, filename: string): void => {
  if (!audioFiles[id]) {
    audioFiles[id] = filename;
    AudioAssets[id] = {
      id,
      name: formatAudioName(filename),
      duration: 0,
      module: Asset.fromModule(require(`../../assets/audio/${filename}`)),
    };
  }
};
