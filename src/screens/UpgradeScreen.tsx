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

interface PlanFeature {
  title: string;
  included: boolean;
}

interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: SubscriptionTier.PREMIUM,
    name: 'Reality Wave™',
    price: '$39',
    description: 'Transform anxiety with core reality-bending protocols',
    features: [
      { title: '11-Minute Anxiety Crusher™', included: true },
      { title: '3-Minute Emergency Reset', included: true },
      { title: '30-Minute Deep Programming', included: true },
      { title: 'Reality Command Center', included: true },
      { title: 'Progress Analytics', included: true },
      { title: 'Pattern Recognition AI', included: true },
      { title: 'Life Mastery Waves', included: true },
    ],
    popular: true,
  },
  {
    tier: SubscriptionTier.FREE,
    name: 'Free Trial',
    price: '$0',
    description: 'Experience the basics of anxiety control',
    features: [
      { title: '11-Minute Anxiety Crusher™', included: true },
      { title: '3-Minute Emergency Reset', included: true },
      { title: '30-Minute Deep Programming', included: false },
      { title: 'Reality Command Center', included: false },
      { title: 'Progress Analytics', included: false },
      { title: 'Pattern Recognition AI', included: false },
      { title: 'Life Mastery Waves', included: false },
    ],
  }
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
              <Text style={styles.featureText}>{feature.title}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.upgradeButton, isSelected && styles.selectedButton]}
          onPress={() => onUpgrade(plan)}
        >
          <Text style={styles.upgradeButtonText}>
            {isSelected ? 'Confirm Selection' : 'Select Plan'}
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
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  planDescription: {
    fontSize: 11,
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
  featureText: {
    fontSize: 11,
    color: colors.textPrimary,
    flex: 1,
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
    fontSize: 13,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  guaranteeDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
