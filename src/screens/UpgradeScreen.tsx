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
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from '../services/subscription/plans';

const { width } = Dimensions.get('window');

const PlanCard = memo(({ plan, isSelected, onSelect, onUpgrade }: { plan: SubscriptionPlan, isSelected: boolean, onSelect: (tier: SubscriptionTier) => void, onUpgrade: (plan: SubscriptionPlan) => void }) => {
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
                {feature.details && (
                  <Text style={styles.featureDetails}>{feature.details}</Text>
                )}
                {feature.technical && (
                  <Text style={styles.featureTechnical}>{feature.technical}</Text>
                )}
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

const UpgradeScreen: React.FC = () => {
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
        <Text style={styles.title}>Transform Your Reality</Text>
        <Text style={styles.subtitle}>Turn Anxiety into Your Greatest Asset</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            Reality Wave technology helps you flip the switch from:
          </Text>
          <View style={styles.transformationList}>
            <Text style={styles.transformItem}>• Overthinking to Clarity</Text>
            <Text style={styles.transformItem}>• Anxiety to Calm</Text>
            <Text style={styles.transformItem}>• Chaos to Control</Text>
            <Text style={styles.transformItem}>• Stress to Success</Text>
          </View>
        </View>

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
            30-Day Reality Transformation Guarantee
          </Text>
          <Text style={styles.guaranteeDescription}>
            Feel the power of anxiety transformed into achievement, or get double your money back
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
  featureDetails: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
  },
  featureTechnical: {
    fontSize: 9,
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
  introSection: {
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 20,
  },
  introText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  transformationList: {
    paddingLeft: 20,
  },
  transformItem: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
});

export default UpgradeScreen;
