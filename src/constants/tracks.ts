import { AudioTrackAccess } from '../services/subscription/types';
import { SubscriptionTier } from '../services/subscription/types';

export const BONUS_TRACKS: AudioTrackAccess[] = [
  {
    id: 'success-pattern',
    name: 'Success Pattern Activator™',
    duration: 600,
    description: 'Activate your natural success patterns',
    requiredTier: SubscriptionTier.FREE,
    audioUrl: 'success-pattern.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Unlock your natural success patterns'
  },
  {
    id: 'focus-field',
    name: 'Focus Field Generator™',
    duration: 420,
    description: 'Generate laser-sharp focus instantly',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'focus-field.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Achieve peak mental clarity'
  },
  {
    id: 'sleep-wave',
    name: 'Sleep Enhancement Wave™',
    duration: 600,
    description: 'Enhance your sleep quality naturally',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'sleep-wave.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Experience deep, restorative sleep'
  }
];
