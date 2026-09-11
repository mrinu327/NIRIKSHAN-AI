import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, RiskBadge, Button } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useInspectionStore } from '../../src/store/useInspectionStore';
import { api } from '../../src/services/api';
import { RiskLevel, MediaEvidenceType } from '@nirikshan/shared-types';

interface AssignmentItem {
  id: string;
  projectId: string;
  projectName: string;
  ngoName: string;
  projectAddress: string;
  city: string;
  state: string;
  type: 'REGULAR' | 'SURPRISE' | 'VC';
  typeLabel: string;
  status: 'UPCOMING' | 'TODAY' | 'IN PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'WAITING';
  scheduledDate: string;
  countdown: string;
  assignedOfficial: string;
  assignedOfficialBadge: string;
  riskLevel: RiskLevel;
  riskScore: number;
  triggerReason?: string;
  previousSummary?: string;
  latitude: number;
  longitude: number;
  vcDetails?: {
    requestedBy: string;
    requestedRole: string;
    purpose: string;
    channelId: string;
  };
}

const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'insp-001',
    projectId: 'proj-001',
    projectName: 'Demo Welfare Institute - Coimbatore',
    ngoName: 'Hope Foundation Trust',
    projectAddress: '42 Avinashi Road, Peelamedu, Coimbatore',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    type: 'SURPRISE',
    typeLabel: '⚡ SURPRISE INSPECTION',
    status: 'TODAY',
    scheduledDate: 'Today, 05:00 PM',
    countdown: 'TODAY',
    assignedOfficial: 'Priya Verma',
    assignedOfficialBadge: 'PMU-DEMO-004',
    riskLevel: RiskLevel.HIGH,
    riskScore: 82,
    triggerReason: 'Triggered by 33.7% attendance discrepancy flagged by CCTV vision telemetry.',
    previousSummary: 'Previous audit (12 Jan 2026): Operational with minor record discrepancy.',
    latitude: 11.0267,
    longitude: 76.9953,
  },
  {
    id: 'insp-002',
    projectId: 'proj-002',
    projectName: 'ABC Rehabilitation Centre',
    ngoName: 'Grace Care Society',
    projectAddress: 'Plot 42, Institutional Area, Sector 14, Rohini',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'REGULAR',
    typeLabel: 'REGULAR INSPECTION',
    status: 'UPCOMING',
    scheduledDate: '18 September 2026',
    countdown: '8 DAYS',
    assignedOfficial: 'Arun Kumar',
    assignedOfficialBadge: 'PMU-DL-019',
    riskLevel: RiskLevel.LOW,
    riskScore: 24,
    previousSummary: 'Previous routine audit (28 Aug 2026): Fully compliant with DoSJE elder care standards.',
    latitude: 28.7159,
    longitude: 77.1124,
  },
  {
    id: 'insp-003',
    projectId: 'proj-003',
    projectName: 'Women Skill Development Centre',
    ngoName: 'Prerna Mahila Trust',
    projectAddress: 'Survey 18/2, Baner Road, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'SURPRISE',
    typeLabel: '⚡ SURPRISE INSPECTION',
    status: 'TODAY',
    scheduledDate: 'Confidential Window (Today)',
    countdown: 'TODAY',
    assignedOfficial: 'Priya Verma',
    assignedOfficialBadge: 'PMU-DEMO-004',
    riskLevel: RiskLevel.CRITICAL,
    riskScore: 88,
    triggerReason: 'Automated sudden drop in vocational biometric attendance logs over 3 consecutive cycles.',
    previousSummary: 'Quarterly review (04 Feb 2026): 94% compliance score.',
    latitude: 18.5597,
    longitude: 73.7799,
  },
  {
    id: 'insp-004',
    projectId: 'proj-004',
    projectName: 'Saksham Divyangjan Care Facility',
    ngoName: 'Samarthya Welfare Mission',
    projectAddress: '22/B, 5th Main, Jayanagar 4th Block, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'VC',
    typeLabel: 'VIDEO VERIFICATION',
    status: 'WAITING',
    scheduledDate: 'Immediate Dispatch Window',
    countdown: 'ACTIVE NOW',
    assignedOfficial: 'Priya Verma',
    assignedOfficialBadge: 'PMU-DEMO-004',
    riskLevel: RiskLevel.MEDIUM,
    riskScore: 56,
    triggerReason: 'Surprise spot-check requested by DoSJE Central Monitoring Room.',
    previousSummary: 'Routine inspection completed 01 Nov 2025.',
    latitude: 12.925,
    longitude: 77.5938,
    vcDetails: {
      requestedBy: 'Dr. Rajesh Sharma',
      requestedRole: 'Director - Monitoring & Inspection, DoSJE',
      purpose: 'Live Beneficiary Count & Meal Facility Video Verification',
      channelId: 'SECURE-VC-MOSJE-2026-88',
    },
  },
];

