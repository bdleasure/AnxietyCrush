import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { achievementService } from '../services/achievements/achievementService';
import { Achievement } from '../services/achievements/types';
import { AchievementCard } from './AchievementCard';

export const AchievementOverlay: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const slideAnim = React.useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    console.log('AchievementOverlay mounted');
    const unsubscribe = achievementService.onAchievementUnlocked((achievement) => {
      console.log('Achievement unlocked:', achievement);
      setAchievements(prev => [...prev, achievement]);
      
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 20,
        useNativeDriver: true,
      }).start();

      // After 3 seconds, slide out and remove
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setAchievements(prev => prev.filter(a => a.id !== achievement.id));
        });
      }, 3000);
    });

    return () => {
      console.log('AchievementOverlay unmounting');
      unsubscribe();
    };
  }, []);

  if (achievements.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {achievements.map(achievement => (
        <Animated.View
          key={achievement.id}
          style={[
            styles.cardContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <AchievementCard
            achievement={achievement}
            showAnimation={true}
          />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  cardContainer: {
    width: '90%',
    marginTop: 20,
  },
});
