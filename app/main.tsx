import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { isWeb } from '../src/utils/platform';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...Platform.select({
            web: {
              paddingBottom: 16,
              height: 60,
            },
            default: {},
          }),
        },
      }}
    />
  );
}
