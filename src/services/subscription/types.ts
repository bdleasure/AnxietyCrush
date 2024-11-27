export enum SubscriptionTier {
  FREE = 'Free',  // Bonus materials only
  ESSENTIALS = 'Reality Wave™ Essentials',  // $39 package
  ADVANCED = 'Advanced Reality Wave™ System',
  DAILY = 'Daily Reality Control'
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
  detailedDescription?: string;
  technicalDetails?: string;
  subtitle: string;
  duration: number;
  requiredTier: SubscriptionTier;
  category: string;
  audioUrl: string;
}
