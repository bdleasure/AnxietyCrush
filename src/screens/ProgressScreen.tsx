import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MetricCard } from '../components/MetricCard';
import { metricsService } from '../services/metrics/metricsService';
import { UserMetrics } from '../services/metrics/types';
import { useNavigation } from '@react-navigation/native';

export const ProgressScreen = () => {
  const navigation = useNavigation();
  const [metrics, setMetrics] = useState<UserMetrics>({
    sessionsCompleted: 0,
    currentStreak: 0,
    realityScore: 0,
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const userMetrics = await metricsService.getUserMetrics();
      setMetrics(userMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  // Refresh metrics when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMetrics();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Tracking</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.metricsContainer}>
          <MetricCard 
            value={metrics.sessionsCompleted} 
            label="Total Sessions" 
          />
          <View style={styles.metricSpacer} />
          <MetricCard 
            value={`${metrics.currentStreak}d`} 
            label="Day Streak" 
          />
          <View style={styles.metricSpacer} />
          <MetricCard 
            value={metrics.realityScore} 
            label="Reality Level" 
          />
        </View>
        <Text style={styles.subtitle}>Your Transformation Journey</Text>
        {/* Add additional progress tracking UI here */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  title: {
    fontSize: 17.6,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    height: 100,
  },
  metricSpacer: {
    width: 12,
  },
  subtitle: {
    fontSize: 14.4,
    color: colors.textSecondary,
    marginBottom: 20,
  },
});
