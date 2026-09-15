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
  onRunAssignment?: () => void;
  onAcknowledge?: () => void;
  onOpenInspection?: () => void;
  isInspectorView?: boolean;
  style?: ViewStyle;
}

export const InspectionCard: React.FC<InspectionCardProps> = ({
  inspection,
  onPress,
  onRunAssignment,
  onAcknowledge,
  onOpenInspection,
  isInspectorView,
  style,
}) => {
  const isSurprise = inspection.type === 'Surprise Inspection';
  const isAwaitingAssignment = inspection.status === 'Awaiting Assignment';
  const isAcknowledged = inspection.status === 'Accepted / Acknowledged';
  const isSubmitted = inspection.status === 'Submitted / Awaiting Review';

  const getStatusVariant = () => {
    switch (inspection.status) {
      case 'Awaiting Assignment':
        return 'warning' as const;
      case 'Assigned':
        return 'info' as const;
      case 'Accepted / Acknowledged':
        return 'normal' as const;
      case 'In Progress':
        return 'warning' as const;
      case 'Submitted / Awaiting Review':
        return 'info' as const;
      case 'Completed':
        return 'normal' as const;
      default:
        return 'offline' as const;
    }
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isSurprise && styles.cardSurprise,
        isAwaitingAssignment && styles.cardAwaiting,
        isSubmitted && styles.cardSubmitted,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.typeBadge}>
          {isSurprise && (
            <Ionicons name="flash-outline" size={13} color={colors.status.highPriority} style={{ marginRight: 3 }} />
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

      {/* Assignment & Officer Status Section */}
      {isAwaitingAssignment ? (
        <View style={styles.unassignedBox}>
          <View style={styles.unassignedHeader}>
            <Ionicons name="alert-circle-outline" size={15} color={colors.status.warning} />
            <Text style={styles.unassignedHeaderText}>Roster Status: Unassigned</Text>
          </View>
          <Text style={styles.unassignedNotice}>
            Inspection order created. Awaiting automated random assignment from active PMU inspector pool.
          </Text>

          {onRunAssignment && (
            <TouchableOpacity
              style={styles.runAssignmentBtn}
              onPress={onRunAssignment}
              activeOpacity={0.8}
            >
              <Ionicons name="shuffle-outline" size={15} color={colors.text.inverse} style={{ marginRight: 6 }} />
              <Text style={styles.runAssignmentBtnText}>Run Automated Assignment</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.officerBox}>
          <View style={styles.officerRow}>
            <View style={styles.officerInfoCol}>
              <Text style={styles.officerLabel}>Assigned PMU Officer</Text>
              <Text style={styles.officerName}>
                {inspection.assignedOfficerName}{' '}
                {inspection.assignedOfficerDemoId ? (
                  <Text style={styles.officerBadgeText}>[ID: {inspection.assignedOfficerDemoId}]</Text>
                ) : null}
              </Text>
            </View>

            {inspection.assignmentMethod && (
              <View style={styles.methodTag}>
                <Ionicons name="shield-checkmark-outline" size={11} color={colors.brand.primary} style={{ marginRight: 3 }} />
                <Text style={styles.methodTagText}>{inspection.assignmentMethod}</Text>
              </View>
            )}
          </View>

          {/* Submission Status Stamp */}
          {isSubmitted ? (
            <View style={styles.submittedBanner}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.brand.primary} />
              <Text style={styles.submittedBannerText}>
                Submitted for MoSJE review on {inspection.submittedAt || 'Today'} by {inspection.submittedBy || inspection.assignedOfficerName}
              </Text>
            </View>
          ) : isAcknowledged ? (
            <View style={styles.acknowledgedBanner}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.status.normal} />
              <Text style={styles.acknowledgedText}>
                Acknowledged by {inspection.acknowledgedBy || inspection.assignedOfficerName}
                {inspection.acknowledgedAt ? ` • ${inspection.acknowledgedAt}` : ''}
              </Text>
            </View>
          ) : inspection.status === 'Assigned' && onAcknowledge ? (
            <TouchableOpacity
              style={styles.acknowledgeBtn}
              onPress={onAcknowledge}
              activeOpacity={0.8}
            >
              <Ionicons name="checkbox-outline" size={15} color={colors.text.inverse} style={{ marginRight: 6 }} />
              <Text style={styles.acknowledgeBtnText}>Acknowledge Assignment</Text>
            </TouchableOpacity>
          ) : null}

          {/* Open Inspection Action for Inspector View */}
          {isInspectorView && onOpenInspection && (
            <TouchableOpacity
              style={styles.openInspectionBtn}
              onPress={onOpenInspection}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSubmitted ? 'eye-outline' : 'play-circle-outline'}
                size={15}
                color={colors.text.inverse}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.openInspectionBtnText}>
                {isSubmitted ? 'View Submitted Inspection' : 'Open Inspection'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
          <Ionicons name="information-circle-outline" size={13} color={colors.brand.primary} style={{ marginTop: 1 }} />
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
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  cardSurprise: {
    borderLeftWidth: 3,
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
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
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
    lineHeight: 20,
    letterSpacing: -0.2,
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
    borderWidth: 1,
    borderColor: colors.neutral.border,
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
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 2,
    fontWeight: typography.weights.medium,
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
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.xs,
  },
  triggerText: {
    fontSize: 11,
    color: colors.text.secondary,
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
  cardAwaiting: {
    borderLeftWidth: 3,
    borderLeftColor: colors.status.warning,
    borderColor: colors.status.warningBorder,
  },
  unassignedBox: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  unassignedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  unassignedHeaderText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.status.warning,
  },
  unassignedNotice: {
    fontSize: 11,
    color: colors.status.warning,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  runAssignmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: 6,
    ...shadows.xs,
  },
  runAssignmentBtnText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },
  officerBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  officerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 6,
  },
  officerInfoCol: {
    flex: 1,
    minWidth: 160,
  },
  officerLabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 2,
    fontWeight: typography.weights.medium,
  },
  officerName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  officerBadgeText: {
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
  },
  methodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.status.infoBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  methodTagText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  acknowledgedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normalBorder,
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  acknowledgedText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.status.normal,
    flex: 1,
  },
  acknowledgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.normal,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: 8,
    ...shadows.xs,
  },
  acknowledgeBtnText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },
  cardSubmitted: {
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.primary,
    borderColor: colors.status.infoBorder,
  },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.status.infoBorder,
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  submittedBannerText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.brand.primary,
    flex: 1,
  },
  openInspectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.navy,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: 8,
    ...shadows.xs,
  },
  openInspectionBtnText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },
});
