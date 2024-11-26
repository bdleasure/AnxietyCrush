import { useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { SubscriptionTier } from '../services/subscription/types';

export const useFeatureAccess = () => {
  const { subscription } = useSubscription();

  const hasAccessToTrack = useCallback((trackId: string) => {
    // If user has premium subscription, they have access to all tracks
    if (subscription.tier === SubscriptionTier.PREMIUM) {
      return true;
    }

    // Free tracks are accessible to everyone
    if (trackId.startsWith('free_')) {
      return true;
    }

    // Basic tier users have access to basic tracks
    if (subscription.tier === SubscriptionTier.BASIC && trackId.startsWith('basic_')) {
      return true;
    }

    return false;
  }, [subscription.tier]);

  return {
    hasAccessToTrack,
  };
};
