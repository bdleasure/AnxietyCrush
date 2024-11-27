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
    category: 'Reality Wave Essentials',
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
    category: 'Reality Wave Essentials',
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
    detailedDescription: 'Deep mental repatterning for lasting change',
    requiredTier: SubscriptionTier.ADVANCED,
    audioUrl: 'deep-programming.mp3',
    category: 'Advanced Reality Wave System',
    subtitle: 'Deep Transformation Protocol'
  },
  {
    id: 'success-field-generator',
    name: 'Success Field Generator',
    duration: 900, // 15 minutes
    description: 'Peak performance state activation',
    detailedDescription: 'Advanced frequency blend for optimal performance',
    technicalDetails: 'Multi-layer Reality Wave combination for enhanced results',
    requiredTier: SubscriptionTier.ADVANCED,
    audioUrl: 'success-field-generator.mp3',
    category: 'Advanced Reality Wave System',
    subtitle: 'Performance Enhancement'
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

// Bonus tracks that are always free
export const BONUS_TRACKS: Omit<AudioTrackAccess, 'requiredTier'>[] = [
  {
    id: 'quick-reset',
    name: 'Quick Reset™',
    description: 'Fast anxiety relief in under 60 seconds',
    detailedDescription: 'Perfect for immediate anxiety relief when you need it most.',
    technicalDetails: 'Concentrated burst of calming frequencies',
    subtitle: 'Instant Relief',
    duration: 1,
    category: 'Bonus Reality Waves',
    audioUrl: 'quick-reset.mp3'
  }
];
