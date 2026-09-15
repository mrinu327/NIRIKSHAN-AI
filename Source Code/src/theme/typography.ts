/**
 * Design System - Typography Tokens
 * SIH26095 | MoSJE
 */

import { TextStyle, Platform } from 'react-native';

export const fontFamily = Platform.select({
  web: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: undefined,
});

export const typography = {
  fontFamily,
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    xs: 15,
    sm: 17,
    base: 20,
    md: 22,
    lg: 24,
    xl: 26,
    xxl: 30,
    display: 34,
  },
};

export const fontPresets: Record<string, TextStyle> = {
  headerTitle: {
    fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.xl,
    letterSpacing: -0.4,
  },
  sectionTitle: {
    fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
    letterSpacing: -0.2,
  },
  cardTitle: {
    fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.md,
    letterSpacing: -0.1,
  },
  kpiNumber: {
    fontFamily,
    fontSize: 34,
    fontWeight: typography.weights.bold,
    lineHeight: 38,
    letterSpacing: -1,
  },
  body: {
    fontFamily,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.base,
  },
  bodyMedium: {
    fontFamily,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.base,
  },
  caption: {
    fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.sm,
  },
  captionMedium: {
    fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.sm,
  },
  badge: {
    fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.xs,
    letterSpacing: 0.3,
  },
  overline: {
    fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
};
