/**
 * SurpriseVideoCallModal
 * SIH26095 | MoSJE NGO Portal
 *
 * Simulates the official Surprise Video-Call Attendance Verification protocol
 * triggered by MoSJE / PMU Central Monitoring. Transparently declares its
 * demo/simulated nature without claiming nonexistent WebRTC hardware.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockNgoService } from '../../services/mock/mockNgoService';
import { SurpriseVideoCallSession } from '../../types/ngo';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface SurpriseVideoCallModalProps {
  visible: boolean;
  session: SurpriseVideoCallSession | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SurpriseVideoCallModal: React.FC<SurpriseVideoCallModalProps> = ({
  visible,
  session,
  onClose,
  onSuccess,
}) => {
  const [inchargeVerified, setInchargeVerified] = useState(false);
  const [headcountVerified, setHeadcountVerified] = useState(false);
  const [facilityVerified, setFacilityVerified] = useState(false);
  const [observedCount, setObservedCount] = useState('42');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!session) return null;

  const allChecked = inchargeVerified && headcountVerified && facilityVerified;

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await mockNgoService.completeSurpriseVideoCall(session.id, {
        checklist: {
          inchargeIdentityVerified: inchargeVerified,
          headcountVerified: headcountVerified,
          facilityInspected: facilityVerified,
        },
        observedCount: parseInt(observedCount, 10) || 42,
        notes,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to complete surprise video call:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="videocam" size={20} color={colors.status.highPriority} />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={styles.title}>Surprise Video Verification</Text>
                <Text style={styles.subtitle}>Order #{session.id}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Transparent Demo Protocol Notice Banner */}
            <View style={styles.noticeBanner}>
              <Ionicons name="information-circle" size={16} color={colors.brand.primary} style={{ marginTop: 1 }} />
              <Text style={styles.noticeText}>
                <Text style={{ fontWeight: typography.weights.bold }}>DEMO / SIMULATED VERIFICATION:</Text>{' '}
                This operational workflow tests the rapid surprise video audit protocol mandated by MoSJE without requiring hardware WebRTC streams.
              </Text>
            </View>

            {/* Caller Identification Card */}
            <View style={styles.callerCard}>
              <View style={styles.callerRow}>
                <View style={styles.callerAvatar}>
                  <Ionicons name="shield-checkmark" size={18} color={colors.text.inverse} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.callerName}>{session.officerName}</Text>
                  <Text style={styles.callerTitle}>{session.officerTitle}</Text>
                  <Text style={styles.callerTime}>Requested at: {session.requestedAt}</Text>
                </View>
              </View>
            </View>

            {/* Verification Checklist */}
            <Text style={styles.sectionHeading}>Mandatory Audit Criteria</Text>

            <TouchableOpacity
              style={[styles.checkItem, inchargeVerified && styles.checkItemActive]}
              onPress={() => setInchargeVerified(!inchargeVerified)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={inchargeVerified ? 'checkbox' : 'square-outline'}
                size={20}
                color={inchargeVerified ? colors.brand.primary : colors.text.muted}
              />
              <View style={styles.checkTextCol}>
                <Text style={styles.checkTitle}>In-Charge Identity Confirmed</Text>
                <Text style={styles.checkDesc}>Institute Administrator presented credentials on camera.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkItem, headcountVerified && styles.checkItemActive]}
              onPress={() => setHeadcountVerified(!headcountVerified)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={headcountVerified ? 'checkbox' : 'square-outline'}
                size={20}
                color={headcountVerified ? colors.brand.primary : colors.text.muted}
              />
              <View style={styles.checkTextCol}>
                <Text style={styles.checkTitle}>Live Roll-Call Scan Conducted</Text>
                <Text style={styles.checkDesc}>Activity hall beneficiaries matched against daily roster.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkItem, facilityVerified && styles.checkItemActive]}
              onPress={() => setFacilityVerified(!facilityVerified)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={facilityVerified ? 'checkbox' : 'square-outline'}
                size={20}
                color={facilityVerified ? colors.brand.primary : colors.text.muted}
              />
              <View style={styles.checkTextCol}>
                <Text style={styles.checkTitle}>Kitchen & Cleanliness Inspected</Text>
                <Text style={styles.checkDesc}>Dining hall hygiene and dietary chart verified operational.</Text>
              </View>
            </TouchableOpacity>

            {/* Observed Count Input */}
            <Text style={styles.inputLabel}>Observed Headcount on Call</Text>
            <TextInput
              style={styles.textInput}
              value={observedCount}
              onChangeText={setObservedCount}
              keyboardType="numeric"
              placeholder="42"
            />

            {/* Verification Notes */}
            <Text style={styles.inputLabel}>Officer / In-charge Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Enter joint observations..."
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <PrimaryButton
              title="Submit & Transmit Verification"
              iconName="checkmark-done"
              onPress={handleComplete}
              loading={submitting}
              style={{ minHeight: 46 }}
            />
            <SecondaryButton
              title="Cancel"
              onPress={onClose}
              disabled={submitting}
              style={{ marginTop: 8, minHeight: 44 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '94%',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.status.highPriorityLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flexShrink: 1,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  body: {
    padding: spacing.base,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    gap: 8,
  },
  noticeText: {
    fontSize: typography.sizes.xs,
    color: colors.brand.navy,
    lineHeight: 18,
    flex: 1,
  },
  callerCard: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.base,
  },
  callerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callerName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  callerTitle: {
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
    marginTop: 1,
  },
  callerTime: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.surface,
    marginBottom: 8,
    gap: 10,
  },
  checkItemActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
  },
  checkTextCol: {
    flex: 1,
  },
  checkTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  checkDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
});
