import { Platform, Dimensions } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const window = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

export const getResponsiveSize = (size: number): number => {
  if (isWeb) {
    // Use vw units on web for better responsiveness
    return (size / 375) * window.width;
  }
  return size;
};

export const webStyles = {
  // Add web-specific styles
  container: {
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'opacity 0.2s ease-in-out',
  },
  button: {
    ':hover': {
      opacity: 0.8,
    },
    ':active': {
      opacity: 0.6,
    },
  },
  // Add accessibility styles
  focusable: {
    ':focus': {
      outline: '2px solid #007AFF',
      outlineOffset: 2,
    },
  },
};

export const getPlatformSpecificStyle = (webStyle: any, mobileStyle: any) => {
  return isWeb ? webStyle : mobileStyle;
};
