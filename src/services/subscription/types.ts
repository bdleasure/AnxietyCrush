export enum SubscriptionTier {
  FREE = 'FREE',
  CORE = 'CORE',              // $39 Core App
  MASTER = 'MASTER',          // $79 Master Tier
  OPTIMIZER = 'OPTIMIZER'     // $29 Daily Optimizer
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  requiredTier: SubscriptionTier;
  category: FeatureCategory;
}

export enum FeatureCategory {
  REALITY_WAVE = 'REALITY_WAVE',
  ANALYTICS = 'ANALYTICS',
  KNOWLEDGE = 'KNOWLEDGE',
  DAILY_POWER = 'DAILY_POWER',
  PRO_FEATURES = 'PRO_FEATURES'
}

export interface AudioTrackAccess {
  id: string;
  name: string;
  requiredTier: SubscriptionTier;
  duration: number;
  category: string;
  isPreview?: boolean;
}
