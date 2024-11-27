import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { PurchaseProvider } from './src/contexts/PurchaseContext';
import { AchievementOverlay } from './src/components/AchievementOverlay';
import { StatusBar } from 'expo-status-bar';
import FlashMessage from 'react-native-flash-message';

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PurchaseProvider>
          <AppNavigator />
          <AchievementOverlay />
          <StatusBar style="auto" />
          <FlashMessage position="top" />
        </PurchaseProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
