import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Achievement } from '../services/achievements/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  achievement: Achievement;
  onPress?: () => void;
  showAnimation?: boolean;
}

export const AchievementCard: React.FC<Props> = ({ 
  achievement, 
  onPress,
  showAnimation = false 
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min((achievement.currentProgress / achievement.requiredProgress) * 100, 100),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [achievement.currentProgress]);

  useEffect(() => {
    if (showAnimation && achievement.isUnlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [showAnimation, achievement.isUnlocked]);

  const formattedDate = achievement.dateEarned 
    ? new Date(achievement.dateEarned).toLocaleDateString()
    : null;

  const getProgressColor = () => {
    const progress = achievement.currentProgress / achievement.requiredProgress;
    if (achievement.isUnlocked) return colors.success;
    if (progress >= 0.7) return colors.warning;
    if (progress >= 0.3) return colors.accent;
    return colors.textSecondary;
  };

  const getBackgroundGradient = () => {
    if (achievement.isUnlocked) {
      switch (achievement.category) {
        case 'beginner':
          return ['#4CAF50', '#2E7D32'];
        case 'intermediate':
          return ['#2196F3', '#1565C0'];
        case 'advanced':
          return ['#9C27B0', '#6A1B9A'];
        case 'master':
          return ['#F44336', '#C62828'];
        case 'special':
          return ['#FFD700', '#FFA000'];
        default:
          return ['#4CAF50', '#2E7D32'];
      }
    }
    return [colors.cardBackground, colors.cardBackground];
  };

  return (
    <TouchableOpacity 
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      activeOpacity={0.7}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            opacity: achievement.isUnlocked ? 1 : 0.7,
          }
        ]}
      >
        <LinearGradient
          colors={getBackgroundGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.glowOverlay,
            {
              opacity: opacityAnim,
            }
          ]}
        />
        <View style={styles.contentContainer}>
          <View style={[
            styles.iconContainer,
            achievement.isUnlocked && styles.unlockedIconContainer
          ]}>
            <MaterialCommunityIcons
              name={achievement.icon as any}
              size={24}
              color={achievement.isUnlocked ? colors.white : colors.textSecondary}
            />
            {achievement.reward && (
              <View style={[
                styles.rewardBadge,
                achievement.isUnlocked && styles.unlockedRewardBadge
              ]}>
                <MaterialCommunityIcons
                  name={achievement.reward.type === 'badge' ? 'medal' : 
                        achievement.reward.type === 'theme' ? 'palette' : 'music'}
                  size={12}
                  color={achievement.isUnlocked ? colors.white : colors.accent}
                />
              </View>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              achievement.isUnlocked && styles.unlockedText
            ]}>
              {achievement.title}
            </Text>
            <Text style={[
              styles.description,
              achievement.isUnlocked && styles.unlockedText
            ]}>
              {achievement.description}
            </Text>
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: getProgressColor(),
                  }
                ]} 
              />
              <Text style={[
                styles.progressText,
                achievement.isUnlocked && styles.unlockedText
              ]}>
                {achievement.currentProgress} / {achievement.requiredProgress}
              </Text>
            </View>
            {achievement.isUnlocked && formattedDate && (
              <Text style={[styles.dateText, styles.unlockedText]}>
                Earned on {formattedDate}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  glowOverlay: {
    backgroundColor: colors.accent,
    opacity: 0.3,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unlockedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  rewardBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  unlockedRewardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: colors.white,
  },
  unlockedText: {
    color: colors.white,
  },
});
