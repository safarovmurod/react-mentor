'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';

/**
 * Real Active Study Time Tracker
 * Pauses on visibilitychange (tab hidden), window blur, or when idle > 5 minutes.
 */
export function ActivityTracker() {
  const incrementActiveSeconds = useAppStore((s) => s.incrementActiveSeconds);
  const setIsIdle = useAppStore((s) => s.setIsIdle);

  const lastInteractionRef = useRef<number>(0);
  const isDocumentVisibleRef = useRef<boolean>(true);
  const pendingSecondsRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    lastInteractionRef.current = Date.now();

    // Reset interaction timestamp on user activity
    const handleActivity = () => {
      lastInteractionRef.current = Date.now();
      setIsIdle(false);
    };

    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = !document.hidden;
      if (!isDocumentVisibleRef.current) {
        setIsIdle(true);
      }
    };

    window.addEventListener('pointermove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat every 1 second: counts active time if within 5-min idle window and tab visible
    const timer = setInterval(() => {
      const now = Date.now();
      const idleMillis = now - lastInteractionRef.current;
      const fiveMinutes = 5 * 60 * 1000;

      if (isDocumentVisibleRef.current && idleMillis < fiveMinutes) {
        incrementActiveSeconds(1);
        pendingSecondsRef.current++;
        if (pendingSecondsRef.current>=15) {useLearningStore.getState().addStudySeconds(pendingSecondsRef.current);pendingSecondsRef.current=0;}
      } else if (idleMillis >= fiveMinutes) {
        setIsIdle(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timer);
      // Do not write on unmount: an account switch may already have changed scope.
      pendingSecondsRef.current=0;
    };
  }, [incrementActiveSeconds, setIsIdle]);

  return null;
}
