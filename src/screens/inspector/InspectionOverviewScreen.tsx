/**
 * InspectionOverviewScreen
 * SIH26095 | MoSJE PMU Inspector Field Workflow
 *
 * Dedicated overview screen displaying target institute details,
 * protocol instructions, and 'Start Inspection' trigger.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
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
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<InspectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    mockInspectionService.getInspectionById(inspectionId).then((data) => {
      setInspection(data || null);
      setLoading(false);
    });
  }, [inspectionId]);

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

  if (loading || !inspection) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Inspection Overview" subtitle="Loading assignment details..." />
        <ActivityIndicator size="large" color={colors.brand.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  const isSurprise = inspection.type === 'Surprise Inspection';
  const isInProgress = inspection.status === 'In Progress';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Field Inspection Overview"
        subtitle={`Order #${inspection.id} • MoSJE PMU Dispatch`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color={colors.brand.primary} />
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Target Institute Card */}
        <View style={[styles.targetCard, isSurprise && styles.targetCardSurprise]}>
          <View style={styles.targetTopRow}>
            <View style={styles.typeRow}>
              {isSurprise && <Ionicons name="flash" size={14} color={colors.status.highPriority} style={{ marginRight: 4 }} />}
              <Text style={[styles.typeText, isSurprise && styles.typeTextSurprise]}>
                {inspection.type}
              </Text>
            </View>
            <StatusBadge label={inspection.status} variant={isInProgress ? 'warning' : 'info'} size="sm" />
          </View>

          <Text style={styles.projectName}>{inspection.projectName}</Text>

          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={colors.text.muted} style={{ marginTop: 2 }} />
            <Text style={styles.addressText}>{inspection.projectAddress}</Text>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Order ID</Text>
              <Text style={styles.metaValue}>#{inspection.id}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Priority</Text>
              <PriorityBadge priority={inspection.priority} />
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Assigned Officer</Text>
              <Text style={styles.metaValue}>
                {inspection.assignedOfficerName}{' '}
                {inspection.assignedOfficerDemoId ? (
                  <Text style={{ color: colors.brand.primary }}>({inspection.assignedOfficerDemoId})</Text>
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
              <Text style={styles.stepTitle}>Evidence Capture Placeholder</Text>
              <Text style={styles.stepDesc}>Watermarked demo photo/video metadata registration.</Text>
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

        {/* Action Button */}
        <View style={styles.actionSection}>
          <PrimaryButton
            title={isInProgress ? 'Resume Inspection' : 'Start Inspection'}
            iconName="play-circle"
            onPress={handleStartInspection}
            loading={starting}
          />
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
  centerContainer: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  backButtonText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
    marginLeft: 6,
  },
  targetCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
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
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  addressText: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.muted,
    marginLeft: 4,
    flex: 1,
  },
  metaGrid: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.sm,
  },
  metaItem: {
    minWidth: '45%',
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text.muted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  triggerAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
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
  protocolCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
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
    backgroundColor: '#EFF6FF',
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
    backgroundColor: '#F8FAFC',
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
    color: colors.text.muted,
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
  actionSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
});
