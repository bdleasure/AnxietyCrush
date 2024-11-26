import { Platform, PixelRatio, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Normalize dimensions based on screen size
export const normalize = (size: number): number => {
  const scale = SCREEN_WIDTH / 320; // Base width used for scaling
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Get optimal image dimensions based on screen size and desired aspect ratio
export const getOptimalImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxScreenPercentage = 0.9 // Maximum percentage of screen size to use
): { width: number; height: number } => {
  const maxWidth = SCREEN_WIDTH * maxScreenPercentage;
  const maxHeight = SCREEN_HEIGHT * maxScreenPercentage;
  const aspectRatio = originalWidth / originalHeight;

  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (targetWidth > maxWidth) {
    targetWidth = maxWidth;
    targetHeight = targetWidth / aspectRatio;
  }

  if (targetHeight > maxHeight) {
    targetHeight = maxHeight;
    targetWidth = targetHeight * aspectRatio;
  }

  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
  };
};

// Get image quality based on device pixel ratio
export const getImageQuality = (): number => {
  const pixelRatio = PixelRatio.get();
  
  if (pixelRatio <= 1) {
    return 0.6; // Lower quality for low-res devices
  } else if (pixelRatio <= 2) {
    return 0.8; // Medium quality for standard devices
  } else {
    return 1.0; // High quality for high-res devices
  }
};

// Image format recommendations based on use case
export const getRecommendedFormat = (useCase: 'icon' | 'photo' | 'thumbnail'): string => {
  if (Platform.OS === 'ios') {
    return useCase === 'icon' ? 'png' : 'jpg';
  } else {
    return useCase === 'icon' ? 'webp' : 'webp';
  }
};

// Calculate memory impact of an image
export const calculateImageMemoryImpact = (
  width: number,
  height: number,
  bytesPerPixel = 4 // RGBA
): number => {
  return width * height * bytesPerPixel;
};

// Image optimization guidelines
export const IMAGE_GUIDELINES = {
  maxWidth: SCREEN_WIDTH * 2, // 2x screen width for high-res devices
  maxHeight: SCREEN_HEIGHT * 2,
  thumbnailSize: normalize(100),
  iconSize: normalize(40),
  formats: {
    ios: ['png', 'jpg', 'heic'],
    android: ['webp', 'png', 'jpg'],
  },
  compressionQuality: {
    thumbnail: 0.7,
    photo: 0.85,
    icon: 1.0,
  },
};
