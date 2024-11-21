import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Svg, Circle, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface IllustrationProps {
  type: 'welcome' | 'benefit' | 'how' | 'start';
  animValue: Animated.Value;
}

export const OnboardingIllustration: React.FC<IllustrationProps> = ({ type, animValue }) => {
  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rotation = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderIllustration = () => {
    switch (type) {
      case 'welcome':
        return (
          <Svg width="200" height="200" viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.accent} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Circle cx="50" cy="50" r="45" fill="url(#grad)" />
            <Path
              d="M30 50 L70 50 M50 30 L50 70"
              stroke={colors.background}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'benefit':
        return (
          <Svg width="200" height="200" viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.accent} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d="M10 50 Q 25 30, 40 50 T 70 50 T 100 50"
              stroke="url(#waveGrad)"
              strokeWidth="5"
              fill="none"
            />
            <Path
              d="M10 70 Q 25 50, 40 70 T 70 70 T 100 70"
              stroke="url(#waveGrad)"
              strokeWidth="5"
              fill="none"
              opacity="0.7"
            />
          </Svg>
        );

      case 'how':
        return (
          <Svg width="200" height="200" viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="brainGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.accent} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <G>
              <Path
                d="M20 50 C 20 30, 80 30, 80 50 C 80 70, 20 70, 20 50"
                fill="url(#brainGrad)"
              />
              <Path
                d="M35 40 C 35 35, 45 35, 45 40 C 45 45, 35 45, 35 40"
                fill={colors.background}
              />
              <Path
                d="M55 40 C 55 35, 65 35, 65 40 C 65 45, 55 45, 55 40"
                fill={colors.background}
              />
              <Path
                d="M40 60 C 40 55, 60 55, 60 60"
                stroke={colors.background}
                strokeWidth="3"
                fill="none"
              />
            </G>
          </Svg>
        );

      case 'start':
        return (
          <Svg width="200" height="200" viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="startGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.accent} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Circle cx="50" cy="50" r="40" fill="url(#startGrad)" />
            <Path
              d="M40 30 L70 50 L40 70 Z"
              fill={colors.background}
            />
          </Svg>
        );
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale },
            { rotate: rotation }
          ],
          opacity
        }
      ]}
    >
      {renderIllustration()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
});
