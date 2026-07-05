import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type FocusState = 'idle' | 'setup' | 'active' | 'recovery' | 'reflection';

export type FocusMode = 'quick-task' | 'creative-flow' | 'deep-work' | 'expansion' | 'reflection';

export interface FocusModeConfig {
  id: FocusMode;
  name: string;
  defaultDuration: number;
  orbitSpeed: number; // multiplier
  ambientColor: string;
  particleDensity: number;
  glowIntensity: number;
}

export const FOCUS_MODES: Record<FocusMode, FocusModeConfig> = {
  'quick-task': {
    id: 'quick-task',
    name: 'Quick Task',
    defaultDuration: 15,
    orbitSpeed: 1.5,
    ambientColor: 'rgba(255, 255, 255, 0.03)',
    particleDensity: 0.8,
    glowIntensity: 0.5
  },
  'creative-flow': {
    id: 'creative-flow',
    name: 'Creative Flow',
    defaultDuration: 45,
    orbitSpeed: 0.8,
    ambientColor: 'rgba(0, 229, 255, 0.04)',
    particleDensity: 1.5,
    glowIntensity: 1.2
  },
  'deep-work': {
    id: 'deep-work',
    name: 'Deep Work',
    defaultDuration: 90,
    orbitSpeed: 0.3,
    ambientColor: 'rgba(0, 0, 0, 0.0)',
    particleDensity: 0.4,
    glowIntensity: 0.2
  },
  'expansion': {
    id: 'expansion',
    name: 'Expansion',
    defaultDuration: 60,
    orbitSpeed: 1.0,
    ambientColor: 'rgba(120, 0, 255, 0.02)',
    particleDensity: 1.0,
    glowIntensity: 0.8
  },
  'reflection': {
    id: 'reflection',
    name: 'Reflection',
    defaultDuration: 15,
    orbitSpeed: 0.2,
    ambientColor: 'rgba(255, 215, 0, 0.02)',
    particleDensity: 0.2,
    glowIntensity: 0.4
  }
};

interface AppState {
  isCaptureModalOpen: boolean;
  openCaptureModal: () => void;
  closeCaptureModal: () => void;
  toggleCaptureModal: () => void;
  
  isThoughtParkingOpen: boolean;
  toggleThoughtParkingOpen: () => void;
  closeThoughtParking: () => void;
  
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  

  isMentalInboxOpen: boolean;
  setMentalInboxOpen: (isOpen: boolean) => void;

  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
  
  activeFocusMode: FocusMode;
  setActiveFocusMode: (mode: FocusMode) => void;
  
  focusState: FocusState;
  activeTaskId: string | null;
  sessionIntention: string;
  sessionDuration: number;
  sessionCaptures: string[];
  sessionStartedAt: number | null;
  sessionEndsAt: number | null;
  isRecoveringSession: boolean;
  isTimerPaused: boolean;
  timerPausedAt: number | null;
  
