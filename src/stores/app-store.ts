import { create } from 'zustand';
import { DataMode, StateManagerType, PracticeLevel } from '@/types';

interface AppState {
  // Navigation & UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Active data mode & Managers
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;

  practiceManager: StateManagerType;
  setPracticeManager: (mgr: StateManagerType) => void;

  practiceLevel: PracticeLevel;
  setPracticeLevel: (lvl: PracticeLevel) => void;

  // Tutor drawer state
  tutorDrawerOpen: boolean;
  setTutorDrawerOpen: (open: boolean) => void;
  tutorQuestion: { id: string; text: string } | null;
  setTutorQuestion: (question: { id: string; text: string } | null) => void;

  // Active study time tracking (seconds today)
  activeSecondsToday: number;
  incrementActiveSeconds: (secs?: number) => void;
  isIdle: boolean;
  setIsIdle: (idle: boolean) => void;

  // Sync state
  syncStatus: 'local' | 'syncing' | 'synced' | 'offline' | 'error';
  setSyncStatus: (status: 'local' | 'syncing' | 'synced' | 'offline' | 'error') => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  dataMode: 'local',
  setDataMode: (dataMode) => set({ dataMode }),

  practiceManager: 'react_local',
  setPracticeManager: (practiceManager) => set({ practiceManager }),

  practiceLevel: 1,
  setPracticeLevel: (practiceLevel) => set({ practiceLevel }),

  tutorDrawerOpen: false,
  setTutorDrawerOpen: (tutorDrawerOpen) => set({ tutorDrawerOpen }),
  tutorQuestion: null,
  setTutorQuestion: (tutorQuestion) => set({ tutorQuestion }),

  activeSecondsToday: 0,
  incrementActiveSeconds: (secs = 1) =>
    set((state) => ({ activeSecondsToday: state.activeSecondsToday + secs })),
  isIdle: false,
  setIsIdle: (isIdle) => set({ isIdle }),

  syncStatus: 'local',
  setSyncStatus: (syncStatus) => set({ syncStatus }),
}));
