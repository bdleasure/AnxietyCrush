import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { H1, H2, H3, BodyMedium, BodySmall, BodyLarge } from '../components/Typography';
import { colors } from '../theme/colors';
import { SUBSCRIPTION_PLANS } from '../services/subscription/plans';
import { SubscriptionTier } from '../services/subscription/types';
import { usePurchase } from '../contexts/PurchaseContext';
import { useNavigation } from '@react-navigation/native';

// Create smaller versions of Typography components for the upgrade screen
const SmallH1 = ({ style, ...props }) => (
  <H1 {...props} style={[{ fontSize: 22 }, style]} />
);

const SmallH2 = ({ style, ...props }) => (
  <H2 {...props} style={[{ fontSize: 19 }, style]} />
);

const SmallH3 = ({ style, ...props }) => (
  <H3 {...props} style={[{ fontSize: 16 }, style]} />
);

const SmallBodyLarge = ({ style, ...props }) => (
  <BodyLarge {...props} style={[{ fontSize: 15 }, style]} />
);

const SmallBodyMedium = ({ style, ...props }) => (
  <BodyMedium {...props} style={[{ fontSize: 13 }, style]} />
);

const SmallBodySmall = ({ style, ...props }) => (
  <BodySmall {...props} style={[{ fontSize: 11 }, style]} />
);

const UpgradeScreen = () => {
  const navigation = useNavigation();
  const { currentTier, isLoading, purchaseTier, upgradeTier, hasDailyOptimizer, purchaseDailyOptimizer } = usePurchase();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  const handleSelect = useCallback((tier: SubscriptionTier) => {
    setSelectedPlan(tier);
  }, []);

  const handleUpgrade = async () => {
    if (!selectedPlan || processingPurchase) return;

    setProcessingPurchase(true);
    try {
      const result = currentTier
        ? await upgradeTier(selectedPlan)
        : await purchaseTier(selectedPlan);

      if (result.success) {
        navigation.goBack();
      }
    } finally {
      setProcessingPurchase(false);
    }
  };

  const handleDailyOptimizer = async () => {
    if (processingPurchase) return;

    setProcessingPurchase(true);
    try {
      const success = await purchaseDailyOptimizer();
      if (success) {
        navigation.goBack();
      }
    } finally {
      setProcessingPurchase(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <SmallH1 style={styles.title}>Transform Your Life</SmallH1>
          
          <View style={styles.valueProposition}>
            <SmallH2 style={styles.subtitle}> One-Time Investment, Lifetime of Peace</SmallH2>
            <SmallBodyMedium style={styles.description}>
              Take control of your anxiety today with our revolutionary reality wave technology. 
              Choose your perfect plan below and unlock lifetime access instantly - no subscriptions, 
              no recurring fees, just permanent transformation at your fingertips.
            </SmallBodyMedium>
            
            <View style={styles.benefitsList}>
              <SmallBodyMedium style={styles.benefit}> Pay once, own forever</SmallBodyMedium>
              <SmallBodyMedium style={styles.benefit}> No hidden fees or future charges</SmallBodyMedium>
              <SmallBodyMedium style={styles.benefit}> Instant access to premium audio sessions</SmallBodyMedium>
              <SmallBodyMedium style={styles.benefit}> All future updates included</SmallBodyMedium>
            </View>

            <View style={styles.guaranteeBox}>
              <SmallH3 style={styles.guaranteeTitle}>Your Journey to Peace Starts Here</SmallH3>
              <SmallBodyMedium style={styles.guaranteeText}>
                Join thousands who have already discovered the power of reality wave technology. 
                Unlock your full potential with a single investment in your mental wellbeing.
              </SmallBodyMedium>
            </View>
          </View>

          <SmallH2 style={styles.plansTitle}>Select Your Lifetime Access Plan</SmallH2>

          {SUBSCRIPTION_PLANS.map((plan) => (
            <View key={`plan-container-${plan.tier.toLowerCase()}`}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === plan.tier && styles.selectedPlan,
                  currentTier === plan.tier && styles.currentPlan,
                ]}
                onPress={() => handleSelect(plan.tier)}
                disabled={currentTier === plan.tier || processingPurchase}
              >
                <View style={styles.planHeader}>
                  <SmallH2 style={styles.planTitle}>{plan.name}</SmallH2>
                  <SmallBodyLarge style={styles.planPrice}>${plan.price}</SmallBodyLarge>
                </View>
                
                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <SmallBodyMedium style={styles.featureTitle}>✓ {feature.title}</SmallBodyMedium>
                      <SmallBodySmall style={styles.featureSubtitle}>{feature.subtitle}</SmallBodySmall>
                      {feature.details && (
                        <SmallBodySmall style={styles.featureDetails}>{feature.details}</SmallBodySmall>
                      )}
                    </View>
                  ))}
                </View>

                {currentTier !== plan.tier && (
                  <TouchableOpacity
                    style={[
                      styles.upgradeButton,
                      selectedPlan === plan.tier && styles.upgradeButtonSelected,
                      processingPurchase && styles.upgradeButtonDisabled,
                    ]}
                    onPress={handleUpgrade}
                    disabled={selectedPlan !== plan.tier || processingPurchase}
                  >
                    {processingPurchase && selectedPlan === plan.tier ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <SmallBodySmall style={styles.upgradeButtonText}>
                        {currentTier ? 'Upgrade Now' : 'Get Started'}
                      </SmallBodySmall>
                    )}
                  </TouchableOpacity>
                )}

                {currentTier === plan.tier && (
                  <View style={styles.currentPlanBadge}>
                    <SmallBodySmall style={styles.currentPlanText}>Current Plan</SmallBodySmall>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}

          {!hasDailyOptimizer && (
            <View style={styles.dailyOptimizerCard}>
              <SmallH3 style={styles.dailyOptimizerTitle}>Enhance Your Journey</SmallH3>
              <SmallBodyMedium style={styles.dailyOptimizerDescription}>
                Add morning and evening sessions to optimize your daily transformation
              </SmallBodyMedium>
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  processingPurchase && styles.upgradeButtonDisabled,
                ]}
                onPress={handleDailyOptimizer}
                disabled={processingPurchase}
              >
                {processingPurchase ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <SmallBodySmall style={styles.upgradeButtonText}>Add Daily Optimizer</SmallBodySmall>
                )}
              </TouchableOpacity>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  valueProposition: {
    marginBottom: 32,
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  subtitle: {
    color: colors.accent,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefit: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  guaranteeBox: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  guaranteeTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  guaranteeText: {
    textAlign: 'center',
  },
  plansTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  planCard: {
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectedPlan: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  currentPlan: {
    opacity: 0.8,
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitle: {
    marginBottom: 4,
  },
  planPrice: {
    color: colors.accent,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    marginBottom: 16,
  },
  featureTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  featureSubtitle: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  featureDetails: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  featureText: {
    marginBottom: 8,
  },
  upgradeButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  upgradeButtonSelected: {
    backgroundColor: colors.accent,
  },
  upgradeButtonDisabled: {
    opacity: 0.7,
  },
  upgradeButtonText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  currentPlanBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentPlanText: {
    color: colors.background,
    fontWeight: '600',
  },
  dailyOptimizerCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dailyOptimizerTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  dailyOptimizerDescription: {
    textAlign: 'center',
    marginBottom: 16,
    color: colors.textSecondary,
  },
});

export default UpgradeScreen;
