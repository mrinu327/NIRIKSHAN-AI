/**
 * OrganizationCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Summary card for an Organization in directory explorer and dashboard lists.
 * Displays key identity, compliance, monitoring priority, and funding metrics.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Organization } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { MonitoringPriorityBadge } from './MonitoringPriorityBadge';
import { OrganizationStatusBadge } from './OrganizationStatusBadge';

interface OrganizationCardProps {
  organization: Organization;
  onPress: () => void;
  style?: ViewStyle;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({ organization, onPress, style }) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const projectCount = organization.projectIds?.length ?? 0;
  const inspectionCount = organization.inspectionIds?.length ?? organization.inspectionSummary?.total ?? 0;
  const score = organization.complianceScore ?? organization.complianceSummary?.complianceScore ?? 0;

  const formatType = (typeStr: string) => {
    switch (typeStr) {
      case 'NGO':
        return 'NGO';
      case 'TRUST':
        return 'Trust';
      case 'SOCIETY':
        return 'Society';
      case 'TRAINING_INSTITUTION':
        return 'Training Inst.';
      case 'INSTITUTION':
        return 'Institution';
      default:
        return typeStr;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`View organization profile for ${organization.name}`}
    >
      {/* Header Row: Type and Badges */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{formatType(organization.organizationType || organization.type || 'NGO')}</Text>
          </View>
          <OrganizationStatusBadge status={organization.registrationStatus} />
        </View>
        {organization.monitoringPriority && (
          <MonitoringPriorityBadge priority={organization.monitoringPriority} compact />
        )}
      </View>

      {/* Organization Name */}
      <Text style={styles.name} numberOfLines={2}>
        {organization.name}
      </Text>

      {/* Metadata Row: Darpan ID & Masked PAN */}
      <View style={styles.metaRow}>
        {organization.ngoDarpanId && (
          <Text style={styles.metaText}>
            Darpan: <Text style={styles.metaValue}>{organization.ngoDarpanId}</Text>
          </Text>
        )}
        {organization.panMasked && (
          <Text style={styles.metaText}>
            PAN: <Text style={styles.metaValue}>{organization.panMasked}</Text>
          </Text>
        )}
      </View>

      {/* Address / Location */}
      {organization.address && (
        <Text style={styles.addressText} numberOfLines={1}>
          📍 {organization.address}
        </Text>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Projects</Text>
          <Text style={styles.statValue}>{projectCount}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Inspections</Text>
          <Text style={styles.statValue}>{inspectionCount}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Compliance</Text>
          <Text style={[styles.statValue, { color: score >= 80 ? colors.status.normal : colors.status.warning }]}>
            {score}/100
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Sanctioned</Text>
          <Text style={styles.statValue}>{formatCurrency(organization.totalSanctionedAmount)}</Text>
        </View>
      </View>

      {/* Bottom CTA bar */}
      <View style={styles.footerRow}>
        <Text style={styles.idLabel}>{organization.organizationId}</Text>
        <Text style={styles.viewDetailsText}>View Profile →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.palette.sageBorder,
  },
  typeText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  metaText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.muted,
  },
  metaValue: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  addressText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    color: colors.text.muted,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.neutral.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  idLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.text.muted,
  },
  viewDetailsText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
});
