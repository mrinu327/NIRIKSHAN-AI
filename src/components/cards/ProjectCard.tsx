/**
 * ProjectCard Component
 * Displays multi-attribute project summary with priority and telemetry status.
 * Mobile-first layout with responsive wrapping.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Project } from '../../types/project';
import { StatusBadge, BadgeVariant } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface ProjectCardProps {
  project: Project;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  style,
}) => {
  const getStatusVariant = (): BadgeVariant => {
    switch (project.status) {
      case 'High Priority':
        return 'highPriority';
      case 'Inspection Due':
        return 'warning';
      case 'Under Review':
        return 'info';
      case 'Normal':
      case 'Compliant':
      default:
        return 'normal';
    }
  };

  const getCctvIconDetails = () => {
    switch (project.cctvStatus) {
      case 'Online':
        return { icon: 'videocam' as const, color: colors.status.normal, label: 'CCTV Online' };
      case 'Offline':
        return { icon: 'videocam-off' as const, color: colors.status.highPriority, label: 'CCTV Offline' };
      case 'Discrepancy Detected':
        return { icon: 'alert-circle' as const, color: colors.status.highPriority, label: 'CCTV Variance' };
      case 'Intermittent':
      default:
        return { icon: 'videocam' as const, color: colors.status.warning, label: 'Intermittent' };
    }
  };

  const cctv = getCctvIconDetails();
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.topRow}>
        <PriorityBadge priority={project.priority} />
        <StatusBadge label={project.status} variant={getStatusVariant()} size="sm" />
      </View>

      <Text style={styles.projectName} numberOfLines={2}>
        {project.name}
      </Text>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color={colors.text.muted} style={{ marginTop: 2 }} />
        <Text style={styles.locationText} numberOfLines={2}>
          {project.location.city}, {project.location.state} • {project.category}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Today's Attendance</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>
              {project.attendance.present}
              <Text style={styles.metricSub}> / {project.attendance.capacity}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.metricItemRight}>
          <Text style={styles.metricLabel}>Camera Telemetry</Text>
          <View style={styles.cctvStatusRow}>
            <Ionicons name={cctv.icon} size={14} color={cctv.color} />
            <Text style={[styles.cctvStatusText, { color: cctv.color }]}>
              {cctv.label}
            </Text>
          </View>
        </View>
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: 6,
  },
  projectName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  locationText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: 4,
    flex: 1,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.divider,
    marginVertical: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    minWidth: 120,
  },
  metricItemRight: {
    alignItems: 'flex-start',
    minWidth: 120,
  },
  metricLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 2,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  metricSub: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.text.muted,
  },
  cctvStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cctvStatusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginLeft: 4,
  },
});
