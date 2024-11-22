import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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

  const handleResetMetrics = () => {
    Alert.alert(
      'Reset Metrics',
      'Are you sure you want to reset all metrics to zero? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await metricsService.resetMetrics();
              await loadMetrics(); // Reload metrics after reset
            } catch (error) {
              console.error('Error resetting metrics:', error);
              Alert.alert('Error', 'Failed to reset metrics. Please try again.');
            }
          },
        },
      ]
    );
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
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetMetrics}
        >
          <Text style={styles.resetButtonText}>Reset Progress</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  resetButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    minWidth: 200,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
