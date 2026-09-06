/**
 * NgoHomeScreen
 * SIH26095 | MoSJE NGO / Institute Representative Portal Dashboard
 *
 * Real-time institutional monitoring workspace displaying today's attendance turnout,
 * submission state, CCTV edge telemetry notice, and verified MoSJE registry records.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { AttendanceCard } from '../../components/cards/AttendanceCard';
import { mockAttendanceService } from '../../services/mock/mockAttendanceService';
import { AttendanceSummary } from '../../types/attendance';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const NgoHomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const isDesktop = width >= 900;
  const { currentRole, switchRole } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);

  // Motion values
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(12)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Pulsing skeleton animation loop
  useEffect(() => {
    if (loading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, {
            toValue: 0.85,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonPulse, {
            toValue: 0.35,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [loading]);

  const loadNgoData = async () => {
    try {
      const summaryData = await mockAttendanceService.getTodaySummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading NGO dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNgoData();
  }, []);

  useEffect(() => {
    if (!loading && summary) {
      Animated.parallel([
        Animated.timing(screenFade, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(screenSlide, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, summary]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNgoData();
  };

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'official':
        return 'MoSJE Official';
      case 'inspector':
        return 'PMU Inspection Officer';
      case 'ngo':
        return 'NGO / Institute';
      default:
        return 'MoSJE Portal';
    }
  };

  const statItemWidth = isDesktop ? '23.8%' : isNarrow ? '100%' : '48%';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Executive Government-Grade MoSJE Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerBranding}>
              <View style={styles.headerEmblem}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
              </View>
              <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
            </View>

            <View style={styles.headerActionsRight}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{getRoleLabel()}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={switchRole}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.switchButton}
                accessibilityRole="button"
                accessibilityLabel="Switch Role"
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.text.inverse} />
                <Text style={styles.switchText}>Switch Role</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerMainRow}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Welcome
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Sunrise Rehabilitation Centre • New Delhi
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Skeleton Section Header */}
          <View style={styles.skeletonSectionHeader}>
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 260, height: 12, marginTop: 6, opacity: skeletonPulse }]} />
          </View>

          {/* Skeleton Stats Grid */}
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.skeletonStatCard,
                  { width: statItemWidth, opacity: skeletonPulse },
                ]}
              />
            ))}
          </View>

          {/* Skeleton Attendance Card */}
          <View style={styles.skeletonSectionHeader}>
            <Animated.View style={[styles.skeletonLine, { width: 160, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 240, height: 12, marginTop: 6, opacity: skeletonPulse }]} />
          </View>
          <Animated.View style={[styles.skeletonAttendanceCard, { opacity: skeletonPulse }]} />

          {/* Skeleton Telemetry Card */}
          <Animated.View style={[styles.skeletonTelemetryCard, { opacity: skeletonPulse }]} />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
          }
        >
          <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenSlide }] }}>
            {/* Summary Stat Cards */}
            <SectionHeader
              title="Facility Monitoring Summary"
              subtitle="Today's compliance status and verified telemetry"
            />

            <View style={styles.statsGrid}>
              <StatCard
                label="Today's Attendance"
                value={`${summary?.todayPresent ?? 42}/${summary?.todayCapacity ?? 50}`}
                iconName="people"
                variant="normal"
                subtitle="84% turnout"
                style={[styles.statGridItem, { width: statItemWidth }]}
              />
              <StatCard
                label="Submission Status"
                value={summary?.submissionStatus ?? 'Submitted'}
                iconName="checkmark-circle"
                variant="normal"
                subtitle="09:28 AM on time"
                style={[styles.statGridItem, { width: statItemWidth }]}
              />
              <StatCard
                label="Pending Requests"
                value="1"
                iconName="mail"
                variant="warning"
                subtitle="Audit clarification"
                style={[styles.statGridItem, { width: statItemWidth }]}
              />
              <StatCard
                label="Project Status"
                value="Active"
                iconName="shield-checkmark"
                variant="primary"
                subtitle="MoSJE Registered"
                style={[styles.statGridItem, { width: statItemWidth }]}
              />
            </View>

            {/* Dedicated Attendance Card */}
            <SectionHeader
              title="Daily Attendance Record"
              subtitle="Synced with MoSJE central monitoring pipeline"
            />

            {summary && (
              <AttendanceCard
                summary={summary}
                instituteName="Sunrise Rehabilitation Centre"
              />
            )}

            {/* Compliance & CCTV Health Banner */}
            <View style={styles.complianceCard}>
              <View style={styles.complianceHeader}>
                <View style={styles.complianceIconBadge}>
                  <Ionicons name="videocam" size={16} color={colors.status.warning} />
                </View>
                <Text style={styles.complianceTitle}>CCTV Feed Telemetry Status</Text>
              </View>
              <Text style={styles.complianceDesc}>
                Stream is active. System detected a temporary headcount variance (25 estimated vs 42 submitted). A routine PMU verification has been scheduled.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },

  // Executive MoSJE Header
  headerContainer: {
    backgroundColor: colors.brand.navy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    ...shadows.sm,
  },
  headerInner: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmblem: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerMinistry: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleBadgeText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(42, 92, 224, 0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(42, 92, 224, 0.4)',
  },
  switchText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.lg + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  // Scroll Content & Layout
  scrollContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statGridItem: {
    marginBottom: spacing.md,
  },

  // Compliance / CCTV Discrepancy Card
  complianceCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
    marginTop: spacing.xs,
    ...shadows.xs,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  complianceIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.status.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  complianceTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  complianceDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Skeleton Styles
  skeletonSectionHeader: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonStatCard: {
    height: 102,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  skeletonAttendanceCard: {
    height: 190,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  skeletonTelemetryCard: {
    height: 90,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.neutral.border,
    marginTop: spacing.xs,
  },
});
