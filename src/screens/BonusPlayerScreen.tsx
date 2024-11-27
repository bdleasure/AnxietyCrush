import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { H1, H3, BodyMedium, BodySmall } from '../components/shared/Typography';
import { AudioPlayer } from '../components/AudioPlayer';
import { AudioTrackAccess } from '../services/subscription/types';
import { colors } from '../theme/colors';
import { BONUS_TRACKS } from '../constants/tracks';
import { featureAccess } from '../services/subscription/featureAccess';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { availableTracks, lockedTracks } = (() => ({
  availableTracks: BONUS_TRACKS.filter(track => featureAccess.hasAccessToTrack(track.id)),
  lockedTracks: BONUS_TRACKS.filter(track => !featureAccess.hasAccessToTrack(track.id))
}))();

// Pre-compute initial track
const initialTrack = availableTracks[0] || BONUS_TRACKS[0];

export default function BonusPlayerScreen({ navigation }) {
  const [selectedTrack, setSelectedTrack] = useState<AudioTrackAccess>(initialTrack);
  const insets = useSafeAreaInsets();

  // Show upgrade dialog
  const showUpgradeDialog = useCallback((track: AudioTrackAccess) => {
    Alert.alert(
      'Premium Content',
      'This track is only available to premium subscribers. Upgrade now to access all content!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: () => navigation.navigate('Upgrade')
        }
      ]
    );
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <H1 style={styles.title}>Bonus Content</H1>
        <BodyMedium style={styles.subtitle}>Explore additional reality waves</BodyMedium>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categorySection}>
          {[...availableTracks, ...lockedTracks].map((track) => (
            <Card 
              key={track.id} 
              style={[styles.trackCard, { borderWidth: 0 }]}
              isSelected={selectedTrack?.id === track.id}
            >
              <TouchableOpacity
                onPress={() => setSelectedTrack(track)}
                style={styles.trackButton}
              >
                {!featureAccess.hasAccessToTrack(track.id) && (
                  <View style={styles.unlockContainer}>
                    <Button
                      label="Unlock"
                      size="small"
                      onPress={() => navigation.navigate('Upgrade')}
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
          ))}
        </View>
      </ScrollView>

      {selectedTrack && (
        <View style={[styles.audioControlsContainer, { paddingBottom: insets.bottom + 60 }]} >
          <AudioPlayer
            selectedTrack={selectedTrack}
            onTrackSelect={setSelectedTrack}
            showUpgradeDialog={showUpgradeDialog}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
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
    paddingBottom: 8,
  },
  trackTitle: {
    fontSize: 15,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  trackDuration: {
    fontSize: 11,
    color: colors.accent,
    marginBottom: 12,
  },
  trackDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  audioControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: 16,
    zIndex: 2,
  },
});