export default function InspectorAssignments() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { setInspectionTarget, addEvidence, addTimelineEvent } = useInspectionStore();

  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'SURPRISE' | 'VC'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);

  // Video Call Modal State
  const [vcModalVisible, setVcModalVisible] = useState(false);
  const [activeVcTask, setActiveVcTask] = useState<AssignmentItem | null>(null);
  const [vcConnected, setVcConnected] = useState(false);
  const [vcChecklist, setVcChecklist] = useState({
    beneficiaryObserved: true,
    premisesIdentified: true,
    staffInteracted: true,
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleStartInspection = (task: AssignmentItem) => {
    setInspectionTarget(
      task.id,
      task.projectId,
      task.projectName,
      task.projectAddress,
      task.latitude,
      task.longitude,
      task.type,
      task.scheduledDate,
      task.countdown
    );

    router.push({
      pathname: '/(inspector)/map',
      params: {
        inspectionId: task.id,
        projectId: task.projectId,
      },
    });
  };

  const handleOpenVcModal = (task: AssignmentItem) => {
    setActiveVcTask(task);
    setVcModalVisible(true);
    setVcConnected(false);

    // Simulate connecting
    setTimeout(() => {
      setVcConnected(true);
    }, 1200);
  };

  const handleCompleteVcCall = async () => {
    if (!activeVcTask) return;

    // Log VC evidence
    await addEvidence(
      MediaEvidenceType.VIDEO,
      `vc_verification_${Date.now().toString().slice(-4)}.mp4`,
      'https://demo-storage.sih26095.local/evidence/vc_call_session.mp4',
      {
        category: 'CCTV Evidence',
        title: `VC Verification: ${activeVcTask.projectName}`,
        notes: `Remote video verification conducted by ${user?.name || 'Inspector'}. Verified beneficiaries present and kitchen operational.`,
      }
    );

    addTimelineEvent(
      '📹',
      'Surprise Video Verification Completed',
      `Live call with ${activeVcTask.ngoName} completed and archived.`,
      'VC'
    );

    setVcModalVisible(false);
    setAssignments((prev) =>
      prev.map((a) => (a.id === activeVcTask.id ? { ...a, status: 'COMPLETED' } : a))
    );
  };

  const displayedAssignments = assignments.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'TODAY') return a.status === 'TODAY' || a.countdown === 'TODAY';
    if (filter === 'UPCOMING') return a.status === 'UPCOMING';
    if (filter === 'SURPRISE') return a.type === 'SURPRISE';
    if (filter === 'VC') return a.type === 'VC';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader
        title="MY ASSIGNMENTS"
        subtitle="Field Inspection Queue & Official Dispatches"
      />

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {(['ALL', 'TODAY', 'UPCOMING', 'SURPRISE', 'VC'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, filter === tab && styles.tabItemActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
              {tab === 'SURPRISE' ? '⚡ SURPRISE' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Officer Credentials Banner */}
        <View style={styles.inspectorBanner}>
          <View style={styles.bannerInfo}>
            <Text style={styles.inspectorGreeting}>Assigned PMU Field Officer</Text>
            <Text style={styles.inspectorName}>{user?.name || 'Priya Verma'}</Text>
            <Text style={styles.inspectorDistrict}>
              {user?.district || 'Coimbatore'} Zone • PMU State Flying Squad
            </Text>
          </View>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeNumber}>ID #PMU-DEMO-004</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {filter === 'ALL' ? 'ALL ASSIGNMENTS' : `${filter} INSPECTIONS`}
          </Text>
          <Text style={styles.countBadge}>{displayedAssignments.length} Found</Text>
        </View>

        {displayedAssignments.map((task) => {
          const isSurprise = task.type === 'SURPRISE';
          const isVc = task.type === 'VC';
          const isCompleted = task.status === 'COMPLETED';

          return (
            <Card
              key={task.id}
              style={[
                styles.taskCard,
                isSurprise && styles.surpriseCardHighlight,
                isVc && styles.vcCardHighlight,
              ]}
            >
              {/* Header Row: Type Badge + Countdown Pill */}
              <View style={styles.taskTop}>
                <View
                  style={[
                    styles.typePill,
                    isSurprise && styles.typePillSurprise,
                    isVc && styles.typePillVc,
                  ]}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      isSurprise && styles.typePillTextSurprise,
                      isVc && styles.typePillTextVc,
                    ]}
                  >
                    {task.typeLabel}
                  </Text>
                </View>

                <View
                  style={[
                    styles.countdownPill,
                    task.countdown === 'TODAY' && styles.countdownPillToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.countdownPillText,
                      task.countdown === 'TODAY' && styles.countdownPillTextToday,
                    ]}
                  >
                    {task.countdown === 'TODAY'
                      ? '● TODAY'
                      : `Inspection in: ${task.countdown}`}
                  </Text>
                </View>
              </View>

              {/* Project & NGO Info */}
              <Text style={styles.projectName}>{task.projectName}</Text>
              <Text style={styles.ngoName}>Agency / NGO: {task.ngoName}</Text>
              <Text style={styles.projectAddress}>📍 {task.projectAddress}</Text>

              {/* Metadata Box */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Assigned Official</Text>
                  <Text style={styles.detailVal}>
                    {task.assignedOfficial}{' '}
                    <Text style={{ color: colors.textLight }}>({task.assignedOfficialBadge})</Text>
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Scheduled Window</Text>
                  <Text style={styles.detailVal}>{task.scheduledDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Verification Status</Text>
                  <Text
                    style={[
                      styles.detailVal,
                      { color: isCompleted ? colors.success : colors.primary },
                    ]}
                  >
                    {task.status}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Assessed Risk</Text>
                  <Text
                    style={[
                      styles.detailVal,
                      { color: task.riskScore >= 75 ? colors.danger : colors.text },
                    ]}
                  >
                    {task.riskLevel} ({task.riskScore}/100)
                  </Text>
                </View>
              </View>

              {/* Surprise Rationale (Safeguarded) */}
              {task.triggerReason ? (
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonLabel}>Dispatch Trigger & Reason:</Text>
                  <Text style={styles.reasonText}>{task.triggerReason}</Text>
                  {isSurprise && (
                    <Text style={styles.confidentialNote}>
                      🔒 Confidential: Exact surprise route timing is restricted to assigned officer.
                    </Text>
                  )}
                </View>
              ) : null}

              {/* VC Inspector Request Info */}
              {isVc && task.vcDetails && (
                <View style={styles.vcPromptBox}>
                  <Text style={styles.vcPromptTitle}>Direct Video Verification Request</Text>
                  <Text style={styles.vcPromptText}>
                    Requested by: <Text style={{ fontWeight: '700' }}>{task.vcDetails.requestedBy}</Text> ({task.vcDetails.requestedRole})
                  </Text>
                  <Text style={styles.vcPromptSub}>{task.vcDetails.purpose}</Text>
                </View>
              )}

              {/* Previous Summary */}
              {task.previousSummary ? (
                <View style={styles.prevAuditBox}>
                  <Text style={styles.prevAuditLabel}>Historical Audit Dossier:</Text>
                  <Text style={styles.prevAuditText}>{task.previousSummary}</Text>
                </View>
              ) : null}

              {/* Action Button Row */}
              <View style={styles.taskFooter}>
                {isVc ? (
                  <Button
                    title={isCompleted ? "Video Call Completed ✓" : "JOIN VIDEO CALL 📹"}
                    variant={isCompleted ? "secondary" : "primary"}
                    disabled={isCompleted}
                    onPress={() => handleOpenVcModal(task)}
                    style={styles.actionBtnFull}
                  />
                ) : (
                  <Button
                    title={isCompleted ? "Inspection Completed ✓" : "START INSPECTION ➔"}
                    variant={isCompleted ? "secondary" : "primary"}
                    disabled={isCompleted}
                    onPress={() => handleStartInspection(task)}
                    style={styles.actionBtnFull}
                  />
                )}
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* SIMULATED VIDEO CALL MODAL */}
      <Modal visible={vcModalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.vcModalSafeArea}>
          <View style={styles.vcModalHeader}>
            <View>
              <Text style={styles.vcModalTag}>SIMULATED VC PROTOTYPE</Text>
              <Text style={styles.vcModalTitle}>
                {activeVcTask?.projectName || 'Video Verification'}
              </Text>
              <Text style={styles.vcModalSub}>
                Requested by: {activeVcTask?.vcDetails?.requestedBy || 'Government Official'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setVcModalVisible(false)}
              style={styles.vcCloseBtn}
            >
              <Text style={styles.vcCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Video Feed Canvas */}
          <View style={styles.vcVideoCanvas}>
            {vcConnected ? (
              <View style={styles.vcRemoteFeed}>
                <View style={styles.vcFeedBadge}>
                  <Text style={styles.vcLiveText}>🔴 LIVE (SIMULATED)</Text>
                  <Text style={styles.vcLiveTimer}>01:24</Text>
                </View>
                <View style={styles.vcRemoteCenter}>
                  <Text style={styles.vcRemoteEmoji}>🏢</Text>
                  <Text style={styles.vcRemoteLabel}>
                    On-Site Camera: {activeVcTask?.ngoName}
                  </Text>
                  <Text style={styles.vcRemoteSub}>
                    Beneficiary Activity Hall • 1080p WebRTC Encrypted Stream
                  </Text>
                </View>

                {/* Local PiP Window */}
                <View style={styles.vcLocalPip}>
                  <Text style={styles.vcPipEmoji}>👮</Text>
                  <Text style={styles.vcPipText}>Inspector Local</Text>
                </View>
              </View>
            ) : (
              <View style={styles.vcConnecting}>
                <Text style={styles.vcConnectingSpinner}>📡</Text>
                <Text style={styles.vcConnectingTitle}>Establishing Secure Peer Video Bridge...</Text>
                <Text style={styles.vcConnectingSub}>
                  Connecting to MoSJE e-Governance Gateway
                </Text>
              </View>
            )}
          </View>

          {/* VC Verification Checklist */}
          <View style={styles.vcVerificationBox}>
            <Text style={styles.vcChecklistTitle}>Video Verification Criteria</Text>

            <TouchableOpacity
              style={styles.vcCheckItem}
              onPress={() =>
                setVcChecklist((s) => ({ ...s, beneficiaryObserved: !s.beneficiaryObserved }))
              }
            >
              <Text style={styles.vcCheckIcon}>
                {vcChecklist.beneficiaryObserved ? '☑' : '☐'}
              </Text>
              <Text style={styles.vcCheckText}>
                Beneficiary presence visually corroborated in frame
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.vcCheckItem}
              onPress={() =>
                setVcChecklist((s) => ({ ...s, premisesIdentified: !s.premisesIdentified }))
              }
            >
              <Text style={styles.vcCheckIcon}>
                {vcChecklist.premisesIdentified ? '☑' : '☐'}
              </Text>
              <Text style={styles.vcCheckText}>
                Facility signboard and geo-boundary matched to record
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.vcCheckItem}
              onPress={() =>
                setVcChecklist((s) => ({ ...s, staffInteracted: !s.staffInteracted }))
              }
            >
              <Text style={styles.vcCheckIcon}>
                {vcChecklist.staffInteracted ? '☑' : '☐'}
              </Text>
              <Text style={styles.vcCheckText}>
                Centre Administrator / In-charge identity confirmed
              </Text>
            </TouchableOpacity>
          </View>

          {/* Prototype Notice */}
          <View style={styles.prototypeNoticeBanner}>
            <Text style={styles.prototypeNoticeText}>
              ℹ Demonstration Prototype: Simulates the field video inspection workflow without live telephony dependencies.
            </Text>
          </View>

          {/* Call Actions */}
          <View style={styles.vcActionsRow}>
            <TouchableOpacity
              style={styles.vcEndBtn}
              onPress={() => setVcModalVisible(false)}
            >
              <Text style={styles.vcEndBtnText}>Cancel Call</Text>
            </TouchableOpacity>

            <Button
              title="COMPLETE & RECORD EVIDENCE"
              variant="primary"
              onPress={handleCompleteVcCall}
              style={{ flex: 2 }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabItemActive: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  tabTextActive: {
    color: colors.primary,
  },
  container: {
    padding: spacing.base,
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl + 24,
  },
  inspectorBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  bannerInfo: {
    flex: 1,
  },
  inspectorGreeting: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inspectorName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  inspectorDistrict: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeWrap: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  countBadge: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '700',
  },
  taskCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  surpriseCardHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  vcCardHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  taskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typePill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  typePillSurprise: {
    backgroundColor: '#FEE2E2',
  },
  typePillVc: {
    backgroundColor: '#E0F2FE',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  typePillTextSurprise: {
    color: colors.danger,
  },
  typePillTextVc: {
    color: colors.secondary,
  },
  countdownPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  countdownPillToday: {
    backgroundColor: '#FEF3C7',
  },
  countdownPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  countdownPillTextToday: {
    color: '#92400E',
    fontWeight: '800',
  },
  projectName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  ngoName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: 2,
  },
  projectAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  detailItem: {
    width: '48%',
  },
  detailLabel: {
    fontSize: 9,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  reasonBox: {
    backgroundColor: '#FFFBEB',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
  },
  confidentialNote: {
    fontSize: 10,
    color: colors.danger,
    marginTop: 4,
    fontStyle: 'italic',
  },
  vcPromptBox: {
    backgroundColor: '#F0FDF4',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  vcPromptTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
    textTransform: 'uppercase',
  },
  vcPromptText: {
    fontSize: 11,
    color: colors.text,
    marginTop: 2,
  },
  vcPromptSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  prevAuditBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs + 4,
  },
  prevAuditLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  prevAuditText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  taskFooter: {
    marginTop: spacing.md,
  },
  actionBtnFull: {
    width: '100%',
  },

  // Modal Styles
  vcModalSafeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  vcModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  vcModalTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  vcModalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },
  vcModalSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  vcCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vcCloseText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
  vcVideoCanvas: {
    flex: 1,
    backgroundColor: '#020617',
    margin: spacing.base,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vcRemoteFeed: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vcFeedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  vcLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  vcLiveTimer: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  vcRemoteCenter: {
    alignItems: 'center',
  },
  vcRemoteEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  vcRemoteLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  vcRemoteSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  vcLocalPip: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 90,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vcPipEmoji: {
    fontSize: 28,
  },
  vcPipText: {
    fontSize: 9,
    color: '#E2E8F0',
    marginTop: 4,
    fontWeight: '700',
  },
  vcConnecting: {
    alignItems: 'center',
  },
  vcConnectingSpinner: {
    fontSize: 40,
    marginBottom: 12,
  },
  vcConnectingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  vcConnectingSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  vcVerificationBox: {
    backgroundColor: '#1E293B',
    marginHorizontal: spacing.base,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  vcChecklistTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E2E8F0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  vcCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  vcCheckIcon: {
    fontSize: 16,
    color: '#38BDF8',
  },
  vcCheckText: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
  },
  prototypeNoticeBanner: {
    marginHorizontal: spacing.base,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  prototypeNoticeText: {
    fontSize: 11,
    color: '#7DD3FC',
    textAlign: 'center',
  },
  vcActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  vcEndBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vcEndBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
});
