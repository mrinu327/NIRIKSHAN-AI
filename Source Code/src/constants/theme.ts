/**
 * NIRIKSHAN AI — Government Enterprise Design Tokens
 * Department of Social Justice and Empowerment (DoSJE)
 */

export const colors = {
  primary: '#4D6331',      // Olive
  secondary: '#7E8F7A',    // Sage
  success: '#2D6A4F',      // Forest Fern
  warning: '#B87320',      // Warm Ochre
  danger: '#9E3B2B',       // Terracotta Rust
  background: '#F7F5F0',   // Parchment
  surface: '#F3EFE8',      // Sand Light
  surfaceMuted: '#ECE7DE', // Sand
  border: '#DCD6C8',       // Sand Border
  borderStrong: '#C2BAA8',
  text: '#1F1B16',         // Deep Bark
  textMuted: '#7D7567',    // Slate Bark
  textLight: '#A8A092',
  white: '#FAF9F5',        // Parchment White
  black: '#1F1B16',        // Deep Bark
  demoBadgeBg: '#FCF6EC',  // Soft Ochre
  demoBadgeText: '#87510E',
};

export const typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    title: 28,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};
