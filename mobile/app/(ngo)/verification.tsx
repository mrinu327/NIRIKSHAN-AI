import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';

export default function NGOVerification() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="VERIFICATION CALLS" subtitle="Surprise VC Interface for In-charge" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.standbyCard}>
          <Text style={styles.standbyIcon}>📹</Text>
          <Text style={styles.standbyTitle}>Surprise Video Verification Standby</Text>
          <Text style={styles.standbySub}>
            Ministry officials may initiate random live video calls to verify beneficiary presence and institute conditions.
          </Text>
          <View style={styles.onlineBadge}>
            <View style={styles.greenPulse} />
            <Text style={styles.onlineText}>CAMERA READY FOR INCOMING CALL</Text>
          </View>
        </View>

        <Card title="Past Verification Calls" subtitle="Audit log of official video inquiries">
          <View style={styles.callItem}>
            <View style={styles.callTop}>
              <Text style={styles.callOfficer}>Caller: Dr. Rajesh Sharma (Director)</Text>
              <Text style={styles.callDate}>3 days ago</Text>
            </View>
            <Text style={styles.callResult}>Outcome: Verified (Beneficiary confirmed meal schedule)</Text>
            <Text style={styles.callDuration}>Duration: 3 mins 42 secs</Text>
          </View>
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
  standbyCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  standbyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  standbyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  standbySub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 280,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  callItem: {
    paddingVertical: spacing.sm,
  },
  callTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callOfficer: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  callDate: {
    fontSize: 11,
    color: colors.textLight,
  },
  callResult: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  callDuration: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
});
