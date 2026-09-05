/**
 * InspectionReviewScreen
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Pre-submission review screen presenting checklist completion breakdown,
 * inspector narrative findings, and attached evidence metadata.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type ReviewRouteProp = RouteProp<InspectorStackParamList, 'InspectionReview'>;

export const InspectionReviewScreen: React.FC = () => {
  const navigation = useNavigation<InspectorStackNavigationProp>();
  const route = useRoute<ReviewRouteProp>();
  const { inspectionId } = route.params;
  const { currentUser } = useAuth();

  const [inspection, setInspection] = useState<InspectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    mockInspectionService.getInspectionById(inspectionId).then((data) => {
      setInspection(data || null);
      setLoading(false);
    });
  }, [inspectionId]);

  if (loading || !inspection) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Review Inspection" subtitle="Compiling field dossier..." />
        <ActivityIndicator size="large" color={colors.brand.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  const checklistResponses = inspection.checklistResponses || {};
  const checklistList = Object.values(checklistResponses);
  const verifiedCount = checklistList.filter((item) => item.status === 'Verified').length;
  const attentionCount = checklistList.filter((item) => item.status === 'Needs Attention').length;
  const naCount = checklistList.filter((item) => item.status === 'Not Applicable').length;
  const unverifiedCount = checklistList.filter((item) => item.status === 'Not Checked').length;
  const totalCount = checklistList.length || 13;

  const findings = inspection.findings;
  const evidenceList = inspection.evidenceItems || [];

  const handleSubmit = async () => {
    if (unverifiedCount > 0) {
      setValidationError(
        `Cannot submit: ${unverifiedCount} checklist item(s) are still unverified. Please return and evaluate all criteria.`
      );
      return;
    }

    if (!findings?.overallObservation || !findings?.keyFindings) {
      setValidationError('Cannot submit: Findings report is incomplete. Please enter overall observation and key findings.');
      return;
    }

    setSubmitting(true);
    try {
      await mockInspectionService.submitInspection(inspection.id, {
        checklistResponses,
        findings,
        evidenceItems: evidenceList,
        submittedBy: currentUser?.name || inspection.assignedOfficerName,
        officerDemoId: currentUser?.badgeId || inspection.assignedOfficerDemoId,
      });

      navigation.navigate('InspectionConfirmation', { inspectionId: inspection.id });
    } catch (err) {
      console.error('Failed to submit inspection:', err);
      setValidationError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Review & Sign Off"
        subtitle={`Order #${inspection.id} • Final Field Dossier`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color={colors.brand.primary} />
          <Text style={styles.backButtonText}>Back to Findings</Text>
        </TouchableOpacity>

        {validationError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.status.warning} />
            <Text style={styles.errorBannerText}>{validationError}</Text>
          </View>
        )}

        {/* Target Summary Card */}
        <View style={styles.targetCard}>
          <View style={styles.targetTopRow}>
            <Text style={styles.targetId}>#{inspection.id}</Text>
            <PriorityBadge priority={inspection.priority} />
          </View>
          <Text style={styles.projectName}>{inspection.projectName}</Text>
          <Text style={styles.projectAddress}>{inspection.projectAddress}</Text>

          <View style={styles.officerStampRow}>
            <Ionicons name="person-outline" size={13} color={colors.text.muted} />
            <Text style={styles.officerStampText}>
              Inspected by: {currentUser?.name || inspection.assignedOfficerName} (
              {currentUser?.badgeId || inspection.assignedOfficerDemoId || 'PMU-DEMO-004'})
            </Text>
          </View>
        </View>

        {/* 1. Checklist Summary */}
        <SectionHeader
          title="Checklist Evaluation Summary"
          subtitle={`${verifiedCount + attentionCount + naCount} / ${totalCount} Criteria Verified`}
        />

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.statCount, { color: colors.status.normal }]}>{verifiedCount}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>

          <View style={[styles.statBox, { borderColor: colors.status.warningBorder, backgroundColor: '#FFFBEB' }]}>
            <Text style={[styles.statCount, { color: colors.status.warning }]}>{attentionCount}</Text>
            <Text style={styles.statLabel}>Needs Attention</Text>
          </View>

          <View style={[styles.statBox, { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' }]}>
            <Text style={[styles.statCount, { color: '#475569' }]}>{naCount}</Text>
            <Text style={styles.statLabel}>Not Applicable</Text>
          </View>
        </View>

        {/* Items Flagged Needs Attention */}
        {attentionCount > 0 ? (
          <View style={styles.attentionItemsCard}>
            <View style={styles.attentionHeader}>
              <Ionicons name="alert-circle" size={15} color={colors.status.warning} />
              <Text style={styles.attentionTitle}>Criteria Flagged "Needs Attention":</Text>
            </View>
            {checklistList
              .filter((item) => item.status === 'Needs Attention')
              .map((item) => (
                <View key={item.id} style={styles.attentionItemRow}>
                  <Text style={styles.attentionItemDot}>•</Text>
                  <View style={styles.attentionItemTextCol}>
                    <Text style={styles.attentionItemTitle}>{item.title}</Text>
                    {item.notes ? (
                      <Text style={styles.attentionItemNote}>Note: "{item.notes}"</Text>
                    ) : null}
                  </View>
                </View>
              ))}
          </View>
        ) : null}

        {/* 2. Findings Summary */}
        <SectionHeader
          title="Inspector Field Observation"
          subtitle="Narrative findings submitted for administrative record"
        />

        <View style={styles.findingsCard}>
          <View style={styles.findingField}>
            <Text style={styles.findingLabel}>OVERALL OBSERVATION</Text>
            <Text style={styles.findingValue}>
              {findings?.overallObservation || 'None recorded'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.findingField}>
            <Text style={styles.findingLabel}>KEY FINDINGS</Text>
            <Text style={styles.findingValue}>
              {findings?.keyFindings || 'None recorded'}
            </Text>
          </View>

          {findings?.issuesRequiringFollowUp ? (
            <>
              <View style={styles.divider} />
              <View style={styles.findingField}>
                <Text style={styles.findingLabel}>ISSUES REQUIRING FOLLOW-UP</Text>
                <Text style={styles.findingValue}>{findings.issuesRequiringFollowUp}</Text>
              </View>
            </>
          ) : null}

          {findings?.additionalRemarks ? (
            <>
              <View style={styles.divider} />
              <View style={styles.findingField}>
                <Text style={styles.findingLabel}>ADDITIONAL REMARKS</Text>
                <Text style={styles.findingValue}>{findings.additionalRemarks}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* 3. Evidence Items Summary */}
        <SectionHeader
          title="Attached Verification Evidence"
          subtitle="Registered media timestamps and metadata"
          badgeCount={evidenceList.length}
        />

        {evidenceList.length === 0 ? (
          <View style={styles.noEvidenceBox}>
            <Text style={styles.noEvidenceText}>No evidence files attached to this inspection.</Text>
          </View>
        ) : (
          <View style={styles.evidenceReviewList}>
            {evidenceList.map((item) => (
              <View key={item.id} style={styles.evidenceReviewItem}>
                <Ionicons
                  name={item.type === 'photo' ? 'camera' : item.type === 'video' ? 'videocam' : 'document-text'}
                  size={16}
                  color={colors.brand.primary}
                />
                <View style={styles.evidenceReviewTextCol}>
                  <Text style={styles.evidenceReviewTitle}>{item.title}</Text>
                  <Text style={styles.evidenceReviewMeta}>
                    {item.category} • {item.timestamp} • {item.locationStatus}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Submission Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.brand.navyLight} />
          <Text style={styles.disclaimerText}>
            Submitting marks this inspection as "Submitted / Awaiting Review". The official Central Desk will be notified with timestamped field records.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsCol}>
          <PrimaryButton
            title="Submit Inspection"
            iconName="paper-plane"
            onPress={handleSubmit}
            loading={submitting}
          />
          <SecondaryButton
            title="Edit Inspection (Back to Checklist)"
            iconName="create-outline"
            onPress={() => navigation.navigate('InspectionChecklist', { inspectionId: inspection.id })}
            disabled={submitting}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  backButtonText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
    marginLeft: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  errorBannerText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: '#92400E',
    flex: 1,
  },
  targetCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  targetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  targetId: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  projectName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  projectAddress: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  officerStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 6,
  },
  officerStampText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  attentionItemsCard: {
    backgroundColor: '#FFFDF7',
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  attentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  attentionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  attentionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  attentionItemDot: {
    fontSize: 14,
    color: colors.status.warning,
    lineHeight: 18,
  },
  attentionItemTextCol: {
    flex: 1,
  },
  attentionItemTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  attentionItemNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.text.secondary,
    marginTop: 1,
  },
  findingsCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  findingField: {
    paddingVertical: 4,
  },
  findingLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  findingValue: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.primary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.divider,
    marginVertical: spacing.sm,
  },
  noEvidenceBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  noEvidenceText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  evidenceReviewList: {
    gap: 6,
    marginBottom: spacing.md,
  },
  evidenceReviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  evidenceReviewTextCol: {
    flex: 1,
  },
  evidenceReviewTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  evidenceReviewMeta: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.brand.navyLight,
    lineHeight: 16,
    flex: 1,
  },
  actionButtonsCol: {
    marginBottom: spacing.xl,
  },
});
