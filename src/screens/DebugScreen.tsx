import React from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { Button } from '../components/shared/Button';
import { achievementService } from '../services/achievements/achievementService';
import { metricsService } from '../services/metrics/metricsService';
import { AchievementTester } from '../services/debug/achievementTester';

const DebugScreen: React.FC = () => {
  const [totalTime, setTotalTime] = React.useState('0');
  const [avgSession, setAvgSession] = React.useState('0');
  const [bestStreak, setBestStreak] = React.useState('0');
  const [realityScore, setRealityScore] = React.useState('0');
  const [focusScore, setFocusScore] = React.useState('0');
  const [calmScore, setCalmScore] = React.useState('0');
  const [controlScore, setControlScore] = React.useState('0');

  const resetAll = async () => {
    await achievementService.resetProgress();
    await metricsService.resetMetrics();
  };

  const updateMetrics = async () => {
    await metricsService.updateDebugMetrics({
      totalListeningTime: parseInt(totalTime, 10),
      averageSessionLength: parseInt(avgSession, 10),
      bestStreak: parseInt(bestStreak, 10),
      realityScore: parseInt(realityScore, 10),
      focusScore: parseInt(focusScore, 10),
      calmScore: parseInt(calmScore, 10),
      controlScore: parseInt(controlScore, 10),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Core Metrics Debug</Text>
        
        <View style={styles.metricInput}>
          <Text style={styles.label}>Total Time (minutes)</Text>
          <TextInput
            style={styles.input}
            value={totalTime}
            onChangeText={setTotalTime}
            keyboardType="numeric"
            placeholder="Enter total time"
          />
        </View>

        <View style={styles.metricInput}>
          <Text style={styles.label}>Avg Session (minutes)</Text>
          <TextInput
            style={styles.input}
            value={avgSession}
            onChangeText={setAvgSession}
            keyboardType="numeric"
            placeholder="Enter avg session"
          />
        </View>

        <View style={styles.metricInput}>
          <Text style={styles.label}>Best Streak (days)</Text>
          <TextInput
            style={styles.input}
            value={bestStreak}
            onChangeText={setBestStreak}
            keyboardType="numeric"
            placeholder="Enter best streak"
          />
        </View>

        <View style={styles.metricInput}>
          <Text style={styles.label}>Reality Score</Text>
          <TextInput
            style={styles.input}
            value={realityScore}
            onChangeText={setRealityScore}
            keyboardType="numeric"
            placeholder="Enter reality score"
          />
        </View>

        <Text style={[styles.sectionTitle, styles.transformTitle]}>Transformation Metrics</Text>

        <View style={styles.metricInput}>
          <Text style={styles.label}>Focus Score (Overthinking → Clarity)</Text>
          <TextInput
            style={styles.input}
            value={focusScore}
            onChangeText={setFocusScore}
            keyboardType="numeric"
            placeholder="Enter focus score"
          />
        </View>

        <View style={styles.metricInput}>
          <Text style={styles.label}>Calm Score (Anxiety → Calm)</Text>
          <TextInput
            style={styles.input}
            value={calmScore}
            onChangeText={setCalmScore}
            keyboardType="numeric"
            placeholder="Enter calm score"
          />
        </View>

        <View style={styles.metricInput}>
          <Text style={styles.label}>Control Score (Chaos → Control)</Text>
          <TextInput
            style={styles.input}
            value={controlScore}
            onChangeText={setControlScore}
            keyboardType="numeric"
            placeholder="Enter control score"
          />
        </View>

        <Button
          label="Update All Metrics"
          onPress={updateMetrics}
          style={styles.updateButton}
        />

        <View style={styles.divider} />

        <Button
          label="Reset All Progress"
          onPress={resetAll}
          style={[styles.button, styles.resetButton]}
          variant="danger"
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Achievement Tests</Text>
        
        {/* Session Achievements */}
        <Button
          label="First Wave (Complete 1 Session)"
          onPress={() => AchievementTester.testFirstWave()}
          style={styles.button}
        />
        <Button
          label="Reality Rookie (Complete 5 Sessions)"
          onPress={() => AchievementTester.testRealityRookie()}
          style={styles.button}
        />
        <Button
          label="Anxiety Master (Complete 50 Sessions)"
          onPress={() => AchievementTester.testAnxietyMaster()}
          style={styles.button}
        />
        <Button
          label="Pattern Breaker (All Session Types)"
          onPress={() => AchievementTester.testPatternBreaker()}
          style={styles.button}
        />

        <View style={styles.divider} />

        {/* Streak Achievements */}
        <Button
          label="Streak Starter (3-Day Streak)"
          onPress={() => AchievementTester.testStreakStarter()}
          style={styles.button}
        />
        <Button
          label="Streak Master (7-Day Streak)"
          onPress={() => AchievementTester.testStreakMaster()}
          style={styles.button}
        />
        <Button
          label="Streak Legend (30-Day Streak)"
          onPress={() => AchievementTester.testStreakLegend()}
          style={styles.button}
        />

        <View style={styles.divider} />

        {/* Time Achievements */}
        <Button
          label="Time Traveler (1 Hour)"
          onPress={() => AchievementTester.testTimeTraveler()}
          style={styles.button}
        />
        <Button
          label="Mindful Minutes (5 Hours)"
          onPress={() => AchievementTester.testMindfulMinutes()}
          style={styles.button}
        />
        <Button
          label="Hour Hero (10 Hours)"
          onPress={() => AchievementTester.testHourHero()}
          style={styles.button}
        />

        <View style={styles.divider} />

        {/* Reality Achievements */}
        <Button
          label="Reality Rising (Level 5)"
          onPress={() => AchievementTester.testRealityRising()}
          style={styles.button}
        />
        <Button
          label="Reality Master (Level 10)"
          onPress={() => AchievementTester.testRealityMaster()}
          style={styles.button}
        />
        <Button
          label="Reality Sage (Level 20)"
          onPress={() => AchievementTester.testRealitySage()}
          style={styles.button}
        />

        <View style={styles.divider} />

        {/* Special Achievements */}
        <Button
          label="Early Bird (5 Morning Sessions)"
          onPress={() => AchievementTester.testEarlyBird()}
          style={styles.button}
        />
        <Button
          label="Night Owl (5 Night Sessions)"
          onPress={() => AchievementTester.testNightOwl()}
          style={styles.button}
        />
        <Button
          label="Weekend Warrior (4 Weekend Streaks)"
          onPress={() => AchievementTester.testWeekendWarrior()}
          style={styles.button}
        />
        
        {/* Add bottom padding to ensure all buttons are accessible */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  button: {
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: colors.error,
  },
  divider: {
    height: 16,
  },
  bottomPadding: {
    height: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
  },
  transformTitle: {
    marginTop: 16,
  },
  metricInput: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    color: 'white',
    backgroundColor: colors.cardBackground,
  },
  updateButton: {
    marginBottom: 16,
  },
});

export default DebugScreen;
