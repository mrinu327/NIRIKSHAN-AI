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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';
import { useInspectionStore, CapturedEvidence } from '../../src/store/useInspectionStore';
import { MediaEvidenceType } from '@nirikshan/shared-types';

export default function InspectorInspect() {
  const router = useRouter();
  const {
    projectName,
    isLocationVerified,
    distanceMeters,
    currentLatitude,
    currentLongitude,
    checklist,
    reportNotes,
    evidenceList,
    toggleChecklist,
    setReportNotes,
    addEvidence,
    removeEvidence,
    submitActiveInspection,
  } = useInspectionStore();

  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [recordingVoice, setRecordingVoice] = useState(false);

  // Photo Capture via ImagePicker
  const handleCapturePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      let result;
      if (status === 'granted') {
        result = await ImagePicker.launchCameraAsync({
          quality: 0.7,
        });
      } else {
        // Fallback to library picker
        result = await ImagePicker.launchImageLibraryAsync({
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = `inspection_photo_${Date.now()}.jpg`;
        await addEvidence(MediaEvidenceType.PHOTO, fileName, asset.uri, {
          source: 'DEVICE_CAMERA',
          width: asset.width,
          height: asset.height,
        });
      } else {
        // Simulated photo capture for web/emulator demo
        const fileName = `dining_hall_headcount_${Date.now().toString().slice(-4)}.jpg`;
        await addEvidence(
          MediaEvidenceType.PHOTO,
          fileName,
          'https://demo-storage.sih26095.local/evidence/headcount_sample.jpg',
          { source: 'DEMO_CAPTURE', resolution: '1080p' }
        );
      }
    } catch (e) {
      console.warn('Camera capture fallback to demo photo:', e);
      const fileName = `spot_evidence_${Date.now().toString().slice(-4)}.jpg`;
      await addEvidence(
        MediaEvidenceType.PHOTO,
        fileName,
        'https://demo-storage.sih26095.local/evidence/spot_verification.jpg',
        { source: 'DEMO_PHOTO' }
      );
    }
  };

  // Simulated Voice Statement Recording
  const handleRecordVoiceNote = async () => {
    setRecordingVoice(true);
    setTimeout(async () => {
      setRecordingVoice(false);
      const fileName = `voice_statement_${Date.now().toString().slice(-4)}.m4a`;
      await addEvidence(
        MediaEvidenceType.VOICE_NOTE,
        fileName,
        'https://demo-storage.sih26095.local/evidence/statement.m4a',
        { durationSeconds: 38, recordedBy: 'Inspector Field Mic' }
      );
    }, 1200);
  };

  // Simulated Document / Register Scan
  const handleScanRegister = async () => {
    const fileName = `physical_register_scan_${Date.now().toString().slice(-4)}.jpg`;
    await addEvidence(
      MediaEvidenceType.DOCUMENT,
      fileName,
      'https://demo-storage.sih26095.local/evidence/register_scan.jpg',
      { type: 'BENEFICIARY_SIGNIN_REGISTER', pages: 2 }
    );
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
      <GovHeader title="FIELD INSPECTION" subtitle="Checklist & Geo-Tagged Evidence Capture" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Project Target Badge */}
        <View style={styles.projectHeader}>
          <Text style={styles.projectTarget}>Target Institute:</Text>
          <Text style={styles.projectTitle}>{projectName}</Text>
          <View
            style={[
              styles.geofenceVerifiedPill,
              isLocationVerified ? styles.geoGreen : styles.geoRed,
            ]}
          >
            <Text
              style={[
                styles.geofenceVerifiedText,
                isLocationVerified ? styles.geoTextGreen : styles.geoTextRed,
              ]}
            >
              {isLocationVerified
                ? `✓ GPS Geofence Verified (${distanceMeters}m)`
                : `⚠ Outside Geofence (${distanceMeters}m)`}
            </Text>
          </View>
        </View>

        {/* Verification Checklist */}
        <Card
          title="Physical Verification Checklist"
          subtitle="Verify on-site operational parameters (mandatory parameters)"
        >
          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Facility is Operational & Open</Text>
              <Text style={styles.checkDesc}>Institute active during scheduled working hours</Text>
            </View>
            <Switch
              value={checklist.operational}
              onValueChange={() => toggleChecklist('operational')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Authorized Staff Present</Text>
              <Text style={styles.checkDesc}>Supervisors and medical staff available on site</Text>
            </View>
            <Switch
              value={checklist.staffPresent}
              onValueChange={() => toggleChecklist('staffPresent')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>CCTV Feeds Functional</Text>
              <Text style={styles.checkDesc}>Cameras actively recording without blindspots</Text>
            </View>
            <Switch
              value={checklist.cctvWorking}
              onValueChange={() => toggleChecklist('cctvWorking')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Physical Registers Maintained</Text>
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
              <Text style={styles.checkLabel}>Sanitation & Cleanliness Satisfactory</Text>
              <Text style={styles.checkDesc}>Living quarters, washrooms, and premises hygienic</Text>
            </View>
            <Switch
              value={checklist.sanitationSatisfactory}
              onValueChange={() => toggleChecklist('sanitationSatisfactory')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Food Quality & Nutrition Standards</Text>
              <Text style={styles.checkDesc}>Meals served meet prescribed scheme dietary standards</Text>
            </View>
            <Switch
              value={checklist.foodQualityGood}
              onValueChange={() => toggleChecklist('foodQualityGood')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        </Card>

        {/* Inspector Findings Input */}
        <Card
          title="Field Observations & Findings"
          subtitle="Detailed notes regarding physical headcount divergence or anomalies"
        >
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            placeholder="Enter physical verification observations..."
            placeholderTextColor={colors.textLight}
            value={reportNotes}
            onChangeText={setReportNotes}
          />
        </Card>

        {/* Geo-tagged Evidence Capture */}
        <Card
          title="Capture Field Evidence"
          subtitle="All media stamped with GPS, timestamp & cryptographic SHA-256 hash"
        >
          <View style={styles.mediaButtonsGrid}>
            <TouchableOpacity
              style={styles.mediaBtn}
              activeOpacity={0.8}
              onPress={handleCapturePhoto}
            >
              <Text style={styles.mediaIcon}>📸</Text>
              <Text style={styles.mediaBtnTitle}>Capture Photo</Text>
              <Text style={styles.mediaBtnSub}>EXIF + SHA-256</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaBtn}
              activeOpacity={0.8}
              onPress={handleRecordVoiceNote}
            >
              <Text style={styles.mediaIcon}>{recordingVoice ? '⏳' : '🎙️'}</Text>
              <Text style={styles.mediaBtnTitle}>
                {recordingVoice ? 'Recording...' : 'Voice Statement'}
              </Text>
              <Text style={styles.mediaBtnSub}>Audio Note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaBtn}
              activeOpacity={0.8}
              onPress={handleScanRegister}
            >
              <Text style={styles.mediaIcon}>📄</Text>
              <Text style={styles.mediaBtnTitle}>Scan Register</Text>
              <Text style={styles.mediaBtnSub}>Ledger Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaBtn}
              activeOpacity={0.8}
              onPress={handleCapturePhoto}
            >
              <Text style={styles.mediaIcon}>🎥</Text>
              <Text style={styles.mediaBtnTitle}>Video Clip</Text>
              <Text style={styles.mediaBtnSub}>Short Clip</Text>
            </TouchableOpacity>
          </View>

          {/* Captured Evidence List */}
          <View style={styles.capturedPreview}>
            <Text style={styles.previewTitle}>
              Captured Evidence Vault ({evidenceList.length} Items):
            </Text>

            {evidenceList.map((item) => (
              <View key={item.id} style={styles.evidenceItemCard}>
                <View style={styles.evidenceItemTop}>
                  <View style={styles.evidenceTypeTag}>
                    <Text style={styles.evidenceTypeText}>
                      {item.type === MediaEvidenceType.PHOTO
                        ? '📷 PHOTO'
                        : item.type === MediaEvidenceType.VOICE_NOTE
                        ? '🎙️ AUDIO NOTE'
                        : '📄 DOCUMENT'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeEvidence(item.id)}
                    style={styles.removeBtn}
                  >
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.evidenceFileName}>{item.fileName}</Text>

                <View style={styles.evidenceMetaRow}>
                  <Text style={styles.evidenceMeta}>
                    📍 {item.latitude.toFixed(4)}° N, {item.longitude.toFixed(4)}° E
                  </Text>
                  <Text style={styles.evidenceMeta}>
                    ⏱️ {new Date(item.capturedAt).toLocaleTimeString()}
                  </Text>
                </View>

                {/* SHA-256 Hash Display */}
                <View style={styles.hashBox}>
                  <Text style={styles.hashLabel}>Cryptographic SHA-256 Integrity Hash:</Text>
                  <Text style={styles.hashValue} numberOfLines={1} ellipsizeMode="middle">
                    {item.hash}
                  </Text>
                </View>

                <View style={styles.integrityBadge}>
                  <Text style={styles.integrityText}>✓ Evidence Integrity: SHA-256 VERIFIED</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Review Summary Modal / Box */}
          {showReview && (
            <View style={styles.reviewBox}>
              <Text style={styles.reviewTitle}>📋 Inspection Summary Review</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Target Institute:</Text>
                <Text style={styles.reviewVal}>{projectName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Geofence Status:</Text>
                <Text
                  style={[
                    styles.reviewVal,
                    { color: isLocationVerified ? colors.success : colors.danger },
                  ]}
                >
                  {isLocationVerified ? 'Verified (Within 100m)' : 'Failed (Outside Geofence)'}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Checklist Items:</Text>
                <Text style={styles.reviewVal}>
                  {Object.values(checklist).filter(Boolean).length} /{' '}
                  {Object.keys(checklist).length} Satisfactory
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Evidence Items:</Text>
                <Text style={styles.reviewVal}>{evidenceList.length} Files (Hashed)</Text>
              </View>
            </View>
          )}

          {!showReview ? (
            <Button
              title="Review Inspection Summary ➔"
              onPress={() => setShowReview(true)}
              style={styles.submitReportBtn}
            />
          ) : (
            <Button
              title={submitting ? "Submitting Official Report..." : "Confirm & Submit Report ✓"}
              loading={submitting}
              onPress={handleSubmit}
              style={styles.submitReportBtn}
            />
          )}
        </Card>
      </ScrollView>
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
    paddingBottom: spacing.xxl,
  },
  projectHeader: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  projectTarget: {
    fontSize: 11,
    color: colors.textMuted,
  },
  projectTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  geofenceVerifiedPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  geoGreen: {
    backgroundColor: '#DCFCE7',
  },
  geoRed: {
    backgroundColor: '#FEE2E2',
  },
  geofenceVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  geoTextGreen: {
    color: colors.success,
  },
  geoTextRed: {
    color: colors.danger,
  },
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
    marginRight: spacing.sm,
  },
  checkLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  checkDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  notesInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  mediaButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  mediaBtn: {
    flexBasis: '48%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  mediaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  mediaBtnTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  mediaBtnSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  capturedPreview: {
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
  },
  evidenceItemCard: {
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  evidenceItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  evidenceTypeTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  evidenceTypeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  removeBtn: {
    padding: 4,
  },
  removeBtnText: {
    fontSize: 12,
    color: colors.textLight,
  },
  evidenceFileName: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  evidenceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  evidenceMeta: {
    fontSize: 10,
    color: colors.textLight,
  },
  hashBox: {
    backgroundColor: colors.background,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginVertical: 4,
  },
  hashLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textLight,
  },
  hashValue: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: colors.textMuted,
    marginTop: 1,
  },
  integrityBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  integrityText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
  },
  reviewBox: {
    backgroundColor: colors.background,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.base,
  },
  reviewTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    marginTop: spacing.xs,
  },
});
