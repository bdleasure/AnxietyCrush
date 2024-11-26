import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, Animated } from 'react-native';
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
        <View style={styles.innerCard}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.cardContainer, styles.cardMargins]}>
      <LinearGradient
        colors={[colors.accent, '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      />
      <View style={[styles.card, style]}>
        <View style={styles.innerCard}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    borderRadius: spacing.borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: spacing.borderRadius.lg,
  },
  cardMargins: {
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xxs,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.borderRadius.lg - 1,
    margin: 1,
    overflow: 'hidden',
  },
  innerCard: {
    padding: spacing.cardPadding,
    borderRadius: spacing.borderRadius.lg - 1,
    backgroundColor: `${colors.cardBackground}dd`,
    backdropFilter: 'blur(10px)',
  },
});
