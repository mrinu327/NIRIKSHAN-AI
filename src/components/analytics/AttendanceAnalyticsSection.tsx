/**
 * AttendanceAnalyticsSection Component
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * Embedded analytics section for ProjectDetailsScreen.
 * Displays the 4-metric roll-call, CCTV estimated occupancy, variance,
 * historical context, and prominent touchpoint for in-depth explainability.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AttendanceAnalytics } from '../../types/attendance';
import { StatusBadge } from '../common/StatusBadge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface AttendanceAnalyticsSectionProps {
  analytics: AttendanceAnalytics;
  onViewDetails: () => void;
  style?: ViewStyle;
}

export const AttendanceAnalyticsSection: React.FC<AttendanceAnalyticsSectionProps> = ({
  analytics,
  onViewDetails,
  style,
}) => {
  const hasVariance =
    analytics.occupancyVariance !== null && Math.abs(analytics.occupancyVariance) >= 5;

  return (
    <View style={[styles.card, style]}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleCol}>
          <View style={styles.demoTag}>
            <Ionicons name="stats-chart" size={12} color={colors.brand.primary} />
            <Text style={styles.demoTagText}>ATTENDANCE ANALYTICS LAYER</Text>
          </View>
          <Text style={styles.title}>Roll-Call & Telemetry Analytics</Text>
        </View>
        <StatusBadge
          label={hasVariance ? 'Variance Flagged' : 'Operational'}
          variant={hasVariance ? 'warning' : 'normal'}
          size="sm"
        />
      </View>

      {/* 4-Metric Roll-Call Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Present</Text>
          <Text style={styles.metricValue}>{analytics.reportedAttendance}</Text>
          <Text style={styles.metricSub}>Morning roll-call</Text>
        </View>

        <View style={styles.dividerVertical} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Capacity</Text>
          <Text style={styles.metricValue}>{analytics.capacity}</Text>
          <Text style={styles.metricSub}>Sanctioned seats</Text>
        </View>

        <View style={styles.dividerVertical} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Turnout</Text>
          <Text style={[styles.metricValue, { color: colors.status.normal }]}>
            {analytics.attendanceRate}%
          </Text>
          <Text style={styles.metricSub}>Utilization rate</Text>
        </View>

        <View style={styles.dividerVertical} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Absent</Text>
          <Text style={[styles.metricValue, { color: colors.status.warning }]}>
            {analytics.absentCount}
          </Text>
          <Text style={styles.metricSub}>Reported on leave</Text>
        </View>
      </View>

      {/* CCTV Occupancy vs Reported Variance Box */}
      <View style={styles.varianceBox}>
        <View style={styles.varianceRow}>
          <View style={styles.varianceLeft}>
            <Ionicons
              name={analytics.cctvEstimatedOccupancy === null ? 'videocam-off' : 'videocam'}
              size={18}
              color={analytics.cctvEstimatedOccupancy === null ? colors.text.muted : colors.brand.primary}
            />
            <View>
              <Text style={styles.cctvLabel}>CCTV Estimated Occupancy</Text>
              <Text style={styles.cctvDisclaimer}>Automated edge estimate • Not verified headcount</Text>
            </View>
          </View>
          <Text style={styles.cctvCount}>
            {analytics.cctvEstimatedOccupancy !== null ? analytics.cctvEstimatedOccupancy : 'Unavailable'}
          </Text>
        </View>

        <View style={styles.varianceDivider} />

        <View style={styles.varianceResultRow}>
          <Text style={styles.varianceResultLabel}>Reported vs Estimated Variance:</Text>
          <View style={styles.variancePill}>
            <Text
              style={[
                styles.variancePillText,
                {
                  color: hasVariance ? colors.status.highPriority : colors.status.normal,
                },
              ]}
            >
              {analytics.occupancyVariance !== null
                ? `${analytics.occupancyVariance > 0 ? '+' : ''}${analytics.occupancyVariance} (${analytics.occupancyVariancePercentage}%)`
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Historical Context Row */}
      <View style={styles.historicalRow}>
        <View style={styles.historicalItem}>
          <Text style={styles.historicalLabel}>5-Day Historical Baseline</Text>
          <Text style={styles.historicalValue}>
            ~{Math.round(analytics.historicalAverageAttendance)} attendees ({analytics.historicalAverageAttendanceRate}%)
          </Text>
        </View>
        <View style={styles.historicalDivider} />
        <View style={styles.historicalItem}>
          <Text style={styles.historicalLabel}>Trend Direction</Text>
          <View style={styles.trendPill}>
            <Ionicons
              name={
                analytics.attendanceTrend === 'Above historical average'
                  ? 'trending-up'
                  : analytics.attendanceTrend === 'Below historical average'
                  ? 'trending-down'
                  : 'swap-horizontal'
              }
              size={13}
              color={
                analytics.attendanceTrend === 'Above historical average'
                  ? colors.status.warning
                  : colors.brand.navyLight
              }
            />
            <Text style={styles.trendText}>{analytics.attendanceTrend}</Text>
          </View>
        </View>
      </View>

      {/* Top Active Signal Pill */}
      {analytics.analyticsSignals.length > 0 && (
        <View style={styles.signalBanner}>
          <Ionicons name="information-circle" size={16} color={colors.status.highPriority} />
          <Text style={styles.signalBannerText} numberOfLines={2}>
            <Text style={{ fontWeight: 'bold' }}>{analytics.analyticsSignals[0].title}: </Text>
            {analytics.analyticsSignals[0].explanation}
          </Text>
        </View>
      )}

      {/* Touch Action: Deep Dive Explainability */}
      <TouchableOpacity
        style={styles.detailBtn}
        onPress={onViewDetails}
        activeOpacity={0.7}
      >
        <Text style={styles.detailBtnText}>View In-Depth Analytics & Explainability</Text>
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
  headerTitleCol: {
    flex: 1,
  },
  demoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  demoTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    height: 28,
    backgroundColor: colors.neutral.border,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  metricSub: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 1,
  },
  varianceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  varianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  varianceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flex: 1,
  },
  cctvLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  cctvDisclaimer: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 1,
  },
  cctvCount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  varianceDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: spacing.xs,
  },
  varianceResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  varianceResultLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  variancePill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  variancePillText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  historicalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  historicalItem: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  historicalDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.neutral.border,
  },
  historicalLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  historicalValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navy,
  },
  signalBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: borderRadius.sm,
    padding: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  signalBannerText: {
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 16,
    flex: 1,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    marginTop: spacing.xs,
  },
  detailBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
});
