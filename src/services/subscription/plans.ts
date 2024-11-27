import { SubscriptionTier } from './types';

interface Feature {
  title: string;
  subtitle: string;
  included: boolean;
  details?: string;
  technical?: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: string;
  description: string;
  features: Feature[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: SubscriptionTier.CORE,
    name: 'Core Reality Wave™',
    price: '$39',
    description: 'Transform anxiety into reality-bending power with our signature Reality Wave technology',
    features: [
      { 
        title: 'Anxiety Crusher™ (11 min)',
        subtitle: 'Transform anxiety into reality-bending power',
        included: true,
        details: 'Our signature Reality Wave frequency (10 Hz Alpha) helps rewire your anxiety response into focused clarity. Perfect for daily transformation.',
        technical: 'Precision-engineered Alpha frequency with optional ambient background'
      },
      { 
        title: 'Emergency Reset™ (3 min)',
        subtitle: 'Quick anxiety pattern interrupt',
        included: true,
        details: 'Rapid reset protocol for immediate anxiety relief. Use whenever you need instant clarity.',
        technical: 'Concentrated Reality Wave burst for fast results'
      }
    ],
    popular: true,
  },
  {
    tier: SubscriptionTier.ADVANCED,
    name: 'Advanced Package',
    price: '$79',
    description: 'Advanced mastery with deep programming and peak performance protocols',
    features: [
      { 
        title: 'Deep Reality Programming™ (30 min)',
        subtitle: 'Overnight transformation protocol',
        included: true,
        details: 'Extended Reality Wave session designed for deep mental reprogramming during sleep',
        technical: 'Progressive frequency pattern optimized for sleep cycles'
      },
      { 
        title: 'Success Field Generator™ (15 min)',
        subtitle: 'Peak performance state activation',
        included: true,
        details: 'Advanced frequency blend for important moments requiring total clarity',
        technical: 'Multi-layer Reality Wave combination for enhanced results'
      },
      {
        title: 'Core Reality Wave™ Package',
        subtitle: 'All Core features included',
        included: true
      }
    ]
  },
  {
    tier: SubscriptionTier.DAILY,
    name: 'Daily Optimizer',
    price: '$29',
    description: 'Optimize your daily reality with morning and evening protocols',
    features: [
      { 
        title: 'Morning Reality Field™ (7 min)',
        subtitle: 'Start Strong Protocol',
        included: true,
        details: 'Morning activation sequence to set your day\'s reality pattern',
        technical: 'Awakening frequency blend with energy optimization'
      },
      { 
        title: 'Evening Integration™ (10 min)',
        subtitle: 'Sleep Field & Reality Mapping',
        included: true,
        details: 'Evening protocol for deep regenerative sleep and reality integration',
        technical: 'Calming frequency pattern for optimal rest'
      },
      {
        title: 'Core Reality Wave™ Package',
        subtitle: 'All Core features included',
        included: true
      }
    ]
  }
];
