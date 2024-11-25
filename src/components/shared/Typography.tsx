import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface TypographyProps extends TextProps {
  variant?: keyof typeof typography;
  color?: string;
  style?: TextStyle;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'bodyMedium',
  color = colors.textPrimary,
  style,
  children,
  ...props
}) => {
  const textStyle = {
    fontSize: typography[variant].size,
    fontWeight: typography[variant].weight,
    color,
  };

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};

// Preset components for common text styles
export const H1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1" {...props} />
);

export const H2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2" {...props} />
);

export const H3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h3" {...props} />
);

export const BodyLarge = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="bodyLarge" {...props} />
);

export const BodyMedium = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="bodyMedium" {...props} />
);

export const BodySmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="bodySmall" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);

export const Label = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="label" {...props} />
);

export const ButtonText = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="button" {...props} />
);
