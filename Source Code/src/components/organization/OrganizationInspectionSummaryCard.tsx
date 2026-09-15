/**
 * OrganizationInspectionSummaryCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual card summarizing PMU field inspections, completion status,
 * and open vs resolved quality findings for an implementing agency.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

import { MasterInspection } from '../../types/master';

export interface OrganizationInspectionSummaryCardProps {
  totalInspections?: number;
  completedInspections?: number;
  pendingInspections?: number;
  openFindings?: number;
  resolvedFindings?: number;
  total?: number;
  completed?: number;
  pending?: number;
  inspections?: MasterInspection[];
  onInspectionPress?: (inspectionId: string) => void;
  style?: ViewStyle;
}

export const OrganizationInspectionSummaryCard: React.FC<OrganizationInspectionSummaryCardProps> = ({
  totalInspections,
  completedInspections,
  pendingInspections,
  openFindings = 0,
  resolvedFindings = 0,
  total,
  completed,
  pending,
  inspections,
  onInspectionPress,
  style,
}) => {
  const tot = totalInspections ?? total ?? 0;
  const comp = completedInspections ?? completed ?? 0;
  const pend = pendingInspections ?? pending ?? 0;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="clipboard-outline" size={18} color={colors.brand.primary} />
          <Text style={styles.title}>FIELD INSPECTION & AUDIT AUDIT TRAIL</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{tot} TOTAL AUDITS</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Text style={styles.label}>COMPLETED</Text>
          <Text style={[styles.value, { color: colors.status.normal }]}>{comp}</Text>
          <Text style={styles.subtext}>Submitted & signed</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>PENDING</Text>
          <Text style={[styles.value, { color: pend > 0 ? colors.status.warning : colors.text.primary }]}>
            {pend}
          </Text>
          <Text style={styles.subtext}>Scheduled window</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>OPEN FINDINGS</Text>
          <Text style={[styles.value, { color: openFindings > 0 ? colors.status.highPriority : colors.status.normal }]}>
            {openFindings}
          </Text>
          <Text style={styles.subtext}>Action required</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>RESOLVED</Text>
          <Text style={[styles.value, { color: colors.status.normal }]}>{resolvedFindings}</Text>
          <Text style={styles.subtext}>Remedied items</Text>
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
    marginBottom: spacing.md,
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
  totalBadge: {
    backgroundColor: colors.neutral.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  totalBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    letterSpacing: 0.3,
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
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtext: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 1,
  },
});
