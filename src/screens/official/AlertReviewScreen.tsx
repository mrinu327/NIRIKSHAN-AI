/**
 * AlertReviewScreen
 * SIH26095 | MoSJE Government Official Monitoring Workflow
 *
 * Detailed Anomaly Review Screen for Discrepancy Verification.
 * Complies strictly with MoSJE AI safety and neutral diagnostic policies.
 * Allows Government Officials to take human review actions:
 * - Mark for follow-up
 * - Mark as reviewed / dismiss
 * - Initiate inspection
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackParamList, OfficialStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { AnomalyAlert } from '../../types/alert';
import { Project } from '../../types/project';
import { SUNRISE_ATTENDANCE } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type AlertReviewRouteProp = RouteProp<OfficialStackParamList, 'AlertReview'>;

export const AlertReviewScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<AlertReviewRouteProp>();
  const { alertId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AnomalyAlert | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Entrance animation
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  const loadAlertData = async () => {
    try {
      const alertData = await mockAlertService.getAlertById(alertId);
      if (alertData) {
        setAlert(alertData);
        const projData = await mockProjectService.getProjectById(alertData.projectId);
        setProject(projData || null);
      }
    } catch (error) {
      console.error('Error loading alert review:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertData();
  }, [alertId]);

  useEffect(() => {
    if (!loading && alert) {
      Animated.parallel([
        Animated.timing(screenFade, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(screenSlide, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, alert]);

  if (loading || !alert) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Alert Review" subtitle="Loading anomaly telemetry..." />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Fetching anomaly review details...</Text>
        </View>
      </View>
    );
  }

  const isSunrise = alert.projectId === 'PRJ-101' || alert.projectName.includes('Sunrise');
  const reportedAttendance = isSunrise ? SUNRISE_ATTENDANCE.currentSubmittedAttendance : alert.metricComparison?.reportedAttendance ?? 42;
  const feedEstimate = isSunrise ? 25 : alert.metricComparison?.headcountEstimate ?? 25;
  const varianceCount = isSunrise ? 17 : alert.metricComparison?.difference ?? 17;

  const handleMarkFollowUp = async () => {
    const updated = await mockAlertService.markForFollowUp(alert.id);
    if (updated) {
      setAlert({ ...updated });
      setActionFeedback('Alert marked for follow-up verification. Field monitoring team alerted.');
    }
  };

  const handleDismiss = async () => {
    const updated = await mockAlertService.dismissAlert(alert.id);
    if (updated) {
      setAlert({ ...updated });
      setActionFeedback('Alert marked as reviewed. Discrepancy acknowledged by official.');
    }
  };

  const handleInitiateInspection = () => {
    navigation.navigate('InitiateInspection', {
      projectId: alert.projectId,
      alertId: alert.id,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Header */}
      <AppHeader
        title="Anomaly Review"
        subtitle={`Alert #${alert.id} • MoSJE Central Desk`}
      />

      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Navigation Breadcrumb */}
          <View style={styles.breadcrumbBar}>
            <TouchableOpacity
              style={styles.breadcrumbBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={14} color={colors.brand.primary} />
              <Text style={styles.breadcrumbLink}>Alerts Queue</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <Text style={styles.breadcrumbCode}>#{alert.id}</Text>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <Text style={styles.breadcrumbCurrent}>Review</Text>
          </View>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <View style={styles.feedbackBanner}>
            <Ionicons name="checkmark-circle" size={18} color={colors.status.normal} />
            <Text style={styles.feedbackText}>{actionFeedback}</Text>
          </View>
        )}

        {/* SECTION 1: Alert Overview Banner */}
        <View style={styles.alertCard}>
          <View style={styles.alertTopRow}>
            <View style={styles.severityPill}>
              <Ionicons name="warning" size={16} color={colors.status.highPriority} />
              <Text style={styles.severityText}>Severity: {alert.severity}</Text>
            </View>
            <Text style={styles.timestamp}>{alert.timestamp}</Text>
          </View>

          <Text style={styles.alertCategory}>{alert.category}</Text>
          <Text style={styles.targetProject}>{alert.projectName}</Text>
          <Text style={styles.alertDesc}>{alert.description}</Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Status:</Text>
            <StatusBadge
              label={alert.status}
              variant={
                alert.status === 'Verified'
                  ? 'normal'
                  : alert.status === 'Under Investigation'
                  ? 'warning'
                  : alert.status === 'Dismissed'
                  ? 'info'
                  : 'highPriority'
              }
              size="sm"
            />
          </View>

          {alert.reviewedBy && (
            <View style={styles.reviewedByBox}>
              <Ionicons name="person-circle-outline" size={16} color={colors.brand.navyLight} />
              <Text style={styles.reviewedByText}>
                Reviewed by {alert.reviewedBy} • {alert.reviewedAt}
              </Text>
            </View>
          )}
        </View>

        {/* SECTION 2: Metric Comparison Breakdown */}
        <SectionHeader
          title="Telemetry Variance Analysis"
          subtitle="Direct comparison between biometric submission and edge camera feed"
        />

        <View style={styles.metricsComparisonCard}>
          <View style={styles.metricColumnsRow}>
            <View style={styles.metricColumn}>
              <Text style={styles.metricColumnLabel}>Morning Submitted Attendance</Text>
              <Text style={styles.metricColumnValue}>{reportedAttendance}</Text>
              <Text style={styles.metricColumnSub}>Institute roll-call (09:28 AM)</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricColumn}>
              <Text style={styles.metricColumnLabel}>CCTV Telemetry Estimate</Text>
              <Text style={styles.metricColumnValue}>{feedEstimate}</Text>
              <Text style={styles.metricColumnSub}>Camera edge detector (Main Hall)</Text>
            </View>
          </View>

          <View style={styles.varianceSummaryRow}>
            <View style={styles.varianceIconBox}>
              <Ionicons name="git-compare" size={20} color={colors.status.highPriority} />
            </View>
            <View style={styles.varianceInfo}>
              <Text style={styles.varianceHeading}>Unverified Variance: +{varianceCount} Attendees</Text>
              <Text style={styles.varianceDetail}>
                Submitted attendance is {varianceCount} higher than the camera-estimated turnout.
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION 3: Mandated AI Safety & Neutral Diagnostic Explanation */}
        <View style={styles.policySafetyCard}>
          <View style={styles.policyHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.brand.primary} />
            <Text style={styles.policyTitle}>MoSJE Automated Screening Protocol Notice</Text>
          </View>

          <Text style={styles.policyBody}>
            "The system detected a discrepancy between submitted attendance and estimated CCTV telemetry. This is an automated screening signal and requires human verification."
          </Text>

          <View style={styles.safetyDivider} />

          <View style={styles.safetyNote}>
            <Ionicons name="information-circle-outline" size={15} color={colors.text.muted} />
            <Text style={styles.safetyNoteText}>
              System Policy Constraint: This automated indicator does NOT prove fraud, fake attendance, or institutional misconduct. It functions strictly as an operational triage signal requiring official human review or physical verification.
            </Text>
          </View>
        </View>

        {/* SECTION 4: Human Review Actions */}
        <SectionHeader
          title="Official Human Review Actions"
          subtitle="Choose an appropriate governance action based on current telemetry"
        />

        <View style={styles.actionsCard}>
          <PrimaryButton
            title="Initiate Surprise Inspection"
            iconName="flash"
            onPress={handleInitiateInspection}
            style={styles.primaryActionButton}
          />

          <View style={styles.secondaryActionsRow}>
            <SecondaryButton
              title="Mark for Follow-up"
              iconName="time-outline"
              onPress={handleMarkFollowUp}
              style={[styles.secondaryActionBtn, isDesktop && { flex: 1 }]}
            />
            <SecondaryButton
              title="Dismiss / Mark Reviewed"
              iconName="checkmark-done"
              onPress={handleDismiss}
              style={[styles.secondaryActionBtn, isDesktop && { flex: 1 }]}
            />
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  animatedContainer: {
    flex: 1,
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
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.neutral.surface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: 6,
  },
  breadcrumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  breadcrumbSeparator: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  breadcrumbCode: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  breadcrumbCurrent: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  feedbackText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    color: '#065F46',
    marginLeft: spacing.sm,
    flex: 1,
  },
  alertCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.highPriority,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.highPriorityLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  severityText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  alertCategory: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  targetProject: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  alertDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 8,
  },
  statusLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  reviewedByBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  reviewedByText: {
    fontSize: typography.sizes.xs,
    color: colors.brand.navyLight,
    marginLeft: 6,
  },
  metricsComparisonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  metricColumnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  metricColumn: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  metricColumnLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 4,
  },
  metricColumnValue: {
    fontSize: typography.sizes.xl + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  metricColumnSub: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.neutral.border,
  },
  varianceSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  varianceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  varianceInfo: {
    flex: 1,
  },
  varianceHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
  },
  varianceDetail: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  policySafetyCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.md,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  policyTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  policyBody: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navy,
    lineHeight: 20,
    marginTop: 4,
  },
  safetyDivider: {
    height: 1,
    backgroundColor: '#DBEAFE',
    marginVertical: spacing.sm,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  safetyNoteText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 16,
    marginLeft: 6,
    flex: 1,
  },
  actionsCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.xl,
    ...shadows.xs,
  },
  primaryActionButton: {
    backgroundColor: colors.status.highPriority,
    marginBottom: spacing.md,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryActionBtn: {
    minWidth: 140,
    flex: 1,
  },
});
