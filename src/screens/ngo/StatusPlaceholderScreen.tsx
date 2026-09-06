/**
 * StatusPlaceholderScreen
 * SIH26095 | MoSJE NGO / Institute Portal
 *
 * Institute Compliance Index & Systems Telemetry Register.
 * Displays institutional DDRS verification status and connected edge telemetry health.
 */

import React, { useEffect, useRef } from 'react';
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
import { SUNRISE_ATTENDANCE } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const StatusPlaceholderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentRole, switchRole } = useAuth();

  // Motion values
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
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
  }, []);

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
                Compliance & Health
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Verification status for MoSJE quarterly grant disbursement
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenSlide }] }}>
          {/* Primary Compliance Area */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeaderRow}>
              <Text style={styles.scoreLabel}>INSTITUTE COMPLIANCE INDEX</Text>
              <View style={styles.scoreBadge}>
                <Ionicons name="alert-circle" size={14} color={colors.status.warning} />
                <Text style={styles.scoreStatus}>Notice: Attention Required</Text>
              </View>
            </View>

            <Text style={styles.scoreValue}>71 / 100</Text>

            {/* Headcount Variance Exception Panel */}
            <View style={styles.variancePanel}>
              <View style={styles.varianceHeader}>
                <Ionicons name="information-circle" size={16} color={colors.status.warning} />
              </View>
              <Text style={styles.scoreDesc}>
                Variance flagged between camera estimate (25) and morning attendance ({SUNRISE_ATTENDANCE.currentSubmittedAttendance}/{SUNRISE_ATTENDANCE.totalBeneficiaries}). Pending inspector verification.
              </Text>
            </View>
          </View>

          {/* Telemetry Subsystems Register */}
          <SectionHeader
            title="Telemetry Subsystems"
            subtitle="Real-time monitoring health metrics"
          />

          <View style={styles.subsystemCard}>
            {/* Subsystem 1: Biometric Terminal */}
            <View style={styles.itemRow}>
              <View style={[styles.itemIconBadge, styles.iconNormal]}>
                <Ionicons name="finger-print" size={18} color={colors.status.normal} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>Biometric Terminal</Text>
                <Text style={styles.itemSub}>Device #BIO-01 • Synced 09:30 AM</Text>
              </View>
              <View style={[styles.statusPill, styles.pillNormal]}>
                <Ionicons name="checkmark-circle" size={12} color={colors.status.normal} />
                <Text style={[styles.itemStatus, { color: colors.status.normal }]}>Online</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Subsystem 2: CCTV Edge Stream */}
            <View style={styles.itemRow}>
              <View style={[styles.itemIconBadge, styles.iconWarning]}>
                <Ionicons name="videocam" size={18} color={colors.status.warning} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>CCTV Edge Stream</Text>
                <Text style={styles.itemSub}>Channel 1 (Main Hall) • Discrepancy logged</Text>
              </View>
              <View style={[styles.statusPill, styles.pillWarning]}>
                <Ionicons name="alert-circle" size={12} color={colors.status.warning} />
                <Text style={[styles.itemStatus, { color: colors.status.warning }]}>Flagged</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Subsystem 3: Quarterly Audits */}
            <View style={styles.itemRow}>
              <View style={[styles.itemIconBadge, styles.iconNormal]}>
                <Ionicons name="document-attach" size={18} color={colors.status.normal} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>Quarterly Audits</Text>
                <Text style={styles.itemSub}>Last verified 12 Jan 2026</Text>
              </View>
              <View style={[styles.statusPill, styles.pillNormal]}>
                <Ionicons name="checkmark-circle" size={12} color={colors.status.normal} />
                <Text style={[styles.itemStatus, { color: colors.status.normal }]}>Up to Date</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
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

  // Primary Compliance Card
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
  scoreHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    letterSpacing: 0.6,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    gap: 4,
  },
  scoreStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.status.warning,
  },
  scoreValue: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: spacing.sm,
  },

  // Headcount Variance Panel
  variancePanel: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
  },
  varianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  scoreDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Structured Telemetry Subsystems Card
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
  itemIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconNormal: {
    backgroundColor: 'rgba(30, 142, 90, 0.1)',
  },
  iconWarning: {
    backgroundColor: colors.status.warningLight,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  itemSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    gap: 4,
  },
  pillNormal: {
    backgroundColor: 'rgba(30, 142, 90, 0.1)',
  },
  pillWarning: {
    backgroundColor: colors.status.warningLight,
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
