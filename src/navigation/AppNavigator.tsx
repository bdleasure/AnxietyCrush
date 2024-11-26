import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { MainNavigator } from './MainNavigator';
import { withLazyLoading } from '../utils/lazyLoad';
import { preloadAssets } from '../utils/assetLoader';

const Stack = createNativeStackNavigator();
const ONBOARDING_COMPLETE_KEY = '@anxiety_crush:onboarding_complete';

// Lazy load screens
const OnboardingScreen = withLazyLoading(() => import('../screens/onboarding/OnboardingScreen'));
const UpgradeScreen = withLazyLoading(() => import('../screens/UpgradeScreen'));

// For development - set this to true to always show onboarding
const FORCE_ONBOARDING = true;

export const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Start preloading assets
        const assetLoadPromise = preloadAssets((progress) => {
          setLoadingProgress(progress);
        });

        // Check onboarding status
        const onboardingPromise = AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);

        // Wait for both operations to complete
        const [_, onboardingComplete] = await Promise.all([
          assetLoadPromise,
          onboardingPromise
        ]);

        setAssetsLoaded(true);
        setShowOnboarding(FORCE_ONBOARDING || !onboardingComplete);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading || !assetsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!showOnboarding ? (
          <Stack.Screen name="Onboarding">
            {props => <OnboardingScreen {...props} onComplete={() => setShowOnboarding(false)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen 
              name="Upgrade" 
              component={UpgradeScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  }
});
