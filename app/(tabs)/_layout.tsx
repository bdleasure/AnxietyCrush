import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';

const TAB_ICON = {
  audio: {
    active: 'radio',
    inactive: 'radio-outline',
  },
  progress: {
    active: 'analytics',
    inactive: 'analytics-outline',
  },
  bonus: {
    active: 'gift',
    inactive: 'gift-outline',
  },
  profile: {
    active: 'person',
    inactive: 'person-outline',
  },
  settings: {
    active: 'settings',
    inactive: 'settings-outline',
  },
};

const TabBarBackground = () => (
  <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFill} />
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.select({
            ios: 'transparent',
            android: colors.background,
            default: colors.background,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.select({ ios: 85, default: 60 }),
          paddingBottom: Platform.select({ ios: 25, default: 10 }),
        },
        tabBarBackground: Platform.OS === 'ios' ? TabBarBackground : undefined,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="audio"
        options={{
          title: 'Audio',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICON.audio.active : TAB_ICON.audio.inactive}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICON.progress.active : TAB_ICON.progress.inactive}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bonus"
        options={{
          title: 'Bonus',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICON.bonus.active : TAB_ICON.bonus.inactive}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICON.profile.active : TAB_ICON.profile.inactive}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICON.settings.active : TAB_ICON.settings.inactive}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
