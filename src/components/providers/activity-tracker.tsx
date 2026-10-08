'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { registerStudyTimeFlush, useLearningStore } from '@/stores/learning-store';

/**
 * Real Active Study Time Tracker
 * Pauses when the tab is hidden or idle for 5 minutes; saves unfinished batches.
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
    isDocumentVisibleRef.current = !document.hidden;
    const storageKey = useLearningStore.persist.getOptions().name;
    const courseId = useLearningStore.getState().selectedCourse;
    const flush = () => {
      const seconds = pendingSecondsRef.current;
      pendingSecondsRef.current = 0;
      // An old component's cleanup must never write into the next account.
      if (seconds && useLearningStore.persist.getOptions().name === storageKey) {
        useLearningStore.getState().addStudySeconds(seconds, courseId);
      }
    };
    const unregisterFlush = registerStudyTimeFlush(flush);

    // Reset interaction timestamp on user activity
    const handleActivity = () => {
      lastInteractionRef.current = Date.now();
      setIsIdle(false);
    };

    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = !document.hidden;
      if (!isDocumentVisibleRef.current) {
        flush();
        setIsIdle(true);
      }
    };

    window.addEventListener('pointermove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat every 1 second: counts active time if within 5-min idle window and tab visible
    const timer = setInterval(() => {
      const now = Date.now();
      const idleMillis = now - lastInteractionRef.current;
      const fiveMinutes = 5 * 60 * 1000;

      if (isDocumentVisibleRef.current && idleMillis < fiveMinutes) {
        incrementActiveSeconds(1);
        pendingSecondsRef.current++;
        if (pendingSecondsRef.current>=15) flush();
      } else if (idleMillis >= fiveMinutes) {
        setIsIdle(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timer);
      unregisterFlush();
      flush();
    };
  }, [incrementActiveSeconds, setIsIdle]);

  return null;
}
