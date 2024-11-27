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
  <H1 {...props} style={[{ fontSize: 20 }, style]} />
);

const SmallH2 = ({ style, ...props }) => (
  <H2 {...props} style={[{ fontSize: 17 }, style]} />
);

const SmallH3 = ({ style, ...props }) => (
  <H3 {...props} style={[{ fontSize: 15 }, style]} />
);

const SmallBodyLarge = ({ style, ...props }) => (
  <BodyLarge {...props} style={[{ fontSize: 14 }, style]} />
);

const SmallBodyMedium = ({ style, ...props }) => (
  <BodyMedium {...props} style={[{ fontSize: 12 }, style]} />
);

const SmallBodySmall = ({ style, ...props }) => (
  <BodySmall {...props} style={[{ fontSize: 11 }, style]} />
);

const UpgradeScreen = () => {
  const navigation = useNavigation();
  const {
    currentTier,
    selectedPackages,
    isLoading,
    hasDailyOptimizer,
    totalPrice,
    togglePackageSelection,
    purchaseSelectedPackages,
    clearSelection,
  } = usePurchase();

  const handlePurchase = async () => {
    await purchaseSelectedPackages();
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
              Select the packages you want and transform your life instantly.
            </SmallBodyMedium>
          </View>

          {SUBSCRIPTION_PLANS.map((plan) => (
            <View key={`plan-container-${plan.tier.toLowerCase()}`}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPackages.has(plan.tier) && styles.selectedPlan,
                  currentTier === plan.tier && styles.currentPlan,
                ]}
                onPress={() => togglePackageSelection(plan.tier)}
                disabled={currentTier === plan.tier || isLoading}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planTitleRow}>
                    <View style={styles.planTitleContainer}>
                      <SmallH2 style={[styles.planTitle, styles.categoryTitle]}>{plan.name}</SmallH2>
                      <SmallBodyMedium style={[styles.planDescription, styles.categoryDescription]}>{plan.description}</SmallBodyMedium>
                      {plan.positioning && (
                        <SmallBodyMedium style={styles.positioning}>{plan.positioning}</SmallBodyMedium>
                      )}
                    </View>
                    <View style={styles.priceContainer}>
                      <SmallBodyLarge style={styles.planPrice}>{plan.price}</SmallBodyLarge>
                    </View>
                  </View>
                  {selectedPackages.has(plan.tier) && (
                    <View style={styles.selectedBadge}>
                      <SmallBodySmall style={styles.selectedText}>Selected</SmallBodySmall>
                    </View>
                  )}
                </View>
                
                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <View>
                        <SmallBodyMedium style={styles.featureTitle}>✓ {feature.title.split('(')[0].trim()}</SmallBodyMedium>
                        <SmallBodyMedium style={styles.duration}>({feature.title.split('(')[1]}</SmallBodyMedium>
                      </View>
                      <SmallBodySmall style={styles.featureSubtitle}>{feature.subtitle}</SmallBodySmall>
                      {(feature.perfectFor || feature.keyBenefit) && (
                        <View style={styles.benefitContainer}>
                          {feature.perfectFor && (
                            <View style={styles.benefitRow}>
                              <SmallBodySmall style={styles.benefitLabel}>Perfect for:</SmallBodySmall>
                              <SmallBodySmall style={[styles.benefitText, styles.perfectForText]}>{feature.perfectFor}</SmallBodySmall>
                            </View>
                          )}
                          {feature.keyBenefit && (
                            <View style={styles.benefitRow}>
                              <SmallBodySmall style={styles.benefitLabel}>Key benefit:</SmallBodySmall>
                              <SmallBodySmall style={styles.benefitText}>{feature.keyBenefit}</SmallBodySmall>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                {currentTier === plan.tier && (
                  <View style={styles.currentPlanBadge}>
                    <SmallBodySmall style={styles.currentPlanText}>Current Plan</SmallBodySmall>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}

          {selectedPackages.size > 0 && (
            <View style={styles.purchaseSummary}>
              <SmallH3 style={styles.summaryTitle}>Your Selection</SmallH3>
              {Array.from(selectedPackages).map((tier) => (
                <View key={tier} style={styles.selectedPackage}>
                  <SmallBodyMedium>{SUBSCRIPTION_PLANS.find(p => p.tier === tier)?.name}</SmallBodyMedium>
                  <SmallBodyMedium>{SUBSCRIPTION_PLANS.find(p => p.tier === tier)?.price}</SmallBodyMedium>
                </View>
              ))}
              <View style={styles.totalRow}>
                <SmallH3>Total</SmallH3>
                <SmallH3>${totalPrice}</SmallH3>
              </View>
              <TouchableOpacity
                style={[styles.purchaseButton, isLoading && styles.purchaseButtonDisabled]}
                onPress={handlePurchase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <SmallBodyMedium style={styles.purchaseButtonText}>
                    Purchase Selected Packages
                  </SmallBodyMedium>
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
    color: colors.textPrimary,
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
    padding: 16,
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
    marginBottom: 12,
  },
  planTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  planTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  priceContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  planTitle: {
    marginBottom: 4,
  },
  categoryTitle: {
    color: colors.accent,  // Using the gold accent color
  },
  categoryDescription: {
    color: colors.textPrimary,  // Using white color for description
  },
  planDescription: {
    color: colors.textPrimary,
    marginBottom: 8,
  },
  positioning: {
    color: colors.accent,
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    marginBottom: 16,
  },
  featureTitle: {
    marginBottom: 2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  duration: {
    marginBottom: 8,
    color: colors.textPrimary,
    fontSize: 11,
  },
  featureSubtitle: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  featureDetails: {
    color: colors.textPrimary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  featureText: {
    marginBottom: 8,
  },
  benefitContainer: {
    marginTop: 8,
    paddingLeft: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitLabel: {
    color: colors.textPrimary,
    marginRight: 8,
    fontWeight: '600',
    minWidth: 70,
  },
  benefitText: {
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  perfectForText: {
    paddingRight: 8,
  },
  selectedBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  selectedText: {
    color: colors.background,
    fontWeight: '600',
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
  purchaseSummary: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  summaryTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedPackage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
  },
  purchaseButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
});

export default UpgradeScreen;