  setFocusState: (state: FocusState) => void;
  setActiveTaskId: (id: string | null) => void;
  setSessionIntention: (intention: string) => void;
  setSessionDuration: (minutes: number) => void;
  addSessionCapture: (capture: string) => void;
  startFocusSession: () => void;
  openFocusSetup: () => void;
  extendFocusSession: (minutes: number) => void;
  resumeFocusSession: () => void;
  resetFocusSession: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

export const useStore = create<AppState>()(persist((set) => ({
  isCaptureModalOpen: false,
  openCaptureModal: () => set({ isCaptureModalOpen: true }),
  closeCaptureModal: () => set({ isCaptureModalOpen: false }),
  toggleCaptureModal: () => set((state) => ({ isCaptureModalOpen: !state.isCaptureModalOpen })),
  
  isThoughtParkingOpen: false,
  toggleThoughtParkingOpen: () => set((state) => ({ isThoughtParkingOpen: !state.isThoughtParkingOpen })),
  closeThoughtParking: () => set({ isThoughtParkingOpen: false }),
  
  isSettingsModalOpen: false,
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  

  isMentalInboxOpen: false,
  setMentalInboxOpen: (isOpen) => set({ isMentalInboxOpen: isOpen }),

  activeListId: null,
  setActiveListId: (id) => set({ activeListId: id }),
  
  activeFocusMode: 'deep-work',
  setActiveFocusMode: (mode) => set({ activeFocusMode: mode }),
  
  focusState: 'idle',
  activeTaskId: null,
  sessionIntention: '',
  sessionDuration: 25,
  sessionCaptures: [],
  sessionStartedAt: null,
  sessionEndsAt: null,
  isRecoveringSession: false,
  isTimerPaused: false,
  timerPausedAt: null,
  
  setFocusState: (state) => set({ focusState: state }),
  setActiveTaskId: (id) => set({ activeTaskId: id }),
  setSessionIntention: (intention) => set({ sessionIntention: intention }),
  setSessionDuration: (minutes) => set({ sessionDuration: minutes }),
  addSessionCapture: (capture) => set((state) => ({ sessionCaptures: [...state.sessionCaptures, capture] })),
  startFocusSession: () => set((state) => ({ 
    focusState: 'active', 
    sessionStartedAt: Date.now(), 
    sessionEndsAt: Date.now() + (state.sessionDuration * 60 * 1000),
    isRecoveringSession: false 
  })),
  openFocusSetup: () => set({ focusState: 'setup' }),
  extendFocusSession: (minutes) => set((state) => {
    if (!state.sessionEndsAt) return {};
    const newEndsAt = Math.max(Date.now() + 1000, state.sessionEndsAt + (minutes * 60 * 1000));
    const actualMinutesDelta = (newEndsAt - state.sessionEndsAt) / (60 * 1000);
    return {
      sessionEndsAt: newEndsAt,
      sessionDuration: Math.max(1, state.sessionDuration + actualMinutesDelta)
    };
  }),
  resumeFocusSession: () => set({ isRecoveringSession: false }),
  resetFocusSession: () => set({ 
    focusState: 'idle', 
    activeTaskId: null, 
    sessionIntention: '', 
    sessionDuration: 25, 
    sessionCaptures: [],
    sessionStartedAt: null,
    sessionEndsAt: null,
    isRecoveringSession: false,
    isTimerPaused: false,
    timerPausedAt: null
  }),
  pauseTimer: () => set({ isTimerPaused: true, timerPausedAt: Date.now() }),
  resumeTimer: () => set((state) => {
    if (!state.timerPausedAt || !state.sessionEndsAt) {
      return { isTimerPaused: false, timerPausedAt: null };
    }
    const pausedDuration = Date.now() - state.timerPausedAt;
    return {
      isTimerPaused: false,
      timerPausedAt: null,
      sessionEndsAt: state.sessionEndsAt + pausedDuration
    };
  }),
}), {
  name: 'neuropulse-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    activeFocusMode: state.activeFocusMode,
    focusState: state.focusState,
    activeTaskId: state.activeTaskId,
    sessionIntention: state.sessionIntention,
    sessionDuration: state.sessionDuration,
    sessionCaptures: state.sessionCaptures,
    sessionStartedAt: state.sessionStartedAt,
    sessionEndsAt: state.sessionEndsAt,
    isTimerPaused: state.isTimerPaused,
    timerPausedAt: state.timerPausedAt,
  }),
  onRehydrateStorage: () => (state) => {
    if (state && (state.focusState === 'active' || state.focusState === 'recovery' || state.focusState === 'setup')) {
      if (state.sessionEndsAt && Date.now() < state.sessionEndsAt) {
        state.isRecoveringSession = true;
      } else if (state.sessionEndsAt && Date.now() >= state.sessionEndsAt && state.focusState === 'active') {
        // Automatically put into reflection if it expired while closed
        state.focusState = 'reflection';
        state.isRecoveringSession = true;
      } else if (state.focusState === 'setup') {
        state.focusState = 'idle'; // Cancel setup if reloaded
      } else {
        // If it was in recovery and expired, or something else
        state.isRecoveringSession = true;
      }
    }
  }
}));
