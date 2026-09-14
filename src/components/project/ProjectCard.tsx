/**
 * ProjectCard Component (Directory representation)
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual card displaying a MasterProject for ProjectExplorer and listings.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MasterProject, ProjectMonitoringProfile } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { MonitoringPriorityBadge } from '../organization/MonitoringPriorityBadge';

interface ProjectCardProps {
  project: MasterProject;
  profile?: ProjectMonitoringProfile;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  profile,
  onPress,
  style,
}) => {
  const formatInr = (val: number): string => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const priority = profile?.priority ?? (project.anomalyCount && project.anomalyCount > 0 ? 'HIGH' : 'LOW');
  const progress = project.progressPercentage ?? 75;

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        priority === 'CRITICAL' && styles.cardCritical,
        priority === 'HIGH' && styles.cardHigh,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.codeRow}>
          <Text style={styles.codeText}>{project.projectCode ?? project.projectId}</Text>
          <ProjectStatusBadge status={(project.status as any) || 'ACTIVE'} />
        </View>
        <MonitoringPriorityBadge priority={priority} compact />
      </View>

      <Text style={styles.projectName} numberOfLines={2}>
        {project.name}
      </Text>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color={colors.text.muted} />
        <Text style={styles.locationText} numberOfLines={1}>
          {project.location ? `${project.location.district || ''}, ${project.location.state || ''}` : 'Location N/A'}
        </Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Milestone Progress</Text>
          <Text style={styles.progressPct}>{progress}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%` as any,
                backgroundColor: progress >= 75 ? colors.status.normal : colors.status.warning,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Sanctioned</Text>
          <Text style={styles.statVal}>{formatInr(project.sanctionedAmount)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Beneficiaries</Text>
          <Text style={styles.statVal}>{project.beneficiaryReported ?? project.beneficiaryTarget} / {project.beneficiaryTarget}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Compliance</Text>
          <Text style={[styles.statVal, { color: colors.status.normal }]}>
            {project.complianceScore ?? 75}/100
          </Text>
        </View>
      </View>

      {project.anomalyCount && project.anomalyCount > 0 ? (
        <View style={styles.anomalyBanner}>
          <Ionicons name="warning-outline" size={13} color={colors.status.highPriority} />
          <Text style={styles.anomalyBannerText}>
            {project.anomalyCount} Active Telemetry Anomaly Detected (ALT-2601)
          </Text>
        </View>
      ) : null}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  cardHigh: {
    borderLeftWidth: 3.5,
    borderLeftColor: colors.status.highPriority,
  },
  cardCritical: {
    borderLeftWidth: 3.5,
    borderLeftColor: colors.status.highPriority,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  projectName: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  locationText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.muted,
  },
  progressRow: {
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  progressLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.secondary,
  },
  progressPct: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  progressTrack: {
    height: 5,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  statVal: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 1,
  },
  anomalyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.status.highPriorityLight,
    borderWidth: 1,
    borderColor: colors.status.highPriorityBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    marginTop: spacing.sm,
  },
  anomalyBannerText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.status.highPriority,
    fontWeight: typography.weights.semibold,
  },
});
