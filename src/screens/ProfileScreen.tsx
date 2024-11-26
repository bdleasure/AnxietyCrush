import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Platform,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { Achievement, AchievementCategory } from '../services/achievements/types';
import { achievementService } from '../services/achievements/achievementService';
import { metricsService } from '../services/metrics/metricsService';
import { AchievementCard } from '../components/AchievementCard';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDuration } from '../utils/timeUtils';

interface Props {}

const ProfileScreen: React.FC<Props> = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [metrics, setMetrics] = useState({
    totalListeningTime: 0,
    averageSessionLength: 0,
    bestStreak: 0,
    realityScore: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('session');

  const loadData = async () => {
    const [loadedAchievements, userMetrics] = await Promise.all([
      achievementService.getAllAchievements(),
      metricsService.getUserMetrics(),
    ]);
    
    setAchievements(loadedAchievements);
    setMetrics({
      totalListeningTime: userMetrics.totalListeningTime || 0,
      averageSessionLength: userMetrics.sessionsCompleted > 0
        ? Math.round(userMetrics.totalListeningTime / userMetrics.sessionsCompleted)
        : 0,
      bestStreak: userMetrics.bestStreak || 0,
      realityScore: userMetrics.realityScore || 0,
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const filteredAchievements = achievements.filter(
    achievement => achievement.category === selectedCategory
  );

  const categories: AchievementCategory[] = ['session', 'streak', 'time', 'reality', 'special'];
  const categoryIcons = {
    session: 'meditation',
    streak: 'fire',
    time: 'clock',
    reality: 'shield',
    special: 'star',
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{formatDuration(metrics.totalListeningTime)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="timer" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{formatDuration(metrics.averageSessionLength)}</Text>
            <Text style={styles.statLabel}>Avg. Session</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="fire" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{metrics.bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="shield" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{metrics.realityScore}</Text>
            <Text style={styles.statLabel}>Reality Level</Text>
          </View>
        </View>

        {/* Achievement Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <View 
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onTouchEnd={() => setSelectedCategory(category)}
            >
              <MaterialCommunityIcons
                name={categoryIcons[category] as any}
                size={20}
                color={selectedCategory === category ? colors.textPrimary : colors.textSecondary}
              />
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              showAnimation={achievement.isUnlocked}
            />
          ))}
        </View>
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
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subheading: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryContainer: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
  },
  categoryButtonActive: {
    backgroundColor: colors.accent,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  categoryTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  achievementsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
});

export default ProfileScreen;
