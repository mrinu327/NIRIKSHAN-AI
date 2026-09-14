/**
 * InspectionReviewScreen
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Pre-submission review screen presenting checklist completion breakdown,
 * inspector narrative findings, and attached evidence metadata.
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
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type ReviewRouteProp = RouteProp<InspectorStackParamList, 'InspectionReview'>;

export const InspectionReviewScreen: React.FC = () => {
  const navigation = useNavigation<InspectorStackNavigationProp>();
  const route = useRoute<ReviewRouteProp>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentUser, currentRole, switchRole } = useAuth();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<InspectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Motion values
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
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBackBtn}
                accessibilityRole="button"
                accessibilityLabel="Back to findings"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Review & Sign Off
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Compiling field dossier...
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skeleton Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonLine, { width: 100, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '80%', height: 22, marginTop: 10, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '60%', height: 14, marginTop: 6, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { height: 32, marginTop: 12, opacity: skeletonPulse }]} />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <Animated.View style={[styles.skeletonBox, { flex: 1, height: 72, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { flex: 1, height: 72, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { flex: 1, height: 72, opacity: skeletonPulse }]} />
          </View>

          <View style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonLine, { width: 160, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '100%', height: 48, marginTop: 10, opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  const checklistResponses = inspection.checklistResponses || {};
  const checklistList = Object.values(checklistResponses);
  const verifiedCount = checklistList.filter((item) => item.status === 'Verified').length;
  const attentionCount = checklistList.filter((item) => item.status === 'Needs Attention').length;
  const naCount = checklistList.filter((item) => item.status === 'Not Applicable').length;
  const unverifiedCount = checklistList.filter((item) => item.status === 'Not Checked').length;
  const totalCount = checklistList.length || 13;

  const findings = inspection.findings;
  const evidenceList = inspection.evidenceItems || [];

  const officerName = currentUser?.name || inspection.assignedOfficerName;
  const officerBadge = (currentUser?.badgeId || inspection.assignedOfficerDemoId || 'PMU-004').replace('DEMO-', '');

  const handleSubmit = async () => {
    if (unverifiedCount > 0) {
      setValidationError(
        `Cannot submit: ${unverifiedCount} checklist item(s) are still unverified. Please return and evaluate all criteria.`
      );
      return;
    }

    if (!findings?.overallObservation || !findings?.keyFindings) {
      setValidationError('Cannot submit: Findings report is incomplete. Please enter overall observation and key findings.');
      return;
    }

    setSubmitting(true);
    try {
      await mockInspectionService.submitInspection(inspection.id, {
        checklistResponses,
        findings,
        evidenceItems: evidenceList,
        submittedBy: currentUser?.name || inspection.assignedOfficerName,
        officerDemoId: currentUser?.badgeId || inspection.assignedOfficerDemoId,
      });

      navigation.navigate('InspectionConfirmation', { inspectionId: inspection.id });
    } catch (err) {
      console.error('Failed to submit inspection:', err);
      setValidationError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Integrated Executive MoSJE Header with Native Back Navigation */}
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
              accessibilityLabel="Back to findings"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {inspection.status === 'Submitted / Awaiting Review' || inspection.status === 'Completed'
                  ? 'Submitted Audit Dossier'
                  : 'Review & Sign Off'}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {inspection.status === 'Submitted / Awaiting Review' || inspection.status === 'Completed'
                  ? `Ref #${inspection.id} • Authenticated Historical Record`
                  : `Order #${inspection.id} • Final Field Dossier`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + spacing.xxxl + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          }}
        >
          {/* Validation Error Banner */}
          {validationError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.status.warning} />
              <Text style={styles.errorBannerText}>{validationError}</Text>
            </View>
          ) : null}

          {/* Target Summary Card */}
          <View style={styles.targetCard}>
            <View style={styles.targetTopRow}>
              <View style={styles.orderIdBadge}>
                <Text style={styles.targetId}>#{inspection.id}</Text>
              </View>
              <PriorityBadge priority={inspection.priority} />
            </View>
            <Text style={styles.projectName}>{inspection.projectName}</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={14} color={colors.brand.primary} />
              <Text style={styles.projectAddress}>{inspection.projectAddress}</Text>
            </View>

            <View style={styles.officerStampRow}>
              <Ionicons name="shield-checkmark" size={14} color={colors.brand.primary} />
              <Text style={styles.officerStampText}>
                Inspected by: <Text style={styles.officerStampHighlight}>{officerName}</Text> ({officerBadge})
              </Text>
            </View>

            {/* On-Site Gatekeeping Verification Strip */}
            <View style={styles.reviewGatekeepStrip}>
              <View style={styles.reviewGatekeepTag}>
                <Ionicons
                  name={
                    inspection.isLocationVerified
                      ? 'checkmark-circle'
                      : inspection.geofenceStatus === 'OVERRIDDEN'
                      ? 'shield-checkmark'
                      : 'location'
                  }
                  size={13}
                  color={
                    inspection.isLocationVerified
                      ? colors.status.normal
                      : inspection.geofenceStatus === 'OVERRIDDEN'
                      ? colors.brand.primary
                      : colors.status.warning
                  }
                />
                <Text style={styles.reviewGatekeepTagText}>
                  {inspection.isLocationVerified
                    ? '100m Geofence Verified'
                    : inspection.geofenceStatus === 'OVERRIDDEN'
                    ? `Exemption: ${inspection.overrideAuthorizingAuthority}`
                    : 'Geofence Pending'}
                </Text>
              </View>

              <View style={styles.reviewGatekeepTag}>
                <Ionicons
                  name={inspection.isBiometricVerified ? 'finger-print' : 'finger-print-outline'}
                  size={13}
                  color={inspection.isBiometricVerified ? colors.status.normal : colors.text.muted}
                />
                <Text style={styles.reviewGatekeepTagText}>
                  {inspection.isBiometricVerified ? 'Biometrics Authenticated' : 'Biometrics Required'}
                </Text>
              </View>
            </View>
          </View>

          {/* 1. Checklist Summary */}
          <SectionHeader
            title="Checklist Evaluation Summary"
            subtitle={`${verifiedCount + attentionCount + naCount} / ${totalCount} Criteria Verified`}
          />

          <View style={styles.statsRow}>
            <View style={[styles.statBox, styles.statBoxVerified]}>
              <Text style={[styles.statCount, { color: colors.status.normal }]}>{verifiedCount}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>

            <View style={[styles.statBox, styles.statBoxAttention]}>
              <Text style={[styles.statCount, { color: colors.status.warning }]}>{attentionCount}</Text>
              <Text style={styles.statLabel}>Needs Attention</Text>
            </View>

            <View style={[styles.statBox, styles.statBoxNA]}>
              <Text style={[styles.statCount, { color: colors.status.offline }]}>{naCount}</Text>
              <Text style={styles.statLabel}>Not Applicable</Text>
            </View>
          </View>

          {/* Items Flagged Needs Attention */}
          {attentionCount > 0 ? (
            <View style={styles.attentionItemsCard}>
              <View style={styles.attentionHeader}>
                <Ionicons name="alert-circle" size={16} color={colors.status.warning} />
                <Text style={styles.attentionTitle}>Criteria Flagged "Needs Attention":</Text>
              </View>
              {checklistList
                .filter((item) => item.status === 'Needs Attention')
                .map((item) => (
                  <View key={item.id} style={styles.attentionItemRow}>
                    <Ionicons name="ellipse" size={6} color={colors.status.warning} style={{ marginTop: 6, marginRight: 6 }} />
                    <View style={styles.attentionItemTextCol}>
                      <Text style={styles.attentionItemTitle}>{item.title}</Text>
                      {item.notes ? (
                        <Text style={styles.attentionItemNote}>Note: "{item.notes}"</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
            </View>
          ) : null}

          {/* 2. Findings Summary */}
          <SectionHeader
            title="Inspector Field Observation"
            subtitle="Narrative findings submitted for administrative record"
          />

          <View style={styles.findingsCard}>
            <View style={styles.findingField}>
              <Text style={styles.findingLabel}>OVERALL OBSERVATION</Text>
              <Text style={styles.findingValue}>
                {findings?.overallObservation || 'None recorded'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.findingField}>
              <Text style={styles.findingLabel}>KEY FINDINGS</Text>
              <Text style={styles.findingValue}>
                {findings?.keyFindings || 'None recorded'}
              </Text>
            </View>

            {findings?.issuesRequiringFollowUp ? (
              <>
                <View style={styles.divider} />
                <View style={styles.findingField}>
                  <Text style={styles.findingLabel}>ISSUES REQUIRING FOLLOW-UP</Text>
                  <Text style={styles.findingValue}>{findings.issuesRequiringFollowUp}</Text>
                </View>
              </>
            ) : null}

            {findings?.additionalRemarks ? (
              <>
                <View style={styles.divider} />
                <View style={styles.findingField}>
                  <Text style={styles.findingLabel}>ADDITIONAL REMARKS</Text>
                  <Text style={styles.findingValue}>{findings.additionalRemarks}</Text>
                </View>
              </>
            ) : null}
          </View>

          {/* 3. Evidence Items Summary */}
          <SectionHeader
            title="Attached Verification Evidence"
            subtitle="Registered media timestamps and metadata"
            badgeCount={evidenceList.length}
          />

          {evidenceList.length === 0 ? (
            <View style={styles.noEvidenceBox}>
              <Ionicons name="images-outline" size={24} color={colors.text.muted} style={{ marginBottom: 4 }} />
              <Text style={styles.noEvidenceText}>No evidence files attached to this inspection.</Text>
            </View>
          ) : (
            <View style={styles.evidenceReviewList}>
              {evidenceList.map((item) => (
                <View key={item.id} style={styles.evidenceReviewItem}>
                  {item.originalPhotoUri ? (
                    <Image source={{ uri: item.originalPhotoUri }} style={styles.evidenceReviewThumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.evidenceIconCircle}>
                      <Ionicons
                        name={item.type === 'photo' ? 'camera' : item.type === 'video' ? 'videocam' : 'document-text'}
                        size={16}
                        color={colors.brand.primary}
                      />
                    </View>
                  )}
                  <View style={styles.evidenceReviewTextCol}>
                    <Text style={styles.evidenceReviewTitle}>{item.title}</Text>
                    <Text style={styles.evidenceReviewMeta}>
                      {item.category} • {item.timestamp} • {item.locationStatus}
                    </Text>
                    {item.hash && (
                      <View style={styles.evidenceHashSnippetRow}>
                        <Ionicons name="shield-checkmark" size={10} color={colors.status.normal} />
                        <Text style={styles.evidenceHashSnippetText}>SHA-256: {item.hash.slice(0, 16)}...</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Submission Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Ionicons
              name={
                inspection.status === 'Submitted / Awaiting Review' || inspection.status === 'Completed'
                  ? 'shield-checkmark'
                  : 'shield-checkmark-outline'
              }
              size={18}
              color={
                inspection.status === 'Submitted / Awaiting Review' || inspection.status === 'Completed'
                  ? colors.status.normal
                  : colors.brand.navyLight
              }
            />
            <Text style={styles.disclaimerText}>
              {inspection.status === 'Submitted / Awaiting Review' || inspection.status === 'Completed'
                ? `Historical Audit Record: Formally authenticated and submitted by ${inspection.submittedBy || 'PMU Field Inspector'}${inspection.submittedAt ? ` on ${inspection.submittedAt}` : ''}. All checklist criteria and evidence hashes are permanently registered.`
                : 'Submitting marks this inspection as "Submitted / Awaiting Review". The official Central Desk will be notified with timestamped field records.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsCol}>
            {inspection.status === 'Submitted / Awaiting Review' || inspection.status === 'Completed' ? (
              <>
                <PrimaryButton
                  title="Back to Inspection History"
                  iconName="arrow-back"
                  onPress={() => navigation.goBack()}
                  style={styles.primaryActionBtn}
                />
                <SecondaryButton
                  title="Return to Inspector Dashboard"
                  iconName="home-outline"
                  onPress={() =>
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'InspectorTabs', params: { screen: 'Home' } }],
                    })
                  }
                  style={{ marginTop: 10, minHeight: 48 }}
                />
              </>
            ) : (
              <>
                <PrimaryButton
                  title="Submit Inspection"
                  iconName="paper-plane"
                  onPress={handleSubmit}
                  loading={submitting}
                  style={styles.primaryActionBtn}
                />
                <SecondaryButton
                  title="Edit Inspection (Back to Checklist)"
                  iconName="create-outline"
                  onPress={() => navigation.navigate('InspectionChecklist', { inspectionId: inspection.id })}
                  disabled={submitting}
                  style={{ marginTop: 10, minHeight: 48 }}
                />
              </>
            )}
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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

  // Target Summary Card
  targetCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  targetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderIdBadge: {
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  targetId: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.3,
  },
  projectName: {
    fontSize: typography.sizes.sm + 3,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 4,
    letterSpacing: -0.2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  projectAddress: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    flex: 1,
  },
  officerStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  officerStampText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  officerStampHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  reviewGatekeepStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: spacing.xs + 2,
  },
  reviewGatekeepTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reviewGatekeepTagText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  statBoxVerified: {
    borderColor: colors.status.normalBorder,
    backgroundColor: colors.status.normalLight,
  },
  statBoxAttention: {
    borderColor: colors.status.warningBorder,
    backgroundColor: colors.status.warningLight,
  },
  statBoxNA: {
    borderColor: colors.status.offlineBorder,
    backgroundColor: colors.status.offlineLight,
  },
  statCount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Attention Items Card
  attentionItemsCard: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  attentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.status.warningBorder,
  },
  attentionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.status.warning,
  },
  attentionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  attentionItemTextCol: {
    flex: 1,
  },
  attentionItemTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    lineHeight: 18,
  },
  attentionItemNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },

  // Findings Card
  findingsCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  findingField: {
    paddingVertical: 2,
  },
  findingLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  findingValue: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.primary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.divider,
    marginVertical: spacing.sm,
  },

  // Evidence Review List
  noEvidenceBox: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noEvidenceText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  evidenceReviewList: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  evidenceReviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    gap: spacing.sm,
    ...shadows.xs,
  },
  evidenceIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceReviewThumb: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  evidenceHashSnippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  evidenceHashSnippetText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.brand.navy,
  },
  evidenceReviewTextCol: {
    flex: 1,
  },
  evidenceReviewTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  evidenceReviewMeta: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Disclaimer Box
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.base,
    gap: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
    flex: 1,
  },

  // Action Buttons
  actionButtonsCol: {
    marginBottom: spacing.xl,
  },
  primaryActionBtn: {
    minHeight: 48,
  },

  // Validation Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.base,
    gap: 8,
  },
  errorBannerText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
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
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
});
