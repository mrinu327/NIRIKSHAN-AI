/**
 * OrganizationBeneficiarySummaryCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual card summarizing aggregate beneficiary enrolment, optical verification,
 * and roll-call coverage across all projects managed by an implementing agency.
 * STRICT PRIVACY NOTE: Contains aggregate counts only. Zero individual PII.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrganizationBeneficiarySummary } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export type BeneficiaryData = OrganizationBeneficiarySummary;

export interface OrganizationBeneficiarySummaryCardProps {
  beneficiaryData?: OrganizationBeneficiarySummary;
  summary?: OrganizationBeneficiarySummary;
  beneficiary?: OrganizationBeneficiarySummary;
  style?: ViewStyle;
}

export const OrganizationBeneficiarySummaryCard: React.FC<OrganizationBeneficiarySummaryCardProps> = ({
  beneficiaryData,
  summary,
  beneficiary,
  style,
}) => {
  const data = summary || beneficiary || beneficiaryData;
  if (!data) return null;

  const {
    target = 0,
    enrolled = 0,
    verified = 0,
    attendance = 0,
  } = data;

  const coveragePct = target > 0 ? Number(((enrolled / target) * 100).toFixed(1)) : 100;
  const verifyPct = enrolled > 0 ? Number(((verified / enrolled) * 100).toFixed(1)) : 100;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="people-outline" size={18} color={colors.brand.primary} />
          <Text style={styles.title}>BENEFICIARY REACH & VERIFICATION (AGGREGATE)</Text>
        </View>
        <View style={styles.privacyBadge}>
          <Ionicons name="shield-checkmark" size={11} color={colors.status.normal} />
          <Text style={styles.privacyBadgeText}>AGGREGATE ONLY • NO PII</Text>
        </View>
      </View>

      {/* 4-Column Metric Grid */}
      <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Text style={styles.label}>TARGET</Text>
          <Text style={styles.value}>{target.toLocaleString('en-IN')}</Text>
          <Text style={styles.subtext}>Mandated capacity</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>ENROLLED</Text>
          <Text style={styles.value}>{enrolled.toLocaleString('en-IN')}</Text>
          <Text style={styles.subtext}>{coveragePct}% of target</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>ATTENDANCE</Text>
          <Text style={[styles.value, { color: colors.brand.primary }]}>
            {attendance.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.subtext}>Latest roll-call</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.label}>VERIFIED</Text>
          <Text style={[styles.value, { color: verifyPct >= 70 ? colors.status.normal : colors.status.highPriority }]}>
            {verified.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.subtext}>{verifyPct}% biometric/optical</Text>
        </View>
      </View>

      {/* Privacy Guard Notice */}
      <View style={styles.footerNote}>
        <Ionicons name="lock-closed-outline" size={12} color={colors.text.muted} />
        <Text style={styles.footerText}>
          Protected by Ministry Data Privacy Guidelines: Zero beneficiary identities or Aadhaar numbers exposed.
        </Text>
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
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${colors.status.normal}15`,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  privacyBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral.background,
    padding: spacing.xs,
    borderRadius: borderRadius.xs,
    marginTop: spacing.xs,
  },
  footerText: {
    fontSize: 10,
    color: colors.text.secondary,
    flex: 1,
  },
});
