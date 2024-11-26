import React, { useMemo } from 'react';
import { Platform, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import FastImage, { Source } from 'react-native-fast-image';
import {
  getOptimalImageDimensions,
  getImageQuality,
  IMAGE_GUIDELINES,
} from '../../utils/imageOptimizer';

interface OptimizedImageProps {
  source: number | Source;
  style?: ViewStyle | ImageStyle;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  priority?: 'low' | 'normal' | 'high';
  useCase?: 'icon' | 'photo' | 'thumbnail';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  useCase = 'photo',
}) => {
  const imageSource = useMemo(() => {
    if (typeof source === 'number') {
      return source;
    }

    // Apply quality based on device capabilities
    const quality = getImageQuality();
    
    return {
      ...source,
      priority: FastImage.priority[priority],
      cache: FastImage.cacheControl.immutable,
    };
  }, [source, priority]);

  const imageStyle = useMemo(() => {
    if (!style) return styles.defaultImage;

    const flatStyle = StyleSheet.flatten(style);
    const { width: originalWidth, height: originalHeight } = flatStyle;

    if (originalWidth && originalHeight) {
      const { width, height } = getOptimalImageDimensions(
        Number(originalWidth),
        Number(originalHeight)
      );

      return [
        styles.defaultImage,
        style,
        { width, height },
      ];
    }

    return [styles.defaultImage, style];
  }, [style]);

  // Use FastImage for better performance
  return (
    <FastImage
      source={imageSource}
      style={imageStyle}
      resizeMode={FastImage.resizeMode[resizeMode]}
    />
  );
};

const styles = StyleSheet.create({
  defaultImage: {
    width: IMAGE_GUIDELINES.thumbnailSize,
    height: IMAGE_GUIDELINES.thumbnailSize,
  },
});
