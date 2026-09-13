/**
 * ProjectMonitoringCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Full explainable 7-factor monitoring evaluation card.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectMonitoringProfile } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { MonitoringPriorityBadge } from '../organization/MonitoringPriorityBadge';
import { ProjectIndicatorRow } from './ProjectIndicatorRow';

interface ProjectMonitoringCardProps {
  profile: ProjectMonitoringProfile;
  style?: ViewStyle;
}

export const ProjectMonitoringCard: React.FC<ProjectMonitoringCardProps> = ({ profile, style }) => {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (val: number) => {
    if (val >= 80) return colors.status.normal;
    if (val >= 60) return colors.status.warning;
    if (val >= 40) return colors.status.highPriority;
    return '#991B1B';
  };

  const scoreColor = getScoreColor(profile.score);
  const fb = profile.factorBreakdown;

  const factors = [
    { label: 'Project Completion (20%)', raw: fb.projectCompletion.rawScore, weighted: fb.projectCompletion.weightedScore },
    { label: 'Statutory Compliance (20%)', raw: fb.statutoryCompliance.rawScore, weighted: fb.statutoryCompliance.weightedScore },
    { label: 'Financial Utilization (15%)', raw: fb.financialUtilization.rawScore, weighted: fb.financialUtilization.weightedScore },
    { label: 'Beneficiary Coverage (15%)', raw: fb.beneficiaryCoverage.rawScore, weighted: fb.beneficiaryCoverage.weightedScore },
    { label: 'Field Inspections (15%)', raw: fb.inspectionStatus.rawScore, weighted: fb.inspectionStatus.weightedScore },
    { label: 'Telemetry & Anomalies (10%)', raw: fb.observedAnomalies.rawScore, weighted: fb.observedAnomalies.weightedScore },
    { label: 'Documentation Currency (5%)', raw: fb.documentation.rawScore, weighted: fb.documentation.weightedScore },
  ];

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.caption}>NIRIKSHAN AI EXPLAINABLE EVALUATION</Text>
          <Text style={styles.title}>Project Monitoring Profile</Text>
        </View>
        <MonitoringPriorityBadge priority={profile.priority} compact />
      </View>

      <View style={styles.scoreRow}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreVal, { color: scoreColor }]}>{profile.score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={[styles.bandLabel, { color: scoreColor }]}>{profile.band}</Text>
          <Text style={styles.scoreDesc}>
            Deterministic multi-factor analysis synthesized from verified operational telemetry.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.expandToggle}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.expandText}>
          {expanded ? 'Hide 7-Factor Breakdown' : 'Show 7-Factor Weighted Breakdown'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.brand.primary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.factorsList}>
          {factors.map((f, i) => (
            <View key={i} style={styles.factorItem}>
              <View style={styles.factorHeader}>
                <Text style={styles.factorLabel}>{f.label}</Text>
                <Text style={styles.factorScore}>
                  {f.raw}/100 <Text style={styles.factorWeighted}>(+{f.weighted.toFixed(1)} pts)</Text>
                </Text>
              </View>
              <View style={styles.factorTrack}>
                <View style={[styles.factorFill, { width: `${Math.min(100, f.raw)}%` as any, backgroundColor: getScoreColor(f.raw) }]} />
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Observable Monitoring Indicators</Text>
      </View>
      {profile.monitoringIndicators.map((ind, i) => (
        <ProjectIndicatorRow key={i} indicator={ind} />
      ))}

      {profile.positiveIndicators.length > 0 && (
        <View style={styles.indicatorsSection}>
          <Text style={styles.subSectionTitle}>Observed Strengths</Text>
          {profile.positiveIndicators.map((pos, i) => (
            <View key={i} style={styles.positiveRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.status.normal} style={{ marginRight: 6 }} />
              <Text style={styles.positiveText}>{pos}</Text>
            </View>
          ))}
        </View>
      )}

      {profile.recommendedActions.length > 0 && (
        <View style={styles.actionsSection}>
          <Text style={styles.subSectionTitle}>Recommended Official Next Steps</Text>
          {profile.recommendedActions.map((act, i) => (
            <View key={i} style={styles.actionRow}>
              <Ionicons name="arrow-forward-circle" size={14} color={colors.brand.primary} style={{ marginRight: 6 }} />
              <Text style={styles.actionText}>{act}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  caption: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    marginRight: spacing.md,
  },
  scoreVal: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    lineHeight: 26,
  },
  scoreMax: {
    fontSize: 10,
    color: colors.text.muted,
  },
  scoreInfo: {
    flex: 1,
  },
  bandLabel: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    marginBottom: 3,
  },
  scoreDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 15,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral.border,
    marginVertical: spacing.sm,
  },
  expandText: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  factorsList: {
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  factorItem: {
    marginBottom: spacing.sm,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  factorLabel: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  factorScore: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  factorWeighted: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: typography.weights.regular,
  },
  factorTrack: {
    height: 6,
    backgroundColor: colors.neutral.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeader: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  indicatorsSection: {
    marginTop: spacing.md,
    backgroundColor: colors.status.normalLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 6,
  },
  positiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  positiveText: {
    fontSize: 11,
    color: colors.status.normal,
    flex: 1,
    lineHeight: 15,
  },
  actionsSection: {
    marginTop: spacing.sm,
    backgroundColor: '#F0F4FF',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 11,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 15,
  },
});
