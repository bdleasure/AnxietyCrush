export type SessionType = 'regular' | 'bonus' | 'challenge';

export interface SessionRecord {
  id: string;
  trackId: string;
  startTime: string;
  duration?: number;
  type?: SessionType;
  pointsEarned?: number;
}

export interface UserMetrics {
  sessionsCompleted: number;
  currentStreak: number;
  bestStreak: number;
  realityScore: number;
  totalListeningTime: number;
  lastSessionDate: string;
  uniqueSessionTypes: number;
  morningSessionsCompleted: number;
  nightSessionsCompleted: number;
  weekendStreaks: number;
}

export interface DailyProgress {
  date: string;
  realityScore: number;
  sessionsCompleted: number;
  totalTime: number;
}
