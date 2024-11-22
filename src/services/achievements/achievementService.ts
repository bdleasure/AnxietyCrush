import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, AchievementProgress, ACHIEVEMENTS } from './types';

const STORAGE_KEY = '@anxiety_crush/achievements';

const ACHIEVEMENT_DEFINITIONS: { [key: string]: Omit<Achievement, 'currentProgress' | 'isUnlocked'> } = {
  [ACHIEVEMENTS.FIRST_WAVE]: {
    id: ACHIEVEMENTS.FIRST_WAVE,
    title: 'First Wave',
    description: 'Complete your first session',
    requiredProgress: 1,
    icon: 'wave',
  },
  [ACHIEVEMENTS.REALITY_ROOKIE]: {
    id: ACHIEVEMENTS.REALITY_ROOKIE,
    title: 'Reality Rookie',
    description: 'Complete 5 sessions',
    requiredProgress: 5,
    icon: 'star',
  },
  [ACHIEVEMENTS.STREAK_MASTER]: {
    id: ACHIEVEMENTS.STREAK_MASTER,
    title: 'Streak Master',
    description: 'Maintain a 7-day streak',
    requiredProgress: 7,
    icon: 'fire',
  },
  [ACHIEVEMENTS.PATTERN_BREAKER]: {
    id: ACHIEVEMENTS.PATTERN_BREAKER,
    title: 'Pattern Breaker',
    description: 'Complete all session types',
    requiredProgress: 4, // Assuming 4 different session types
    icon: 'lock-open',
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

  async getAchievements(): Promise<Achievement[]> {
    const progress = await this.getProgress();
    
    return Object.values(ACHIEVEMENT_DEFINITIONS).map(achievement => ({
      ...achievement,
      currentProgress: progress[achievement.id]?.currentProgress || 0,
      isUnlocked: progress[achievement.id]?.isUnlocked || false,
    }));
  }

  async updateProgress(achievementId: string, progress: number): Promise<void> {
    const currentProgress = await this.getProgress();
    const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];

    if (!achievement) return;

    const newProgress = Math.min(progress, achievement.requiredProgress);
    const isUnlocked = newProgress >= achievement.requiredProgress;

    currentProgress[achievementId] = {
      currentProgress: newProgress,
      isUnlocked,
    };

    await this.saveProgress(currentProgress);
  }

  async resetProgress(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting achievements:', error);
    }
  }
}

export const achievementService = new AchievementService();
