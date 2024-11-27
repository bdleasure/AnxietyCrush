import { useEffect, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from '../src/contexts/SettingsContext';
import { PurchaseProvider } from '../src/contexts/PurchaseContext';
import { AchievementOverlay } from '../src/components/AchievementOverlay';
import { StatusBar } from 'expo-status-bar';
import FlashMessage from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { preloadAssets } from '../src/utils/assetLoader';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Preload assets
        await preloadAssets((progress) => {
          console.log('Loading assets:', progress);
        });
      } catch (e) {
        console.warn('Error loading assets:', e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PurchaseProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <AchievementOverlay />
          <StatusBar style="auto" />
          <FlashMessage position="top" />
        </PurchaseProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
