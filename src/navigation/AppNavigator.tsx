import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { MainNavigator } from './MainNavigator';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const ONBOARDING_COMPLETE_KEY = '@anxiety_crush:onboarding_complete';

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
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
