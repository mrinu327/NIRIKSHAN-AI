/**
 * ProjectFundingCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual representation of project grant sanctions, release tranches,
 * utilization performance, and unspent balances.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ProjectFundingIntelligence } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface ProjectFundingCardProps {
  funding: ProjectFundingIntelligence;
  style?: ViewStyle;
}

export const ProjectFundingCard: React.FC<ProjectFundingCardProps> = ({ funding, style }) => {
  const formatInr = (val: number): string => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const utilPct = Math.min(100, Math.max(0, funding.utilizationPercentage));
  const getUtilColor = (pct: number) => {
    if (pct >= 75) return colors.status.normal;
    if (pct >= 50) return colors.status.warning;
    return colors.status.highPriority;
  };

  const utilColor = getUtilColor(utilPct);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.caption}>CENTRAL GRANT LEDGER</Text>
          <Text style={styles.title}>Financial Utilization & Tranches</Text>
        </View>
        <View style={styles.fyBadge}>
          <Text style={styles.fyText}>{funding.financialYear ?? 'FY 2025-26'}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Grant Utilization</Text>
          <Text style={[styles.progressPct, { color: utilColor }]}>{utilPct.toFixed(1)}%</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${utilPct}%`, backgroundColor: utilColor }]} />
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridCell}>
          <Text style={styles.cellLabel}>Sanctioned</Text>
          <Text style={styles.cellValue}>{formatInr(funding.sanctionedAmount)}</Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={styles.cellLabel}>Released</Text>
          <Text style={styles.cellValue}>{formatInr(funding.releasedAmount)}</Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={styles.cellLabel}>Utilized</Text>
          <Text style={[styles.cellValue, { color: colors.status.normal }]}>{formatInr(funding.utilizedAmount)}</Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={styles.cellLabel}>Unspent Balance</Text>
          <Text style={[styles.cellValue, funding.unspentAmount > 0 ? { color: colors.status.warning } : {}]}>
            {formatInr(funding.unspentAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.ratioText}>
          Release Ratio: <Text style={styles.ratioVal}>{(funding.releaseRatio ?? 0).toFixed(1)}%</Text>
        </Text>
        <Text style={styles.ratioText}>
          Overall Sanction Ratio: <Text style={styles.ratioVal}>{(funding.utilizationRatio ?? 0).toFixed(1)}%</Text>
        </Text>
      </View>
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
    marginBottom: spacing.md,
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
  fyBadge: {
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  fyText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  gridCell: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  cellLabel: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing.sm,
  },
  ratioText: {
    fontSize: 10,
    color: colors.text.muted,
  },
  ratioVal: {
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
});
