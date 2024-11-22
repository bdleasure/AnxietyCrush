export interface UserMetrics {
  sessionsCompleted: number;
  currentStreak: number;
  realityScore: number;
  lastSessionDate?: string;
}

export interface SessionRecord {
  id: string;
  date: string;
  trackId: string;
  duration: number;
  completed: boolean;
}
