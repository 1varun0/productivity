// Shared ambient styles for glassmorphism and layer blending

export const AMBIENT_STYLES = {
  // Ultra-light glass for floating panels (idle)
  glassPanelIdle: 'bg-white/[0.01] border border-white/[0.02] backdrop-blur-[2px]',
  // Expanded/Hovered glass
  glassPanelActive: 'bg-white/[0.03] border border-white/[0.06] backdrop-blur-md',
  
  // Text opacities for visual hierarchy
  textMuted: 'text-white/30',
  textBase: 'text-white/60',
  textHighlight: 'text-white/90',

  // Subtle shadows instead of harsh borders
  dropShadowSoft: 'drop-shadow(0 4px 20px rgba(0,0,0,0.4))',
  dropShadowGlow: 'drop-shadow(0 0 30px rgba(255,255,255,0.05))',
};
