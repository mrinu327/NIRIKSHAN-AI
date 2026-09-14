/**
 * ProjectDetailsScreen
 * SIH26095 | MoSJE Government Official Monitoring Workflow
 *
 * Dedicated project oversight screen showing attendance, CCTV telemetry,
 * active anomaly alerts, and inspection status for a selected institute.
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
import { StatusBadge, BadgeVariant } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { AlertCard } from '../../components/cards/AlertCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { AttendanceAnalyticsSection } from '../../components/analytics/AttendanceAnalyticsSection';
import { AnomalyAssessmentCard } from '../../components/analytics/AnomalyAssessmentCard';
import { ProjectMonitoringCard } from '../../components/project/ProjectMonitoringCard';
import { ProjectFundingCard } from '../../components/project/ProjectFundingCard';
import { BeneficiarySummaryCard } from '../../components/project/BeneficiarySummaryCard';
import { ProjectStatusBadge } from '../../components/project/ProjectStatusBadge';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { mockAnalyticsService } from '../../services/mock/mockAnalyticsService';
import { mockAnomalyService } from '../../services/mock/mockAnomalyService';
import { mockOfficialService } from '../../services/mock/mockOfficialService';
import { projectService } from '../../services/master/projectService';
import { anomalyService } from '../../services/master/anomalyService';
import { fundingIntelligenceService } from '../../services/analytics/fundingIntelligenceService';
import { beneficiaryIntelligenceService } from '../../services/analytics/beneficiaryIntelligenceService';
import { projectMonitoringEngine } from '../../services/analytics/projectMonitoringEngine';
import { AnomalySeverityBadge } from '../../components/anomaly/AnomalySeverityBadge';
import { AnomalyConfidenceBadge } from '../../components/anomaly/AnomalyConfidenceBadge';
import { masterLookup } from '../../data/master';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types/project';
import { AnomalyAlert } from '../../types/alert';
import { InspectionAssignment } from '../../types/inspection';
import { AttendanceAnalytics } from '../../types/attendance';
import { AnomalyAssessment } from '../../types/anomaly';
import { OfficialProjectDetail } from '../../types/official';
import {
  MasterProject,
  MasterScheme,
  MasterDivision,
  Organization,
  ProjectFundingIntelligence,
  ProjectBeneficiaryIntelligence,
  ProjectMonitoringProfile,
  MasterAnomaly,
} from '../../types/master';
import { SUNRISE_ATTENDANCE } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';


type ProjectDetailsRouteProp = RouteProp<OfficialStackParamList, 'ProjectDetails'>;

export const ProjectDetailsScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<ProjectDetailsRouteProp>();
  const insets = useSafeAreaInsets();
  const { currentRole, switchRole } = useAuth();
  const { projectId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [officialDetail, setOfficialDetail] = useState<OfficialProjectDetail | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [masterProject, setMasterProject] = useState<MasterProject | null>(null);
  const [scheme, setScheme] = useState<MasterScheme | null>(null);
  const [division, setDivision] = useState<MasterDivision | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [funding, setFunding] = useState<ProjectFundingIntelligence | null>(null);
  const [beneficiary, setBeneficiary] = useState<ProjectBeneficiaryIntelligence | null>(null);
  const [monitoringProfile, setMonitoringProfile] = useState<ProjectMonitoringProfile | null>(null);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [inspections, setInspections] = useState<InspectionAssignment[]>([]);
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
  const [assessment, setAssessment] = useState<AnomalyAssessment | null>(null);
  const [projectAnomalies, setProjectAnomalies] = useState<MasterAnomaly[]>([]);

  // Entrance animation
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  // Skeleton pulse animation
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

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

  const loadData = async () => {
    try {
      const [projData, alertsData, inspData, analyticsData, assessData, anomData] = await Promise.all([
        mockOfficialService.getOfficialProjectDetail(projectId),
        mockAlertService.getAlertsByProjectId(projectId),
        mockInspectionService.getInspectionsByProjectId(projectId),
        mockAnalyticsService.getProjectAttendanceAnalytics(projectId),
        mockAnomalyService.getAssessmentForProject(projectId),
        anomalyService.getAnomaliesByProject(projectId),
      ]);
      setOfficialDetail(projData || null);
      setProject(projData || null);
      setAlerts(alertsData);
      setInspections(inspData);
      setAnalytics(analyticsData);
      setAssessment(assessData);
      setProjectAnomalies(anomData);

      // Load Master Data & Intelligence
      const mProject = masterLookup.getProjectById(projectId);
      if (mProject) {
        setMasterProject(mProject);
        setScheme(mProject.schemeId ? masterLookup.getSchemeById(mProject.schemeId) || null : null);
        setDivision(mProject.divisionId ? masterLookup.getDivisionById(mProject.divisionId) || null : null);
        setOrganization(masterLookup.getOrganizationById(mProject.organizationId) || null);
        const f = await fundingIntelligenceService.getProjectFunding(projectId);
        if (f) setFunding(f);
        const b = await beneficiaryIntelligenceService.getProjectBeneficiarySummary(projectId);
        if (b) setBeneficiary(b);
        const mp = projectMonitoringEngine.calculateProjectMonitoringProfile(projectId);
        if (mp) setMonitoringProfile(mp);
      }
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
    const unsubFocus = navigation.addListener('focus', () => {
      loadData();
    });
    const unsubService = mockOfficialService.subscribe(() => {
      loadData();
    });
    return () => {
      unsubFocus();
      unsubService();
    };
  }, [navigation, projectId]);

  useEffect(() => {
    if (!loading && project) {
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
  }, [loading, project]);

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

  // Consistent single source of truth for Sunrise Rehabilitation Centre
  const isSunrise = project?.id === 'PRJ-101' || (project?.name ? project.name.includes('Sunrise') : false);
  const presentCount = isSunrise ? SUNRISE_ATTENDANCE.currentSubmittedAttendance : (project?.attendance.present ?? 0);
  const capacityCount = isSunrise ? SUNRISE_ATTENDANCE.totalBeneficiaries : (project?.attendance.capacity ?? 0);

  // CCTV Telemetry values
  const cctvEstimate = isSunrise
    ? 25
    : project?.cctvStatus === 'Offline'
    ? null
    : Math.round(presentCount * 0.95);
  const variance = isSunrise ? 17 : cctvEstimate !== null ? Math.abs(presentCount - cctvEstimate) : null;

  const getStatusVariant = (): BadgeVariant => {
    if (!project) return 'normal';
    switch (project.status) {
      case 'High Priority':
        return 'highPriority';
      case 'Inspection Due':
        return 'warning';
      case 'Under Review':
        return 'info';
      case 'Normal':
      case 'Compliant':
      default:
        return 'normal';
    }
  };

  // Loading skeleton screen
  if (loading || !project) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

        {/* Integrated Executive Header */}
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
                  Project Monitoring
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Loading facility telemetry...
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skeleton Body */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonIdentityCard}>
            <Animated.View style={[styles.skeletonLine, { width: 280, height: 14, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 140, height: 22, marginTop: 12, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '80%', height: 24, marginTop: 10, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '50%', height: 14, marginTop: 6, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '65%', height: 14, marginTop: 8, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '100%', height: 1, marginTop: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 16, marginTop: 12, opacity: skeletonPulse }]} />
          </View>

          <View style={styles.skeletonSection}>
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 20, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 280, height: 14, marginTop: 6, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonCard, { height: 160, marginTop: 14, opacity: skeletonPulse }]} />
          </View>

          <View style={styles.skeletonSection}>
            <Animated.View style={[styles.skeletonLine, { width: 220, height: 20, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 320, height: 14, marginTop: 6, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonCard, { height: 140, marginTop: 14, opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Top Header with Integrated Native-Style Back Button */}
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
                Project Monitoring
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {project.name} • Oversight
              </Text>
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
          {/* SECTION A: Project Identity Card */}
          <View style={styles.identityCard}>
            <View style={styles.registryWatermark}>
              <Ionicons name="shield-checkmark" size={12} color={colors.brand.primary} />
              <Text style={styles.registryWatermarkText}>CENTRAL REPOSITORY FACILITY RECORD • MoSJE REGISTERED</Text>
            </View>

            <View style={styles.badgeRow}>
              <PriorityBadge priority={project.priority} />
              <StatusBadge label={project.status} variant={getStatusVariant()} size="sm" />
              {officialDetail && (
                <View
                  style={[
                    styles.riskBadge,
                    officialDetail.riskLevel === 'CRITICAL'
                      ? styles.riskCritical
                      : officialDetail.riskLevel === 'ATTENTION_REQUIRED'
                      ? styles.riskAttention
                      : styles.riskHealthy,
                  ]}
                >
                  <Ionicons
                    name={
                      officialDetail.riskLevel === 'CRITICAL'
                        ? 'alert-circle'
                        : officialDetail.riskLevel === 'ATTENTION_REQUIRED'
                        ? 'warning-outline'
                        : 'shield-checkmark'
                    }
                    size={11}
                    color={
                      officialDetail.riskLevel === 'CRITICAL'
                        ? colors.status.highPriority
                        : officialDetail.riskLevel === 'ATTENTION_REQUIRED'
                        ? colors.status.warning
                        : colors.status.normal
                    }
                  />
                  <Text
                    style={[
                      styles.riskBadgeText,
                      {
                        color:
                          officialDetail.riskLevel === 'CRITICAL'
                            ? colors.status.highPriority
                            : officialDetail.riskLevel === 'ATTENTION_REQUIRED'
                            ? colors.status.warning
                            : colors.status.normal,
                      },
                    ]}
                  >
                    {officialDetail.riskLevel.replace('_', ' ')}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectCode}>Scheme Code: {project.code} • {project.category}</Text>

            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.brand.primary} />
              <Text style={styles.locationText}>
                {project.location.address}, {project.location.city}, {project.location.state}
              </Text>
            </View>

            {/* Administrative Hierarchy Traversal */}
            {(organization || scheme || division) && (
              <View style={styles.hierarchyRow}>
                {organization && (
                  <TouchableOpacity
                    style={styles.hierarchyTag}
                    onPress={() =>
                      navigation.navigate('OrganizationDetails', {
                        organizationId: organization.organizationId,
                      })
                    }
                  >
                    <Ionicons name="business-outline" size={12} color={colors.brand.primary} />
                    <Text style={styles.hierarchyTagText} numberOfLines={1}>
                      Org: {organization.name}
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.text.muted} />
                  </TouchableOpacity>
                )}
                {scheme && (
                  <TouchableOpacity
                    style={styles.hierarchyTag}
                    onPress={() =>
                      navigation.navigate('SchemeDetails', { schemeId: scheme.schemeId })
                    }
                  >
                    <Ionicons name="ribbon-outline" size={12} color={colors.brand.primary} />
                    <Text style={styles.hierarchyTagText} numberOfLines={1}>
                      Scheme: {scheme.code}
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.text.muted} />
                  </TouchableOpacity>
                )}
                {division && (
                  <TouchableOpacity
                    style={styles.hierarchyTag}
                    onPress={() =>
                      navigation.navigate('DivisionDetails', { divisionId: division.divisionId })
                    }
                  >
                    <Ionicons name="library-outline" size={12} color={colors.brand.primary} />
                    <Text style={styles.hierarchyTagText} numberOfLines={1}>
                      Div: {division.code}
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.text.muted} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.complianceRow}>
              <Text style={styles.complianceLabel}>Compliance Health Index:</Text>
              <Text
                style={[
                  styles.complianceScore,
                  { color: project.complianceScore < 75 ? colors.status.highPriority : colors.status.normal },
                ]}
              >
                {project.complianceScore} / 100
              </Text>
            </View>
          </View>

          {/* SECTION A1: NIRIKSHAN AI Project Monitoring Profile */}
          {monitoringProfile && (
            <View style={{ marginBottom: spacing.md }}>
              <ProjectMonitoringCard profile={monitoringProfile} />
            </View>
          )}

          {/* SECTION A2: Grant & Financial Intelligence */}
          {funding && (
            <View style={{ marginBottom: spacing.md }}>
              <ProjectFundingCard funding={funding} />
            </View>
          )}

          {/* SECTION A3: Beneficiary Roll-Call & Optical Verification */}
          {beneficiary && (
            <View style={{ marginBottom: spacing.md }}>
              <BeneficiarySummaryCard beneficiary={beneficiary} />
            </View>
          )}

          {/* SECTION B: Attendance Analytics Layer */}
          <SectionHeader
            title="Attendance Analytics"
            subtitle="Roll-call turnout, CCTV estimated occupancy & historical variance"
          />


          {analytics && (
            <AttendanceAnalyticsSection
              analytics={analytics}
              onViewDetails={() =>
                navigation.navigate('AttendanceAnalytics', { projectId: project.id })
              }
            />
          )}

          {/* SECTION C: AI Anomaly Assessment & Active Telemetry Signals */}
          <SectionHeader
            title="AI Anomaly Assessment & Signals"
            subtitle="Multi-signal explainable decision support & observable variances"
          />

          {projectAnomalies.length > 0 && (
            <View style={{ marginBottom: spacing.sm }}>
              {projectAnomalies.map(anom => (
                <TouchableOpacity
                  key={anom.anomalyId || anom.id}
                  activeOpacity={0.8}
                  style={styles.activeAnomalyCard}
                  onPress={() =>
                    navigation.navigate('AnomalyDetails', {
                      anomalyId: anom.anomalyId || anom.id,
                    })
                  }
                >
                  <View style={styles.activeAnomalyTop}>
                    <View style={styles.activeAnomalyCodeRow}>
                      <Ionicons name="warning" size={14} color={colors.status.highPriority} />
                      <Text style={styles.activeAnomalyId}>{anom.anomalyId || anom.id}</Text>
                    </View>
                    <AnomalySeverityBadge severity={anom.severity} compact />
                  </View>
                  <Text style={styles.activeAnomalyTitle}>{anom.title || anom.type}</Text>
                  <Text style={styles.activeAnomalyDesc} numberOfLines={2}>
                    {anom.explanation || anom.description}
                  </Text>
                  <View style={styles.activeAnomalyFooter}>
                    <AnomalyConfidenceBadge
                      confidence={anom.confidence ?? 85}
                      level={anom.confidenceLevel}
                    />
                    <View style={styles.viewDossierLink}>
                      <Text style={styles.viewDossierText}>View Diagnostic Dossier</Text>
                      <Ionicons name="arrow-forward" size={12} color={colors.brand.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {assessment && (
            <AnomalyAssessmentCard
              assessment={assessment}
              onReview={() =>
                navigation.navigate('AnomalyDetail', { projectId: project.id })
              }
            />
          )}

          {/* SECTION D: CCTV Telemetry */}
          <SectionHeader
            title="CCTV Telemetry & Edge Stream"
            subtitle="Real-time camera feed status and entrance telemetry"
          />

          <View style={styles.cctvCard}>
            <View style={styles.cctvHeader}>
              <View style={styles.cctvStatusPill}>
                <Ionicons
                  name={project.cctvStatus === 'Offline' ? 'videocam-off' : 'videocam'}
                  size={16}
                  color={project.cctvStatus === 'Offline' ? colors.status.highPriority : colors.status.normal}
                />
                <Text style={styles.cctvStatusLabel}>CCTV Status: {project.cctvStatus}</Text>
              </View>
              <Text style={styles.cctvLastUpdate}>Edge Stream: Synced Today, 09:30 AM</Text>
            </View>

            <View style={styles.cctvMetricGrid}>
              <View style={styles.cctvMetricItem}>
                <Text style={styles.cctvMetricLabel}>Feed Estimate</Text>
                <Text style={styles.cctvMetricValue}>{cctvEstimate !== null ? cctvEstimate : 'N/A'}</Text>
                <Text style={styles.cctvMetricSub}>Camera entrance count</Text>
              </View>

              <View style={styles.dividerVertical} />

              <View style={styles.cctvMetricItem}>
                <Text style={styles.cctvMetricLabel}>Submitted Count</Text>
                <Text style={styles.cctvMetricValue}>{presentCount}</Text>
                <Text style={styles.cctvMetricSub}>Reported roll-call</Text>
              </View>

              <View style={styles.dividerVertical} />

              <View style={styles.cctvMetricItem}>
                <Text style={styles.cctvMetricLabel}>Discrepancy</Text>
                <Text
                  style={[
                    styles.cctvMetricValue,
                    { color: variance && variance > 5 ? colors.status.highPriority : colors.status.normal },
                  ]}
                >
                  {variance ? `+${variance}` : '0'}
                </Text>
                <Text style={styles.cctvMetricSub}>Telemetry variance</Text>
              </View>
            </View>

            {/* Neutral Diagnostic Phrasing Banner */}
            <View style={styles.diagnosticBanner}>
              <Ionicons name="information-circle" size={18} color={colors.brand.primary} />
              <Text style={styles.diagnosticText}>
                <Text style={styles.diagnosticBold}>Estimated Telemetry Discrepancy: </Text>
                The difference (+{variance || 0}) represents an automated edge screening indicator. This signal does NOT confirm fraud or non-compliance; it indicates an unverified variance requiring official human review.
              </Text>
            </View>
          </View>

          {/* SECTION D2: Geofence & Boundary Telemetry */}
          <SectionHeader
            title="Geofence & Boundary Oversight"
            subtitle="Configured 100m perimeter and active edge gateway position"
          />

          <View style={styles.geofenceCard}>
            <View style={styles.geofenceHeader}>
              <View style={styles.geofenceBadge}>
                <Ionicons name="location" size={13} color={colors.status.normal} />
                <Text style={styles.geofenceBadgeText}>
                  {officialDetail?.geofence.status ?? 'Inside Perimeter'}
                </Text>
              </View>
              <Text style={styles.geofenceLastUpdate}>
                Edge GPS: {officialDetail?.geofence.lastUpdated ?? '09:30 AM Today'}
              </Text>
            </View>

            <View style={styles.geofenceGrid}>
              <View style={styles.geofenceItem}>
                <Text style={styles.geofenceLabel}>Configured Radius</Text>
                <Text style={styles.geofenceValue}>100m</Text>
                <Text style={styles.geofenceSub}>Standard perimeter</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.geofenceItem}>
                <Text style={styles.geofenceLabel}>Offset from Center</Text>
                <Text style={styles.geofenceValue}>
                  {officialDetail?.geofence.distanceFromCenterMeters ?? 24}m
                </Text>
                <Text style={styles.geofenceSub}>From registered plot</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.geofenceItem}>
                <Text style={styles.geofenceLabel}>Boundary Margin</Text>
                <Text style={[styles.geofenceValue, { color: colors.status.normal }]}>
                  {officialDetail?.geofence.distanceFromBoundaryMeters ?? 76}m Inside
                </Text>
                <Text style={styles.geofenceSub}>Safe operational zone</Text>
              </View>
            </View>

            <View style={styles.geofenceNotice}>
              <Ionicons name="shield-checkmark-outline" size={15} color={colors.brand.primary} />
              <Text style={styles.geofenceNoticeText}>
                Remote oversight telemetry only. Field inspections mandate on-site physical GPS verification within 100m before checklist unlock.
              </Text>
            </View>
          </View>

          {/* SECTION E: Facility Anomaly Alerts */}
          <SectionHeader
            title="Facility Anomaly Alerts"
            subtitle="Flagged variances requiring official review (Tap to review)"
            badgeCount={alerts.length}
          />

          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onPress={() => navigation.navigate('AlertReview', { alertId: alert.id })}
              />
            ))
          ) : (
            <View style={styles.emptyAlertsBox}>
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.status.normal} />
              <Text style={styles.emptyAlertsText}>No active discrepancy alerts logged for this facility.</Text>
            </View>
          )}

          {/* SECTION F: Inspection Status */}
          <SectionHeader
            title="Field Inspection Oversight"
            subtitle="On-site physical audits and verification status"
          />

          <View style={styles.inspectionCard}>
            <View style={styles.inspectionRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.brand.primary} />
              <View style={styles.inspectionInfo}>
                <Text style={styles.inspectionLabel}>Last On-Site Inspection</Text>
                <Text style={styles.inspectionValue}>{project.lastInspectionDate || 'Not recorded'}</Text>
              </View>
            </View>

            <View style={styles.inspectionRow}>
              <Ionicons name="time-outline" size={18} color={colors.status.warning} />
              <View style={styles.inspectionInfo}>
                <Text style={styles.inspectionLabel}>Next Inspection Due</Text>
                <Text style={styles.inspectionValue}>{project.nextInspectionDueDate || 'Schedule pending'}</Text>
              </View>
            </View>

            {inspections.length > 0 ? (
              <View style={styles.activeInspectionBanner}>
                <Ionicons name="flash" size={16} color={colors.status.highPriority} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.activeInspectionTitle}>
                    {inspections[0].type} ({inspections[0].status})
                  </Text>
                  <Text style={styles.activeInspectionSub}>
                    Assigned Officer: {inspections[0].assignedOfficerName} • Due: {inspections[0].dueDate}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noActiveInspectionBanner}>
                <Ionicons name="shield-outline" size={16} color={colors.text.muted} />
                <Text style={styles.noActiveInspectionText}>No pending field audit currently scheduled.</Text>
              </View>
            )}
          </View>

          {/* SECTION F2: Recent Institutional Activity */}
          <SectionHeader
            title="Institutional Activity Ledger"
            subtitle="Audit log of inspections, telemetry alerts & roll-call submissions"
            badgeCount={officialDetail?.recentActivity.length ?? 0}
          />

          <View style={styles.activityCard}>
            {(officialDetail?.recentActivity ?? []).map((act, index) => (
              <View
                key={act.id}
                style={[
                  styles.activityRow,
                  index !== (officialDetail?.recentActivity.length ?? 0) - 1 && styles.activityRowBorder,
                ]}
              >
                <View style={styles.activityIconBox}>
                  <Ionicons
                    name={
                      act.type === 'ALERT'
                        ? 'alert-circle'
                        : act.type === 'INSPECTION'
                        ? 'clipboard'
                        : act.type === 'ATTENDANCE_SUBMISSION'
                        ? 'people'
                        : 'document-text'
                    }
                    size={16}
                    color={
                      act.type === 'ALERT'
                        ? colors.status.warning
                        : act.type === 'INSPECTION'
                        ? colors.brand.primary
                        : colors.status.normal
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.activityHeaderRow}>
                    <Text style={styles.activityTitle}>{act.title}</Text>
                    <Text style={styles.activityTime}>{act.timestamp}</Text>
                  </View>
                  {act.notes ? <Text style={styles.activityNotes}>{act.notes}</Text> : null}
                  <Text style={styles.activityStatusTag}>Status: {act.status}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* SECTION G: Governance Actions */}
          <View style={styles.actionSection}>
            <PrimaryButton
              title="Initiate Surprise Inspection"
              iconName="flash"
              onPress={() =>
                navigation.navigate('InitiateInspection', {
                  projectId: project.id,
                  alertId: alerts[0]?.id,
                })
              }
              style={styles.initiateButton}
            />
            <SecondaryButton
              title="Review AI Anomaly Assessment"
              iconName="hardware-chip-outline"
              onPress={() =>
                navigation.navigate('AnomalyDetail', { projectId: project.id })
              }
              style={{ marginTop: 10 }}
            />
            <SecondaryButton
              title="View In-Depth Attendance Analytics"
              iconName="stats-chart"
              onPress={() =>
                navigation.navigate('AttendanceAnalytics', { projectId: project.id })
              }
              style={{ marginTop: 10 }}
            />
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
    maxWidth: 1200,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  roleBadgeText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
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

  /* Scroll Body */
  scrollContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: 90,
  },

  /* Section A: Project Identity Card */
  identityCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  registryWatermark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  registryWatermarkText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.6,
    marginLeft: 5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  projectName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 26,
    marginTop: 4,
  },
  projectCode: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.secondary,
    marginLeft: 6,
    flex: 1,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  complianceLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  complianceScore: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  /* Section D: CCTV Card */
  cctvCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  cctvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  cctvStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  cctvStatusLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: 6,
  },
  cctvLastUpdate: {
    fontSize: 10,
    color: colors.text.muted,
  },
  cctvMetricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  cctvMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  cctvMetricLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginBottom: 2,
  },
  cctvMetricValue: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  cctvMetricSub: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: colors.neutral.border,
  },
  diagnosticBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.brand.primary,
  },
  diagnosticText: {
    fontSize: typography.sizes.xs,
    color: colors.brand.navyLight,
    lineHeight: 18,
    marginLeft: spacing.xs,
    flex: 1,
  },
  diagnosticBold: {
    fontWeight: typography.weights.bold,
  },

  /* Section E: Empty Alerts Box */
  emptyAlertsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  emptyAlertsText: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },

  /* Section F: Inspection Card */
  inspectionCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  inspectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inspectionInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  inspectionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  inspectionValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  activeInspectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.highPriority,
  },
  activeInspectionTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
  },
  activeInspectionSub: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2,
  },
  noActiveInspectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  noActiveInspectionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: 6,
  },

  /* Risk Badge */
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    gap: 4,
  },
  riskHealthy: {
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normal + '40',
  },
  riskAttention: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warning + '40',
  },
  riskCritical: {
    backgroundColor: colors.status.highPriorityLight,
    borderColor: colors.status.highPriority + '40',
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.3,
  },

  /* Geofence Card */
  geofenceCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  geofenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  geofenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.normalLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    gap: 4,
  },
  geofenceBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
  },
  geofenceLastUpdate: {
    fontSize: 10,
    color: colors.text.muted,
  },
  geofenceGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  geofenceItem: {
    alignItems: 'center',
    flex: 1,
  },
  geofenceLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginBottom: 2,
  },
  geofenceValue: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  geofenceSub: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 2,
  },
  geofenceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.brand.accent,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
    marginTop: 4,
  },
  geofenceNoticeText: {
    fontSize: 11,
    color: colors.brand.navyDark,
    flex: 1,
    lineHeight: 16,
  },

  /* Activity Card */
  activityCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  activityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  activityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  activityTime: {
    fontSize: 10,
    color: colors.text.muted,
    marginLeft: 6,
  },
  activityNotes: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
    marginTop: 2,
  },
  activityStatusTag: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
    marginTop: 4,
  },

  /* Section G: Action Buttons */
  actionSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  initiateButton: {
    backgroundColor: colors.status.highPriority,
  },

  /* Skeleton Loading */
  skeletonIdentityCard: {
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
  hierarchyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  hierarchyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    gap: 4,
    maxWidth: '100%',
  },
  hierarchyTagText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
    maxWidth: 220,
  },
  activeAnomalyCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.status.highPriorityBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.highPriority,
    marginBottom: spacing.xs,
    ...shadows.xs,
  },
  activeAnomalyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeAnomalyCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeAnomalyId: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  activeAnomalyTitle: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 3,
  },
  activeAnomalyDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  activeAnomalyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.surfaceSubtle,
  },
  viewDossierLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewDossierText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
});

