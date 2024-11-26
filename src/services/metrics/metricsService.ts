import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserMetrics, SessionRecord } from './types';

const METRICS_KEY = '@anxiety_crush/user_metrics';
const SESSIONS_KEY = '@anxiety_crush/session_records';

const DEFAULT_METRICS: UserMetrics = {
  sessionsCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  realityScore: 0,
  totalListeningTime: 0,
  lastSessionDate: '',
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
    const metrics = await this.getMetrics();
    const sessions = await this.getStoredSessions();
    
    // Calculate total listening time from sessions, ensuring whole numbers
    const totalListeningTime = Math.round(
      sessions.reduce((total, session) => {
        return total + (session.duration ? Math.round(session.duration) : 0);
      }, 0)
    );

    return {
      ...metrics,
      totalListeningTime,
    };
  }

  async recordSession(session: SessionRecord): Promise<void> {
    try {
      const metrics = await this.getMetrics();
      const sessions = await this.getStoredSessions();
      const today = new Date().toISOString().split('T')[0];
      
      // Update metrics with rounded duration
      metrics.sessionsCompleted++;
      metrics.totalListeningTime += Math.round(session.duration || 0);
      
      // Update streak
      if (metrics.lastSessionDate) {
        const lastDate = new Date(metrics.lastSessionDate);
        const daysSinceLastSession = Math.floor(
          (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastSession <= 1) {
          metrics.currentStreak++;
          metrics.bestStreak = Math.max(metrics.currentStreak, metrics.bestStreak);
        } else {
          metrics.currentStreak = 1;
        }
      } else {
        metrics.currentStreak = 1;
      }
      
      metrics.lastSessionDate = today;

      // Round the duration before storing
      const sessionToStore = {
        ...session,
        duration: session.duration ? Math.round(session.duration) : 0
      };
      
      // Save updated metrics and session
      await Promise.all([
        AsyncStorage.setItem(METRICS_KEY, JSON.stringify(metrics)),
        AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify([...sessions, sessionToStore])),
      ]);

      // Track achievements after session is recorded
      const { achievementTracker } = await import('../achievements/achievementTracker');
      await achievementTracker.trackSessionCompletion(session.trackId, sessionToStore.duration);
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
