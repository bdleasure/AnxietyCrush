import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const FONT_SCALE = width / 375; // Base width of 375 for iPhone 8

export const typography = {
  // Headings
  h1: {
    size: Math.round(28 * FONT_SCALE),
    weight: '700' as const,
  },
  h2: {
    size: Math.round(24 * FONT_SCALE),
    weight: '600' as const,
  },
  h3: {
    size: Math.round(20 * FONT_SCALE),
    weight: '600' as const,
  },
  
  // Body text
  bodyLarge: {
    size: Math.round(18 * FONT_SCALE),
    weight: '400' as const,
  },
  bodyMedium: {
    size: Math.round(16 * FONT_SCALE),
    weight: '400' as const,
  },
  bodySmall: {
    size: Math.round(14 * FONT_SCALE),
    weight: '400' as const,
  },
  
  // Special cases
  button: {
    size: Math.round(16 * FONT_SCALE),
    weight: '600' as const,
  },
  caption: {
    size: Math.round(12 * FONT_SCALE),
    weight: '400' as const,
  },
  label: {
    size: Math.round(14 * FONT_SCALE),
    weight: '500' as const,
  }
};
