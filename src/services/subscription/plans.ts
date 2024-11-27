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
    tier: SubscriptionTier.ESSENTIALS,
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
    description: 'Advanced Audio Files',
    positioning: 'Advanced tools for deep neural reprogramming',
    features: [
      {
        title: 'Deep Reality Programming™ (30 minutes)',
        subtitle: 'Overnight transformation protocol',
        included: true,
        perfectFor: 'Deep mental reprogramming',
        keyBenefit: 'Neural rewiring',
        details: 'Extended Reality Wave session designed for deep mental reprogramming during sleep.',
        technical: 'Progressive frequency pattern optimized for sleep cycles'
      },
      {
        title: 'Success Field Generator™ (15 minutes)',
        subtitle: 'Peak performance state activation',
        included: true,
        perfectFor: 'Important moments',
        keyBenefit: 'Peak state access',
        details: 'Advanced frequency blend for important moments requiring total clarity.',
        technical: 'Multi-layer Reality Wave combination for enhanced results'
      }
    ]
  },
  {
    tier: SubscriptionTier.DAILY,
    name: 'Daily Reality Control',
    price: '$149',
    description: 'Daily Optimization Protocol',
    positioning: 'Complete daily system for reality optimization',
    features: [
      {
        title: 'Morning Reality Field™ (7 minutes)',
        subtitle: 'Start your day in peak state',
        included: true,
        perfectFor: 'Morning optimization',
        keyBenefit: 'Peak morning state',
        details: 'Morning optimization protocol for laser-sharp focus and clarity.',
        technical: 'Beta-enhanced Reality Wave pattern'
      },
      {
        title: 'Evening Integration Wave™ (10 minutes)',
        subtitle: 'Process and integrate your day',
        included: true,
        perfectFor: 'Evening wind-down',
        keyBenefit: 'Deep integration',
        details: 'Evening wind-down and sleep preparation for optimal recovery.',
        technical: 'Progressive Alpha-Delta blend'
      }
    ]
  }
];
