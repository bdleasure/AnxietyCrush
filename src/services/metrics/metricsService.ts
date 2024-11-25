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
      
      // Update metrics
      metrics.sessionsCompleted++;
      
      // Store updated metrics
      await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
      
      // Store session record
      const sessions = await this.getStoredSessions();
      sessions.push(session);
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error recording session:', error);
    }
  }

  async trackBonusSessionStart(trackId: string): Promise<void> {
    try {
      const session: SessionRecord = {
        id: `bonus-${trackId}-${Date.now()}`,
        trackId,
        startTime: new Date().toISOString(),
        type: 'bonus'
      };
      await this.recordSession(session);
    } catch (error) {
      console.error('Error tracking bonus session start:', error);
    }
  }
}

export const metricsService = new MetricsService();
