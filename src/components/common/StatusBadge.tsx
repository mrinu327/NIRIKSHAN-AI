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
      case 'warning':
        return {
          bg: colors.status.warningLight,
          border: colors.status.warningBorder,
          text: colors.status.warning,
        };
      case 'highPriority':
        return {
          bg: colors.status.highPriorityLight,
          border: colors.status.highPriorityBorder,
          text: colors.status.highPriority,
        };
      case 'info':
        return {
          bg: colors.status.infoLight,
          border: colors.status.infoBorder,
          text: colors.status.info,
        };
      case 'offline':
        return {
          bg: colors.status.offlineLight,
          border: colors.status.offlineBorder,
          text: colors.status.offline,
        };
      case 'normal':
      default:
        return {
          bg: colors.status.normalLight,
          border: colors.status.normalBorder,
          text: colors.status.normal,
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
      <View style={[styles.dot, { backgroundColor: currentTheme.text }]} />
      <Text
        style={[
          styles.text,
          {
            color: currentTheme.text,
            fontSize: isSmall ? 10 : typography.sizes.xs,
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
    borderRadius: borderRadius.full,
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
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
