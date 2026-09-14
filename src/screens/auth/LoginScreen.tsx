/**
 * LoginScreen / StakeholderSelectionScreen
 * MoSJE Centralized Monitoring & Inspection System
 * Nirikshan AI | Smart India Hackathon 2026
 *
 * SCREEN 1: Stakeholder Selection Portal
 * Preserves Mrinali's authoritative UI/UX redesign (commit 231f8f6).
 * Displays:
 * - Top MoSJE National Identity Bar
 * - Hero & Schematic Monitoring Network illustration (MONITOR -> INSPECT -> VERIFY)
 * - Evaluator demo credentials reference card
 * - Three clickable stakeholder role cards (NO credential input fields on this screen)
 * Tapping a card navigates to SCREEN 2 (StakeholderLoginScreen) for that specific stakeholder.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { UserRole } from '../../types/role';
import { AuthStackNavigationProp } from '../../types/navigation';
import { StakeholderLoginScreen } from './StakeholderLoginScreen';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface SchematicMonitoringNetworkProps {
  pulseAnim: Animated.Value;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  monitorFade: Animated.Value;
  inspectFade: Animated.Value;
  verifyFade: Animated.Value;
  isCompact?: boolean;
}

/**
 * SchematicMonitoringNetwork Component
 * Architectural illustration communicating MONITOR -> INSPECT -> VERIFY.
 * Clean, conceptual engineering schematic using precision lines, calibration marks,
 * and a central verification shield.
 */
