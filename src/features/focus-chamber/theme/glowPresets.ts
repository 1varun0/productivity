// Glow presets for different focus modes to maintain cohesive atmospheric lighting

import type { FocusMode } from '@/store/useStore';

export const GLOW_PRESETS: Record<FocusMode, string> = {
  'quick-task': 'rgba(255, 255, 255, 0.03)',
  'creative-flow': 'rgba(0, 229, 255, 0.04)',
  'deep-work': 'rgba(0, 0, 0, 0.0)',
  'expansion': 'rgba(120, 0, 255, 0.02)',
  'reflection': 'rgba(255, 215, 0, 0.02)',
};

export const ORBITAL_COLORS: Record<FocusMode, string> = {
  'quick-task': 'rgba(255, 255, 255, 0.8)',
  'creative-flow': 'rgba(0, 229, 255, 0.7)',
  'deep-work': 'rgba(50, 50, 50, 0.9)',
  'expansion': 'rgba(120, 0, 255, 0.6)',
  'reflection': 'rgba(255, 215, 0, 0.5)',
};
