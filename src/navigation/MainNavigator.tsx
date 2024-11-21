import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SessionPlayer } from '../screens/SessionPlayer';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { UpgradeScreen } from '../screens/UpgradeScreen';

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
  Profile: {
    active: 'person',
    inactive: 'person-outline',
  },
  Settings: {
    active: 'settings',
    inactive: 'settings-outline',
  },
};

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = focused
            ? TAB_ICON[route.name].active
            : TAB_ICON[route.name].inactive;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={100}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen 
        name="Sessions" 
        component={SessionPlayer}
        options={{
          tabBarLabel: 'Waves',
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen 
        name="Upgrade"
        component={UpgradeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="diamond" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 85 : 60,
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    paddingTop: 5,
    paddingBottom: Platform.OS === 'ios' ? 25 : 5,
  },
  tabBarLabel: {
    fontWeight: '600',
    fontSize: 12,
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
  },
});
