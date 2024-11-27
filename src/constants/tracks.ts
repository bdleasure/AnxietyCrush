import { AudioTrackAccess } from '../services/subscription/types';
import { SubscriptionTier } from '../services/subscription/types';

export const BONUS_TRACKS: AudioTrackAccess[] = [
  {
    id: 'success-field',
    name: 'Success Pattern Activator™',
    duration: 600,
    description: 'Activate your natural success patterns',
    requiredTier: SubscriptionTier.FREE,
    audioUrl: 'success-field-generator.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Unlock your natural success patterns'
  },
  {
    id: 'morning-field',
    name: 'Morning Reality Field™',
    duration: 420,
    description: 'Generate laser-sharp focus instantly',
    requiredTier: SubscriptionTier.FREE,
    audioUrl: 'morning-reality-field.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Start your day with peak mental clarity'
  },
  {
    id: 'evening-integration',
    name: 'Evening Integration Wave™',
    duration: 600,
    description: 'Enhance your sleep quality naturally',
    requiredTier: SubscriptionTier.PREMIUM,
    audioUrl: 'evening-integration.mp3',
    category: 'Bonus Reality Waves',
    subtitle: 'Experience deep, restorative sleep'
  }
];
