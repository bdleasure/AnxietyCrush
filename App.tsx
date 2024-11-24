import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SettingsProvider } from './src/contexts/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </SettingsProvider>
  );
}
