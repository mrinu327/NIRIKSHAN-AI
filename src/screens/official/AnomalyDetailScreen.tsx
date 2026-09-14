/**
 * AnomalyDetailScreen
 * SIH26095 | MoSJE Government Official Monitoring Workflow
 *
 * Dedicated AI-assisted anomaly explainability and decision-support screen.
 * Details every contributing signal, underlying Phase 4 metrics, exact mathematical
 * contributions, advisory recommendations, limitations disclaimer, and official actions.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackParamList, OfficialStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockAnomalyService } from '../../services/mock/mockAnomalyService';
import { mockAnalyticsService } from '../../services/mock/mockAnalyticsService';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { AnomalyAssessment, AnomalyDismissalReason } from '../../types/anomaly';
import { AttendanceAnalytics } from '../../types/attendance';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type AnomalyDetailRouteProp = RouteProp<OfficialStackParamList, 'AnomalyDetail'>;

export const AnomalyDetailScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<AnomalyDetailRouteProp>();
  const { projectId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isNarrow = width < 360;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<AnomalyAssessment | null>(null);
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Dismiss modal state
  const [dismissModalVisible, setDismissModalVisible] = useState(false);
  const [selectedDismissReason, setSelectedDismissReason] = useState<AnomalyDismissalReason>('Data verified');

  const loadData = async () => {
    try {
      const [assessData, analyticsData] = await Promise.all([
        mockAnomalyService.getAssessmentForProject(projectId),
        mockAnalyticsService.getProjectAttendanceAnalytics(projectId),
      ]);
      setAssessment(assessData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading anomaly detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, projectId]);

  const handleMarkFollowUp = async () => {
    try {
      const updated = await mockAnomalyService.updateAssessmentStatus(
        projectId,
        'Confirmed for Follow-Up'
      );
      setAssessment(updated);
      setFeedbackMsg('Assessment confirmed for administrative follow-up. Field teams alerted.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (e) {
      console.error('Failed marking follow-up:', e);
    }
  };

  const handleExecuteDismissal = async () => {
    try {
      const updated = await mockAnomalyService.updateAssessmentStatus(projectId, 'Dismissed', {
        dismissalReason: selectedDismissReason,
        dismissalNotes: `Dismissed by official: ${selectedDismissReason}`,
      });
      setAssessment(updated);
      setDismissModalVisible(false);
      setFeedbackMsg(`Assessment dismissed (${selectedDismissReason}). Acknowledged in audit record.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (e) {
      console.error('Failed dismissing assessment:', e);
    }
  };

  const handleInitiateInspection = async () => {
    const alerts = await mockAlertService.getAlertsByProjectId(projectId);
    navigation.navigate('InitiateInspection', {
      projectId,
      alertId: alerts[0]?.id || 'ALT-2601',
    });
  };

  if (loading || !assessment || !analytics) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="AI Anomaly Assessment" subtitle="Computing explainability..." />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Evaluating multi-source operational signals...</Text>
        </View>
      </View>
    );
  }

  const statItemWidth = isDesktop ? '23.8%' : isNarrow ? '100%' : '48%';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="AI-Assisted Anomaly Assessment"
        subtitle={`${assessment.projectName} • Decision Support`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Breadcrumb */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={colors.brand.primary} />
          <Text style={styles.backButtonText}>Back to Project Overview</Text>
        </TouchableOpacity>

        {/* Feedback Banner */}
        {feedbackMsg && (
          <View style={styles.feedbackBanner}>
            <Ionicons name="checkmark-circle" size={16} color={colors.status.normal} />
            <Text style={styles.feedbackText}>{feedbackMsg}</Text>
          </View>
        )}

        {/* HEADER HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroTagRow}>
            <View style={styles.aiTag}>
              <Ionicons name="hardware-chip-outline" size={12} color={colors.brand.primary} />
              <Text style={styles.aiTagText}>AI-ASSISTED DECISION SUPPORT</Text>
            </View>
            <StatusBadge
              label={assessment.status}
              variant={
                assessment.status === 'Confirmed for Follow-Up'
                  ? 'warning'
                  : assessment.status === 'Dismissed'
                  ? 'info'
                  : assessment.status === 'Resolved'
                  ? 'normal'
                  : 'highPriority'
              }
              size="sm"
            />
          </View>

          <Text style={styles.heroProjectName}>{assessment.projectName}</Text>
          <Text style={styles.heroTimestamp}>Assessment Timestamp: {assessment.generatedAt}</Text>

          {assessment.dismissalReason && (
            <View style={styles.dismissalNoticeBox}>
              <Ionicons name="information-circle" size={14} color={colors.brand.navyLight} />
              <Text style={styles.dismissalNoticeText}>
                Dismissed Reason: <Text style={{ fontWeight: 'bold' }}>{assessment.dismissalReason}</Text>{' '}
                by {assessment.reviewedBy} ({assessment.reviewedAt})
              </Text>
            </View>
          )}

          {/* Metric Overview Grid */}
          <View style={styles.heroScoreGrid}>
            <View style={styles.heroScoreCol}>
              <Text style={styles.heroScoreLabel}>Anomaly Score</Text>
              <Text style={styles.heroScoreValue}>
                {assessment.overallScore} <Text style={styles.heroScoreSub}>/ 100</Text>
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroScoreCol}>
              <Text style={styles.heroScoreLabel}>Severity</Text>
              <Text
                style={[
                  styles.heroScoreValue,
                  {
                    color:
                      assessment.severity === 'Critical' || assessment.severity === 'High'
                        ? colors.status.highPriority
                        : colors.status.warning,
                  },
                ]}
              >
                {assessment.severity}
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroScoreCol}>
              <Text style={styles.heroScoreLabel}>Confidence</Text>
              <Text style={[styles.heroScoreValue, { color: colors.brand.navyLight }]}>
                {assessment.confidence}
              </Text>
            </View>
          </View>

          <View style={styles.confidenceReasonBox}>
            <Ionicons name="shield-outline" size={14} color={colors.brand.navyLight} />
            <Text style={styles.confidenceReasonText}>{assessment.confidenceReason}</Text>
          </View>
        </View>

        {/* SECTION 1: Why This Was Flagged */}
        <SectionHeader
          title="1. Why This Was Flagged"
          subtitle="Contributing operational signals evaluated by AI decision support"
          badgeCount={assessment.signals.length}
        />

        {assessment.signals.map((sig) => (
          <View key={sig.signalId} style={styles.signalDetailCard}>
            <View style={styles.sigDetailHeader}>
              <View style={styles.sigDetailTitleRow}>
                <Ionicons
                  name={sig.severity === 'High' || sig.severity === 'Critical' ? 'alert-circle' : 'information-circle'}
                  size={18}
                  color={sig.severity === 'High' || sig.severity === 'Critical' ? colors.status.highPriority : colors.status.warning}
                />
                <Text style={styles.sigDetailTitle}>{sig.title}</Text>
              </View>
              <View style={styles.sigContribBadge}>
                <Text style={styles.sigContribText}>+{sig.scoreContribution} pts</Text>
              </View>
            </View>

            {/* Metric Comparison Grid */}
            <View style={styles.sigMetricGrid}>
              <View style={styles.sigMetricItem}>
                <Text style={styles.sigMetricLabel}>Observed Value</Text>
                <Text style={styles.sigMetricVal}>{sig.observedValue}</Text>
              </View>
              <View style={styles.sigMetricDivider} />
              <View style={styles.sigMetricItem}>
                <Text style={styles.sigMetricLabel}>Expected / Baseline</Text>
                <Text style={styles.sigMetricVal}>{sig.expectedValue || 'N/A'}</Text>
              </View>
              <View style={styles.sigMetricDivider} />
              <View style={styles.sigMetricItem}>
                <Text style={styles.sigMetricLabel}>Variance</Text>
                <Text style={[styles.sigMetricVal, { color: colors.status.highPriority }]}>
                  {sig.difference}
                </Text>
              </View>
            </View>

            <Text style={styles.sigExplanationText}>{sig.explanation}</Text>

            <View style={styles.sigRecBox}>
              <Ionicons name="checkmark-circle-outline" size={13} color={colors.brand.primary} />
              <Text style={styles.sigRecText}>
                <Text style={{ fontWeight: 'bold' }}>Recommendation: </Text>
                {sig.recommendation}
              </Text>
            </View>
          </View>
        ))}

        {/* SECTION 2: Evidence & Source Data */}
        <SectionHeader
          title="2. Evidence & Source Data (Phase 4)"
          subtitle="Underlying roll-call, CCTV telemetry and baseline metrics"
        />

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Reported Attendance</Text>
            <Text style={styles.statValue}>{analytics.reportedAttendance}</Text>
            <Text style={styles.statSub}>Declared roll-call</Text>
          </View>

          <View style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Grant Capacity</Text>
            <Text style={styles.statValue}>{analytics.capacity}</Text>
            <Text style={styles.statSub}>Sanctioned seats</Text>
          </View>

          <View style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>CCTV Estimated Occupancy</Text>
            <Text style={[styles.statValue, { color: colors.brand.primary }]}>
              {analytics.cctvEstimatedOccupancy !== null ? analytics.cctvEstimatedOccupancy : 'Unavailable'}
            </Text>
            <Text style={styles.statSub}>Optical camera estimate</Text>
          </View>

          <View style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Occupancy Variance</Text>
            <Text style={[styles.statValue, { color: colors.status.highPriority }]}>
              {analytics.occupancyVariance !== null ? `+${analytics.occupancyVariance}` : 'N/A'}
            </Text>
            <Text style={styles.statSub}>Difference vs estimate</Text>
          </View>
        </View>

        {/* SECTION 3: How The Score Was Calculated */}
        <SectionHeader
          title="3. How The Score Was Calculated"
          subtitle="Deterministic, inspectable scoring contribution table"
        />

        <View style={styles.scoringCard}>
          <View style={styles.scoringTableRow}>
            <Text style={styles.scoringColHeader}>Operational Signal</Text>
            <Text style={styles.scoringColHeaderRight}>Score Contribution</Text>
          </View>

          {assessment.signals.map((sig) => (
            <View key={sig.signalId} style={styles.scoringTableRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.scoringItemName}>{sig.title}</Text>
                <Text style={styles.scoringItemSub}>{sig.type}</Text>
              </View>
              <Text style={styles.scoringItemPoints}>+{sig.scoreContribution} pts</Text>
            </View>
          ))}

          <View style={styles.scoringTableDivider} />

          <View style={styles.scoringTotalRow}>
            <Text style={styles.scoringTotalLabel}>Total Normalized Anomaly Score:</Text>
            <Text style={styles.scoringTotalValue}>{assessment.overallScore} / 100</Text>
          </View>

          <View style={styles.scoringNoteBox}>
            <Text style={styles.scoringNoteText}>
              Thresholds: Low (0–24) • Moderate (25–49) • High (50–74) • Critical (75–100). Score represents data variance intensity, not a probability of wrongdoing.
            </Text>
          </View>
        </View>

        {/* SECTION 4: AI Recommendation */}
        <SectionHeader
          title="4. AI Decision-Support Recommendation"
          subtitle="Automated guidance formulated for administrative officials"
        />

        <View style={styles.recCard}>
          <View style={styles.recHeaderRow}>
            <Ionicons name="bulb-outline" size={20} color={colors.brand.primary} />
            <Text style={styles.recTitle}>Recommended Administrative Action</Text>
          </View>
          <Text style={styles.recBody}>{assessment.recommendedAction}</Text>
        </View>

        {/* SECTION 5: Limitations & Safety Notice */}
        <View style={styles.limitationsCard}>
          <View style={styles.limitationsHeader}>
            <Ionicons name="shield-checkmark" size={16} color={colors.brand.navyLight} />
            <Text style={styles.limitationsTitle}>AI Ethics, Privacy & Governance Notice</Text>
          </View>
          <Text style={styles.limitationsText}>
            • This assessment is an advisory decision-support signal, NOT a final determination of misconduct or fraud.{'\n'}
            • CCTV occupancy represents an optical area estimate only and does not prove or disprove attendance.{'\n'}
            • No facial recognition, individual biometric tracking, or punitive automation is deployed.{'\n'}
            • All data entries represent synthetic demonstration records for Hackathon evaluation.
          </Text>
        </View>

        {/* SECTION 6: Official Governance Actions */}
        <SectionHeader
          title="6. Official Governance Actions"
          subtitle="Human authority decisions based on anomaly review"
        />

        <View style={styles.actionGrid}>
          <PrimaryButton
            title="Initiate Surprise Inspection"
            iconName="flash"
            onPress={handleInitiateInspection}
          />

          <SecondaryButton
            title="Mark for Administrative Follow-Up"
            iconName="bookmark-outline"
            onPress={handleMarkFollowUp}
            style={{ marginTop: 10 }}
          />

          <SecondaryButton
            title="Dismiss Assessment"
            iconName="close-circle-outline"
            onPress={() => setDismissModalVisible(true)}
            style={{ marginTop: 10 }}
          />

          <SecondaryButton
            title="Review Raw Attendance Analytics"
            iconName="stats-chart"
            onPress={() => navigation.navigate('AttendanceAnalytics', { projectId })}
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>

      {/* DISMISS REASON MODAL */}
      <Modal
        visible={dismissModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDismissModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dismiss Anomaly Assessment</Text>
              <TouchableOpacity onPress={() => setDismissModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select the administrative reason for dismissing this anomaly signal. This entry is stored in the governance audit trail.
            </Text>

            <View style={styles.modalOptionsList}>
              {(['Data verified', 'False positive', 'Insufficient evidence', 'Other'] as AnomalyDismissalReason[]).map(
                (reason) => {
                  const isSelected = selectedDismissReason === reason;
                  return (
                    <TouchableOpacity
                      key={reason}
                      style={[styles.modalOptionItem, isSelected && styles.modalOptionSelected]}
                      onPress={() => setSelectedDismissReason(reason)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={isSelected ? colors.brand.primary : colors.text.muted}
                      />
                      <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <View style={styles.modalActionButtons}>
              <PrimaryButton title="Confirm Dismissal" onPress={handleExecuteDismissal} />
              <SecondaryButton
                title="Cancel"
                onPress={() => setDismissModalVisible(false)}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 1200,
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
  },
  backButtonText: {
    marginLeft: 6,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.status.normalLight,
    borderWidth: 1,
    borderColor: colors.status.normalBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.base,
  },
  feedbackText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.status.normal,
  },
  heroCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.6,
  },
  heroProjectName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  heroTimestamp: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  dismissalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  dismissalNoticeText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  heroScoreGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroScoreCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.neutral.border,
  },
  heroScoreLabel: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroScoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  heroScoreSub: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  confidenceReasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
  },
  confidenceReasonText: {
    fontSize: 11,
    color: colors.brand.primary,
    lineHeight: 16,
    flex: 1,
  },
  signalDetailCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  sigDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sigDetailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  sigDetailTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  sigContribBadge: {
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  sigContribText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  sigMetricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },
  sigMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  sigMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.neutral.border,
  },
  sigMetricLabel: {
    fontSize: 9,
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  sigMetricVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 1,
  },
  sigExplanationText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  sigRecBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: colors.status.normalLight,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.status.normalBorder,
  },
  sigRecText: {
    fontSize: 10,
    color: colors.status.normal,
    lineHeight: 15,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  statBox: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    ...shadows.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginVertical: 4,
  },
  statSub: {
    fontSize: 10,
    color: colors.text.muted,
  },
  scoringCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  scoringTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  scoringColHeader: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  scoringColHeaderRight: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  scoringItemName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  scoringItemSub: {
    fontSize: 9,
    color: colors.text.muted,
  },
  scoringItemPoints: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  scoringTableDivider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: spacing.sm,
  },
  scoringTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  scoringTotalLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  scoringTotalValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  scoringNoteBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  scoringNoteText: {
    fontSize: 10,
    color: colors.text.muted,
    lineHeight: 14,
  },
  recCard: {
    backgroundColor: colors.brand.primaryLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  recTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  recBody: {
    fontSize: typography.sizes.xs,
    color: colors.brand.navyLight,
    lineHeight: 18,
  },
  limitationsCard: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  limitationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  limitationsTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  limitationsText: {
    fontSize: 10,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  actionGrid: {
    marginBottom: spacing.xl,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    padding: spacing.lg,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  modalOptionsList: {
    gap: 8,
    marginBottom: spacing.lg,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.surfaceSubtle,
    minHeight: 44,
  },
  modalOptionSelected: {
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.brand.primary,
  },
  modalOptionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  modalOptionTextSelected: {
    color: colors.brand.primary,
    fontWeight: typography.weights.bold,
  },
  modalActionButtons: {
    width: '100%',
  },
});
