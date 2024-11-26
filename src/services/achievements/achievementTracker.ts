import { achievementService } from './achievementService';
import { ACHIEVEMENTS } from './types';
import { metricsService } from '../metrics/metricsService';

class AchievementTracker {
  async trackSessionCompletion(trackId: string, duration: number) {
    const metrics = await metricsService.getUserMetrics();
    const completedTracks = new Set((await metricsService.getStoredSessions()).map(s => s.trackId));

    // Track first session completion
    if (metrics.sessionsCompleted === 1) {
      await achievementService.updateProgress(ACHIEVEMENTS.FIRST_WAVE, 1);
    }

    // Track total sessions
    if (metrics.sessionsCompleted >= 5) {
      await achievementService.updateProgress(ACHIEVEMENTS.REALITY_ROOKIE, 5);
    }
    if (metrics.sessionsCompleted >= 50) {
      await achievementService.updateProgress(ACHIEVEMENTS.ANXIETY_MASTER, 50);
    }

    // Track unique session types completed
    const uniqueTracksCompleted = completedTracks.size;
    await achievementService.updateProgress(ACHIEVEMENTS.PATTERN_BREAKER, uniqueTracksCompleted);

    // Track streaks
    if (metrics.currentStreak >= 3) {
      await achievementService.updateProgress(ACHIEVEMENTS.STREAK_STARTER, metrics.currentStreak);
    }
    if (metrics.currentStreak >= 7) {
      await achievementService.updateProgress(ACHIEVEMENTS.STREAK_MASTER, metrics.currentStreak);
    }
    if (metrics.currentStreak >= 30) {
      await achievementService.updateProgress(ACHIEVEMENTS.STREAK_LEGEND, metrics.currentStreak);
    }

    // Track total time
    const totalHours = metrics.totalListeningTime / 3600;
    if (totalHours >= 1) {
      await achievementService.updateProgress(ACHIEVEMENTS.TIME_TRAVELER, Math.floor(totalHours));
    }
    if (totalHours >= 5) {
      await achievementService.updateProgress(ACHIEVEMENTS.MINDFUL_MINUTES, Math.floor(totalHours));
    }
    if (totalHours >= 10) {
      await achievementService.updateProgress(ACHIEVEMENTS.HOUR_HERO, Math.floor(totalHours));
    }

    // Track reality score achievements
    if (metrics.realityScore >= 100) {
      await achievementService.updateProgress(ACHIEVEMENTS.REALITY_RISING, Math.floor(metrics.realityScore / 100));
    }
    if (metrics.realityScore >= 500) {
      await achievementService.updateProgress(ACHIEVEMENTS.REALITY_MASTER, Math.floor(metrics.realityScore / 100));
    }
    if (metrics.realityScore >= 1000) {
      await achievementService.updateProgress(ACHIEVEMENTS.REALITY_SAGE, Math.floor(metrics.realityScore / 100));
    }

    // Track time-of-day achievements
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour <= 8) {
      await achievementService.updateProgress(ACHIEVEMENTS.EARLY_BIRD, 1);
    }
    if (currentHour >= 22 || currentHour <= 4) {
      await achievementService.updateProgress(ACHIEVEMENTS.NIGHT_OWL, 1);
    }
  }
}

export const achievementTracker = new AchievementTracker();
