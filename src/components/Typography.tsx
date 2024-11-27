import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
}

export const H1: React.FC<TypographyProps> = ({ style, ...props }) => (
  <Text {...props} style={[styles.h1, style]} />
);

export const H2: React.FC<TypographyProps> = ({ style, ...props }) => (
  <Text {...props} style={[styles.h2, style]} />
);

export const H3: React.FC<TypographyProps> = ({ style, ...props }) => (
  <Text {...props} style={[styles.h3, style]} />
);

export const BodyLarge: React.FC<TypographyProps> = ({ style, ...props }) => (
  <Text {...props} style={[styles.bodyLarge, style]} />
);

export const BodyMedium: React.FC<TypographyProps> = ({ style, ...props }) => (
  <Text {...props} style={[styles.bodyMedium, style]} />
);

export const BodySmall: React.FC<TypographyProps> = ({ style, ...props }) => (
  <Text {...props} style={[styles.bodySmall, style]} />
);

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  bodyLarge: {
    fontSize: 18,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
