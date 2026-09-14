/**
 * InitiateInspectionScreen
 * SIH26095 | MoSJE Government Official Monitoring Workflow
 *
 * Formal confirmation screen for initiating a field inspection / audit.
 * Creates an inspection request in the mock system and routes to Inspection Oversight.
 * Fully responsive for mobile and desktop viewports.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackParamList, OfficialStackNavigationProp } from '../../types/navigation';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { mockOfficialService } from '../../services/mock/mockOfficialService';
import { mockAssignmentService } from '../../services/mock/mockAssignmentService';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types/project';
import { InspectionType, PriorityLevel, DemoInspector } from '../../types/inspection';
import { SUNRISE_ATTENDANCE } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type InitiateInspectionRouteProp = RouteProp<OfficialStackParamList, 'InitiateInspection'>;

export const InitiateInspectionScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<InitiateInspectionRouteProp>();
  const insets = useSafeAreaInsets();
  const { currentRole, switchRole } = useAuth();
  const { projectId, alertId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  // Entrance animation
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  // Skeleton pulse animation
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Form selections
  const [selectedType, setSelectedType] = useState<InspectionType>('Surprise Inspection');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('HIGH');
  const [selectedTrigger, setSelectedTrigger] = useState<string>(
    alertId ? 'CCTV Telemetry Variance' : 'Recurring Discrepancy Pattern'
  );
  const [assignmentMode, setAssignmentMode] = useState<'AUTOMATED' | 'SPECIFIC'>('AUTOMATED');
  const [selectedInspector, setSelectedInspector] = useState<string>('Vikram Singh');
  const [availableInspectors, setAvailableInspectors] = useState<DemoInspector[]>([]);

  // Authorizing Official Metadata
  const authorizingOfficialName = 'Dr. Rajesh Kumar, IAS';
  const authorizingOfficialDesignation = 'Joint Secretary, MoSJE Central Monitoring Desk';
  const authorizationBadge = 'MoSJE-DIR-2026-042';

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
    Promise.all([
      mockProjectService.getProjectById(projectId),
      mockAssignmentService.getAllInspectors(),
    ]).then(([projData, inspectors]) => {
      setProject(projData || null);
      const activeOnly = (inspectors || []).filter((i) => i.active);
      setAvailableInspectors(activeOnly);
      if (activeOnly.length > 0) {
        setSelectedInspector(activeOnly[0].name);
      }
      setLoading(false);
    });
  }, [projectId]);

  useEffect(() => {
    if (!loading && project) {
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
  }, [loading, project]);

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

  const isSunrise = project?.id === 'PRJ-101' || (project?.name ? project.name.includes('Sunrise') : false);
  const triggerReason = alertId
    ? `${selectedTrigger}: Discrepancy alert #${alertId} (+17 variance between ${SUNRISE_ATTENDANCE.currentSubmittedAttendance} reported and 25 estimated)`
    : `${selectedTrigger}: Official governance review for ${project?.name ?? 'selected facility'}`;

  const handleConfirm = async () => {
    if (!project) return;
    setSubmitting(true);
    try {
      const isSurprise = selectedType === 'Surprise Inspection';
      const assignedOfficerName = assignmentMode === 'SPECIFIC' ? selectedInspector : undefined;

      // 1. Dispatch through central MoSJE Official Service
      let initiatedInspection;
      if (isSurprise) {
        initiatedInspection = await mockOfficialService.dispatchSurpriseInspection({
          projectId: project.id,
          priority: selectedPriority === 'HIGH' ? 'HIGH' : 'NORMAL',
          reason: triggerReason,
          assignedInspector: assignedOfficerName,
          authorizingOfficial: `${authorizingOfficialName} (${authorizingOfficialDesignation})`,
        });
      } else {
        initiatedInspection = await mockOfficialService.scheduleRoutineInspection({
          projectId: project.id,
          scheduledDate: 'Tomorrow, 10:00 AM',
          priority: selectedPriority === 'HIGH' ? 'HIGH' : 'NORMAL',
          type: selectedType,
          assignedInspector: assignedOfficerName,
          reason: triggerReason,
          authorizingOfficial: `${authorizingOfficialName} (${authorizingOfficialDesignation})`,
        });
      }

      // 2. Mark alert as inspection initiated if alertId provided
      if (alertId && initiatedInspection) {
        await mockAlertService.markInspectionInitiated(alertId, initiatedInspection.id);
      }

      // 3. Update project status
      await mockProjectService.updateProjectStatus(
        project.id,
        'High Priority',
        `${selectedType} #${initiatedInspection?.id || 'NEW'} initiated by MoSJE Central Desk`
      );

      // 4. Navigate to Inspections Oversight tab
      navigation.navigate('OfficialTabs', { screen: 'Inspections' });
    } catch (error) {
      console.error('Error initiating inspection:', error);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Loading skeleton screen
  if (loading || !project) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

        {/* Integrated Executive Header Skeleton */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
          <View style={styles.headerInner}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerBranding}>
                <View style={styles.headerEmblem}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
                </View>
                <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
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

            <View style={styles.headerMainRow}>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.headerBackBtn}
                accessibilityRole="button"
                accessibilityLabel="Back to previous screen"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Initiate Inspection
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  PMU Field Verification Dispatch Protocol
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skeleton Body */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonTargetCard}>
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 14, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '75%', height: 22, marginTop: 12, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '85%', height: 14, marginTop: 8, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '45%', height: 14, marginTop: 6, opacity: skeletonPulse }]} />
          </View>

          <View style={styles.skeletonSection}>
            <Animated.View style={[styles.skeletonLine, { width: 160, height: 18, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 260, height: 14, marginTop: 6, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonCard, { height: 240, marginTop: 12, opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Integrated Executive Header with Native-Style Back Button */}
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
              onPress={handleCancel}
              style={styles.headerBackBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to previous screen"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text.inverse} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Initiate Inspection
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                PMU Field Verification Dispatch Protocol
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Target Facility Summary Card */}
          <View style={styles.targetCard}>
            <View style={styles.targetHeader}>
              <Ionicons name="business" size={16} color={colors.brand.primary} />
              <Text style={styles.targetHeading}>TARGET INSTITUTE FOR AUDIT</Text>
            </View>

            <Text style={styles.targetName}>{project.name}</Text>
            <Text style={styles.targetLocation}>
              {project.location.address}, {project.location.city}, {project.location.state}
            </Text>
            <Text style={styles.targetCode}>
              Scheme Code: <Text style={styles.targetCodeBold}>{project.code}</Text> • {project.category}
            </Text>
          </View>

          {/* Audit Parameters Form */}
          <SectionHeader
            title="Inspection Parameters"
            subtitle="Select inspection category and dispatch urgency"
          />

          <View style={styles.formCard}>
            {/* Inspection Type Selector */}
            <Text style={styles.fieldLabel}>Inspection Category</Text>
            <View style={styles.pillRow}>
              {(['Surprise Inspection', 'Routine Inspection', 'Special Audit'] as InspectionType[]).map((type) => {
                const isSelected = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pill,
                      isSelected && (type === 'Surprise Inspection' ? styles.pillSurpriseSelected : styles.pillSelected),
                    ]}
                    onPress={() => setSelectedType(type)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={type === 'Surprise Inspection' ? 'flash' : type === 'Special Audit' ? 'clipboard' : 'calendar'}
                      size={15}
                      color={isSelected ? colors.text.inverse : colors.text.primary}
                    />
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Distinct Type Description Banner */}
            {selectedType === 'Surprise Inspection' ? (
              <View style={styles.typeNoticeSurprise}>
                <Ionicons name="flash" size={16} color={colors.status.highPriority} />
                <Text style={styles.typeNoticeTextSurprise}>
                  <Text style={{ fontWeight: typography.weights.bold }}>⚡ UNANNOUNCED SURPRISE INSPECTION: </Text>
                  Advance notice is strictly withheld from the facility. Mandatory physical arrival within the 100m geofence will be enforced for on-site inspection unlock.
                </Text>
              </View>
            ) : selectedType === 'Special Audit' ? (
              <View style={styles.typeNoticeSpecial}>
                <Ionicons name="clipboard-outline" size={16} color={colors.status.warning} />
                <Text style={styles.typeNoticeTextSpecial}>
                  <Text style={{ fontWeight: typography.weights.bold }}>📋 SPECIAL REGULATORY AUDIT: </Text>
                  Targeted audit addressing specific infrastructure, telemetry variance, or financial compliance anomalies.
                </Text>
              </View>
            ) : (
              <View style={styles.typeNoticeRoutine}>
                <Ionicons name="calendar-outline" size={16} color={colors.brand.primary} />
                <Text style={styles.typeNoticeTextRoutine}>
                  <Text style={{ fontWeight: typography.weights.bold }}>📅 SCHEDULED STATUTORY AUDIT: </Text>
                  Routine bi-annual compliance monitoring logged in the official PMU statutory schedule.
                </Text>
              </View>
            )}

            {/* Priority Level Selector */}
            <Text style={[styles.fieldLabel, { marginTop: spacing.base }]}>Dispatch Urgency</Text>
            <View style={styles.pillRow}>
              {(['HIGH', 'MEDIUM', 'NORMAL'] as PriorityLevel[]).map((prio) => {
                const isSelected = selectedPriority === prio;
                return (
                  <TouchableOpacity
                    key={prio}
                    style={[
                      styles.pill,
                      isSelected && {
                        backgroundColor:
                          prio === 'HIGH'
                            ? colors.status.highPriority
                            : prio === 'MEDIUM'
                            ? colors.status.warning
                            : colors.brand.primary,
                        borderColor: 'transparent',
                      },
                    ]}
                    onPress={() => setSelectedPriority(prio)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {prio} Priority
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Trigger Reason Selection */}
            <Text style={[styles.fieldLabel, { marginTop: spacing.base }]}>Dispatch Justification</Text>
            <View style={styles.pillRow}>
              {[
                'CCTV Telemetry Variance',
                'Recurring Discrepancy Pattern',
                'Random Anti-Collusion Audit',
                'Public Grievance / Tip-off',
              ].map((reason) => {
                const isSelected = selectedTrigger === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => setSelectedTrigger(reason)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={
                        reason.includes('CCTV')
                          ? 'videocam-outline'
                          : reason.includes('Recurring')
                          ? 'repeat-outline'
                          : reason.includes('Random')
                          ? 'shuffle-outline'
                          : 'megaphone-outline'
                      }
                      size={14}
                      color={isSelected ? colors.text.inverse : colors.text.secondary}
                    />
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Inspector Assignment Mode */}
            <Text style={[styles.fieldLabel, { marginTop: spacing.base }]}>Inspector Allocation Strategy</Text>
            <View style={styles.pillRow}>
              <TouchableOpacity
                style={[styles.pill, assignmentMode === 'AUTOMATED' && styles.pillSelected]}
                onPress={() => setAssignmentMode('AUTOMATED')}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="shuffle"
                  size={15}
                  color={assignmentMode === 'AUTOMATED' ? colors.text.inverse : colors.text.primary}
                />
                <Text style={[styles.pillText, assignmentMode === 'AUTOMATED' && styles.pillTextSelected]}>
                  Automated Anti-Collusion PMU Allocation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pill, assignmentMode === 'SPECIFIC' && styles.pillSelected]}
                onPress={() => setAssignmentMode('SPECIFIC')}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="person-outline"
                  size={15}
                  color={assignmentMode === 'SPECIFIC' ? colors.text.inverse : colors.text.primary}
                />
                <Text style={[styles.pillText, assignmentMode === 'SPECIFIC' && styles.pillTextSelected]}>
                  Direct Inspector Selection
                </Text>
              </TouchableOpacity>
            </View>

            {/* Direct Inspector Picker if selected */}
            {assignmentMode === 'SPECIFIC' && (
              <View style={styles.inspectorPickerContainer}>
                <Text style={styles.inspectorPickerLabel}>Select Active PMU Field Officer:</Text>
                <View style={styles.inspectorChipsGrid}>
                  {availableInspectors.map((inspector) => {
                    const isPicked = selectedInspector === inspector.name;
                    return (
                      <TouchableOpacity
                        key={inspector.id}
                        style={[styles.inspectorChip, isPicked && styles.inspectorChipPicked]}
                        onPress={() => setSelectedInspector(inspector.name)}
                        activeOpacity={0.75}
                      >
                        <Ionicons
                          name={isPicked ? 'checkmark-circle' : 'person-circle-outline'}
                          size={16}
                          color={isPicked ? colors.brand.primary : colors.text.muted}
                        />
                        <View style={{ marginLeft: 6 }}>
                          <Text style={[styles.inspectorChipName, isPicked && styles.inspectorChipNamePicked]}>
                            {inspector.name}
                          </Text>
                          <Text style={styles.inspectorChipZone}>
                            {inspector.assignedLocation} • {inspector.jurisdiction}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Authorizing Official Audit Record */}
            <View style={styles.authorizingCard}>
              <View style={styles.authorizingHeader}>
                <Ionicons name="shield-checkmark" size={15} color={colors.brand.primary} />
                <Text style={styles.authorizingTitle}>IMMUTABLE AUTHORIZING AUDIT RECORD</Text>
              </View>
              <View style={styles.authorizingDetails}>
                <Text style={styles.authorizingName}>{authorizingOfficialName}</Text>
                <Text style={styles.authorizingDesignation}>{authorizingOfficialDesignation}</Text>
                <Text style={styles.authorizingBadge}>Officer Badge: {authorizationBadge} • MoSJE Central Directorate</Text>
              </View>
              <Text style={styles.authorizingDisclaimer}>
                Authorization is logged in the permanent MoSJE activity ledger with GPS & timestamp lock.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsBox}>
            <PrimaryButton
              title="Confirm & Initiate Inspection Order"
              iconName="checkmark-circle"
              onPress={handleConfirm}
              loading={submitting}
              style={styles.confirmButton}
            />
            <SecondaryButton
              title="Cancel"
              onPress={handleCancel}
              disabled={submitting}
              style={styles.cancelButton}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  animatedContainer: {
    flex: 1,
  },

  /* Executive Header */
  headerContainer: {
    backgroundColor: colors.brand.navy,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    ...shadows.xs,
  },
  headerInner: {
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmblem: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerMinistry: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#D0D5DD',
    letterSpacing: 0.5,
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  roleBadgeText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    letterSpacing: 0.3,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    minHeight: 28,
  },
  switchText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginLeft: 4,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
    gap: spacing.sm,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: '#CBD5E1',
    marginTop: 2,
  },

  /* Scroll Body */
  scrollContent: {
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl + 24,
  },

  /* Target Institute Card */
  targetCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.highPriority,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  targetHeading: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.6,
    marginLeft: 6,
  },
  targetName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  targetLocation: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.secondary,
    marginTop: 4,
  },
  targetCode: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 3,
  },
  targetCodeBold: {
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },

  /* Form Card */
  formCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  fieldLabel: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs + 2,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: borderRadius.md,
  },
  pillSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  pillSurpriseSelected: {
    backgroundColor: colors.status.highPriority,
    borderColor: colors.status.highPriority,
  },
  pillText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: 6,
  },
  pillTextSelected: {
    color: colors.text.inverse,
  },
  typeNoticeSurprise: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.status.highPriorityLight,
    borderWidth: 1,
    borderColor: colors.status.highPriorityBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: 8,
  },
  typeNoticeTextSurprise: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.status.highPriority,
    lineHeight: 17,
  },
  typeNoticeRoutine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.brand.accent,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: 8,
  },
  typeNoticeTextRoutine: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    lineHeight: 17,
  },
  typeNoticeSpecial: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.status.warningLight,
    borderWidth: 1,
    borderColor: colors.status.warningBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: 8,
  },
  typeNoticeTextSpecial: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.status.warning,
    lineHeight: 17,
  },
  inspectorPickerContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  inspectorPickerLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inspectorChipsGrid: {
    gap: 8,
  },
  inspectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    minHeight: 44,
  },
  inspectorChipPicked: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
  },
  inspectorChipName: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  inspectorChipNamePicked: {
    color: colors.brand.primary,
  },
  inspectorChipZone: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
  authorizingCard: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    marginTop: spacing.base,
  },
  authorizingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  authorizingTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  authorizingDetails: {
    marginBottom: 6,
  },
  authorizingName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  authorizingDesignation: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 1,
  },
  authorizingBadge: {
    fontSize: 10,
    color: colors.brand.navyLight,
    marginTop: 2,
  },
  authorizingDisclaimer: {
    fontSize: 10,
    color: colors.text.muted,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  triggerBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  triggerLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  triggerValue: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.primary,
    lineHeight: 18,
  },
  protocolNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.base,
    borderWidth: 1,
    borderColor: colors.brand.accent,
  },
  protocolNoticeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    lineHeight: 17,
    marginLeft: 8,
    flex: 1,
  },

  /* Actions Box */
  actionsBox: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  confirmButton: {
    backgroundColor: colors.status.highPriority,
  },
  cancelButton: {
    borderColor: colors.neutral.border,
  },

  /* Skeleton Loading */
  skeletonTargetCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonSection: {
    marginBottom: spacing.md,
  },
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
});
