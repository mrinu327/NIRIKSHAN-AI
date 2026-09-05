/**
 * StatusBadge Component
 * Displays semantic status pills with consistent colors and typography.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/spacing';

export type BadgeVariant = 'normal' | 'warning' | 'highPriority' | 'info' | 'offline';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'normal',
  size = 'md',
  style,
}) => {
  const getBadgeStyles = () => {
    switch (variant) {
      case 'highPriority':
        // Urgent / Action-needed = strong visual weight
        return {
          bg: colors.status.highPriorityLight,
          border: colors.status.highPriorityBorder,
          text: colors.status.highPriority,
          dot: colors.status.highPriority,
          isOutline: false,
        };
      case 'warning':
        // Action-needed = warm tint with crisp border
        return {
          bg: colors.status.warningLight,
          border: colors.status.warningBorder,
          text: colors.status.warning,
          dot: colors.status.warning,
          isOutline: false,
        };
      case 'info':
        // Informational = soft tint
        return {
          bg: colors.status.infoLight,
          border: colors.status.infoBorder,
          text: colors.status.info,
          dot: colors.status.info,
          isOutline: false,
        };
      case 'offline':
        // Neutral / system-generated = outline
        return {
          bg: colors.neutral.surface,
          border: colors.status.offlineBorder,
          text: colors.status.offline,
          dot: colors.status.offline,
          isOutline: true,
        };
      case 'normal':
      default:
        // Informational / verified = soft green tint
        return {
          bg: colors.status.normalLight,
          border: colors.status.normalBorder,
          text: colors.status.normal,
          dot: colors.status.normal,
          isOutline: false,
        };
    }
  };

  const currentTheme = getBadgeStyles();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 8,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: currentTheme.dot }]} />
      <Text
        style={[
          styles.text,
          {
            color: currentTheme.text,
            fontSize: isSmall ? 11 : typography.sizes.xs,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.1,
  },
});
