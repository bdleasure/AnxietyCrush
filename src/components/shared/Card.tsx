import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isSelected?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, isSelected = false }) => {
  if (!isSelected) {
    return (
      <View style={[styles.card, styles.cardMargins, style]}>
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#7C3AED', '#EC4899']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={[styles.card, style]}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: spacing.borderRadius.lg,
    padding: 0.5, // Very thin border
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xxs,
  },
  cardMargins: {
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xxs,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.borderRadius.lg - 0.5,
    padding: spacing.cardPadding,
    ...shadows.md,
  },
});
