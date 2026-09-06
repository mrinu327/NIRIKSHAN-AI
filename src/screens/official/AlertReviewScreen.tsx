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
 * Fully responsive for mobile and desktop viewports.
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
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackParamList, OfficialStackNavigationProp } from '../../types/navigation';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { useAuth } from '../../context/AuthContext';
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
  const insets = useSafeAreaInsets();
  const { currentRole, switchRole } = useAuth();
  const { alertId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AnomalyAlert | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Screen entrance animation
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  // Skeleton pulse animation
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Action feedback entrance animation
  const feedbackFade = useRef(new Animated.Value(0)).current;
  const feedbackSlide = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    if (loading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, {
            toValue: 0.85,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonPulse, {
            toValue: 0.35,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [loading]);

  useEffect(() => {
    if (actionFeedback) {
      feedbackFade.setValue(0);
      feedbackSlide.setValue(-8);
      Animated.parallel([
        Animated.timing(feedbackFade, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(feedbackSlide, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [actionFeedback]);

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

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'official':
        return 'MoSJE Official';
      case 'inspector':
        return 'PMU Inspection Officer';
      case 'ngo':
        return 'NGO / Institute';
      default:
        return 'MoSJE Portal';
    }
  };

  const isSunrise = alert?.projectId === 'PRJ-101' || (alert?.projectName ? alert.projectName.includes('Sunrise') : false);
  const reportedAttendance = isSunrise ? SUNRISE_ATTENDANCE.currentSubmittedAttendance : alert?.metricComparison?.reportedAttendance ?? 42;
  const feedEstimate = isSunrise ? 25 : alert?.metricComparison?.headcountEstimate ?? 25;
  const varianceCount = isSunrise ? 17 : alert?.metricComparison?.difference ?? 17;

  const handleMarkFollowUp = async () => {
    if (!alert) return;
    const updated = await mockAlertService.markForFollowUp(alert.id);
    if (updated) {
      setAlert({ ...updated });
      setActionFeedback('Alert marked for follow-up verification. Field monitoring team alerted.');
    }
  };

  const handleDismiss = async () => {
    if (!alert) return;
    const updated = await mockAlertService.dismissAlert(alert.id);
    if (updated) {
      setAlert({ ...updated });
      setActionFeedback('Alert marked as reviewed. Discrepancy acknowledged by official.');
    }
  };

  const handleInitiateInspection = () => {
    if (!alert) return;
    navigation.navigate('InitiateInspection', {
      projectId: alert.projectId,
      alertId: alert.id,
    });
  };

  const getStatusVariant = () => {
    if (!alert) return 'normal';
    switch (alert.status) {
      case 'Verified':
        return 'normal';
      case 'Under Investigation':
        return 'warning';
      case 'Dismissed':
        return 'info';
      default:
        return 'highPriority';
    }
  };

  // Loading skeleton screen
  if (loading || !alert) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

        {/* Integrated Executive Header Skeleton */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
          <View style={styles.headerInner}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerBranding}>
                <View style={styles.headerEmblem}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
                </View>
                <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={switchRole}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.switchButton}
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.text.inverse} />
                <Text style={styles.switchText}>Switch Role</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerMainRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBackBtn}
                accessibilityRole="button"
                accessibilityLabel="Back to previous screen"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Anomaly Review
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Loading anomaly telemetry...
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skeleton Body */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonAlertCard}>
            <Animated.View style={[styles.skeletonLine, { width: 140, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '70%', height: 22, marginTop: 12, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '90%', height: 14, marginTop: 10, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '60%', height: 14, marginTop: 6, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 120, height: 20, marginTop: 14, opacity: skeletonPulse }]} />
          </View>

          <View style={styles.skeletonSection}>
            <Animated.View style={[styles.skeletonLine, { width: 200, height: 18, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 300, height: 14, marginTop: 6, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonCard, { height: 150, marginTop: 12, opacity: skeletonPulse }]} />
          </View>

          <View style={styles.skeletonSection}>
            <Animated.View style={[styles.skeletonCard, { height: 120, opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  const isHighSeverity = alert.severity === 'HIGH';
  const isMediumSeverity = alert.severity === 'MEDIUM';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Integrated Executive MoSJE Header with Native-Style Back Button */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerBranding}>
              <View style={styles.headerEmblem}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
              </View>
              <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
            </View>

            <View style={styles.headerActionsRight}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{getRoleLabel()}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={switchRole}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.switchButton}
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.text.inverse} />
                <Text style={styles.switchText}>Switch Role</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerMainRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to previous screen"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text.inverse} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Anomaly Review
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Alert #{alert.id} • MoSJE Central Desk
              </Text>
            </View>

            <View style={styles.headerStatusBadge}>
              <StatusBadge label={alert.status} variant={getStatusVariant()} size="sm" />
            </View>
          </View>
        </View>
      </View>

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
          {/* Action Feedback Banner with Entrance Animation */}
          {actionFeedback && (
            <Animated.View
              style={[
                styles.feedbackBanner,
                {
                  opacity: feedbackFade,
                  transform: [{ translateY: feedbackSlide }],
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.status.normal} />
              <Text style={styles.feedbackText}>{actionFeedback}</Text>
            </Animated.View>
          )}

          {/* SECTION 1: Alert Overview Banner */}
          <View style={styles.alertCard}>
            <View style={styles.alertTopRow}>
              <View
                style={[
                  styles.severityPill,
                  isHighSeverity && styles.severityPillHigh,
                  isMediumSeverity && styles.severityPillMedium,
                ]}
              >
                <Ionicons
                  name="warning"
                  size={14}
                  color={isHighSeverity ? colors.status.highPriority : isMediumSeverity ? colors.status.warning : colors.brand.primary}
                />
                <Text
                  style={[
                    styles.severityText,
                    isHighSeverity && { color: colors.status.highPriority },
                    isMediumSeverity && { color: colors.status.warning },
                  ]}
                >
                  Severity: {alert.severity}
                </Text>
              </View>
              <Text style={styles.timestamp}>{alert.timestamp}</Text>
            </View>

            <Text style={styles.alertCategory}>{alert.category}</Text>
            <Text style={styles.targetProject}>{alert.projectName}</Text>
            <Text style={styles.alertDesc}>{alert.description}</Text>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Current Status:</Text>
              <StatusBadge label={alert.status} variant={getStatusVariant()} size="sm" />
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
                <Ionicons name="git-compare" size={18} color={colors.status.highPriority} />
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
              <Ionicons name="shield-checkmark" size={18} color={colors.brand.primary} />
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

  /* Executive Header */
  headerContainer: {
    backgroundColor: colors.brand.navy,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    ...shadows.xs,
  },
  headerInner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmblem: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerMinistry: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#D0D5DD',
    letterSpacing: 0.5,
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(42, 92, 224, 0.25)',
    borderColor: 'rgba(42, 92, 224, 0.6)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  roleBadgeText: {
    color: '#BDD1F7',
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.3,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    minHeight: 28,
  },
  switchText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginLeft: 4,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
    gap: spacing.sm,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: '#CBD5E1',
    marginTop: 2,
  },
  headerStatusBadge: {
    alignSelf: 'center',
  },

  /* Scroll Body */
  scrollContent: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl + 24,
  },

  /* Feedback Banner */
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  feedbackText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    color: '#065F46',
    marginLeft: spacing.sm,
    flex: 1,
  },

  /* Section 1: Alert Overview Card */
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
  severityPillHigh: {
    backgroundColor: colors.status.highPriorityLight,
    borderColor: colors.status.highPriorityBorder,
  },
  severityPillMedium: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
  },
  severityText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    marginLeft: 4,
    letterSpacing: 0.2,
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
    marginTop: 6,
  },
  targetProject: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  alertDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: 6,
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

  /* Section 2: Metric Comparison Card */
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
    height: 54,
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
    width: 32,
    height: 32,
    borderRadius: 16,
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

  /* Section 3: Protocol Safety Card */
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

  /* Section 4: Human Review Actions */
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

  /* Skeleton Loading */
  skeletonAlertCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonSection: {
    marginBottom: spacing.md,
  },
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
});
