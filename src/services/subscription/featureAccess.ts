import { SubscriptionTier, Feature, FeatureCategory, AudioTrackAccess } from './types';
import { SESSION_DESCRIPTIONS, SESSION_SUBTITLES } from '../../constants/strings';
import { Alert } from 'react-native';
import { BONUS_TRACKS } from '../../constants/tracks';

// Define available tracks with their access requirements
export const AUDIO_TRACKS: AudioTrackAccess[] = [
  {
    id: 'anxiety-relief',
    name: 'Anxiety Crusher™',
    description: SESSION_DESCRIPTIONS.ANXIETY_CRUSHER,
    subtitle: SESSION_SUBTITLES.ANXIETY_CRUSHER,
    duration: 11,
    requiredTier: SubscriptionTier.FREE,
    category: 'Reality Waves'
  },
  {
    id: 'emergency-reset',
    name: 'Emergency Reset™',
    description: SESSION_DESCRIPTIONS.EMERGENCY_RESET,
    subtitle: SESSION_SUBTITLES.EMERGENCY_RESET,
    duration: 3,
    requiredTier: SubscriptionTier.FREE,
    category: 'Reality Waves'
  },
  {
    id: 'deep-reality',
    name: 'Deep Reality Programming™',
    description: SESSION_DESCRIPTIONS.DEEP_REALITY,
    subtitle: SESSION_SUBTITLES.DEEP_REALITY,
    duration: 30,
    requiredTier: SubscriptionTier.PREMIUM,
    category: 'Reality Waves'
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

export const showUpgradeDialog = (navigation: any) => {
  Alert.alert(
    'Premium Content',
    'This session is only available to premium subscribers. Upgrade now to unlock all premium content!',
    [
      { text: 'Not Now', style: 'cancel' },
      { 
        text: 'Upgrade',
        onPress: () => navigation.navigate('Subscription')
      }
    ]
  );
};

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
    const track = AUDIO_TRACKS.find(t => t.id === trackId) || BONUS_TRACKS.find(t => t.id === trackId);
    if (!track) return false;
    
    // If the track is free, everyone has access
    if (track.requiredTier === SubscriptionTier.FREE) {
      return true;
    }
    
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
