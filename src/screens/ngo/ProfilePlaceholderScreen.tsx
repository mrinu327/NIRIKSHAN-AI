/**
 * ProfilePlaceholderScreen (NGO)
 * NGO / Institute - Profile & Authorized Signatory Details
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { SUNRISE_ATTENDANCE } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const ProfilePlaceholderScreen: React.FC = () => {
  const { currentUser, switchRole } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Institute Profile"
        subtitle="MoSJE Grantee & Authorized Signatory Record"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.demoWatermark}>
            <Text style={styles.demoWatermarkText}>DEMO / PROTOTYPE IDENTITY</Text>
          </View>

          <View style={styles.profileMainRow}>
            <View style={styles.avatar}>
              <Ionicons name="business" size={26} color={colors.text.inverse} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name || 'Demo Institute Representative'}</Text>
              <Text style={styles.profileDesignation}>
                {currentUser?.designation || 'Centre Administrator (Demo)'}
              </Text>
              <Text style={styles.profileOrg}>
                {currentUser?.organization || 'Sunrise Rehabilitation Centre (Demo)'}
              </Text>
              <View style={styles.badgeRow}>
                <Text style={styles.badgeText}>Registration ID: {currentUser?.badgeId || 'NGO-DEMO-003'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle" size={13} color={colors.text.muted} />
            <Text style={styles.disclaimerText}>
              Synthetic demo account for UI inspection • Does not represent any real organization representative.
            </Text>
          </View>
        </View>

        <SectionHeader
          title="Facility Details"
          subtitle="Location & Capacity registered under MoSJE scheme"
        />

        <View style={styles.infoCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Facility Address:</Text>
            <Text style={styles.detailValue}>Plot 42, Institutional Area, Sector 14, Rohini, New Delhi</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sanctioned Beneficiary Capacity:</Text>
            <Text style={styles.detailValue}>{SUNRISE_ATTENDANCE.totalBeneficiaries} In-house Residents</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Scheme Category:</Text>
            <Text style={styles.detailValue}>Deendayal Disabled Rehabilitation Scheme (DDRS)</Text>
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
  detailRow: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
});
