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
    description: 'Transform anxiety into reality-bending power',
    detailedDescription: 'Our signature Reality Wave frequency (10 Hz Alpha) helps rewire your anxiety response into focused clarity. Perfect for daily transformation.',
    technicalDetails: 'Precision-engineered Alpha frequency with optional ambient background',
    subtitle: 'Primary Reality Wave Technology',
    duration: 11,
    requiredTier: SubscriptionTier.FREE,  // Base package - already unlocked
    category: 'Core Reality Wave',
    audioUrl: 'anxiety-crusher.mp3'
  },
  {
    id: 'emergency-reset',
    name: 'Emergency Reset™',
    description: 'Quick anxiety pattern interrupt',
    detailedDescription: 'Rapid reset protocol for immediate anxiety relief. Use whenever you need instant clarity.',
    technicalDetails: 'Concentrated Reality Wave burst for fast results',
    subtitle: 'Instant Pattern Interrupt',
    duration: 3,
    requiredTier: SubscriptionTier.FREE,  // Base package - already unlocked
    category: 'Core Reality Wave',
    audioUrl: 'emergency-reset.mp3'
  },
  // Bonus Content (Free)
  ...BONUS_TRACKS.map(track => ({
    ...track,
    requiredTier: SubscriptionTier.FREE  // All bonus content is free
  })),
  // Advanced Package
  {
    id: 'deep-programming',
    name: 'Deep Reality Programming™',
    description: 'Overnight transformation protocol',
    detailedDescription: 'Extended Reality Wave session designed for deep mental reprogramming during sleep',
    technicalDetails: 'Progressive frequency pattern optimized for sleep cycles',
    subtitle: 'Deep Neural Repatterning',
    duration: 30,
    requiredTier: SubscriptionTier.ADVANCED,
    category: 'Advanced Reality Wave',
    audioUrl: 'deep-programming.mp3'
  },
  {
    id: 'success-field-generator',
    name: 'Success Field Generator™',
    description: 'Peak performance state activation',
    detailedDescription: 'Advanced frequency blend for important moments requiring total clarity',
    technicalDetails: 'Multi-layer Reality Wave combination for enhanced results',
    subtitle: 'Peak State Activation',
    duration: 15,
    requiredTier: SubscriptionTier.ADVANCED,
    category: 'Advanced Reality Wave',
    audioUrl: 'success-field-generator.mp3'
  },
  // Daily Optimizer Package
  {
    id: 'morning-reality-field',
    name: 'Morning Reality Field™',
    description: 'Start Strong Protocol',
    detailedDescription: 'Morning activation sequence to set your day\'s reality pattern',
    technicalDetails: 'Awakening frequency blend with energy optimization',
    subtitle: 'Morning Power Protocol',
    duration: 7,
    requiredTier: SubscriptionTier.DAILY,
    category: 'Daily Reality Control',
    audioUrl: 'morning-reality-field.mp3'
  },
  {
    id: 'evening-integration',
    name: 'Evening Integration™',
    description: 'Sleep Field & Reality Mapping',
    detailedDescription: 'Process your day and prepare for deep regenerative sleep',
    technicalDetails: 'Calming frequency pattern for optimal rest',
    subtitle: 'Evening Reset Protocol',
    duration: 10,
    requiredTier: SubscriptionTier.DAILY,
    category: 'Daily Reality Control',
    audioUrl: 'evening-integration.mp3'
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
