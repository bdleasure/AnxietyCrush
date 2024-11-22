import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Achievement } from '../services/achievements/types';

interface Props {
  achievement: Achievement;
}

export const AchievementCard: React.FC<Props> = ({ achievement }) => {
  const progress = Math.min(
    (achievement.currentProgress / achievement.requiredProgress) * 100,
    100
  );

  return (
    <View style={[
      styles.container,
      achievement.isUnlocked && styles.unlockedContainer
    ]}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={achievement.icon as any}
            size={24}
            color={achievement.isUnlocked ? colors.accent : colors.textSecondary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
            <Text style={styles.progressText}>
              {achievement.currentProgress} / {achievement.requiredProgress}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  unlockedContainer: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  contentContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '500',
    marginTop: 4,
  },
});
