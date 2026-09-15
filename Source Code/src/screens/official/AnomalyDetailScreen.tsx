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
import AppSurface from '../../components/ui/AppSurface';

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

  const [dismissModalVisible, setDismissModalVisible] = useState(false);
  const [selectedDismissReason, setSelectedDismissReason] =
    useState<AnomalyDismissalReason>('Data verified');

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
        'Confirmed for Follow-Up',
      );
      setAssessment(updated);
      setFeedbackMsg(
        'Assessment confirmed for administrative follow-up. Field teams alerted.',
      );
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (e) {
      console.error('Failed marking follow-up:', e);
    }
  };

  const handleExecuteDismissal = async () => {
    try {
      const updated = await mockAnomalyService.updateAssessmentStatus(
        projectId,
        'Dismissed',
        {
          dismissalReason: selectedDismissReason,
          dismissalNotes: `Dismissed by official: ${selectedDismissReason}`,
        },
      );
      setAssessment(updated);
      setDismissModalVisible(false);
      setFeedbackMsg(
        `Assessment dismissed (${selectedDismissReason}). Acknowledged in audit record.`,
      );
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
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.palette.olivewoodDark}
        />
        <AppHeader
          title="AI Anomaly Assessment"
          subtitle="Computing explainability..."
        />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.palette.olive} />
          <Text style={styles.loadingText}>
            Evaluating multi-source operational signals...
          </Text>
        </View>
      </View>
    );
  }

  const statItemWidth = isDesktop ? '23.8%' : isNarrow ? '100%' : '48%';

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.palette.olivewoodDark}
      />

      <AppHeader
        title="AI-Assisted Anomaly Assessment"
        subtitle={`${assessment.projectName} • Decision Support`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back to Project Overview"
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={colors.palette.olivewoodDark}
          />
          <Text style={styles.backButtonText}>Back to Project Overview</Text>
        </TouchableOpacity>

        {feedbackMsg && (
          <View style={styles.feedbackBanner}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.status.normal}
            />
            <Text style={styles.feedbackText}>{feedbackMsg}</Text>
          </View>
        )}

        <AppSurface style={styles.heroCard}>
          <View style={styles.heroTagRow}>
            <View style={styles.aiTag}>
              <View style={styles.aiTagIcon}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={13}
                  color={colors.palette.olivewoodDark}
                />
              </View>
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
          <Text style={styles.heroTimestamp}>
            Assessment Timestamp: {assessment.generatedAt}
          </Text>

          {assessment.dismissalReason && (
            <View style={styles.dismissalNoticeBox}>
              <Ionicons
                name="information-circle"
                size={14}
                color={colors.palette.olivewoodDark}
              />
              <Text style={styles.dismissalNoticeText}>
                Dismissed Reason:{' '}
                <Text style={styles.inlineBold}>
                  {assessment.dismissalReason}
                </Text>{' '}
                by {assessment.reviewedBy} ({assessment.reviewedAt})
              </Text>
            </View>
          )}

          <View style={styles.heroScoreGrid}>
            <View style={styles.heroScoreCol}>
              <Text style={styles.heroScoreLabel}>Anomaly Score</Text>
              <Text style={styles.heroScoreValue}>
                {assessment.overallScore}{' '}
                <Text style={styles.heroScoreSub}>/ 100</Text>
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
                      assessment.severity === 'Critical' ||
                      assessment.severity === 'High'
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
              <Text
                style={[
                  styles.heroScoreValue,
                  { color: colors.palette.olivewoodDark },
                ]}
              >
                {assessment.confidence}
              </Text>
            </View>
          </View>

          <View style={styles.confidenceReasonBox}>
            <Ionicons
              name="shield-outline"
              size={14}
              color={colors.palette.olivewoodDark}
            />
            <Text style={styles.confidenceReasonText}>
              {assessment.confidenceReason}
            </Text>
          </View>
        </AppSurface>

        <SectionHeader
          title="1. Why This Was Flagged"
          subtitle="Contributing operational signals evaluated by AI decision support"
          badgeCount={assessment.signals.length}
        />

        {assessment.signals.map((sig) => (
          <AppSurface key={sig.signalId} style={styles.signalDetailCard}>
            <View style={styles.sigDetailHeader}>
              <View style={styles.sigDetailTitleRow}>
                <Ionicons
                  name={
                    sig.severity === 'High' || sig.severity === 'Critical'
                      ? 'alert-circle'
                      : 'information-circle'
                  }
                  size={18}
                  color={
                    sig.severity === 'High' || sig.severity === 'Critical'
                      ? colors.status.highPriority
                      : colors.status.warning
                  }
                />
                <Text style={styles.sigDetailTitle}>{sig.title}</Text>
              </View>

              <View style={styles.sigContribBadge}>
                <Text style={styles.sigContribText}>
                  +{sig.scoreContribution} pts
                </Text>
              </View>
            </View>

            <View style={styles.sigMetricGrid}>
              <View style={styles.sigMetricItem}>
                <Text style={styles.sigMetricLabel}>Observed Value</Text>
                <Text style={styles.sigMetricVal}>{sig.observedValue}</Text>
              </View>

              <View style={styles.sigMetricDivider} />

              <View style={styles.sigMetricItem}>
                <Text style={styles.sigMetricLabel}>
                  Expected / Baseline
                </Text>
                <Text style={styles.sigMetricVal}>
                  {sig.expectedValue || 'N/A'}
                </Text>
              </View>

              <View style={styles.sigMetricDivider} />

              <View style={styles.sigMetricItem}>
                <Text style={styles.sigMetricLabel}>Variance</Text>
                <Text
                  style={[
                    styles.sigMetricVal,
                    { color: colors.status.highPriority },
                  ]}
                >
                  {sig.difference}
                </Text>
              </View>
            </View>

            <Text style={styles.sigExplanationText}>{sig.explanation}</Text>

            <View style={styles.sigRecBox}>
              <Ionicons
                name="checkmark-circle-outline"
                size={13}
                color={colors.palette.olivewoodDark}
              />
              <Text style={styles.sigRecText}>
                <Text style={styles.inlineBold}>Recommendation: </Text>
                {sig.recommendation}
              </Text>
            </View>
          </AppSurface>
        ))}

        <SectionHeader
          title="2. Evidence & Source Data (Phase 4)"
          subtitle="Underlying roll-call, CCTV telemetry and baseline metrics"
        />

        <View style={styles.statsGrid}>
          <AppSurface style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Reported Attendance</Text>
            <Text style={styles.statValue}>
              {analytics.reportedAttendance}
            </Text>
            <Text style={styles.statSub}>Declared roll-call</Text>
          </AppSurface>

          <AppSurface style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Grant Capacity</Text>
            <Text style={styles.statValue}>{analytics.capacity}</Text>
            <Text style={styles.statSub}>Sanctioned seats</Text>
          </AppSurface>

          <AppSurface style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>CCTV Estimated Occupancy</Text>
            <Text
              style={[
                styles.statValue,
                { color: colors.palette.olivewoodDark },
              ]}
            >
              {analytics.cctvEstimatedOccupancy !== null
                ? analytics.cctvEstimatedOccupancy
                : 'Unavailable'}
            </Text>
            <Text style={styles.statSub}>Optical camera estimate</Text>
          </AppSurface>

          <AppSurface style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Occupancy Variance</Text>
            <Text
              style={[
                styles.statValue,
                { color: colors.status.highPriority },
              ]}
            >
              {analytics.occupancyVariance !== null
                ? `+${analytics.occupancyVariance}`
                : 'N/A'}
            </Text>
            <Text style={styles.statSub}>Difference vs estimate</Text>
          </AppSurface>
        </View>

        <SectionHeader
          title="3. How The Score Was Calculated"
          subtitle="Deterministic, inspectable scoring contribution table"
        />

        <AppSurface style={styles.scoringCard}>
          <View style={styles.scoringTableRow}>
            <Text style={styles.scoringColHeader}>Operational Signal</Text>
            <Text style={styles.scoringColHeaderRight}>
              Score Contribution
            </Text>
          </View>

          {assessment.signals.map((sig) => (
            <View key={sig.signalId} style={styles.scoringTableRow}>
              <View style={styles.scoringItemInfo}>
                <Text style={styles.scoringItemName}>{sig.title}</Text>
                <Text style={styles.scoringItemSub}>{sig.type}</Text>
              </View>
              <Text style={styles.scoringItemPoints}>
                +{sig.scoreContribution} pts
              </Text>
            </View>
          ))}

          <View style={styles.scoringTableDivider} />

          <View style={styles.scoringTotalRow}>
            <Text style={styles.scoringTotalLabel}>
              Total Normalized Anomaly Score:
            </Text>
            <Text style={styles.scoringTotalValue}>
              {assessment.overallScore} / 100
            </Text>
          </View>

          <View style={styles.scoringNoteBox}>
            <Text style={styles.scoringNoteText}>
              Thresholds: Low (0–24) • Moderate (25–49) • High (50–74) •
              Critical (75–100). Score represents data variance intensity,
              not a probability of wrongdoing.
            </Text>
          </View>
        </AppSurface>

        <SectionHeader
          title="4. AI Decision-Support Recommendation"
          subtitle="Automated guidance formulated for administrative officials"
        />

        <AppSurface glass style={styles.recCard}>
          <View style={styles.recHeaderRow}>
            <View style={styles.recIcon}>
              <Ionicons
                name="bulb-outline"
                size={18}
                color={colors.palette.olivewoodDark}
              />
            </View>
            <Text style={styles.recTitle}>
              Recommended Administrative Action
            </Text>
          </View>
          <Text style={styles.recBody}>{assessment.recommendedAction}</Text>
        </AppSurface>

        <AppSurface style={styles.limitationsCard}>
          <View style={styles.limitationsHeader}>
            <View style={styles.limitationsIcon}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={colors.palette.olivewoodDark}
              />
            </View>
            <Text style={styles.limitationsTitle}>
              AI Ethics, Privacy & Governance Notice
            </Text>
          </View>
          <Text style={styles.limitationsText}>
            • This assessment is an advisory decision-support signal, NOT a
            final determination of misconduct or fraud.{'\n'}
            • CCTV occupancy represents an optical area estimate only and does
            not prove or disprove attendance.{'\n'}
            • No facial recognition, individual biometric tracking, or
            punitive automation is deployed.{'\n'}
            • All data entries represent synthetic demonstration records for
            Hackathon evaluation.
          </Text>
        </AppSurface>

        <SectionHeader
          title="6. Official Governance Actions"
          subtitle="Human authority decisions based on anomaly review"
        />

        <AppSurface style={styles.actionGrid}>
          <PrimaryButton
            title="Initiate Surprise Inspection"
            iconName="flash"
            onPress={handleInitiateInspection}
          />

          <SecondaryButton
            title="Mark for Administrative Follow-Up"
            iconName="bookmark-outline"
            onPress={handleMarkFollowUp}
            style={styles.actionButton}
          />

          <SecondaryButton
            title="Dismiss Assessment"
            iconName="close-circle-outline"
            onPress={() => setDismissModalVisible(true)}
            style={styles.actionButton}
          />

          <SecondaryButton
            title="Review Raw Attendance Analytics"
            iconName="stats-chart"
            onPress={() =>
              navigation.navigate('AttendanceAnalytics', { projectId })
            }
            style={styles.actionButton}
          />
        </AppSurface>
      </ScrollView>

      <Modal
        visible={dismissModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDismissModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Dismiss Anomaly Assessment
              </Text>
              <TouchableOpacity
                onPress={() => setDismissModalVisible(false)}
                style={styles.modalCloseButton}
                accessibilityRole="button"
                accessibilityLabel="Close dismissal dialog"
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select the administrative reason for dismissing this anomaly
              signal. This entry is stored in the governance audit trail.
            </Text>

            <View style={styles.modalOptionsList}>
              {(
                [
                  'Data verified',
                  'False positive',
                  'Insufficient evidence',
                  'Other',
                ] as AnomalyDismissalReason[]
              ).map((reason) => {
                const isSelected = selectedDismissReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.modalOptionItem,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => setSelectedDismissReason(reason)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Ionicons
                      name={
                        isSelected
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={18}
                      color={
                        isSelected
                          ? colors.palette.olivewoodDark
                          : colors.text.muted
                      }
                    />
                    <Text
                      style={[
                        styles.modalOptionText,
                        isSelected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActionButtons}>
              <PrimaryButton
                title="Confirm Dismissal"
                onPress={handleExecuteDismissal}
              />
              <SecondaryButton
                title="Cancel"
                onPress={() => setDismissModalVisible(false)}
                style={styles.modalCancelButton}
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
    textAlign: 'center',
  },

  scrollContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: 96,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    minHeight: 44,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },

  backButtonText: {
    marginLeft: 6,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.palette.olivewoodDark,
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
    flex: 1,
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.status.normal,
    lineHeight: 16,
  },

  heroCard: {
    marginBottom: spacing.lg,
    ...shadows.sm,
  },

  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  aiTagIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.palette.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  aiTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.palette.olivewoodDark,
    letterSpacing: 0.45,
  },

  heroProjectName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  heroTimestamp: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 3,
    marginBottom: spacing.md,
  },

  dismissalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: colors.palette.sageLight,
    borderWidth: 1,
    borderColor: colors.palette.sageBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },

  dismissalNoticeText: {
    flex: 1,
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
  },

  inlineBold: {
    fontWeight: typography.weights.bold,
  },

  heroScoreGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.palette.parchmentSubtle,
    borderWidth: 1,
    borderColor: colors.palette.sandBorder,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },

  heroScoreCol: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
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
    color: colors.text.primary,
    textAlign: 'center',
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
    backgroundColor: colors.palette.sageLight,
    borderWidth: 1,
    borderColor: colors.palette.sageBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },

  confidenceReasonText: {
    fontSize: 11,
    color: colors.palette.olivewoodDark,
    lineHeight: 16,
    flex: 1,
  },

  signalDetailCard: {
    marginBottom: spacing.sm,
    ...shadows.xs,
  },

  sigDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  sigDetailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },

  sigDetailTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },

  sigContribBadge: {
    backgroundColor: colors.palette.sageLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.palette.sageBorder,
  },

  sigContribText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.palette.olivewoodDark,
  },

  sigMetricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.palette.parchmentSubtle,
    borderWidth: 1,
    borderColor: colors.palette.sandBorder,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },

  sigMetricItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },

  sigMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.neutral.border,
  },

  sigMetricLabel: {
    fontSize: 9,
    color: colors.text.muted,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  sigMetricVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
    textAlign: 'center',
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
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
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
    marginBottom: spacing.lg,
  },

  statBox: {
    minHeight: 112,
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
    marginBottom: spacing.lg,
    ...shadows.xs,
  },

  scoringTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: spacing.sm,
  },

  scoringColHeader: {
    flex: 1,
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

  scoringItemInfo: {
    flex: 1,
    minWidth: 0,
  },

  scoringItemName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },

  scoringItemSub: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 2,
  },

  scoringItemPoints: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.palette.olivewoodDark,
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
    gap: spacing.sm,
    paddingVertical: 4,
  },

  scoringTotalLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  scoringTotalValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.palette.olivewoodDark,
  },

  scoringNoteBox: {
    backgroundColor: colors.palette.parchmentSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },

  scoringNoteText: {
    fontSize: 10,
    color: colors.text.muted,
    lineHeight: 14,
  },

  recCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.palette.sageLight,
    borderColor: colors.palette.sageBorder,
  },

  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },

  recIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.palette.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recTitle: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.palette.olivewoodDark,
  },

  recBody: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  limitationsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.palette.parchmentSubtle,
    borderColor: colors.palette.sandBorder,
  },

  limitationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },

  limitationsIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.palette.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  limitationsTitle: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  limitationsText: {
    fontSize: 10,
    color: colors.text.secondary,
    lineHeight: 16,
  },

  actionGrid: {
    marginBottom: spacing.xl,
  },

  actionButton: {
    marginTop: spacing.sm,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.ui.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },

  modalCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 480,
    maxHeight: '94%',
    padding: spacing.lg,
    ...shadows.lg,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },

  modalTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  modalCloseButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.palette.parchmentSubtle,
    minHeight: 48,
  },

  modalOptionSelected: {
    backgroundColor: colors.palette.sageLight,
    borderColor: colors.palette.sageBorder,
  },

  modalOptionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },

  modalOptionTextSelected: {
    color: colors.palette.olivewoodDark,
    fontWeight: typography.weights.bold,
  },

  modalActionButtons: {
    width: '100%',
  },

  modalCancelButton: {
    marginTop: 8,
  },
});

export default AnomalyDetailScreen;
