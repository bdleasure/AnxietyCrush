import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BonusContent = {
  id: string;
  name: string;
  duration?: number;
  type: 'audio' | 'pdf';
  description: string;
  locked?: boolean;
};

const BONUS_CONTENT: BonusContent[] = [
  {
    id: 'success-pattern',
    name: 'Success Pattern Activator™',
    duration: 10,
    type: 'audio',
    description: 'Activate your natural success patterns',
  },
  {
    id: 'focus-field',
    name: 'Focus Field Generator™',
    duration: 7,
    type: 'audio',
    description: 'Generate laser-sharp focus instantly',
  },
  {
    id: 'sleep-wave',
    name: 'Sleep Enhancement Wave™',
    duration: 10,
    type: 'audio',
    description: 'Enhance your sleep quality naturally',
  },
  {
    id: 'reality-guide',
    name: 'Reality Mastery Guide',
    type: 'pdf',
    description: 'Comprehensive guide to reality transformation',
  },
];

const BonusCard = ({ 
  content, 
  isSelected, 
  onSelect 
}: { 
  content: BonusContent; 
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <View style={styles.cardContainer}>
      {isSelected ? (
        <LinearGradient
          colors={['#FFD700', '#9400D3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        >
          <TouchableOpacity style={styles.card} onPress={onSelect}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{content.name}</Text>
              <Text style={styles.cardDescription}>{content.description}</Text>
              {content.duration && (
                <Text style={styles.cardDuration}>{content.duration} min</Text>
              )}
              <Text style={styles.cardType}>
                {content.type === 'audio' ? '🎧 Audio Session' : '📄 PDF Guide'}
              </Text>
              <View style={styles.selectedDot} />
            </View>
          </TouchableOpacity>
        </LinearGradient>
      ) : (
        <TouchableOpacity style={styles.card} onPress={onSelect}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{content.name}</Text>
            <Text style={styles.cardDescription}>{content.description}</Text>
            {content.duration && (
              <Text style={styles.cardDuration}>{content.duration} min</Text>
            )}
            <Text style={styles.cardType}>
              {content.type === 'audio' ? '🎧 Audio Session' : '📄 PDF Guide'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const BonusVaultScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  // Initialize with the first content item's ID
  const [selectedContentId, setSelectedContentId] = useState<string>(BONUS_CONTENT[0].id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Bonus Vault</Text>
        <Text style={styles.subheading}>Your Exclusive Reality Tools</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {BONUS_CONTENT.map((content) => (
            <BonusCard 
              key={content.id} 
              content={content}
              isSelected={content.id === selectedContentId}
              onSelect={() => setSelectedContentId(content.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  heading: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardBorder: {
    padding: 2.5,
    borderRadius: 16,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardDuration: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  selectedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
});
