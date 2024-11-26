import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { AchievementOverlay } from './src/components/AchievementOverlay';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AppNavigator />
        <AchievementOverlay />
        <StatusBar style="auto" />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
