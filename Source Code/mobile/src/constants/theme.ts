/**
 * NIRIKSHAN AI — Government Enterprise Design Tokens
 * Department of Social Justice and Empowerment (DoSJE)
 */

export const colors = {
  primary: '#123B5D',      // Deep Government Navy
  secondary: '#1E6F8C',    // Slate Teal
  success: '#2E7D32',      // Forest Verified Green
  warning: '#ED8B00',      // Amber Attention
  danger: '#C62828',       // Crimson High Risk
  background: '#F5F7FA',   // Off-white Slate
  surface: '#FFFFFF',      // Card White
  surfaceMuted: '#F8FAFC',
  border: '#E2E8F0',       // Subtle border
  borderStrong: '#CBD5E1',
  text: '#0F172A',         // Slate 900
  textMuted: '#64748B',    // Slate 500
  textLight: '#94A3B8',
  white: '#FFFFFF',
  black: '#000000',
  demoBadgeBg: '#FEF3C7',
  demoBadgeText: '#92400E',
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
