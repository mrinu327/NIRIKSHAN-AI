/**
 * AnomalySeverityBadge Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual badge for observable anomaly discrepancy severity:
 * CRITICAL, HIGH, MEDIUM, LOW
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnomalySeverityLevel } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/spacing';

interface AnomalySeverityBadgeProps {
  severity: AnomalySeverityLevel | string;
  style?: ViewStyle;
  compact?: boolean;
}

export const AnomalySeverityBadge: React.FC<AnomalySeverityBadgeProps> = ({
  severity,
  style,
  compact = false,
}) => {
  const getTheme = () => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: '#FEE2E2',
          text: '#991B1B',
          border: '#FCA5A5',
          icon: 'alert-circle' as const,
          label: 'Critical Review',
        };
      case 'HIGH':
        return {
          bg: colors.status.highPriorityLight,
          text: colors.status.highPriority,
          border: colors.status.highPriorityBorder,
          icon: 'warning' as const,
          label: 'High Severity',
        };
      case 'MEDIUM':
      case 'MODERATE':
        return {
          bg: colors.status.warningLight,
          text: colors.status.warning,
          border: colors.status.warningBorder,
          icon: 'alert-circle-outline' as const,
          label: 'Medium Severity',
        };
      case 'LOW':
      default:
        return {
          bg: colors.status.normalLight,
          text: colors.status.normal,
          border: colors.status.normalBorder,
          icon: 'checkmark-circle-outline' as const,
          label: 'Low Severity',
        };
    }
  };

  const theme = getTheme();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.bg, borderColor: theme.border },
        compact && styles.compactBadge,
        style,
      ]}
    >
      <Ionicons name={theme.icon} size={compact ? 10 : 12} color={theme.text} style={styles.icon} />
      <Text style={[styles.label, { color: theme.text }, compact && styles.compactLabel]}>
        {theme.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  compactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.3,
  },
  compactLabel: {
    fontSize: 10,
  },
});
