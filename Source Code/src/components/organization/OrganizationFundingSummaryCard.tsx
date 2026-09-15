/**
 * OrganizationFundingSummaryCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual ledger card summarizing total sanctioned, released, utilized,
 * and unspent central grant allocations for an implementing organization.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrganizationFundingSummary } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface OrganizationFundingSummaryCardProps {
  funding?: OrganizationFundingSummary;
  fundingSummary?: OrganizationFundingSummary;
  style?: ViewStyle;
}

export const OrganizationFundingSummaryCard: React.FC<OrganizationFundingSummaryCardProps> = ({
  funding,
  fundingSummary,
  style,
}) => {
  const data = funding || fundingSummary;
  if (!data) return null;

  const {
    totalSanctioned = 0,
    totalReleased = 0,
    totalUtilized = 0,
    unspentAmount = 0,
    utilizationPercentage = 0,
  } = data;

  const formatCrLakh = (amount: number): string => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getUtilColor = (pct: number) => {
    if (pct >= 80) return colors.status.normal;
    if (pct >= 60) return colors.status.warning;
    return colors.status.highPriority;
  };

  const utilColor = getUtilColor(utilizationPercentage);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="wallet-outline" size={18} color={colors.brand.primary} />
          <Text style={styles.title}>CENTRAL GRANT ALLOCATION & UTILIZATION</Text>
        </View>
        <View style={[styles.utilBadge, { backgroundColor: `${utilColor}15` }]}>
          <Text style={[styles.utilBadgeText, { color: utilColor }]}>
            {utilizationPercentage.toFixed(1)}% UTILIZED
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, Math.max(0, utilizationPercentage))}%`, backgroundColor: utilColor },
          ]}
        />
      </View>

      {/* 4-Column Grid */}
      <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Text style={styles.label}>SANCTIONED</Text>
          <Text style={styles.value}>{formatCrLakh(totalSanctioned)}</Text>
          <Text style={styles.subtext}>Total grant</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>RELEASED</Text>
          <Text style={styles.value}>{formatCrLakh(totalReleased)}</Text>
          <Text style={styles.subtext}>Disbursed funds</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>UTILIZED</Text>
          <Text style={[styles.value, { color: utilColor }]}>{formatCrLakh(totalUtilized)}</Text>
          <Text style={styles.subtext}>Committed spend</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>UNSPENT</Text>
          <Text style={styles.value}>{formatCrLakh(unspentAmount)}</Text>
          <Text style={styles.subtext}>Balance in hand</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  utilBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  utilBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.neutral.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtext: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 1,
  },
});
