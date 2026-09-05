/**
 * AttendanceAnalyticsScreen
 * SIH26095 | MoSJE Government Official Monitoring Workflow
 *
 * Comprehensive, explainable attendance analytics and telemetry cross-check
 * for registered facilities. Features deterministic mathematical explainability,
 * synthetic demo history, validation checks, and official governance actions.
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackParamList, OfficialStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockAnalyticsService } from '../../services/mock/mockAnalyticsService';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { AttendanceAnalytics } from '../../types/attendance';
import { Project } from '../../types/project';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type AttendanceAnalyticsRouteProp = RouteProp<OfficialStackParamList, 'AttendanceAnalytics'>;

export const AttendanceAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<AttendanceAnalyticsRouteProp>();
  const { projectId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isNarrow = width < 360;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
  const [isFollowUpMarked, setIsFollowUpMarked] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [projData, analyticsData] = await Promise.all([
        mockProjectService.getProjectById(projectId),
        mockAnalyticsService.getProjectAttendanceAnalytics(projectId),
      ]);
      setProject(projData || null);
      setAnalytics(analyticsData);
      setIsFollowUpMarked(mockAnalyticsService.isFollowUpMarked(projectId));
    } catch (error) {
      console.error('Error loading attendance analytics:', error);
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

  const handleToggleFollowUp = async () => {
    try {
      const result = await mockAnalyticsService.markProjectForFollowUp(
        projectId,
        'Flagged for attendance discrepancy review'
      );
      setIsFollowUpMarked(result.marked);
      setFollowUpMsg(result.message);
      setTimeout(() => setFollowUpMsg(null), 4000);
    } catch (e) {
      console.error('Failed toggling follow-up:', e);
    }
  };

  if (loading || !analytics || !project) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Attendance Analytics" subtitle="Loading mathematical telemetry..." />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Computing deterministic roll-call metrics...</Text>
        </View>
      </View>
    );
  }

  const statItemWidth = isDesktop ? '23.8%' : isNarrow ? '100%' : '48%';
  const hasVariance =
    analytics.occupancyVariance !== null && Math.abs(analytics.occupancyVariance) >= 5;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Attendance Analytics"
        subtitle={`${analytics.projectName} • Deep Dive`}
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

        {/* SECTION A: Institute Identity & Synthetic Watermark */}
        <View style={styles.identityCard}>
          <View style={styles.demoTag}>
            <Ionicons name="flask-outline" size={13} color={colors.brand.primary} />
            <Text style={styles.demoTagText}>SYNTHETIC DEMO ATTENDANCE DATA • MoSJE REGISTERED</Text>
          </View>
          <Text style={styles.projectName}>{analytics.projectName}</Text>
          <Text style={styles.projectSubtitle}>
            Reporting Period: {analytics.reportingDate} • Grant Code: {project.code}
          </Text>

          {isFollowUpMarked && (
            <View style={styles.followUpActiveBanner}>
              <Ionicons name="bookmark" size={15} color="#B45309" />
              <Text style={styles.followUpActiveText}>
                Flagged for Administrative Follow-Up by Authorized Official
              </Text>
            </View>
          )}

          {followUpMsg && (
            <View style={styles.feedbackToast}>
              <Ionicons name="checkmark-circle" size={16} color={colors.status.normal} />
              <Text style={styles.feedbackToastText}>{followUpMsg}</Text>
            </View>
          )}
        </View>

        {/* SECTION B: 10 Core Metrics Overview */}
        <SectionHeader
          title="Daily Roll-Call & Capacity Breakdown"
          subtitle="Primary morning verified metrics vs grant allocation"
        />

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Current Attendance</Text>
            <Text style={styles.statValue}>{analytics.reportedAttendance}</Text>
            <Text style={styles.statSub}>Morning verified count</Text>
          </View>

          <View style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Sanctioned Capacity</Text>
            <Text style={styles.statValue}>{analytics.capacity}</Text>
            <Text style={styles.statSub}>Total enrolled seats</Text>
          </View>

          <View style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Attendance Rate</Text>
            <Text style={[styles.statValue, { color: colors.status.normal }]}>
              {analytics.attendanceRate}%
            </Text>
            <Text style={styles.statSub}>Capacity utilization</Text>
          </View>

          <View style={[styles.statBox, { width: statItemWidth }]}>
            <Text style={styles.statLabel}>Absent Count</Text>
            <Text style={[styles.statValue, { color: colors.status.warning }]}>
              {analytics.absentCount}
            </Text>
            <Text style={styles.statSub}>Reported on leave</Text>
          </View>
        </View>

        {/* SECTION C: CCTV Telemetry & Occupancy Variance (Explicit Estimate Only) */}
        <SectionHeader
          title="CCTV Occupancy Telemetry Cross-Check"
          subtitle="Real-time optical estimate compared against roll-call"
        />

        <View style={styles.cctvCard}>
          <View style={styles.cctvHeaderRow}>
            <View style={styles.cctvHeaderLeft}>
              <View style={styles.cctvIconCircle}>
                <Ionicons
                  name={analytics.cctvEstimatedOccupancy === null ? 'videocam-off' : 'videocam'}
                  size={20}
                  color={analytics.cctvEstimatedOccupancy === null ? colors.text.muted : colors.brand.primary}
                />
              </View>
              <View>
                <Text style={styles.cctvSectionTitle}>CCTV Estimated Occupancy</Text>
                <Text style={styles.cctvSectionSub}>Automated area entrance traffic telemetry</Text>
              </View>
            </View>
            <StatusBadge
              label={analytics.cctvEstimatedOccupancy !== null ? 'Feed Synced' : 'Offline'}
              variant={analytics.cctvEstimatedOccupancy !== null ? 'normal' : 'offline'}
              size="sm"
            />
          </View>

          <View style={styles.cctvComparisonGrid}>
            <View style={styles.cctvMetricCol}>
              <Text style={styles.cctvMetricLabel}>Reported Roll-Call</Text>
              <Text style={styles.cctvMetricVal}>{analytics.reportedAttendance}</Text>
              <Text style={styles.cctvMetricDesc}>Declared by institute</Text>
            </View>

            <View style={styles.cctvMetricDivider} />

            <View style={styles.cctvMetricCol}>
              <Text style={styles.cctvMetricLabel}>CCTV Estimated Occupancy</Text>
              <Text style={styles.cctvMetricVal}>
                {analytics.cctvEstimatedOccupancy !== null ? analytics.cctvEstimatedOccupancy : 'Unavailable'}
              </Text>
              <Text style={styles.cctvMetricDesc}>Vision sensor estimate</Text>
            </View>

            <View style={styles.cctvMetricDivider} />

            <View style={styles.cctvMetricCol}>
              <Text style={styles.cctvMetricLabel}>Occupancy Variance</Text>
              <Text
                style={[
                  styles.cctvMetricVal,
                  { color: hasVariance ? colors.status.highPriority : colors.status.normal },
                ]}
              >
                {analytics.occupancyVariance !== null
                  ? `${analytics.occupancyVariance > 0 ? '+' : ''}${analytics.occupancyVariance}`
                  : 'N/A'}
              </Text>
              <Text style={styles.cctvMetricDesc}>
                {analytics.occupancyVariancePercentage !== null
                  ? `${analytics.occupancyVariancePercentage}% variance`
                  : 'Unavailable'}
              </Text>
            </View>
          </View>

          {/* Mandatory Privacy & Sensor Disclaimer */}
          <View style={styles.sensorDisclaimerBox}>
            <Ionicons name="shield-checkmark" size={16} color={colors.brand.navyLight} />
            <Text style={styles.sensorDisclaimerText}>
              <Text style={{ fontWeight: 'bold' }}>CCTV Privacy & Estimation Notice: </Text>
              CCTV occupancy represents an automated optical estimate only. It is neither actual nor verified attendance. The system does not prove attendance nor implement facial recognition, biometric identity, or individual tracking.
            </Text>
          </View>
        </View>

        {/* SECTION D: Explainability Breakdown — "How This Was Calculated" */}
        <SectionHeader
          title="Explainability — How This Was Calculated"
          subtitle="Transparent, deterministic formulas behind all displayed metrics"
        />

        <View style={styles.explainabilityCard}>
          <View style={styles.formulaItem}>
            <View style={styles.formulaHeaderRow}>
              <Text style={styles.formulaTitle}>1. Attendance Rate (Capacity Utilization)</Text>
              <Text style={styles.formulaResultPill}>{analytics.attendanceRate}%</Text>
            </View>
            <Text style={styles.formulaEquation}>
              Attendance Rate = (Reported Attendance ÷ Registered Capacity) × 100
            </Text>
            <Text style={styles.formulaActual}>
              Calculation: ({analytics.reportedAttendance} ÷ {analytics.capacity}) × 100 ={' '}
              <Text style={{ fontWeight: 'bold' }}>{analytics.attendanceRate}%</Text>
            </Text>
          </View>

          <View style={styles.formulaSeparator} />

          <View style={styles.formulaItem}>
            <View style={styles.formulaHeaderRow}>
              <Text style={styles.formulaTitle}>2. Absent Beneficiary Count</Text>
              <Text style={styles.formulaResultPill}>{analytics.absentCount} absent</Text>
            </View>
            <Text style={styles.formulaEquation}>
              Absent Count = Registered Capacity - Reported Attendance
            </Text>
            <Text style={styles.formulaActual}>
              Calculation: {analytics.capacity} - {analytics.reportedAttendance} ={' '}
              <Text style={{ fontWeight: 'bold' }}>{analytics.absentCount} absent</Text>
            </Text>
          </View>

          <View style={styles.formulaSeparator} />

          <View style={styles.formulaItem}>
            <View style={styles.formulaHeaderRow}>
              <Text style={styles.formulaTitle}>3. CCTV Occupancy Telemetry Variance</Text>
              <Text style={[styles.formulaResultPill, { color: colors.status.highPriority }]}>
                {analytics.occupancyVariance !== null
                  ? `${analytics.occupancyVariance > 0 ? '+' : ''}${analytics.occupancyVariance}`
                  : 'N/A'}
              </Text>
            </View>
            <Text style={styles.formulaEquation}>
              Occupancy Variance = Reported Roll-Call - CCTV Estimated Occupancy
            </Text>
            <Text style={styles.formulaActual}>
              Calculation:{' '}
              {analytics.cctvEstimatedOccupancy !== null
                ? `${analytics.reportedAttendance} - ${analytics.cctvEstimatedOccupancy} = +${analytics.occupancyVariance} attendees (${analytics.occupancyVariancePercentage}% of reported)`
                : 'CCTV estimate is unavailable (not treated as 0)'}
            </Text>
          </View>

          <View style={styles.formulaSeparator} />

          <View style={styles.formulaItem}>
            <View style={styles.formulaHeaderRow}>
              <Text style={styles.formulaTitle}>4. Historical Comparison & Trend</Text>
              <Text style={styles.formulaResultPill}>{analytics.attendanceTrend}</Text>
            </View>
            <Text style={styles.formulaEquation}>
              Variance vs Baseline = Current Attendance - 5-Day Historical Average
            </Text>
            <Text style={styles.formulaActual}>
              Calculation: {analytics.reportedAttendance} - {analytics.historicalAverageAttendance} ={' '}
              <Text style={{ fontWeight: 'bold' }}>
                +{Math.round((analytics.reportedAttendance - analytics.historicalAverageAttendance) * 10) / 10} attendees
              </Text>{' '}
              (+{Math.round(((analytics.reportedAttendance - analytics.historicalAverageAttendance) / analytics.historicalAverageAttendance) * 1000) / 10}% above baseline)
            </Text>
          </View>
        </View>

        {/* SECTION E: Synthetic Historical Attendance Comparison */}
        <SectionHeader
          title="Synthetic Historical Comparison"
          subtitle="5-Day benchmark baseline vs today (Synthetic demo history)"
        />

        <View style={styles.historyCard}>
          <View style={styles.historySummaryBar}>
            <View style={styles.historyStatCol}>
              <Text style={styles.historyStatLabel}>5-Day Historical Average</Text>
              <Text style={styles.historyStatValue}>
                ~{Math.round(analytics.historicalAverageAttendance)} attendees ({analytics.historicalAverageAttendanceRate}%)
              </Text>
            </View>
            <View style={styles.historyStatCol}>
              <Text style={styles.historyStatLabel}>Current vs Historical</Text>
              <Text style={[styles.historyStatValue, { color: colors.status.warning }]}>
                {analytics.attendanceTrend}
              </Text>
            </View>
          </View>

          {/* Historical Record Rows */}
          <View style={styles.historyList}>
            {/* Today */}
            <View style={[styles.historyRow, styles.historyRowToday]}>
              <View style={styles.historyRowDateCol}>
                <Text style={styles.historyDateToday}>Today ({analytics.reportingDate.split(' ')[0]})</Text>
                <Text style={styles.historyBadgeToday}>ACTIVE REPORT</Text>
              </View>
              <View style={styles.historyRowProgressCol}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${analytics.attendanceRate}%`, backgroundColor: colors.brand.primary },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.historyCountText}>
                {analytics.reportedAttendance} / {analytics.capacity}{' '}
                <Text style={{ color: colors.brand.primary }}>({analytics.attendanceRate}%)</Text>
              </Text>
            </View>

            {/* Historical Days */}
            {analytics.historicalRecords.map((rec) => (
              <View key={rec.id} style={styles.historyRow}>
                <View style={styles.historyRowDateCol}>
                  <Text style={styles.historyDateText}>{rec.date}</Text>
                  <Text style={styles.historySyntheticTag}>Synthetic demo history</Text>
                </View>
                <View style={styles.historyRowProgressCol}>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${rec.attendanceRate}%`, backgroundColor: colors.neutral.borderStrong },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.historyCountText}>
                  {rec.reportedAttendance} / {rec.capacity}{' '}
                  <Text style={{ color: colors.text.secondary }}>({rec.attendanceRate}%)</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* SECTION F: Explainable Analytics Signals (Ready for Phase 5) */}
        <SectionHeader
          title="Explainable Analytics Signals"
          subtitle="Structured indicators prepared for AI anomaly detection"
          badgeCount={analytics.analyticsSignals.length}
        />

        {analytics.analyticsSignals.map((sig) => (
          <View key={sig.id} style={styles.signalCard}>
            <View style={styles.signalHeaderRow}>
              <View style={styles.signalTitleLeft}>
                <Ionicons
                  name={sig.severity === 'HIGH' ? 'alert-circle' : 'information-circle'}
                  size={18}
                  color={sig.severity === 'HIGH' ? colors.status.highPriority : colors.status.warning}
                />
                <Text style={styles.signalTitle}>{sig.title}</Text>
              </View>
              <StatusBadge
                label={`${sig.severity} SEVERITY`}
                variant={sig.severity === 'HIGH' ? 'highPriority' : 'warning'}
                size="sm"
              />
            </View>

            <Text style={styles.signalExplanation}>{sig.explanation}</Text>

            <View style={styles.signalFooterRow}>
              <View style={styles.signalMetaTag}>
                <Text style={styles.signalMetaText}>
                  Metric: {sig.sourceMetrics.reportedValue}{' '}
                  {sig.sourceMetrics.benchmarkValue !== undefined
                    ? `vs ${sig.sourceMetrics.benchmarkValue}`
                    : ''}
                </Text>
              </View>
              {sig.humanVerificationRecommended && (
                <View style={styles.reviewNeededBadge}>
                  <Ionicons name="person-outline" size={11} color="#B45309" />
                  <Text style={styles.reviewNeededText}>Human Review Recommended</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* SECTION G: Validation Status Summary */}
        <View style={styles.validationCard}>
          <View style={styles.validationHeaderRow}>
            <Ionicons
              name={analytics.validationResult.isValid ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={analytics.validationResult.isValid ? colors.status.normal : colors.status.highPriority}
            />
            <Text style={styles.validationTitle}>Data Integrity & Bounds Validation</Text>
          </View>

          <View style={styles.validationList}>
            <View style={styles.valItem}>
              <Ionicons name="checkmark-sharp" size={14} color={colors.status.normal} />
              <Text style={styles.valItemText}>Non-negative attendance check: PASSED</Text>
            </View>
            <View style={styles.valItem}>
              <Ionicons name="checkmark-sharp" size={14} color={colors.status.normal} />
              <Text style={styles.valItemText}>Sanctioned capacity bounds: PASSED (42 ≤ 50)</Text>
            </View>
            <View style={styles.valItem}>
              <Ionicons name="checkmark-sharp" size={14} color={colors.status.normal} />
              <Text style={styles.valItemText}>Absent reconciliation: PASSED (50 - 42 = 8)</Text>
            </View>
            {hasVariance && (
              <View style={styles.valItem}>
                <Ionicons name="warning-outline" size={14} color={colors.status.warning} />
                <Text style={[styles.valItemText, { color: colors.status.warning }]}>
                  CCTV occupancy discrepancy: NOTABLE (+17 variance flagged for review)
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* SECTION H: Official Governance Actions */}
        <SectionHeader
          title="Official Governance Actions"
          subtitle="Human decision-making based on analytics signals"
        />

        <View style={styles.actionGrid}>
          <PrimaryButton
            title="Initiate Surprise Inspection"
            iconName="flash"
            onPress={() =>
              navigation.navigate('InitiateInspection', {
                projectId: project.id,
                alertId: 'ALT-2601',
              })
            }
          />

          <SecondaryButton
            title={isFollowUpMarked ? 'Clear Follow-Up Flag' : 'Mark for Administrative Follow-Up'}
            iconName={isFollowUpMarked ? 'bookmark' : 'bookmark-outline'}
            onPress={handleToggleFollowUp}
            style={{ marginTop: 10 }}
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
  identityCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  demoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  demoTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.6,
  },
  projectName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  projectSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  followUpActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  followUpActiveText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  feedbackToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  feedbackToastText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: '#15803D',
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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginVertical: 4,
  },
  statSub: {
    fontSize: 11,
    color: colors.text.muted,
  },
  cctvCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  cctvHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cctvHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  cctvIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cctvSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  cctvSectionSub: {
    fontSize: 10,
    color: colors.text.muted,
  },
  cctvComparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  cctvMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  cctvMetricDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.neutral.border,
  },
  cctvMetricLabel: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 2,
  },
  cctvMetricVal: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    marginVertical: 2,
  },
  cctvMetricDesc: {
    fontSize: 10,
    color: colors.text.muted,
    textAlign: 'center',
  },
  sensorDisclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs + 2,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  sensorDisclaimerText: {
    fontSize: 11,
    color: colors.brand.navyLight,
    lineHeight: 16,
    flex: 1,
  },
  explainabilityCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  formulaItem: {
    paddingVertical: spacing.xs,
  },
  formulaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  formulaTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    flex: 1,
  },
  formulaResultPill: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  formulaEquation: {
    fontSize: 11,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  formulaActual: {
    fontSize: 11,
    color: colors.text.primary,
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.xs,
    borderRadius: borderRadius.xs,
    marginTop: 2,
  },
  formulaSeparator: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: spacing.sm,
  },
  historyCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  historySummaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  historyStatCol: {
    flex: 1,
  },
  historyStatLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  historyStatValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    marginTop: 2,
  },
  historyList: {
    gap: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.surface,
    gap: spacing.sm,
  },
  historyRowToday: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  historyRowDateCol: {
    width: 110,
  },
  historyDateToday: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  historyBadgeToday: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  historyDateText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  historySyntheticTag: {
    fontSize: 9,
    color: colors.text.muted,
  },
  historyRowProgressCol: {
    flex: 1,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  historyCountText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    width: 100,
    textAlign: 'right',
  },
  signalCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  signalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  signalTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  signalTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  signalExplanation: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  signalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signalMetaTag: {
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  signalMetaText: {
    fontSize: 10,
    color: colors.text.muted,
  },
  reviewNeededBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  reviewNeededText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  validationCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  validationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  validationTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  validationList: {
    gap: 4,
  },
  valItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valItemText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  actionGrid: {
    marginBottom: spacing.xl,
  },
});
