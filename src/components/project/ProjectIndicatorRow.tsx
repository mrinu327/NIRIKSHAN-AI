/**
 * ProjectIndicatorRow Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Observable, explainable indicator row for project monitoring.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectMonitoringIndicator } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface ProjectIndicatorRowProps {
  indicator: ProjectMonitoringIndicator;
}

export const ProjectIndicatorRow: React.FC<ProjectIndicatorRowProps> = ({ indicator }) => {
  const getStatusDetails = () => {
    switch (indicator.status) {
      case 'NORMAL':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.status.normal,
          bg: colors.status.normalLight,
          border: colors.status.normalBorder,
        };
      case 'CRITICAL':
        return {
          icon: 'close-circle' as const,
          color: colors.status.highPriority,
          bg: colors.status.highPriorityLight,
          border: colors.status.highPriorityBorder,
        };
      case 'ATTENTION':
      default:
        return {
          icon: 'alert-circle' as const,
          color: colors.status.warning,
          bg: colors.status.warningLight,
          border: colors.status.warningBorder,
        };
    }
  };

  const status = getStatusDetails();

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: status.bg, borderColor: status.border }]}>
        <Ionicons name={status.icon} size={14} color={status.color} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.topLine}>
          <Text style={styles.label}>{indicator.label}</Text>
          <Text style={[styles.value, { color: status.color }]}>{indicator.value}</Text>
        </View>
        <Text style={styles.reason}>{indicator.reason}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  value: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  reason: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 15,
  },
});
