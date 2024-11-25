import React, { useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SubscriptionTier } from '../services/subscription/types';

const { width } = Dimensions.get('window');

interface Feature {
  title: string;
  subtitle: string;
  included: boolean;
}

interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: string;
  description: string;
  features: Feature[];
  popular?: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: SubscriptionTier.PREMIUM,
    name: 'AnxietyCrush Reality System',
    price: '$39',
    description: 'Transform anxiety into reality-bending power with our revolutionary Reality Wave technology',
    features: [
      { 
        title: '11-Minute Anxiety Crusher™',
        subtitle: 'Primary Reality Wave',
        included: true 
      },
      { 
        title: '3-Minute Emergency Crush™',
        subtitle: 'Instant Reset Protocol',
        included: true 
      },
      { 
        title: '30-Minute Deep Reality Programming™',
        subtitle: 'Overnight Transformation',
        included: true 
      },
      { 
        title: 'Reality Command Center',
        subtitle: 'Track Your Transformation',
        included: true 
      },
      { 
        title: 'Smart Onboarding Journey',
        subtitle: '7-Day Anxiety Crushing Path',
        included: true 
      },
      { 
        title: 'Knowledge Center Access',
        subtitle: 'Science of Reality Waves',
        included: true 
      },
      { 
        title: 'Pattern Recognition AI',
        subtitle: 'Intelligent Progress Tracking',
        included: true 
      },
    ],
    popular: true,
  },
  {
    tier: SubscriptionTier.MASTER,
    name: 'AnxietyCrush Master',
    price: '$79',
    description: 'Advanced mastery with situation-specific protocols and life transformation waves',
    features: [
      { 
        title: 'All Reality System Features',
        subtitle: 'Core Features Included',
        included: true 
      },
      { 
        title: 'Life Mastery Waves',
        subtitle: 'Money, Relationships, Career & Health',
        included: true 
      },
      { 
        title: 'Situation Mastery Suite',
        subtitle: 'Social, Speaking & Decision Power',
        included: true 
      },
      { 
        title: 'Custom Wave Lab',
        subtitle: 'Personal Wave Builder',
        included: true 
      },
      { 
        title: 'Advanced Analytics',
        subtitle: 'Deep Pattern AI & Success Prediction',
        included: true 
      },
      { 
        title: 'Deep Transformation',
        subtitle: 'Fear to Power Protocols',
        included: true 
      },
      { 
        title: 'Daily Power System',
        subtitle: 'Morning, Day & Evening Optimization',
        included: false 
      },
    ],
  },
  {
    tier: SubscriptionTier.OPTIMIZER,
    name: 'Daily Reality Optimizer',
    price: '$29',
    description: 'Daily power routines for consistent reality control and anxiety mastery',
    features: [
      { 
        title: 'Morning Reality Field',
        subtitle: 'Start Strong Protocol',
        included: true 
      },
      { 
        title: 'Daytime Control Suite',
        subtitle: 'Reality Checks & Pattern Interrupts',
        included: true 
      },
      { 
        title: 'Evening Integration',
        subtitle: 'Sleep Field & Reality Mapping',
        included: true 
      },
      { 
        title: 'Quick Reality Checks',
        subtitle: 'Instant Resets',
        included: true 
      },
      { 
        title: 'Pattern Interrupts',
        subtitle: 'Instant Anxiety Control',
        included: true 
      },
      { 
        title: 'Success Amplifiers',
        subtitle: 'Daily Power Boosters',
        included: true 
      },
      { 
        title: 'Advanced Features',
        subtitle: 'Master System Tools',
        included: true 
      },
    ],
  },
];

interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: (tier: SubscriptionTier) => void;
  onUpgrade: (plan: SubscriptionPlan) => void;
}

const PlanCard = memo(({ plan, isSelected, onSelect, onUpgrade }: PlanCardProps) => {
  const cardId = `plan-${plan.tier.toLowerCase()}`;
  
  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.selectedCard]}
      onPress={() => onSelect(plan.tier)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>{plan.price}</Text>
        </View>

        <Text style={styles.planDescription}>{plan.description}</Text>

        <View style={styles.featuresList}>
          {plan.features.map((feature, index) => (
            <View 
              key={`${cardId}-feature-${index}`}
              style={styles.featureItem}
            >
              <Ionicons
                name={feature.included ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={feature.included ? colors.accent : colors.textSecondary}
                style={styles.featureIcon}
              />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.upgradeButton, isSelected && styles.selectedButton]}
          onPress={() => onUpgrade(plan)}
        >
          <Text style={styles.upgradeButtonText}>
            {isSelected ? 'Start Your Reality Shift' : 'Select Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

export const UpgradeScreen: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);

  const handleUpgrade = useCallback((plan: SubscriptionPlan) => {
    Alert.alert(
      'Coming Soon',
      'In-app purchases will be available in the next update. Stay tuned!',
      [{ text: 'OK' }]
    );
  }, []);

  const handleSelect = useCallback((tier: SubscriptionTier) => {
    setSelectedPlan(tier);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade Your Reality</Text>
        <Text style={styles.subtitle}>Choose your transformation path</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SUBSCRIPTION_PLANS.map((plan) => (
          <View key={`plan-container-${plan.tier.toLowerCase()}`}>
            <PlanCard
              plan={plan}
              isSelected={selectedPlan === plan.tier}
              onSelect={handleSelect}
              onUpgrade={handleUpgrade}
            />
          </View>
        ))}

        <View style={styles.guaranteeSection}>
          <Ionicons name="shield-checkmark" size={24} color={colors.accent} />
          <Text style={styles.guaranteeText}>
            30-Day Reality Shift Guarantee
          </Text>
          <Text style={styles.guaranteeDescription}>
            Experience your first reality shift or get double your money back
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  planCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
    borderColor: colors.accent,
    borderWidth: 2,
  },
  cardContent: {
    padding: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  popularText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 12,
    marginTop: 24,
  },
  planName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  planPrice: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  planDescription: {
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  featureSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  upgradeButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  selectedButton: {
    backgroundColor: colors.accent,
  },
  upgradeButtonText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  guaranteeSection: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  guaranteeDescription: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
