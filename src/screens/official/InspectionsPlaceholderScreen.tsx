import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
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
  const [filter, setFilter] = useState<'ALL' | 'SURPRISE' | 'ROUTINE'>('ALL');

  // Modal State for Automated Random Assignment
  const [selectedInspection, setSelectedInspection] = useState<InspectionAssignment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [allInspectors, setAllInspectors] = useState<DemoInspector[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<AutomatedAssignmentResult | null>(null);

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

  const filteredInspections = inspections.filter((i) => {
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
        subtitle="Surprise and routine PMU audits across districts"
      />

      {loading ? (
        <LoadingState message="Loading inspection assignments..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {[
              { id: 'ALL', label: `All Orders (${inspections.length})` },
              { id: 'SURPRISE', label: 'Surprise Audits' },
              { id: 'ROUTINE', label: 'Routine / Scheduled' },
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
            />
          ))}
        </ScrollView>
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
                          <Text style={styles.inspectorDemoBadge}>({inspector.demoId})</Text>
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
                        ({assignmentResult.selectedInspector.demoId})
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
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
  inspectorDemoBadge: {
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
});
