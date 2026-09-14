/**
 * ProjectStatusBadge Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual indicator for project lifecycle status:
 * ACTIVE, COMPLETED, DELAYED, INSPECTION_DUE, UNDER_REVIEW
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ProjectStatus } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/spacing';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  style?: ViewStyle;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status, style }) => {
  const getTheme = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: colors.status.normalLight,
          text: colors.status.normal,
          border: colors.status.normalBorder,
          label: 'Active',
        };
      case 'COMPLETED':
        return {
          bg: colors.status.infoLight,
          text: colors.status.info,
          border: colors.status.infoBorder,
          label: 'Completed',
        };
      case 'DELAYED':
        return {
          bg: colors.status.highPriorityLight,
          text: colors.status.highPriority,
          border: colors.status.highPriorityBorder,
          label: 'Delayed',
        };
      case 'INSPECTION_DUE':
        return {
          bg: colors.status.warningLight,
          text: colors.status.warning,
          border: colors.status.warningBorder,
          label: 'Inspection Due',
        };
      case 'UNDER_REVIEW':
      default:
        return {
          bg: colors.palette.sandLight,
          text: colors.palette.barkSecondary,
          border: colors.palette.sandBorder,
          label: 'Under Review',
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
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.3,
  },
});
