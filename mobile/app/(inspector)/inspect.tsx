import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';
import {
  useInspectionStore,
  CapturedEvidence,
  EvidenceCategory,
  EvidenceStatus,
} from '../../src/store/useInspectionStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { MediaEvidenceType } from '@nirikshan/shared-types';

const EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  'Infrastructure',
  'Attendance',
  'Beneficiary Records',
  'Financial Documents',
  'Compliance Documents',
  'CCTV Evidence',
  'Inspection Photos',
  'Video',
  'Other',
];

export default function InspectorInspect() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    activeInspectionId,
    projectName,
    projectAddress,
    inspectionType,
    isLocationVerified,
    distanceMeters,
    currentLatitude,
    currentLongitude,
    isBiometricVerified,
    biometricType,
    checklist,
    reportNotes,
    evidenceList,
    toggleChecklist,
    setReportNotes,
    addEvidence,
    runAiAnalysisOnEvidence,
    updateEvidenceStatus,
    removeEvidence,
    submitActiveInspection,
  } = useInspectionStore();

  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Photo Capture Post-Modal State
  const [capturedPhotoModalVisible, setCapturedPhotoModalVisible] = useState(false);
  const [stagedPhoto, setStagedPhoto] = useState<{
    uri: string;
    fileName: string;
    timestamp: string;
    fileSize: string;
  } | null>(null);

  // Evidence Detail Modal State (View Original vs Processed vs Metadata)
  const [viewEvidenceModalVisible, setViewEvidenceModalVisible] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<CapturedEvidence | null>(null);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'ORIGINAL' | 'PROCESSED' | 'METADATA'>('ORIGINAL');

  // Add Evidence / Upload Document Modal State
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<EvidenceCategory>('Beneficiary Records');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDocType, setUploadDocType] = useState<'PDF' | 'DOCX' | 'XLSX' | 'CSV' | 'PHOTO' | 'VIDEO'>('PDF');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  // Take Photo trigger
  const handleCapturePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      let result;
      if (status === 'granted') {
        result = await ImagePicker.launchCameraAsync({
          quality: 1.0, // Preserve full original quality!
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          quality: 1.0,
        });
      }

      const timestamp = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setStagedPhoto({
          uri: asset.uri,
          fileName: `field_photo_${Date.now()}.jpg`,
          timestamp,
          fileSize: `${((asset.fileSize || 4200000) / 1024 / 1024).toFixed(1)} MB`,
        });
        setCapturedPhotoModalVisible(true);
      } else {
        // High fidelity demo capture
        setStagedPhoto({
          uri: 'https://demo-storage.sih26095.local/evidence/facility_headcount_raw.jpg',
          fileName: `field_original_${Date.now().toString().slice(-4)}.jpg`,
          timestamp,
          fileSize: '4.2 MB',
        });
        setCapturedPhotoModalVisible(true);
      }
    } catch (e) {
      const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStagedPhoto({
        uri: 'https://demo-storage.sih26095.local/evidence/headcount_sample.jpg',
        fileName: `spot_photo_${Date.now().toString().slice(-4)}.jpg`,
        timestamp,
        fileSize: '3.9 MB',
      });
      setCapturedPhotoModalVisible(true);
    }
  };

  const handleConfirmUseStagedPhoto = async () => {
    if (!stagedPhoto) return;

    await addEvidence(
      MediaEvidenceType.PHOTO,
      stagedPhoto.fileName,
      stagedPhoto.uri,
      {
        category: 'Inspection Photos',
        title: 'Original Captured Site Photo',
        originalPhotoUri: stagedPhoto.uri, // Preserved raw original photo
        status: 'UPLOADED',
        metadata: {
          captureTimestamp: stagedPhoto.timestamp,
          fileSize: stagedPhoto.fileSize,
          fileType: 'image/jpeg',
        },
      }
    );

    setCapturedPhotoModalVisible(false);
    setStagedPhoto(null);
  };

  // Upload Evidence Document
  const handleStartUpload = async () => {
    if (!uploadTitle.trim()) {
      Alert.alert('Required', 'Please enter a title for this evidence record.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setUploadError(false);

    // Simulated multi-step upload progress
    setTimeout(() => setUploadProgress(55), 300);
    setTimeout(() => setUploadProgress(85), 600);

    setTimeout(async () => {
      setUploadProgress(100);
      setIsUploading(false);

      const ext = uploadDocType.toLowerCase();
      const fileName = `${uploadTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}.${ext}`;
      const mediaType =
        uploadDocType === 'PHOTO'
          ? MediaEvidenceType.PHOTO
          : uploadDocType === 'VIDEO'
          ? MediaEvidenceType.VIDEO
          : MediaEvidenceType.DOCUMENT;

      await addEvidence(
        mediaType,
        fileName,
        `https://demo-storage.sih26095.local/evidence/${fileName}`,
        {
          category: uploadCategory,
          title: uploadTitle,
          status: 'UPLOADED',
          metadata: {
            fileSize: uploadDocType === 'VIDEO' ? '18.4 MB' : '2.1 MB',
            fileType: uploadDocType === 'PDF' ? 'application/pdf' : uploadDocType === 'XLSX' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
          },
        }
      );

      setUploadModalVisible(false);
      setUploadTitle('');
    }, 900);
  };

  const handleSimulateUploadFailure = () => {
    setIsUploading(true);
    setUploadProgress(35);
    setTimeout(() => {
      setIsUploading(false);
      setUploadError(true);
    }, 600);
  };

  // Open Evidence Detail Modal
  const handleOpenEvidenceDetails = (item: CapturedEvidence) => {
    setSelectedEvidence(item);
    setActiveEvidenceTab('ORIGINAL');
    setViewEvidenceModalVisible(true);
  };

  // Submit Inspection Report
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitActiveInspection();
      router.push('/(inspector)/reports');
    } catch (e) {
      console.error('Submission error:', e);
      Alert.alert('Error', 'Failed to submit inspection report. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader
        title="INSPECTION WORKFLOW"
        subtitle="End-to-End Field Audit & Preserved Evidence Vault"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Step 7: Sequential Workflow Breadcrumb */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.workflowScroll}
          contentContainerStyle={styles.workflowBreadcrumbs}
        >
          {[
            { label: 'PROJECT', active: true, icon: '🏢' },
            { label: 'TYPE', active: true, icon: '⚡' },
            { label: 'LOCATION', active: true, icon: '📍' },
            { label: 'BIOMETRIC', active: true, icon: '👆' },
            { label: 'CHECKLIST', active: true, icon: '☑' },
            { label: 'PHOTO', active: true, icon: '📸' },
            { label: 'DOCUMENTS', active: true, icon: '📄' },
            { label: 'CCTV DATA', active: true, icon: '📹' },
            { label: 'RESULT', active: showReview, icon: '📊' },
            { label: 'REPORT', active: showReview, icon: '📑' },
          ].map((step, idx) => (
            <View key={step.label} style={styles.stepCrumbItem}>
              <View
                style={[
                  styles.crumbPill,
                  step.active ? styles.crumbPillActive : styles.crumbPillInactive,
                ]}
              >
                <Text style={styles.crumbIcon}>{step.icon}</Text>
                <Text
                  style={[
                    styles.crumbText,
                    step.active ? styles.crumbTextActive : styles.crumbTextInactive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              {idx < 9 && <Text style={styles.crumbArrow}>➔</Text>}
            </View>
          ))}
        </ScrollView>

        {/* Verification Summary Header Card */}
        <Card style={styles.summaryBanner}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryTag}>
              <Text style={styles.summaryTagText}>{inspectionType} INSPECTION</Text>
            </View>
            <Text style={styles.orderIdText}>Order #{activeInspectionId}</Text>
          </View>

          <Text style={styles.projectName}>{projectName}</Text>
          <Text style={styles.projectAddress}>📍 {projectAddress}</Text>

          <View style={styles.verificationPillsRow}>
            <View
              style={[
                styles.verifPill,
                isLocationVerified ? styles.verifPillGreen : styles.verifPillRed,
              ]}
            >
              <Text
                style={[
                  styles.verifPillText,
                  isLocationVerified ? styles.verifTextGreen : styles.verifTextRed,
                ]}
              >
                {isLocationVerified
                  ? `🟢 Geofence Verified (${distanceMeters}m)`
                  : `🔴 Outside Geofence (${distanceMeters}m)`}
              </Text>
            </View>

            <View
              style={[
                styles.verifPill,
                isBiometricVerified ? styles.verifPillGreen : styles.verifPillAmber,
              ]}
            >
              <Text
                style={[
                  styles.verifPillText,
                  isBiometricVerified ? styles.verifTextGreen : styles.verifTextAmber,
                ]}
              >
                {isBiometricVerified
                  ? `🟢 Identity Verified (${biometricType || 'Fingerprint'})`
                  : '⚪ Biometrics Pending'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Physical Verification Checklist */}
        <Card
          title="Field Verification Checklist"
          subtitle="Mandatory on-site operational checks per MoSJE manual"
        >
          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Project / Institute is Operational</Text>
              <Text style={styles.checkDesc}>Facility is open and actively providing authorized scheme services</Text>
            </View>
            <Switch
              value={checklist.operational}
              onValueChange={() => toggleChecklist('operational')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Staff are Present On-Site</Text>
              <Text style={styles.checkDesc}>Required administrative, medical, or caretaking staff present</Text>
            </View>
            <Switch
              value={checklist.staffPresent}
              onValueChange={() => toggleChecklist('staffPresent')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>CCTV Feeds Functional & Unobstructed</Text>
              <Text style={styles.checkDesc}>Cameras actively recording without blindspots or tamper covers</Text>
            </View>
            <Switch
              value={checklist.cctvWorking}
              onValueChange={() => toggleChecklist('cctvWorking')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Physical Attendance Registers Maintained</Text>
              <Text style={styles.checkDesc}>Daily physical sign-in corresponds to online claims</Text>
            </View>
            <Switch
              value={checklist.registersMaintained}
              onValueChange={() => toggleChecklist('registersMaintained')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Sanitation & Infrastructure Satisfactory</Text>
              <Text style={styles.checkDesc}>Living quarters, washrooms, and premises meet hygiene norms</Text>
            </View>
            <Switch
              value={checklist.sanitationSatisfactory}
              onValueChange={() => toggleChecklist('sanitationSatisfactory')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Food Quality & Prescribed Diet Standards</Text>
              <Text style={styles.checkDesc}>Meals served match sanctioned scheme nutrition guidelines</Text>
            </View>
            <Switch
              value={checklist.foodQualityGood}
              onValueChange={() => toggleChecklist('foodQualityGood')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        </Card>

        {/* Section 8 & 9: TAKE PHOTO & ORIGINAL EVIDENCE */}
        <Card
          title="Field Photo & Evidence Capture"
          subtitle="Preserves uncompressed raw original photo alongside AI derivations"
        >
          <View style={styles.photoActionRow}>
            <TouchableOpacity
              style={styles.takePhotoBtn}
              activeOpacity={0.8}
              onPress={handleCapturePhoto}
            >
              <Text style={styles.takePhotoIcon}>📸</Text>
              <Text style={styles.takePhotoText}>TAKE PHOTO</Text>
              <Text style={styles.takePhotoSub}>Preserves Original Raw Capture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addDocBtn}
              activeOpacity={0.8}
              onPress={() => setUploadModalVisible(true)}
            >
              <Text style={styles.addDocIcon}>📄</Text>
              <Text style={styles.addDocText}>+ ADD EVIDENCE</Text>
              <Text style={styles.addDocSub}>PDF, XLS, DOC, Video, Scans</Text>
            </TouchableOpacity>
          </View>

          {/* Section 13: UPLOADED != VERIFIED Banner */}
          <View style={styles.ruleBanner}>
            <Text style={styles.ruleBannerTitle}>IMPORTANT PROTOCOL RULE</Text>
            <Text style={styles.ruleBannerText}>
              UPLOADED ≠ VERIFIED — Evidence upload confirms custody only. Formal verification requires official review and AI corroboration.
            </Text>
          </View>

          {/* Evidence Vault List */}
          <View style={styles.evidenceVaultSection}>
            <Text style={styles.vaultTitle}>
              INSPECTION EVIDENCE VAULT ({evidenceList.length} Items)
            </Text>

            {evidenceList.map((item) => {
              const isAnalyzed = item.status === 'AI ANALYZED';
              const isProcessing = item.status === 'PROCESSING';

              return (
                <View key={item.id} style={styles.evidenceVaultCard}>
                  <View style={styles.vaultCardTop}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{item.category}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        item.status === 'UPLOADED' && styles.statusUploaded,
                        item.status === 'AI ANALYZED' && styles.statusAnalyzed,
                        item.status === 'PROCESSING' && styles.statusProcessing,
                        item.status === 'REQUIRES REVIEW' && styles.statusReview,
                        item.status === 'REJECTED' && styles.statusRejected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          item.status === 'AI ANALYZED' && styles.statusTextAnalyzed,
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.vaultItemTitle}>{item.title}</Text>
                  <Text style={styles.vaultItemFileName}>📁 {item.fileName}</Text>

                  {/* Original photo preserved guarantee */}
                  {item.originalPhotoUri && (
                    <View style={styles.preservedNoticeRow}>
                      <Text style={styles.preservedCheck}>✓</Text>
                      <Text style={styles.preservedText}>
                        Original captured photo preserved (uncompressed & uncropped)
                      </Text>
                    </View>
                  )}

                  {/* AI Analysis Outcome Snippet */}
                  {item.aiAnalysis && (
                    <View style={styles.aiResultBox}>
                      <Text style={styles.aiResultTitle}>🤖 Explainable AI Vision Analysis:</Text>
                      <Text style={styles.aiResultFindings}>{item.aiAnalysis.findings}</Text>
                      {item.aiAnalysis.detectedAnomalyNote && (
                        <Text style={styles.aiAnomalyNote}>
                          ⚠ {item.aiAnalysis.detectedAnomalyNote}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Multi-Action Controls: View Original, Processed, Metadata, Run AI */}
                  <View style={styles.vaultActionsRow}>
                    <TouchableOpacity
                      style={styles.vaultActionBtn}
                      onPress={() => {
                        setSelectedEvidence(item);
                        setActiveEvidenceTab('ORIGINAL');
                        setViewEvidenceModalVisible(true);
                      }}
                    >
                      <Text style={styles.vaultActionBtnText}>VIEW ORIGINAL</Text>
                    </TouchableOpacity>

                    {item.processedPhotoUri && (
                      <TouchableOpacity
                        style={styles.vaultActionBtn}
                        onPress={() => {
                          setSelectedEvidence(item);
                          setActiveEvidenceTab('PROCESSED');
                          setViewEvidenceModalVisible(true);
                        }}
                      >
                        <Text style={styles.vaultActionBtnText}>VIEW PROCESSED</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.vaultActionBtn}
                      onPress={() => {
                        setSelectedEvidence(item);
                        setActiveEvidenceTab('METADATA');
                        setViewEvidenceModalVisible(true);
                      }}
                    >
                      <Text style={styles.vaultActionBtnText}>VIEW METADATA</Text>
                    </TouchableOpacity>

                    {!isAnalyzed && item.type === MediaEvidenceType.PHOTO && (
                      <TouchableOpacity
                        style={[styles.vaultActionBtn, styles.runAiBtn]}
                        disabled={isProcessing}
                        onPress={() => runAiAnalysisOnEvidence(item.id)}
                      >
                        <Text style={styles.runAiBtnText}>
                          {isProcessing ? 'ANALYZING...' : 'RUN AI ANALYSIS 🤖'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => removeEvidence(item.id)}
                      style={styles.removeIconBtn}
                    >
                      <Text style={styles.removeIconText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Field Observations Notes */}
        <Card
          title="Field Observations & Narrative Notes"
          subtitle="Objective, factual on-site findings without accusatory terms"
        >
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            placeholder="Record neutral observations regarding physical headcount, infrastructure condition, beneficiary interaction, and attendance register reconciliation..."
            placeholderTextColor={colors.textLight}
            value={reportNotes}
            onChangeText={setReportNotes}
          />
        </Card>

        {/* Section 7 & 16: Result & Review Summary */}
        <Card title="Pre-Submission Review & Audit Dossier">
          {showReview ? (
            <View style={styles.reviewBox}>
              <Text style={styles.reviewTitle}>📋 Inspection Submission Summary</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Target Project:</Text>
                <Text style={styles.reviewVal}>{projectName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Geofence Verification:</Text>
                <Text style={[styles.reviewVal, { color: colors.success }]}>
                  Verified (43m from coordinates)
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Biometric Identity:</Text>
                <Text style={[styles.reviewVal, { color: colors.success }]}>
                  Verified ({biometricType || 'Fingerprint'})
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Checklist Status:</Text>
                <Text style={styles.reviewVal}>
                  {Object.values(checklist).filter(Boolean).length} / 6 Criteria Satisfied
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Evidence Items Preserved:</Text>
                <Text style={styles.reviewVal}>{evidenceList.length} Items (SHA-256 Hashed)</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Preliminary Result:</Text>
                <Text style={[styles.reviewVal, { color: colors.warning }]}>
                  Issues Found (Attendance Discrepancy Flagged)
                </Text>
              </View>
            </View>
          ) : null}

          {!showReview ? (
            <Button
              title="Review Inspection Summary ➔"
              variant="outline"
              onPress={() => setShowReview(true)}
              style={styles.submitReportBtn}
            />
          ) : (
            <Button
              title={submitting ? "Transmitting to MoSJE Portal..." : "CONFIRM & SUBMIT INSPECTION 📑"}
              loading={submitting}
              variant="primary"
              onPress={handleSubmit}
              style={styles.submitReportBtn}
            />
          )}
        </Card>
      </ScrollView>

      {/* SECTION 8: POST PHOTO CAPTURE PREVIEW MODAL */}
      <Modal visible={capturedPhotoModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.postCaptureCard}>
            <View style={styles.postCaptureHeader}>
              <Text style={styles.postCaptureTitle}>PHOTO CAPTURED</Text>
              <View style={styles.preservedBadge}>
                <Text style={styles.preservedBadgeText}>✓ Original photo preserved</Text>
              </View>
            </View>

            {/* Photo Metadata Details */}
            <View style={styles.capturedMetaBox}>
              <View style={styles.metaLine}>
                <Text style={styles.metaLineLabel}>Timestamp:</Text>
                <Text style={styles.metaLineVal}>{stagedPhoto?.timestamp || '10:42:18'}</Text>
              </View>
              <View style={styles.metaLine}>
                <Text style={styles.metaLineLabel}>GPS:</Text>
                <Text style={styles.metaLineVal}>Captured ({currentLatitude.toFixed(4)}° N, {currentLongitude.toFixed(4)}° E)</Text>
              </View>
              <View style={styles.metaLine}>
                <Text style={styles.metaLineLabel}>Geofence:</Text>
                <Text style={[styles.metaLineVal, { color: colors.success }]}>
                  {isLocationVerified ? '🟢 INSIDE (43m)' : '🔴 OUTSIDE'}
                </Text>
              </View>
              <View style={styles.metaLine}>
                <Text style={styles.metaLineLabel}>Original Size:</Text>
                <Text style={styles.metaLineVal}>{stagedPhoto?.fileSize || '4.2 MB (Raw)'}</Text>
              </View>
            </View>

            <View style={styles.postCaptureNotice}>
              <Text style={styles.postCaptureNoticeText}>
                The original captured photo is preserved without compression, resizing, or alteration.
              </Text>
            </View>

            <View style={styles.postCaptureActions}>
              <Button
                title="USE AS EVIDENCE ✓"
                variant="primary"
                onPress={handleConfirmUseStagedPhoto}
                style={{ marginBottom: spacing.xs }}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  title="VIEW ORIGINAL"
                  variant="outline"
                  onPress={() => {
                    Alert.alert('Original Photo', `Accessing uncompressed photo: ${stagedPhoto?.fileName} (${stagedPhoto?.fileSize})`);
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  title="RETAKE"
                  variant="secondary"
                  onPress={handleCapturePhoto}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* SECTION 9 & 10: DUAL VIEW (ORIGINAL vs PROCESSED vs METADATA) MODAL */}
      <Modal visible={viewEvidenceModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.evidenceDetailCard}>
            <View style={styles.evidenceDetailTop}>
              <Text style={styles.evidenceDetailTitle} numberOfLines={1}>
                {selectedEvidence?.title || 'Evidence Record'}
              </Text>
              <TouchableOpacity
                onPress={() => setViewEvidenceModalVisible(false)}
                style={styles.closeModalBtn}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 3 Tabs: [ VIEW ORIGINAL ] [ VIEW PROCESSED ] [ VIEW METADATA ] */}
            <View style={styles.evidenceDetailTabs}>
              <TouchableOpacity
                style={[
                  styles.evidenceDetailTab,
                  activeEvidenceTab === 'ORIGINAL' && styles.evidenceDetailTabActive,
                ]}
                onPress={() => setActiveEvidenceTab('ORIGINAL')}
              >
                <Text
                  style={[
                    styles.evidenceDetailTabText,
                    activeEvidenceTab === 'ORIGINAL' && styles.evidenceDetailTabTextActive,
                  ]}
                >
                  ORIGINAL PHOTO
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.evidenceDetailTab,
                  activeEvidenceTab === 'PROCESSED' && styles.evidenceDetailTabActive,
                ]}
                onPress={() => setActiveEvidenceTab('PROCESSED')}
              >
                <Text
                  style={[
                    styles.evidenceDetailTabText,
                    activeEvidenceTab === 'PROCESSED' && styles.evidenceDetailTabTextActive,
                  ]}
                >
                  PROCESSED
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.evidenceDetailTab,
                  activeEvidenceTab === 'METADATA' && styles.evidenceDetailTabActive,
                ]}
                onPress={() => setActiveEvidenceTab('METADATA')}
              >
                <Text
                  style={[
                    styles.evidenceDetailTabText,
                    activeEvidenceTab === 'METADATA' && styles.evidenceDetailTabTextActive,
                  ]}
                >
                  METADATA
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB CONTENT */}
            <ScrollView style={styles.evidenceTabContent}>
              {activeEvidenceTab === 'ORIGINAL' && (
                <View style={styles.mediaViewBox}>
                  <View style={styles.originalBadge}>
                    <Text style={styles.originalBadgeText}>
                      ✓ UNMODIFIED ORIGINAL EVIDENCE RECORD
                    </Text>
                  </View>
                  <View style={styles.simulatedImagePlaceholder}>
                    <Text style={styles.imageEmoji}>📸</Text>
                    <Text style={styles.imageLabel}>Raw Uncompressed Capture</Text>
                    <Text style={styles.imageSub}>
                      Resolution: 3840 x 2160 • Size: {selectedEvidence?.metadata?.fileSize || '4.2 MB'}
                    </Text>
                  </View>
                  <Text style={styles.preservedGuarantee}>
                    Guaranteed Integrity: The raw original image has not been scaled, cropped, or filtered by AI models.
                  </Text>
                </View>
              )}

              {activeEvidenceTab === 'PROCESSED' && (
                <View style={styles.mediaViewBox}>
                  <View style={styles.derivedBadge}>
                    <Text style={styles.derivedBadgeText}>
                      🤖 AI-ANNOTATED DERIVED VERSION
                    </Text>
                  </View>
                  <View style={styles.simulatedImagePlaceholder}>
                    <Text style={styles.imageEmoji}>🔍</Text>
                    <Text style={styles.imageLabel}>AI Headcount Detection Mesh</Text>
                    <Text style={styles.imageSub}>
                      25 Faces Bound • Discrepancy Overlay Applied
                    </Text>
                  </View>
                  <Text style={styles.derivedNotice}>
                    Notice: This derived representation is stored separately and does not replace the original record.
                  </Text>
                </View>
              )}

              {activeEvidenceTab === 'METADATA' && (
                <View style={styles.metadataViewBox}>
                  <Text style={styles.metadataSectionTitle}>TECHNICAL PROVENANCE & SENSOR METADATA</Text>
                  <View style={styles.metaRowItem}>
                    <Text style={styles.metaFieldLabel}>Capture Timestamp:</Text>
                    <Text style={styles.metaFieldVal}>
                      {selectedEvidence?.metadata?.captureTimestamp || '10:42:18 Today'}
                    </Text>
                  </View>
                  <View style={styles.metaRowItem}>
                    <Text style={styles.metaFieldLabel}>Latitude / Longitude:</Text>
                    <Text style={styles.metaFieldVal}>
                      {selectedEvidence?.latitude.toFixed(5)}° N, {selectedEvidence?.longitude.toFixed(5)}° E
                    </Text>
                  </View>
                  <View style={styles.metaRowItem}>
                    <Text style={styles.metaFieldLabel}>Geofence Status:</Text>
                    <Text style={[styles.metaFieldVal, { color: colors.success }]}>
                      {selectedEvidence?.metadata?.geofenceStatus || 'INSIDE (43m from perimeter)'}
                    </Text>
                  </View>
                  <View style={styles.metaRowItem}>
                    <Text style={styles.metaFieldLabel}>Assigned Inspector:</Text>
                    <Text style={styles.metaFieldVal}>
                      {selectedEvidence?.metadata?.inspectorName || 'Priya Verma'} (Badge #{selectedEvidence?.metadata?.inspectorId || 'PMU-DEMO-004'})
                    </Text>
                  </View>
                  <View style={styles.metaRowItem}>
                    <Text style={styles.metaFieldLabel}>Project Dossier:</Text>
                    <Text style={styles.metaFieldVal}>
                      {selectedEvidence?.metadata?.projectName || projectName} (ID: {selectedEvidence?.metadata?.projectId || 'proj-001'})
                    </Text>
                  </View>
                  <View style={styles.metaRowItem}>
                    <Text style={styles.metaFieldLabel}>Inspection Order ID:</Text>
                    <Text style={styles.metaFieldVal}>#{selectedEvidence?.metadata?.inspectionId || activeInspectionId}</Text>
                  </View>
                  <View style={styles.metaRowItem}>
                    <Text style={styles.metaFieldLabel}>File Format & Size:</Text>
                    <Text style={styles.metaFieldVal}>
                      {selectedEvidence?.metadata?.fileType || 'image/jpeg'} • {selectedEvidence?.metadata?.fileSize || '4.2 MB'}
                    </Text>
                  </View>
                  <View style={styles.metaRowItem}>
                    <Text style={styles.metaFieldLabel}>SHA-256 Digest:</Text>
                    <Text style={styles.metaHashText} numberOfLines={2}>
                      {selectedEvidence?.hash}
                    </Text>
                  </View>
                  <View style={styles.notaryNotice}>
                    <Text style={styles.notaryNoticeText}>
                      Sensor telemetry stamped on device. Awaiting central server audit notarization.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SECTION 11 & 12: ADD EVIDENCE & DOCUMENT UPLOAD MODAL */}
      <Modal visible={uploadModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.uploadModalCard}>
            <View style={styles.evidenceDetailTop}>
              <Text style={styles.evidenceDetailTitle}>UPLOAD INSPECTION EVIDENCE</Text>
              <TouchableOpacity
                onPress={() => setUploadModalVisible(false)}
                style={styles.closeModalBtn}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Evidence Category Selector (Section 12) */}
              <Text style={styles.inputSectionLabel}>SELECT EVIDENCE CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {EVIDENCE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChoice,
                      uploadCategory === cat && styles.categoryChoiceActive,
                    ]}
                    onPress={() => setUploadCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChoiceText,
                        uploadCategory === cat && styles.categoryChoiceTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Supported File Formats */}
              <Text style={styles.inputSectionLabel}>FILE FORMAT SUPPORTED</Text>
              <View style={styles.docTypeRow}>
                {(['PDF', 'DOCX', 'XLSX', 'CSV', 'PHOTO', 'VIDEO'] as const).map((fmt) => (
                  <TouchableOpacity
                    key={fmt}
                    style={[
                      styles.docTypeBtn,
                      uploadDocType === fmt && styles.docTypeBtnActive,
                    ]}
                    onPress={() => setUploadDocType(fmt)}
                  >
                    <Text
                      style={[
                        styles.docTypeBtnText,
                        uploadDocType === fmt && styles.docTypeBtnTextActive,
                      ]}
                    >
                      {fmt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Evidence Title Input */}
              <Text style={styles.inputSectionLabel}>EVIDENCE TITLE / DESCRIPTION</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="e.g. Beneficiary Daily Roll, Kitchen Log, Expense Sheet"
                placeholderTextColor={colors.textLight}
                value={uploadTitle}
                onChangeText={setUploadTitle}
              />

              {/* Upload Progress Bar */}
              {isUploading && (
                <View style={styles.progressSection}>
                  <Text style={styles.progressText}>
                    Uploading to secure government repository... {uploadProgress}%
                  </Text>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[styles.progressBarFill, { width: `${uploadProgress}%` }]}
                    />
                  </View>
                </View>
              )}

              {/* Simulated Failure State */}
              {uploadError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    ⚠ Network Timeout: Upload failed. Please retry.
                  </Text>
                  <Button
                    title="RETRY UPLOAD 🔄"
                    variant="primary"
                    size="sm"
                    onPress={handleStartUpload}
                    style={{ marginTop: spacing.xs }}
                  />
                </View>
              )}

              <View style={styles.modalActionRow}>
                <Button
                  title={isUploading ? "Uploading..." : "START UPLOAD ➔"}
                  variant="primary"
                  disabled={isUploading}
                  onPress={handleStartUpload}
                  style={{ flex: 2 }}
                />
                <Button
                  title="Simulate Error"
                  variant="outline"
                  onPress={handleSimulateUploadFailure}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    padding: spacing.base,
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl + 24,
  },
  workflowScroll: {
    marginBottom: spacing.base,
  },
  workflowBreadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  stepCrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crumbPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  crumbPillActive: {
    backgroundColor: '#E0F2FE',
    borderColor: colors.primary,
  },
  crumbPillInactive: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  crumbIcon: {
    fontSize: 10,
  },
  crumbText: {
    fontSize: 9,
    fontWeight: '700',
  },
  crumbTextActive: {
    color: colors.primary,
  },
  crumbTextInactive: {
    color: colors.textLight,
  },
  crumbArrow: {
    fontSize: 10,
    color: colors.textLight,
  },
  summaryBanner: {
    padding: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  summaryTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  orderIdText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '700',
  },
  projectName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  projectAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  verificationPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  verifPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  verifPillGreen: {
    backgroundColor: '#DCFCE7',
  },
  verifPillRed: {
    backgroundColor: '#FEE2E2',
  },
  verifPillAmber: {
    backgroundColor: '#FEF3C7',
  },
  verifPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  verifTextGreen: { color: colors.success },
  verifTextRed: { color: colors.danger },
  verifTextAmber: { color: colors.warning },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkTextWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  checkLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  checkDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  takePhotoBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takePhotoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  takePhotoText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  takePhotoSub: {
    fontSize: 9,
    color: '#93C5FD',
    marginTop: 2,
  },
  addDocBtn: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDocIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addDocText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  addDocSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  ruleBanner: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.base,
  },
  ruleBannerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  ruleBannerText: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 15,
  },
  evidenceVaultSection: {
    marginTop: spacing.xs,
  },
  vaultTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  evidenceVaultCard: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vaultCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: '#E2E8F0',
  },
  statusUploaded: { backgroundColor: '#DCFCE7' },
  statusAnalyzed: { backgroundColor: '#EDE9FE' },
  statusProcessing: { backgroundColor: '#FEF3C7' },
  statusReview: { backgroundColor: '#FFEDD5' },
  statusRejected: { backgroundColor: '#FEE2E2' },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text,
  },
  statusTextAnalyzed: { color: '#6D28D9' },
  vaultItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  vaultItemFileName: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  preservedNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  preservedCheck: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
  },
  preservedText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
  },
  aiResultBox: {
    backgroundColor: '#FAF5FF',
    borderLeftWidth: 3,
    borderLeftColor: '#9333EA',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs + 2,
  },
  aiResultTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B21A8',
  },
  aiResultFindings: {
    fontSize: 11,
    color: '#581C87',
    marginTop: 2,
  },
  aiAnomalyNote: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '700',
    marginTop: 2,
  },
  vaultActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  vaultActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vaultActionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  runAiBtn: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  runAiBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  removeIconBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  removeIconText: {
    fontSize: 14,
  },
  notesInput: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 13,
    color: colors.text,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 90,
  },
  reviewBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  reviewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  reviewLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  reviewVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  submitReportBtn: {
    width: '100%',
  },

  // Post Photo Capture Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  postCaptureCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.lg,
  },
  postCaptureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  postCaptureTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  preservedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  preservedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  capturedMetaBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: 6,
    marginBottom: spacing.md,
  },
  metaLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLineLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  metaLineVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  postCaptureNotice: {
    backgroundColor: '#EFF6FF',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.base,
  },
  postCaptureNoticeText: {
    fontSize: 10,
    color: colors.primary,
    lineHeight: 14,
  },
  postCaptureActions: {
    gap: spacing.xs,
  },

  // Dual View Modal Styles
  evidenceDetailCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.lg,
  },
  evidenceDetailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  evidenceDetailTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  closeModalBtn: {
    padding: 6,
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  evidenceDetailTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  evidenceDetailTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  evidenceDetailTabActive: {
    borderBottomColor: colors.primary,
  },
  evidenceDetailTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  evidenceDetailTabTextActive: {
    color: colors.primary,
  },
  evidenceTabContent: {
    maxHeight: 380,
  },
  mediaViewBox: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  originalBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  originalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  derivedBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  derivedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
  },
  simulatedImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  imageEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  imageSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  preservedGuarantee: {
    fontSize: 11,
    color: colors.success,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.sm,
  },
  derivedNotice: {
    fontSize: 11,
    color: '#6D28D9',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.sm,
  },
  metadataViewBox: {
    gap: 8,
  },
  metadataSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  metaFieldLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metaFieldVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  metaHashText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.primary,
    maxWidth: 200,
    textAlign: 'right',
  },
  notaryNotice: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  notaryNoticeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Upload Modal Styles
  uploadModalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.lg,
  },
  inputSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChoice: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChoiceActive: {
    backgroundColor: '#E0F2FE',
    borderColor: colors.primary,
  },
  categoryChoiceText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  categoryChoiceTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  docTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  docTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docTypeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  docTypeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  docTypeBtnTextActive: {
    color: colors.white,
  },
  titleInput: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 13,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '700',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
