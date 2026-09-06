/**
 * InspectionOverviewScreen
 * SIH26095 | MoSJE PMU Inspector Field Workflow
 *
 * Dedicated overview screen displaying target institute details,
 * protocol instructions, and 'Start Inspection' trigger.
 * Integrated native-style executive header with back navigation.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type OverviewRouteProp = RouteProp<InspectorStackParamList, 'InspectionOverview'>;

export const InspectionOverviewScreen: React.FC = () => {
  const navigation = useNavigation<InspectorStackNavigationProp>();
  const route = useRoute<OverviewRouteProp>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { currentRole, switchRole } = useAuth();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<InspectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Animations
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Pulsing skeleton animation loop
  useEffect(() => {
    if (loading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, {
            toValue: 0.85,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonPulse, {
            toValue: 0.35,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [loading]);

  useEffect(() => {
    mockInspectionService.getInspectionById(inspectionId).then((data) => {
      setInspection(data || null);
      setLoading(false);
    });
  }, [inspectionId]);

  useEffect(() => {
    if (!loading && inspection) {
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
      ]).start();
    }
  }, [loading, inspection]);

  const handleStartInspection = async () => {
    if (!inspection) return;
    setStarting(true);
    try {
      await mockInspectionService.startInspection(inspection.id);
      navigation.navigate('InspectionChecklist', { inspectionId: inspection.id });
    } catch (err) {
      console.error('Failed to start inspection:', err);
    } finally {
      setStarting(false);
    }
  };

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

  // Skeleton Loading Screen
  if (loading || !inspection) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

        {/* Integrated Skeleton Header */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
          <View style={styles.headerInner}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerBranding}>
                <View style={styles.headerEmblem}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
                </View>
                <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
              </View>
            </View>

            <View style={styles.headerMainRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBackBtn}
                accessibilityRole="button"
                accessibilityLabel="Back to previous screen"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Field Inspection Overview
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Loading assignment details...
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skeleton Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Animated.View style={[styles.skeletonLine, { width: 140, height: 16, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonLine, { width: 80, height: 16, opacity: skeletonPulse }]} />
            </View>
            <Animated.View style={[styles.skeletonLine, { width: '80%', height: 22, marginTop: 12, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '60%', height: 14, marginTop: 6, opacity: skeletonPulse }]} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Animated.View style={[styles.skeletonBox, { flex: 1, height: 44, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonBox, { flex: 1, height: 44, opacity: skeletonPulse }]} />
            </View>
          </View>

          <View style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonLine, { width: 220, height: 18, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 12, marginTop: 6, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { width: '100%', height: 60, marginTop: 12, opacity: skeletonPulse }]} />
          </View>

          <View style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 18, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { width: '100%', height: 120, marginTop: 12, opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  const isSurprise = inspection.type === 'Surprise Inspection';
  const isInProgress = inspection.status === 'In Progress';
  const officerName = inspection.assignedOfficerName ? inspection.assignedOfficerName.replace('Demo ', '') : 'Officer';
  const badgeText = inspection.assignedOfficerDemoId ? inspection.assignedOfficerDemoId.replace('DEMO-', '') : '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Integrated Executive MoSJE Header with Native-Style Back Button */}
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
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.text.inverse} />
                <Text style={styles.switchText}>Switch Role</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerMainRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to previous screen"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Field Inspection Overview
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Order #{inspection.id} • MoSJE PMU Dispatch
              </Text>
            </View>

            <View style={styles.headerStatusBadge}>
              <StatusBadge
                label={inspection.status}
                variant={isInProgress ? 'warning' : 'info'}
                size="sm"
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          }}
        >
          {/* Target Institute Dossier Card */}
          <View style={[styles.targetCard, isSurprise && styles.targetCardSurprise]}>
            <View style={styles.targetTopRow}>
              <View style={styles.typeRow}>
                {isSurprise && (
                  <Ionicons name="flash" size={14} color={colors.status.highPriority} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.typeText, isSurprise && styles.typeTextSurprise]}>
                  {inspection.type}
                </Text>
              </View>
              <PriorityBadge priority={inspection.priority} />
            </View>

            <Text style={styles.projectName}>{inspection.projectName}</Text>

            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={15} color={colors.brand.primary} style={{ marginTop: 1 }} />
              <Text style={styles.addressText}>{inspection.projectAddress}</Text>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Order ID</Text>
                <Text style={styles.metaValue}>#{inspection.id}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Priority</Text>
                <Text style={styles.metaValue}>{inspection.priority}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Assigned Officer</Text>
                <Text style={styles.metaValue}>
                  {officerName}
                  {badgeText ? (
                    <Text style={{ color: colors.brand.primary }}> ({badgeText})</Text>
                  ) : null}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Dispatch Method</Text>
                <Text style={styles.metaValue}>{inspection.assignmentMethod || 'Automated Random Selection'}</Text>
              </View>
            </View>

            {inspection.triggerReason ? (
              <View style={styles.triggerAlertBox}>
                <Ionicons name="information-circle" size={16} color={colors.brand.navyLight} />
                <View style={styles.triggerAlertTextCol}>
                  <Text style={styles.triggerAlertTitle}>Dispatch Justification</Text>
                  <Text style={styles.triggerAlertDesc}>{inspection.triggerReason}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Protocol Instructions Banner */}
          <View style={styles.protocolCard}>
            <View style={styles.protocolHeader}>
              <View style={styles.protocolIconCircle}>
                <Ionicons name="shield-checkmark" size={18} color={colors.brand.primary} />
              </View>
              <View style={styles.protocolHeaderTextCol}>
                <Text style={styles.protocolTitle}>Verification Protocol Objective</Text>
                <Text style={styles.protocolSub}>Standard MoSJE Field Operating Procedure</Text>
              </View>
            </View>

            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                "Verify the project/institute's reported operational status against on-site observations and available evidence."
              </Text>
            </View>

            <Text style={styles.protocolNote}>
              • Conduct an unbiased, physical assessment of beneficiaries and facilities.{'\n'}
              • Record observations using neutral, factual language without premature conclusions.{'\n'}
              • Attach timestamped photo/document evidence for verification record.
            </Text>
          </View>

          {/* Workflow Steps Preview */}
          <SectionHeader
            title="Inspection Workflow Steps"
            subtitle="Complete sequentially before final submission"
          />

          <View style={styles.stepsCard}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumCircle, styles.stepNumActive]}>
                <Text style={styles.stepNumActiveText}>1</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Multi-Point Checklist</Text>
                <Text style={styles.stepDesc}>13 evaluation criteria across operations, beneficiaries, infrastructure, and records.</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Inspector Findings</Text>
                <Text style={styles.stepDesc}>Neutral narrative notes, key observations, and follow-up recommendations.</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Evidence Capture</Text>
                <Text style={styles.stepDesc}>Watermarked photo/video metadata registration.</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>4</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Review & MoSJE Submission</Text>
                <Text style={styles.stepDesc}>Pre-submission verification and audit docket dispatch.</Text>
              </View>
            </View>
          </View>

          {/* Primary Action Button */}
          <View style={styles.actionSection}>
            <PrimaryButton
              title={isInProgress ? 'Resume Inspection' : 'Start Inspection'}
              iconName="play-circle"
              onPress={handleStartInspection}
              loading={starting}
              style={styles.primaryActionBtn}
            />
          </View>
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
  scrollContent: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxxl + 32,
  },

  // Executive Header
  headerContainer: {
    backgroundColor: colors.brand.navy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    ...shadows.sm,
  },
  headerInner: {
    width: '100%',
    maxWidth: 900,
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
  },
  switchText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  headerStatusBadge: {
    marginLeft: 'auto',
  },

  // Target Institute Card
  targetCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  targetCardSurprise: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.highPriority,
  },
  targetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  typeTextSurprise: {
    color: colors.status.highPriority,
  },
  projectName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 4,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  addressText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: 4,
    flex: 1,
    lineHeight: 16,
  },
  metaGrid: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.sm + 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.xs,
  },
  metaItem: {
    minWidth: '45%',
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  triggerAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.status.infoBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
    gap: 8,
  },
  triggerAlertTextCol: {
    flex: 1,
  },
  triggerAlertTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    marginBottom: 2,
  },
  triggerAlertDesc: {
    fontSize: 11,
    color: colors.brand.navyLight,
    lineHeight: 16,
  },

  // Protocol Instructions Card
  protocolCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  protocolIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolHeaderTextCol: {
    flex: 1,
  },
  protocolTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  protocolSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  instructionBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.primary,
    borderRadius: borderRadius.xs,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    lineHeight: 20,
  },
  protocolNote: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Workflow Steps Preview
  stepsCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  stepNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  stepNumText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
  },
  stepNumActiveText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  stepDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  stepConnector: {
    width: 2,
    height: 14,
    backgroundColor: colors.neutral.divider,
    marginLeft: 12,
    marginVertical: 2,
  },

  // Primary Action
  actionSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  primaryActionBtn: {
    minHeight: 48,
  },

  // Skeleton Styles
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
});
