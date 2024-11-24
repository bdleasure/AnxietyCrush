export interface Achievement {
  id: string;
  title: string;
  description: string;
  requiredProgress: number;
  currentProgress: number;
  isUnlocked: boolean;
  dateEarned?: string;
  icon: string;
  category: AchievementCategory;
  reward?: {
    type: 'theme' | 'sound' | 'badge';
    value: string;
  };
}

export type AchievementCategory = 'session' | 'streak' | 'time' | 'reality' | 'special';

export interface AchievementProgress {
  [achievementId: string]: {
    currentProgress: number;
    isUnlocked: boolean;
    dateEarned?: string;
  };
}

export const ACHIEVEMENTS = {
  // Session Achievements
  FIRST_WAVE: 'first_wave',
  REALITY_ROOKIE: 'reality_rookie',
  ANXIETY_MASTER: 'anxiety_master',
  PATTERN_BREAKER: 'pattern_breaker',
  
  // Streak Achievements
  STREAK_STARTER: 'streak_starter',
  STREAK_MASTER: 'streak_master',
  STREAK_LEGEND: 'streak_legend',
  
  // Time Achievements
  TIME_TRAVELER: 'time_traveler',
  MINDFUL_MINUTES: 'mindful_minutes',
  HOUR_HERO: 'hour_hero',
  
  // Reality Achievements
  REALITY_RISING: 'reality_rising',
  REALITY_MASTER: 'reality_master',
  REALITY_SAGE: 'reality_sage',
  
  // Special Achievements
  EARLY_BIRD: 'early_bird',
  NIGHT_OWL: 'night_owl',
  WEEKEND_WARRIOR: 'weekend_warrior',
} as const;

export type AchievementId = typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS];
