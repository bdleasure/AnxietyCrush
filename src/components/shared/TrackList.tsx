import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from './Card';
import { H3, BodySmall, BodyMedium } from './Typography';
import { Button } from './Button';
import { AudioTrackAccess } from '../../services/subscription/types';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { colors } from '../../theme/colors';

interface TrackListProps {
  tracks: AudioTrackAccess[];
  selectedTrack: AudioTrackAccess | null;
  onTrackSelect: (track: AudioTrackAccess) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  selectedTrack,
  onTrackSelect,
}) => {
  const featureAccess = useFeatureAccess();

  const renderTrackCard = useCallback((track: AudioTrackAccess) => {
    const locked = !featureAccess.hasAccessToTrack(track.id);
    const isSelected = selectedTrack?.id === track.id;
    
    return (
      <Card 
        key={track.id} 
        style={styles.trackCard} 
        isSelected={isSelected}
      >
        <TouchableOpacity
          onPress={() => onTrackSelect(track)}
          style={styles.trackButton}
        >
          {locked && (
            <View style={styles.unlockContainer}>
              <Button
                label="Unlock"
                size="small"
                onPress={() => onTrackSelect(track)}
                style={styles.unlockButton}
              />
            </View>
          )}
          <View style={styles.trackInfo}>
            <H3 style={styles.trackTitle}>{track.name}</H3>
            <BodySmall style={styles.trackDuration}>
              {track.duration} minutes
            </BodySmall>
            <BodyMedium style={styles.trackDescription}>
              {track.description}
            </BodyMedium>
          </View>
        </TouchableOpacity>
      </Card>
    );
  }, [selectedTrack, onTrackSelect]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.categorySection}>
        {tracks.map(track => renderTrackCard(track))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 180,
  },
  categorySection: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  trackCard: {
    marginBottom: 16,
  },
  trackButton: {
    position: 'relative',
  },
  unlockContainer: {
    position: 'absolute',
    top: -8,
    right: 0,
    zIndex: 1,
  },
  unlockButton: {
    minWidth: 80,
  },
  trackInfo: {
    flex: 1,
    paddingTop: 16,
  },
  trackTitle: {
    marginBottom: 4,
    color: colors.textPrimary,
  },
  trackDuration: {
    color: colors.accent,
    marginBottom: 8,
  },
  trackDescription: {
    color: colors.textSecondary,
  },
});
