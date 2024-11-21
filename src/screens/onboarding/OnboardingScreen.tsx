import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { colors } from '../../theme/colors';
import { OnboardingIllustration } from '../../components/onboarding/OnboardingIllustration';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  type: 'welcome' | 'benefit' | 'how' | 'start';
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'Welcome to AnxietyCrush™',
    description: 'Transform your anxiety into empowerment with our revolutionary Reality Wave™ technology.',
  },
  {
    id: 'benefit',
    type: 'benefit',
    title: 'Your Path to Calm',
    description: 'Experience immediate anxiety relief and long-term transformation through scientifically designed audio sessions.',
  },
  {
    id: 'how',
    type: 'how',
    title: 'How It Works',
    description: 'Our Reality Wave™ technology uses precise 10 Hz Alpha frequencies to help rewire your anxiety response naturally.',
  },
  {
    id: 'start',
    type: 'start',
    title: 'Ready to Begin',
    description: 'Start with our signature 11-Minute Anxiety Crusher™ session and feel the difference immediately.',
  },
];

export const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const animationValue = useRef(new Animated.Value(1)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const triggerAnimation = () => {
    animationValue.setValue(0);
    Animated.spring(animationValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Animate dot scale
    Animated.sequence([
      Animated.timing(dotScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(dotScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    triggerAnimation();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          if (index !== currentIndex) {
            setCurrentIndex(index);
            triggerAnimation();
          }
        }}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <OnboardingIllustration
              type={slide.type}
              animValue={animationValue}
            />
            <Animated.View
              style={[
                styles.textContainer,
                {
                  opacity: animationValue,
                  transform: [
                    {
                      translateY: animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index && styles.paginationDotActive,
                currentIndex === index && {
                  transform: [{ scale: dotScale }],
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentIndex < SLIDES.length - 1 ? (
            <>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleNext} 
                style={[styles.nextButton, { transform: [{ scale: 1 }] }]}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              onPress={handleNext} 
              style={[styles.getStartedButton, { transform: [{ scale: 1 }] }]}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 300,
    letterSpacing: 0.3,
  },
  footer: {
    padding: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  paginationDotActive: {
    backgroundColor: colors.accent,
    width: 24,
    opacity: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 15,
  },
  skipButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  getStartedButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedButtonText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
