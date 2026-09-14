/**
 * OfficialHomeScreen
 * Government Official / MoSJE National Monitoring Command Center.
 * Operational public-sector monitoring console with asymmetric telemetry decks,
 * high-impact discrepancy incident focal panel, and prioritized operational action queue.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { mockOfficialService } from '../../services/mock/mockOfficialService';
import { Project, ProjectStatsSummary } from '../../types/project';
import { AnomalyAlert } from '../../types/alert';
import { Division, Scheme, Organization, MasterProject } from '../../types/master';
import { divisionService } from '../../services/master/divisionService';
import { schemeService } from '../../services/master/schemeService';
import { organizationService } from '../../services/master/organizationService';
import { projectService } from '../../services/master/projectService';
import { anomalyService } from '../../services/master/anomalyService';
import { organizationRiskEngine } from '../../services/analytics/organizationRiskEngine';
import { masterLookup } from '../../data/master';
import { MonitoringPriorityBadge } from '../../components/organization/MonitoringPriorityBadge';
import { ProjectStatusBadge } from '../../components/project/ProjectStatusBadge';
import { DataSourceBadge } from '../../components/common/DataSourceBadge';
import { AnomalySeverityBadge } from '../../components/anomaly/AnomalySeverityBadge';
import { AnomalyConfidenceBadge } from '../../components/anomaly/AnomalyConfidenceBadge';
import { MasterAnomaly, AnomalySummary } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography, fontPresets } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';


/**
 * Animated counter hook that smoothly counts up to target over duration.
 */
const useAnimatedNumber = (target: number, duration = 600, active = true) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * target));
      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration, active]);

  return displayValue;
};

