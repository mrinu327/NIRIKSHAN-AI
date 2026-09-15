/**
 * BeneficiarySummaryCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Aggregate-only beneficiary metrics, daily roll-call attendance rate,
 * optical/physical verification comparisons, and non-accusatory discrepancy flags.
 *
 * PRIVACY: Zero PII displayed.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectBeneficiaryIntelligence } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface BeneficiarySummaryCardProps {
  beneficiary: ProjectBeneficiaryIntelligence;
  style?: ViewStyle;
}

export const BeneficiarySummaryCard: React.FC<BeneficiarySummaryCardProps> = ({ beneficiary, style }) => {
  const hasDiscrepancy = beneficiary.discrepancyFlags && beneficiary.discrepancyFlags.length > 0;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.caption}>BENEFICIARY INTELLIGENCE</Text>
          <Text style={styles.title}>Roster Reach & Optical Count</Text>
        </View>
        <View style={styles.privacyBadge}>
          <Ionicons name="shield-checkmark" size={10} color={colors.status.normal} style={{ marginRight: 3 }} />
          <Text style={styles.privacyText}>AGGREGATE ONLY</Text>
        </View>
      </View>

      <Text style={styles.privacyNotice}>
        Statistical counts only. No individual Aadhaar or identity data is stored.
      </Text>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Target Capacity</Text>
          <Text style={styles.statNumber}>{beneficiary.target}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Registered Roster</Text>
          <Text style={styles.statNumber}>{beneficiary.registered}</Text>
          <Text style={styles.statSub}>({beneficiary.coveragePercentage}% coverage)</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Reported Roll-Call</Text>
          <Text style={styles.statNumber}>{beneficiary.attendance}</Text>
          <Text style={styles.statSub}>({beneficiary.attendanceRate}% daily rate)</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Optical Verified</Text>
          <Text style={[styles.statNumber, hasDiscrepancy ? { color: colors.status.warning } : { color: colors.status.normal }]}>
            {beneficiary.verified}
          </Text>
          <Text style={styles.statSub}>({beneficiary.verificationPercentage}% verified)</Text>
        </View>
      </View>

      {hasDiscrepancy && (
        <View style={styles.discrepancyBox}>
          <Ionicons name="alert-circle" size={16} color={colors.status.warning} style={styles.discrepancyIcon} />
          <View style={styles.discrepancyTextContainer}>
            <Text style={styles.discrepancyTitle}>Attendance Variance Identified</Text>
            <Text style={styles.discrepancyDesc}>
              Automated optical headcount ({beneficiary.verified}) diverges from self-reported roll-call ({beneficiary.attendance}). On-site physical verification recommended.
            </Text>
          </View>
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
    marginBottom: 4,
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
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.normalLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.status.normalBorder,
  },
  privacyText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
  },
  privacyNotice: {
    fontSize: 10,
    color: colors.text.muted,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginVertical: 2,
  },
  statSub: {
    fontSize: 9,
    color: colors.text.secondary,
  },
  discrepancyBox: {
    flexDirection: 'row',
    backgroundColor: colors.status.warningLight,
    borderWidth: 1,
    borderColor: colors.status.warningBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  discrepancyIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  discrepancyTextContainer: {
    flex: 1,
  },
  discrepancyTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.status.warning,
    marginBottom: 2,
  },
  discrepancyDesc: {
    fontSize: 11,
    color: colors.text.primary,
    lineHeight: 15,
  },
});
