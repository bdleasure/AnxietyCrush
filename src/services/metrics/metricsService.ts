import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserMetrics, SessionRecord } from './types';

const METRICS_KEY = '@anxiety_crush/user_metrics';
const SESSIONS_KEY = '@anxiety_crush/session_records';

const DEFAULT_METRICS: UserMetrics = {
  sessionsCompleted: 0,
  currentStreak: 0,
  realityScore: 0,
  dailyProgress: [],
};

class MetricsService {
  async resetMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(DEFAULT_METRICS));
    } catch (error) {
      console.error('Error resetting metrics:', error);
    }
  }

  private async getMetrics(): Promise<UserMetrics> {
    try {
      const metricsStr = await AsyncStorage.getItem(METRICS_KEY);
      return metricsStr ? JSON.parse(metricsStr) : DEFAULT_METRICS;
    } catch (error) {
      console.error('Error getting metrics:', error);
      return DEFAULT_METRICS;
    }
  }

  private async getStoredSessions(): Promise<SessionRecord[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem(SESSIONS_KEY);
      return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
      console.error('Error getting stored sessions:', error);
      return [];
    }
  }

  async getUserMetrics(): Promise<UserMetrics> {
    return this.getMetrics();
  }

  async recordSession(session: SessionRecord): Promise<void> {
    try {
      const metrics = await this.getMetrics();
      const today = new Date().toISOString().split('T')[0];
      
      // Update basic metrics
      metrics.sessionsCompleted += 1;
      metrics.realityScore = Math.min(100, metrics.realityScore + 5);
      metrics.lastSessionDate = today;

      // Update daily progress
      if (!metrics.dailyProgress) {
        metrics.dailyProgress = [];
      }

      const todayProgress = metrics.dailyProgress.find(p => p.date === today);
      if (todayProgress) {
        todayProgress.sessionsCompleted += 1;
        todayProgress.realityScore = metrics.realityScore;
      } else {
        metrics.dailyProgress.push({
          date: today,
          sessionsCompleted: 1,
          realityScore: metrics.realityScore,
        });
      }

      // Keep only last 7 days
      metrics.dailyProgress = metrics.dailyProgress
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7);

      // Update streak
      if (metrics.lastSessionDate) {
        const lastDate = new Date(metrics.lastSessionDate);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          metrics.currentStreak += 1;
        } else {
          metrics.currentStreak = 1;
        }
      } else {
        metrics.currentStreak = 1;
      }

      await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error recording session:', error);
    }
  }
}

export const metricsService = new MetricsService();
