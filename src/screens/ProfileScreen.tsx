import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { Achievement } from '../services/achievements/types';
import { achievementService } from '../services/achievements/achievementService';
import { AchievementCard } from '../components/AchievementCard';

interface Props {}

export const ProfileScreen: React.FC<Props> = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const loadedAchievements = await achievementService.getAchievements();
    setAchievements(loadedAchievements);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Profile</Text>
        <Text style={styles.subheading}>Your Personal Journey</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  heading: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});
