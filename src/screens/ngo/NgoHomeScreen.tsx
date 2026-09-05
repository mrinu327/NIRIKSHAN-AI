/**
 * NgoHomeScreen
 * NGO / Institute Representative Portal Dashboard.
 * Mobile-first responsive layout with dynamic card stacking.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { StatCard } from '../../components/common/StatCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { AttendanceCard } from '../../components/cards/AttendanceCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockAttendanceService } from '../../services/mock/mockAttendanceService';
import { AttendanceSummary } from '../../types/attendance';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Ionicons } from '@expo/vector-icons';

export const NgoHomeScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);

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

  const onRefresh = () => {
    setRefreshing(true);
    loadNgoData();
  };

  const statItemWidth = isDesktop ? '23.8%' : isNarrow ? '100%' : '48%';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Welcome"
        subtitle="Sunrise Rehabilitation Centre • New Delhi"
      />

      {loading ? (
        <LoadingState message="Fetching institute compliance records..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
          }
        >
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
              <Ionicons name="videocam" size={18} color={colors.status.warning} />
              <Text style={styles.complianceTitle}>CCTV Feed Telemetry Status</Text>
            </View>
            <Text style={styles.complianceDesc}>
              Stream is active. System detected a temporary headcount variance (25 estimated vs 42 submitted). A routine PMU verification has been scheduled.
            </Text>
          </View>
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
    marginBottom: 6,
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
});
