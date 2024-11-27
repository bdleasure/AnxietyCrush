import React, { Suspense } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.accent} />
  </View>
);

export const withLazyLoading = (importFn: () => Promise<any>) => {
  const LazyComponent = React.lazy(() => 
    importFn().then(module => ({
      default: module.default || module
    }))
  );

  return (props: any) => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
