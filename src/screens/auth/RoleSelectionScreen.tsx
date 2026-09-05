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
  TouchableOpacity,
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
  const [inspectorSubProfile, setInspectorSubProfile] = useState<'inspector_a' | 'inspector_b'>('inspector_a');

  const handleContinue = async () => {
    if (selectedRole === 'inspector') {
      await selectRole('inspector', inspectorSubProfile);
    } else if (selectedRole) {
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
          <View key={role.id}>
            <RoleCard
              role={role}
              isSelected={selectedRole === role.id}
              onSelect={() => setSelectedRole(role.id)}
            />
            {role.id === 'inspector' && selectedRole === 'inspector' && (
              <View style={styles.subInspectorCard}>
                <View style={styles.subInspectorHeader}>
                  <Ionicons name="people" size={16} color={colors.brand.primary} />
                  <Text style={styles.subInspectorTitle}>Select Inspector Account:</Text>
                </View>
                <Text style={styles.subInspectorDesc}>
                  Test automated random assignment acknowledgment across multiple officers:
                </Text>

                <View style={styles.subInspectorOptions}>
                  <TouchableOpacity
                    style={[
                      styles.subOptionBtn,
                      inspectorSubProfile === 'inspector_a' && styles.subOptionBtnActive,
                    ]}
                    onPress={() => setInspectorSubProfile('inspector_a')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.subOptionRadio}>
                      {inspectorSubProfile === 'inspector_a' && <View style={styles.subOptionRadioDot} />}
                    </View>
                    <View style={styles.subOptionTextCol}>
                      <Text
                        style={[
                          styles.subOptionName,
                          inspectorSubProfile === 'inspector_a' && styles.subOptionNameActive,
                        ]}
                      >
                        Demo Field Inspector A
                      </Text>
                      <Text style={styles.subOptionMeta}>ID: PMU-DEMO-004 • Delhi North</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subOptionBtn,
                      inspectorSubProfile === 'inspector_b' && styles.subOptionBtnActive,
                    ]}
                    onPress={() => setInspectorSubProfile('inspector_b')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.subOptionRadio}>
                      {inspectorSubProfile === 'inspector_b' && <View style={styles.subOptionRadioDot} />}
                    </View>
                    <View style={styles.subOptionTextCol}>
                      <Text
                        style={[
                          styles.subOptionName,
                          inspectorSubProfile === 'inspector_b' && styles.subOptionNameActive,
                        ]}
                      >
                        Demo Field Inspector B
                      </Text>
                      <Text style={styles.subOptionMeta}>ID: PMU-DEMO-005 • Delhi Central</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
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
  subInspectorCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.brand.primaryLight,
    padding: spacing.md,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    marginHorizontal: 4,
    ...shadows.xs,
  },
  subInspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  subInspectorTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  subInspectorDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  subInspectorOptions: {
    gap: 8,
  },
  subOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  subOptionBtnActive: {
    borderColor: colors.brand.primary,
    backgroundColor: '#EFF6FF',
  },
  subOptionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  subOptionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand.primary,
  },
  subOptionTextCol: {
    flex: 1,
  },
  subOptionName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  subOptionNameActive: {
    color: colors.brand.primary,
    fontWeight: typography.weights.bold,
  },
  subOptionMeta: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
});
