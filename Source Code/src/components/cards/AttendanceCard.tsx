/**
 * AttendanceCard Component
 * Displays today's attendance ratio and submission state for institutes.
 * Mobile-first responsive layout with explicit metric breakdown.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AttendanceSummary } from '../../types/attendance';
import { StatusBadge } from '../common/StatusBadge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface AttendanceCardProps {
  summary: AttendanceSummary;
  instituteName?: string;
  style?: ViewStyle;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  summary,
  instituteName = 'Sunrise Rehabilitation Centre',
  style,
}) => {
  const percentage = Math.round((summary.todayPresent / summary.todayCapacity) * 100);
  const absentCount = summary.todayCapacity - summary.todayPresent;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleArea}>
          <Text style={styles.cardOverline}>Daily Beneficiary Attendance</Text>
          <Text style={styles.instituteName} numberOfLines={2}>{instituteName}</Text>
        </View>
        <StatusBadge
          label={summary.submissionStatus}
          variant={summary.submissionStatus === 'Submitted' ? 'normal' : 'warning'}
        />
      </View>

      {/* Explicit 4-Metric Grid: Present: 42, Capacity: 50, Attendance: 84%, Absent: 8 */}
      <View style={styles.metricsBreakdownGrid}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Present</Text>
          <Text style={styles.breakdownValue}>{summary.todayPresent}</Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Capacity</Text>
          <Text style={styles.breakdownValue}>{summary.todayCapacity}</Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Attendance</Text>
          <Text style={[styles.breakdownValue, { color: colors.status.normal }]}>{percentage}%</Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Absent</Text>
          <Text style={[styles.breakdownValue, { color: colors.status.warning }]}>{absentCount}</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={13} color={colors.text.muted} />
          <Text style={styles.footerText}>Submitted at: {summary.lastSubmittedTime}</Text>
        </View>
        <View style={styles.secureTag}>
          <Ionicons name="checkmark-circle-outline" size={13} color={colors.status.normal} />
          <Text style={styles.secureText}>Logged to Central Registry</Text>
        </View>
      </View>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitleArea: {
    flex: 1,
    minWidth: 160,
  },
  cardOverline: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
    letterSpacing: 0.3,
  },
  instituteName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  metricsBreakdownGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.neutral.border,
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.status.normal,
    borderRadius: borderRadius.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
    flexWrap: 'wrap',
    gap: 6,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: 4,
  },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secureText: {
    fontSize: 11,
    color: colors.status.normal,
    fontWeight: typography.weights.semibold,
    marginLeft: 4,
  },
});
