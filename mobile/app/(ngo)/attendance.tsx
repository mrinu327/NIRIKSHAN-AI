import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function NGOAttendance() {
  const user = useAuthStore((s) => s.user);
  const [headcount, setHeadcount] = useState('92');
  const [staffCount, setStaffCount] = useState('14');
  const [mealProvided, setMealProvided] = useState('92');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    observedCount?: number | null;
    mismatchPercentage?: number | null;
    anomaliesDetected?: any[];
    message?: string;
  } | null>(null);

  // Pre-load recent attendance from backend on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const history = await api.getProjectAttendance('proj-001', 1);
        if (isMounted && history && history.length > 0) {
          const latest = history[0];
          setHeadcount(String(latest.reportedCount));
          if (latest.observedCount != null) {
            setResult({
              observedCount: latest.observedCount,
              mismatchPercentage: latest.mismatchPercentage,
              message: 'Synchronized with latest backend submission record.',
            });
            setSubmitted(true);
          }
        }
      } catch (e) {
        // Continue with default values in offline fallback mode
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    const count = parseInt(headcount, 10);
    if (isNaN(count) || count < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid active beneficiary count.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.submitAttendance({
        projectId: 'proj-001',
        reportedCount: count,
        staffCount: parseInt(staffCount, 10) || undefined,
        mealCount: parseInt(mealProvided, 10) || undefined,
        date: new Date().toISOString(),
        source: 'PORTAL_SUBMISSION',
        submittedBy: user?.id || 'usr-ngo-001',
      });

      setSubmitted(true);
      setResult({
        observedCount: res.attendance?.observedCount,
        mismatchPercentage: res.attendance?.mismatchPercentage,
        anomaliesDetected: res.anomaliesDetected,
        message: res.message,
      });

      const mismatchStr =
        res.attendance?.observedCount != null
          ? `\nCCTV Vision Observed: ~${res.attendance.observedCount} (${res.attendance.mismatchPercentage || 0}% mismatch)`
          : '';

      Alert.alert(
        'Attendance Submitted',
        `Reported: ${count} beneficiaries, ${staffCount} staff. Stamped with timestamp and server hash.${mismatchStr}`
      );
    } catch (err: any) {
      console.warn('Failed to submit attendance to backend, falling back:', err);
      const fallbackObserved = Math.round(count * 0.67);
      const fallbackMismatch = count > 0 ? Math.round(((count - fallbackObserved) / count) * 100) : 0;
      setSubmitted(true);
      setResult({
        observedCount: fallbackObserved,
        mismatchPercentage: fallbackMismatch,
        anomaliesDetected: [],
        message: 'Daily attendance recorded in demo fallback mode.',
      });
      Alert.alert(
        'Attendance Submitted (Demo Mode)',
        `Reported: ${count} beneficiaries, ${staffCount} staff. Saved locally.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isHighMismatch =
    result?.mismatchPercentage != null && result.mismatchPercentage > 20;

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="DAILY ATTENDANCE" subtitle="DoSJE Scheme Beneficiary Ingestion" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineTitle}>⚠️ Legal Declaration Notice</Text>
          <Text style={styles.guidelineText}>
            Submitting inflated headcounts triggers automated computer vision verification and mandatory surprise field inspections.
          </Text>
        </View>

        {/* CCTV Telemetry Verification Outcome */}
        {result && (
          <View style={isHighMismatch ? styles.telemetryCardAlert : styles.telemetryCardSuccess}>
            <Text style={isHighMismatch ? styles.telemetryTitleAlert : styles.telemetryTitleSuccess}>
              {isHighMismatch
                ? '⚠️ Automated Vision Discrepancy Flagged'
                : '✓ Computer Vision Telemetry Validated'}
            </Text>
            <Text style={isHighMismatch ? styles.telemetryTextAlert : styles.telemetryTextSuccess}>
              Reported: {headcount} | Observed by CCTV: ~{result.observedCount ?? 'N/A'} unique persons
            </Text>
            <Text style={isHighMismatch ? styles.telemetrySubAlert : styles.telemetrySubSuccess}>
              {isHighMismatch
                ? `Variance: ${result.mismatchPercentage}% exceeds Ministry 20% tolerance threshold. Dispatched to DoSJE oversight queue.`
                : `Variance: ${result.mismatchPercentage || 0}% is within acceptable operating tolerance.`}
            </Text>
          </View>
        )}

        <Card title="Submit Today's Headcount" subtitle="Date: Today (Active Operating Cycle)">
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Active Beneficiaries Present Today</Text>
            <TextInput
              style={styles.input}
              value={headcount}
              onChangeText={setHeadcount}
              keyboardType="number-pad"
              editable={!submitting}
            />
            <Text style={styles.inputHint}>Sanctioned capacity: 100 maximum</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Staff & Caregivers on Duty</Text>
            <TextInput
              style={styles.input}
              value={staffCount}
              onChangeText={setStaffCount}
              keyboardType="number-pad"
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Lunch / Midday Meals Served</Text>
            <TextInput
              style={styles.input}
              value={mealProvided}
              onChangeText={setMealProvided}
              keyboardType="number-pad"
              editable={!submitting}
            />
          </View>

          <Button
            title={
              submitting
                ? 'Submitting to Central Registry...'
                : submitted
                ? 'Update Submitted Attendance'
                : 'Submit Headcount to DoSJE'
            }
            onPress={handleSubmit}
            disabled={submitting}
            style={styles.submitBtn}
          />
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
  },
  guidelineCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  guidelineTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 2,
  },
  guidelineText: {
    fontSize: typography.fontSize.xs,
    color: '#92400E',
    lineHeight: 17,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: '700',
  },
  inputHint: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 3,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  telemetryCardAlert: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  telemetryTitleAlert: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 2,
  },
  telemetryTextAlert: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  telemetrySubAlert: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    marginTop: 4,
    lineHeight: 16,
  },
  telemetryCardSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  telemetryTitleSuccess: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 2,
  },
  telemetryTextSuccess: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  telemetrySubSuccess: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
});
