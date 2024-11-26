import { achievementService } from '../achievements/achievementService';
import { ACHIEVEMENTS, Achievement } from '../achievements/types';
import { metricsService } from '../metrics/metricsService';

export class AchievementTester {
  private static async resetAchievement(achievement: Achievement) {
    console.log(`Resetting achievement: ${achievement.id}`);
    try {
      await achievementService.updateProgress(achievement, 0);
    } catch (error) {
      console.error('Error resetting achievement:', error);
    }
    console.log('Reset complete');
  }

  // Session Achievements
  static async testFirstWave() {
    try {
      console.log('Testing First Wave achievement...');
      await this.resetAchievement(ACHIEVEMENTS.FIRST_WAVE);
      await metricsService.updateMetrics({ sessionsCompleted: 1 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.FIRST_WAVE, 1);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing First Wave:', error);
    }
  }

  static async testRealityRookie() {
    try {
      console.log('Testing Reality Rookie achievement...');
      await this.resetAchievement(ACHIEVEMENTS.REALITY_ROOKIE);
      await metricsService.updateMetrics({ sessionsCompleted: 5 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.REALITY_ROOKIE, 5);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Reality Rookie:', error);
    }
  }

  static async testAnxietyMaster() {
    try {
      console.log('Testing Anxiety Master achievement...');
      await this.resetAchievement(ACHIEVEMENTS.ANXIETY_MASTER);
      await metricsService.updateMetrics({ sessionsCompleted: 50 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.ANXIETY_MASTER, 50);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Anxiety Master:', error);
    }
  }

  static async testPatternBreaker() {
    try {
      console.log('Testing Pattern Breaker achievement...');
      await this.resetAchievement(ACHIEVEMENTS.PATTERN_BREAKER);
      await metricsService.updateMetrics({ uniqueSessionTypes: 4 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.PATTERN_BREAKER, 4);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Pattern Breaker:', error);
    }
  }

  // Streak Achievements
  static async testStreakStarter() {
    try {
      console.log('Testing Streak Starter achievement...');
      await this.resetAchievement(ACHIEVEMENTS.STREAK_STARTER);
      await metricsService.updateMetrics({ currentStreak: 3 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.STREAK_STARTER, 3);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Streak Starter:', error);
    }
  }

  static async testStreakMaster() {
    try {
      console.log('Testing Streak Master achievement...');
      await this.resetAchievement(ACHIEVEMENTS.STREAK_MASTER);
      await metricsService.updateMetrics({ currentStreak: 7 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.STREAK_MASTER, 7);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Streak Master:', error);
    }
  }

  static async testStreakLegend() {
    try {
      console.log('Testing Streak Legend achievement...');
      await this.resetAchievement(ACHIEVEMENTS.STREAK_LEGEND);
      await metricsService.updateMetrics({ currentStreak: 30 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.STREAK_LEGEND, 30);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Streak Legend:', error);
    }
  }

  // Time Achievements
  static async testTimeTraveler() {
    try {
      console.log('Testing Time Traveler achievement...');
      await this.resetAchievement(ACHIEVEMENTS.TIME_TRAVELER);
      await metricsService.updateMetrics({ totalListeningTime: 60 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.TIME_TRAVELER, 60);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Time Traveler:', error);
    }
  }

  static async testMindfulMinutes() {
    try {
      console.log('Testing Mindful Minutes achievement...');
      await this.resetAchievement(ACHIEVEMENTS.MINDFUL_MINUTES);
      await metricsService.updateMetrics({ totalListeningTime: 300 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.MINDFUL_MINUTES, 300);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Mindful Minutes:', error);
    }
  }

  static async testHourHero() {
    try {
      console.log('Testing Hour Hero achievement...');
      await this.resetAchievement(ACHIEVEMENTS.HOUR_HERO);
      await metricsService.updateMetrics({ totalListeningTime: 600 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.HOUR_HERO, 600);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Hour Hero:', error);
    }
  }

  // Reality Level Achievements
  static async testRealityRising() {
    try {
      console.log('Testing Reality Rising achievement...');
      await this.resetAchievement(ACHIEVEMENTS.REALITY_RISING);
      await metricsService.updateMetrics({ realityScore: 5 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.REALITY_RISING, 5);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Reality Rising:', error);
    }
  }

  static async testRealityMaster() {
    try {
      console.log('Testing Reality Master achievement...');
      await this.resetAchievement(ACHIEVEMENTS.REALITY_MASTER);
      await metricsService.updateMetrics({ realityScore: 10 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.REALITY_MASTER, 10);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Reality Master:', error);
    }
  }

  static async testRealitySage() {
    try {
      console.log('Testing Reality Sage achievement...');
      await this.resetAchievement(ACHIEVEMENTS.REALITY_SAGE);
      await metricsService.updateMetrics({ realityScore: 20 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.REALITY_SAGE, 20);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Reality Sage:', error);
    }
  }

  // Special Achievements
  static async testEarlyBird() {
    try {
      console.log('Testing Early Bird achievement...');
      await this.resetAchievement(ACHIEVEMENTS.EARLY_BIRD);
      await metricsService.updateMetrics({ morningSessionsCompleted: 5 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.EARLY_BIRD, 5);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Early Bird:', error);
    }
  }

  static async testNightOwl() {
    try {
      console.log('Testing Night Owl achievement...');
      await this.resetAchievement(ACHIEVEMENTS.NIGHT_OWL);
      await metricsService.updateMetrics({ nightSessionsCompleted: 5 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.NIGHT_OWL, 5);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Night Owl:', error);
    }
  }

  static async testWeekendWarrior() {
    try {
      console.log('Testing Weekend Warrior achievement...');
      await this.resetAchievement(ACHIEVEMENTS.WEEKEND_WARRIOR);
      await metricsService.updateMetrics({ consecutiveWeekends: 4 });
      console.log('Updated metrics');
      const result = await achievementService.updateProgress(ACHIEVEMENTS.WEEKEND_WARRIOR, 4);
      console.log('Achievement update result:', result);
    } catch (error) {
      console.error('Error testing Weekend Warrior:', error);
    }
  }
}
