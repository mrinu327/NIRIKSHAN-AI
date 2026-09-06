/**
 * AttendancePlaceholderScreen
 * SIH26095 | MoSJE NGO / Institute Portal
 *
 * Daily Attendance Records & Institutional Submission Ledger.
 * Displays today's biometric attendance card and historical verified submissions.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { SectionHeader } from '../../components/common/SectionHeader';
import { AttendanceCard } from '../../components/cards/AttendanceCard';
import { mockAttendanceService } from '../../services/mock/mockAttendanceService';
import { AttendanceSummary, AttendanceSubmission } from '../../types/attendance';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const AttendancePlaceholderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentRole, switchRole } = useAuth();

  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [history, setHistory] = useState<AttendanceSubmission[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!loading && (summary || history.length > 0)) {
      Animated.parallel([
        Animated.timing(screenFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(screenSlide, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, summary, history]);

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
                Beneficiary Attendance
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Daily biometric & morning roll-call logs
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Skeleton Today AttendanceCard */}
          <Animated.View style={[styles.skeletonAttendanceCard, { opacity: skeletonPulse }]} />

          {/* Skeleton SectionHeader */}
          <View style={styles.skeletonSectionHeader}>
            <Animated.View style={[styles.skeletonLine, { width: 160, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 260, height: 12, marginTop: 6, opacity: skeletonPulse }]} />
          </View>

          {/* Skeleton Ledger Rows */}
          <View style={styles.skeletonLedgerBox}>
            <Animated.View style={[styles.skeletonLedgerRow, { opacity: skeletonPulse }]} />
            <View style={styles.skeletonDivider} />
            <Animated.View style={[styles.skeletonLedgerRow, { opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenSlide }] }}>
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

            <View style={styles.ledgerContainer}>
              {history.map((item, index) => {
                const isVerified = item.status === 'Verified';
                const submittedByName = item.submittedBy.replace('Demo ', '');
                const isLast = index === history.length - 1;

                return (
                  <View
                    key={item.id}
                    style={[styles.historyRow, isLast && styles.historyRowLast]}
                  >
                    <View style={styles.histHeader}>
                      <View style={styles.histDateGroup}>
                        <Ionicons name="calendar-outline" size={14} color={colors.brand.primary} />
                        <Text style={styles.histDate}>{item.date}</Text>
                      </View>
                      <View style={[styles.verifiedTag, isVerified ? styles.tagVerified : styles.tagSubmitted]}>
                        <Ionicons
                          name={isVerified ? 'checkmark-done' : 'checkmark'}
                          size={12}
                          color={isVerified ? colors.status.normal : colors.brand.primary}
                        />
                        <Text
                          style={[
                            styles.verifiedText,
                            { color: isVerified ? colors.status.normal : colors.brand.primary },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.histCount}>
                      {item.presentCount} / {item.totalEnrolled} Present ({item.absentCount} Absent)
                    </Text>

                    <View style={styles.histFooter}>
                      <Ionicons name="person-outline" size={12} color={colors.text.muted} />
                      <Text style={styles.histSubmitted}>
                        Submitted by: {submittedByName} at {item.submittedAt}
                      </Text>
                    </View>
                  </View>
                );
              })}
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

  // Main Scroll Content
  content: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },

  // Structured Attendance Ledger
  ledgerContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
    ...shadows.xs,
  },
  historyRow: {
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  histHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  histDateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  histDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    gap: 4,
  },
  tagVerified: {
    backgroundColor: 'rgba(30, 142, 90, 0.1)',
  },
  tagSubmitted: {
    backgroundColor: 'rgba(42, 92, 224, 0.1)',
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  histCount: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navyLight,
    marginTop: 2,
  },
  histFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.xs,
  },
  histSubmitted: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },

  // Skeleton Styles
  skeletonAttendanceCard: {
    height: 190,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  skeletonSectionHeader: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonLedgerBox: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    ...shadows.xs,
  },
  skeletonLedgerRow: {
    height: 64,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
  },
  skeletonDivider: {
    height: spacing.sm,
  },
});
