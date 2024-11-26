import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Audio } from 'expo-av';
import { Image } from 'react-native';

// Define essential assets that need to be preloaded
const imageAssets = {
  adaptiveIcon: require('../../assets/adaptive-icon.png'),
  icon: require('../../assets/icon.png'),
  splashIcon: require('../../assets/splash-icon.png'),
};

const audioAssets = {
  anxietyCrusher: require('../../assets/audio/11-Minute Anxiety Crusher.mp3'),
  emergencyReset: require('../../assets/audio/3-Minute Emergency Reset.mp3'),
  deepProgramming: require('../../assets/audio/30-Minute Deep Reality Programming.mp3'),
  focusField: require('../../assets/audio/focus-field.mp3'),
  sleepWave: require('../../assets/audio/sleep-wave.mp3'),
  successPattern: require('../../assets/audio/success-pattern.mp3'),
};

const fontAssets = {
  // Add your custom fonts here if any
  // example: 'CustomFont-Regular': require('../../assets/fonts/CustomFont-Regular.ttf'),
};

// Preload images
const cacheImages = async (images: any[]) => {
  const promises = images.map((image) => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });

  await Promise.all(promises);
};

// Preload audio
const cacheAudio = async (audioFiles: any[]) => {
  const promises = audioFiles.map((audio) => Audio.Sound.createAsync(audio));
  await Promise.all(promises);
};

// Preload fonts
const cacheFonts = (fonts: { [key: string]: any }) => {
  return Font.loadAsync(fonts);
};

// Main preload function
export const preloadAssets = async (
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const totalSteps = 3; // images, audio, fonts
    let completedSteps = 0;

    // Preload images
    await cacheImages(Object.values(imageAssets));
    completedSteps++;
    onProgress?.(completedSteps / totalSteps);

    // Preload audio
    await cacheAudio(Object.values(audioAssets));
    completedSteps++;
    onProgress?.(completedSteps / totalSteps);

    // Preload fonts
    await cacheFonts(fontAssets);
    completedSteps++;
    onProgress?.(completedSteps / totalSteps);

  } catch (error) {
    console.warn('Error preloading assets:', error);
    throw error;
  }
};

// Export asset references for use in the app
export const Assets = {
  images: imageAssets,
  audio: audioAssets,
  fonts: fontAssets,
};
