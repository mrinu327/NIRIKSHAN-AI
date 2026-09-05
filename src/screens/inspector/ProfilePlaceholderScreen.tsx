/**
 * ProfilePlaceholderScreen (Inspector)
 * PMU Inspector - Officer Profile & Field Credentials
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

export const ProfilePlaceholderScreen: React.FC = () => {
  const { currentUser, switchRole } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Inspector Credentials"
        subtitle="PMU Field Auditor Identity & Device Authorization"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.demoWatermark}>
            <Text style={styles.demoWatermarkText}>DEMO / PROTOTYPE IDENTITY</Text>
          </View>

          <View style={styles.profileMainRow}>
            <View style={styles.avatar}>
              <Ionicons name="clipboard" size={26} color={colors.text.inverse} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name || 'Demo PMU Inspector'}</Text>
              <Text style={styles.profileDesignation}>
                {currentUser?.designation || 'PMU Field Inspection Wing'}
              </Text>
              <Text style={styles.profileOrg}>
                {currentUser?.organization || 'State Project Monitoring Unit (Demo)'}
              </Text>
              <View style={styles.badgeRow}>
                <Text style={styles.badgeText}>Demo ID: {currentUser?.badgeId || 'PMU-DEMO-002'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle" size={13} color={colors.text.muted} />
            <Text style={styles.disclaimerText}>
              Synthetic demo account for UI inspection • Does not represent any real field officer.
            </Text>
          </View>
        </View>

        <SectionHeader
          title="Field Security & Geotag Status"
          subtitle="Device authorization for on-site evidence collection"
        />

        <View style={styles.infoCard}>
          <View style={styles.statusRow}>
            <Ionicons name="shield-checkmark" size={18} color={colors.status.normal} />
            <Text style={styles.statusText}>MoSJE Biometric Encryption Key Active (Demo)</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="navigate-circle" size={18} color={colors.status.normal} />
            <Text style={styles.statusText}>GPS High-Accuracy Hardware Ready</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="cloud-offline" size={18} color={colors.brand.primary} />
            <Text style={styles.statusText}>Offline Sync Buffer: 0 Pending Audits</Text>
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
    backgroundColor: colors.brand.primary,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
});
