/**
 * InspectionCard Component
 * Displays PMU field assignments and inspection tasks.
 * Mobile-first responsive wrapping.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InspectionAssignment } from '../../types/inspection';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface InspectionCardProps {
  inspection: InspectionAssignment;
  onPress?: () => void;
  style?: ViewStyle;
}

export const InspectionCard: React.FC<InspectionCardProps> = ({
  inspection,
  onPress,
  style,
}) => {
  const isSurprise = inspection.type === 'Surprise Inspection';

  const getStatusVariant = () => {
    switch (inspection.status) {
      case 'Assigned':
        return 'info' as const;
      case 'In Progress':
        return 'warning' as const;
      case 'Completed':
        return 'normal' as const;
      default:
        return 'offline' as const;
    }
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        isSurprise && styles.cardSurprise,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.typeBadge}>
          {isSurprise && (
            <Ionicons name="flash" size={12} color={colors.status.highPriority} style={{ marginRight: 3 }} />
          )}
          <Text style={[styles.typeText, isSurprise && styles.typeTextSurprise]}>
            {inspection.type}
          </Text>
        </View>
        <StatusBadge label={inspection.status} variant={getStatusVariant()} size="sm" />
      </View>

      <Text style={styles.projectName} numberOfLines={2}>
        {inspection.projectName}
      </Text>

      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={13} color={colors.text.muted} style={{ marginTop: 2 }} />
        <Text style={styles.addressText} numberOfLines={2}>
          {inspection.projectAddress}
        </Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Priority</Text>
          <PriorityBadge priority={inspection.priority} />
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Scheduled Window</Text>
          <Text style={styles.detailValue}>{inspection.scheduledTime || inspection.dueDate}</Text>
        </View>
      </View>

      {inspection.triggerReason ? (
        <View style={styles.triggerContainer}>
          <Ionicons name="information-circle-outline" size={13} color={colors.brand.navyLight} style={{ marginTop: 1 }} />
          <Text style={styles.triggerText} numberOfLines={3}>
            {inspection.triggerReason}
          </Text>
        </View>
      ) : null}

      {inspection.totalChecklistCount ? (
        <View style={styles.checklistRow}>
          <Text style={styles.checklistLabel}>Evidence Checklist Progress</Text>
          <Text style={styles.checklistValue}>
            {inspection.checklistCompletedCount} / {inspection.totalChecklistCount} Items
          </Text>
        </View>
      ) : null}
    </CardWrapper>
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
    ...shadows.xs,
  },
  cardSurprise: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.highPriority,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  typeTextSurprise: {
    color: colors.status.highPriority,
  },
  projectName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 4,
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 3,
  },
  addressText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: 4,
    flex: 1,
    lineHeight: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    minWidth: 110,
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  triggerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: '#EFF6FF',
    padding: spacing.xs + 2,
    borderRadius: borderRadius.xs,
  },
  triggerText: {
    fontSize: 11,
    color: colors.brand.navyLight,
    marginLeft: 4,
    flex: 1,
    lineHeight: 16,
  },
  checklistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
    flexWrap: 'wrap',
    gap: 4,
  },
  checklistLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  checklistValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
});
