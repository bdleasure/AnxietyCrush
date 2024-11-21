import { SubscriptionTier, Feature, FeatureCategory, AudioTrackAccess } from './types';

// Define available tracks with their access requirements
export const AUDIO_TRACKS: AudioTrackAccess[] = [
  // Core Wave Protocols
  {
    id: 'anxiety-crusher-11',
    name: '11-Minute Anxiety Crusher™',
    requiredTier: SubscriptionTier.CORE,
    duration: 11,
    category: 'Core Wave',
    isPreview: true
  },
  {
    id: 'emergency-crush-3',
    name: '3-Minute Emergency Crush™',
    requiredTier: SubscriptionTier.CORE,
    duration: 3,
    category: 'Core Wave'
  },
  {
    id: 'deep-reality-30',
    name: '30-Minute Deep Reality Programming™',
    requiredTier: SubscriptionTier.CORE,
    duration: 30,
    category: 'Core Wave'
  },
  
  // Master Tier Tracks
  {
    id: 'money-anxiety-crusher',
    name: 'Money Anxiety Crusher',
    requiredTier: SubscriptionTier.MASTER,
    duration: 15,
    category: 'Life Mastery'
  },
  {
    id: 'relationship-reality',
    name: 'Relationship Reality Shift',
    requiredTier: SubscriptionTier.MASTER,
    duration: 20,
    category: 'Life Mastery'
  },
  
  // Daily Optimizer Tracks
  {
    id: 'morning-reality',
    name: 'Morning Reality Field Activation',
    requiredTier: SubscriptionTier.OPTIMIZER,
    duration: 10,
    category: 'Daily Power'
  }
];

// Define features with their access requirements
export const FEATURES: Feature[] = [
  {
    id: 'reality-command',
    name: 'Reality Command Center',
    description: 'Track your anxiety reduction metrics and reality shifts',
    requiredTier: SubscriptionTier.CORE,
    category: FeatureCategory.ANALYTICS
  },
  {
    id: 'pattern-ai',
    name: 'Pattern Recognition AI',
    description: 'Advanced AI-powered pattern recognition',
    requiredTier: SubscriptionTier.MASTER,
    category: FeatureCategory.PRO_FEATURES
  },
  {
    id: 'daily-optimizer',
    name: 'Daily Power System',
    description: 'Complete daily reality optimization system',
    requiredTier: SubscriptionTier.OPTIMIZER,
    category: FeatureCategory.DAILY_POWER
  }
];

class FeatureAccess {
  private userTier: SubscriptionTier = SubscriptionTier.FREE;

  setUserTier(tier: SubscriptionTier) {
    this.userTier = tier;
  }

  getUserTier(): SubscriptionTier {
    return this.userTier;
  }

  // Check if user has access to a specific feature
  hasAccessToFeature(featureId: string): boolean {
    const feature = FEATURES.find(f => f.id === featureId);
    if (!feature) return false;

    const tierLevels = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.CORE]: 1,
      [SubscriptionTier.MASTER]: 2,
      [SubscriptionTier.OPTIMIZER]: 3
    };

    return tierLevels[this.userTier] >= tierLevels[feature.requiredTier];
  }

  // Check if user has access to a specific audio track
  hasAccessToTrack(trackId: string): boolean {
    const track = AUDIO_TRACKS.find(t => t.id === trackId);
    if (!track) return false;

    // Free users can access preview tracks
    if (this.userTier === SubscriptionTier.FREE && track.isPreview) {
      return true;
    }

    const tierLevels = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.CORE]: 1,
      [SubscriptionTier.MASTER]: 2,
      [SubscriptionTier.OPTIMIZER]: 3
    };

    return tierLevels[this.userTier] >= tierLevels[track.requiredTier];
  }

  // Get all available tracks for current user
  getAvailableTracks(): AudioTrackAccess[] {
    return AUDIO_TRACKS.filter(track => 
      this.hasAccessToTrack(track.id)
    );
  }

  // Get all available features for current user
  getAvailableFeatures(): Feature[] {
    return FEATURES.filter(feature => 
      this.hasAccessToFeature(feature.id)
    );
  }

  // Get locked features that require upgrade
  getLockedFeatures(): Feature[] {
    return FEATURES.filter(feature => 
      !this.hasAccessToFeature(feature.id)
    );
  }

  // Get next available upgrade tier
  getNextUpgradeTier(): SubscriptionTier | null {
    const tierOrder = [
      SubscriptionTier.FREE,
      SubscriptionTier.CORE,
      SubscriptionTier.MASTER,
      SubscriptionTier.OPTIMIZER
    ];
    
    const currentIndex = tierOrder.indexOf(this.userTier);
    if (currentIndex === tierOrder.length - 1) return null;
    
    return tierOrder[currentIndex + 1];
  }
}

export const featureAccess = new FeatureAccess();
