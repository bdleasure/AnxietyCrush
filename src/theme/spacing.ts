import { Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const BASE_SCALE = Platform.select({
  ios: width / 390, // Base width of iPhone 12/13/14
  android: width / 375,
}) || width / 375;

// Helper to ensure minimum spacing on smaller devices
const getScaledSize = (size: number) => {
  const scaled = Math.round(size * BASE_SCALE);
  return Math.max(scaled, size * 0.8); // Ensure spacing doesn't get too small
};

export const spacing = {
  // Base spacing units
  xxs: getScaledSize(4),
  xs: getScaledSize(8),
  sm: getScaledSize(12),
  md: getScaledSize(16),
  lg: getScaledSize(24),
  xl: getScaledSize(32),
  xxl: getScaledSize(48),

  // Specific use cases
  screenPadding: Platform.select({
    ios: getScaledSize(20),
    android: getScaledSize(16),
  }),
  cardPadding: Platform.select({
    ios: getScaledSize(16),
    android: getScaledSize(16),
  }),
  sectionSpacing: getScaledSize(24),
  componentSpacing: getScaledSize(12),
  
  // Layout
  headerHeight: Platform.select({
    ios: getScaledSize(44),
    android: getScaledSize(56),
  }),
  buttonHeight: Platform.select({
    ios: getScaledSize(44),
    android: getScaledSize(48),
  }),
  inputHeight: getScaledSize(44),
  borderRadius: {
    sm: getScaledSize(6),
    md: getScaledSize(8),
    lg: Platform.select({
      ios: getScaledSize(12),
      android: getScaledSize(16),
    }),
    xl: getScaledSize(24),
  }
};
