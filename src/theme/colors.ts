/**
 * Design System - Color Palette
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * Professional, government/enterprise appropriate color system.
 * High-contrast, accessible, and restrained.
 */

export const colors = {
  // Brand / MoSJE Navy & Blues
  brand: {
    navyDark: '#0A192F',    // Deep executive navy (Headers, Brand accents)
    navy: '#0F2942',        // Primary header / dark surface
    navyLight: '#1E3A8A',   // Secondary brand blue
    primary: '#1D4ED8',     // Primary interactive blue
    primaryHover: '#1E40AF',
    primaryLight: '#EFF6FF',// Light blue tint for highlights / active items
    accent: '#0284C7',      // Sky/cyan accent for telemetry
  },

  // Semantic Status Colors
  status: {
    normal: '#059669',      // Emerald green (Compliant, Normal, Passed)
    normalLight: '#ECFDF5',
    normalBorder: '#A7F3D0',

    warning: '#D97706',     // Amber (Action required, Review pending)
    warningLight: '#FFFBEB',
    warningBorder: '#FDE68A',

    highPriority: '#DC2626',// Crimson (Surprise inspection, Discrepancy)
    highPriorityLight: '#FEF2F2',
    highPriorityBorder: '#FECACA',

    info: '#2563EB',        // Blue (Assigned, Scheduled, Processing)
    infoLight: '#EFF6FF',
    infoBorder: '#BFDBFE',

    offline: '#64748B',     // Slate (CCTV Offline, Inactive)
    offlineLight: '#F1F5F9',
    offlineBorder: '#CBD5E1',
  },

  // Priority Colors
  priority: {
    high: '#DC2626',
    medium: '#D97706',
    low: '#2563EB',
    normal: '#059669',
  },

  // Neutral Grayscale & Surfaces
  neutral: {
    background: '#F8FAFC',  // Light crisp gray background
    surface: '#FFFFFF',     // Clean white cards
    surfaceElevated: '#FFFFFF',
    surfaceSubtle: '#F1F5F9', // Secondary cards, badges
    border: '#E2E8F0',      // Card borders
    borderStrong: '#CBD5E1',
    divider: '#E2E8F0',
  },

  // Text Typography Colors
  text: {
    primary: '#0F172A',     // Slate 900
    secondary: '#475569',   // Slate 600
    muted: '#64748B',       // Slate 500
    disabled: '#94A3B8',    // Slate 400
    inverse: '#FFFFFF',     // Pure white for dark headers/buttons
    brand: '#1E3A8A',
  },

  // Common UI states
  ui: {
    backdrop: 'rgba(15, 23, 42, 0.6)',
    shadow: '#0F172A',
  }
} as const;

export type ColorTheme = typeof colors;
