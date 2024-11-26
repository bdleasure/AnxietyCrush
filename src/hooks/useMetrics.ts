import { useCallback } from 'react';
import { metricsService } from '../services/metrics/metricsService';
import { AudioTrackAccess } from '../services/subscription/types';

export const useMetrics = () => {
  const recordSessionStart = useCallback((track: AudioTrackAccess) => {
    metricsService.recordEvent('session_started', {
      trackId: track.id,
      trackName: track.name,
      trackDuration: track.duration,
    });
  }, []);

  const recordSessionComplete = useCallback((track: AudioTrackAccess, duration: number) => {
    metricsService.recordEvent('session_completed', {
      trackId: track.id,
      trackName: track.name,
      trackDuration: track.duration,
      sessionDuration: duration,
    });
  }, []);

  const recordSessionPause = useCallback((track: AudioTrackAccess, duration: number) => {
    metricsService.recordEvent('session_paused', {
      trackId: track.id,
      trackName: track.name,
      trackDuration: track.duration,
      sessionDuration: duration,
    });
  }, []);

  const recordSessionResume = useCallback((track: AudioTrackAccess, duration: number) => {
    metricsService.recordEvent('session_resumed', {
      trackId: track.id,
      trackName: track.name,
      trackDuration: track.duration,
      sessionDuration: duration,
    });
  }, []);

  const recordSessionCancel = useCallback((track: AudioTrackAccess, duration: number) => {
    metricsService.recordEvent('session_cancelled', {
      trackId: track.id,
      trackName: track.name,
      trackDuration: track.duration,
      sessionDuration: duration,
    });
  }, []);

  return {
    recordSessionStart,
    recordSessionComplete,
    recordSessionPause,
    recordSessionResume,
    recordSessionCancel,
  };
};
