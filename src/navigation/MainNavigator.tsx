import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { withLazyLoading } from '../utils/lazyLoad';
import SessionPlayer from '../screens/SessionPlayer';  // Direct import for initial screen

const Tab = createBottomTabNavigator();

const TAB_ICON = {
  Audio: {
    active: 'radio',
    inactive: 'radio-outline',
  },
  Progress: {
    active: 'analytics',
    inactive: 'analytics-outline',
  },
  Bonus: {
    active: 'gift',
    inactive: 'gift-outline',
  },
  Profile: {
    active: 'person',
    inactive: 'person-outline',
  },
  Settings: {
    active: 'settings',
    inactive: 'settings-outline',
  },
};

const TabBarBackground = () => (
  <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFill} />
);

// Lazy load non-initial screens
const ProfileScreen = withLazyLoading(() => import('../screens/ProfileScreen'));  // Uses default export
const ProgressScreen = withLazyLoading(() => import('../screens/ProgressScreen'));  // Uses default export
const SettingsScreen = withLazyLoading(() => import('../screens/SettingsScreen'));  // Uses default export
const BonusPlayerScreen = withLazyLoading(() => import('../screens/BonusPlayerScreen'));  // Uses default export

export const MainNavigator = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => <TabBarBackground />,
        }}
      >
        <Tab.Screen 
          name="Audio" 
          component={SessionPlayer}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? TAB_ICON.Audio.active : TAB_ICON.Audio.inactive} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Progress" 
          component={ProgressScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? TAB_ICON.Progress.active : TAB_ICON.Progress.inactive} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Bonus" 
          component={BonusPlayerScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? TAB_ICON.Bonus.active : TAB_ICON.Bonus.inactive} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? TAB_ICON.Profile.active : TAB_ICON.Profile.inactive} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? TAB_ICON.Settings.active : TAB_ICON.Settings.inactive} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    height: Platform.select({
      ios: 85,
      android: 60,
    }),
    paddingBottom: Platform.select({
      ios: 25,
      android: 0,
    }),
  },
});
