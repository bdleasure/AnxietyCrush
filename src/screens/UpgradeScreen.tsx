import React, { useState } from 'react';
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
    tier: SubscriptionTier.CORE,
    name: 'Reality Wave™',
    price: '$39',
    description: 'Transform anxiety with core reality-bending protocols',
    features: [
      { title: '11-Minute Anxiety Crusher™', included: true },
      { title: '3-Minute Emergency Reset', included: true },
      { title: '30-Minute Deep Programming', included: true },
      { title: 'Reality Command Center', included: true },
      { title: 'Progress Analytics', included: true },
      { title: 'Pattern Recognition AI', included: false },
      { title: 'Life Mastery Waves', included: false },
    ],
    popular: true,
  },
  {
    tier: SubscriptionTier.MASTER,
    name: 'Master System',
    price: '$79',
    description: 'Advanced mastery with situation-specific protocols',
    features: [
      { title: 'All Core Features', included: true },
      { title: 'Life Mastery Waves', included: true },
      { title: 'Situation Mastery Suite', included: true },
      { title: 'Pattern Recognition AI', included: true },
      { title: 'Custom Wave Lab', included: true },
      { title: 'Advanced Analytics', included: true },
      { title: 'Daily Power System', included: false },
    ],
  },
  {
    tier: SubscriptionTier.OPTIMIZER,
    name: 'Daily Optimizer',
    price: '$29',
    description: 'Daily power routines for consistent results',
    features: [
      { title: 'Morning Reality Field', included: true },
      { title: 'Daytime Control Suite', included: true },
      { title: 'Evening Integration', included: true },
      { title: 'Quick Reality Checks', included: true },
      { title: 'Pattern Interrupts', included: true },
      { title: 'Success Amplifiers', included: true },
      { title: 'Advanced Features', included: false },
    ],
  },
];

export const UpgradeScreen: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);

  const handleUpgrade = (plan: SubscriptionPlan) => {
    Alert.alert(
      'Coming Soon',
      'In-app purchases will be available in the next update. Stay tuned!',
      [{ text: 'OK' }]
    );
  };

  const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => {
    const isSelected = selectedPlan === plan.tier;

    return (
      <TouchableOpacity
        style={[styles.planCard, isSelected && styles.selectedCard]}
        onPress={() => setSelectedPlan(plan.tier)}
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
              <View key={index} style={styles.featureItem}>
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
            onPress={() => handleUpgrade(plan)}
          >
            <Text style={styles.upgradeButtonText}>
              {isSelected ? 'Confirm Selection' : 'Select Plan'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
          <PlanCard key={plan.tier} plan={plan} />
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
