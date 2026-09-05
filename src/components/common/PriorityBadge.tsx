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
        return { bg: colors.status.highPriorityLight, text: colors.priority.high, border: colors.status.highPriorityBorder };
      case 'MEDIUM':
        return { bg: colors.status.warningLight, text: colors.priority.medium, border: colors.status.warningBorder };
      case 'LOW':
        return { bg: colors.status.infoLight, text: colors.priority.low, border: colors.status.infoBorder };
      case 'NORMAL':
      default:
        return { bg: colors.status.normalLight, text: colors.priority.normal, border: colors.status.normalBorder };
    }
  };

  const theme = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: theme.bg, borderColor: theme.border }, style]}>
      <Text style={[styles.text, { color: theme.text }]}>{priority} PRIORITY</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
