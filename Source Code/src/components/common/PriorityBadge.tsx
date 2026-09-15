/**
 * PriorityBadge Component
 * High-visibility indicators for priority levels.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { PriorityLevel } from '../../types/project';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/spacing';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  style?: ViewStyle;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, style }) => {
  const getColors = () => {
    switch (priority) {
      case 'HIGH':
        return {
          bg: colors.status.highPriorityLight,
          text: colors.status.highPriority,
          border: colors.status.highPriorityBorder,
          label: 'High Priority',
        };
      case 'MEDIUM':
        return {
          bg: colors.status.warningLight,
          text: colors.status.warning,
          border: colors.status.warningBorder,
          label: 'Medium Priority',
        };
      case 'LOW':
        return {
          bg: colors.status.infoLight,
          text: colors.status.info,
          border: colors.status.infoBorder,
          label: 'Low Priority',
        };
      case 'NORMAL':
      default:
        return {
          bg: colors.status.normalLight,
          text: colors.status.normal,
          border: colors.status.normalBorder,
          label: 'Normal',
        };
    }
  };

  const theme = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: theme.bg, borderColor: theme.border }, style]}>
      <Text style={[styles.text, { color: theme.text }]}>{theme.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.1,
  },
});
