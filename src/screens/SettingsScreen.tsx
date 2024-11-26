import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../contexts/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

const SettingSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const SettingRow: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    {children}
  </View>
);

const SettingsScreen = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  const handleToggle = async (key: keyof Settings) => {
    if (settings.hapticFeedbackEnabled) {
      await Haptics.selectionAsync();
    }
    updateSetting(key, !settings[key]);
  };

  const handleTimeChange = (_: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      updateSetting('dailyReminderTime', `${hours}:${minutes}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={resetSettings} style={styles.resetButton}>
          <Ionicons name="refresh" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <SettingSection title="Playback">
          <SettingRow label="Auto-play Next Session">
            <Switch
              value={settings.autoPlayEnabled}
              onValueChange={() => handleToggle('autoPlayEnabled')}
            />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Notifications">
          <SettingRow label="Daily Reminder">
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeText}>
                {settings.dailyReminderTime || 'Not Set'}
              </Text>
            </TouchableOpacity>
          </SettingRow>
          <SettingRow label="Achievement Notifications">
            <Switch
              value={settings.achievementNotificationsEnabled}
              onValueChange={() => handleToggle('achievementNotificationsEnabled')}
            />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Appearance & Feel">
          <SettingRow label="Dark Theme">
            <Switch
              value={settings.theme === 'darker'}
              onValueChange={() => updateSetting('theme', settings.theme === 'dark' ? 'darker' : 'dark')}
            />
          </SettingRow>
          <SettingRow label="Haptic Feedback">
            <Switch
              value={settings.hapticFeedbackEnabled}
              onValueChange={() => handleToggle('hapticFeedbackEnabled')}
            />
          </SettingRow>
        </SettingSection>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {showTimePicker && (
        <DateTimePicker
          value={
            settings.dailyReminderTime
              ? new Date(`2000-01-01T${settings.dailyReminderTime}:00`)
              : new Date()
          }
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingRight: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  timeButton: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  versionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
});

export default SettingsScreen;
