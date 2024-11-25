import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SessionPlayer } from '../screens/SessionPlayer';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BonusPlayerScreen } from '../screens/BonusPlayerScreen';

const Tab = createBottomTabNavigator();

const TAB_ICON = {
  Sessions: {
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
          name="Sessions" 
          component={SessionPlayer}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? TAB_ICON.Sessions.active : TAB_ICON.Sessions.inactive} 
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
