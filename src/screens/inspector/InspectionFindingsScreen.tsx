/**
 * InspectionFindingsScreen
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Inspector narrative findings (objective observations) and evidence capture workspace.
 * Strictly avoids accusatory terms; adheres to MoSJE e-governance standards.
 * Integrated native-style executive header with back navigation.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentRole, switchRole } = useAuth();
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

  // Motion values
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Pulsing skeleton animation loop
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

  // Skeleton Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

        {/* Integrated Skeleton Header */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
          <View style={styles.headerInner}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerBranding}>
                <View style={styles.headerEmblem}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
                </View>
                <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
              </View>
            </View>

            <View style={styles.headerMainRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBackBtn}
                accessibilityRole="button"
                accessibilityLabel="Back to checklist"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Findings & Evidence
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Loading record...
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skeleton Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonLine, { width: 140, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '80%', height: 22, marginTop: 10, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '50%', height: 14, marginTop: 6, opacity: skeletonPulse }]} />
          </View>

          <View style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { height: 80, marginTop: 12, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { height: 80, marginTop: 12, opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Integrated Executive MoSJE Header with Native Back Navigation */}
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
              accessibilityLabel="Back to checklist"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Findings & Evidence
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Order #{inspectionId} • Documentation & Notes
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + spacing.xxxl + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          }}
        >
          {/* Validation Error Banner */}
          {validationError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.status.warning} />
              <Text style={styles.errorBannerText}>{validationError}</Text>
            </View>
          ) : null}

          {/* Facility Context Card */}
          {inspection ? (
            <View style={styles.facilityCard}>
              <View style={styles.facilityTopRow}>
                <View style={styles.facilityTypeRow}>
                  {inspection.type === 'Surprise Inspection' && (
                    <Ionicons name="flash" size={12} color={colors.status.highPriority} style={{ marginRight: 4 }} />
                  )}
                  <Text style={styles.facilityTypeText}>{inspection.type}</Text>
                </View>
                <Text style={styles.facilityOrderId}>Order #{inspection.id}</Text>
              </View>
              <Text style={styles.facilityName}>{inspection.projectName}</Text>
              {inspection.projectAddress ? (
                <View style={styles.facilityAddressRow}>
                  <Ionicons name="location-outline" size={13} color={colors.brand.primary} />
                  <Text style={styles.facilityAddressText} numberOfLines={1}>
                    {inspection.projectAddress}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Quick-Fill Standard Findings Bar */}
          <View style={styles.prefillCard}>
            <View style={styles.prefillHeader}>
              <Ionicons name="document-text-outline" size={15} color={colors.brand.primary} />
              <Text style={styles.prefillTitle}>Standard Findings Templates:</Text>
            </View>
            <View style={styles.prefillRow}>
              {SAMPLE_PREFILLS.map((pf) => (
                <TouchableOpacity
                  key={pf.title}
                  style={styles.prefillBtn}
                  onPress={() => handleApplyPrefill(pf)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Apply ${pf.title} template`}
                >
                  <Ionicons name="add-circle-outline" size={13} color={colors.brand.primary} style={{ marginRight: 4 }} />
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
                textAlignVertical="top"
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
                textAlignVertical="top"
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
                textAlignVertical="top"
              />
            </View>

            {/* Additional Remarks */}
            <View style={[styles.inputGroup, { marginBottom: 0 }]}>
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
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Evidence Section */}
          <SectionHeader
            title="Evidence Capture"
            subtitle="Attach timestamped verification media"
            badgeCount={evidenceList.length}
          />

          {/* Evidence Notice Banner */}
          <View style={styles.evidenceNoticeBox}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.brand.navyLight} />
            <Text style={styles.evidenceNoticeText}>
              Field evidence registration — secure media records are cataloged with timestamp and premises location status for the official audit docket.
            </Text>
          </View>

          {/* Evidence Action Buttons */}
          <View style={styles.evidenceActionGrid}>
            <TouchableOpacity
              style={styles.evidenceActionBtn}
              onPress={() => handleOpenAddEvidence('photo', 'Facility Entrance')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Take on-site photo"
            >
              <View style={styles.evidenceActionIconWrap}>
                <Ionicons name="camera" size={20} color={colors.brand.primary} />
              </View>
              <Text style={styles.evidenceActionBtnText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.evidenceActionBtn}
              onPress={() => handleOpenAddEvidence('video', 'Service Delivery Area')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Record walkthrough video"
            >
              <View style={[styles.evidenceActionIconWrap, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="videocam" size={20} color="#6366F1" />
              </View>
              <Text style={styles.evidenceActionBtnText}>Record Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.evidenceActionBtn}
              onPress={() => handleOpenAddEvidence('document', 'Attendance Register')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Attach register or document evidence"
            >
              <View style={[styles.evidenceActionIconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="attach" size={20} color={colors.status.normal} />
              </View>
              <Text style={styles.evidenceActionBtnText}>Attach Evidence</Text>
            </TouchableOpacity>
          </View>

          {/* Evidence Items List */}
          {evidenceList.length === 0 ? (
            <View style={styles.evidenceEmptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="images-outline" size={28} color={colors.text.muted} />
              </View>
              <Text style={styles.evidenceEmptyTitle}>No evidence attached yet</Text>
              <Text style={styles.evidenceEmptyDesc}>
                Tap one of the buttons above to register on-site photo, video walkthrough, or document verification entries.
              </Text>
            </View>
          ) : (
            <View style={styles.evidenceList}>
              {evidenceList.map((item) => (
                <View key={item.id} style={styles.evidenceCard}>
                  <View style={styles.evidenceLeft}>
                    <View
                      style={[
                        styles.evidenceIconCircle,
                        item.type === 'video' && { backgroundColor: '#F5F3FF' },
                        item.type === 'document' && { backgroundColor: '#F0FDF4' },
                      ]}
                    >
                      <Ionicons
                        name={item.type === 'photo' ? 'camera' : item.type === 'video' ? 'videocam' : 'document-text'}
                        size={18}
                        color={item.type === 'photo' ? colors.brand.primary : item.type === 'video' ? '#6366F1' : colors.status.normal}
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
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.title}`}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.status.highPriority} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Action Section */}
          <View style={styles.actionSection}>
            <PrimaryButton
              title="Review Inspection"
              iconName="arrow-forward"
              onPress={handleProceed}
              loading={saving}
              style={styles.primaryActionBtn}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Evidence Add Modal */}
      <Modal
        visible={evidenceModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEvidenceModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons
                  name={evidenceType === 'photo' ? 'camera' : evidenceType === 'video' ? 'videocam' : 'attach'}
                  size={18}
                  color={colors.brand.primary}
                />
                <Text style={styles.modalTitle}>Register Evidence Entry</Text>
              </View>
              <TouchableOpacity
                onPress={() => setEvidenceModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalSub}>
                Record photo, video, or documentation metadata for on-site verification.
              </Text>

              <Text style={styles.modalFieldLabel}>Evidence Category</Text>
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
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.catChipText, evidenceCategory === cat && styles.catChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text style={[styles.modalFieldLabel, { marginTop: spacing.md }]}>Entry Title / Label</Text>
              <TextInput
                style={[styles.textInput, { height: 44 }]}
                value={evidenceTitle}
                onChangeText={setEvidenceTitle}
                placeholder="Title"
                placeholderTextColor={colors.text.muted}
              />

              <View style={styles.modalNotice}>
                <Ionicons name="information-circle-outline" size={14} color={colors.brand.navyLight} />
                <Text style={styles.modalNoticeText}>
                  Location status will record as "Pending GPS integration" per MoSJE field operating rules.
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
  scrollContent: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
  },

  // Executive Header
  headerContainer: {
    backgroundColor: colors.brand.navy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    ...shadows.sm,
  },
  headerInner: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmblem: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerMinistry: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleBadgeText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(42, 92, 224, 0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(42, 92, 224, 0.4)',
  },
  switchText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },

  // Facility Context Card
  facilityCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  facilityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  facilityTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityTypeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  facilityOrderId: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  facilityName: {
    fontSize: typography.sizes.sm + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  facilityAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  facilityAddressText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    flex: 1,
  },

  // Validation Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.base,
    gap: 8,
  },
  errorBannerText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },

  // Prefill Templates Bar
  prefillCard: {
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.status.infoBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.base,
  },
  prefillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  prefillTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  prefillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prefillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
    ...shadows.xs,
  },
  prefillBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },

  // Form Card
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
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 2,
    fontSize: typography.sizes.xs + 1,
    color: colors.text.primary,
    lineHeight: 20,
  },
  textArea: {
    minHeight: 76,
    textAlignVertical: 'top',
  },

  // Evidence Notice
  evidenceNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.base,
    gap: 8,
  },
  evidenceNoticeText: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
    flex: 1,
  },

  // Evidence Action Buttons
  evidenceActionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.base,
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
    minHeight: 74,
    ...shadows.xs,
  },
  evidenceActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  evidenceActionBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },

  // Empty State
  evidenceEmptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    marginBottom: spacing.base,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  evidenceEmptyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  evidenceEmptyDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
    lineHeight: 16,
  },

  // Evidence List
  evidenceList: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    ...shadows.xs,
  },
  evidenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    flex: 1,
  },
  evidenceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceTextCol: {
    flex: 1,
  },
  evidenceTitle: {
    fontSize: typography.sizes.xs + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  evidenceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  evidenceCategory: {
    fontSize: 11,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
  },
  evidenceDot: {
    fontSize: 10,
    color: colors.text.muted,
  },
  evidenceTime: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  gpsText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: typography.weights.medium,
  },
  evidenceDeleteBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },

  // Action Section
  actionSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  primaryActionBtn: {
    minHeight: 48,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.65)',
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
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  modalFieldLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 6,
  },
  catChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    fontSize: 11,
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
    backgroundColor: colors.brand.primaryLight,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginTop: spacing.md,
    gap: 6,
  },
  modalNoticeText: {
    fontSize: 11,
    color: colors.brand.navyLight,
    flex: 1,
  },
  modalActions: {
    marginTop: spacing.lg,
  },

  // Skeleton Styles
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
});
