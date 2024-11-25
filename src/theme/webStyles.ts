import { StyleSheet } from 'react-native';
import { isWeb } from '../utils/platform';

export const getWebStyles = () => {
  if (!isWeb) return {};

  return StyleSheet.create({
    container: {
      maxWidth: 800,
      marginHorizontal: 'auto',
      paddingHorizontal: 20,
    },
    card: {
      maxWidth: 600,
      marginHorizontal: 'auto',
    },
    player: {
      maxWidth: 800,
      marginHorizontal: 'auto',
    },
    scrollView: {
      maxWidth: 800,
      marginHorizontal: 'auto',
    },
    contentContainer: {
      maxWidth: 800,
      marginHorizontal: 'auto',
      alignItems: 'center',
    },
    modalContent: {
      maxWidth: 500,
      marginHorizontal: 'auto',
    },
  });
};
