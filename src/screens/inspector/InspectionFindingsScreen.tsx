/**
 * InspectionFindingsScreen
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Inspector narrative findings (neutral observations) and mock evidence capture placeholder.
 * Strictly avoids accusatory terms; includes explicit prototype disclaimers.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment, InspectionFindings, MockEvidenceItem } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type FindingsRouteProp = RouteProp<InspectorStackParamList, 'InspectionFindings'>;

const INITIAL_FINDINGS: InspectionFindings = {
  overallObservation: '',
  keyFindings: '',
  issuesRequiringFollowUp: '',
  additionalRemarks: '',
};

const SAMPLE_PREFILLS = [
  {
    title: 'Standard Verification (Discrepancy Observed)',
    overall: 'On-site surprise inspection conducted during morning operating hours. Facility accessible and beneficiaries engaged in daily schedule.',
    findings: 'Physical headcount observed 25 beneficiaries in the main activity hall. Institute attendance register submitted 42 attendees earlier today. Staff stated 17 beneficiaries were on authorized medical leave or vocational outing.',
    followUp: 'Further verification recommended: request medical leave records and off-site vocational attendance proof within 48 hours.',
    remarks: 'Staff cooperation was satisfactory. Basic infrastructure, hygiene, and meal facilities in working order.',
  },
  {
    title: 'Normal Routine Compliance',
    overall: 'Routine audit of facility operations and infrastructure. All core mandated services operating normally.',
    findings: 'Physical headcount matches registered attendance within acceptable operational variance. Biometric logs verified on-site.',
    followUp: 'No immediate corrective action required. Scheduled for next quarterly audit cycle.',
    remarks: 'Documentation properly maintained in physical and digital registers.',
  },
];

export const InspectionFindingsScreen: React.FC = () => {
  const navigation = useNavigation<InspectorStackNavigationProp>();
  const route = useRoute<FindingsRouteProp>();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<InspectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [findings, setFindings] = useState<InspectionFindings>(INITIAL_FINDINGS);
  const [evidenceList, setEvidenceList] = useState<MockEvidenceItem[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Evidence Add Modal State
  const [evidenceModalVisible, setEvidenceModalVisible] = useState(false);
  const [evidenceType, setEvidenceType] = useState<'photo' | 'video' | 'document'>('photo');
  const [evidenceCategory, setEvidenceCategory] = useState<MockEvidenceItem['category']>('Facility Entrance');
  const [evidenceTitle, setEvidenceTitle] = useState('');

  useEffect(() => {
    mockInspectionService.getInspectionById(inspectionId).then((data) => {
      setInspection(data || null);
      if (data?.findings) {
        setFindings(data.findings);
      }
      if (data?.evidenceItems && data.evidenceItems.length > 0) {
        setEvidenceList(data.evidenceItems);
      }
      setLoading(false);
    });
  }, [inspectionId]);

  const handleOpenAddEvidence = (type: 'photo' | 'video' | 'document', defaultCategory: MockEvidenceItem['category']) => {
    setEvidenceType(type);
    setEvidenceCategory(defaultCategory);
    setEvidenceTitle(
      type === 'photo'
        ? `${defaultCategory} Photo`
        : type === 'video'
        ? `${defaultCategory} Walkthrough Video`
        : `${defaultCategory} Verification Log`
    );
    setEvidenceModalVisible(true);
  };

  const handleConfirmAddEvidence = () => {
    const timestamp =
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' Today';

    const newItem: MockEvidenceItem = {
      id: `EV-${Date.now().toString().slice(-4)}`,
      type: evidenceType,
      category: evidenceCategory,
      title: evidenceTitle || `${evidenceCategory} Capture`,
      timestamp,
      locationStatus: 'Pending GPS integration',
      demoLabel: 'DEMO EVIDENCE ENTRY',
    };

    setEvidenceList((prev) => [...prev, newItem]);
    setEvidenceModalVisible(false);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplyPrefill = (prefill: (typeof SAMPLE_PREFILLS)[0]) => {
    setFindings({
      overallObservation: prefill.overall,
      keyFindings: prefill.findings,
      issuesRequiringFollowUp: prefill.followUp,
      additionalRemarks: prefill.remarks,
    });
    setValidationError(null);
  };

  const handleProceed = async () => {
    if (!findings.overallObservation.trim() || !findings.keyFindings.trim()) {
      setValidationError('Please provide at least Overall Observation and Key Findings before proceeding.');
      return;
    }

    setSaving(true);
    try {
      await mockInspectionService.saveInspectionDraft(inspectionId, {
        findings,
        evidenceItems: evidenceList,
      });

      navigation.navigate('InspectionReview', { inspectionId });
    } catch (err) {
      console.error('Failed to save findings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Inspection Findings" subtitle="Loading record..." />
        <ActivityIndicator size="large" color={colors.brand.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Findings & Evidence"
        subtitle={`Order #${inspectionId} • Documentation & Notes`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color={colors.brand.primary} />
          <Text style={styles.backButtonText}>Back to Checklist</Text>
        </TouchableOpacity>

        {validationError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.status.warning} />
            <Text style={styles.errorBannerText}>{validationError}</Text>
          </View>
        )}

        {/* Quick Prefill Bar for Demo Speed */}
        <View style={styles.prefillCard}>
          <View style={styles.prefillHeader}>
            <Ionicons name="flash-outline" size={15} color={colors.brand.primary} />
            <Text style={styles.prefillTitle}>Quick-Fill Standard Findings (Demo):</Text>
          </View>
          <View style={styles.prefillRow}>
            {SAMPLE_PREFILLS.map((pf) => (
              <TouchableOpacity
                key={pf.title}
                style={styles.prefillBtn}
                onPress={() => handleApplyPrefill(pf)}
                activeOpacity={0.7}
              >
                <Text style={styles.prefillBtnText}>{pf.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form Inputs Section */}
        <SectionHeader
          title="Field Observation Report"
          subtitle="Record objective, factual statements regarding the visit"
        />

        <View style={styles.formCard}>
          {/* Overall Observation */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Overall Observation <Text style={{ color: colors.status.highPriority }}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. On-site verification conducted during morning hours. Facility operational..."
              placeholderTextColor={colors.text.muted}
              value={findings.overallObservation}
              onChangeText={(text) => {
                setFindings((prev) => ({ ...prev, overallObservation: text }));
                setValidationError(null);
              }}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Key Findings */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Key Findings <Text style={{ color: colors.status.highPriority }}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. Physical headcount cross-checked against submitted records. 25 beneficiaries observed..."
              placeholderTextColor={colors.text.muted}
              value={findings.keyFindings}
              onChangeText={(text) => {
                setFindings((prev) => ({ ...prev, keyFindings: text }));
                setValidationError(null);
              }}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Issues Requiring Follow-Up */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Issues Requiring Follow-Up</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. Further verification recommended for beneficiaries reported on medical leave..."
              placeholderTextColor={colors.text.muted}
              value={findings.issuesRequiringFollowUp}
              onChangeText={(text) =>
                setFindings((prev) => ({ ...prev, issuesRequiringFollowUp: text }))
              }
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Additional Remarks */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Additional Remarks</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. Facility infrastructure in working order. Staff cooperation noted..."
              placeholderTextColor={colors.text.muted}
              value={findings.additionalRemarks}
              onChangeText={(text) =>
                setFindings((prev) => ({ ...prev, additionalRemarks: text }))
              }
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Evidence Section */}
        <SectionHeader
          title="Evidence Capture"
          subtitle="Attach timestamped verification media"
          badgeCount={evidenceList.length}
        />

        {/* Prototype Disclaimer Banner */}
        <View style={styles.evidenceNoticeBox}>
          <Ionicons name="information-circle" size={18} color={colors.brand.navyLight} />
          <Text style={styles.evidenceNoticeText}>
            Demo evidence capture — actual secure media upload and GPS camera geofencing will be integrated in a later phase.
          </Text>
        </View>

        {/* Evidence Action Buttons */}
        <View style={styles.evidenceActionGrid}>
          <TouchableOpacity
            style={styles.evidenceActionBtn}
            onPress={() => handleOpenAddEvidence('photo', 'Facility Entrance')}
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={20} color={colors.brand.primary} />
            <Text style={styles.evidenceActionBtnText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.evidenceActionBtn}
            onPress={() => handleOpenAddEvidence('video', 'Service Delivery Area')}
            activeOpacity={0.7}
          >
            <Ionicons name="videocam" size={20} color={colors.brand.primary} />
            <Text style={styles.evidenceActionBtnText}>Record Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.evidenceActionBtn}
            onPress={() => handleOpenAddEvidence('document', 'Attendance Register')}
            activeOpacity={0.7}
          >
            <Ionicons name="attach" size={20} color={colors.brand.primary} />
            <Text style={styles.evidenceActionBtnText}>Attach Evidence</Text>
          </TouchableOpacity>
        </View>

        {/* Evidence Items List */}
        {evidenceList.length === 0 ? (
          <View style={styles.evidenceEmptyCard}>
            <Ionicons name="images-outline" size={32} color={colors.text.muted} />
            <Text style={styles.evidenceEmptyTitle}>No evidence attached yet</Text>
            <Text style={styles.evidenceEmptyDesc}>
              Tap one of the buttons above to register mock photo, video, or register verification entries.
            </Text>
          </View>
        ) : (
          <View style={styles.evidenceList}>
            {evidenceList.map((item) => (
              <View key={item.id} style={styles.evidenceCard}>
                <View style={styles.evidenceLeft}>
                  <View style={styles.evidenceIconCircle}>
                    <Ionicons
                      name={item.type === 'photo' ? 'camera' : item.type === 'video' ? 'videocam' : 'document-text'}
                      size={18}
                      color={colors.brand.primary}
                    />
                  </View>
                  <View style={styles.evidenceTextCol}>
                    <Text style={styles.evidenceTitle}>{item.title}</Text>
                    <View style={styles.evidenceMetaRow}>
                      <Text style={styles.evidenceCategory}>{item.category}</Text>
                      <Text style={styles.evidenceDot}>•</Text>
                      <Text style={styles.evidenceTime}>{item.timestamp}</Text>
                    </View>
                    <View style={styles.gpsRow}>
                      <Ionicons name="location-outline" size={11} color="#D97706" />
                      <Text style={styles.gpsText}>{item.locationStatus}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.evidenceDeleteBtn}
                  onPress={() => handleRemoveEvidence(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.status.highPriority} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionSection}>
          <PrimaryButton
            title="Review Inspection"
            iconName="arrow-forward"
            onPress={handleProceed}
            loading={saving}
          />
        </View>
      </ScrollView>

      {/* Mock Evidence Add Modal */}
      <Modal
        visible={evidenceModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEvidenceModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register Mock Evidence Entry</Text>
              <TouchableOpacity onPress={() => setEvidenceModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalSub}>
                Simulating camera/media capture protocol for prototype demonstration.
              </Text>

              <Text style={styles.inputLabel}>Evidence Category</Text>
              <View style={styles.catChipsRow}>
                {(['Facility Entrance', 'Attendance Register', 'Service Delivery Area', 'General Infrastructure'] as MockEvidenceItem['category'][]).map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catChip, evidenceCategory === cat && styles.catChipActive]}
                      onPress={() => {
                        setEvidenceCategory(cat);
                        setEvidenceTitle(`${cat} ${evidenceType === 'photo' ? 'Photo' : evidenceType === 'video' ? 'Video' : 'Log'}`);
                      }}
                    >
                      <Text style={[styles.catChipText, evidenceCategory === cat && styles.catChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text style={[styles.inputLabel, { marginTop: spacing.md }]}>Entry Title / Label</Text>
              <TextInput
                style={[styles.textInput, { height: 42 }]}
                value={evidenceTitle}
                onChangeText={setEvidenceTitle}
                placeholder="Title"
                placeholderTextColor={colors.text.muted}
              />

              <View style={styles.modalNotice}>
                <Ionicons name="shield-outline" size={14} color={colors.brand.navyLight} />
                <Text style={styles.modalNoticeText}>
                  Location status will record as "Pending GPS integration" per MoSJE prototype rules.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <PrimaryButton
                  title="Confirm Evidence Entry"
                  iconName="checkmark"
                  onPress={handleConfirmAddEvidence}
                />
                <SecondaryButton
                  title="Cancel"
                  onPress={() => setEvidenceModalVisible(false)}
                  style={{ marginTop: 8 }}
                />
              </View>
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
  centerContainer: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 900,
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
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  backButtonText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
    marginLeft: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  errorBannerText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: '#92400E',
    flex: 1,
  },
  prefillCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.base,
  },
  prefillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  prefillTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  prefillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  prefillBtn: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.brand.primaryLight,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.xs,
  },
  prefillBtnText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  formCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: typography.sizes.xs + 1,
    color: colors.text.primary,
    lineHeight: 20,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  evidenceNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: 6,
  },
  evidenceNoticeText: {
    fontSize: 11,
    color: colors.brand.navyLight,
    lineHeight: 16,
    flex: 1,
  },
  evidenceActionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  evidenceActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    ...shadows.xs,
  },
  evidenceActionBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navy,
    marginTop: 4,
  },
  evidenceEmptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  evidenceEmptyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  evidenceEmptyDesc: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
    lineHeight: 16,
  },
  evidenceList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    ...shadows.xs,
  },
  evidenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  evidenceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceTextCol: {
    flex: 1,
  },
  evidenceTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  evidenceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  evidenceCategory: {
    fontSize: 10,
    color: colors.brand.primary,
    fontWeight: typography.weights.medium,
  },
  evidenceDot: {
    fontSize: 10,
    color: colors.text.muted,
  },
  evidenceTime: {
    fontSize: 10,
    color: colors.text.muted,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  gpsText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: typography.weights.medium,
  },
  evidenceDeleteBtn: {
    padding: 8,
  },
  actionSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  modalTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  modalContent: {
    padding: spacing.base,
  },
  modalSub: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  catChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  catChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  catChipText: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  catChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  modalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginTop: spacing.md,
    gap: 6,
  },
  modalNoticeText: {
    fontSize: 10,
    color: colors.brand.navyLight,
    flex: 1,
  },
  modalActions: {
    marginTop: spacing.lg,
  },
});
