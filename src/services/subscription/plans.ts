import { SubscriptionTier } from './types';

interface Feature {
  title: string;
  subtitle: string;
  included: boolean;
  details?: string;
  perfectFor?: string;
  keyBenefit?: string;
  technical?: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: string;
  description: string;
  features: Feature[];
  positioning?: string;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: SubscriptionTier.CORE,
    name: 'Reality Wave™ Essentials',
    price: '$39',
    description: 'Core Audio Files',
    positioning: 'Your essential toolkit for transforming anxiety into reality-bending power',
    features: [
      { 
        title: 'Anxiety Crusher™ (11 minutes)',
        subtitle: 'Transform anxiety into reality-bending power with our primary Reality Wave frequency',
        included: true,
        perfectFor: 'Daily anxiety transformation',
        keyBenefit: 'Core reality shifting',
        details: 'Our signature Reality Wave frequency (10 Hz Alpha) helps rewire your anxiety response into focused clarity. Perfect for daily transformation.',
        technical: 'Precision-engineered Alpha frequency with optional ambient background'
      },
      { 
        title: 'Emergency Reset™ (3 minutes)',
        subtitle: 'Instant pattern interrupt for immediate clarity',
        included: true,
        perfectFor: 'Urgent anxiety moments',
        keyBenefit: 'Quick relief',
        details: 'Rapid reset protocol for immediate anxiety relief. Use whenever you need instant clarity.',
        technical: 'Concentrated Reality Wave burst for fast results'
      }
    ],
    popular: true,
  },
  {
    tier: SubscriptionTier.ADVANCED,
    name: 'Advanced Reality Wave™ System',
    price: '$79',
    description: 'Includes Basic Package Plus:',
    positioning: 'Master-level frequencies for complete anxiety transformation and reality control',
    features: [
      { 
        title: 'Deep Reality Programming™ (30 minutes)',
        subtitle: 'Overnight transformation protocol for deep anxiety reprogramming',
        included: true,
        perfectFor: 'Deep mental repatterning',
        keyBenefit: 'Long-term transformation'
      },
      {
        title: 'Success Field Generator™ (15 minutes)',
        subtitle: 'Advanced frequency blend for peak performance states',
        included: true,
        perfectFor: 'Important meetings/presentations',
        keyBenefit: 'Performance enhancement'
      }
    ]
  },
  {
    tier: SubscriptionTier.DAILY,
    name: 'Daily Reality Control',
    price: '$29',
    description: 'Daily power routines for optimal reality control',
    positioning: 'Daily power routines for consistent reality control',
    features: [
      {
        title: 'Morning Reality Field™ (7 minutes)',
        subtitle: 'Start your day in a peak reality-bending state',
        included: true,
        perfectFor: 'Morning routine',
        keyBenefit: 'Day optimization'
      },
      {
        title: 'Evening Integration Wave™ (10 minutes)',
        subtitle: 'Process your day and prepare for regenerative sleep',
        included: true,
        perfectFor: 'Evening wind-down',
        keyBenefit: 'Sleep enhancement'
      }
    ]
  }
];
