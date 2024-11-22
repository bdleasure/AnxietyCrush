export enum SubscriptionTier {
  FREE = 'Free',
  PREMIUM = 'Premium',
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  requiredTier: SubscriptionTier;
}

export enum FeatureCategory {
  AUDIO = 'Audio',
  TRACKING = 'Tracking',
  ANALYSIS = 'Analysis',
  COMMUNITY = 'Community',
}

export interface AudioTrackAccess {
  id: string;
  name: string;
  description: string;
  duration: number;
  requiredTier: SubscriptionTier;
}
