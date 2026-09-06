/**
 * ProfilePlaceholderScreen (Inspector)
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Inspector Root Tab: Officer Profile & Field Credentials
 * Displays authenticated field officer credentials, device authorization,
 * biometric encryption readiness, GPS status, and role switcher.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  useWindowDimensions,
} from 'react-native';
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
  const { width } = useWindowDimensions();

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

          {/* Role Switching Section */}
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
            <PrimaryButton
              title="Switch Role"
              onPress={switchRole}
              iconName="swap-horizontal"
              style={styles.switchButton}
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
});
