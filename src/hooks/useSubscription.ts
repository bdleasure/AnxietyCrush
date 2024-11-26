import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionTier } from '../services/subscription/types';

const SUBSCRIPTION_KEY = '@anxiety_crush/subscription';

interface Subscription {
  tier: SubscriptionTier;
  expiryDate: string | null;
}

const DEFAULT_SUBSCRIPTION: Subscription = {
  tier: SubscriptionTier.FREE,
  expiryDate: null,
};

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription>(DEFAULT_SUBSCRIPTION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const storedSubscription = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (storedSubscription) {
        setSubscription(JSON.parse(storedSubscription));
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = useCallback(async (newTier: SubscriptionTier, expiryDate: string | null = null) => {
    const newSubscription: Subscription = {
      tier: newTier,
      expiryDate,
    };

    try {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(newSubscription));
      setSubscription(newSubscription);
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }, []);

  const clearSubscription = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
      setSubscription(DEFAULT_SUBSCRIPTION);
    } catch (error) {
      console.error('Error clearing subscription:', error);
    }
  }, []);

  return {
    subscription,
    loading,
    updateSubscription,
    clearSubscription,
  };
};
