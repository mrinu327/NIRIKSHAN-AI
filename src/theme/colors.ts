/**
 * Design System - Color Palette
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * Polished MoSJE government e-governance platform palette:
 * Authoritative, trustworthy, calm, precise.
 *
 * Master Palette:
 * Navy #0B1220 | Blue #2A5CE0 | Slate #5B6472 | BG #F7F8FA
 * White #FFFFFF | Amber #D98C1E | Red #C4402C | Green #1E8E5A
 */

export const colors = {
  // Brand / MoSJE Navy & Signal Blue
  brand: {
    navyDark: '#0B1220',     // Master Navy
    navy: '#0B1220',         // Primary dark surface / headers
    navyLight: '#152238',    // Deep slate-navy surface
    primary: '#2A5CE0',      // Signal Blue (primary interactive)
    primaryHover: '#1E47B8', // Darker interactive state
    primaryLight: '#EEF3FD', // Soft tint for highlights / active items
    accent: '#2A5CE0',       // Accent blue
  },

  // Semantic Status Colors
  status: {
    normal: '#1E8E5A',       // Master Green (Compliant, Passed, Active)
    normalLight: '#EBF6F1',  // Soft tint
    normalBorder: '#B5E3CE',

    warning: '#D98C1E',      // Master Amber (Action required, Review pending)
    warningLight: '#FDF6EC', // Soft tint
    warningBorder: '#F6D7A7',

    highPriority: '#C4402C', // Master Red (Critical, Surprise, Discrepancy)
    highPriorityLight: '#FBECE9', // Soft tint
    highPriorityBorder: '#F3BCB4',

    info: '#2A5CE0',         // Signal Blue (Assigned, Scheduled, Processing)
    infoLight: '#EEF3FD',    // Soft tint
    infoBorder: '#BDD1F7',

    offline: '#5B6472',      // Master Slate (Inactive, System Neutral)
    offlineLight: '#F1F3F5', // Soft tint
    offlineBorder: '#D3D7DC',
  },

  // Priority Colors
  priority: {
    high: '#C4402C',         // Master Red
    medium: '#D98C1E',       // Master Amber
    low: '#2A5CE0',          // Signal Blue
    normal: '#1E8E5A',       // Master Green
  },

  // Neutral Grayscale & Surfaces
  neutral: {
    background: '#F7F8FA',   // Master BG
    surface: '#FFFFFF',      // Master White card surface
    surfaceElevated: '#FFFFFF',
    surfaceSubtle: '#F0F2F5', // Neutral tinted background for items/badges
    border: '#E3E6EB',       // Quiet card & element borders
    borderStrong: '#D0D5DD', // Input / focused borders
    divider: '#E8EAEF',      // Subtle dividers
  },

  // Text Typography Colors
  text: {
    primary: '#0B1220',      // Master Navy (high-contrast, authoritative)
    secondary: '#333E4F',    // Deep slate for high-readability body
    muted: '#5B6472',        // Master Slate for metadata & secondary info
    disabled: '#9AA2AF',     // Disabled text
    inverse: '#FFFFFF',      // Pure white for dark surfaces / buttons
    brand: '#2A5CE0',        // Signal Blue for brand links
  },

  // Common UI states
  ui: {
    backdrop: 'rgba(11, 18, 32, 0.65)',
    shadow: '#0B1220',
  },
} as const;

export type ColorTheme = typeof colors;
