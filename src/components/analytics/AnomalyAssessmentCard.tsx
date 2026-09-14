/**
 * AnomalyAssessmentCard Component
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * Embedded AI-assisted anomaly assessment overview card for ProjectDetailsScreen.
 * Displays normalized Anomaly Score (0–100), severity, confidence, top contributing reasons,
 * and a direct touchpoint to inspect detailed explainability.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnomalyAssessment, AnomalySeverity } from '../../types/anomaly';
import { StatusBadge } from '../common/StatusBadge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface AnomalyAssessmentCardProps {
  assessment: AnomalyAssessment;
  onReview: () => void;
  style?: ViewStyle;
}

export const AnomalyAssessmentCard: React.FC<AnomalyAssessmentCardProps> = ({
  assessment,
  onReview,
  style,
}) => {
  const getSeverityColors = (sev: AnomalySeverity) => {
    switch (sev) {
      case 'Critical':
        return { bg: colors.status.highPriorityLight, border: colors.status.highPriorityBorder, text: colors.status.highPriority };
      case 'High':
        return { bg: colors.status.highPriorityLight, border: colors.status.highPriorityBorder, text: colors.status.highPriority };
      case 'Moderate':
        return { bg: colors.status.warningLight, border: colors.status.warningBorder, text: colors.status.warning };
      case 'Low':
      default:
        return { bg: colors.status.normalLight, border: colors.status.normalBorder, text: colors.status.normal };
    }
  };

  const sevColor = getSeverityColors(assessment.severity);

  return (
    <View style={[styles.card, style]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.decisionSupportTag}>
            <Ionicons name="hardware-chip-outline" size={12} color={colors.brand.primary} />
            <Text style={styles.decisionSupportTagText}>AI-ASSISTED DECISION SUPPORT</Text>
          </View>
          <Text style={styles.title}>Anomaly Assessment</Text>
        </View>

        <StatusBadge
          label={assessment.status}
          variant={
            assessment.status === 'Confirmed for Follow-Up'
              ? 'warning'
              : assessment.status === 'Dismissed'
              ? 'info'
              : assessment.status === 'Resolved'
              ? 'normal'
              : 'highPriority'
          }
          size="sm"
        />
      </View>

      {/* Score & Confidence Overview Banner */}
      <View style={styles.scoreRow}>
        <View style={[styles.scoreBadgeBox, { backgroundColor: sevColor.bg, borderColor: sevColor.border }]}>
          <Text style={[styles.scoreValue, { color: sevColor.text }]}>{assessment.overallScore}</Text>
          <Text style={styles.scoreScale}>/ 100</Text>
          <Text style={[styles.scoreSeverityLabel, { color: sevColor.text }]}>
            {assessment.severity.toUpperCase()}
          </Text>
        </View>

        <View style={styles.scoreMetaCol}>
          <View style={styles.metaBadgeRow}>
            <View style={styles.confidencePill}>
              <Ionicons name="shield-outline" size={11} color={colors.brand.navyLight} />
              <Text style={styles.confidencePillText}>{assessment.confidence} Confidence</Text>
            </View>
            <Text style={styles.timeText}>{assessment.generatedAt}</Text>
          </View>

          <Text style={styles.summaryText} numberOfLines={2}>
            {assessment.summary}
          </Text>
        </View>
      </View>

      {/* Top Contributing Reasons */}
      <View style={styles.reasonsContainer}>
        <Text style={styles.reasonsHeader}>Contributing Operational Signals ({assessment.signals.length}):</Text>

        {assessment.signals.slice(0, 2).map((signal) => (
          <View key={signal.signalId} style={styles.reasonItem}>
            <Ionicons
              name={signal.severity === 'High' || signal.severity === 'Critical' ? 'alert-circle' : 'information-circle'}
              size={14}
              color={signal.severity === 'High' || signal.severity === 'Critical' ? colors.status.highPriority : colors.status.warning}
            />
            <View style={styles.reasonTextCol}>
              <Text style={styles.reasonTitle}>
                {signal.title}{' '}
                <Text style={styles.reasonContrib}>+{signal.scoreContribution} pts</Text>
              </Text>
              <Text style={styles.reasonDesc} numberOfLines={1}>
                {signal.explanation}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Mandatory Advisory Notice */}
      <View style={styles.advisoryBox}>
        <Ionicons name="information-circle" size={14} color={colors.brand.navyLight} />
        <Text style={styles.advisoryText}>
          AI-assisted assessment is advisory. Human official review required before initiating field actions.
        </Text>
      </View>

      {/* Touch Action: Inspect Full Anomaly Breakdown */}
      <TouchableOpacity
        style={styles.reviewBtn}
        onPress={onReview}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Review Full AI Assessment & Reasons"
      >
        <Text style={styles.reviewBtnText}>Review Full AI Assessment & Reasons</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.brand.primary} />
      </TouchableOpacity>
    </View>
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
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  headerLeft: {
    flex: 1,
  },
  decisionSupportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  decisionSupportTagText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  scoreBadgeBox: {
    width: 78,
    height: 72,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontFamily: typography.fontFamily,
    fontSize: 26,
    fontWeight: typography.weights.bold,
    lineHeight: 28,
  },
  scoreScale: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  scoreSeverityLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  scoreMetaCol: {
    flex: 1,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.status.infoLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
  },
  confidencePillText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.status.info,
  },
  timeText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.muted,
  },
  summaryText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  reasonsContainer: {
    marginBottom: spacing.sm,
  },
  reasonsHeader: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text.muted,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    padding: spacing.xs + 2,
    marginBottom: 6,
  },
  reasonTextCol: {
    flex: 1,
  },
  reasonTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  reasonContrib: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
  },
  reasonDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  advisoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.status.infoLight,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  advisoryText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.status.info,
    flex: 1,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    minHeight: 44,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    marginTop: spacing.xs,
  },
  reviewBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
});
