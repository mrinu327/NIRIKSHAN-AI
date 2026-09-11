/**
 * MorePlaceholderScreen
 * MoSJE Official - System Profile, Guidelines, and Settings
 * Central oversight credentials and national platform architecture.
 * Fully responsive for mobile and desktop viewports.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Animated, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { useAuth } from '../../context/AuthContext';
import { mockOfficialService } from '../../services/mock/mockOfficialService';
import { OfficialDashboardMetrics } from '../../types/official';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const MorePlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'More'>>();
  const { currentUser, switchRole, logout, resetDemoData } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [metrics, setMetrics] = useState<OfficialDashboardMetrics | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // Entrance animation
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(screenSlide, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();

    const loadData = async () => {
      const data = await mockOfficialService.getDashboardMetrics();
      setMetrics(data);
    };
    loadData();
    const unsub = mockOfficialService.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  const officerBadgeId = currentUser?.badgeId
    ? currentUser.badgeId.replace('DEMO-', 'OFFICER-').replace('-DEMO', '')
    : 'MoSJE-DIR-2026-042';

  const officerName = currentUser?.name && !currentUser.name.includes('Demo')
    ? currentUser.name
    : 'Dr. Rajesh Kumar, IAS';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Settings & Oversight"
        subtitle="Ministry Protocols & Central Credential Management"
      />

      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
          showsVerticalScrollIndicator={false}
        >
          {/* Official Profile & Credentials Card */}
          <View style={styles.profileCard}>
            <View style={styles.credentialsBadge}>
              <Ionicons name="shield-checkmark" size={11} color={colors.brand.primary} />
              <Text style={styles.credentialsBadgeText}>CENTRAL OVERSIGHT CREDENTIALS • OFFICIAL ACCESS</Text>
            </View>

            <View style={styles.profileMainRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.text.inverse} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{officerName}</Text>
                <Text style={styles.profileDesignation}>
                  Department: {currentUser?.department || 'National Monitoring Division'}
                </Text>
                <Text style={styles.profileOrg}>
                  {currentUser?.organization || 'Ministry of Social Justice & Empowerment'}
                </Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.badgeText}>Officer ID: {officerBadgeId} • Jurisdiction: National HQ</Text>
                </View>
              </View>
            </View>

            <View style={styles.disclaimerBox}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.status.normal} />
              <Text style={styles.disclaimerText}>
                Authorized Central Desk Access • Government of India MoSJE Monitoring Network
              </Text>
            </View>
          </View>

          {/* Operational Oversight Metrics Strip */}
          <SectionHeader
            title="Jurisdiction Summary"
            subtitle="Real-time operational counts across monitored facilities"
          />

          <View style={styles.metricsStripCard}>
            <View style={styles.metricStatCol}>
              <Text style={styles.metricStatVal}>{metrics?.totalProjects ?? 5}</Text>
              <Text style={styles.metricStatLabel}>Monitored NGOs</Text>
            </View>
            <View style={styles.metricStatDivider} />
            <View style={styles.metricStatCol}>
              <Text style={[styles.metricStatVal, { color: colors.status.highPriority }]}>
                {metrics?.pendingAlerts ?? 3}
              </Text>
              <Text style={styles.metricStatLabel}>Active Alerts</Text>
            </View>
            <View style={styles.metricStatDivider} />
            <View style={styles.metricStatCol}>
              <Text style={[styles.metricStatVal, { color: colors.brand.primary }]}>
                {metrics?.activeInspections ?? 3}
              </Text>
              <Text style={styles.metricStatLabel}>Inspections</Text>
            </View>
          </View>

          {/* Quick Navigation Shortcuts */}
          <SectionHeader
            title="Central Desk Shortcuts"
            subtitle="Immediate access to core operational workspaces"
          />

          <View style={styles.shortcutsCard}>
            <TouchableOpacity
              style={styles.shortcutItem}
              onPress={() => navigation.navigate('Inspections')}
              activeOpacity={0.75}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="clipboard-outline" size={18} color={colors.brand.primary} />
              </View>
              <View style={styles.shortcutContent}>
                <Text style={styles.shortcutTitle}>Field Inspection Oversight</Text>
                <Text style={styles.shortcutSub}>Monitor active PMU field orders, verify geofence, and review dossiers</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.shortcutDivider} />

            <TouchableOpacity
              style={styles.shortcutItem}
              onPress={() => navigation.navigate('Alerts')}
              activeOpacity={0.75}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.status.highPriority} />
              </View>
              <View style={styles.shortcutContent}>
                <Text style={styles.shortcutTitle}>Anomaly Triage & Review</Text>
                <Text style={styles.shortcutSub}>Review unverified roll-call vs CCTV discrepancy signals</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.shortcutDivider} />

            <TouchableOpacity
              style={styles.shortcutItem}
              onPress={() => navigation.navigate('Monitoring')}
              activeOpacity={0.75}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="business-outline" size={18} color={colors.status.normal} />
              </View>
              <View style={styles.shortcutContent}>
                <Text style={styles.shortcutTitle}>Institutions & NGO Directory</Text>
                <Text style={styles.shortcutSub}>Inspect project profiles, telemetry status, and 100m geofence maps</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          {/* National Monitoring Platform Architecture */}
          <SectionHeader
            title="Platform Architecture"
            subtitle="Integrated Digital Telemetry & Field Accountability Framework"
          />

          <View style={styles.infoCard}>
            <View style={styles.roadmapItem}>
              <View style={[styles.stepDot, { backgroundColor: colors.status.normal }]} />
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Digital Telemetry Integration</Text>
                <Text style={styles.stepDesc}>
                  Real-time aggregation of morning roll-call attendance, CCTV edge camera counts, and statistical variance monitoring.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.roadmapItem}>
              <View style={[styles.stepDot, { backgroundColor: colors.brand.primary }]} />
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Field Verification Network</Text>
                <Text style={styles.stepDesc}>
                  Impartial automated dispatch of PMU field officers, GPS-validated photo evidence, and sealed inspection dossiers.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.roadmapItem}>
              <View style={[styles.stepDot, { backgroundColor: colors.status.warning }]} />
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Explainable Decision Support</Text>
                <Text style={styles.stepDesc}>
                  Multi-signal anomaly assessment with neutral diagnostics, official human-in-the-loop review, and audit trail generation.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            {resetNotice ? (
              <View style={styles.resetNoticeBox}>
                <Ionicons name="checkmark-circle" size={15} color={colors.status.normal} />
                <Text style={styles.resetNoticeText}>{resetNotice}</Text>
              </View>
            ) : null}

            <Text style={styles.actionSectionLabel}>DEMO ROLE NAVIGATION</Text>
            <View style={styles.switchButtonsRow}>
              <TouchableOpacity
                style={styles.roleSwitchBtn}
                onPress={() => switchRole('inspector')}
                activeOpacity={0.8}
              >
                <Ionicons name="clipboard-outline" size={15} color={colors.brand.primary} />
                <Text style={styles.roleSwitchBtnText}>Switch to Inspector</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleSwitchBtn}
                onPress={() => switchRole('ngo')}
                activeOpacity={0.8}
              >
                <Ionicons name="business-outline" size={15} color={colors.brand.primary} />
                <Text style={styles.roleSwitchBtnText}>Switch to NGO</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 12 }} />

            <SecondaryButton
              title="Reset Demo Data"
              iconName="refresh-outline"
              onPress={async () => {
                await resetDemoData();
                setResetNotice('Demo datasets restored to initial state (42/50 attendance, 25 CCTV, ALT-2601 active).');
                setTimeout(() => setResetNotice(null), 4000);
              }}
              style={styles.resetButton}
            />

            <View style={{ height: 8 }} />

            <SecondaryButton
              title="Logout / Exit Workspace"
              iconName="log-out-outline"
              onPress={() => logout()}
              style={styles.logoutButton}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  animatedContainer: {
    flex: 1,
  },
  content: {
    width: '100%',
    padding: spacing.base,
    paddingBottom: spacing.xxxl + 24,
  },
  contentDesktop: {
    maxWidth: 780,
    alignSelf: 'center',
  },
  profileCard: {
    backgroundColor: colors.neutral.surface,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  credentialsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    gap: 5,
  },
  credentialsBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.6,
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.xs,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  profileDesignation: {
    fontSize: typography.sizes.xs + 1,
    color: colors.brand.primary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  profileOrg: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 1,
  },
  badgeRow: {
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.xs + 2,
    marginTop: spacing.sm + 2,
    gap: 6,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.status.normal,
    flex: 1,
    fontWeight: typography.weights.medium,
  },

  /* Operational Metrics Strip */
  metricsStripCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.xs,
  },
  metricStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricStatVal: {
    fontSize: typography.sizes.xl + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  metricStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  metricStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.neutral.border,
  },

  /* Shortcuts Card */
  shortcutsCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  shortcutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm + 2,
  },
  shortcutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutContent: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  shortcutSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  shortcutDivider: {
    height: 1,
    backgroundColor: colors.neutral.surfaceSubtle,
  },

  infoCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  roadmapItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  stepDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 3,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: spacing.sm,
  },
  actionContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  resetNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  resetNoticeText: {
    fontSize: typography.sizes.xs,
    color: '#065F46',
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  actionSectionLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.6,
    marginBottom: spacing.xs + 2,
  },
  switchButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    gap: 6,
    ...shadows.xs,
  },
  roleSwitchBtnText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navyDark,
  },
  resetButton: {
    width: '100%',
  },
  logoutButton: {
    width: '100%',
  },
  switchButton: {
    backgroundColor: colors.brand.primary,
    minHeight: 48,
  },
});

