import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Audio } from 'expo-av';
import { Image } from 'react-native';
import { AudioAssets } from './dynamicAssetLoader';

// Define essential assets that need to be preloaded
const imageAssets = {
  adaptiveIcon: require('../../assets/adaptive-icon.png'),
  icon: require('../../assets/icon.png'),
  splashIcon: require('../../assets/splash-icon.png'),
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

// Preload audio with duration calculation
const cacheAudio = async (audioAssets: typeof AudioAssets) => {
  const promises = Object.values(audioAssets).map(async (audio) => {
    try {
      const { sound, status } = await Audio.Sound.createAsync(audio.module, {}, null, true);
      
      // Update the duration in our audio assets
      if (status.isLoaded) {
        audio.duration = status.durationMillis || 0;
      }
      
      // Unload the sound to free up memory
      await sound.unloadAsync();
      
      return status;
    } catch (error) {
      console.warn(`Failed to load audio: ${audio.name}`, error);
      return null;
    }
  });

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
    await cacheAudio(AudioAssets);
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
  audio: AudioAssets,
  fonts: fontAssets,
};
