/**
 * InspectionConfirmationScreen
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Post-submission confirmation showing 'Submitted / Awaiting Review' status,
 * audit timestamp, and navigation back to Inspector Home.
 * Child screen in InspectorStackNavigator with integrated executive MoSJE header.
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
import { useAuth } from '../../context/AuthContext';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type ConfirmationRouteProp = RouteProp<InspectorStackParamList, 'InspectionConfirmation'>;

export const InspectionConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<InspectorStackNavigationProp>();
  const route = useRoute<ConfirmationRouteProp>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentUser, currentRole, switchRole } = useAuth();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<InspectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  // Motion values
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const checkScale = useRef(new Animated.Value(0.7)).current;
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
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, inspection]);

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'InspectorTabs', params: { screen: 'Home' } }],
    });
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
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Submission Confirmation
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Finalizing records...
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skeleton Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonCircle, { opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 22, marginTop: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 280, height: 14, marginTop: 8, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { width: '100%', height: 180, marginTop: 24, opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  const officerDisplayName = (inspection.submittedBy || inspection.assignedOfficerName || '').replace('Demo ', '');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Integrated Child-Screen MoSJE Header */}
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
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Submission Successful
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                PMU Field Verification Protocol Completed
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          }}
        >
          <View style={styles.card}>
            {/* Success Icon */}
            <Animated.View
              style={[
                styles.successIconCircle,
                { transform: [{ scale: checkScale }] },
              ]}
            >
              <Ionicons name="checkmark-done" size={38} color={colors.text.inverse} />
            </Animated.View>

            <Text style={styles.successHeading}>Inspection Submitted</Text>
            <Text style={styles.successSub}>
              Your field verification report has been logged and transmitted to the Central Monitoring Desk.
            </Text>

            {/* Status Badge */}
            <View style={styles.statusRow}>
              <StatusBadge label={inspection.status} variant="info" size="md" />
            </View>

            {/* Details Table */}
            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Inspection ID</Text>
                <Text style={styles.detailValue}>#{inspection.id}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Target Institute</Text>
                <Text style={styles.detailValue}>{inspection.projectName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Inspection Type</Text>
                <Text style={styles.detailValue}>{inspection.type}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Submitted By</Text>
                <Text style={styles.detailValue}>{officerDisplayName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Submitted Timestamp</Text>
                <Text style={styles.detailValue}>{inspection.submittedAt || 'Just now'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Checklist Verified</Text>
                <Text style={styles.detailValue}>
                  {inspection.checklistCompletedCount || 13} / {inspection.totalChecklistCount || 13} Criteria
                </Text>
              </View>

              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Attached Evidence</Text>
                <Text style={styles.detailValue}>
                  {inspection.evidenceItems?.length || 0} Registered Entries
                </Text>
              </View>
            </View>

            {/* MoSJE Audit Notice */}
            <View style={styles.auditNotice}>
              <Ionicons name="shield-checkmark" size={16} color={colors.brand.primary} />
              <Text style={styles.auditNoticeText}>
                Official records updated. Central reviewers at the Ministry of Social Justice & Empowerment can now review your observations in the Government Monitoring portal.
              </Text>
            </View>

            {/* Action Button */}
            <View style={styles.actionRow}>
              <PrimaryButton
                title="Back to Inspector Home"
                iconName="home"
                onPress={handleBackToHome}
                style={styles.primaryActionBtn}
              />
            </View>
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

  // Executive Child-Screen Header
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

  // Main Card & Layout
  scrollContent: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: spacing.base,
    paddingTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.status.normal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  successHeading: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  successSub: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: spacing.md,
    lineHeight: 18,
    maxWidth: 440,
  },
  statusRow: {
    marginBottom: spacing.base,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    gap: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  auditNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 2,
    gap: 8,
    marginBottom: spacing.base,
  },
  auditNoticeText: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
    flex: 1,
  },
  actionRow: {
    width: '100%',
    marginTop: spacing.xs,
  },
  primaryActionBtn: {
    minHeight: 48,
  },

  // Skeleton Styles
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  skeletonCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.neutral.border,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
});
