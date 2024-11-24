import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, AchievementProgress, ACHIEVEMENTS, AchievementCategory } from './types';

const STORAGE_KEY = '@anxiety_crush/achievements';

const ACHIEVEMENT_DEFINITIONS: { [key: string]: Omit<Achievement, 'currentProgress' | 'isUnlocked'> } = {
  // Session Achievements
  [ACHIEVEMENTS.FIRST_WAVE]: {
    id: ACHIEVEMENTS.FIRST_WAVE,
    title: 'First Wave',
    description: 'Complete your first session',
    requiredProgress: 1,
    icon: 'wave',
    category: 'session',
  },
  [ACHIEVEMENTS.REALITY_ROOKIE]: {
    id: ACHIEVEMENTS.REALITY_ROOKIE,
    title: 'Reality Rookie',
    description: 'Complete 5 sessions',
    requiredProgress: 5,
    icon: 'star',
    category: 'session',
  },
  [ACHIEVEMENTS.ANXIETY_MASTER]: {
    id: ACHIEVEMENTS.ANXIETY_MASTER,
    title: 'Anxiety Master',
    description: 'Complete 50 sessions',
    requiredProgress: 50,
    icon: 'trophy',
    category: 'session',
    reward: { type: 'badge', value: 'master_badge' },
  },
  [ACHIEVEMENTS.PATTERN_BREAKER]: {
    id: ACHIEVEMENTS.PATTERN_BREAKER,
    title: 'Pattern Breaker',
    description: 'Complete all session types',
    requiredProgress: 4,
    icon: 'lock-open',
    category: 'session',
  },

  // Streak Achievements
  [ACHIEVEMENTS.STREAK_STARTER]: {
    id: ACHIEVEMENTS.STREAK_STARTER,
    title: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    requiredProgress: 3,
    icon: 'fire',
    category: 'streak',
  },
  [ACHIEVEMENTS.STREAK_MASTER]: {
    id: ACHIEVEMENTS.STREAK_MASTER,
    title: 'Streak Master',
    description: 'Maintain a 7-day streak',
    requiredProgress: 7,
    icon: 'fire',
    category: 'streak',
    reward: { type: 'theme', value: 'master_theme' },
  },
  [ACHIEVEMENTS.STREAK_LEGEND]: {
    id: ACHIEVEMENTS.STREAK_LEGEND,
    title: 'Streak Legend',
    description: 'Maintain a 30-day streak',
    requiredProgress: 30,
    icon: 'fire',
    category: 'streak',
    reward: { type: 'badge', value: 'legend_badge' },
  },

  // Time Achievements
  [ACHIEVEMENTS.TIME_TRAVELER]: {
    id: ACHIEVEMENTS.TIME_TRAVELER,
    title: 'Time Traveler',
    description: 'Spend 1 hour in sessions',
    requiredProgress: 60,
    icon: 'time',
    category: 'time',
  },
  [ACHIEVEMENTS.MINDFUL_MINUTES]: {
    id: ACHIEVEMENTS.MINDFUL_MINUTES,
    title: 'Mindful Minutes',
    description: 'Spend 5 hours in sessions',
    requiredProgress: 300,
    icon: 'brain',
    category: 'time',
  },
  [ACHIEVEMENTS.HOUR_HERO]: {
    id: ACHIEVEMENTS.HOUR_HERO,
    title: 'Hour Hero',
    description: 'Spend 10 hours in sessions',
    requiredProgress: 600,
    icon: 'clock',
    category: 'time',
    reward: { type: 'sound', value: 'hero_sound' },
  },

  // Reality Achievements
  [ACHIEVEMENTS.REALITY_RISING]: {
    id: ACHIEVEMENTS.REALITY_RISING,
    title: 'Reality Rising',
    description: 'Reach Reality Level 5',
    requiredProgress: 5,
    icon: 'trending-up',
    category: 'reality',
  },
  [ACHIEVEMENTS.REALITY_MASTER]: {
    id: ACHIEVEMENTS.REALITY_MASTER,
    title: 'Reality Master',
    description: 'Reach Reality Level 10',
    requiredProgress: 10,
    icon: 'shield',
    category: 'reality',
    reward: { type: 'theme', value: 'reality_theme' },
  },
  [ACHIEVEMENTS.REALITY_SAGE]: {
    id: ACHIEVEMENTS.REALITY_SAGE,
    title: 'Reality Sage',
    description: 'Reach Reality Level 20',
    requiredProgress: 20,
    icon: 'crown',
    category: 'reality',
    reward: { type: 'badge', value: 'sage_badge' },
  },

  // Special Achievements
  [ACHIEVEMENTS.EARLY_BIRD]: {
    id: ACHIEVEMENTS.EARLY_BIRD,
    title: 'Early Bird',
    description: 'Complete 5 sessions before 9 AM',
    requiredProgress: 5,
    icon: 'sunrise',
    category: 'special',
  },
  [ACHIEVEMENTS.NIGHT_OWL]: {
    id: ACHIEVEMENTS.NIGHT_OWL,
    title: 'Night Owl',
    description: 'Complete 5 sessions after 9 PM',
    requiredProgress: 5,
    icon: 'moon',
    category: 'special',
  },
  [ACHIEVEMENTS.WEEKEND_WARRIOR]: {
    id: ACHIEVEMENTS.WEEKEND_WARRIOR,
    title: 'Weekend Warrior',
    description: 'Complete sessions on 4 consecutive weekends',
    requiredProgress: 4,
    icon: 'calendar',
    category: 'special',
    reward: { type: 'badge', value: 'warrior_badge' },
  },
};

class AchievementService {
  private async getProgress(): Promise<AchievementProgress> {
    try {
      const progress = await AsyncStorage.getItem(STORAGE_KEY);
      return progress ? JSON.parse(progress) : {};
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return {};
    }
  }

  private async saveProgress(progress: AchievementProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving achievement progress:', error);
    }
  }

  async getAllAchievements(): Promise<Achievement[]> {
    const progress = await this.getProgress();
    return Object.values(ACHIEVEMENT_DEFINITIONS).map(achievement => ({
      ...achievement,
      currentProgress: progress[achievement.id]?.currentProgress || 0,
      isUnlocked: progress[achievement.id]?.isUnlocked || false,
      dateEarned: progress[achievement.id]?.dateEarned,
    }));
  }

  async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    const allAchievements = await this.getAllAchievements();
    return allAchievements.filter(achievement => achievement.category === category);
  }

  async updateProgress(achievementId: string, progress: number): Promise<Achievement | null> {
    const achievementDef = ACHIEVEMENT_DEFINITIONS[achievementId];
    if (!achievementDef) return null;

    const currentProgress = await this.getProgress();
    const achievement = currentProgress[achievementId] || { currentProgress: 0, isUnlocked: false };
    
    achievement.currentProgress = Math.min(progress, achievementDef.requiredProgress);
    if (achievement.currentProgress >= achievementDef.requiredProgress && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.dateEarned = new Date().toISOString();
    }

    const updatedProgress = {
      ...currentProgress,
      [achievementId]: achievement,
    };

    await this.saveProgress(updatedProgress);

    return {
      ...achievementDef,
      currentProgress: achievement.currentProgress,
      isUnlocked: achievement.isUnlocked,
      dateEarned: achievement.dateEarned,
    };
  }

  async resetProgress(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export const achievementService = new AchievementService();
