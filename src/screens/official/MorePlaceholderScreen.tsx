/**
 * MorePlaceholderScreen
 * MoSJE Official - System Profile, Guidelines, and Settings
 * Central oversight credentials and national platform architecture.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const MorePlaceholderScreen: React.FC = () => {
  const { currentUser, switchRole } = useAuth();

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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Official Profile & Credentials Card */}
          <View style={styles.profileCard}>
            <View style={styles.credentialsBadge}>
              <Ionicons name="shield-checkmark" size={11} color={colors.brand.primary} />
              <Text style={styles.credentialsBadgeText}>CENTRAL OVERSIGHT CREDENTIALS • OFFICIAL ACCESS</Text>
            </View>

            <View style={styles.profileMainRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={26} color={colors.text.inverse} />
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
                  <Text style={styles.badgeText}>Officer ID: {officerBadgeId}</Text>
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

            <View style={styles.roadmapItem}>
              <View style={[styles.stepDot, { backgroundColor: colors.brand.primary }]} />
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Field Verification Network</Text>
                <Text style={styles.stepDesc}>
                  Impartial automated dispatch of PMU field officers, GPS-validated photo evidence, and sealed inspection dossiers.
                </Text>
              </View>
            </View>

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

          <PrimaryButton
            title="Switch User Workspace / Role"
            onPress={switchRole}
            iconName="swap-horizontal"
            style={{ marginTop: spacing.lg }}
          />
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
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
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
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  profileDesignation: {
    fontSize: typography.sizes.sm,
    color: colors.brand.primary,
    fontWeight: typography.weights.medium,
    marginTop: 1,
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
  infoCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.xs,
  },
  roadmapItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
    marginTop: 2,
    lineHeight: 17,
  },
});

