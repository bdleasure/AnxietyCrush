import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Settings {
  // Audio Preferences
  backgroundSoundsEnabled: boolean;
  notificationSoundsEnabled: boolean;
  downloadQuality: 'high' | 'medium' | 'low';
  autoPlayEnabled: boolean;

  // Notification Settings
  dailyReminderTime: string | null; // HH:mm format
  streakAlertsEnabled: boolean;
  achievementNotificationsEnabled: boolean;
  progressUpdatesEnabled: boolean;

  // App Customization
  theme: 'dark' | 'darker';
  hapticFeedbackEnabled: boolean;
  animationIntensity: 'high' | 'medium' | 'low';
}

const DEFAULT_SETTINGS: Settings = {
  backgroundSoundsEnabled: true,
  notificationSoundsEnabled: true,
  downloadQuality: 'high',
  autoPlayEnabled: false,
  dailyReminderTime: '09:00',
  streakAlertsEnabled: true,
  achievementNotificationsEnabled: true,
  progressUpdatesEnabled: true,
  theme: 'dark',
  hapticFeedbackEnabled: true,
  animationIntensity: 'medium',
};

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@anxiety_crush/settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};