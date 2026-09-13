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
import { typography } from '../../theme/typography';
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.brand.primary]}
              />
            }
          >
            {/* SECTION 1: ASYMMETRIC NATIONAL STATUS / KEY METRICS CONSOLE */}
            <Animated.View style={{ opacity: heroAnim }}>
              <View style={isDesktop ? styles.deckDesktop : styles.deckMobile}>
                {/* Dominant Action Block: Alerts Requiring Review */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[styles.heroAlertBlock, isDesktop && styles.heroAlertBlockDesktop]}
                  onPress={() => navigation.navigate('Alerts')}
                >
                  <View style={styles.heroAlertHeader}>
                    <View style={styles.heroAlertBadge}>
                      <Ionicons name="alert-circle-outline" size={13} color={colors.status.highPriority} />
                      <Text style={styles.heroAlertBadgeText}>ACTION REQUIRED</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={14} color={colors.status.highPriority} />
                  </View>

                  <View style={styles.heroAlertBody}>
                    <Text style={styles.heroAlertNumber}>{animatedAlerts}</Text>
                    <View style={styles.heroAlertLabels}>
                      <Text style={styles.heroAlertTitle}>Alerts Requiring Review</Text>
                      <Text style={styles.heroAlertSubtitle}>Human verification needed</Text>
                    </View>
                  </View>

                  <View style={styles.heroAlertFooter}>
                    <Text style={styles.heroAlertActionText}>Action required</Text>
                    <Ionicons name="chevron-forward" size={13} color={colors.status.highPriority} />
                  </View>
                </TouchableOpacity>

                {/* Structured Telemetry Console Strip (3 operational indicators) */}
                <View style={[styles.telemetryCluster, isDesktop && styles.telemetryClusterDesktop]}>
                  {/* Item 1: Pending Inspections */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.telemetryCard}
                    onPress={() => navigation.navigate('Inspections')}
                  >
                    <View style={styles.telemetryCardTop}>
                      <View style={[styles.telemetryIconBox, { backgroundColor: colors.status.warningLight }]}>
                        <Ionicons name="clipboard-outline" size={16} color={colors.status.warning} />
                      </View>
                      <Text style={[styles.telemetryValue, { color: colors.text.primary }]}>
                        {animatedInspections}
                      </Text>
                    </View>
                    <Text style={styles.telemetryTitle}>Pending Inspections</Text>
                    <Text style={styles.telemetrySub}>Field audits scheduled</Text>
                    <View style={styles.telemetryLinkRow}>
                      <Text style={styles.telemetryLinkText}>PMU dispatch</Text>
                      <Ionicons name="arrow-forward" size={11} color={colors.brand.primary} />
                    </View>
                  </TouchableOpacity>

                  {/* Item 2: CCTV Telemetry Feed */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.telemetryCard}
                    onPress={() => navigation.navigate('Monitoring')}
                  >
                    <View style={styles.telemetryCardTop}>
                      <View style={[styles.telemetryIconBox, { backgroundColor: colors.status.normalLight }]}>
                        <Ionicons name="videocam-outline" size={16} color={colors.status.normal} />
                      </View>
                      <Text style={[styles.telemetryValue, { color: colors.status.normal }]}>
                        {animatedCctv}<Text style={styles.telemetryDenom}>/148</Text>
                      </Text>
                    </View>
                    <Text style={styles.telemetryTitle}>CCTV Telemetry Feed</Text>
                    <Text style={styles.telemetrySub}>93.9% cameras online</Text>
                    <View style={styles.telemetryLinkRow}>
                      <Text style={[styles.telemetryLinkText, { color: colors.status.normal }]}>Telemetry healthy</Text>
                      <Ionicons name="shield-checkmark" size={11} color={colors.status.normal} />
                    </View>
                  </TouchableOpacity>

                  {/* Item 3: Projects Monitored */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.telemetryCard}
                    onPress={() => navigation.navigate('Monitoring')}
                  >
                    <View style={styles.telemetryCardTop}>
                      <View style={[styles.telemetryIconBox, { backgroundColor: colors.brand.primaryLight }]}>
                        <Ionicons name="business-outline" size={16} color={colors.brand.primary} />
                      </View>
                      <Text style={[styles.telemetryValue, { color: colors.text.primary }]}>
                        {animatedProjects}
                      </Text>
                    </View>
                    <Text style={styles.telemetryTitle}>Projects Monitored</Text>
                    <Text style={styles.telemetrySub}>148 registered institutes</Text>
                    <View style={styles.telemetryLinkRow}>
                      <Text style={styles.telemetryLinkText}>Directory oversight</Text>
                      <Ionicons name="arrow-forward" size={11} color={colors.brand.primary} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            {/* QUICK ACTIONS STRIP */}
            <View style={styles.quickActionStrip}>
              <TouchableOpacity
                style={styles.quickActionPill}
                onPress={() => navigation.navigate('InitiateInspection', { projectId: 'PRJ-101' })}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={14} color={colors.brand.primary} />
                <Text style={styles.quickActionText}>Initiate Inspection</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionPill}
                onPress={() => navigation.navigate('Alerts')}
                activeOpacity={0.8}
              >
                <Ionicons name="alert-circle-outline" size={14} color={colors.status.warning} />
                <Text style={[styles.quickActionText, { color: colors.status.warning }]}>
                  Review Alerts ({stats?.highPriorityCount ?? 0})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionPill}
                onPress={() => navigation.navigate('Inspections')}
                activeOpacity={0.8}
              >
                <Ionicons name="clipboard-outline" size={14} color={colors.brand.primary} />
                <Text style={styles.quickActionText}>Monitor Inspections</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionPill}
                onPress={() => navigation.navigate('Monitoring')}
                activeOpacity={0.8}
              >
                <Ionicons name="business-outline" size={14} color={colors.brand.primary} />
                <Text style={styles.quickActionText}>View Projects ({stats?.totalProjects ?? 148})</Text>
              </TouchableOpacity>
            </View>

            {/* SECTION 2: ASYMMETRIC 2-COLUMN SPLIT ROW (DESKTOP) / STACKED (MOBILE) */}
            <Animated.View style={{ opacity: splitRowAnim, marginTop: spacing.md }}>
              <View style={isDesktop ? styles.desktopSplitRow : styles.mobileStackRow}>
                {/* LEFT COLUMN: IMMEDIATE REVIEW REQUIRED */}
                <View style={isDesktop ? styles.desktopLeftCol : styles.fullCol}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionTitleBadge}>
                      <View style={styles.sectionTitleDotRed} />
                      <Text style={styles.sectionTitleBadgeText}>{topAlert ? topAlert.severity : 'HIGH'}</Text>
                    </View>
                    <Text style={styles.sectionHeaderTitle}>Immediate Review Required</Text>
                  </View>

                  {topAlert ? (
                    <View style={styles.focalIncidentCard}>
                      {/* Incident Header */}
                      <View style={styles.incidentTopBar}>
                        <View style={styles.incidentTopLeft}>
                          <Text style={styles.incidentCode}>{topAlert.id}</Text>
                          <Text style={styles.incidentCategory}>{topAlert.category}</Text>
                        </View>
                        <View style={styles.incidentTimeBadge}>
                          <Ionicons name="time-outline" size={12} color={colors.text.muted} />
                          <Text style={styles.incidentTimeText}>{topAlert.timestamp}</Text>
                        </View>
                      </View>

                      {/* Institution Banner */}
                      <View style={styles.incidentInstituteBox}>
                        <Text style={styles.incidentInstituteName}>{topAlert.projectName}</Text>
                      </View>

                      {/* Prominent Numerical Discrepancy Focal Point */}
                      <View style={styles.discrepancyFocalBox}>
                        <View style={styles.discrepancyCallout}>
                          <Text style={styles.discrepancyNumber}>+{diffCount}</Text>
                          <View style={styles.discrepancyTextCol}>
                            <Text style={styles.discrepancyBadgeText}>ATTENDANCE DIFFERENCE</Text>
                            <Text style={styles.discrepancyDesc}>{topAlert.description}</Text>
                          </View>
                        </View>

                        {/* 3-Box Comparative Telemetry Grid */}
                        <View style={styles.comparisonGrid}>
                          <View style={styles.comparisonItem}>
                            <Text style={styles.comparisonLabel}>Reported Attendance</Text>
                            <Text style={styles.comparisonVal}>{reportedCount}</Text>
                          </View>
                          <View style={styles.comparisonDivider} />
                          <View style={styles.comparisonItem}>
                            <Text style={styles.comparisonLabel}>Estimated Headcount</Text>
                            <Text style={styles.comparisonValCctv}>{cctvCount}</Text>
                          </View>
                          <View style={styles.comparisonDivider} />
                          <View style={styles.comparisonItem}>
                            <Text style={styles.comparisonLabel}>Difference</Text>
                            <Text style={styles.comparisonValDiff}>+{diffCount}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Action Affordance */}
                      <View style={styles.incidentActions}>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.actionButtonPrimary}
                          onPress={() => navigation.navigate('AlertReview', { alertId: topAlert.id })}
                        >
                          <Ionicons name="shield-checkmark-outline" size={15} color={colors.text.inverse} />
                          <Text style={styles.actionButtonPrimaryText}>Review Alert</Text>
                          <Ionicons name="arrow-forward" size={14} color={colors.text.inverse} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}
                </View>

                {/* RIGHT COLUMN: CCTV TELEMETRY OVERVIEW */}
                <View style={isDesktop ? styles.desktopRightCol : styles.fullCol}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionTitleBadgeGreen}>
                      <View style={styles.sectionTitleDotGreen} />
                      <Text style={styles.sectionTitleBadgeTextGreen}>STATUS NORMAL</Text>
                    </View>
                    <Text style={styles.sectionHeaderTitle}>CCTV Telemetry Overview</Text>
                  </View>

                  <View style={styles.telemetryHealthCard}>
                    {/* Coverage Header */}
                    <View style={styles.telemetryHealthHeader}>
                      <View>
                        <Text style={styles.telemetryHealthBigNum}>93.9%</Text>
                        <Text style={styles.telemetryHealthBigLabel}>Cameras Online</Text>
                      </View>
                      <View style={styles.healthStatusBadge}>
                        <View style={styles.pulseDotGreen} />
                        <Text style={styles.healthStatusBadgeText}>ONLINE</Text>
                      </View>
                    </View>

                    {/* Visual Progress Meter Bar */}
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

                    {/* CTA Link to Monitoring Tab */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.telemetryHealthCta}
                      onPress={() => navigation.navigate('Monitoring')}
                    >
                      <Text style={styles.telemetryHealthCtaText}>View All Monitoring Feeds</Text>
                      <Ionicons name="arrow-forward" size={13} color={colors.brand.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* SECTION 3: PRIORITY OPERATIONS (COMPACT OPERATIONAL LIST) */}
            <Animated.View style={{ opacity: queueAnim, marginTop: spacing.lg }}>
              <View style={styles.queueHeaderRow}>
                <View>
                  <Text style={styles.queueSectionTitle}>Priority Operations</Text>
                  <Text style={styles.queueSectionSub}>
                    Institutions flagged for biometric variance or inspection schedules
                  </Text>
                </View>
                <View style={styles.queueCountBadge}>
                  <Text style={styles.queueCountText}>{priorityProjects.length}</Text>
                </View>
              </View>

              {/* High-density operational action rows */}
              <View style={styles.queueContainer}>
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
                      {/* Priority left indicator strip */}
                      <View style={[styles.opQueueAccent, { backgroundColor: accentColor }]} />

                      <View style={styles.opQueueContent}>
                        {/* Top: Name, Code & Priority Tag */}
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

                        {/* Middle: Location & Category */}
                        <View style={styles.opQueueMetaRow}>
                          <Text style={styles.opQueueCategory}>{project.category}</Text>
                          <Text style={styles.opQueueDot}>•</Text>
                          <Text style={styles.opQueueLocation}>
                            {project.location.city}, {project.location.state}
                          </Text>
                        </View>

                        {/* Bottom: Telemetry metrics & action button */}
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

                {/* Queue Footer */}
                <View style={styles.queueFooter}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.queueFooterBtn}
                    onPress={() => navigation.navigate('Monitoring')}
                  >
                    <Text style={styles.queueFooterBtnText}>
                      View All Projects
                    </Text>
                    <Ionicons name="chevron-forward" size={13} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            {/* SECTION 4: DIVISION & SCHEME INTELLIGENCE */}
            <View style={styles.intelligenceSectionContainer}>
              <View style={styles.intelHeaderRow}>
                <View style={styles.intelHeaderTitles}>
                  <View style={styles.intelBadgeRow}>
                    <Ionicons name="layers" size={13} color={colors.brand.primary} />
                    <Text style={styles.intelBadgeText}>ADMINISTRATIVE INTELLIGENCE</Text>
                  </View>
                  <Text style={styles.intelSectionTitle}>Division & Scheme Intelligence</Text>
                  <Text style={styles.intelSectionSub}>
                    Administrative governance, national welfare schemes, and oversight signals
                  </Text>
                </View>

                {/* Quick actions buttons */}
                <View style={styles.intelActionButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.intelActionBtn}
                    onPress={() => navigation.navigate('DivisionExplorer')}
                  >
                    <Ionicons name="business" size={14} color={colors.brand.primary} />
                    <Text style={styles.intelActionBtnText}>Explore Divisions</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.brand.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.intelActionBtn}
                    onPress={() => navigation.navigate('SchemeExplorer')}
                  >
                    <Ionicons name="layers-outline" size={14} color={colors.brand.primary} />
                    <Text style={styles.intelActionBtnText}>Explore Schemes</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* SCHEME MONITORING ATTENTION (SCHEME -> PROJECT -> ANOMALY TRACE) */}
              <View style={styles.schemeAttentionCard}>
                <View style={styles.attentionHeader}>
                  <View style={styles.attentionBadge}>
                    <Ionicons name="warning" size={13} color={colors.status.highPriority} />
                    <Text style={styles.attentionBadgeText}>SCHEME MONITORING ATTENTION</Text>
                  </View>
                  <Text style={styles.attentionPriorityText}>HIGH PRIORITY</Text>
                </View>

                <View style={styles.attentionTraceBox}>
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>SCHEME</Text>
                    <Text style={styles.traceNodeVal}>DDRS</Text>
                    <Text style={styles.traceNodeSub}>Disability Rehab</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>PROJECT</Text>
                    <Text style={styles.traceNodeVal}>PRJ-101</Text>
                    <Text style={styles.traceNodeSub}>Sunrise Rehab</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>ANOMALY</Text>
                    <Text style={[styles.traceNodeVal, { color: colors.status.highPriority }]}>ALT-2601</Text>
                    <Text style={styles.traceNodeSub}>Attendance 42 vs 25</Text>
                  </View>
                </View>

                <View style={styles.attentionActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.attentionActionBtn}
                    onPress={() => navigation.navigate('SchemeDetails', { schemeId: 'SCH-DDRS' })}
                  >
                    <Text style={styles.attentionActionBtnText}>View DDRS Scheme Dossier</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* PREVIEW CARDS: TOP DIVISIONS & TOP SCHEMES */}
              <View style={[styles.intelPreviewsRow, isDesktop && styles.desktopIntelPreviewsRow]}>
                {/* Left: Top Divisions */}
                <View style={styles.previewCol}>
                  <View style={styles.previewColHeader}>
                    <Text style={styles.previewColTitle}>Administrative Divisions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('DivisionExplorer')}>
                      <Text style={styles.seeAllText}>View All ({topDivisions.length})</Text>
                    </TouchableOpacity>
                  </View>

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
                          <Text style={styles.previewMetricItem}>
                            Schemes: <Text style={styles.previewBold}>{div.schemeIds.length}</Text>
                          </Text>
                          <Text style={styles.previewMetricItem}>
                            Projects: <Text style={styles.previewBold}>{div.projectIds.length}</Text>
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Right: Top Schemes */}
                <View style={styles.previewCol}>
                  <View style={styles.previewColHeader}>
                    <Text style={styles.previewColTitle}>National Welfare Schemes</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SchemeExplorer')}>
                      <Text style={styles.seeAllText}>View All ({topSchemes.length})</Text>
                    </TouchableOpacity>
                  </View>

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
                          <Text style={styles.previewMetricItem}>
                            Projects: <Text style={styles.previewBold}>{sch.projectIds.length}</Text>
                          </Text>
                          <Text style={styles.previewMetricItem}>
                            Released: <Text style={styles.previewBold}>₹{((sch.financialSummary?.releasedAmount ?? 0) / 100000).toFixed(0)}L</Text>
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* SECTION 5: ORGANIZATION INTELLIGENCE */}
            <View style={styles.intelligenceSectionContainer}>
              <View style={styles.intelHeaderRow}>
                <View style={styles.intelHeaderTitles}>
                  <View style={styles.intelBadgeRow}>
                    <Ionicons name="business" size={13} color={colors.brand.primary} />
                    <Text style={styles.intelBadgeText}>ORGANIZATION INTELLIGENCE</Text>
                  </View>
                  <Text style={styles.intelSectionTitle}>Implementing Agency Oversight</Text>
                  <Text style={styles.intelSectionSub}>
                    Statutory compliance profiles, multi-factor performance scores, and risk telemetry
                  </Text>
                </View>

                {/* Quick actions buttons */}
                <View style={styles.intelActionButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.intelActionBtn}
                    onPress={() => navigation.navigate('OrganizationExplorer')}
                  >
                    <Ionicons name="business-outline" size={14} color={colors.brand.primary} />
                    <Text style={styles.intelActionBtnText}>Explore Organizations</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ORGANIZATION KPI SUMMARY ROW */}
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.neutral.background, borderRadius: borderRadius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.neutral.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text.primary }}>{orgKpis.total}</Text>
                  <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>Registered</Text>
                </View>
                <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.neutral.background, borderRadius: borderRadius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.neutral.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.brand.primary }}>{orgKpis.avgScore}/100</Text>
                  <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>Avg Score</Text>
                </View>
                <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.neutral.background, borderRadius: borderRadius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.neutral.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.status.highPriority }}>{orgKpis.highPriority}</Text>
                  <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>Higher Priority</Text>
                </View>
                <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.neutral.background, borderRadius: borderRadius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.neutral.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.status.warning }}>{orgKpis.openFindings}</Text>
                  <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>Open Findings</Text>
                </View>
                <View style={{ flex: 1, minWidth: 90, backgroundColor: colors.neutral.background, borderRadius: borderRadius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.neutral.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.status.highPriority }}>{orgKpis.anomalies}</Text>
                  <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>Anomalies</Text>
                </View>
              </View>

              {/* HIGH MONITORING PRIORITY FOCUS CARD */}
              <View style={styles.schemeAttentionCard}>
                <View style={styles.attentionHeader}>
                  <View style={styles.attentionBadge}>
                    <Ionicons name="warning" size={13} color={colors.status.highPriority} />
                    <Text style={styles.attentionBadgeText}>MONITORING PRIORITY FOCUS</Text>
                  </View>
                  <Text style={styles.attentionPriorityText}>HIGH MONITORING PRIORITY</Text>
                </View>

                <View style={styles.attentionTraceBox}>
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>ORGANIZATION</Text>
                    <Text style={styles.traceNodeVal}>ORG-SUNRISE</Text>
                    <Text style={styles.traceNodeSub}>Sunrise Rehab</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>PROJECT</Text>
                    <Text style={styles.traceNodeVal}>PRJ-101</Text>
                    <Text style={styles.traceNodeSub}>DDRS Centre</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>ANOMALY</Text>
                    <Text style={[styles.traceNodeVal, { color: colors.status.highPriority }]}>ALT-2601</Text>
                    <Text style={styles.traceNodeSub}>Headcount 25 vs 42</Text>
                  </View>
                </View>

                <View style={styles.attentionActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.attentionActionBtn}
                    onPress={() => navigation.navigate('OrganizationDetails', { organizationId: 'ORG-SUNRISE' })}
                  >
                    <Text style={styles.attentionActionBtnText}>View Full Intelligence Dossier</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TOP ORGANIZATIONS PREVIEWS */}
              <View style={{ marginTop: spacing.base }}>
                <View style={styles.previewColHeader}>
                  <Text style={styles.previewColTitle}>Registered Implementing Agencies</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('OrganizationExplorer')}>
                    <Text style={styles.seeAllText}>View All ({topOrganizations.length})</Text>
                  </TouchableOpacity>
                </View>

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
                        <Text style={styles.previewMetricItem}>
                          Projects: <Text style={styles.previewBold}>{org.projectIds?.length ?? 0}</Text>
                        </Text>
                        <Text style={styles.previewMetricItem}>
                          Compliance: <Text style={styles.previewBold}>{org.complianceScore ?? org.complianceSummary?.complianceScore ?? 80}/100</Text>
                        </Text>
                        <Text style={styles.previewMetricItem}>
                          Sanctioned: <Text style={styles.previewBold}>₹{((org.totalSanctionedAmount || 0) / 100000).toFixed(0)}L</Text>
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* SECTION 6: PROJECT INTELLIGENCE */}
            <View style={styles.intelligenceSectionContainer}>
              <View style={styles.intelHeaderRow}>
                <View style={styles.intelHeaderTitles}>
                  <View style={styles.intelBadgeRow}>
                    <Ionicons name="layers" size={13} color={colors.brand.primary} />
                    <Text style={styles.intelBadgeText}>PROJECT INTELLIGENCE</Text>
                  </View>
                  <Text style={styles.intelSectionTitle}>Operational Project & Funding Oversight</Text>
                  <Text style={styles.intelSectionSub}>
                    Multi-factor explainable profiles, grant disbursement tranches, and optical beneficiary roll-calls
                  </Text>
                </View>

                {/* Quick actions buttons */}
                <View style={styles.intelActionButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.intelActionBtn}
                    onPress={() => navigation.navigate('ProjectExplorer')}
                  >
                    <Ionicons name="folder-open-outline" size={14} color={colors.brand.primary} />
                    <Text style={styles.intelActionBtnText}>Explore Projects</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* HIGH MONITORING PRIORITY FOCUS CARD */}
              <View style={styles.schemeAttentionCard}>
                <View style={styles.attentionHeader}>
                  <View style={styles.attentionBadge}>
                    <Ionicons name="warning" size={13} color={colors.status.highPriority} />
                    <Text style={styles.attentionBadgeText}>MONITORING PRIORITY FOCUS</Text>
                  </View>
                  <Text style={styles.attentionPriorityText}>HIGH MONITORING PRIORITY</Text>
                </View>

                <View style={styles.attentionTraceBox}>
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>PROJECT</Text>
                    <Text style={styles.traceNodeVal}>PRJ-101</Text>
                    <Text style={styles.traceNodeSub}>Sunrise Rehab</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>LOCATION</Text>
                    <Text style={styles.traceNodeVal}>New Delhi</Text>
                    <Text style={styles.traceNodeSub}>Central Delhi</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>VARIANCE</Text>
                    <Text style={[styles.traceNodeVal, { color: colors.status.highPriority }]}>ALT-2601</Text>
                    <Text style={styles.traceNodeSub}>Headcount 25 vs 42</Text>
                  </View>
                </View>

                <View style={styles.attentionActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.attentionActionBtn}
                    onPress={() => navigation.navigate('ProjectDetails', { projectId: 'PRJ-101' })}
                  >
                    <Text style={styles.attentionActionBtnText}>View Project Intelligence Dossier</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TOP PROJECTS PREVIEWS */}
              <View style={{ marginTop: spacing.base }}>
                <View style={styles.previewColHeader}>
                  <Text style={styles.previewColTitle}>Sanctioned Central Projects</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ProjectExplorer')}>
                    <Text style={styles.seeAllText}>View All ({topProjects.length})</Text>
                  </TouchableOpacity>
                </View>

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
                        <Text style={styles.previewMetricItem}>
                          Progress: <Text style={styles.previewBold}>{proj.progressPercentage ?? 75}%</Text>
                        </Text>
                        <Text style={styles.previewMetricItem}>
                          Sanctioned: <Text style={styles.previewBold}>₹{(proj.sanctionedAmount / 100000).toFixed(0)}L</Text>
                        </Text>
                        <Text style={styles.previewMetricItem}>
                          Reach: <Text style={styles.previewBold}>{proj.beneficiaryReported ?? proj.beneficiaryTarget}/{proj.beneficiaryTarget}</Text>
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* SECTION 7: ANOMALY INTELLIGENCE & EVIDENCE SIGNALS */}
            <View style={styles.intelligenceSectionContainer}>
              <View style={styles.intelHeaderRow}>
                <View style={styles.intelHeaderTitles}>
                  <View style={styles.intelBadgeRow}>
                    <Ionicons name="analytics" size={13} color={colors.brand.primary} />
                    <Text style={styles.intelBadgeText}>AI-ASSISTED MONITORING & DIAGNOSTICS</Text>
                  </View>
                  <Text style={styles.intelSectionTitle}>Anomaly Intelligence & Evidence Signals</Text>
                  <Text style={styles.intelSectionSub}>
                    Cross-source observable telemetry variances, attendance disparities, and audit gaps
                  </Text>
                </View>
                <View style={styles.intelActionButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.intelActionBtn}
                    onPress={() => navigation.navigate('AnomalyExplorer')}
                  >
                    <Ionicons name="analytics" size={14} color={colors.brand.primary} />
                    <Text style={styles.intelActionBtnText}>Explore All Anomalies</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ANOMALY KPI SUMMARY ROW */}
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 100, backgroundColor: colors.neutral.background, borderRadius: borderRadius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.neutral.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text.primary }}>{anomalySummary?.total ?? topAnomalies.length}</Text>
                  <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>Observed Signals</Text>
                </View>
                <View style={{ flex: 1, minWidth: 100, backgroundColor: colors.neutral.background, borderRadius: borderRadius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.neutral.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#991B1B' }}>{anomalySummary?.critical ?? 0}</Text>
                  <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>Critical Review</Text>
                </View>
                <View style={{ flex: 1, minWidth: 100, backgroundColor: colors.neutral.background, borderRadius: borderRadius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.neutral.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.status.highPriority }}>{anomalySummary?.high ?? 1}</Text>
                  <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>High Severity</Text>
                </View>
                <View style={{ flex: 1, minWidth: 100, backgroundColor: colors.neutral.background, borderRadius: borderRadius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.neutral.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.status.warning }}>{anomalySummary?.requiresReview ?? 1}</Text>
                  <Text style={{ fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>Requires Review</Text>
                </View>
              </View>

              {/* PRIORITY MONITORING SIGNAL SPOTLIGHT: ALT-2601 */}
              <View style={styles.schemeAttentionCard}>
                <View style={styles.attentionHeader}>
                  <View style={styles.attentionBadge}>
                    <Ionicons name="warning" size={13} color={colors.status.highPriority} />
                    <Text style={styles.attentionBadgeText}>PRIORITY MONITORING SIGNAL: ALT-2601</Text>
                  </View>
                  <AnomalyConfidenceBadge confidence={85} level="HIGH" />
                </View>

                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>
                  Observed Attendance / CCTV Discrepancy • Sunrise Rehabilitation Centre
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary, marginBottom: spacing.sm, lineHeight: 18 }}>
                  Reported roll-call (42 present) exceeds optical CCTV headcount estimate (25 persons) by 17 participants (40.48% variance). Supported by 4 independent corroborating signals.
                </Text>

                {/* Evidence hierarchy trace */}
                <View style={styles.attentionTraceBox}>
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>ORGANIZATION</Text>
                    <Text style={styles.traceNodeVal}>ORG-SUNRISE</Text>
                    <Text style={styles.traceNodeSub}>Sunrise Rehab</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>PROJECT</Text>
                    <Text style={styles.traceNodeVal}>PRJ-101</Text>
                    <Text style={styles.traceNodeSub}>Deendayal DDRS</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>TELEMETRY</Text>
                    <Text style={[styles.traceNodeVal, { color: colors.status.highPriority }]}>42 vs 25</Text>
                    <Text style={styles.traceNodeSub}>17 Persons Gap</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
                  <View style={styles.traceNode}>
                    <Text style={styles.traceNodeLabel}>SIGNAL ID</Text>
                    <Text style={[styles.traceNodeVal, { color: colors.brand.primary }]}>ALT-2601</Text>
                    <Text style={styles.traceNodeSub}>High Severity</Text>
                  </View>
                </View>

                <View style={styles.attentionActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.attentionActionBtn}
                    onPress={() => navigation.navigate('AnomalyDetails', { anomalyId: 'ALT-2601' })}
                  >
                    <Text style={styles.attentionActionBtnText}>Review ALT-2601 Diagnostic Dossier</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TOP ANOMALY PREVIEW CARDS */}
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
                      <Text style={styles.previewMetricItem}>
                        Status: <Text style={styles.previewBold}>{anom.status}</Text>
                      </Text>
                      <Text style={styles.previewMetricItem}>
                        Confidence: <Text style={styles.previewBold}>{anom.confidence ?? 80}%</Text>
                      </Text>
                      <Text style={styles.previewMetricItem}>
                        Signals: <Text style={styles.previewBold}>{anom.sourceSignals?.length ?? 2}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
    paddingBottom: spacing.xxl,
  },
  liveTelemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 142, 90, 0.18)',
    borderColor: 'rgba(30, 142, 90, 0.5)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  liveTelemetryText: {
    color: '#D1FAE5',
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.6,
  },
  // SECTION 1: ASYMMETRIC METRICS DECK
  deckDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
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
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 20,
  },
  heroAlertSubtitle: {
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
    borderTopColor: '#FEECE9',
    borderTopWidth: 1,
    gap: 4,
  },
  heroAlertActionText: {
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
  },
  telemetryCard: {
    flex: 1,
    minWidth: 140,
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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.5,
  },
  telemetryDenom: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  telemetryTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginTop: 2,
  },
  telemetrySub: {
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
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },

  // QUICK ACTIONS STRIP
  quickActionStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: 4,
    ...shadows.xs,
  },
  quickActionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.brand.primary,
  },

  // SECTION 2: 2-COLUMN SPLIT ROW
  desktopSplitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
    letterSpacing: 0.4,
  },
  sectionHeaderTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  // Immediate Action Incident Card
  focalIncidentCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    padding: spacing.md,
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
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    letterSpacing: 0.5,
  },
  incidentCategory: {
    fontSize: 11,
    color: colors.text.muted,
  },
  incidentTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incidentTimeText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  incidentInstituteBox: {
    marginBottom: spacing.md,
  },
  incidentInstituteName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 24,
  },
  incidentInstituteMeta: {
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
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    gap: 8,
  },
  actionButtonPrimaryText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },

  // Right Column: Telemetry Health Card
  telemetryHealthCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.xs,
  },
  telemetryHealthHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  telemetryHealthBigNum: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -1,
  },
  telemetryHealthBigLabel: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    marginTop: 2,
  },
  healthStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normalBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 5,
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
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  intelSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  intelSectionSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  intelActionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 4,
  },
  intelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(42, 92, 224, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(42, 92, 224, 0.2)',
  },
  intelActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  schemeAttentionCard: {
    backgroundColor: 'rgba(217, 140, 30, 0.04)',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(217, 140, 30, 0.25)',
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
    backgroundColor: 'rgba(196, 64, 44, 0.1)',
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
});

