import React, { memo } from 'react';
import { View, ViewProps, Platform, StyleSheet } from 'react-native';
import { isWeb, webStyles } from '../../utils/platform';

interface ResponsiveViewProps extends ViewProps {
  accessibilityRole?: string;
  accessibilityLabel?: string;
  tabIndex?: number;
  onClick?: () => void;
}

const ResponsiveView: React.FC<ResponsiveViewProps> = memo(({
  children,
  style,
  accessibilityRole,
  accessibilityLabel,
  tabIndex,
  onClick,
  ...props
}) => {
  const webProps = isWeb ? {
    onClick,
    tabIndex,
    role: accessibilityRole,
    'aria-label': accessibilityLabel,
    style: [
      style,
      Platform.select({
        web: webStyles.container,
        default: {},
      }),
    ],
  } : {};

  return (
    <View
      {...props}
      {...webProps}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={StyleSheet.flatten([
        styles.container,
        style,
      ])}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    // Base styles that work well across platforms
    flexDirection: 'column',
  },
});

export default ResponsiveView;
