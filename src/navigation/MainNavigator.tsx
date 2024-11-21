import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SessionPlayer } from '../screens/SessionPlayer';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { UpgradeScreen } from '../screens/UpgradeScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const TabBarBackground = () => {
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    console.log('SafeArea insets:', insets);
  }, [insets]);

  return (
    <View style={[StyleSheet.absoluteFill, { height: 60 + (insets?.bottom || 0) }]}>
      <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFill} />
    </View>
  );
};

export const MainNavigator = () => {
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    console.log('MainNavigator SafeArea insets:', insets);
  }, [insets]);
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          height: 60 + (insets?.bottom || 0),
          paddingBottom: insets?.bottom || 0,
        },
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
          tabBarLabel: 'Waves',
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
          tabBarLabel: 'Progress',
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
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? TAB_ICON.Settings.active : TAB_ICON.Settings.inactive} 
              size={size} 
              color={color} 
            />
          ),
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarLabel: {
    fontWeight: '600',
    fontSize: 12,
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
  },
});
