import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export const useEdgeInsets = () => {
  const insets = useSafeAreaInsets();

  return useMemo(() => ({
    top: Math.max(insets.top, Platform.OS === 'ios' ? 20 : 0),
    bottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 34 : 0),
    left: insets.left,
    right: insets.right,
    hasNotch: insets.top > 20,
    // Helper for common padding calculations
    screenPadding: {
      paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 20 : 0),
      paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 34 : 0),
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    // Helper for bottom tab bar height
    tabBarHeight: Math.max(insets.bottom, Platform.OS === 'ios' ? 34 : 0) + 49, // 49 is default tab bar height
    // Helper for navigation header height
    headerHeight: Math.max(insets.top, Platform.OS === 'ios' ? 20 : 0) + 44, // 44 is default header height
  }), [insets]);
};
