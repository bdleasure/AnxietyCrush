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
  uniqueSessionTypes: 0,
  morningSessionsCompleted: 0,
  nightSessionsCompleted: 0,
  weekendStreaks: 0,
  focusScore: 0,
  calmScore: 0,
  controlScore: 0,
};

class MetricsService {
  private metrics: UserMetrics = DEFAULT_METRICS;
  private listeners: ((metrics: UserMetrics) => void)[] = [];

  constructor() {
    this.loadMetrics();
  }

  private async loadMetrics() {
    try {
      const metricsStr = await AsyncStorage.getItem(METRICS_KEY);
      this.metrics = metricsStr ? { ...DEFAULT_METRICS, ...JSON.parse(metricsStr) } : DEFAULT_METRICS;
      this.notifyListeners();
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  private async saveMetrics() {
    try {
      await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(this.metrics));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.metrics));
  }

  addListener(listener: (metrics: UserMetrics) => void) {
    this.listeners.push(listener);
    listener(this.metrics); // Initial call with current metrics
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async recordSession(session: SessionRecord): Promise<void> {
    try {
      // Convert duration to minutes if it's in seconds
      let sessionDuration = session.duration;
      
      // If duration is in seconds (greater than 100), convert to minutes
      if (sessionDuration > 100) {
        sessionDuration = Math.round(sessionDuration / 60);
      }

      // Ensure minimum session duration of 0.5 minutes
      sessionDuration = Math.max(sessionDuration, 0.5);

      console.log('Recording session with duration:', {
        original: session.duration,
        converted: sessionDuration,
        unit: 'minutes',
        completed: session.completed
      });

      // Update core metrics
      this.metrics.totalListeningTime = (this.metrics.totalListeningTime || 0) + sessionDuration;
      this.metrics.sessionsCompleted = (this.metrics.sessionsCompleted || 0) + 1;

      // Update streak only for completed sessions
      if (session.completed) {
        await this.updateStreak();
      }

      // Update transformation metrics based on completion
      this.updateTransformationMetrics(sessionDuration, session.completed);

      console.log('Updated metrics:', {
        totalTime: this.metrics.totalListeningTime,
        sessionsCompleted: this.metrics.sessionsCompleted,
        avgSession: this.metrics.totalListeningTime / this.metrics.sessionsCompleted,
        completed: session.completed
      });

      // Save all changes
      await this.saveMetrics();

    } catch (error) {
      console.error('Error recording session:', error);
    }
  }

  private updateTransformationMetrics(sessionDuration: number, completed: boolean = false) {
    // Focus Score: Increases more with longer sessions (better concentration)
    const focusBonus = Math.min(sessionDuration / 5, 10) * (completed ? 1 : 0.5);
    this.metrics.focusScore = Math.min(100, (this.metrics.focusScore || 0) + focusBonus);

    // Calm Score: Increases with session completion and streaks
    const calmBonus = (completed ? 5 : 2) + (this.metrics.currentStreak > 0 ? 3 : 0);
    this.metrics.calmScore = Math.min(100, (this.metrics.calmScore || 0) + calmBonus);

    // Control Score: Composite of focus and calm
    this.metrics.controlScore = Math.min(100, ((this.metrics.focusScore || 0) + (this.metrics.calmScore || 0)) / 2);

    // Reality Score: Overall transformation progress
    this.metrics.realityScore = Math.floor(
      ((this.metrics.focusScore || 0) + (this.metrics.calmScore || 0) + (this.metrics.controlScore || 0)) / 3
    );
  }

  private async updateStreak() {
    const today = new Date().toDateString();
    
    if (this.metrics.lastSessionDate === today) {
      return; // Already updated streak today
    }

    if (this.metrics.lastSessionDate) {
      const lastDate = new Date(this.metrics.lastSessionDate);
      const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Streak continues
        this.metrics.currentStreak++;
        if (this.metrics.currentStreak > this.metrics.bestStreak) {
          this.metrics.bestStreak = this.metrics.currentStreak;
        }
      } else if (diffDays > 1) {
        // Streak broken
        this.metrics.currentStreak = 1;
      }
    } else {
      // First session
      this.metrics.currentStreak = 1;
    }

    this.metrics.lastSessionDate = today;
  }

  async resetMetrics() {
    this.metrics = DEFAULT_METRICS;
    await AsyncStorage.multiRemove([METRICS_KEY, SESSIONS_KEY]);
    await this.saveMetrics();
  }

  async getUserMetrics(): Promise<UserMetrics> {
    return this.metrics;
  }
}

export const metricsService = new MetricsService();
