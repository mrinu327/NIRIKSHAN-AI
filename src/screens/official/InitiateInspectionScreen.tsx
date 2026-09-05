/**
 * InitiateInspectionScreen
 * SIH26095 | MoSJE Government Official Monitoring Workflow
 *
 * Formal confirmation screen for initiating a field inspection / audit.
 * Creates an inspection request in the mock system and routes to Inspection Oversight.
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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackParamList, OfficialStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { Project } from '../../types/project';
import { InspectionType, PriorityLevel } from '../../types/inspection';
import { SUNRISE_ATTENDANCE } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type InitiateInspectionRouteProp = RouteProp<OfficialStackParamList, 'InitiateInspection'>;

export const InitiateInspectionScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<InitiateInspectionRouteProp>();
  const { projectId, alertId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  // Entrance animation
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  // Form selections
  const [selectedType, setSelectedType] = useState<InspectionType>('Surprise Inspection');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('HIGH');

  useEffect(() => {
    mockProjectService.getProjectById(projectId).then((data) => {
      setProject(data || null);
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

  if (loading || !project) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Initiate Inspection" subtitle="Preparing dispatch protocol..." />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading facility parameters...</Text>
        </View>
      </View>
    );
  }

  const isSunrise = project.id === 'PRJ-101' || project.name.includes('Sunrise');
  const triggerReason = alertId
    ? `Triggered by discrepancy alert #${alertId} (+17 variance between ${SUNRISE_ATTENDANCE.currentSubmittedAttendance} reported and 25 estimated)`
    : `Triggered by official monitoring review for ${project.name}`;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      // 1. Create inspection request in mock service
      const newInspection = await mockInspectionService.createInspectionRequest({
        projectId: project.id,
        projectName: project.name,
        projectAddress: project.location.address,
        city: project.location.city,
        type: selectedType,
        priority: selectedPriority,
        triggerReason,
        scheduledTime: 'Immediate PMU Dispatch',
      });

      // 2. Mark alert as inspection initiated if alertId provided
      if (alertId) {
        await mockAlertService.markInspectionInitiated(alertId, newInspection.id);
      }

      // 3. Update project status
      await mockProjectService.updateProjectStatus(
        project.id,
        'High Priority',
        `Surprise inspection #${newInspection.id} initiated by MoSJE Central Desk`
      );

      // 4. Navigate to Inspections Oversight tab where the new inspection appears at top!
      navigation.navigate('OfficialTabs', { screen: 'Inspections' });
    } catch (error) {
      console.error('Error initiating inspection:', error);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Header */}
      <AppHeader
        title="Initiate Inspection"
        subtitle="PMU Field Verification Dispatch Protocol"
      />

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
          {/* Navigation Breadcrumb */}
          <View style={styles.breadcrumbBar}>
            <TouchableOpacity
              style={styles.breadcrumbBtn}
              onPress={handleCancel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={14} color={colors.brand.primary} />
              <Text style={styles.breadcrumbLink}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <Text style={styles.breadcrumbCode}>{project.code}</Text>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <Text style={styles.breadcrumbCurrent}>Dispatch Protocol</Text>
          </View>

        {/* Target Facility Summary Card */}
        <View style={styles.targetCard}>
          <View style={styles.targetHeader}>
            <Ionicons name="business" size={18} color={colors.brand.primary} />
            <Text style={styles.targetHeading}>TARGET INSTITUTE FOR AUDIT</Text>
          </View>

          <Text style={styles.targetName}>{project.name}</Text>
          <Text style={styles.targetLocation}>
            {project.location.address}, {project.location.city}, {project.location.state}
          </Text>
          <Text style={styles.targetCode}>Scheme Code: {project.code} • {project.category}</Text>
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
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={type === 'Surprise Inspection' ? 'flash' : 'clipboard'}
                    size={14}
                    color={isSelected ? colors.text.inverse : colors.text.primary}
                  />
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Priority Level Selector */}
          <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Dispatch Priority</Text>
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
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {prio} Priority
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Reason / Trigger Details */}
          <View style={styles.triggerBox}>
            <Text style={styles.triggerLabel}>Audit Dispatch Justification:</Text>
            <Text style={styles.triggerValue}>{triggerReason}</Text>
          </View>

          {/* Protocol Note */}
          <View style={styles.protocolNotice}>
            <Ionicons name="information-circle" size={16} color={colors.brand.navyLight} />
            <Text style={styles.protocolNoticeText}>
              Confirmation registers an unassigned inspection order in the PMU docket. You can run automated random assignment from the Field Inspection Oversight dashboard to impartially dispatch an active field officer.
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
  centerContainer: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.neutral.surface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: 6,
  },
  breadcrumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  breadcrumbSeparator: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  breadcrumbCode: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  breadcrumbCurrent: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
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
    marginTop: 2,
  },
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
    marginBottom: spacing.xs,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  pillSelected: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  pillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: 4,
  },
  pillTextSelected: {
    color: colors.text.inverse,
  },
  triggerBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
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
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  protocolNoticeText: {
    fontSize: typography.sizes.xs,
    color: colors.brand.navyLight,
    lineHeight: 17,
    marginLeft: 8,
    flex: 1,
  },
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
});
