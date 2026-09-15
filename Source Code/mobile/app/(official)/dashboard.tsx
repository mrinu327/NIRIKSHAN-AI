import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, RiskBadge, Button, ProjectRiskMap } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useDashboardStore } from '../../src/store/useDashboardStore';
import { RiskLevel } from '@nirikshan/shared-types';

export default function OfficialDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    kpi,
    alerts,
    projects,
    riskDistribution,
    isLoading,
    fetchDashboardData,
    acknowledgeAlert,
    markFalsePositive,
    assignInspection,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenProject = (projectId: string) => {
    router.push({
      pathname: '/(official)/project-details',
      params: { id: projectId },
    });
  };

  const kpis = [
    {
      label: 'Total Projects',
      value: String(kpi.totalProjects),
      subtext: 'Central scheme registry',
      color: colors.primary,
      icon: '🏛️',
    },
    {
      label: 'Active Facilities',
      value: String(kpi.activeProjects),
      subtext: 'Operational centers',
      color: colors.success,
      icon: '✅',
    },
    {
      label: 'High/Critical Risk',
      value: String(kpi.highRiskProjects),
      subtext: 'Requires intervention',
      color: colors.danger,
      icon: '⚠️',
    },
    {
      label: 'Active Alerts',
      value: String(kpi.openAlerts),
      subtext: 'Unresolved anomalies',
      color: colors.warning,
      icon: '🚨',
    },
    {
      label: 'Under Inspection',
      value: String(kpi.projectsUnderInvestigation),
      subtext: 'PMU visits assigned',
      color: colors.secondary,
      icon: '📋',
    },
    {
      label: 'CCTV Uptime',
      value: `${kpi.camerasOnline}/${kpi.camerasOnline + kpi.camerasOffline}`,
      subtext: `${kpi.camerasOffline} stream offline`,
      color: kpi.camerasOffline > 0 ? colors.warning : colors.success,
      icon: '📹',
    },
  ];

  const totalDist = riskDistribution.total || 12;
  const critPct = Math.round((riskDistribution[RiskLevel.CRITICAL] / totalDist) * 100);
  const highPct = Math.round((riskDistribution[RiskLevel.HIGH] / totalDist) * 100);
  const medPct = Math.round((riskDistribution[RiskLevel.MEDIUM] / totalDist) * 100);
  const lowPct = Math.round((riskDistribution[RiskLevel.LOW] / totalDist) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="OFFICIAL DASHBOARD" subtitle="Centralized Scheme Monitoring & Analytics" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />
        }
      >
        {/* Welcome Hero Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeGreeting}>Official Monitoring Terminal</Text>
            <Text style={styles.welcomeName}>{user?.name || 'Dr. Rajesh Sharma'}</Text>
            <Text style={styles.welcomeDept}>
              Ministry of Social Justice & Empowerment • New Delhi
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.greenPulse} />
            <Text style={styles.statusText}>TELEMETRY SYNCED</Text>
          </View>
        </View>

        {/* 6 KPI Cards Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>National Monitoring Summary</Text>
          <TouchableOpacity onPress={() => router.push('/(official)/projects')}>
            <Text style={styles.viewAllText}>View All Projects →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.kpiGrid}>
          {kpis.map((item, idx) => (
            <View key={idx} style={styles.kpiCard}>
              <View style={styles.kpiTop}>
                <Text style={styles.kpiIcon}>{item.icon}</Text>
                <Text style={[styles.kpiValue, { color: item.color }]}>{item.value}</Text>
              </View>
              <Text style={styles.kpiLabel}>{item.label}</Text>
              <Text style={styles.kpiSubtext}>{item.subtext}</Text>
            </View>
          ))}
        </View>

        {/* Interactive Risk Distribution Visualization */}
        <Card
          title="Risk Distribution Analysis"
          subtitle="AI & Rule-Engine Stratification Across 12 Registered Facilities"
        >
          {/* Stacked Percentage Bar */}
          <View style={styles.riskBarContainer}>
            <View style={[styles.riskBarSegment, { flex: critPct, backgroundColor: '#DC2626' }]} />
            <View style={[styles.riskBarSegment, { flex: highPct, backgroundColor: '#EA580C' }]} />
            <View style={[styles.riskBarSegment, { flex: medPct, backgroundColor: '#D97706' }]} />
            <View style={[styles.riskBarSegment, { flex: lowPct, backgroundColor: '#16A34A' }]} />
          </View>

          <View style={styles.riskRow}>
            <View style={styles.riskItem}>
              <RiskBadge level={RiskLevel.CRITICAL} />
              <Text style={styles.riskCount}>
                {riskDistribution[RiskLevel.CRITICAL]} Project ({critPct}%)
              </Text>
            </View>
            <View style={styles.riskItem}>
              <RiskBadge level={RiskLevel.HIGH} />
              <Text style={styles.riskCount}>
                {riskDistribution[RiskLevel.HIGH]} Projects ({highPct}%)
              </Text>
            </View>
            <View style={styles.riskItem}>
              <RiskBadge level={RiskLevel.MEDIUM} />
              <Text style={styles.riskCount}>
                {riskDistribution[RiskLevel.MEDIUM]} Projects ({medPct}%)
              </Text>
            </View>
            <View style={styles.riskItem}>
              <RiskBadge level={RiskLevel.LOW} />
              <Text style={styles.riskCount}>
                {riskDistribution[RiskLevel.LOW]} Projects ({lowPct}%)
              </Text>
            </View>
          </View>
        </Card>

        {/* Geographic Map Overview with Color-Coded Risk Pins */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Geographic Telemetry & Risk Map</Text>
          <Text style={styles.sectionHint}>Tap pin to inspect</Text>
        </View>
        <ProjectRiskMap
          projects={projects}
          onSelectProject={(p) => handleOpenProject(p.id)}
        />

        {/* Live Alert Feed with Human-in-the-Loop Actions */}
        <Card
          title="Live Anomaly & Alert Feed"
          subtitle="Real-time compliance flags requiring official review"
        >
          {alerts.map((a) => (
            <View key={a.id} style={styles.alertItem}>
              <View style={styles.alertTop}>
                <RiskBadge level={a.severity} score={a.score} showScore={true} />
                <View style={styles.alertStatusPill}>
                  <Text style={styles.alertStatusText}>{a.status}</Text>
                </View>
              </View>

              <Text style={styles.alertTitle}>{a.title}</Text>
              <Text style={styles.alertProject}>
                🏛️ {a.project} • 📍 {a.district}, {a.state}
              </Text>
              <Text style={styles.alertReason}>{a.explanation}</Text>

              <View style={styles.recActionBox}>
                <Text style={styles.recActionLabel}>Action: </Text>
                <Text style={styles.recActionText}>{a.recommendedAction}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.alertActionRow}>
                <TouchableOpacity
                  style={styles.inspectBtn}
                  onPress={() => handleOpenProject(a.projectId || 'proj-001')}
                >
                  <Text style={styles.inspectBtnText}>7-Tab Profile →</Text>
                </TouchableOpacity>

                {a.status === 'OPEN' ? (
                  <>
                    <TouchableOpacity
                      style={styles.assignSurpriseBtn}
                      onPress={() => assignInspection(a.id)}
                    >
                      <Text style={styles.assignSurpriseText}>Dispatch PMU</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.falsePositiveBtn}
                      onPress={() => markFalsePositive(a.id)}
                    >
                      <Text style={styles.falsePositiveText}>Dismiss</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.acknowledgedBadge}>
                    <Text style={styles.acknowledgedText}>✓ ACTION TAKEN</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </Card>

        {/* Quick Navigation Footer */}
        <View style={styles.quickNavCard}>
          <Text style={styles.quickNavTitle}>Quick Navigation</Text>
          <View style={styles.quickNavRow}>
            <TouchableOpacity
              style={styles.quickNavBtn}
              onPress={() => router.push('/(official)/projects')}
            >
              <Text style={styles.quickNavIcon}>📂</Text>
              <Text style={styles.quickNavText}>All Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickNavBtn}
              onPress={() => router.push('/(official)/live-monitor')}
            >
              <Text style={styles.quickNavIcon}>📹</Text>
              <Text style={styles.quickNavText}>CCTV Feeds</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickNavBtn}
              onPress={() => router.push('/(official)/inspections')}
            >
              <Text style={styles.quickNavIcon}>📋</Text>
              <Text style={styles.quickNavText}>Surprise Inspections</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: spacing.xxl,
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
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  welcomeName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  welcomeDept: {
    fontSize: 10,
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
    fontSize: 8,
    fontWeight: '800',
    color: colors.success,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  sectionHint: {
    fontSize: 10,
    color: colors.textLight,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
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
    padding: spacing.sm + 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiIcon: {
    fontSize: 16,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
  },
  kpiLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 4,
  },
  kpiSubtext: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 1,
  },
  riskBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  riskBarSegment: {
    height: '100%',
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: 4,
  },
  riskItem: {
    alignItems: 'center',
  },
  riskCount: {
    fontSize: 9,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
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
  alertStatusPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  alertStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  alertTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  alertProject: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 1,
  },
  alertReason: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },
  recActionBox: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  recActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  recActionText: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },
  alertActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  inspectBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  inspectBtnText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  assignSurpriseBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  assignSurpriseText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '700',
  },
  falsePositiveBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  falsePositiveText: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: '600',
  },
  acknowledgedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  acknowledgedText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '800',
  },
  quickNavCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  quickNavTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  quickNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickNavBtn: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickNavIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  quickNavText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
