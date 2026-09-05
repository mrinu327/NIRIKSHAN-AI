/**
 * RoleSelectionScreen
 * Opening screen for SIH26095 mobile application prototype.
 * Allows instant selection of one of three primary MoSJE monitoring roles.
 * Mobile-first touch-friendly design.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/role';
import { DEMO_ROLES } from '../../data/mockData';
import { RoleCard } from '../../components/cards/RoleCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const RoleSelectionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { selectRole, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('official');

  const handleContinue = async () => {
    if (selectedRole) {
      await selectRole(selectedRole);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Government Header Banner */}
      <View style={[styles.headerBanner, { paddingTop: Math.max(insets.top, 16) + spacing.xs }]}>
        <View style={styles.headerInner}>
          <View style={styles.emblemRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={24} color={colors.text.inverse} />
            </View>
            <View style={styles.emblemBadge}>
              <Text style={styles.emblemBadgeText}>SIH26095 PROTOTYPE</Text>
            </View>
          </View>

          <Text style={styles.appTitle}>Smart Monitoring & Inspection</Text>
          <Text style={styles.appSubtitle}>
            Ministry of Social Justice & Empowerment (MoSJE)
          </Text>
          <Text style={styles.systemTagline}>
            Real-Time Anomaly Detection & Field Verification Architecture
          </Text>
        </View>
      </View>

      {/* Role Selection List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeHeading}>Select Demo Role</Text>
          <Text style={styles.welcomeDescription}>
            Choose a role below to explore role-tailored dashboards, field inspection tasks, and attendance telemetry.
          </Text>
        </View>

        {DEMO_ROLES.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isSelected={selectedRole === role.id}
            onSelect={() => setSelectedRole(role.id)}
          />
        ))}

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.text.muted} />
          <Text style={styles.securityNoteText}>
            Frontend Demo Login • Role-Based Navigation Sandbox
          </Text>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + spacing.xs }]}>
        <View style={styles.footerInner}>
          <PrimaryButton
            title="Continue to Dashboard"
            onPress={handleContinue}
            loading={isLoading}
            iconName="arrow-forward"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerBanner: {
    backgroundColor: colors.brand.navy,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
    ...shadows.sm,
  },
  headerInner: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  emblemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  emblemBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    borderColor: '#3B82F6',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  emblemBadgeText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.6,
  },
  appTitle: {
    fontSize: typography.sizes.xl + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.5,
    marginBottom: 4,
    lineHeight: 28,
  },
  appSubtitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: '#93C5FD',
    marginBottom: 4,
    lineHeight: 18,
  },
  systemTagline: {
    fontSize: typography.sizes.xs - 1,
    color: '#94A3B8',
    lineHeight: 15,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  welcomeBox: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  welcomeHeading: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  welcomeDescription: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.base,
  },
  securityNoteText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: 6,
  },
  footer: {
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    width: '100%',
    ...shadows.sm,
  },
  footerInner: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
});
