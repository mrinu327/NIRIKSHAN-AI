import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button, RiskBadge } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useInspectionStore } from '../../src/store/useInspectionStore';

export default function InspectorDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    activeInspectionId,
    projectName,
    projectAddress,
    inspectionType,
    scheduledDate,
    scheduledCountdown,
    isLocationVerified,
    distanceMeters,
    isBiometricVerified,
    biometricType,
    evidenceList,
    completedReports,
    setInspectionTarget,
  } = useInspectionStore();

  const handleOpenNextAssignment = () => {
    setInspectionTarget(
      'insp-001',
      'proj-001',
      'Demo Welfare Institute - Coimbatore',
      '42 Avinashi Road, Peelamedu, Coimbatore',
      11.0267,
      76.9953,
      'SURPRISE',
      'Today, 05:00 PM',
      'TODAY'
    );
    router.push('/(inspector)/assignments');
  };

  const handleOpenActiveMap = () => {
    router.push('/(inspector)/map');
  };

  const handleOpenHistory = () => {
    router.push('/(inspector)/reports');
  };

  const pendingEvidenceCount = evidenceList.filter(
    (e) => e.status === 'UPLOADING' || e.status === 'PROCESSING'
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader
        title="INSPECTOR DASHBOARD"
        subtitle="Centralized Field Operations & Verification Desk"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Officer Greeting Card */}
        <Card style={styles.greetingCard}>
          <View style={styles.greetingRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>👮</Text>
            </View>
            <View style={styles.greetingInfo}>
              <Text style={styles.greetingSub}>MoSJE PMU Field Verification Unit</Text>
              <Text style={styles.greetingName}>
                Good Morning, {user?.name || 'Inspector Priya Verma'}
              </Text>
              <Text style={styles.greetingBadge}>
                Badge: PMU-DEMO-004 • {user?.district || 'Coimbatore'}, {user?.state || 'Tamil Nadu'}
              </Text>
            </View>
          </View>
        </Card>

        {/* 4-Stat Metrics Grid */}
        <View style={styles.metricsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>TODAY'S</Text>
            <Text style={styles.statSub}>1 Active Task</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>UPCOMING</Text>
            <Text style={styles.statSub}>Next 14 days</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>2</Text>
            <Text style={styles.statLabel}>SURPRISE / VC</Text>
            <Text style={styles.statSub}>High priority</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.activeDotRow}>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>STATUS</Text>
            <Text style={styles.statSub} numberOfLines={1}>
              #{activeInspectionId}
            </Text>
          </Card>
        </View>

        {/* NEXT INSPECTION HERO CARD */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>NEXT INSPECTION</Text>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>
              Inspection in: {scheduledCountdown || '8 DAYS'}
            </Text>
          </View>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.inspectionTypeBadge}>
              <Text style={styles.inspectionTypeBadgeText}>
                {inspectionType === 'SURPRISE'
                  ? '⚡ SURPRISE INSPECTION'
                  : inspectionType === 'VC'
                  ? '📹 VIDEO VERIFICATION'
                  : 'REGULAR INSPECTION'}
              </Text>
            </View>
            <Text style={styles.heroDate}>{scheduledDate || '18 September 2026'}</Text>
          </View>

          <Text style={styles.heroProjectName}>{projectName || 'ABC Rehabilitation Centre'}</Text>
          <Text style={styles.heroAddress}>📍 {projectAddress || 'Sector 14, Institutional Area, New Delhi'}</Text>

          {/* Operational Checklist Sneak Peek */}
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaLabel}>Project Scheme</Text>
              <Text style={styles.heroMetaVal}>DoSJE Integrated Rehabilitation</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaLabel}>Assigned Lead</Text>
              <Text style={styles.heroMetaVal}>{user?.name || 'Priya Verma'}</Text>
            </View>
          </View>

          <View style={styles.heroActionRow}>
            <Button
              title="VIEW ASSIGNMENT"
              variant="primary"
              onPress={handleOpenNextAssignment}
              style={styles.heroBtn}
            />
            <Button
              title="VERIFY GEOFENCE"
              variant="outline"
              onPress={handleOpenActiveMap}
              style={styles.heroBtnOutline}
            />
          </View>
        </Card>

        {/* ACTIVE INSPECTION VERIFICATION HUD */}
        <Text style={styles.sectionTitle}>FIELD SENSORS & TELEMETRY</Text>

        <Card style={styles.telemetryCard}>
          {/* Geofence Status */}
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryIconCircle}>
              <Text style={styles.telemetryIcon}>📍</Text>
            </View>
            <View style={styles.telemetryInfo}>
              <Text style={styles.telemetryTitle}>Geofence Radar Status</Text>
              <Text style={styles.telemetryDesc}>
                {isLocationVerified
                  ? `🟢 Location Verified (${distanceMeters}m from site, within 100m)`
                  : `🔴 Outside Geofence (${distanceMeters}m from site)`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.telemetryActionBtn}
              onPress={() => router.push('/(inspector)/map')}
            >
              <Text style={styles.telemetryActionText}>Radar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.telemetryDivider} />

          {/* Biometric Status */}
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryIconCircle}>
              <Text style={styles.telemetryIcon}>👆</Text>
            </View>
            <View style={styles.telemetryInfo}>
              <Text style={styles.telemetryTitle}>Biometric Identity Verification</Text>
              <Text style={styles.telemetryDesc}>
                {isBiometricVerified
                  ? `🟢 Verified via ${biometricType || 'Fingerprint'} Sensor Match`
                  : '⚪ Not Verified — Biometric auth required prior to checklist'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.telemetryActionBtn}
              onPress={() => router.push('/(inspector)/map')}
            >
              <Text style={styles.telemetryActionText}>Verify</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.telemetryDivider} />

          {/* Evidence Uploads */}
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryIconCircle}>
              <Text style={styles.telemetryIcon}>📁</Text>
            </View>
            <View style={styles.telemetryInfo}>
              <Text style={styles.telemetryTitle}>Evidence Registry & Uploads</Text>
              <Text style={styles.telemetryDesc}>
                {evidenceList.length} Items Captured • {pendingEvidenceCount} Pending Upload
              </Text>
            </View>
            <TouchableOpacity
              style={styles.telemetryActionBtn}
              onPress={() => router.push('/(inspector)/inspect')}
            >
              <Text style={styles.telemetryActionText}>Capture</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* RECENT ACTIVITY */}
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>

        <Card style={styles.activityCard}>
          <View style={styles.activityItem}>
            <Text style={styles.activityCheck}>✓</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityText}>Evidence uploaded</Text>
              <Text style={styles.activitySub}>
                Headcount activity photo (SHA-256 hashed & original preserved)
              </Text>
            </View>
            <Text style={styles.activityTime}>10:14 AM</Text>
          </View>

          <View style={styles.activityDivider} />

          <View style={styles.activityItem}>
            <Text style={styles.activityCheck}>✓</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityText}>Inspection completed</Text>
              <Text style={styles.activitySub}>
                Demo Senior Care Sanctuary — Routine physical audit recorded
              </Text>
            </View>
            <Text style={styles.activityTime}>28 Aug</Text>
          </View>

          <View style={styles.activityDivider} />

          <View style={styles.activityItem}>
            <Text style={[styles.activityCheck, { color: colors.warning }]}>⚠</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityText}>Evidence requires review</Text>
              <Text style={styles.activitySub}>
                33.7% headcount divergence flagged by AI analytics engine
              </Text>
            </View>
            <Text style={styles.activityTime}>Today</Text>
          </View>
        </Card>

        {/* QUICK NAVIGATION BUTTONS */}
        <View style={styles.quickNavRow}>
          <Button
            title="MY ASSIGNMENTS"
            variant="primary"
            onPress={() => router.push('/(inspector)/assignments')}
            style={styles.quickNavBtn}
          />
          <Button
            title="INSPECTION HISTORY"
            variant="secondary"
            onPress={handleOpenHistory}
            style={styles.quickNavBtn}
          />
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
    paddingBottom: spacing.xxl + 24,
  },
  greetingCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F0FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  greetingInfo: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  greetingBadge: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statSub: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  activeDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginVertical: spacing.xs,
  },
  countdownBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  heroCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  inspectionTypeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  inspectionTypeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.4,
  },
  heroDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  heroProjectName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  heroAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: 4,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  heroMetaItem: {
    flex: 1,
  },
  heroMetaLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroMetaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  heroBtn: {
    flex: 1,
  },
  heroBtnOutline: {
    flex: 1,
  },
  telemetryCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: '#FFFFFF',
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  telemetryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemetryIcon: {
    fontSize: 18,
  },
  telemetryInfo: {
    flex: 1,
  },
  telemetryTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  telemetryDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  telemetryActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  telemetryActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  telemetryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  activityCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: '#FFFFFF',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  activityCheck: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.success,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  activitySub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  activityDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs + 2,
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  quickNavBtn: {
    flex: 1,
  },
});
