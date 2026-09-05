import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, RiskBadge } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';
import { RiskLevel } from '@nirikshan/shared-types';

export default function OfficialDashboard() {
  const user = useAuthStore((s) => s.user);

  const kpis = [
    { label: 'Total Projects', value: '12', color: colors.primary },
    { label: 'High Risk Projects', value: '4', color: colors.danger },
    { label: 'Open Alerts', value: '15', color: colors.warning },
    { label: 'CCTV Online', value: '7 / 10', color: colors.success },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="OFFICIAL DASHBOARD" subtitle="Centralized Scheme Monitoring & Analytics" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeGreeting}>Welcome,</Text>
            <Text style={styles.welcomeName}>{user?.name || 'Dr. Rajesh Sharma'}</Text>
            <Text style={styles.welcomeDept}>
              Directorate of Monitoring • New Delhi Headquarters
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.greenPulse} />
            <Text style={styles.statusText}>LIVE MONITORING</Text>
          </View>
        </View>

        {/* KPI Grid */}
        <Text style={styles.sectionTitle}>National Monitoring Summary</Text>
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, idx) => (
            <View key={idx} style={styles.kpiCard}>
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Risk Distribution Snapshot */}
        <Card title="Risk Distribution Analysis" subtitle="AI & Rule-Engine Risk Stratification">
          <View style={styles.riskRow}>
            <View style={styles.riskItem}>
              <RiskBadge level={RiskLevel.CRITICAL} />
              <Text style={styles.riskCount}>1 Project</Text>
            </View>
            <View style={styles.riskItem}>
              <RiskBadge level={RiskLevel.HIGH} />
              <Text style={styles.riskCount}>4 Projects</Text>
            </View>
            <View style={styles.riskItem}>
              <RiskBadge level={RiskLevel.MEDIUM} />
              <Text style={styles.riskCount}>3 Projects</Text>
            </View>
            <View style={styles.riskItem}>
              <RiskBadge level={RiskLevel.LOW} />
              <Text style={styles.riskCount}>4 Projects</Text>
            </View>
          </View>
        </Card>

        {/* High Priority Alerts Preview */}
        <Card
          title="Active High-Priority Alerts"
          subtitle="Requires immediate official review and surprise verification"
        >
          <View style={styles.alertItem}>
            <View style={styles.alertTop}>
              <RiskBadge level={RiskLevel.HIGH} />
              <Text style={styles.alertTime}>2h ago</Text>
            </View>
            <Text style={styles.alertTitle}>Attendance Discrepancy (33.7%)</Text>
            <Text style={styles.alertProject}>Demo Welfare Institute - Coimbatore</Text>
            <Text style={styles.alertReason}>
              Reported: 92 beneficiaries vs Observed: ~61 via dining hall computer vision.
            </Text>
          </View>

          <View style={styles.alertItem}>
            <View style={styles.alertTop}>
              <RiskBadge level={RiskLevel.HIGH} />
              <Text style={styles.alertTime}>4h ago</Text>
            </View>
            <Text style={styles.alertTitle}>CCTV Stream Unavailable During Working Hours</Text>
            <Text style={styles.alertProject}>Demo De-addiction Kendra - Ludhiana</Text>
            <Text style={styles.alertReason}>
              Camera "Ward 2 Rehabilitation Hall" heartbeat missing for 4 hours without maintenance notice.
            </Text>
          </View>
        </Card>

        {/* Phase Indicator */}
        <View style={styles.phaseCard}>
          <Text style={styles.phaseTitle}>🧭 Phase 3 Active: Authentication & Navigation</Text>
          <Text style={styles.phaseDesc}>
            The official role navigation is now active. Detailed analytics charts, real-time map, and interactive triaging will be populated in Phase 4.
          </Text>
        </View>
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
  welcomeBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  welcomeName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  welcomeDept: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.success,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  kpiCard: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  riskItem: {
    alignItems: 'center',
  },
  riskCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: 4,
  },
  alertItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 11,
    color: colors.textLight,
  },
  alertTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  alertProject: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    fontWeight: typography.fontWeight.medium,
    marginTop: 1,
  },
  alertReason: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  phaseCard: {
    backgroundColor: '#F0FDF4',
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  phaseTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginBottom: 4,
  },
  phaseDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