const SchematicMonitoringNetwork: React.FC<SchematicMonitoringNetworkProps> = ({
  pulseAnim,
  fadeAnim,
  scaleAnim,
  monitorFade,
  inspectFade,
  verifyFade,
  isCompact = false,
}) => {
  return (
    <Animated.View
      style={[
        styles.schematicCanvas,
        isCompact && styles.schematicCanvasCompact,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Precision Grid Calibration Marks */}
      <Text style={[styles.calibMark, styles.calibTopLeft]}>+</Text>
      <Text style={[styles.calibMark, styles.calibTopRight]}>+</Text>
      <Text style={[styles.calibMark, styles.calibBottomLeft]}>+</Text>
      <Text style={[styles.calibMark, styles.calibBottomRight]}>+</Text>

      {/* Axis Lines */}
      <View style={styles.schematicAxisHorizontal} />
      <View style={styles.schematicAxisVertical} />

      {/* Concentric Calibration Rings */}
      <View style={styles.outerConcentricRing} />
      <View style={styles.innerConcentricRing} />

      {/* Geometric Connecting Lines */}
      <View style={styles.connTopToCenter} />
      <View style={styles.connCenterToLeft} />
      <View style={styles.connCenterToRight} />

      {/* Node 1: MONITOR (Top) */}
      <Animated.View style={[styles.schematicNodeTop, { opacity: monitorFade }]}>
        <View style={styles.nodePill}>
          <Ionicons name="eye-outline" size={14} color={colors.brand.primary} />
          <Text style={styles.nodePillText}>MONITOR</Text>
        </View>
      </Animated.View>

      {/* Central Hub: VERIFICATION */}
      <View style={styles.schematicCenterHub}>
        <Animated.View
          style={[
            styles.schematicPulseHalo,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <View style={styles.schematicShieldBadge}>
          <Ionicons name="shield-checkmark" size={22} color={colors.text.inverse} />
        </View>
        <Text style={styles.schematicCenterLabel}>VERIFICATION</Text>
      </View>

      {/* Node 2: INSPECT (Bottom-Left) */}
      <Animated.View style={[styles.schematicNodeLeft, { opacity: inspectFade }]}>
        <View style={styles.nodePill}>
          <Ionicons name="search-outline" size={14} color={colors.brand.primary} />
          <Text style={styles.nodePillText}>INSPECT</Text>
        </View>
      </Animated.View>

      {/* Node 3: VERIFY (Bottom-Right) */}
      <Animated.View style={[styles.schematicNodeRight, { opacity: verifyFade }]}>
        <View style={styles.nodePill}>
          <Ionicons name="checkmark-done-circle-outline" size={14} color={colors.brand.primary} />
          <Text style={styles.nodePillText}>VERIFY</Text>
        </View>
      </Animated.View>

      {/* Concept Flow Caption */}
      <View style={styles.schematicFooter}>
        <Text style={styles.schematicFlowText}>
          MONITOR  →  INSPECT  →  VERIFY
        </Text>
      </View>
    </Animated.View>
  );
};

interface StakeholderSelectionScreenProps {
  onSelectRole?: (role: UserRole) => void;
}

/**
 * SCREEN 1: StakeholderSelectionScreen
 * Pure selection screen showing the 3 clickable stakeholder cards without credential inputs.
 */
export const StakeholderSelectionScreen: React.FC<StakeholderSelectionScreenProps> = (props) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;
  let navigation: AuthStackNavigationProp | undefined;
  try {
    navigation = useNavigation<AuthStackNavigationProp>();
  } catch {
    // Navigation not provided in standalone wrapper
  }

  // Motion values
  const govBarFade = useRef(new Animated.Value(0)).current;
  const heroTitleFade = useRef(new Animated.Value(0)).current;
  const heroTitleSlide = useRef(new Animated.Value(14)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(10)).current;
  const networkFade = useRef(new Animated.Value(0)).current;
  const networkScale = useRef(new Animated.Value(0.96)).current;
  const nodeMonitorFade = useRef(new Animated.Value(0)).current;
  const nodeInspectFade = useRef(new Animated.Value(0)).current;
  const nodeVerifyFade = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const cardSlides = useRef([
    new Animated.Value(12),
    new Animated.Value(12),
    new Animated.Value(12),
  ]).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Government bar fades in
    Animated.timing(govBarFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    // 2. Hero title fades + moves upward
    Animated.parallel([
      Animated.timing(heroTitleFade, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(heroTitleSlide, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start();

    // 3. Tagline follows
    const taglineTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(taglineSlide, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }, 120);

    // 4. Schematic network reveals
    const networkTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(networkFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(networkScale, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 180);

    // 5. Network nodes stagger in
    const nodesTimer = setTimeout(() => {
      Animated.stagger(70, [
        Animated.timing(nodeMonitorFade, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(nodeInspectFade, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(nodeVerifyFade, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }, 280);

    // 6. Stakeholder cards stagger in smoothly
    const cardsTimer = setTimeout(() => {
      Animated.stagger(
        60,
        cardAnims.map((anim, idx) =>
          Animated.parallel([
            Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }),
            Animated.timing(cardSlides[idx], { toValue: 0, duration: 220, useNativeDriver: true }),
          ])
        )
      ).start();
    }, 380);

    // 7. Subtle schematic pulse animation loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.14, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1400, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(networkTimer);
      clearTimeout(nodesTimer);
      clearTimeout(cardsTimer);
      pulseLoop.stop();
    };
  }, []);

  const handleSelectStakeholder = (role: UserRole) => {
    if (props.onSelectRole) {
      props.onSelectRole(role);
      return;
    }

    if (navigation) {
      if (role === 'official') {
        navigation.navigate('OfficialLogin');
      } else if (role === 'inspector') {
        navigation.navigate('InspectorLogin');
      } else if (role === 'ngo') {
        navigation.navigate('NgoLogin');
      } else {
        navigation.navigate('StakeholderLogin', { role });
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Top MoSJE National Identity Bar */}
      <Animated.View
        style={[
          styles.topIdentityBar,
          { paddingTop: Math.max(insets.top, 10) + spacing.xxs, opacity: govBarFade },
        ]}
      >
        <View style={styles.identityInner}>
          <View style={styles.brandingGroup}>
            <View style={styles.nationalMark}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
            </View>
            <Text style={styles.ministryIdentityText}>
              MoSJE • Government of India
            </Text>
          </View>
          <View style={styles.systemStatusPill}>
            <View style={styles.systemStatusDot} />
            <Text style={styles.systemStatusText}>E-Governance Portal</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isDesktop && styles.scrollContainerDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.layoutWrapper, isDesktop && styles.layoutWrapperDesktop]}>
          {/* Left Column: Hero, Identity & Schematic Visual */}
          <View style={[styles.heroColumn, isDesktop && styles.heroColumnDesktop]}>
            <View style={styles.heroContent}>
              <Animated.Text
                style={[
                  styles.heroMainTitle,
                  {
                    opacity: heroTitleFade,
                    transform: [{ translateY: heroTitleSlide }],
                  },
                ]}
              >
                SMART MONITORING{'\n'}& INSPECTION
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.heroTagline,
                  {
                    opacity: taglineFade,
                    transform: [{ translateY: taglineSlide }],
                  },
                ]}
              >
                See. Inspect. Verify.
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.heroDescription,
                  { opacity: taglineFade },
                ]}
              >
                Monitor welfare schemes, coordinate field inspections, and verify outcomes through a unified platform.
              </Animated.Text>
            </View>

            {/* Schematic Monitoring Network Illustration */}
            <SchematicMonitoringNetwork
              pulseAnim={pulseAnim}
              fadeAnim={networkFade}
              scaleAnim={networkScale}
              monitorFade={nodeMonitorFade}
              inspectFade={nodeInspectFade}
              verifyFade={nodeVerifyFade}
              isCompact={!isDesktop}
            />

            {/* Quick Demo Credentials Reference for Evaluators */}
            <View style={styles.quickAccessBar}>
              <Text style={styles.quickAccessLabel}>PROTOTYPE DEMO CREDENTIALS REFERENCE:</Text>
              <View style={styles.quickRefList}>
                <View style={styles.quickRefItem}>
                  <View style={styles.quickRefHeader}>
                    <Ionicons name="shield-checkmark-outline" size={13} color={colors.brand.primary} />
                    <Text style={styles.quickRefRoleText}>Official:</Text>
                  </View>
                  <Text style={styles.quickRefCredText}>official@nirikshan.gov • Official@123</Text>
                </View>
                <View style={styles.quickRefItem}>
                  <View style={styles.quickRefHeader}>
                    <Ionicons name="clipboard-outline" size={13} color={colors.status.warning} />
                    <Text style={styles.quickRefRoleText}>Inspector:</Text>
                  </View>
                  <Text style={styles.quickRefCredText}>inspector@nirikshan.gov • Inspector@123</Text>
                </View>
                <View style={styles.quickRefItem}>
                  <View style={styles.quickRefHeader}>
                    <Ionicons name="business-outline" size={13} color={colors.status.normal} />
                    <Text style={styles.quickRefRoleText}>NGO / Institute:</Text>
                  </View>
                  <Text style={styles.quickRefCredText}>ngo@nirikshan.org • NGO@123</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column: Three Clickable Stakeholder Selection Cards */}
          <View style={[styles.workspaceColumn, isDesktop && styles.workspaceColumnDesktop]}>
            <View style={styles.workspaceHeader}>
              <Text style={styles.workspaceTitle}>ACCESS YOUR WORKSPACE</Text>
              <Text style={styles.workspaceSubtitle}>
                Select your stakeholder role to proceed to sign-in.
              </Text>
            </View>

            {/* STAKEHOLDER CARD 1: GOVERNMENT OFFICIAL */}
            <Animated.View
              style={[
                styles.cardWrapper,
                { opacity: cardAnims[0], transform: [{ translateY: cardSlides[0] }] },
              ]}
            >
              <TouchableOpacity
                style={styles.stakeholderCard}
                onPress={() => handleSelectStakeholder('official')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Sign in as Government Official"
              >
                <View style={[styles.cardIconBox, styles.cardIconBoxOfficial]}>
                  <Ionicons name="shield-checkmark-outline" size={22} color={colors.brand.primary} />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.cardTitle}>Government Official</Text>
                  <Text style={styles.cardSubtitle}>MoSJE Oversight</Text>
                  <Text style={styles.cardDescription}>
                    National scheme oversight & inspection authorization
                  </Text>
                </View>
                <View style={styles.cardArrowBox}>
                  <Ionicons name="chevron-forward" size={18} color={colors.brand.primary} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* STAKEHOLDER CARD 2: PMU / INSPECTION OFFICER */}
            <Animated.View
              style={[
                styles.cardWrapper,
                { opacity: cardAnims[1], transform: [{ translateY: cardSlides[1] }] },
              ]}
            >
              <TouchableOpacity
                style={styles.stakeholderCard}
                onPress={() => handleSelectStakeholder('inspector')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Sign in as PMU Inspection Officer"
              >
                <View style={[styles.cardIconBox, styles.cardIconBoxInspector]}>
                  <Ionicons name="clipboard-outline" size={22} color={colors.status.warning} />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.cardTitle}>PMU / Inspection Officer</Text>
                  <Text style={styles.cardSubtitle}>Field Operations</Text>
                  <Text style={styles.cardDescription}>
                    Field audit assignments & verification filing
                  </Text>
                </View>
                <View style={styles.cardArrowBox}>
                  <Ionicons name="chevron-forward" size={18} color={colors.brand.primary} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* STAKEHOLDER CARD 3: NGO / INSTITUTE */}
            <Animated.View
              style={[
                styles.cardWrapper,
                { opacity: cardAnims[2], transform: [{ translateY: cardSlides[2] }] },
              ]}
            >
              <TouchableOpacity
                style={styles.stakeholderCard}
                onPress={() => handleSelectStakeholder('ngo')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Sign in as NGO or Institute"
              >
                <View style={[styles.cardIconBox, styles.cardIconBoxNgo]}>
                  <Ionicons name="business-outline" size={22} color={colors.status.normal} />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.cardTitle}>NGO / Institute</Text>
                  <Text style={styles.cardSubtitle}>Implementing Agency</Text>
                  <Text style={styles.cardDescription}>
                    Beneficiary attendance & compliance records
                  </Text>
                </View>
                <View style={styles.cardArrowBox}>
                  <Ionicons name="chevron-forward" size={18} color={colors.brand.primary} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Prototype Disclaimer Banner */}
            <View style={styles.prototypeDisclaimerBanner}>
              <Ionicons name="shield-checkmark-outline" size={15} color={colors.brand.primary} style={{ marginTop: 1 }} />
              <Text style={styles.prototypeDisclaimerText}>
                DEMO AUTHENTICATION — Prototype credentials only. No real government authentication is connected.
              </Text>
            </View>

            {/* Security Trust Row */}
            <View style={styles.securityTrustRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color={colors.text.muted} />
              <Text style={styles.securityTrustText}>
                Ministry of Social Justice & Empowerment • Government of India
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * LoginScreen
 * Controller supporting both direct rendering and stack-based two-screen flow.
 */
export const LoginScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (selectedRole) {
    return (
      <StakeholderLoginScreen
        role={selectedRole}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return <StakeholderSelectionScreen onSelectRole={setSelectedRole} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  topIdentityBar: {
    backgroundColor: colors.brand.navy,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  identityInner: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nationalMark: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  ministryIdentityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#D0D5DD',
    letterSpacing: 0.4,
  },
  systemStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  systemStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.normal,
    marginRight: 5,
  },
  systemStatusText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: typography.weights.medium,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  scrollContainerDesktop: {
    paddingBottom: spacing.xxl,
  },
  layoutWrapper: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  layoutWrapperDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  heroColumn: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  heroColumnDesktop: {
    flex: 1.08,
    maxWidth: 520,
    marginBottom: 0,
  },
  heroContent: {
    marginBottom: spacing.lg,
  },
  heroMainTitle: {
    fontSize: Platform.OS === 'web' ? 38 : 28,
    fontWeight: '800',
    color: colors.brand.navyDark,
    letterSpacing: -0.6,
    lineHeight: Platform.OS === 'web' ? 44 : 34,
    marginBottom: spacing.xs + 2,
  },
  heroTagline: {
    fontSize: Platform.OS === 'web' ? 19 : 16,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.2,
    lineHeight: Platform.OS === 'web' ? 26 : 22,
    marginBottom: spacing.xs + 4,
  },
  heroDescription: {
    fontSize: typography.sizes.sm + 0.5,
    color: colors.text.secondary,
    lineHeight: 22,
    maxWidth: 480,
  },

  // Quick Access Bar
  quickAccessBar: {
    marginTop: spacing.md,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.xs,
  },
  quickAccessLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.6,
  },
  quickRefList: {
    marginTop: spacing.xs + 2,
    gap: 6,
  },
  quickRefItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  quickRefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  quickRefRoleText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.navyDark,
  },
  quickRefCredText: {
    fontSize: 10.5,
    color: colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  workspaceColumn: {
    width: '100%',
  },
  workspaceColumnDesktop: {
    flex: 1,
    maxWidth: 480,
  },
  workspaceHeader: {
    marginBottom: spacing.md,
  },
  workspaceTitle: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  workspaceSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    lineHeight: 18,
  },

  // Clickable Stakeholder Cards on Screen 1
  cardWrapper: {
    marginBottom: spacing.base,
  },
  stakeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    ...shadows.xs,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconBoxOfficial: {
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.brand.accent,
  },
  cardIconBoxInspector: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
  },
  cardIconBoxNgo: {
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normalBorder,
  },
  cardHeaderInfo: {
    flex: 1,
    marginHorizontal: spacing.sm + 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.brand.navyDark,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
    marginTop: 1,
  },
  cardDescription: {
    fontSize: 11.5,
    color: colors.text.muted,
    lineHeight: 16,
    marginTop: 2,
  },
  cardArrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  prototypeDisclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.brand.accent,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginTop: spacing.xs,
    gap: 7,
  },
  prototypeDisclaimerText: {
    fontSize: 10,
    color: colors.brand.navyDark,
    fontWeight: typography.weights.medium,
    lineHeight: 14,
    flex: 1,
  },
  securityTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 5,
  },
  securityTrustText: {
    fontSize: typography.sizes.xs - 1,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },

  // Schematic Monitoring Network Illustration Styles
  schematicCanvas: {
    backgroundColor: colors.brand.navyDark,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(126, 143, 122, 0.3)',
    height: 220,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.sm,
  },
  schematicCanvasCompact: {
    height: 185,
  },
  calibMark: {
    position: 'absolute',
    fontSize: 13,
    color: 'rgba(194, 209, 192, 0.45)',
    fontWeight: 'bold',
  },
  calibTopLeft: {
    top: 6,
    left: 10,
  },
  calibTopRight: {
    top: 6,
    right: 10,
  },
  calibBottomLeft: {
    bottom: 6,
    left: 10,
  },
  calibBottomRight: {
    bottom: 6,
    right: 10,
  },
  schematicAxisHorizontal: {
    position: 'absolute',
    top: 96,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(126, 143, 122, 0.2)',
  },
  schematicAxisVertical: {
    position: 'absolute',
    left: '50%',
    top: 20,
    bottom: 28,
    width: 1,
    backgroundColor: 'rgba(126, 143, 122, 0.2)',
  },
  outerConcentricRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(126, 143, 122, 0.2)',
    borderStyle: 'dashed',
    top: 26,
    alignSelf: 'center',
  },
  innerConcentricRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: 'rgba(126, 143, 122, 0.35)',
    top: 54,
    alignSelf: 'center',
  },
  connTopToCenter: {
    position: 'absolute',
    top: 44,
    height: 26,
    left: '50%',
    marginLeft: -0.75,
    width: 1.5,
    backgroundColor: 'rgba(126, 143, 122, 0.55)',
  },
  connCenterToLeft: {
    position: 'absolute',
    top: 118,
    left: '26%',
    width: 85,
    height: 1.5,
    backgroundColor: 'rgba(126, 143, 122, 0.4)',
    transform: [{ rotate: '32deg' }],
  },
  connCenterToRight: {
    position: 'absolute',
    top: 118,
    right: '26%',
    width: 85,
    height: 1.5,
    backgroundColor: 'rgba(126, 143, 122, 0.4)',
    transform: [{ rotate: '-32deg' }],
  },
  schematicNodeTop: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    zIndex: 10,
  },
  nodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
    gap: 5,
    ...shadows.xs,
  },
  nodePillText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.navyDark,
    letterSpacing: 0.8,
  },
  schematicCenterHub: {
    position: 'absolute',
    top: 66,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  schematicPulseHalo: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(77, 99, 49, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(126, 143, 122, 0.5)',
  },
  schematicShieldBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  schematicCenterLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#F7F5F0',
    marginTop: 4,
    letterSpacing: 1.2,
  },
  schematicNodeLeft: {
    position: 'absolute',
    left: 16,
    bottom: 26,
    zIndex: 10,
  },
  schematicNodeRight: {
    position: 'absolute',
    right: 16,
    bottom: 26,
    zIndex: 10,
  },
  schematicFooter: {
    position: 'absolute',
    bottom: 5,
    alignSelf: 'center',
  },
  schematicFlowText: {
    fontSize: 9.5,
    fontWeight: typography.weights.bold,
    color: '#C2D1C0',
    letterSpacing: 1.4,
  },
});
