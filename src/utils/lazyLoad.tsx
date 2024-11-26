import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
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
    <Suspense fallback={<LoadingScreen />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
