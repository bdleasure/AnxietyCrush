export interface Achievement {
  id: string;
  title: string;
  description: string;
  requiredProgress: number;
  currentProgress: number;
  isUnlocked: boolean;
  icon: string;  // Name of the icon to use
}

export interface AchievementProgress {
  [achievementId: string]: {
    currentProgress: number;
    isUnlocked: boolean;
  };
}

export const ACHIEVEMENTS = {
  FIRST_WAVE: 'first_wave',
  REALITY_ROOKIE: 'reality_rookie',
  STREAK_MASTER: 'streak_master',
  PATTERN_BREAKER: 'pattern_breaker',
} as const;
