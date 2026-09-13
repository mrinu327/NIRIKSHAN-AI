/**
 * MonitoringPriorityBadge Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual indicator for organization monitoring priority levels:
 * - LOW: Low Monitoring Concern (Normal/Green)
 * - MEDIUM: Moderate Monitoring Concern (Warning/Amber)
 * - HIGH: Higher Monitoring Priority (High/Red)
 * - CRITICAL: Critical Review Priority (Dark Red)
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MonitoringPriority } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/spacing';

interface MonitoringPriorityBadgeProps {
  priority: MonitoringPriority;
  style?: ViewStyle;
  compact?: boolean;
}

export const MonitoringPriorityBadge: React.FC<MonitoringPriorityBadgeProps> = ({
  priority,
  style,
  compact = false,
}) => {
  const getTheme = () => {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: '#FEE2E2',
          text: '#991B1B',
          border: '#F87171',
          label: compact ? 'CRITICAL' : 'CRITICAL REVIEW PRIORITY',
        };
      case 'HIGH':
        return {
          bg: colors.status.highPriorityLight,
          text: colors.status.highPriority,
          border: colors.status.highPriorityBorder,
          label: compact ? 'HIGH' : 'HIGHER MONITORING PRIORITY',
        };
      case 'MEDIUM':
        return {
          bg: colors.status.warningLight,
          text: colors.status.warning,
          border: colors.status.warningBorder,
          label: compact ? 'MODERATE' : 'MODERATE MONITORING CONCERN',
        };
      case 'LOW':
      default:
        return {
          bg: colors.status.normalLight,
          text: colors.status.normal,
          border: colors.status.normalBorder,
          label: compact ? 'LOW' : 'LOW MONITORING CONCERN',
        };
    }
  };

  const theme = getTheme();

  return (
    <View style={[styles.badge, { backgroundColor: theme.bg, borderColor: theme.border }, style]}>
      <Text style={[styles.text, { color: theme.text }]}>{theme.label}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
