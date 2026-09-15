/**
 * ProfilePlaceholderScreen (Inspector)
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Inspector Root Tab: Officer Profile & Field Credentials
 * Displays authenticated field officer credentials, device authorization,
 * biometric encryption readiness, GPS status, and role switcher.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const ProfilePlaceholderScreen: React.FC = () => {
  const { currentUser, switchRole, logout, resetDemoData } = useAuth();
  const { width } = useWindowDimensions();
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // Entrance motion
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const cardAnims = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

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
      Animated.stagger(
        60,
        cardAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 240,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, []);

  // Clean presentation labels (removing visible demo artifacts)
  const officerName = currentUser?.name
    ? currentUser.name.replace('Demo ', '')
    : 'PMU Field Inspector';
  const officerBadge = (currentUser?.badgeId || 'PMU-002').replace('DEMO-', '');
  const officerOrg = currentUser?.organization
    ? currentUser.organization.replace(' (Demo)', '')
    : 'State Project Monitoring Unit';
  const officerDesignation = currentUser?.designation || 'PMU Field Inspection Wing';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Inspector Credentials"
        subtitle="PMU Field Auditor Identity & Device Authorization"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          }}
        >
          {/* Officer Identity Card */}
          <Animated.View
            style={[
              styles.profileCard,
              {
                opacity: cardAnims[0],
                transform: [
                  {
                    translateY: cardAnims[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.profileMainRow}>
              <View style={styles.avatar}>
                <Ionicons name="clipboard" size={26} color={colors.text.inverse} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{officerName}</Text>
                <Text style={styles.profileDesignation}>{officerDesignation}</Text>
                <Text style={styles.profileOrg}>{officerOrg}</Text>

                <View style={styles.badgeRow}>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>Badge ID: {officerBadge}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Section: Field Security & Geotag Status */}
          <SectionHeader
            title="Field Security & Geotag Status"
            subtitle="Device authorization for on-site evidence collection"
          />

          {/* Device & Authorization Status Card */}
          <Animated.View
            style={[
              styles.infoCard,
              {
                opacity: cardAnims[1],
                transform: [
                  {
                    translateY: cardAnims[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Status Row 1 */}
            <View style={styles.statusRow}>
              <View style={[styles.statusIconCircle, { backgroundColor: colors.status.normalLight }]}>
                <Ionicons name="shield-checkmark" size={18} color={colors.status.normal} />
              </View>
              <Text style={styles.statusText}>MoSJE Biometric Encryption Key Active</Text>
            </View>

            <View style={styles.divider} />

            {/* Status Row 2 */}
            <View style={styles.statusRow}>
              <View style={[styles.statusIconCircle, { backgroundColor: colors.status.normalLight }]}>
                <Ionicons name="navigate-circle" size={18} color={colors.status.normal} />
              </View>
              <Text style={styles.statusText}>GPS High-Accuracy Hardware Ready</Text>
            </View>

            <View style={styles.divider} />

            {/* Status Row 3 */}
            <View style={styles.statusRow}>
              <View style={[styles.statusIconCircle, { backgroundColor: colors.brand.primaryLight }]}>
                <Ionicons name="cloud-offline" size={18} color={colors.brand.primary} />
              </View>
              <Text style={styles.statusText}>Offline Sync Buffer: 0 Pending Audits</Text>
            </View>
          </Animated.View>

          {/* Role Switching & Account Actions Section */}
          <Animated.View
            style={{
              opacity: cardAnims[2],
              transform: [
                {
                  translateY: cardAnims[2].interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            }}
          >
            {resetNotice ? (
              <View style={styles.resetNoticeBox}>
                <Ionicons name="checkmark-circle" size={15} color={colors.status.normal} />
                <Text style={styles.resetNoticeText}>{resetNotice}</Text>
              </View>
            ) : null}

            <Text style={styles.actionSectionLabel}>DEMO ROLE NAVIGATION</Text>
            <View style={styles.switchButtonsRow}>
              <TouchableOpacity
                style={styles.roleSwitchBtn}
                onPress={() => switchRole('official')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark-outline" size={15} color={colors.brand.primary} />
                <Text style={styles.roleSwitchBtnText}>Switch to Official</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleSwitchBtn}
                onPress={() => switchRole('ngo')}
                activeOpacity={0.8}
              >
                <Ionicons name="business-outline" size={15} color={colors.brand.primary} />
                <Text style={styles.roleSwitchBtnText}>Switch to NGO</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 12 }} />

            <SecondaryButton
              title="Reset Demo Data"
              iconName="refresh-outline"
              onPress={async () => {
                await resetDemoData();
                setResetNotice('Demo datasets restored to initial state (42/50 attendance, 25 CCTV, ALT-2601 active).');
                setTimeout(() => setResetNotice(null), 4000);
              }}
              style={styles.actionButtonSecondary}
            />

            <View style={{ height: 8 }} />

            <SecondaryButton
              title="Logout / Exit Workspace"
              iconName="log-out-outline"
              onPress={() => logout()}
              style={styles.actionButtonSecondary}
            />
          </Animated.View>

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
  content: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },

  // Profile Card
  profileCard: {
    backgroundColor: colors.neutral.surface,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.xs,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.base + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  profileDesignation: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
    marginTop: 2,
  },
  profileOrg: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 6,
  },
  badgePill: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },

  // Security & Geotag Status Card
  infoCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  statusIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  statusText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.divider,
    marginVertical: spacing.sm,
  },

  // Role Switching Action
  switchButton: {
    marginTop: spacing.sm,
    minHeight: 48,
  },
  resetNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.normalLight,
    borderWidth: 1,
    borderColor: colors.status.normalBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  resetNoticeText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.status.normal,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  actionSectionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.6,
    marginBottom: spacing.xs + 2,
  },
  switchButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.palette.sageBorder,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    gap: 6,
    minHeight: 44,
    ...shadows.xs,
  },
  roleSwitchBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navyDark,
  },
  actionButtonSecondary: {
    width: '100%',
  },
});

