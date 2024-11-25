import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

// Re-export individual theme modules
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';

// Export theme object with all values
export const theme = {
  colors,
  typography,
  spacing,
  shadows,
};
