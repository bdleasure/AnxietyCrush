export enum SubscriptionTier {
  FREE = 'Free',
  PREMIUM = 'Premium',
  MASTER = 'Master',
  OPTIMIZER = 'Optimizer'
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
  subtitle: string;
  duration: number;
  requiredTier: SubscriptionTier;
  category: string;
}