export const OfficialHomeScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'Dashboard'>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 500;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ProjectStatsSummary | null>(null);
  const [priorityProjects, setPriorityProjects] = useState<Project[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<AnomalyAlert[]>([]);
  const [topDivisions, setTopDivisions] = useState<Division[]>([]);
  const [topSchemes, setTopSchemes] = useState<Scheme[]>([]);
  const [topOrganizations, setTopOrganizations] = useState<Organization[]>([]);
  const [topProjects, setTopProjects] = useState<MasterProject[]>([]);
  const [topAnomalies, setTopAnomalies] = useState<MasterAnomaly[]>([]);
  const [anomalySummary, setAnomalySummary] = useState<AnomalySummary | null>(null);
  const [orgKpis, setOrgKpis] = useState({
    total: 4,
    avgScore: 78,
    highPriority: 1,
    openFindings: 3,
    anomalies: 2,
  });

  // Entrance animations
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  // 2-second breathing pulse animation for live telemetry indicator
  const livePulse = useRef(new Animated.Value(1)).current;

  // Staggered section entrance values
  const heroAnim = useRef(new Animated.Value(0)).current;
  const splitRowAnim = useRef(new Animated.Value(0)).current;
  const queueAnim = useRef(new Animated.Value(0)).current;

  // Animated metric counters
  const animatedProjects = useAnimatedNumber(stats?.totalProjects ?? 148, 600, !loading);
  const animatedAlerts = useAnimatedNumber(stats?.highPriorityCount ?? 6, 600, !loading);
  const animatedInspections = useAnimatedNumber(stats?.pendingInspectionsCount ?? 14, 600, !loading);
  const animatedCctv = useAnimatedNumber(stats?.activeCCTVCount ?? 139, 600, !loading);

  useEffect(() => {
    // Breathing pulse for LIVE telemetry dot
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        metricsData,
        projectsData,
        alertsData,
        divisionsList,
        schemesList,
        orgsList,
        masterProjectsList,
        anomList,
        anomSummary,
      ] = await Promise.all([
        mockOfficialService.getDashboardMetrics(),
        mockProjectService.getPriorityProjects(),
        mockAlertService.getPendingAlerts(),
        divisionService.getAllDivisions(),
        schemeService.getAllSchemes(),
        organizationService.getOrganizations(),
        projectService.getProjects(),
        anomalyService.getAnomalies(),
        anomalyService.getAnomalySummary(),
      ]);
      setStats({
        totalProjects: metricsData.totalProjects,
        highPriorityCount: metricsData.activeAlertsCount,
        pendingInspectionsCount: metricsData.pendingInspectionsCount,
        activeCCTVCount: metricsData.cctvOnlineCount,
        totalAlertsCount: metricsData.activeAlertsCount,
        criticalComplianceCount: metricsData.criticalProjectsCount,
        totalBeneficiariesCount: 4820,
        averageAttendanceRate: metricsData.overallComplianceAverage,
      });
      setPriorityProjects(projectsData.slice(0, 3));
      setCriticalAlerts(alertsData.filter((a) => a.status === 'Pending Review'));
      setTopDivisions(divisionsList.slice(0, 3));
      setTopSchemes(schemesList.slice(0, 3));
      setTopOrganizations(orgsList.slice(0, 3));
      setTopProjects(masterProjectsList.slice(0, 3));
      setTopAnomalies(anomList.slice(0, 3));
      setAnomalySummary(anomSummary);

      const totalOrgs = orgsList.length;
      let sumScore = 0;
      let hpCount = 0;
      let openFnd = 0;
      let totalAnom = 0;
      for (const org of orgsList) {
        const prof = organizationRiskEngine.calculateOrganizationRiskProfile(org.organizationId);
        sumScore += (prof?.score ?? 75);
        const p = organizationRiskEngine.calculateMonitoringPriority(org.organizationId).priority;
        if (p === 'HIGH' || p === 'CRITICAL') hpCount++;
        const fnds = masterLookup.getOrganizationFindings(org.organizationId);
        openFnd += fnds.filter(f => f.status === 'OPEN' || f.status === 'IN_REVIEW').length;
        totalAnom += masterLookup.getOrganizationAnomalies(org.organizationId).length;
      }
      setOrgKpis({
        total: totalOrgs,
        avgScore: totalOrgs > 0 ? Math.round(sumScore / totalOrgs) : 0,
        highPriority: hpCount,
        openFindings: openFnd,
        anomalies: totalAnom,
      });

    } catch (error) {
      console.error('Error loading official dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const unsubFocus = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    const unsubService = mockOfficialService.subscribe(() => {
      loadDashboardData();
    });
    return () => {
      unsubFocus();
      unsubService();
    };
  }, [navigation]);

  useEffect(() => {
    if (!loading) {
      // Screen entrance
      Animated.parallel([
        Animated.timing(screenFade, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(screenSlide, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered sections entrance
      Animated.stagger(60, [
        Animated.timing(heroAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(splitRowAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(queueAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const topAlert = criticalAlerts[0];
  const reportedCount = topAlert?.metricComparison?.reportedAttendance ?? 42;
  const cctvCount = topAlert?.metricComparison?.headcountEstimate ?? 25;
  const diffCount = topAlert?.metricComparison?.difference ?? (reportedCount - cctvCount);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Command Center"
        subtitle="National Monitoring Division • Central Desk"
        rightAction={
          <View style={styles.liveTelemetryBadge}>
            <Animated.View style={[styles.liveDot, { opacity: livePulse }]} />
            <Text style={styles.liveTelemetryText}>LIVE STREAM</Text>
          </View>
        }
      />

      {loading ? (
        <LoadingState message="Connecting to MoSJE telemetry stream..." />
      ) : (
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: screenFade,
              transform: [{ translateY: screenSlide }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, isMobile && { paddingHorizontal: spacing.sm + 2 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.brand.primary]}
              />
            }
          >            {/* 1. PAGE CONTEXT & SYSTEM STATUS HEADER */}
            <View style={[styles.pageContextBar, isDesktop && styles.pageContextBarDesktop]}>
              <View style={styles.contextLeft}>
                <Text style={styles.pageContextPre}>CENTRAL COMMAND CONSOLE</Text>
                <Text style={[styles.pageContextTitle, isMobile && styles.pageContextTitleMobile]}>National Monitoring Division</Text>
                <Text style={styles.pageContextSub}>
                  Biometric attendance verification, CCTV optical streams & PMU audit oversight
                </Text>
              </View>
              <View style={[styles.contextRightBadge, isMobile && styles.contextRightBadgeMobile]}>
                <Animated.View style={[styles.contextPulseDot, { opacity: livePulse }]} />
                <Text style={[styles.contextRightBadgeText, isMobile && { fontSize: 9 }]} numberOfLines={2}>SYSTEM OPERATIONAL • 148 INSTITUTES</Text>
              </View>
            </View>

            {/* 2. ONE IMPORTANT ALERT / ACTION ROW */}
            {topAlert && (
              <Animated.View style={{ opacity: heroAnim }}>
                <View style={styles.primaryAlertBanner}>
                  <View style={styles.primaryAlertLeft}>
                    <View style={[styles.primaryAlertBadgeRow, isMobile && styles.primaryAlertBadgeRowMobile]}>
                      <View style={styles.heroAlertBadge}>
                        <Ionicons name="alert-circle" size={13} color={colors.status.highPriority} />
                        <Text style={styles.heroAlertBadgeText}>IMMEDIATE ACTION REQUIRED</Text>
                      </View>
                      <Text style={styles.primaryAlertCode}>{topAlert.id}</Text>
                      <Text style={styles.primaryAlertCategory}>{topAlert.category}</Text>
                      <View style={styles.primaryAlertTimePill}>
                        <Ionicons name="time-outline" size={11} color={colors.text.muted} />
                        <Text style={styles.primaryAlertTimeText}>{topAlert.timestamp}</Text>
                      </View>
                    </View>

                    <Text style={styles.primaryAlertTitle}>{topAlert.projectName}</Text>
                    <Text style={styles.primaryAlertSummary}>
                      {topAlert.description} — Reported roll-call ({reportedCount}) exceeds optical CCTV headcount estimate ({cctvCount}) by +{diffCount} participants (40.5% disparity variance).
                    </Text>
                  </View>

                  <View style={styles.primaryAlertActions}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.actionButtonPrimary}
                      onPress={() => navigation.navigate('AlertReview', { alertId: topAlert.id })}
                    >
                      <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
                      <Text style={styles.actionButtonPrimaryText}>Review Alert</Text>
                      <Ionicons name="arrow-forward" size={13} color={colors.text.inverse} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.actionButtonSecondary}
                      onPress={() => navigation.navigate('Alerts')}
                    >
                      <Text style={styles.actionButtonSecondaryText}>
                        All Alerts ({stats?.highPriorityCount ?? 6})
                      </Text>
                      <Ionicons name="chevron-forward" size={12} color={colors.brand.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* 3. MAIN CONTENT GRID (LEFT: Operational Dossiers & Lists, RIGHT: Compact Actions & Telemetry Rail) */}
            <Animated.View style={[{ opacity: splitRowAnim }, { marginTop: spacing.md }]}>
              <View style={isDesktop ? styles.mainGridDesktop : styles.mainGridMobile}>

                {/* LEFT PRIMARY COLUMN (~1fr) */}
                <View style={styles.mainLeftCol}>

                  {/* SUBSECTION A: VERIFICATION TELEMETRY DOSSIER */}
                  {topAlert && (
                    <View style={[styles.surfacePanel, isMobile && styles.surfacePanelMobile]}>
                      <View style={[styles.panelHeaderRow, isMobile && styles.panelHeaderRowMobile]}>
                        <View style={styles.panelTitleGroup}>
                          <View style={styles.sectionTitleBadge}>
                            <View style={styles.sectionTitleDotRed} />
                            <Text style={styles.sectionTitleBadgeText}>{topAlert.severity} SEVERITY</Text>
                          </View>
                          <Text style={[styles.panelTitle, isMobile && styles.panelTitleMobile]}>Active Discrepancy Verification Signals</Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[styles.panelActionBtn, isMobile && styles.panelActionBtnMobile]}
                          onPress={() => navigation.navigate('InitiateInspection', { projectId: 'PRJ-101' })}
                        >
                          <Ionicons name="add-circle-outline" size={13} color={colors.brand.primary} />
                          <Text style={styles.panelActionBtnText}>Dispatch PMU Inspection</Text>
                        </TouchableOpacity>
                      </View>

                      {/* 3-Box Comparative Telemetry Grid */}
                      <View style={[styles.comparisonGrid, isMobile && styles.comparisonGridMobile]}>
                        <View style={[styles.comparisonItem, isMobile && styles.comparisonItemMobile]}>
                          <Text style={styles.comparisonLabel}>Reported Attendance</Text>
                          <Text style={styles.comparisonVal}>{reportedCount}</Text>
                          <Text style={styles.comparisonSub}>Gate biometric roll-call</Text>
                        </View>
                        {!isMobile && <View style={styles.comparisonDivider} />}
                        <View style={[styles.comparisonItem, isMobile && styles.comparisonItemMobile]}>
                          <Text style={styles.comparisonLabel}>Estimated Headcount</Text>
                          <Text style={styles.comparisonValCctv}>{cctvCount}</Text>
                          <Text style={styles.comparisonSub}>Optical CCTV inference</Text>
                        </View>
                        {!isMobile && <View style={styles.comparisonDivider} />}
                        <View style={[styles.comparisonItem, isMobile && styles.comparisonItemMobile]}>
                          <Text style={styles.comparisonLabel}>Biometric Variance</Text>
                          <Text style={styles.comparisonValDiff}>+{diffCount}</Text>
                          <Text style={styles.comparisonSub}>40.5% disparity gap</Text>
                        </View>
                      </View>

                      {/* Corroborating Evidence Row */}
                      <View style={styles.evidenceCorroborationStrip}>
                        <View style={styles.evidenceItem}>
                          <Ionicons name="videocam" size={13} color={colors.status.normal} />
                          <Text style={styles.evidenceItemText}>CCTV Online ({animatedCctv}/148)</Text>
                        </View>
                        <View style={styles.evidenceItem}>
                          <Ionicons name="finger-print" size={13} color={colors.status.highPriority} />
                          <Text style={styles.evidenceItemText}>Discrepancy Confirmed (85% Conf)</Text>
                        </View>
                        <View style={styles.evidenceItem}>
                          <Ionicons name="location" size={13} color={colors.brand.primary} />
                          <Text style={styles.evidenceItemText}>New Delhi • Deendayal DDRS</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* SUBSECTION B: PRIORITY OPERATIONS (INSTITUTIONAL QUEUE) */}
                  <View style={[styles.surfacePanel, isMobile && styles.surfacePanelMobile]}>
                    <View style={[styles.panelHeaderRow, isMobile && styles.panelHeaderRowMobile]}>
                      <View style={styles.panelTitleGroup}>
                        <Text style={[styles.panelTitle, isMobile && styles.panelTitleMobile]}>Priority Operations</Text>
                        <Text style={styles.panelSubtitle}>
                          Institutions flagged for biometric variance or inspection schedules
                        </Text>
                      </View>
                      <View style={styles.queueCountBadge}>
                        <Text style={styles.queueCountText}>{priorityProjects.length}</Text>
                      </View>
                    </View>

                    {/* High-density operational rows inside ONE surface */}
                    <View style={styles.rowsListContainer}>
                      {priorityProjects.map((project, index) => {
                        const isHigh = project.priority === 'HIGH' || project.status === 'High Priority';
                        const isDue = project.status === 'Inspection Due';
                        const statusLabel = isHigh ? 'HIGH PRIORITY' : isDue ? 'INSPECTION DUE' : project.status.toUpperCase();
                        const accentColor = isHigh
                          ? colors.status.highPriority
                          : isDue
                          ? colors.status.warning
                          : colors.status.normal;

                        return (
                          <TouchableOpacity
                            key={project.id}
                            activeOpacity={0.75}
                            style={[
                              styles.opQueueRow,
                              index !== priorityProjects.length - 1 && styles.opQueueRowBorder,
                            ]}
                            onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id })}
                          >
                            <View style={[styles.opQueueAccent, { backgroundColor: accentColor }]} />
                            <View style={styles.opQueueContent}>
                              <View style={styles.opQueueTop}>
                                <View style={styles.opQueueTitleWrap}>
                                  <Text style={styles.opQueueName} numberOfLines={1}>
                                    {project.name}
                                  </Text>
                                  <Text style={styles.opQueueCode}>{project.code}</Text>
                                </View>
                                <View style={[styles.opBadge, { backgroundColor: isHigh ? colors.status.highPriorityLight : isDue ? colors.status.warningLight : colors.status.normalLight, borderColor: accentColor }]}>
                                  <Text style={[styles.opBadgeText, { color: accentColor }]}>
                                    {statusLabel}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.opQueueMetaRow}>
                                <Text style={styles.opQueueCategory}>{project.category}</Text>
                                <Text style={styles.opQueueDot}>•</Text>
                                <Text style={styles.opQueueLocation}>
                                  {project.location.city}, {project.location.state}
                                </Text>
                              </View>

                              <View style={styles.opQueueBottomRow}>
                                <View style={styles.opTelemetryPill}>
                                  <Ionicons name="people" size={13} color={colors.text.muted} />
                                  <Text style={styles.opTelemetryText}>
                                    Attendance: <Text style={styles.opTelemetryBold}>{project.attendance.present}/{project.attendance.capacity}</Text>
                                  </Text>
                                </View>

                                <View style={styles.opTelemetryPill}>
                                  <Ionicons
                                    name="videocam"
                                    size={13}
                                    color={project.cctvStatus === 'Online' ? colors.status.normal : project.cctvStatus === 'Offline' ? colors.status.highPriority : colors.status.warning}
                                  />
                                  <Text style={styles.opTelemetryText}>
                                    CCTV: <Text style={[styles.opTelemetryBold, { color: project.cctvStatus === 'Online' ? colors.status.normal : project.cctvStatus === 'Offline' ? colors.status.highPriority : colors.status.warning }]}>
                                      {project.cctvStatus}
                                    </Text>
                                  </Text>
                                </View>

                                <View style={styles.opQueueActionAffordance}>
                                  <Text style={styles.opQueueActionText}>View Details</Text>
                                  <Ionicons name="arrow-forward" size={12} color={colors.brand.primary} />
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={styles.panelFooter}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.panelFooterBtn}
                        onPress={() => navigation.navigate('Monitoring')}
                      >
                        <Text style={styles.panelFooterBtnText}>View All Projects in Directory</Text>
                        <Ionicons name="chevron-forward" size={13} color={colors.brand.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* SUBSECTION C: ADMINISTRATIVE INTELLIGENCE (DIVISIONS & SCHEMES) */}
                  <View style={[styles.surfacePanel, isMobile && styles.surfacePanelMobile]}>
                    <View style={[styles.panelHeaderRow, isMobile && styles.panelHeaderRowMobile]}>
                      <View style={styles.panelTitleGroup}>
                        <View style={[styles.intelBadgeRow, isMobile && styles.intelBadgeRowMobile]}>
                          <Ionicons name="layers" size={13} color={colors.brand.primary} />
                          <Text style={[styles.intelBadgeText, isMobile && { fontSize: 9 }]}>ADMINISTRATIVE INTELLIGENCE</Text>
                        </View>
                        <Text style={[styles.panelTitle, isMobile && styles.panelTitleMobile]}>Division & Scheme Intelligence</Text>
                        <Text style={styles.panelSubtitle}>
                          Administrative governance, national welfare schemes, and oversight signals
                        </Text>
                      </View>
                      <View style={[styles.panelHeaderActions, isMobile && styles.panelHeaderActionsMobile]}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.panelActionPill}
                          onPress={() => navigation.navigate('DivisionExplorer')}
                        >
                          <Ionicons name="business-outline" size={12} color={colors.brand.primary} />
                          <Text style={styles.panelActionPillText}>Divisions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.panelActionPill}
                          onPress={() => navigation.navigate('SchemeExplorer')}
                        >
                          <Ionicons name="layers-outline" size={12} color={colors.brand.primary} />
                          <Text style={styles.panelActionPillText}>Schemes</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Scheme Monitoring Attention Trace inside panel */}
                    <View style={[styles.schemeAttentionCard, isMobile && styles.schemeAttentionCardMobile]}>
                      <View style={[styles.attentionHeader, isMobile && styles.attentionHeaderMobile]}>
                        <View style={styles.attentionBadge}>
                          <Ionicons name="warning" size={13} color={colors.status.highPriority} />
                          <Text style={[styles.attentionBadgeText, isMobile && { fontSize: 9 }]} numberOfLines={2}>SCHEME MONITORING ATTENTION</Text>
                        </View>
                        <Text style={styles.attentionPriorityText}>HIGH PRIORITY</Text>
                      </View>
                      <View style={[styles.attentionTraceBox, isMobile && styles.attentionTraceBoxMobile]}>
                        <View style={[styles.traceNode, isMobile && styles.traceNodeMobile]}>
                          <Text style={styles.traceNodeLabel}>SCHEME</Text>
                          <Text style={styles.traceNodeVal}>DDRS</Text>
                          <Text style={styles.traceNodeSub}>Disability Rehab</Text>
                        </View>
                        <Ionicons name={isMobile ? 'arrow-down' : 'arrow-forward'} size={14} color={colors.text.muted} />
                        <View style={[styles.traceNode, isMobile && styles.traceNodeMobile]}>
                          <Text style={styles.traceNodeLabel}>PROJECT</Text>
                          <Text style={styles.traceNodeVal}>PRJ-101</Text>
                          <Text style={styles.traceNodeSub}>Sunrise Rehab</Text>
                        </View>
                        <Ionicons name={isMobile ? 'arrow-down' : 'arrow-forward'} size={14} color={colors.text.muted} />
                        <View style={[styles.traceNode, isMobile && styles.traceNodeMobile]}>
                          <Text style={styles.traceNodeLabel}>ANOMALY</Text>
                          <Text style={[styles.traceNodeVal, { color: colors.status.highPriority }]}>ALT-2601</Text>
                          <Text style={styles.traceNodeSub}>Attendance 42 vs 25</Text>
                        </View>
                      </View>
                      <View style={styles.attentionActionRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[styles.attentionActionBtn, { minHeight: 44 }]}
                          onPress={() => navigation.navigate('SchemeDetails', { schemeId: 'SCH-DDRS' })}
                        >
                          <Text style={styles.attentionActionBtnText}>View DDRS Scheme Dossier</Text>
                          <Ionicons name="arrow-forward" size={13} color={colors.brand.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Previews: Divisions and Schemes as rows */}
                    <View style={[styles.twoColRow, !isDesktop && styles.twoColRowMobile]}>
                      <View style={styles.halfCol}>
                        <Text style={styles.subSectionTitle}>Administrative Divisions</Text>
                        <View style={styles.previewCardsList}>
                          {topDivisions.map(div => (
                            <TouchableOpacity
                              key={div.divisionId}
                              activeOpacity={0.8}
                              style={styles.previewCardItem}
                              onPress={() => navigation.navigate('DivisionDetails', { divisionId: div.divisionId })}
                            >
                              <View style={styles.previewCardTop}>
                                <Text style={styles.previewCodeText}>{div.code || div.divisionId}</Text>
                                <DataSourceBadge dataSource={div.dataSource} size="sm" />
                              </View>
                              <Text style={styles.previewCardTitle} numberOfLines={1}>{div.name}</Text>
                              <View style={styles.previewMetricsRow}>
                                <Text style={styles.previewMetricItem}>Schemes: <Text style={styles.previewBold}>{div.schemeIds.length}</Text></Text>
                                <Text style={styles.previewMetricItem}>Projects: <Text style={styles.previewBold}>{div.projectIds.length}</Text></Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View style={styles.halfCol}>
                        <Text style={styles.subSectionTitle}>National Welfare Schemes</Text>
                        <View style={styles.previewCardsList}>
                          {topSchemes.map(sch => (
                            <TouchableOpacity
                              key={sch.schemeId}
                              activeOpacity={0.8}
                              style={styles.previewCardItem}
                              onPress={() => navigation.navigate('SchemeDetails', { schemeId: sch.schemeId })}
                            >
                              <View style={styles.previewCardTop}>
                                <Text style={styles.previewCodeText}>{sch.shortName || sch.schemeId}</Text>
                                <DataSourceBadge dataSource={sch.dataSource} size="sm" />
                              </View>
                              <Text style={styles.previewCardTitle} numberOfLines={1}>{sch.name}</Text>
                              <View style={styles.previewMetricsRow}>
                                <Text style={styles.previewMetricItem}>Projects: <Text style={styles.previewBold}>{sch.projectIds.length}</Text></Text>
                                <Text style={styles.previewMetricItem}>Released: <Text style={styles.previewBold}>₹{((sch.financialSummary?.releasedAmount ?? 0) / 100000).toFixed(0)}L</Text></Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* SUBSECTION D: IMPLEMENTING AGENCY & PROJECT OVERSIGHT */}
                  <View style={[styles.surfacePanel, isMobile && styles.surfacePanelMobile]}>
                    <View style={[styles.panelHeaderRow, isMobile && styles.panelHeaderRowMobile]}>
                      <View style={styles.panelTitleGroup}>
                        <View style={[styles.intelBadgeRow, isMobile && styles.intelBadgeRowMobile]}>
                          <Ionicons name="business" size={13} color={colors.brand.primary} />
                          <Text style={[styles.intelBadgeText, isMobile && { fontSize: 9 }]}>ORGANIZATION & PROJECT OVERSIGHT</Text>
                        </View>
                        <Text style={[styles.panelTitle, isMobile && styles.panelTitleMobile]}>Implementing Agency & Project Oversight</Text>
                        <Text style={styles.panelSubtitle}>
                          Statutory compliance profiles, multi-factor performance scores, and risk telemetry
                        </Text>
                      </View>
                      <View style={[styles.panelHeaderActions, isMobile && styles.panelHeaderActionsMobile]}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.panelActionPill}
                          onPress={() => navigation.navigate('OrganizationExplorer')}
                        >
                          <Ionicons name="business-outline" size={12} color={colors.brand.primary} />
                          <Text style={styles.panelActionPillText}>Organizations</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.panelActionPill}
                          onPress={() => navigation.navigate('ProjectExplorer')}
                        >
                          <Ionicons name="folder-open-outline" size={12} color={colors.brand.primary} />
                          <Text style={styles.panelActionPillText}>Projects</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Focus Card: ORG-SUNRISE */}
                    <View style={[styles.schemeAttentionCard, isMobile && styles.schemeAttentionCardMobile]}>
                      <View style={[styles.attentionHeader, isMobile && styles.attentionHeaderMobile]}>
                        <View style={styles.attentionBadge}>
                          <Ionicons name="warning" size={13} color={colors.status.highPriority} />
                          <Text style={[styles.attentionBadgeText, isMobile && { fontSize: 9 }]} numberOfLines={2}>MONITORING PRIORITY FOCUS: ORG-SUNRISE</Text>
                        </View>
                        <Text style={styles.attentionPriorityText}>HIGH MONITORING PRIORITY</Text>
                      </View>
                      <View style={[styles.attentionTraceBox, isMobile && styles.attentionTraceBoxMobile]}>
                        <View style={[styles.traceNode, isMobile && styles.traceNodeMobile]}>
                          <Text style={styles.traceNodeLabel}>ORGANIZATION</Text>
                          <Text style={styles.traceNodeVal}>ORG-SUNRISE</Text>
                          <Text style={styles.traceNodeSub}>Sunrise Rehab</Text>
                        </View>
                        <Ionicons name={isMobile ? 'arrow-down' : 'arrow-forward'} size={14} color={colors.text.muted} />
                        <View style={[styles.traceNode, isMobile && styles.traceNodeMobile]}>
                          <Text style={styles.traceNodeLabel}>PROJECT</Text>
                          <Text style={styles.traceNodeVal}>PRJ-101</Text>
                          <Text style={styles.traceNodeSub}>DDRS Centre</Text>
                        </View>
                        <Ionicons name={isMobile ? 'arrow-down' : 'arrow-forward'} size={14} color={colors.text.muted} />
                        <View style={[styles.traceNode, isMobile && styles.traceNodeMobile]}>
                          <Text style={styles.traceNodeLabel}>ANOMALY</Text>
                          <Text style={[styles.traceNodeVal, { color: colors.status.highPriority }]}>ALT-2601</Text>
                          <Text style={styles.traceNodeSub}>Headcount 25 vs 42</Text>
                        </View>
                      </View>
                      <View style={styles.attentionActionRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[styles.attentionActionBtn, { minHeight: 44 }]}
                          onPress={() => navigation.navigate('OrganizationDetails', { organizationId: 'ORG-SUNRISE' })}
                        >
                          <Text style={styles.attentionActionBtnText}>View Full Intelligence Dossier</Text>
                          <Ionicons name="arrow-forward" size={13} color={colors.brand.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Organizations & Projects Row-based lists */}
                    <View style={[styles.twoColRow, !isDesktop && styles.twoColRowMobile]}>
                      <View style={styles.halfCol}>
                        <Text style={styles.subSectionTitle}>Implementing Agencies</Text>
                        <View style={styles.previewCardsList}>
                          {topOrganizations.map(org => (
                            <TouchableOpacity
                              key={org.organizationId}
                              activeOpacity={0.8}
                              style={styles.previewCardItem}
                              onPress={() => navigation.navigate('OrganizationDetails', { organizationId: org.organizationId })}
                            >
                              <View style={styles.previewCardTop}>
                                <Text style={styles.previewCodeText}>{org.organizationType || org.type || 'NGO'}</Text>
                                {org.monitoringPriority && (
                                  <MonitoringPriorityBadge priority={org.monitoringPriority} compact />
                                )}
                              </View>
                              <Text style={styles.previewCardTitle} numberOfLines={1}>{org.name}</Text>
                              <View style={styles.previewMetricsRow}>
                                <Text style={styles.previewMetricItem}>Projects: <Text style={styles.previewBold}>{org.projectIds?.length ?? 0}</Text></Text>
                                <Text style={styles.previewMetricItem}>Score: <Text style={styles.previewBold}>{org.complianceScore ?? 80}/100</Text></Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View style={styles.halfCol}>
                        <Text style={styles.subSectionTitle}>Sanctioned Central Projects</Text>
                        <View style={styles.previewCardsList}>
                          {topProjects.map(proj => (
                            <TouchableOpacity
                              key={proj.projectId}
                              activeOpacity={0.8}
                              style={styles.previewCardItem}
                              onPress={() => navigation.navigate('ProjectDetails', { projectId: proj.projectId })}
                            >
                              <View style={styles.previewCardTop}>
                                <Text style={styles.previewCodeText}>{proj.projectCode}</Text>
                                <ProjectStatusBadge status={(proj.status as any) || 'ACTIVE'} />
                              </View>
                              <Text style={styles.previewCardTitle} numberOfLines={1}>{proj.name}</Text>
                              <View style={styles.previewMetricsRow}>
                                <Text style={styles.previewMetricItem}>Progress: <Text style={styles.previewBold}>{proj.progressPercentage ?? 75}%</Text></Text>
                                <Text style={styles.previewMetricItem}>Sanctioned: <Text style={styles.previewBold}>₹{(proj.sanctionedAmount / 100000).toFixed(0)}L</Text></Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* SUBSECTION E: ANOMALY INTELLIGENCE & EVIDENCE SIGNALS */}
                  <View style={[styles.surfacePanel, isMobile && styles.surfacePanelMobile]}>
                    <View style={[styles.panelHeaderRow, isMobile && styles.panelHeaderRowMobile]}>
                      <View style={styles.panelTitleGroup}>
                        <View style={[styles.intelBadgeRow, isMobile && styles.intelBadgeRowMobile]}>
                          <Ionicons name="analytics" size={13} color={colors.brand.primary} />
                          <Text style={[styles.intelBadgeText, isMobile && { fontSize: 9 }]}>AI-ASSISTED MONITORING & DIAGNOSTICS</Text>
                        </View>
                        <Text style={[styles.panelTitle, isMobile && styles.panelTitleMobile]}>Anomaly Intelligence & Evidence Signals</Text>
                        <Text style={styles.panelSubtitle}>
                          Cross-source observable telemetry variances, attendance disparities, and audit gaps
                        </Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.panelActionPill}
                        onPress={() => navigation.navigate('AnomalyExplorer')}
                      >
                        <Ionicons name="analytics" size={12} color={colors.brand.primary} />
                        <Text style={styles.panelActionPillText}>Explore All</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Priority Signal Spotlight ALT-2601 */}
                    <View style={[styles.schemeAttentionCard, isMobile && styles.schemeAttentionCardMobile]}>
                      <View style={[styles.attentionHeader, isMobile && styles.attentionHeaderMobile]}>
                        <View style={styles.attentionBadge}>
                          <Ionicons name="warning" size={13} color={colors.status.highPriority} />
                          <Text style={[styles.attentionBadgeText, isMobile && { fontSize: 9 }]} numberOfLines={2}>PRIORITY MONITORING SIGNAL: ALT-2601</Text>
                        </View>
                        <AnomalyConfidenceBadge confidence={85} level="HIGH" />
                      </View>
                      <Text style={styles.spotlightTitle}>
                        Observed Attendance / CCTV Discrepancy • Sunrise Rehabilitation Centre
                      </Text>
                      <Text style={styles.spotlightDesc}>
                        Reported roll-call (42 present) exceeds optical CCTV headcount estimate (25 persons) by 17 participants (40.48% variance). Supported by 4 independent corroborating signals.
                      </Text>
                      <View style={styles.attentionActionRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[styles.attentionActionBtn, { minHeight: 44 }]}
                          onPress={() => navigation.navigate('AnomalyDetails', { anomalyId: 'ALT-2601' })}
                        >
                          <Text style={styles.attentionActionBtnText}>Review ALT-2601 Diagnostic Dossier</Text>
                          <Ionicons name="arrow-forward" size={13} color={colors.brand.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Top Anomaly Preview Cards List */}
                    <View style={styles.previewCardsList}>
                      {topAnomalies.map(anom => (
                        <TouchableOpacity
                          key={anom.anomalyId || anom.id}
                          activeOpacity={0.8}
                          style={styles.previewCardItem}
                          onPress={() => navigation.navigate('AnomalyDetails', { anomalyId: anom.anomalyId || anom.id })}
                        >
                          <View style={styles.previewCardTop}>
                            <Text style={styles.previewCodeText}>{anom.anomalyId || anom.id}</Text>
                            <AnomalySeverityBadge severity={anom.severity} compact />
                          </View>
                          <Text style={styles.previewCardTitle} numberOfLines={1}>{anom.title || anom.type}</Text>
                          <View style={styles.previewMetricsRow}>
                            <Text style={styles.previewMetricItem}>Status: <Text style={styles.previewBold}>{anom.status}</Text></Text>
                            <Text style={styles.previewMetricItem}>Confidence: <Text style={styles.previewBold}>{anom.confidence ?? 80}%</Text></Text>
                            <Text style={styles.previewMetricItem}>Signals: <Text style={styles.previewBold}>{anom.sourceSignals?.length ?? 2}</Text></Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                </View>

                {/* RIGHT SECONDARY RAIL (340px on desktop, 100% on mobile) */}
                <View style={isDesktop ? styles.mainRightCol : styles.mainRightColMobile}>

                  {/* RAIL CARD 1: COHERENT ACTION GROUP */}
                  <View style={[styles.railPanel, isMobile && styles.railPanelMobile]}>
                    <View style={styles.railPanelHeader}>
                      <Ionicons name="flash-outline" size={14} color={colors.brand.primary} />
                      <Text style={styles.railPanelTitle}>OPERATIONAL ACTIONS</Text>
                    </View>
                    <Text style={styles.railPanelSub}>Direct institutional actions & authorizations</Text>

                    <View style={styles.coherentActionGroup}>
                      <TouchableOpacity
                        style={styles.coherentActionBtnPrimary}
                        onPress={() => navigation.navigate('InitiateInspection', { projectId: 'PRJ-101' })}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="add-circle" size={16} color={colors.text.inverse} />
                        <Text style={styles.coherentActionBtnPrimaryText}>Initiate Inspection</Text>
                        <Ionicons name="arrow-forward" size={13} color={colors.text.inverse} style={{ marginLeft: 'auto' }} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.coherentActionBtnWarning}
                        onPress={() => navigation.navigate('Alerts')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="alert-circle" size={16} color={colors.status.highPriority} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.coherentActionBtnWarningTitle}>Review Alerts</Text>
                          <Text style={styles.coherentActionBtnWarningSub}>{stats?.highPriorityCount ?? 6} pending verification</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={13} color={colors.status.highPriority} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.coherentActionBtnSecondary}
                        onPress={() => navigation.navigate('Inspections')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="clipboard-outline" size={15} color={colors.brand.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.coherentActionBtnSecondaryTitle}>Monitor Inspections</Text>
                          <Text style={styles.coherentActionBtnSecondarySub}>{stats?.pendingInspectionsCount ?? 14} audits scheduled</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={13} color={colors.brand.primary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.coherentActionBtnSecondary}
                        onPress={() => navigation.navigate('Monitoring')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="business-outline" size={15} color={colors.brand.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.coherentActionBtnSecondaryTitle}>View Projects Directory</Text>
                          <Text style={styles.coherentActionBtnSecondarySub}>{stats?.totalProjects ?? 148} institutions</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={13} color={colors.brand.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* RAIL CARD 2: CCTV TELEMETRY MONITOR */}
                  <View style={[styles.railPanel, isMobile && styles.railPanelMobile]}>
                    <View style={styles.railPanelHeader}>
                      <Ionicons name="videocam-outline" size={14} color={colors.status.normal} />
                      <Text style={styles.railPanelTitle}>CCTV TELEMETRY FEED</Text>
                      <View style={styles.railLiveTag}>
                        <Animated.View style={[styles.pulseDotGreen, { opacity: livePulse }]} />
                        <Text style={styles.railLiveTagText}>ONLINE</Text>
                      </View>
                    </View>

                    <View style={styles.railStatRow}>
                      <Text style={styles.railBigNumber}>93.9%</Text>
                      <Text style={styles.railBigLabel}>Cameras Online</Text>
                    </View>

                    {/* Progress Meter Track */}
                    <View style={styles.coverageMeterContainer}>
                      <View style={styles.coverageMeterTrack}>
                        <View style={[styles.coverageMeterFill, { width: '93.9%' }]} />
                      </View>
                      <View style={styles.coverageMeterLabels}>
                        <Text style={styles.meterTextActive}>{animatedCctv} Online</Text>
                        <Text style={styles.meterTextOffline}>
                          {(stats?.totalProjects ?? 148) - (stats?.activeCCTVCount ?? 139)} Offline
                        </Text>
                      </View>
                    </View>

                    {/* Operational Node Distribution */}
                    <View style={styles.nodeBreakdownList}>
                      <View style={styles.nodeBreakdownRow}>
                        <View style={styles.nodeRowLeft}>
                          <View style={[styles.nodeIndicatorDot, { backgroundColor: colors.status.normal }]} />
                          <Text style={styles.nodeRowLabel}>Active CCTV Feeds</Text>
                        </View>
                        <Text style={styles.nodeRowVal}>
                          {animatedCctv} / {stats?.totalProjects ?? 148}
                        </Text>
                      </View>
                      <View style={styles.nodeRowDivider} />
                      <View style={styles.nodeBreakdownRow}>
                        <View style={styles.nodeRowLeft}>
                          <View style={[styles.nodeIndicatorDot, { backgroundColor: colors.status.warning }]} />
                          <Text style={styles.nodeRowLabel}>Offline Feeds</Text>
                        </View>
                        <Text style={[styles.nodeRowVal, { color: colors.status.warning }]}>
                          {(stats?.totalProjects ?? 148) - (stats?.activeCCTVCount ?? 139)} / {stats?.totalProjects ?? 148}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.railFooterLink}
                      onPress={() => navigation.navigate('Monitoring')}
                    >
                      <Text style={styles.railFooterLinkText}>View All Monitoring Feeds</Text>
                      <Ionicons name="arrow-forward" size={12} color={colors.brand.primary} />
                    </TouchableOpacity>
                  </View>

                  {/* RAIL CARD 3: NATIONAL METRICS SUMMARY (THE 5 KPIS REORGANIZED RESTRAINEDLY) */}
                  <View style={[styles.railPanel, isMobile && styles.railPanelMobile]}>
                    <View style={styles.railPanelHeader}>
                      <Ionicons name="stats-chart-outline" size={14} color={colors.brand.primary} />
                      <Text style={styles.railPanelTitle}>NATIONAL METRICS OVERVIEW</Text>
                    </View>
                    <Text style={styles.railPanelSub}>Key statutory performance & audit indicators</Text>

                    <View style={styles.kpiSummaryList}>
                      <View style={styles.kpiSummaryRow}>
                        <View style={styles.kpiSummaryLabelCol}>
                          <Text style={styles.kpiSummaryTitle}>Registered Institutes</Text>
                          <Text style={styles.kpiSummarySub}>Implementing organizations</Text>
                        </View>
                        <Text style={styles.kpiSummaryVal}>{orgKpis.total}</Text>
                      </View>

                      <View style={styles.kpiSummaryDivider} />

                      <View style={styles.kpiSummaryRow}>
                        <View style={styles.kpiSummaryLabelCol}>
                          <Text style={styles.kpiSummaryTitle}>Average Compliance</Text>
                          <Text style={styles.kpiSummarySub}>Multi-factor score average</Text>
                        </View>
                        <Text style={[styles.kpiSummaryVal, { color: colors.brand.primary }]}>{orgKpis.avgScore}/100</Text>
                      </View>

                      <View style={styles.kpiSummaryDivider} />

                      <View style={styles.kpiSummaryRow}>
                        <View style={styles.kpiSummaryLabelCol}>
                          <Text style={styles.kpiSummaryTitle}>Higher Priority</Text>
                          <Text style={styles.kpiSummarySub}>Requires close oversight</Text>
                        </View>
                        <Text style={[styles.kpiSummaryVal, { color: colors.status.highPriority }]}>{orgKpis.highPriority}</Text>
                      </View>

                      <View style={styles.kpiSummaryDivider} />

                      <View style={styles.kpiSummaryRow}>
                        <View style={styles.kpiSummaryLabelCol}>
                          <Text style={styles.kpiSummaryTitle}>Open Audit Findings</Text>
                          <Text style={styles.kpiSummarySub}>Unresolved field observations</Text>
                        </View>
                        <Text style={[styles.kpiSummaryVal, { color: colors.status.warning }]}>{orgKpis.openFindings}</Text>
                      </View>

                      <View style={styles.kpiSummaryDivider} />

                      <View style={styles.kpiSummaryRow}>
                        <View style={styles.kpiSummaryLabelCol}>
                          <Text style={styles.kpiSummaryTitle}>Active Discrepancies</Text>
                          <Text style={styles.kpiSummarySub}>Telemetry variances flagged</Text>
                        </View>
                        <Text style={[styles.kpiSummaryVal, { color: colors.status.highPriority }]}>{orgKpis.anomalies}</Text>
                      </View>

                      <View style={styles.kpiSummaryDivider} />

                      <View style={styles.kpiSummaryRow}>
                        <View style={styles.kpiSummaryLabelCol}>
                          <Text style={styles.kpiSummaryTitle}>Pending Field Audits</Text>
                          <Text style={styles.kpiSummarySub}>Surprise inspections queued</Text>
                        </View>
                        <Text style={styles.kpiSummaryVal}>{stats?.pendingInspectionsCount ?? 14}</Text>
                      </View>
                    </View>
                  </View>

                </View>

              </View>
            </Animated.View>
          </ScrollView>

        </Animated.View>
      )}
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
  scrollContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: 100,
  },
  liveTelemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(239, 247, 241, 0.85)' : colors.status.normalLight,
    borderColor: colors.status.normalBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } as any) : {}),
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.status.normal,
    marginRight: 6,
  },
  liveTelemetryText: {
    fontFamily: typography.fontFamily,
    color: colors.status.normal,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.6,
  },

  // 1. PAGE CONTEXT & SYSTEM STATUS
  pageContextBar: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
    gap: spacing.xs,
  },
  pageContextBarDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextLeft: {
    flex: 1,
  },
  pageContextPre: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    color: colors.brand.primary,
    marginBottom: 2,
  },
  pageContextTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  pageContextSub: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  contextRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  contextPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.normal,
  },
  contextRightBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },

  // 2. PRIMARY ALERT BANNER (ONE IMPORTANT ALERT / ACTION ROW)
  primaryAlertBanner: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.highPriority,
    borderRadius: borderRadius.sm,
    padding: spacing.base,
    marginBottom: spacing.base,
    flexDirection: 'column',
    gap: spacing.sm,
    ...shadows.xs,
  },
  primaryAlertLeft: {
    flex: 1,
  },
  primaryAlertBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  primaryAlertCode: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
  },
  primaryAlertCategory: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.status.highPriority,
    backgroundColor: colors.status.highPriorityLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryAlertTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  primaryAlertTimeText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.muted,
  },
  primaryAlertTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  primaryAlertSummary: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  primaryAlertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: borderRadius.sm,
  },
  actionButtonPrimaryText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: borderRadius.sm,
  },
  actionButtonSecondaryText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },

  // 3. MAIN GRID & COLUMNS (12-COL DESKTOP SPLIT)
  mainGridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.base,
  },
  mainGridMobile: {
    flexDirection: 'column',
    gap: spacing.base,
  },
  mainLeftCol: {
    flex: 1,
    gap: spacing.base,
  },
  mainRightCol: {
    width: 340,
    gap: spacing.base,
  },
  mainRightColMobile: {
    width: '100%',
    gap: spacing.base,
  },

  // 4. UNIFIED SURFACE PANELS (ELIMINATING "DAPPA DAPPA" OVERLOAD)
  surfacePanel: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.base,
    ...shadows.xs,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  panelTitleGroup: {
    flex: 1,
  },
  panelTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  panelSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  panelHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  panelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.brand.primaryLight,
  },
  panelActionBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  panelActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.background,
  },
  panelActionPillText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  panelFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  panelFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  panelFooterBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },

  // 5. CORROBORATION STRIP, ROWS CONTAINER & TWO-COL
  evidenceCorroborationStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  evidenceItemText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
  },
  rowsListContainer: {
    gap: spacing.xs + 2,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  twoColRowMobile: {
    flexDirection: 'column',
    gap: spacing.base,
  },
  halfCol: {
    flex: 1,
  },
  subSectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  spotlightTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  spotlightDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },

  // 6. RIGHT SECONDARY RAIL (ACTIONS, TELEMETRY & RESTRAINED KPIS)
  railPanel: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.base,
    ...shadows.xs,
  },
  railPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  railPanelTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    letterSpacing: 0.8,
  },
  railPanelSub: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  railLiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: colors.status.normalLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  railLiveTagText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
  },
  coherentActionGroup: {
    flexDirection: 'column',
    gap: spacing.xs + 2,
  },
  coherentActionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    minHeight: 44,
    borderRadius: borderRadius.sm,
  },
  coherentActionBtnPrimaryText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  coherentActionBtnWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.status.highPriorityLight,
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    minHeight: 44,
    borderRadius: borderRadius.sm,
  },
  coherentActionBtnWarningTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
  },
  coherentActionBtnWarningSub: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  coherentActionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral.background,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    minHeight: 44,
    borderRadius: borderRadius.sm,
  },
  coherentActionBtnSecondaryTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  coherentActionBtnSecondarySub: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  railStatRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  railBigNumber: {
    fontFamily: typography.fontFamily,
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  railBigLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
  },
  railFooterLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  railFooterLinkText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  kpiSummaryList: {
    flexDirection: 'column',
  },
  kpiSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  kpiSummaryLabelCol: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  kpiSummaryTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  kpiSummarySub: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  kpiSummaryVal: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  kpiSummaryDivider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: 2,
  },
  // SECTION 1: ASYMMETRIC METRICS DECK
  deckDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm + 4,
    marginBottom: spacing.xs,
  },
  deckMobile: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  // Hero Alert Block (Dominant Action Unit)
  heroAlertBlock: {
    backgroundColor: '#FFFDFD',
    borderRadius: borderRadius.md,
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.highPriority,
    padding: spacing.md,
    justifyContent: 'space-between',
    minHeight: 140,
    ...shadows.xs,
  },
  heroAlertBlockDesktop: {
    flex: 0.95,
  },
  heroAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  heroAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.highPriorityLight,
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  heroAlertBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    letterSpacing: 0.4,
  },
  heroAlertBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
    gap: spacing.md,
  },
  heroAlertNumber: {
    fontFamily: typography.fontFamily,
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    letterSpacing: -1,
    minWidth: 44,
  },
  heroAlertLabels: {
    flex: 1,
  },
  heroAlertTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 20,
  },
  heroAlertSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    lineHeight: 16,
    marginTop: 2,
  },
  heroAlertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs + 2,
    paddingTop: spacing.xs,
    borderTopColor: colors.status.highPriorityBorder,
    borderTopWidth: 1,
    gap: 4,
  },
  heroAlertActionText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
  },

  // Secondary Telemetry Cluster
  telemetryCluster: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  telemetryClusterDesktop: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  telemetryCard: {
    flex: 1,
    minWidth: 140,
    minHeight: 140,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    ...shadows.xs,
    justifyContent: 'space-between',
  },
  telemetryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  telemetryIconBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemetryValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.5,
  },
  telemetryDenom: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  telemetryTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginTop: 2,
  },
  telemetrySub: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  telemetryLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.surfaceSubtle,
  },
  telemetryLinkText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },

  // QUICK ACTIONS STRIP
  quickActionStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  quickActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.88)' : colors.neutral.surface,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: 6,
    minHeight: 38,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } as any) : {}),
    ...shadows.xs,
  },
  quickActionText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.brand.primary,
  },

  // SECTION 2: 2-COLUMN SPLIT ROW
  desktopSplitRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.base,
  },
  mobileStackRow: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  desktopLeftCol: {
    flex: 1.35,
  },
  desktopRightCol: {
    flex: 1,
  },
  fullCol: {
    width: '100%',
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
    minHeight: 26,
  },
  sectionTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.highPriorityLight,
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  sectionTitleDotRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.highPriority,
  },
  sectionTitleBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    letterSpacing: 0.4,
  },
  sectionTitleBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normalBorder,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  sectionTitleDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.normal,
  },
  sectionTitleBadgeTextGreen: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
    letterSpacing: 0.4,
  },
  sectionHeaderTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },

  // Immediate Action Incident Card
  focalIncidentCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  incidentTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    marginBottom: spacing.sm,
  },
  incidentTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incidentCode: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    letterSpacing: 0.5,
  },
  incidentCategory: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.muted,
  },
  incidentTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(243, 239, 232, 0.85)' : colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    gap: 4,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } as any) : {}),
  },
  incidentTimeText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.muted,
  },
  incidentInstituteBox: {
    marginBottom: spacing.md,
  },
  incidentInstituteName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 24,
  },
  incidentInstituteMeta: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },

  // Discrepancy Focal Callout
  discrepancyFocalBox: {
    backgroundColor: '#FFF9F8',
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  discrepancyCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  discrepancyNumber: {
    fontSize: 34,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    letterSpacing: -1,
  },
  discrepancyTextCol: {
    flex: 1,
  },
  discrepancyBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    letterSpacing: 0.5,
  },
  discrepancyDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginTop: 2,
  },

  // 3-Box Comparative Telemetry Grid
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.neutral.divider,
  },
  comparisonLabel: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  comparisonVal: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginVertical: 2,
  },
  comparisonValCctv: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    marginVertical: 2,
  },
  comparisonValDiff: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    marginVertical: 2,
  },
  comparisonSub: {
    fontSize: 9,
    color: colors.text.muted,
  },

  // Action Buttons
  incidentActions: {
    flexDirection: 'row',
  },

  // Right Column: Telemetry Health Card
  telemetryHealthCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-between',
    ...shadows.xs,
  },
  telemetryHealthHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  telemetryHealthBigNum: {
    fontFamily: typography.fontFamily,
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -1,
  },
  telemetryHealthBigLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    marginTop: 2,
  },
  healthStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(239, 247, 241, 0.85)' : colors.status.normalLight,
    borderColor: colors.status.normalBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 5,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } as any) : {}),
  },
  pulseDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.normal,
  },
  healthStatusBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
    letterSpacing: 0.5,
  },

  // Meter Track
  coverageMeterContainer: {
    marginBottom: spacing.md,
  },
  coverageMeterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.surfaceSubtle,
    overflow: 'hidden',
  },
  coverageMeterFill: {
    height: '100%',
    backgroundColor: colors.status.normal,
    borderRadius: 4,
  },
  coverageMeterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  meterTextActive: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.status.normal,
  },
  meterTextOffline: {
    fontSize: 10,
    color: colors.status.warning,
  },

  // Node Breakdown List
  nodeBreakdownList: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  nodeBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  nodeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nodeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nodeRowLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  nodeRowVal: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  nodeRowDivider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: 4,
  },
  telemetryHealthCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.status.infoBorder,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  telemetryHealthCtaText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },

  // SECTION 3: PRIORITY OPERATIONS QUEUE
  queueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  queueSectionTitle: {
    fontSize: typography.sizes.base + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  queueSectionSub: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  queueCountBadge: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  queueCountText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },

  queueContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.xs,
  },
  opQueueRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.surface,
  },
  opQueueRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  opQueueAccent: {
    width: 4,
  },
  opQueueContent: {
    flex: 1,
    padding: spacing.md,
  },
  opQueueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 4,
  },
  opQueueTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  opQueueName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  opQueueCode: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  opBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  opBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.4,
  },
  opQueueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  opQueueCategory: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  opQueueDot: {
    fontSize: 10,
    color: colors.text.muted,
  },
  opQueueLocation: {
    fontSize: 12,
    color: colors.text.muted,
  },
  opQueueBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.surfaceSubtle,
  },
  opTelemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  opTelemetryText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  opTelemetryBold: {
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  opQueueActionAffordance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  opQueueActionText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },

  // Queue Footer
  queueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  queueFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  queueFooterBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },

  // SECTION 4: DIVISION & SCHEME INTELLIGENCE STYLES
  intelligenceSectionContainer: {
    marginTop: spacing.xl,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  intelHeaderRow: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  intelHeaderRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  intelHeaderTitles: {
    flex: 1,
  },
  intelBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  intelBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  intelSectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  intelSectionSub: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  intelActionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  intelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.sm,
    minHeight: 38,
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.brand.accent,
  },
  intelActionBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  schemeAttentionCard: {
    backgroundColor: colors.status.warningLight,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.warningBorder,
    marginBottom: spacing.base,
  },
  attentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  attentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  attentionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.status.highPriority,
    letterSpacing: 0.5,
  },
  attentionPriorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.highPriority,
    backgroundColor: colors.status.highPriorityLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  attentionTraceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  traceNode: {
    alignItems: 'center',
    flex: 1,
  },
  traceNodeLabel: {
    fontSize: 10,
    color: colors.text.muted,
  },
  traceNodeVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 2,
  },
  traceNodeSub: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 1,
    textAlign: 'center',
  },
  attentionActionRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  attentionActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attentionActionBtnText: {
    fontSize: 12,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  intelPreviewsRow: {
    flexDirection: 'column',
    gap: spacing.base,
  },
  desktopIntelPreviewsRow: {
    flexDirection: 'row',
  },
  previewCol: {
    flex: 1,
  },
  previewColHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  previewColTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: 12,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  previewCardsList: {
    gap: spacing.xs,
  },
  previewCardItem: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  previewCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewCodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  previewCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  previewMetricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 4,
  },
  previewMetricItem: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  previewBold: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  // Adaptive Responsive KPI Grid Styles (No Horizontal Scrolling)
  kpiDeckDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  kpiGridMobile: {
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  kpiRowTop: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  kpiRowBottom: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  kpiCardItem: {
    flex: 1,
    minWidth: 70,
    minHeight: 68,
    justifyContent: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.xs,
  },
  kpiCardValue: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  kpiCardLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // ============ MOBILE RESPONSIVE OVERRIDES (360-430px) ============
  pageContextTitleMobile: {
    fontSize: typography.sizes.base + 2,
  },
  contextRightBadgeMobile: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  primaryAlertBadgeRowMobile: {
    gap: spacing.xs,
  },
  surfacePanelMobile: {
    padding: spacing.sm + 2,
  },
  panelHeaderRowMobile: {
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.xs,
  },
  panelTitleMobile: {
    fontSize: typography.sizes.sm + 1,
  },
  panelActionBtnMobile: {
    alignSelf: 'flex-start' as const,
    marginTop: spacing.xs,
  },
  panelHeaderActionsMobile: {
    flexWrap: 'wrap' as const,
    marginTop: spacing.xs,
  },
  intelBadgeRowMobile: {
    flexWrap: 'wrap' as const,
  },
  comparisonGridMobile: {
    flexDirection: 'column' as const,
    gap: spacing.xs,
  },
  comparisonItemMobile: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  attentionHeaderMobile: {
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.xs,
  },
  attentionTraceBoxMobile: {
    flexDirection: 'column' as const,
    gap: spacing.xs,
    alignItems: 'center' as const,
  },
  traceNodeMobile: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
    alignItems: 'center' as const,
    width: '100%' as any,
    justifyContent: 'center' as const,
    paddingVertical: spacing.xs,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
  },
  schemeAttentionCardMobile: {
    padding: spacing.sm,
  },
  railPanelMobile: {
    padding: spacing.sm + 2,
  },
});

