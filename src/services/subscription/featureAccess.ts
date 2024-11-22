import { SubscriptionTier, Feature, FeatureCategory, AudioTrackAccess } from './types';
import { SESSION_DESCRIPTIONS } from '../../constants/strings';

// Define available tracks with their access requirements
export const AUDIO_TRACKS: AudioTrackAccess[] = [
  {
    id: 'anxiety-relief',
    name: 'Anxiety Crusher™',
    description: SESSION_DESCRIPTIONS.ANXIETY_CRUSHER,
    duration: 11,
    requiredTier: SubscriptionTier.FREE,
  },
  {
    id: 'emergency-reset',
    name: 'Emergency Reset™',
    description: SESSION_DESCRIPTIONS.EMERGENCY_RESET,
    duration: 3,
    requiredTier: SubscriptionTier.FREE,
  },
  {
    id: 'deep-reality',
    name: 'Deep Reality Programming™',
    description: SESSION_DESCRIPTIONS.DEEP_REALITY,
    duration: 30,
    requiredTier: SubscriptionTier.PREMIUM,
  },
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

  setSubscriptionTier(tier: SubscriptionTier) {
    this.userTier = tier;
  }

  getCurrentTier(): SubscriptionTier {
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
    
    const tierLevel = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.PREMIUM]: 1,
    };
    
    return tierLevel[this.userTier] >= tierLevel[track.requiredTier];
  }

  getAvailableTracks(): AudioTrackAccess[] {
    return AUDIO_TRACKS.filter(track => this.hasAccessToTrack(track.id));
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
