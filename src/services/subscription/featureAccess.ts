import { SubscriptionTier, Feature, FeatureCategory, AudioTrackAccess } from './types';
import { SESSION_DESCRIPTIONS, SESSION_SUBTITLES } from '../../constants/strings';
import { Alert } from 'react-native';
import { BONUS_TRACKS } from '../../constants/tracks';

// Define available tracks with their access requirements
export const AUDIO_TRACKS: AudioTrackAccess[] = [
  // Core Reality Wave Package (Base Package - Already Unlocked)
  {
    id: 'anxiety-crusher',
    name: 'Anxiety Crusher™',
    description: 'Transform anxiety into reality-bending power with our signature Reality Wave frequency',
    subtitle: 'Our signature Reality Wave frequency (10 Hz Alpha) helps rewire your anxiety response',
    duration: 11,
    requiredTier: SubscriptionTier.FREE,  // Base package - already unlocked
    category: 'Core Reality Wave'
  },
  {
    id: 'emergency-reset',
    name: 'Emergency Reset™',
    description: 'Quick anxiety pattern interrupt for immediate relief',
    subtitle: 'Rapid reset protocol for instant clarity',
    duration: 3,
    requiredTier: SubscriptionTier.FREE,  // Base package - already unlocked
    category: 'Core Reality Wave'
  },
  // Bonus Content (Free)
  ...BONUS_TRACKS.map(track => ({
    ...track,
    requiredTier: SubscriptionTier.FREE  // All bonus content is free
  })),
  // Advanced Package
  {
    id: 'deep-reality',
    name: 'Deep Reality Programming™',
    description: 'Overnight transformation protocol for deep mental reprogramming',
    subtitle: 'Progressive frequency pattern optimized for sleep cycles',
    duration: 30,
    requiredTier: SubscriptionTier.ADVANCED,
    category: 'Advanced Reality Wave'
  },
  {
    id: 'success-field',
    name: 'Success Field Generator™',
    description: 'Peak performance state activation for total clarity',
    subtitle: 'Multi-layer Reality Wave combination for enhanced results',
    duration: 15,
    requiredTier: SubscriptionTier.ADVANCED,
    category: 'Advanced Reality Wave'
  },
  // Daily Optimizer Package
  {
    id: 'morning-field',
    name: 'Morning Reality Field™',
    description: 'Start Strong Protocol for daily reality pattern setting',
    subtitle: 'Awakening frequency blend with energy optimization',
    duration: 7,
    requiredTier: SubscriptionTier.DAILY,
    category: 'Daily Optimizer'
  },
  {
    id: 'evening-integration',
    name: 'Evening Integration™',
    description: 'Sleep Field & Reality Mapping for deep regenerative sleep',
    subtitle: 'Calming frequency pattern for optimal rest',
    duration: 10,
    requiredTier: SubscriptionTier.DAILY,
    category: 'Daily Optimizer'
  }
];

// Define features with their access requirements
export const FEATURES: Feature[] = [
  {
    id: 'core-wave',
    name: 'Core Reality Wave™',
    description: 'Transform anxiety into reality-bending power',
    requiredTier: SubscriptionTier.FREE,  // Base package - already unlocked
    category: FeatureCategory.AUDIO
  },
  {
    id: 'bonus-content',
    name: 'Bonus Content',
    description: 'Additional reality wave sessions',
    requiredTier: SubscriptionTier.FREE,  // All bonus content is free
    category: FeatureCategory.AUDIO
  },
  {
    id: 'advanced-wave',
    name: 'Advanced Reality Wave™',
    description: 'Deep programming and peak performance protocols',
    requiredTier: SubscriptionTier.ADVANCED,
    category: FeatureCategory.AUDIO
  },
  {
    id: 'daily-optimizer',
    name: 'Daily Optimizer',
    description: 'Morning and evening optimization protocols',
    requiredTier: SubscriptionTier.DAILY,
    category: FeatureCategory.AUDIO
  }
];

class FeatureAccess {
  private userTier: SubscriptionTier = SubscriptionTier.FREE;  // Everyone starts with Core package

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
      [SubscriptionTier.FREE]: 0,     // Base level - includes Core Reality Wave and Bonus content
      [SubscriptionTier.ADVANCED]: 1,  // Advanced package
      [SubscriptionTier.DAILY]: 2     // Daily optimizer package
    };

    return tierLevels[this.userTier] >= tierLevels[feature.requiredTier];
  }

  // Check if user has access to a specific audio track
  hasAccessToTrack(trackId: string): boolean {
    const track = AUDIO_TRACKS.find(t => t.id === trackId);
    if (!track) {
      console.warn(`Track ${trackId} not found`);
      return true;
    }
    
    const tierLevel = {
      [SubscriptionTier.FREE]: 0,     // Base level - includes Core Reality Wave and Bonus content
      [SubscriptionTier.ADVANCED]: 1,  // Advanced package
      [SubscriptionTier.DAILY]: 2     // Daily optimizer package
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
      SubscriptionTier.ADVANCED,
      SubscriptionTier.DAILY
    ];
    
    const currentIndex = tierOrder.indexOf(this.userTier);
    if (currentIndex === tierOrder.length - 1) return null;
    
    return tierOrder[currentIndex + 1];
  }
}

export const featureAccess = new FeatureAccess();

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
