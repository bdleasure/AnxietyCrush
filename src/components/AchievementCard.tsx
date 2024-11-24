import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Achievement } from '../services/achievements/types';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

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
  const confettiRef = useRef<ConfettiCannon>(null);

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
      confettiRef.current?.start();
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
      ]).start();
    }
  }, [showAnimation, achievement.isUnlocked]);

  const formattedDate = achievement.dateEarned 
    ? new Date(achievement.dateEarned).toLocaleDateString()
    : null;

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
          achievement.isUnlocked && styles.unlockedContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={achievement.icon as any}
              size={24}
              color={achievement.isUnlocked ? colors.accent : colors.textSecondary}
            />
            {achievement.reward && (
              <View style={styles.rewardBadge}>
                <MaterialCommunityIcons
                  name={achievement.reward.type === 'badge' ? 'medal' : 
                        achievement.reward.type === 'theme' ? 'palette' : 'music'}
                  size={12}
                  color={colors.accent}
                />
              </View>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{achievement.title}</Text>
            <Text style={styles.description}>{achievement.description}</Text>
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }) }
                ]} 
              />
              <Text style={styles.progressText}>
                {achievement.currentProgress} / {achievement.requiredProgress}
              </Text>
            </View>
            {achievement.isUnlocked && formattedDate && (
              <Text style={styles.dateText}>Earned on {formattedDate}</Text>
            )}
          </View>
        </View>
        {showAnimation && (
          <ConfettiCannon
            ref={confettiRef}
            count={50}
            origin={{ x: -10, y: 0 }}
            autoStart={false}
            fadeOut={true}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  unlockedContainer: {
    borderColor: colors.accent,
    borderWidth: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rewardBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.accent,
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
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
