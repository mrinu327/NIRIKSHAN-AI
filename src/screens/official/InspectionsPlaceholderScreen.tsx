import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { InspectionCard } from '../../components/cards/InspectionCard';
import { LoadingState } from '../../components/common/LoadingState';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import {
  mockAssignmentService,
  AutomatedAssignmentResult,
} from '../../services/mock/mockAssignmentService';
import { InspectionAssignment, DemoInspector } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const InspectionsPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'Inspections'>>();
  const [inspections, setInspections] = useState<InspectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'SURPRISE' | 'ROUTINE'>('ALL');

  // Modal State for Automated Random Assignment
  const [selectedInspection, setSelectedInspection] = useState<InspectionAssignment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [allInspectors, setAllInspectors] = useState<DemoInspector[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<AutomatedAssignmentResult | null>(null);

  // Modal State for Submitted Inspection Dossier Review (Phase 3 Sync)
  const [dossierInspection, setDossierInspection] = useState<InspectionAssignment | null>(null);
  const [dossierModalVisible, setDossierModalVisible] = useState(false);

  // Entrance animation
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  const loadInspections = async () => {
    try {
      const data = await mockInspectionService.getAssignedInspections();
      setInspections(data);
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
    const unsubscribe = navigation.addListener('focus', () => {
      loadInspections();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!loading) {
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
  }, [loading]);

  const handleOpenAssignmentModal = async (inspection: InspectionAssignment) => {
    setSelectedInspection(inspection);
    setAssignmentResult(null);
    setIsAssigning(false);
    const pool = await mockAssignmentService.getAllInspectors();
    setAllInspectors(pool);
    setModalVisible(true);
  };

  const handleExecuteAutomatedAssignment = async () => {
    if (!selectedInspection) return;
    setIsAssigning(true);
    try {
      // Simulate high-integrity automated dispatch calculation
      const result = await mockAssignmentService.assignInspectorRandomly(selectedInspection.id);
      setAssignmentResult(result);
    } catch (error) {
      console.error('Failed automated assignment:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmAndClose = async () => {
    setModalVisible(false);
    setSelectedInspection(null);
    setAssignmentResult(null);
    await loadInspections();
  };

  const handleOpenDossier = (inspection: InspectionAssignment) => {
    setDossierInspection(inspection);
    setDossierModalVisible(true);
  };

  // Compute dynamic filter counts
  const submittedCount = inspections.filter((i) => i.status === 'Submitted / Awaiting Review').length;
  const surpriseCount = inspections.filter((i) => i.type === 'Surprise Inspection').length;
  const routineCount = inspections.filter((i) => i.type === 'Routine Inspection' || i.type === 'Special Audit').length;

  const filteredInspections = inspections.filter((i) => {
    if (filter === 'SUBMITTED') return i.status === 'Submitted / Awaiting Review';
    if (filter === 'SURPRISE') return i.type === 'Surprise Inspection';
    if (filter === 'ROUTINE') return i.type === 'Routine Inspection' || i.type === 'Special Audit';
    return true;
  });

  const activeInspectorsCount = allInspectors.filter((i) => i.active).length;
  const inactiveInspectorsCount = allInspectors.filter((i) => !i.active).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Field Inspection Oversight"
        subtitle="Surprise & Routine PMU Audits • Allocation & Dossier Review"
      />

      {loading ? (
        <LoadingState message="Loading inspection assignments..." />
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
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Filter Chips */}
            <View style={styles.filterRow}>
              {[
                { id: 'ALL', label: `All Orders (${inspections.length})` },
                { id: 'SUBMITTED', label: `Submitted / Review (${submittedCount})` },
                { id: 'SURPRISE', label: `Surprise Audits (${surpriseCount})` },
                { id: 'ROUTINE', label: `Routine / Scheduled (${routineCount})` },
              ].map((chip) => {
                const isActive = filter === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setFilter(chip.id as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <SectionHeader
              title="Active Inspection Orders"
              subtitle="Assignments triggered by alerts and routine governance timelines"
              badgeCount={filteredInspections.length}
            />

            {filteredInspections.map((inspection) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                onRunAssignment={() => handleOpenAssignmentModal(inspection)}
                onPress={() => handleOpenDossier(inspection)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Automated Random Assignment Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="shuffle" size={20} color={colors.brand.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Automated Field Assignment</Text>
                  <Text style={styles.modalSubtitle}>Impartial automated selection protocol</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Inspection Target Card */}
              {selectedInspection && (
                <View style={styles.targetSection}>
                  <View style={styles.targetTopRow}>
                    <Text style={styles.targetIdText}>#{selectedInspection.id}</Text>
                    <StatusBadge label={selectedInspection.type} variant="highPriority" size="sm" />
                  </View>
                  <Text style={styles.targetNameText}>{selectedInspection.projectName}</Text>
                  <Text style={styles.targetAddressText}>{selectedInspection.projectAddress}</Text>

                  {selectedInspection.triggerReason ? (
                    <View style={styles.triggerAlertBox}>
                      <Ionicons name="information-circle" size={14} color={colors.brand.navyLight} />
                      <Text style={styles.triggerAlertText} numberOfLines={2}>
                        {selectedInspection.triggerReason}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Roster & Pool Status */}
              <View style={styles.poolSection}>
                <View style={styles.poolHeaderRow}>
                  <Text style={styles.poolSectionTitle}>PMU Field Inspector Pool</Text>
                  <View style={styles.poolBadge}>
                    <Text style={styles.poolBadgeText}>
                      {activeInspectorsCount} Active • {inactiveInspectorsCount} Excluded
                    </Text>
                  </View>
                </View>

                {allInspectors.map((inspector) => (
                  <View
                    key={inspector.id}
                    style={[
                      styles.inspectorItem,
                      !inspector.active && styles.inspectorItemInactive,
                      assignmentResult?.selectedInspector.id === inspector.id &&
                        styles.inspectorItemSelected,
                    ]}
                  >
                    <View style={styles.inspectorInfoLeft}>
                      <View
                        style={[
                          styles.inspectorStatusDot,
                          {
                            backgroundColor: inspector.active
                              ? colors.status.normal
                              : colors.text.muted,
                          },
                        ]}
                      />
                      <View>
                        <View style={styles.inspectorNameRow}>
                          <Text
                            style={[
                              styles.inspectorItemName,
                              !inspector.active && styles.inspectorTextMuted,
                            ]}
                          >
                            {inspector.name}
                          </Text>
                          <Text style={styles.inspectorCodeBadge}>
                            ({inspector.demoId.replace('-DEMO', '')})
                          </Text>
                        </View>
                        <Text style={styles.inspectorSubLoc}>
                          {inspector.assignedLocation} • {inspector.jurisdiction}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.inspectorStatusCol}>
                      {inspector.active ? (
                        <View style={styles.activeTag}>
                          <Text style={styles.activeTagText}>Eligible</Text>
                        </View>
                      ) : (
                        <View style={styles.inactiveTag}>
                          <Text style={styles.inactiveTagText}>On Leave (Excluded)</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Selection Result / Explainability Box */}
              {assignmentResult && (
                <View style={styles.resultBox}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.status.normal} />
                    <Text style={styles.resultTitle}>Inspector Selected Impartially</Text>
                  </View>

                  <View style={styles.selectedOfficerCard}>
                    <Text style={styles.selectedOfficerLabel}>Selected Field Officer:</Text>
                    <Text style={styles.selectedOfficerName}>
                      {assignmentResult.selectedInspector.name}{' '}
                      <Text style={styles.selectedOfficerId}>
                        ({assignmentResult.selectedInspector.demoId.replace('-DEMO', '')})
                      </Text>
                    </Text>
                    <Text style={styles.selectedOfficerZone}>
                      {assignmentResult.selectedInspector.assignedLocation}
                    </Text>
                  </View>

                  <View style={styles.explainabilityBox}>
                    <Ionicons name="shield-checkmark-outline" size={15} color={colors.brand.primary} />
                    <Text style={styles.explainabilityText}>
                      {assignmentResult.auditRecord.explanation}
                    </Text>
                  </View>

                  <View style={styles.auditMetaRow}>
                    <Text style={styles.auditMetaText}>
                      Method: {assignmentResult.auditRecord.assignmentMethod}
                    </Text>
                    <Text style={styles.auditMetaText}>
                      Timestamp: {assignmentResult.auditRecord.assignmentTimestamp}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              {assignmentResult ? (
                <PrimaryButton
                  title="Confirm & Dispatch Assignment"
                  iconName="paper-plane"
                  onPress={handleConfirmAndClose}
                />
              ) : (
                <View style={styles.modalActionButtons}>
                  <PrimaryButton
                    title="Execute Automated Assignment"
                    iconName="shuffle"
                    onPress={handleExecuteAutomatedAssignment}
                    loading={isAssigning}
                  />
                  <SecondaryButton
                    title="Cancel"
                    onPress={() => setModalVisible(false)}
                    disabled={isAssigning}
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Submitted Inspection Dossier Review Modal */}
      <Modal
        visible={dossierModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDossierModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 680 }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalIconCircle, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Ionicons name="document-text" size={20} color={colors.brand.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Inspection Dossier & Audit Record</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {dossierInspection ? `Order #${dossierInspection.id} • ${dossierInspection.type}` : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setDossierModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {dossierInspection && (
                <>
                  {/* Target Card */}
                  <View style={styles.targetSection}>
                    <View style={styles.targetTopRow}>
                      <Text style={styles.targetIdText}>#{dossierInspection.id}</Text>
                      <StatusBadge
                        label={dossierInspection.status}
                        variant={
                          dossierInspection.status === 'Submitted / Awaiting Review'
                            ? 'normal'
                            : dossierInspection.status === 'In Progress'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      />
                    </View>
                    <Text style={styles.targetNameText}>{dossierInspection.projectName}</Text>
                    <Text style={styles.targetAddressText}>{dossierInspection.projectAddress}</Text>

                    <View style={styles.dossierMetaGrid}>
                      <View style={styles.dossierMetaItem}>
                        <Text style={styles.dossierMetaLabel}>Assigned Inspector</Text>
                        <Text style={styles.dossierMetaVal}>
                          {dossierInspection.assignedOfficerName}{' '}
                          {dossierInspection.assignedOfficerDemoId ? `(${dossierInspection.assignedOfficerDemoId.replace('-DEMO', '')})` : ''}
                        </Text>
                      </View>
                      <View style={styles.dossierMetaItem}>
                        <Text style={styles.dossierMetaLabel}>Scheduled Date</Text>
                        <Text style={styles.dossierMetaVal}>{dossierInspection.assignedDate || dossierInspection.dueDate}</Text>
                      </View>
                    </View>

                    {dossierInspection.submittedAt && (
                      <View style={styles.submissionNoticeBox}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.status.normal} />
                        <Text style={styles.submissionNoticeText}>
                          Submitted: {dossierInspection.submittedAt} by {dossierInspection.submittedBy || dossierInspection.assignedOfficerName}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* If not yet submitted */}
                  {dossierInspection.status !== 'Submitted / Awaiting Review' ? (
                    <View style={styles.pendingReportBox}>
                      <Ionicons name="time-outline" size={28} color={colors.brand.navyLight} />
                      <Text style={styles.pendingReportTitle}>Inspection Awaiting Field Submission</Text>
                      <Text style={styles.pendingReportText}>
                        This inspection is currently assigned or in progress with {dossierInspection.assignedOfficerName}.
                        The verified checklist, neutral findings, and photographic/digital evidence will populate here automatically once submitted from the field mobile app.
                      </Text>
                    </View>
                  ) : (
                    <>
                      {/* Checklist Summary Cards */}
                      {(() => {
                        const items = dossierInspection.checklistResponses
                          ? Object.values(dossierInspection.checklistResponses)
                          : [];
                        const verifiedCount = items.filter((i) => i.status === 'Verified').length;
                        const attentionCount = items.filter((i) => i.status === 'Needs Attention').length;
                        const naCount = items.filter((i) => i.status === 'Not Applicable').length;

                        return (
                          <View style={styles.dossierSection}>
                            <Text style={styles.dossierSectionTitle}>Checklist Verification Summary</Text>
                            <View style={styles.checklistSummaryRow}>
                              <View style={[styles.summaryStatCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                                <Text style={[styles.summaryStatVal, { color: colors.status.normal }]}>{verifiedCount}</Text>
                                <Text style={styles.summaryStatLabel}>Verified</Text>
                              </View>
                              <View style={[styles.summaryStatCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                                <Text style={[styles.summaryStatVal, { color: colors.status.warning }]}>{attentionCount}</Text>
                                <Text style={styles.summaryStatLabel}>Needs Attention</Text>
                              </View>
                              <View style={[styles.summaryStatCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                                <Text style={[styles.summaryStatVal, { color: colors.text.muted }]}>{naCount}</Text>
                                <Text style={styles.summaryStatLabel}>N/A</Text>
                              </View>
                            </View>

                            {/* Checklist Items Details */}
                            <View style={styles.dossierChecklistList}>
                              {items.map((item) => (
                                <View key={item.id} style={styles.dossierChecklistItem}>
                                  <View style={styles.dossierChecklistLeft}>
                                    <Text style={styles.dossierChecklistCategory}>{item.category}</Text>
                                    <Text style={styles.dossierChecklistTitle}>{item.title}</Text>
                                    {item.notes ? (
                                      <Text style={styles.dossierChecklistNotes}>Remark: {item.notes}</Text>
                                    ) : null}
                                  </View>
                                  <View
                                    style={[
                                      styles.dossierStatusBadge,
                                      item.status === 'Verified' && { backgroundColor: '#DCFCE7' },
                                      item.status === 'Needs Attention' && { backgroundColor: '#FEF3C7' },
                                      item.status === 'Not Applicable' && { backgroundColor: '#F1F5F9' },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.dossierStatusText,
                                        item.status === 'Verified' && { color: '#166534' },
                                        item.status === 'Needs Attention' && { color: '#92400E' },
                                        item.status === 'Not Applicable' && { color: '#475569' },
                                      ]}
                                    >
                                      {item.status}
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        );
                      })()}

                      {/* Neutral Findings Section */}
                      {dossierInspection.findings && (
                        <View style={styles.dossierSection}>
                          <Text style={styles.dossierSectionTitle}>Inspector Field Observations</Text>
                          <View style={styles.findingsBlock}>
                            <Text style={styles.findingFieldLabel}>Overall Observation</Text>
                            <Text style={styles.findingFieldValue}>
                              {dossierInspection.findings.overallObservation || 'None recorded'}
                            </Text>
                          </View>

                          <View style={styles.findingsBlock}>
                            <Text style={styles.findingFieldLabel}>Key Findings</Text>
                            <Text style={styles.findingFieldValue}>
                              {dossierInspection.findings.keyFindings || 'None recorded'}
                            </Text>
                          </View>

                          <View style={styles.findingsBlock}>
                            <Text style={styles.findingFieldLabel}>Recommended Follow-Up</Text>
                            <Text style={styles.findingFieldValue}>
                              {dossierInspection.findings.issuesRequiringFollowUp || 'None recorded'}
                            </Text>
                          </View>

                          {dossierInspection.findings.additionalRemarks ? (
                            <View style={styles.findingsBlock}>
                              <Text style={styles.findingFieldLabel}>Additional Remarks</Text>
                              <Text style={styles.findingFieldValue}>
                                {dossierInspection.findings.additionalRemarks}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      )}

                      {/* Evidence Section */}
                      <View style={styles.dossierSection}>
                        <View style={styles.evidenceHeaderRow}>
                          <Text style={styles.dossierSectionTitle}>Attached Digital Evidence</Text>
                          <Text style={styles.evidenceCountBadge}>
                            {dossierInspection.evidenceItems?.length || 0} Files
                          </Text>
                        </View>

                        {dossierInspection.evidenceItems && dossierInspection.evidenceItems.length > 0 ? (
                          dossierInspection.evidenceItems.map((ev) => (
                            <View key={ev.id} style={styles.dossierEvidenceCard}>
                              <View style={styles.evidenceIconBox}>
                                <Ionicons
                                  name={ev.type === 'video' ? 'videocam' : ev.type === 'document' ? 'document-attach' : 'camera'}
                                  size={18}
                                  color={colors.brand.primary}
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.evidenceTitleText}>{ev.title}</Text>
                                <Text style={styles.evidenceMetaText}>
                                  {ev.category} • {ev.timestamp}
                                </Text>
                                {ev.demoLabel ? (
                                  <Text style={styles.evidenceNoteText}>Note: {ev.demoLabel}</Text>
                                ) : null}
                              </View>
                              <View style={styles.gpsBadge}>
                                <Ionicons name="location-outline" size={11} color="#B45309" />
                                <Text style={styles.gpsBadgeText}>{ev.locationStatus}</Text>
                              </View>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noEvidenceText}>No media files attached to this inspection.</Text>
                        )}
                      </View>

                      {/* Governance & Audit Box */}
                      <View style={styles.governanceNoticeBox}>
                        <Ionicons name="shield-checkmark" size={16} color={colors.brand.navyLight} />
                        <Text style={styles.governanceNoticeText}>
                          Official MoSJE PMU Inspection Record. Prototype Mode: All data entries are captured for audit simulation. Pending backend GPS verification and biometric digital sign-off.
                        </Text>
                      </View>
                    </>
                  )}
                </>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <PrimaryButton
                title="Close Dossier"
                onPress={() => setDossierModalVisible(false)}
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
  animatedContainer: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  filterChipActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },

  /* Modal Styles */
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
    maxWidth: 620,
    maxHeight: '90%',
    overflow: 'hidden',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  modalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  modalSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScroll: {
    padding: spacing.lg,
  },
  targetSection: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  targetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  targetIdText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  targetNameText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  targetAddressText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  triggerAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginTop: spacing.xs,
    gap: 6,
  },
  triggerAlertText: {
    fontSize: 11,
    color: colors.brand.navyLight,
    flex: 1,
  },
  poolSection: {
    marginBottom: spacing.md,
  },
  poolHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  poolSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  poolBadge: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  poolBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  inspectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: 6,
  },
  inspectorItemInactive: {
    backgroundColor: colors.neutral.surfaceSubtle,
    opacity: 0.65,
  },
  inspectorItemSelected: {
    borderColor: colors.status.normal,
    backgroundColor: '#F0FDF4',
  },
  inspectorInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  inspectorStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inspectorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inspectorItemName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  inspectorCodeBadge: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  inspectorTextMuted: {
    color: colors.text.muted,
  },
  inspectorSubLoc: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 1,
  },
  inspectorStatusCol: {
    marginLeft: spacing.sm,
  },
  activeTag: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
  },
  inactiveTag: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  inactiveTagText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  resultBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
  },
  selectedOfficerCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedOfficerLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  selectedOfficerName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  selectedOfficerId: {
    color: colors.brand.primary,
  },
  selectedOfficerZone: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  explainabilityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    padding: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  explainabilityText: {
    fontSize: 11,
    color: colors.brand.navyLight,
    lineHeight: 16,
    flex: 1,
  },
  auditMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
  },
  auditMetaText: {
    fontSize: 10,
    color: colors.text.muted,
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  modalActionButtons: {
    width: '100%',
  },

  /* Dossier Review Modal Styles */
  dossierMetaGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  dossierMetaItem: {
    flex: 1,
  },
  dossierMetaLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  dossierMetaVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: 2,
  },
  submissionNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: spacing.xs + 2,
    borderRadius: borderRadius.xs,
    marginTop: spacing.xs,
  },
  submissionNoticeText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: '#15803D',
  },
  pendingReportBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderStyle: 'dashed',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  pendingReportTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    marginTop: spacing.xs,
  },
  pendingReportText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  dossierSection: {
    marginTop: spacing.md,
  },
  dossierSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    marginBottom: spacing.xs,
  },
  checklistSummaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryStatCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryStatVal: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  summaryStatLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  dossierChecklistList: {
    gap: 6,
  },
  dossierChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  dossierChecklistLeft: {
    flex: 1,
  },
  dossierChecklistCategory: {
    fontSize: 9,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontWeight: typography.weights.medium,
  },
  dossierChecklistTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  dossierChecklistNotes: {
    fontSize: 11,
    color: colors.status.warning,
    fontStyle: 'italic',
    marginTop: 2,
  },
  dossierStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  dossierStatusText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  findingsBlock: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  findingFieldLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  findingFieldValue: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    lineHeight: 18,
  },
  evidenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  evidenceCountBadge: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  dossierEvidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  evidenceIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceTitleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  evidenceMetaText: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  evidenceNoteText: {
    fontSize: 10,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 1,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  gpsBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  noEvidenceText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  governanceNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  governanceNoticeText: {
    fontSize: 10,
    color: colors.text.secondary,
    lineHeight: 14,
    flex: 1,
  },
});
