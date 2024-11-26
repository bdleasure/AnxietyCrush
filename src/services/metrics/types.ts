export interface UserMetrics {
  sessionsCompleted: number;
  currentStreak: number;
  realityScore: number;
  lastSessionDate?: string;
  totalListeningTime: number;
  bestStreak: number;
}

export interface SessionRecord {
  id: string;
  trackId: string;
  startTime: string;
  duration?: number;
  type: 'regular' | 'bonus';
}
