export interface UserMetrics {
  sessionsCompleted: number;
  currentStreak: number;
  realityScore: number;
  lastSessionDate?: string;
}

export interface SessionRecord {
  id: string;
  trackId: string;
  startTime: string;
  type: 'regular' | 'bonus';
}
