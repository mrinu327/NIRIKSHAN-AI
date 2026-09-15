/**
 * OrganizationStatusBadge Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual indicator for organization registration status (ACTIVE, PENDING, EXPIRED, UNKNOWN).
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { OrganizationStatus } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/spacing';

interface OrganizationStatusBadgeProps {
  status: OrganizationStatus;
  style?: ViewStyle;
}

export const OrganizationStatusBadge: React.FC<OrganizationStatusBadgeProps> = ({ status, style }) => {
  const getTheme = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: colors.status.normalLight,
          text: colors.status.normal,
          border: colors.status.normalBorder,
          label: 'Active',
        };
      case 'PENDING':
        return {
          bg: colors.status.warningLight,
          text: colors.status.warning,
          border: colors.status.warningBorder,
          label: 'Pending',
        };
      case 'EXPIRED':
        return {
          bg: colors.status.highPriorityLight,
          text: colors.status.highPriority,
          border: colors.status.highPriorityBorder,
          label: 'Expired',
        };
      case 'UNKNOWN':
      default:
        return {
          bg: colors.neutral.surfaceSubtle,
          text: colors.text.muted,
          border: colors.neutral.border,
          label: 'Unknown',
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
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.3,
  },
});
