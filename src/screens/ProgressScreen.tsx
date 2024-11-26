import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MetricCard } from '../components/MetricCard';
import { metricsService } from '../services/metrics/metricsService';
import { UserMetrics } from '../services/metrics/types';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
  const navigation = useNavigation();
  const [metrics, setMetrics] = useState<UserMetrics>({
    sessionsCompleted: 0,
    currentStreak: 0,
    realityScore: 0,
    dailyProgress: [],
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

  const getLast7Days = () => {
    const dates = [];
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      
      const progress = metrics.dailyProgress?.find(p => p.date === dateStr);
      data.push(progress?.realityScore || 0);
    }
    
    return { dates, data };
  };

  const { dates, data } = getLast7Days();

  const chartConfig = {
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    color: (opacity = 1) => `rgba(255, 214, 10, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.accent,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeOpacity: 0.2,
    },
    decimalPlaces: 0, // Whole numbers only
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
        <Text style={styles.title}>Reality Transformation</Text>
        <Text style={styles.subtitle}>Watch as anxiety becomes your superpower</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.metricsContainer}>
          <MetricCard 
            value={metrics.sessionsCompleted} 
            label="Sessions" 
          />
          <View style={styles.metricSpacer} />
          <MetricCard 
            value={`${metrics.currentStreak}d`} 
            label="Daily Streak" 
          />
          <View style={styles.metricSpacer} />
          <MetricCard 
            value={metrics.realityScore} 
            label="Progress" 
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Your Transformation Journey</Text>
          <LineChart
            data={{
              labels: dates,
              datasets: [{
                data,
                color: (opacity = 1) => `rgba(255, 214, 10, ${opacity})`,
                strokeWidth: 2,
              }],
            }}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={true}
            segments={5}
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
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricSpacer: {
    width: 12,
  },
  chartContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 16,
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

export default ProgressScreen;
