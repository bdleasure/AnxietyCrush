import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';
import { MainNavigator } from './MainNavigator';
import { withLazyLoading } from '../utils/lazyLoad';

const Stack = createNativeStackNavigator();
const ONBOARDING_COMPLETE_KEY = '@anxiety_crush:onboarding_complete';

// Lazy load screens
const OnboardingScreen = withLazyLoading(() => import('../screens/onboarding/OnboardingScreen'));
const UpgradeScreen = withLazyLoading(() => import('../screens/UpgradeScreen'));

// For development - set this to true to always show onboarding
const FORCE_ONBOARDING = true;

export const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      if (FORCE_ONBOARDING) {
        // Clear onboarding status for development
        await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
        setHasCompletedOnboarding(false);
      } else {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setHasCompletedOnboarding(value === 'true');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding">
            {props => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
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
