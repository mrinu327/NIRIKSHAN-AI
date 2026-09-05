/**
 * RoleSelectionScreen
 * MoSJE Centralized Monitoring & Inspection System
 *
 * Distinctive government e-governance entry experience:
 * "Mission control meets public-sector accountability."
 * Authoritative, premium, calm, and technologically advanced.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { UserRole, RoleConfig } from '../../types/role';
import { DEMO_ROLES } from '../../data/mockData';
import { RoleCard } from '../../components/cards/RoleCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
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
 * and a central verification shield. Zero fake telemetry or invented data.
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

export const RoleSelectionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const { selectRole, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('official');
  const [inspectorSubProfile, setInspectorSubProfile] = useState<'inspector_a' | 'inspector_b'>('inspector_a');

  // Entry animation values
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
  const actionFade = useRef(new Animated.Value(0)).current;
  const actionSlide = useRef(new Animated.Value(10)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Government bar fades in
    Animated.timing(govBarFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    // 2. Hero title fades + moves upward 14px over ~240ms
    Animated.parallel([
      Animated.timing(heroTitleFade, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(heroTitleSlide, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start();

    // 3. Tagline and supporting text follows
    const taglineTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(taglineSlide, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }, 120);

    // 4. Network illustration reveals subtly over ~300ms
    const networkTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(networkFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(networkScale, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 180);

    // 5. Network nodes appear sequentially
    const nodesTimer = setTimeout(() => {
      Animated.stagger(70, [
        Animated.timing(nodeMonitorFade, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(nodeInspectFade, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(nodeVerifyFade, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }, 280);

    // 6. Workspace rows enter with 40-60ms stagger (max 3)
    const cardTimer = setTimeout(() => {
      const cardStaggers = cardAnims.map((anim, idx) =>
        Animated.parallel([
          Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(cardSlides[idx], { toValue: 0, duration: 200, useNativeDriver: true }),
        ])
      );
      Animated.stagger(50, cardStaggers).start();
    }, 240);

    // 7. CTA appears last
    const actionTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(actionFade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(actionSlide, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }, 420);

    // Central verification shield subtle 2-second breathing pulse
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(networkTimer);
      clearTimeout(nodesTimer);
      clearTimeout(cardTimer);
      clearTimeout(actionTimer);
      breathing.stop();
    };
  }, []);

  const handleContinue = async () => {
    if (selectedRole === 'inspector') {
      await selectRole('inspector', inspectorSubProfile);
    } else if (selectedRole) {
      await selectRole(selectedRole);
    }
  };

  const getRolePresentation = (role: RoleConfig): {
    title: string;
    subtitle: string;
    description: string;
    badgeLabel: string;
    iconName: keyof typeof Ionicons.glyphMap;
  } => {
    switch (role.id) {
      case 'official':
        return {
          title: 'Government Official',
          subtitle: 'MoSJE Oversight',
          description: 'National scheme oversight & inspection authorization',
          badgeLabel: 'MoSJE Oversight',
          iconName: 'shield-checkmark-outline',
        };
      case 'inspector':
        return {
          title: 'PMU / Inspection Officer',
          subtitle: 'Field Operations',
          description: 'Field audit assignments & verification filing',
          badgeLabel: 'Field Operations',
          iconName: 'clipboard-outline',
        };
      case 'ngo':
        return {
          title: 'NGO / Institute',
          subtitle: 'Implementing Agency',
          description: 'Beneficiary attendance & compliance records',
          badgeLabel: 'Implementing Agency',
          iconName: 'business-outline',
        };
      default:
        return {
          title: role.title,
          subtitle: role.subtitle,
          description: role.description,
          badgeLabel: '',
          iconName: 'person-outline',
        };
    }
  };

  const getActionTitle = (): string => {
    switch (selectedRole) {
      case 'official':
        return 'Continue as Government Official';
      case 'inspector':
        return 'Continue as Inspection Officer';
      case 'ngo':
        return 'Continue as NGO / Institute';
      default:
        return 'Continue to Workspace';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Top MoSJE Identity Bar */}
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
          {/* Left Column ~52%: Hero, Identity & Schematic Visual */}
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
          </View>

          {/* Right Column ~48%: Workspace Selection */}
          <View style={[styles.workspaceColumn, isDesktop && styles.workspaceColumnDesktop]}>
            <View style={styles.workspaceHeader}>
              <Text style={styles.workspaceTitle}>ACCESS YOUR WORKSPACE</Text>
              <Text style={styles.workspaceSubtitle}>
                Select your designated operational role.
              </Text>
            </View>

            {/* Staggered Workspace Selection Rows */}
            <View style={styles.cardsList}>
              {DEMO_ROLES.map((role, index) => {
                const presentation = getRolePresentation(role);
                const isSelected = selectedRole === role.id;
                const cardAnim = cardAnims[index] || new Animated.Value(1);
                const cardSlide = cardSlides[index] || new Animated.Value(0);

                const enhancedRole: RoleConfig = {
                  ...role,
                  title: presentation.title,
                  subtitle: presentation.subtitle,
                  description: presentation.description,
                  badgeLabel: presentation.badgeLabel,
                  iconName: presentation.iconName,
                };

                return (
                  <Animated.View
                    key={role.id}
                    style={{
                      opacity: cardAnim,
                      transform: [{ translateY: cardSlide }],
                    }}
                  >
                    <RoleCard
                      role={enhancedRole}
                      isSelected={isSelected}
                      onSelect={() => setSelectedRole(role.id)}
                    />

                    {/* Sub-Inspector Account Selection */}
                    {role.id === 'inspector' && isSelected && (
                      <View style={styles.subInspectorPanel}>
                        <Text style={styles.subInspectorTitle}>
                          Designated Officer Profile:
                        </Text>
                        <View style={styles.subInspectorOptions}>
                          <TouchableOpacity
                            style={[
                              styles.subOptionBtn,
                              inspectorSubProfile === 'inspector_a' && styles.subOptionBtnActive,
                            ]}
                            onPress={() => setInspectorSubProfile('inspector_a')}
                            activeOpacity={0.8}
                          >
                            <View style={styles.subOptionRadio}>
                              {inspectorSubProfile === 'inspector_a' && (
                                <View style={styles.subOptionRadioDot} />
                              )}
                            </View>
                            <View style={styles.subOptionTextCol}>
                              <Text
                                style={[
                                  styles.subOptionName,
                                  inspectorSubProfile === 'inspector_a' && styles.subOptionNameActive,
                                ]}
                              >
                                Field Inspection Officer A
                              </Text>
                              <Text style={styles.subOptionMeta}>ID: PMU-004 • Delhi North</Text>
                            </View>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.subOptionBtn,
                              inspectorSubProfile === 'inspector_b' && styles.subOptionBtnActive,
                            ]}
                            onPress={() => setInspectorSubProfile('inspector_b')}
                            activeOpacity={0.8}
                          >
                            <View style={styles.subOptionRadio}>
                              {inspectorSubProfile === 'inspector_b' && (
                                <View style={styles.subOptionRadioDot} />
                              )}
                            </View>
                            <View style={styles.subOptionTextCol}>
                              <Text
                                style={[
                                  styles.subOptionName,
                                  inspectorSubProfile === 'inspector_b' && styles.subOptionNameActive,
                                ]}
                              >
                                Senior Inspection Officer B
                              </Text>
                              <Text style={styles.subOptionMeta}>ID: PMU-005 • Delhi Central</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </View>

            {/* Contextual Action Area */}
            <Animated.View
              style={[
                styles.integratedActionArea,
                { opacity: actionFade, transform: [{ translateY: actionSlide }] },
              ]}
            >
              <PrimaryButton
                title={getActionTitle()}
                onPress={handleContinue}
                loading={isLoading}
                iconName="arrow-forward-outline"
                style={styles.continueButton}
              />

              <View style={styles.securityTrustRow}>
                <Ionicons name="shield-checkmark-outline" size={13} color={colors.text.muted} />
                <Text style={styles.securityTrustText}>
                  Ministry of Social Justice & Empowerment • Government of India
                </Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
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
  cardsList: {
    marginBottom: 0,
  },
  subInspectorPanel: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
    padding: spacing.md,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  subInspectorTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs + 2,
  },
  subInspectorOptions: {
    gap: 8,
  },
  subOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.surfaceSubtle,
    minHeight: 44,
  },
  subOptionBtnActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
  },
  subOptionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.neutral.borderStrong,
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
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  subOptionNameActive: {
    color: colors.brand.navyDark,
    fontWeight: typography.weights.semibold,
  },
  subOptionMeta: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 1,
  },
  integratedActionArea: {
    marginTop: spacing.md,
  },
  continueButton: {
    width: '100%',
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
    borderColor: 'rgba(42, 92, 224, 0.25)',
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
    color: 'rgba(143, 168, 223, 0.35)',
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
    backgroundColor: 'rgba(42, 92, 224, 0.12)',
  },
  schematicAxisVertical: {
    position: 'absolute',
    left: '50%',
    top: 20,
    bottom: 28,
    width: 1,
    backgroundColor: 'rgba(42, 92, 224, 0.12)',
  },
  outerConcentricRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(42, 92, 224, 0.12)',
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
    borderColor: 'rgba(42, 92, 224, 0.22)',
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
    backgroundColor: 'rgba(42, 92, 224, 0.45)',
  },
  connCenterToLeft: {
    position: 'absolute',
    top: 118,
    left: '26%',
    width: 85,
    height: 1.5,
    backgroundColor: 'rgba(42, 92, 224, 0.35)',
    transform: [{ rotate: '32deg' }],
  },
  connCenterToRight: {
    position: 'absolute',
    top: 118,
    right: '26%',
    width: 85,
    height: 1.5,
    backgroundColor: 'rgba(42, 92, 224, 0.35)',
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
    backgroundColor: 'rgba(42, 92, 224, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(42, 92, 224, 0.45)',
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
    color: '#E2E8F0',
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
    color: '#8FA8DF',
    letterSpacing: 1.4,
  },
});
