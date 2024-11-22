import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserMetrics, SessionRecord } from './types';

const STORAGE_KEYS = {
  USER_METRICS: '@anxiety_crush/user_metrics',
  SESSION_RECORDS: '@anxiety_crush/session_records',
};

const DEFAULT_METRICS: UserMetrics = {
  sessionsCompleted: 0,
  currentStreak: 0,
  realityScore: 0,
};

class MetricsService {
  async resetMetrics(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_METRICS),
        AsyncStorage.removeItem(STORAGE_KEYS.SESSION_RECORDS),
      ]);
    } catch (error) {
      console.error('Error resetting metrics:', error);
    }
  }

  private async getStoredMetrics(): Promise<UserMetrics> {
    try {
      const metricsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_METRICS);
      return metricsJson ? JSON.parse(metricsJson) : DEFAULT_METRICS;
    } catch (error) {
      console.error('Error getting stored metrics:', error);
      return DEFAULT_METRICS;
    }
  }

  private async getStoredSessions(): Promise<SessionRecord[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_RECORDS);
      return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
      console.error('Error getting stored sessions:', error);
      return [];
    }
  }

  async getUserMetrics(): Promise<UserMetrics> {
    return this.getStoredMetrics();
  }

  async recordSession(session: Omit<SessionRecord, 'id' | 'date'>): Promise<void> {
    try {
      // Get existing sessions and metrics
      const [sessions, metrics] = await Promise.all([
        this.getStoredSessions(),
        this.getStoredMetrics(),
      ]);

      // Create new session record
      const newSession: SessionRecord = {
        ...session,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };

      // Update sessions list
      const updatedSessions = [...sessions, newSession];
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSION_RECORDS,
        JSON.stringify(updatedSessions)
      );

      // Update metrics
      if (session.completed) {
        const updatedMetrics = this.calculateUpdatedMetrics(metrics, newSession);
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_METRICS,
          JSON.stringify(updatedMetrics)
        );
      }
    } catch (error) {
      console.error('Error recording session:', error);
    }
  }

  private calculateUpdatedMetrics(
    currentMetrics: UserMetrics,
    newSession: SessionRecord
  ): UserMetrics {
    const lastDate = currentMetrics.lastSessionDate
      ? new Date(currentMetrics.lastSessionDate)
      : null;
    const sessionDate = new Date(newSession.date);
    
    // Calculate streak
    let streak = currentMetrics.currentStreak;
    if (lastDate) {
      const dayDiff = Math.floor(
        (sessionDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (dayDiff <= 1) {
        streak += 1;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    // Calculate reality score (based on streak and sessions completed)
    const baseScore = Math.min(currentMetrics.sessionsCompleted * 5, 70);
    const streakBonus = Math.min(streak * 3, 30);
    const realityScore = Math.min(baseScore + streakBonus, 100);

    return {
      sessionsCompleted: currentMetrics.sessionsCompleted + 1,
      currentStreak: streak,
      realityScore,
      lastSessionDate: sessionDate.toISOString(),
    };
  }
}

export const metricsService = new MetricsService();
