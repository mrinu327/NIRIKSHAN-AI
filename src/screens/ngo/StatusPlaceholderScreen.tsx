/**
 * StatusPlaceholderScreen
 * NGO / Institute - Compliance Status & Telemetry Health
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { SUNRISE_ATTENDANCE } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const StatusPlaceholderScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Compliance & Health"
        subtitle="Verification status for MoSJE quarterly grant disbursement"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>INSTITUTE COMPLIANCE INDEX</Text>
          <Text style={styles.scoreValue}>71 / 100</Text>
          <Text style={styles.scoreStatus}>Notice: Attention Required</Text>
          <Text style={styles.scoreDesc}>
            Variance flagged between camera estimate (25) and morning attendance ({SUNRISE_ATTENDANCE.currentSubmittedAttendance}/{SUNRISE_ATTENDANCE.totalBeneficiaries}). Pending inspector verification.
          </Text>
        </View>

        <SectionHeader
          title="Telemetry Subsystems"
          subtitle="Real-time monitoring health metrics"
        />

        <View style={styles.subsystemCard}>
          <View style={styles.itemRow}>
            <Ionicons name="finger-print" size={20} color={colors.status.normal} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Biometric Terminal</Text>
              <Text style={styles.itemSub}>Device #BIO-01 • Synced 09:30 AM</Text>
            </View>
            <Text style={[styles.itemStatus, { color: colors.status.normal }]}>Online</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <Ionicons name="videocam" size={20} color={colors.status.warning} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>CCTV Edge Stream</Text>
              <Text style={styles.itemSub}>Channel 1 (Main Hall) • Discrepancy logged</Text>
            </View>
            <Text style={[styles.itemStatus, { color: colors.status.warning }]}>Flagged</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <Ionicons name="document-attach" size={20} color={colors.status.normal} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Quarterly Audits</Text>
              <Text style={styles.itemSub}>Last verified 12 Jan 2026</Text>
            </View>
            <Text style={[styles.itemStatus, { color: colors.status.normal }]}>Up to Date</Text>
          </View>
        </View>
      </ScrollView>
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
  scoreCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.6,
  },
  scoreValue: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.status.warning,
    marginTop: 2,
  },
  scoreStatus: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  scoreDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
    marginTop: 6,
  },
  subsystemCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  itemSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 1,
  },
  itemStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.divider,
    marginVertical: spacing.sm,
  },
});
