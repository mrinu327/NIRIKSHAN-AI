/**
 * ProfilePlaceholderScreen (NGO)
 * SIH26095 | MoSJE NGO / Institute Portal
 *
 * Institute Profile & Authorized Signatory Record.
 * Displays authorized representative credentials, registered facility details,
 * verified telemetry devices, and DDRS scheme information under MoSJE.
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
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { useAuth } from '../../context/AuthContext';
import { mockAttendanceService } from '../../services/mock/mockAttendanceService';
import { AttendanceSummary } from '../../types/attendance';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const ProfilePlaceholderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentRole, currentUser, switchRole, logout, resetDemoData } = useAuth();

  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // Motion values
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const cardAnims = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    mockAttendanceService.getTodaySummary().then((data) => {
      setSummary(data);
    });

    const unsub = mockAttendanceService.subscribe(() => {
      mockAttendanceService.getTodaySummary().then((data) => {
        setSummary(data);
      });
    });

    return unsub;
  }, []);

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

  // Presentation-only cleanup of development wording while preserving underlying values
  const displayName = currentUser?.name
    ? currentUser.name.replace('Demo ', '')
    : 'Dr. Rajesh Sharma';
  const displayDesignation = currentUser?.designation
    ? currentUser.designation.replace(' (Demo)', '').replace('Demo ', '')
    : 'Centre Administrator & Medical Officer';
  const displayOrg = currentUser?.organization
    ? currentUser.organization.replace(' (Demo)', '')
    : 'Sunrise Rehabilitation Centre';
  const displayBadgeId = (currentUser?.badgeId || 'NGO-003').replace('DEMO-', '');

  const totalCapacity = summary?.todayCapacity ?? 50;

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
                Institute Profile
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                MoSJE Grantee & Authorized Signatory Record
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenSlide }] }}>
          {/* Institutional Identity Card */}
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
                <Ionicons name="business" size={26} color={colors.text.inverse} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileDesignation}>{displayDesignation}</Text>
                <Text style={styles.profileOrg}>{displayOrg}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>Registration ID: {displayBadgeId}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Section: Facility Details */}
          <SectionHeader
            title="Facility Details"
            subtitle="Location & Capacity registered under MoSJE scheme"
          />

          {/* Registered Facility Information Card */}
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
            {/* Address Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="location-outline" size={16} color={colors.brand.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Facility Address:</Text>
                <Text style={styles.detailValue}>
                  Plot 42, Institutional Area, Sector 14, Rohini, New Delhi - 110085
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Capacity Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="people-outline" size={16} color={colors.brand.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Sanctioned Beneficiary Capacity:</Text>
                <Text style={styles.detailValue}>{totalCapacity} In-house Residents (DDRS Approved)</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Scheme Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="ribbon-outline" size={16} color={colors.brand.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Scheme Category:</Text>
                <Text style={styles.detailValue}>Deendayal Disabled Rehabilitation Scheme (DDRS)</Text>
              </View>
            </View>
          </Animated.View>

          {/* Section: Verified Telemetry Hardware */}
          <SectionHeader
            title="Connected Hardware"
            subtitle="Registered edge devices transmitting telemetry to MoSJE"
          />

          <Animated.View
            style={[
              styles.infoCard,
              {
                opacity: cardAnims[2],
                transform: [
                  {
                    translateY: cardAnims[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="finger-print-outline" size={16} color={colors.brand.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Biometric Terminal #BIO-01:</Text>
                <Text style={styles.detailValue}>
                  UIDAI / Aadhaar enabled dual Iris & Optical Fingerprint Scanner (Online)
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="videocam-outline" size={16} color={colors.brand.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>CCTV Edge Gateway #CAM-01:</Text>
                <Text style={styles.detailValue}>
                  Channel 1 (Main Entrance & Activity Hall) • 1080p RTSP Stream Active
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Role Switching & Account Actions */}
          <Animated.View
            style={{
              opacity: cardAnims[3],
              transform: [
                {
                  translateY: cardAnims[3].interpolate({
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
                onPress={() => switchRole('inspector')}
                activeOpacity={0.8}
              >
                <Ionicons name="clipboard-outline" size={15} color={colors.brand.primary} />
                <Text style={styles.roleSwitchBtnText}>Switch to Inspector</Text>
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
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },

  // Institutional Identity Card
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: typography.sizes.base + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  profileDesignation: {
    fontSize: typography.sizes.xs + 1,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
    marginTop: 2,
  },
  profileOrg: {
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
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },

  // Facility Details Card
  infoCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  detailIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(42, 92, 224, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
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
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.divider,
    marginVertical: spacing.sm,
  },

  // Role Switching Action
  switchActionButton: {
    marginTop: spacing.sm,
    minHeight: 48,
  },
  resetNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  resetNoticeText: {
    fontSize: typography.sizes.xs,
    color: '#065F46',
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  actionSectionLabel: {
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
    borderColor: colors.brand.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    gap: 6,
    ...shadows.xs,
  },
  roleSwitchBtnText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navyDark,
  },
  actionButtonSecondary: {
    width: '100%',
  },
});

