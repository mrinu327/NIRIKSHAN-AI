/**
 * MorePlaceholderScreen
 * MoSJE Official - System Profile, Guidelines, and Settings
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Settings & Oversight"
        subtitle="Ministry protocols and credential management"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Explicit Demo Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.demoWatermark}>
            <Text style={styles.demoWatermarkText}>DEMO / PROTOTYPE IDENTITY</Text>
          </View>

          <View style={styles.profileMainRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={26} color={colors.text.inverse} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name || 'Demo Government Official'}</Text>
              <Text style={styles.profileDesignation}>
                Department: {currentUser?.department || 'National Monitoring Division'}
              </Text>
              <Text style={styles.profileOrg}>
                Organization: {currentUser?.organization || 'Ministry of Social Justice & Empowerment'}
              </Text>
              <View style={styles.badgeRow}>
                <Text style={styles.badgeText}>Demo ID: {currentUser?.badgeId || 'GOV-DEMO-001'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle" size={13} color={colors.text.muted} />
            <Text style={styles.disclaimerText}>
              Synthetic demo account for UI inspection • Does not represent any real MoSJE employee.
            </Text>
          </View>
        </View>

        {/* Phase Roadmap Note */}
        <SectionHeader
          title="Implementation Phase Info"
          subtitle="Smart India Hackathon 2026 Architecture"
        />

        <View style={styles.infoCard}>
          <View style={styles.roadmapItem}>
            <View style={[styles.stepDot, { backgroundColor: colors.status.normal }]} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Phase 1: Foundations (Active)</Text>
              <Text style={styles.stepDesc}>
                Design system, role switching, mock services, and high-level mobile shells.
              </Text>
            </View>
          </View>

          <View style={styles.roadmapItem}>
            <View style={[styles.stepDot, { backgroundColor: colors.status.warning }]} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Phase 2: Workflows & Verifications</Text>
              <Text style={styles.stepDesc}>
                Interactive surprise inspection allocation, evidence uploads, and CCTV feed simulator.
              </Text>
            </View>
          </View>

          <View style={styles.roadmapItem}>
            <View style={[styles.stepDot, { backgroundColor: colors.text.disabled }]} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Phase 3: AI Anomaly Explanations</Text>
              <Text style={styles.stepDesc}>
                Explainable anomaly scoring, GPS geotagging, and audit generation.
              </Text>
            </View>
          </View>
        </View>

        <PrimaryButton
          title="Switch Demo Role"
          onPress={switchRole}
          iconName="swap-horizontal"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
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
  profileCard: {
    backgroundColor: colors.neutral.surface,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  demoWatermark: {
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  demoWatermarkText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.8,
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    marginTop: spacing.sm,
  },
  disclaimerText: {
    fontSize: 10,
    color: colors.text.muted,
    marginLeft: 4,
    flex: 1,
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
    lineHeight: 16,
  },
});
