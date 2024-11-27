import { Stack } from 'expo-router';
import { UpgradeScreenWrapper } from '../src/screens/UpgradeScreenWrapper';

export default function UpgradeModal() {
  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
          headerShown: false,
        }}
      />
      <UpgradeScreenWrapper />
    </>
  );
}
