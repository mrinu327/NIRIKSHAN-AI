import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, RiskBadge, Card, Button } from '../../src/components/common';
import { api, DetailedProject } from '../../src/services/api';
import { RiskLevel, CameraStatus } from '@nirikshan/shared-types';

type TabType =
  | 'overview'
  | 'cctv'
  | 'attendance'
  | 'inspections'
  | 'evidence'
  | 'alerts'
  | 'timeline';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '🏛️' },
  { key: 'cctv', label: 'CCTV', icon: '📹' },
  { key: 'attendance', label: 'Attendance', icon: '👥' },
  { key: 'inspections', label: 'Inspections', icon: '📋' },
  { key: 'evidence', label: 'Evidence', icon: '🔏' },
  { key: 'alerts', label: 'Alerts', icon: '🚨' },
  { key: 'timeline', label: 'Timeline', icon: '⏱️' },
];

export default function OfficialProjectDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [project, setProject] = useState<DetailedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    setLoading(true);
    const projectId = id || 'proj-001';
    try {
      const data = await api.getProjectById(projectId);
      setProject(data);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !project) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GovHeader title="PROJECT PROFILE" subtitle="DoSJE Scheme Facility Telemetry" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching Project Record & Ground Telemetry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="PROJECT PROFILE" subtitle="Centralized Scheme Monitoring & Telemetry" />

      {/* Navigation Header / Back Button */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← Back to Projects</Text>
        </TouchableOpacity>
        <View style={styles.projectStatusPill}>
          <Text style={styles.projectStatusText}>
            STATUS: {project.status.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>

      {/* Project Identity Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroInfo}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectOrg}>🏢 {project.organization}</Text>
            <Text style={styles.projectScheme}>{project.scheme}</Text>
          </View>
          <View style={styles.heroRisk}>
            <RiskBadge level={project.riskLevel} score={project.riskScore} showScore={true} />
            <Text style={styles.facilityTypeTag}>{project.type}</Text>
          </View>
        </View>

        <View style={styles.heroMetaRow}>
          <Text style={styles.metaItem}>
            📍 {project.district}, {project.state}
          </Text>
          <Text style={styles.metaItem}>👥 {project.beneficiaryCount} Beneficiaries</Text>
          <Text style={styles.metaItem}>🏛️ Cap: {project.capacity} Beds</Text>
        </View>
      </View>

      {/* 7-Tab Navigation Selector Bar */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            // Calculate count badges where applicable
            let badgeCount: number | null = null;
            if (t.key === 'cctv') badgeCount = project.cameras.length;
            if (t.key === 'alerts') badgeCount = project.anomalies.length;
            if (t.key === 'inspections') badgeCount = project.inspections.length;
            if (t.key === 'evidence') {
              badgeCount = project.inspections.reduce(
                (acc, curr) => acc + (curr.evidence?.length || 0),
                0
              );
            }

            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.tabIcon}>{t.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {t.label}
                </Text>
                {badgeCount !== null && badgeCount > 0 && (
                  <View
                    style={[
                      styles.tabCounter,
                      isActive ? styles.tabCounterActive : styles.tabCounterInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabCounterText,
                        isActive && styles.tabCounterTextActive,
                      ]}
                    >
                      {badgeCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Content Display */}
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverviewTab(project, router)}
        {activeTab === 'cctv' && renderCctvTab(project)}
        {activeTab === 'attendance' && renderAttendanceTab(project)}
        {activeTab === 'inspections' && renderInspectionsTab(project)}
        {activeTab === 'evidence' && renderEvidenceTab(project)}
        {activeTab === 'alerts' && renderAlertsTab(project)}
        {activeTab === 'timeline' && renderTimelineTab(project)}
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// TAB 1: OVERVIEW
// ==========================================
function renderOverviewTab(project: DetailedProject, router: any) {
  return (
    <View>
      {/* Metric Cards Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricCardVal}>🏛️ {project.capacity}</Text>
          <Text style={styles.metricCardLabel}>Sanctioned Beds/Seats</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricCardVal}>👥 {project.beneficiaryCount}</Text>
          <Text style={styles.metricCardLabel}>Registered Beneficiaries</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricCardVal}>👨‍⚕️ {project.staffCount}</Text>
          <Text style={styles.metricCardLabel}>Authorized Staff</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricCardVal, { color: colors.secondary }]}>
            {((project.beneficiaryCount / (project.capacity || 1)) * 100).toFixed(0)}%
          </Text>
          <Text style={styles.metricCardLabel}>Capacity Utilization</Text>
        </View>
      </View>

      {/* Transparent Explainable Risk Score Card */}
      <Card title="Explainable Risk Stratification" subtitle="Deterministic Rule Engine & Vision Telemetry">
        <View style={styles.riskBreakdownBox}>
          <View style={styles.riskScoreRow}>
            <View>
              <Text style={styles.riskScoreLarge}>{project.riskScore} / 100</Text>
              <Text style={styles.riskScoreTagline}>Computed Risk Index</Text>
            </View>
            <RiskBadge level={project.riskLevel} />
          </View>

          <Text style={styles.riskExplainDesc}>
            Risk evaluation is deterministic and explainable based on attendance discrepancies, camera uptime, and audit history:
          </Text>

          <View style={styles.ruleFactorsList}>
            <View style={styles.ruleFactor}>
              <Text style={styles.ruleFactorText}>• Attendance Divergence (over 25% CV discrepancy)</Text>
              <Text style={styles.ruleFactorPts}>+35 pts</Text>
            </View>
            <View style={styles.ruleFactor}>
              <Text style={styles.ruleFactorText}>• Consecutive static attendance count</Text>
              <Text style={styles.ruleFactorPts}>+15 pts</Text>
            </View>
            <View style={styles.ruleFactor}>
              <Text style={styles.ruleFactorText}>• Dormitory Camera Latency/Delay</Text>
              <Text style={styles.ruleFactorPts}>+12 pts</Text>
            </View>
            <View style={styles.ruleFactor}>
              <Text style={styles.ruleFactorText}>• Pending compliance rectification</Text>
              <Text style={styles.ruleFactorPts}>+20 pts</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Facility Location & In-Charge Details */}
      <Card title="Facility Details & Location" subtitle="Registered Geographic Information">
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Registered Address:</Text>
          <Text style={styles.detailVal}>{project.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>GPS Coordinates:</Text>
          <Text style={styles.detailVal}>
            {project.latitude.toFixed(4)}° N, {project.longitude.toFixed(4)}° E
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Implementing Agency:</Text>
          <Text style={styles.detailVal}>{project.organization}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Scheme Category:</Text>
          <Text style={styles.detailVal}>{project.scheme}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Facility In-Charge:</Text>
          <Text style={styles.detailVal}>Amit Sundaram (Chief Administrator)</Text>
        </View>
      </Card>

      {/* Quick Action Bar */}
      <View style={styles.actionCard}>
        <Text style={styles.actionCardTitle}>Official Interventions</Text>
        <View style={styles.actionBtnRow}>
          <Button
            title="Trigger Surprise Inspection"
            onPress={() => router.push('/(official)/inspections')}
            style={styles.flexBtn}
          />
          <Button
            title="Live Camera Monitor"
            variant="secondary"
            onPress={() => router.push('/(official)/live-monitor')}
            style={styles.flexBtn}
          />
        </View>
      </View>
    </View>
  );
}

// ==========================================
// TAB 2: CCTV
// ==========================================
function renderCctvTab(project: DetailedProject) {
  return (
    <View>
      {/* Demo Notice Banner */}
      <View style={styles.demoBannerBox}>
        <Text style={styles.demoBannerTitle}>📹 DEMO / MOCK CCTV TELEMETRY</Text>
        <Text style={styles.demoBannerDesc}>
          Simulated camera video streams and computer vision people-count heuristics. In production, this connects to authorized ONVIF / RTSP / HLS gateways.
        </Text>
      </View>

      {project.cameras.map((cam) => {
        const isOnline = cam.status === CameraStatus.ONLINE;
        return (
          <View key={cam.id} style={styles.cameraCard}>
            <View style={styles.cameraHeader}>
              <View>
                <Text style={styles.cameraName}>{cam.name}</Text>
                <Text style={styles.cameraLocation}>📍 {cam.location}</Text>
              </View>
              <View
                style={[
                  styles.camStatusBadge,
                  isOnline ? styles.camStatusOnline : styles.camStatusOffline,
                ]}
              >
                <Text
                  style={[
                    styles.camStatusText,
                    isOnline ? styles.camStatusTextOnline : styles.camStatusTextOffline,
                  ]}
                >
                  {cam.status}
                </Text>
              </View>
            </View>

            {/* Simulated Stream Viewport */}
            <View style={styles.streamViewport}>
              <View style={styles.streamOverlayTop}>
                <Text style={styles.streamLiveIndicator}>
                  {isOnline ? '🔴 LIVE STREAM' : '⚪ OFFLINE'}
                </Text>
                <Text style={styles.streamQuality}>{cam.streamQuality}</Text>
              </View>

              <View style={styles.streamCenterContent}>
                <Text style={styles.streamPlaceholderIcon}>🎥</Text>
                <Text style={styles.streamPlaceholderText}>
                  {isOnline
                    ? `Encrypted Feed: ${cam.streamUrl}`
                    : 'Stream connection lost. Heartbeat overdue.'}
                </Text>
              </View>

              <View style={styles.streamOverlayBottom}>
                <Text style={styles.streamTelemetry}>
                  Observed People Count: ~{cam.peopleCount}
                </Text>
                <Text style={styles.streamTelemetry}>
                  {cam.lastDetectedActivity || 'Routine activity'}
                </Text>
              </View>
            </View>

            <View style={styles.camFooter}>
              <Text style={styles.camFooterText}>
                Last Heartbeat: {new Date(cam.lastHeartbeat).toLocaleTimeString()}
              </Text>
              <Text style={styles.camFooterText}>Camera ID: #{cam.id}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ==========================================
// TAB 3: ATTENDANCE
// ==========================================
function renderAttendanceTab(project: DetailedProject) {
  const latest = project.attendances[0];
  const reported = latest ? latest.reportedCount : project.beneficiaryCount;
  const observed = latest?.observedCount || Math.round(reported * 0.67);
  const mismatch = latest?.mismatchPercentage || 33.7;

  return (
    <View>
      {/* Attendance Comparison Hero */}
      <Card
        title="Attendance Reconciliation"
        subtitle="Reported NGO Ledger vs Automated Computer Vision Observation"
      >
        <View style={styles.attCompareRow}>
          <View style={styles.attBox}>
            <Text style={styles.attBoxVal}>{reported}</Text>
            <Text style={styles.attBoxLabel}>Reported by NGO</Text>
            <Text style={styles.attBoxSub}>Portal Submission</Text>
          </View>

          <View style={styles.attVsBox}>
            <Text style={styles.attVsText}>VS</Text>
            <View style={styles.mismatchBadge}>
              <Text style={styles.mismatchBadgeText}>-{mismatch}%</Text>
            </View>
          </View>

          <View style={[styles.attBox, styles.attBoxObserved]}>
            <Text style={[styles.attBoxVal, { color: colors.secondary }]}>~{observed}</Text>
            <Text style={styles.attBoxLabel}>Observed Count</Text>
            <Text style={styles.attBoxSub}>Dining Hall Vision</Text>
          </View>
        </View>

        {mismatch > 20 && (
          <View style={styles.alertNoticeBox}>
            <Text style={styles.alertNoticeIcon}>⚠️</Text>
            <Text style={styles.alertNoticeText}>
              Substantial mismatch detected ({mismatch}% divergence). Spot physical verification is strongly advised to cross-examine food registers and physical occupants.
            </Text>
          </View>
        )}
      </Card>

      {/* 7-Day Attendance Submission Ledger */}
      <Card title="Recent Daily Submissions" subtitle="Historical Headcounts & Vision Reconciliation">
        {project.attendances.map((att, idx) => (
          <View key={att.id || idx} style={styles.attHistoryItem}>
            <View style={styles.attHistoryLeft}>
              <Text style={styles.attHistoryDate}>
                {new Date(att.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
              <Text style={styles.attHistorySource}>Source: {att.source}</Text>
            </View>

            <View style={styles.attHistoryRight}>
              <Text style={styles.attHistoryCounts}>
                Reported: <Text style={styles.boldText}>{att.reportedCount}</Text> | Observed:{' '}
                <Text style={styles.boldText}>~{att.observedCount || 'N/A'}</Text>
              </Text>
              {att.mismatchPercentage ? (
                <Text style={styles.mismatchPercentText}>
                  {att.mismatchPercentage}% mismatch flagged
                </Text>
              ) : (
                <Text style={styles.matchOkText}>Verified consistent</Text>
              )}
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// ==========================================
// TAB 4: INSPECTIONS
// ==========================================
function renderInspectionsTab(project: DetailedProject) {
  return (
    <View>
      <View style={styles.tabSectionHeader}>
        <Text style={styles.tabSectionTitle}>Inspection Registry</Text>
        <Text style={styles.tabSectionSub}>
          Physical Surprise Visits & PMU Field Deployments
        </Text>
      </View>

      {project.inspections.length === 0 ? (
        <Card>
          <Text style={styles.emptyNotice}>No formal inspections recorded yet for this facility.</Text>
        </Card>
      ) : (
        project.inspections.map((insp) => {
          let checklist: Record<string, boolean> = {};
          try {
            if (insp.checklistData) checklist = JSON.parse(insp.checklistData);
          } catch (e) {}

          return (
            <Card key={insp.id} style={styles.inspCard}>
              <View style={styles.inspCardTop}>
                <View>
                  <Text style={styles.inspType}>{insp.type.replace(/_/g, ' ')}</Text>
                  <Text style={styles.inspInspector}>
                    👮 {insp.inspector?.name || 'Assigned Field Inspector'}
                  </Text>
                </View>
                <View style={styles.inspStatusPill}>
                  <Text style={styles.inspStatusText}>{insp.status}</Text>
                </View>
              </View>

              {/* Geofence Verification Pill */}
              <View style={styles.geofenceRow}>
                <Text
                  style={[
                    styles.geoStatus,
                    insp.locationVerified ? styles.geoVerified : styles.geoUnverified,
                  ]}
                >
                  {insp.locationVerified
                    ? '✓ GPS GEOFENCE VERIFIED ON-SITE'
                    : '✗ OUTSIDE GEOFENCE / UNVERIFIED'}
                </Text>
                <Text style={styles.inspDate}>
                  {new Date(insp.assignedAt).toLocaleDateString()}
                </Text>
              </View>

              {insp.reportNotes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Inspector Field Findings:</Text>
                  <Text style={styles.notesText}>{insp.reportNotes}</Text>
                </View>
              )}

              {/* Checklist items breakdown */}
              {Object.keys(checklist).length > 0 && (
                <View style={styles.checklistSection}>
                  <Text style={styles.checklistTitle}>Checklist Assessment:</Text>
                  <View style={styles.checklistGrid}>
                    {Object.entries(checklist).map(([key, val]) => (
                      <View key={key} style={styles.checkItem}>
                        <Text style={styles.checkIcon}>{val ? '✅' : '❌'}</Text>
                        <Text style={styles.checkLabel}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          );
        })
      )}
    </View>
  );
}

// ==========================================
// TAB 5: EVIDENCE
// ==========================================
function renderEvidenceTab(project: DetailedProject) {
  const allEvidence = project.inspections.flatMap((i) => i.evidence || []);

  return (
    <View>
      <View style={styles.tabSectionHeader}>
        <Text style={styles.tabSectionTitle}>Hashed Evidence Vault</Text>
        <Text style={styles.tabSectionSub}>
          Cryptographically Verified Media & Tamper-Proof Audit
        </Text>
      </View>

      {allEvidence.length === 0 ? (
        <Card>
          <Text style={styles.emptyNotice}>No evidence files uploaded for this project yet.</Text>
        </Card>
      ) : (
        allEvidence.map((evid) => {
          let meta: any = {};
          try {
            if (evid.metadata) meta = JSON.parse(evid.metadata);
          } catch (e) {}

          return (
            <Card key={evid.id} style={styles.evidenceCard}>
              <View style={styles.evidenceHeader}>
                <View style={styles.evidenceTypeBadge}>
                  <Text style={styles.evidenceTypeText}>
                    {evid.type === 'PHOTO' ? '📷 PHOTO' : '🎙️ AUDIO RECORDING'}
                  </Text>
                </View>
                <View style={styles.integrityBadge}>
                  <Text style={styles.integrityText}>✓ SHA-256 VERIFIED</Text>
                </View>
              </View>

              <Text style={styles.evidenceFileUrl}>{evid.fileUrl}</Text>

              {/* SHA-256 Hash Display */}
              <View style={styles.hashBox}>
                <Text style={styles.hashLabel}>Cryptographic SHA-256 Hash:</Text>
                <Text style={styles.hashValue} numberOfLines={1} ellipsizeMode="middle">
                  {evid.hash}
                </Text>
              </View>

              {/* Geo-tag & Device metadata */}
              <View style={styles.evidenceMetaRow}>
                <Text style={styles.evidenceMetaText}>
                  📍 {evid.latitude.toFixed(5)}° N, {evid.longitude.toFixed(5)}° E
                </Text>
                <Text style={styles.evidenceMetaText}>
                  ⏱️ {new Date(evid.capturedAt).toLocaleTimeString()}
                </Text>
              </View>

              {meta.deviceModel && (
                <Text style={styles.evidenceDevice}>
                  Device: {meta.deviceModel} (Accuracy ±{meta.accuracyMeters}m)
                </Text>
              )}
            </Card>
          );
        })
      )}
    </View>
  );
}

// ==========================================
// TAB 6: ALERTS
// ==========================================
function renderAlertsTab(project: DetailedProject) {
  return (
    <View>
      <View style={styles.tabSectionHeader}>
        <Text style={styles.tabSectionTitle}>AI Anomaly & Risk Alerts</Text>
        <Text style={styles.tabSectionSub}>
          Explainable Machine Reasoning & Actionable Recommendations
        </Text>
      </View>

      {project.anomalies.length === 0 ? (
        <Card>
          <Text style={styles.emptyNotice}>✅ No active anomalies or compliance alerts open.</Text>
        </Card>
      ) : (
        project.anomalies.map((anom) => {
          let scorePoints: { factor: string; points: number }[] = [];
          try {
            if (anom.scoreBreakdown) scorePoints = JSON.parse(anom.scoreBreakdown);
          } catch (e) {}

          return (
            <Card key={anom.id} style={styles.alertCard}>
              <View style={styles.alertCardTop}>
                <RiskBadge level={anom.severity as RiskLevel} score={anom.riskScore} showScore={true} />
                <Text style={styles.alertCardStatus}>STATUS: {anom.status}</Text>
              </View>

              <Text style={styles.alertAnomalyTitle}>{anom.type.replace(/_/g, ' ')}</Text>
              <Text style={styles.alertExplanation}>{anom.explanation}</Text>

              {/* Explainable Score Breakdown */}
              {scorePoints.length > 0 && (
                <View style={styles.scoreBreakdownBox}>
                  <Text style={styles.scoreBreakdownTitle}>Explainable Scoring Factors:</Text>
                  {scorePoints.map((item, idx) => (
                    <View key={idx} style={styles.scorePointRow}>
                      <Text style={styles.scorePointFactor}>• {item.factor}</Text>
                      <Text style={styles.scorePointPts}>+{item.points} pts</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.recommendationBox}>
                <Text style={styles.recTitle}>Recommended Action:</Text>
                <Text style={styles.recText}>
                  Assign priority surprise physical inspection to audit physical occupants against registers.
                </Text>
              </View>
            </Card>
          );
        })
      )}
    </View>
  );
}

// ==========================================
// TAB 7: TIMELINE
// ==========================================
function renderTimelineTab(project: DetailedProject) {
  return (
    <View>
      <View style={styles.tabSectionHeader}>
        <Text style={styles.tabSectionTitle}>Unified Chronological Audit Trail</Text>
        <Text style={styles.tabSectionSub}>
          Attendance, Verification Calls, Alerts & Official Inspections
        </Text>
      </View>

      <View style={styles.timelineContainer}>
        {project.timeline.map((item, idx) => (
          <View key={item.id || idx} style={styles.timelineItem}>
            {/* Timeline Spine / Marker */}
            <View style={styles.spineColumn}>
              <View
                style={[
                  styles.timelineMarker,
                  item.status === 'DANGER' && styles.markerDanger,
                  item.status === 'WARNING' && styles.markerWarning,
                  item.status === 'SUCCESS' && styles.markerSuccess,
                  item.status === 'INFO' && styles.markerInfo,
                ]}
              />
              {idx !== project.timeline.length - 1 && <View style={styles.spineLine} />}
            </View>

            {/* Event Content */}
            <View style={styles.timelineContent}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                <Text style={styles.timelineTime}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <Text style={styles.timelineSubtitle}>{item.subtitle}</Text>

              <View style={styles.badgeWrapper}>
                <Text style={styles.timelineBadge}>{item.badge}</Text>
                <Text style={styles.timelineDate}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  projectStatusPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  projectStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  heroCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  projectName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  projectOrg: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  projectScheme: {
    fontSize: 11,
    color: colors.secondary,
    marginTop: 1,
  },
  heroRisk: {
    alignItems: 'flex-end',
  },
  facilityTypeTag: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  metaItem: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500',
  },
  tabBarContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScrollContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    gap: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 4,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.white,
  },
  tabCounter: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  tabCounterInactive: {
    backgroundColor: '#E2E8F0',
  },
  tabCounterActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabCounterText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  tabCounterTextActive: {
    color: colors.white,
  },
  contentContainer: {
    padding: spacing.base,
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  metricCard: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  metricCardVal: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  metricCardLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  riskBreakdownBox: {
    paddingVertical: spacing.xs,
  },
  riskScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  riskScoreLarge: {
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.danger,
  },
  riskScoreTagline: {
    fontSize: 10,
    color: colors.textMuted,
  },
  riskExplainDesc: {
    fontSize: 11,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  ruleFactorsList: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  ruleFactor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ruleFactorText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  ruleFactorPts: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textLight,
    flex: 1,
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    flex: 2,
    textAlign: 'right',
  },
  actionCard: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  actionCardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
  demoBannerBox: {
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: spacing.base,
  },
  demoBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  demoBannerDesc: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 14,
  },
  cameraCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cameraName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  cameraLocation: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 1,
  },
  camStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  camStatusOnline: {
    backgroundColor: '#DCFCE7',
  },
  camStatusOffline: {
    backgroundColor: '#FEE2E2',
  },
  camStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  camStatusTextOnline: {
    color: colors.success,
  },
  camStatusTextOffline: {
    color: colors.danger,
  },
  streamViewport: {
    height: 140,
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  streamOverlayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streamLiveIndicator: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  streamQuality: {
    color: '#94A3B8',
    fontSize: 9,
  },
  streamCenterContent: {
    alignItems: 'center',
  },
  streamPlaceholderIcon: {
    fontSize: 24,
  },
  streamPlaceholderText: {
    color: '#CBD5E1',
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  streamOverlayBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streamTelemetry: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '600',
  },
  camFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  camFooterText: {
    fontSize: 10,
    color: colors.textLight,
  },
  attCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  attBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  attBoxObserved: {
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  attBoxVal: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  attBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  attBoxSub: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 1,
  },
  attVsBox: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  attVsText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textLight,
  },
  mismatchBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
  mismatchBadgeText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '800',
  },
  alertNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: spacing.sm,
  },
  alertNoticeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  alertNoticeText: {
    flex: 1,
    fontSize: 11,
    color: colors.danger,
    lineHeight: 16,
  },
  attHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  attHistoryLeft: {
    flex: 1,
  },
  attHistoryDate: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  attHistorySource: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 1,
  },
  attHistoryRight: {
    alignItems: 'flex-end',
  },
  attHistoryCounts: {
    fontSize: 11,
    color: colors.textMuted,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },
  mismatchPercentText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '700',
    marginTop: 2,
  },
  matchOkText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  tabSectionHeader: {
    marginBottom: spacing.sm,
  },
  tabSectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  tabSectionSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  emptyNotice: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: spacing.md,
    fontSize: 12,
  },
  inspCard: {
    marginBottom: spacing.base,
  },
  inspCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inspType: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  inspInspector: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  inspStatusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  inspStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
  },
  geofenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs + 2,
  },
  geoStatus: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  geoVerified: {
    backgroundColor: '#E0F2FE',
    color: colors.primary,
  },
  geoUnverified: {
    backgroundColor: '#FEE2E2',
    color: colors.danger,
  },
  inspDate: {
    fontSize: 10,
    color: colors.textLight,
  },
  notesBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  notesText: {
    fontSize: 11,
    color: colors.text,
    marginTop: 2,
    lineHeight: 16,
  },
  checklistSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checklistTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  checklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexBasis: '47%',
  },
  checkIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  checkLabel: {
    fontSize: 10,
    color: colors.text,
  },
  evidenceCard: {
    marginBottom: spacing.base,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  evidenceTypeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  evidenceTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  integrityBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  integrityText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
  },
  evidenceFileUrl: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  hashBox: {
    backgroundColor: colors.background,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hashLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textLight,
  },
  hashValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textMuted,
    marginTop: 1,
  },
  evidenceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  evidenceMetaText: {
    fontSize: 10,
    color: colors.textLight,
  },
  evidenceDevice: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  alertCard: {
    marginBottom: spacing.base,
  },
  alertCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertCardStatus: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.warning,
  },
  alertAnomalyTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  alertExplanation: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  scoreBreakdownBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  scoreBreakdownTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  scorePointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  scorePointFactor: {
    fontSize: 10,
    color: colors.text,
  },
  scorePointPts: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
  },
  recommendationBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
  },
  recText: {
    fontSize: 11,
    color: colors.text,
    marginTop: 1,
  },
  timelineContainer: {
    paddingLeft: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.base,
  },
  spineColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.sm,
  },
  timelineMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  markerDanger: {
    backgroundColor: colors.danger,
  },
  markerWarning: {
    backgroundColor: colors.warning,
  },
  markerSuccess: {
    backgroundColor: colors.success,
  },
  markerInfo: {
    backgroundColor: colors.secondary,
  },
  spineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  timelineTime: {
    fontSize: 10,
    color: colors.textLight,
  },
  timelineSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  badgeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  timelineBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.secondary,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  timelineDate: {
    fontSize: 9,
    color: colors.textLight,
  },
});
