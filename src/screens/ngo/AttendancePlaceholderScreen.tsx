/**
 * AttendancePlaceholderScreen
 * NGO / Institute - Daily Attendance Log & Submission Form Preview
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { AttendanceCard } from '../../components/cards/AttendanceCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { LoadingState } from '../../components/common/LoadingState';
import { mockAttendanceService } from '../../services/mock/mockAttendanceService';
import { AttendanceSummary, AttendanceSubmission } from '../../types/attendance';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const AttendancePlaceholderScreen: React.FC = () => {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [history, setHistory] = useState<AttendanceSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mockAttendanceService.getTodaySummary(),
      mockAttendanceService.getAttendanceHistory(),
    ]).then(([sumData, histData]) => {
      setSummary(sumData);
      setHistory(histData);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Beneficiary Attendance"
        subtitle="Daily biometric & morning roll-call logs"
      />

      {loading ? (
        <LoadingState message="Loading attendance logs..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {summary && (
            <AttendanceCard
              summary={summary}
              instituteName="Sunrise Rehabilitation Centre"
            />
          )}

          <SectionHeader
            title="Recent Submissions"
            subtitle="Previous log entries verified by MoSJE system"
            badgeCount={history.length}
          />

          {history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.histHeader}>
                <Text style={styles.histDate}>{item.date}</Text>
                <View style={styles.verifiedTag}>
                  <Ionicons name="checkmark-done" size={13} color={colors.status.normal} />
                  <Text style={styles.verifiedText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.histCount}>
                {item.presentCount} / {item.totalEnrolled} Present ({item.absentCount} Absent)
              </Text>
              <Text style={styles.histSubmitted}>
                Submitted by: {item.submittedBy} at {item.submittedAt}
              </Text>
            </View>
          ))}
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
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  historyCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  histHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  histDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    color: colors.status.normal,
    fontWeight: typography.weights.semibold,
    marginLeft: 3,
  },
  histCount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navyLight,
    marginTop: 2,
  },
  histSubmitted: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 4,
  },
});
