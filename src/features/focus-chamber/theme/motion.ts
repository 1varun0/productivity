// Shared motion and easing constants for cinematic consistency

export const EASING = {
  // Cinematic, slow-start, smooth-end
  cinematic: [0.16, 1, 0.3, 1] as const,
  // Emotional breathing or pulsing
  breathe: [0.4, 0, 0.2, 1] as const,
  // Snappy but soft UI expansion
  softExpand: [0.2, 0.8, 0.2, 1] as const,
  // Linear for orbits
  linear: "linear",
};

export const DURATIONS = {
  veryFast: 0.2,
  fast: 0.4,
  base: 0.8,
  slow: 1.5,
  verySlow: 3.0,
  epic: 5.0,
};

export const TRANSITIONS = {
  ambientShift: { duration: DURATIONS.slow, ease: EASING.cinematic },
  panelHover: { duration: DURATIONS.fast, ease: EASING.softExpand },
  breathePulse: { duration: DURATIONS.epic, ease: EASING.breathe, repeat: Infinity, repeatType: "reverse" as const },
  orbPulsing: { duration: DURATIONS.verySlow, ease: EASING.breathe, repeat: Infinity, repeatType: "reverse" as const },
  dissolve: { duration: DURATIONS.base, ease: EASING.cinematic },
};
