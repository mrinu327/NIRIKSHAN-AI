import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function NGOHome() {
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="NGO PORTAL" subtitle="Institute Dashboard & Compliance Portal" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Institute Info Banner */}
        <View style={styles.instituteCard}>
          <Text style={styles.schemeTag}>DoSJE Integrated De-addiction Scheme</Text>
          <Text style={styles.instituteTitle}>Demo Welfare Institute - Coimbatore</Text>
          <Text style={styles.inchargeText}>In-charge: {user?.name || 'Amit Sundaram'}</Text>
          <View style={styles.instituteMeta}>
            <Text style={styles.metaText}>Registration: DARPAN-TN-2024-091</Text>
            <Text style={styles.metaText}>Sanction Capacity: 100 Beds</Text>
          </View>
        </View>

        {/* Today's Submission Status */}
        <Card title="Today's Reporting Status" subtitle="Daily mandatory compliance submissions">
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Daily Attendance Submission</Text>
            <View style={styles.statusPillSubmitted}>
              <Text style={styles.statusTextSubmitted}>Submitted (92 Active)</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>CCTV Heartbeat Stream</Text>
            <View style={styles.statusPillActive}>
              <Text style={styles.statusTextActive}>3/3 Cameras Online</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Video Verification Standby</Text>
            <View style={styles.statusPillStandby}>
              <Text style={styles.statusTextStandby}>Ready / On-Call</Text>
            </View>
          </View>
        </Card>

        {/* Notices from DoSJE */}
        <Card title="Ministry Notices" subtitle="Directives from State PMU / Central Directorate">
          <View style={styles.noticeItem}>
            <Text style={styles.noticeTitle}>Surprise Verification Window Active</Text>
            <Text style={styles.noticeBody}>
              Quarterly random inspection cycles are currently active. Ensure physical registers match daily electronic submissions.
            </Text>
            <Text style={styles.noticeDate}>Received yesterday</Text>
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
  instituteCard: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  schemeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B21A8',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  instituteTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  inchargeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  instituteMeta: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: colors.textLight,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusPillSubmitted: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusTextSubmitted: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  statusPillActive: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  statusPillStandby: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusTextStandby: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning,
  },
  noticeItem: {
    paddingVertical: spacing.xs,
  },
  noticeTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  noticeBody: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  noticeDate: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
  },
});
