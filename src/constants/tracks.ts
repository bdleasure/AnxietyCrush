import { AudioTrackAccess } from '../services/subscription/types';
import { SubscriptionTier } from '../services/subscription/types';

export interface AudioTrackAccess {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  detailedDescription?: string;
  technicalDetails?: string;
  requiredTier: SubscriptionTier;
  audioUrl: string;
  category: string;
  subtitle: string;
}

// Core Reality Wave Package
export const CORE_TRACKS: AudioTrackAccess[] = [
  {
    id: 'anxiety-crusher',
    name: 'Anxiety Crusher',
    duration: 660, // 11 minutes
    description: 'Transform anxiety into reality-bending power',
    detailedDescription: 'Our signature Reality Wave frequency (10 Hz Alpha) helps rewire your anxiety response into focused clarity. Perfect for daily transformation.',
    technicalDetails: 'Precision-engineered Alpha frequency with optional ambient background',
    requiredTier: SubscriptionTier.CORE,
    audioUrl: 'anxiety-crusher.mp3',
    category: 'Core Reality Wave',
    subtitle: 'Primary Reality Wave Technology'
  },
  {
    id: 'emergency-reset',
    name: 'Emergency Reset',
    duration: 180, // 3 minutes
    description: 'Quick anxiety pattern interrupt',
    detailedDescription: 'Rapid reset protocol for immediate anxiety relief. Use whenever you need instant clarity.',
    technicalDetails: 'Concentrated Reality Wave burst for fast results',
    requiredTier: SubscriptionTier.CORE,
    audioUrl: 'emergency-reset.mp3',
    category: 'Core Reality Wave',
    subtitle: 'Instant Pattern Interrupt'
  }
];

// Advanced Package
export const ADVANCED_TRACKS: AudioTrackAccess[] = [
  {
    id: 'deep-programming',
    name: 'Deep Reality Programming',
    duration: 1800, // 30 minutes
    description: 'Overnight transformation protocol',
    detailedDescription: 'Extended Reality Wave session designed for deep mental reprogramming during sleep',
    technicalDetails: 'Progressive frequency pattern optimized for sleep cycles',
    requiredTier: SubscriptionTier.ADVANCED,
    audioUrl: 'deep-programming.mp3',
    category: 'Advanced Reality Wave',
    subtitle: 'Deep Neural Repatterning'
  },
  {
    id: 'success-field-generator',
    name: 'Success Field Generator',
    duration: 900, // 15 minutes
    description: 'Peak performance state activation',
    detailedDescription: 'Advanced frequency blend for important moments requiring total clarity',
    technicalDetails: 'Multi-layer Reality Wave combination for enhanced results',
    requiredTier: SubscriptionTier.ADVANCED,
    audioUrl: 'success-field-generator.mp3',
    category: 'Advanced Reality Wave',
    subtitle: 'Peak State Activation'
  }
];

// Daily Optimizer Package
export const DAILY_TRACKS: AudioTrackAccess[] = [
  {
    id: 'morning-reality-field',
    name: 'Morning Reality Field',
    duration: 420, // 7 minutes
    description: 'Start Strong Protocol',
    detailedDescription: 'Morning activation sequence to set your day\'s reality pattern',
    technicalDetails: 'Awakening frequency blend with energy optimization',
    requiredTier: SubscriptionTier.DAILY,
    audioUrl: 'morning-reality-field.mp3',
    category: 'Daily Reality Control',
    subtitle: 'Morning Power Protocol'
  },
  {
    id: 'evening-integration',
    name: 'Evening Integration',
    duration: 600, // 10 minutes
    description: 'Sleep Field & Reality Mapping',
    detailedDescription: 'Process your day and prepare for deep regenerative sleep',
    technicalDetails: 'Calming frequency pattern for optimal rest',
    requiredTier: SubscriptionTier.DAILY,
    audioUrl: 'evening-integration.mp3',
    category: 'Daily Reality Control',
    subtitle: 'Evening Reset Protocol'
  }
];

// Bonus Reality Waves
export const BONUS_TRACKS: AudioTrackAccess[] = [
  {
    id: 'success-field',
    name: 'Success Pattern Activator™',
    duration: 600, // 10 minutes
    description: 'Unlock your natural success frequency',
    detailedDescription: 'Advanced Reality Wave blend designed to activate dormant success patterns in your neural pathways. Perfect for high-stakes moments and breakthrough decisions.',
    technicalDetails: 'Multi-layered Alpha-Theta frequency combination with success pattern entrainment',
    requiredTier: SubscriptionTier.FREE,
    audioUrl: 'success-field-generator.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Success Pattern Activation'
  },
  {
    id: 'morning-field',
    name: 'Morning Reality Field™',
    duration: 420, // 7 minutes
    description: 'Generate laser-sharp focus instantly',
    detailedDescription: 'Start your day with crystal-clear mental clarity and reality-bending focus. Perfect for setting your day\'s success trajectory.',
    technicalDetails: 'Beta-enhanced Reality Wave pattern for optimal morning activation',
    requiredTier: SubscriptionTier.FREE,
    audioUrl: 'morning-reality-field.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Morning Focus Activation'
  },
  {
    id: 'evening-integration',
    name: 'Evening Integration Wave™',
    duration: 600, // 10 minutes
    description: 'Enhance your sleep quality naturally',
    detailedDescription: 'Convert daily stress into deep restorative sleep while programming tomorrow\'s reality. Perfect for optimal recovery and next-day preparation.',
    technicalDetails: 'Progressive Alpha-Delta blend for natural sleep enhancement',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'evening-integration.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Evening Reset Protocol'
  }
];
