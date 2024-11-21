import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { SessionPlayer } from './src/screens/SessionPlayer';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SessionPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
