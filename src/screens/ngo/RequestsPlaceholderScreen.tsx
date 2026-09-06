/**
 * RequestsPlaceholderScreen
 * SIH26095 | MoSJE NGO / Institute Portal
 *
 * Official Requests & Correspondence Queue.
 * Displays official inquiries, clarification notices, and action-required items from MoSJE / PMU.
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
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const RequestsPlaceholderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentRole, switchRole } = useAuth();

  // Entrance motion
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
                Requests & Inquiries
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Official queries and inspection notices from MoSJE / PMU
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenSlide }] }}>
          {/* Active Section Header with Tab Badge */}
          <SectionHeader
            title="Active Requests"
            subtitle="Respond with explanations or updated documents"
            badgeCount={1}
          />

          {/* Official Request Record Card */}
          <View style={styles.requestCard}>
            {/* Request Header Status Strip */}
            <View style={styles.reqHeader}>
              <View style={styles.reqBadge}>
                <Ionicons name="alert-circle" size={13} color={colors.status.warning} />
                <Text style={styles.reqBadgeText}>ACTION REQUIRED</Text>
              </View>
              <View style={styles.reqDateContainer}>
                <Ionicons name="time-outline" size={13} color={colors.text.muted} />
                <Text style={styles.reqDate}>Today, 10:30 AM</Text>
              </View>
            </View>

            {/* Request Title */}
            <Text style={styles.reqTitle}>Clarification: Morning Roll-Call Variance</Text>

            {/* Issuing Authority Row */}
            <View style={styles.senderRow}>
              <View style={styles.senderIconBox}>
                <Ionicons name="business" size={13} color={colors.brand.primary} />
              </View>
              <Text style={styles.reqSender}>Issued by: Joint Director Desk, MoSJE</Text>
            </View>

            {/* Official Inset Statement Body */}
            <View style={styles.bodyBox}>
              <Text style={styles.reqBody}>
                The automated telemetry recorded an entrance count below reported attendance. A PMU inspector has been assigned for routine physical verification today between 11:00 AM - 04:00 PM. Please ensure visitor logs and kitchen receipts are ready.
              </Text>
            </View>

            {/* Document Reference Notice Footer */}
            <View style={styles.reqFooter}>
              <View style={styles.refPill}>
                <Ionicons name="document-text-outline" size={14} color={colors.brand.primary} />
                <Text style={styles.reqFooterText}>Reference Notice #MOSJE-REQ-2026-44</Text>
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
    minHeight: 28,
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

  // Request Card
  requestCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
    ...shadows.xs,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  reqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: 'rgba(217, 140, 30, 0.3)',
    gap: 4,
  },
  reqBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.warning,
    letterSpacing: 0.5,
  },
  reqDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reqDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  reqTitle: {
    fontSize: typography.sizes.base + 1,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    letterSpacing: -0.2,
    marginTop: 2,
    lineHeight: 22,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 6,
  },
  senderIconBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(42, 92, 224, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqSender: {
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
  },
  bodyBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  reqBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  reqFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  refPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 92, 224, 0.06)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(42, 92, 224, 0.15)',
    gap: 6,
  },
  reqFooterText: {
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },
});
