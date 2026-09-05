/**
 * InspectionConfirmationScreen
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Post-submission confirmation showing 'Submitted / Awaiting Review' status,
 * audit timestamp, and navigation back to Inspector Home.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
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
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<InspectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockInspectionService.getInspectionById(inspectionId).then((data) => {
      setInspection(data || null);
      setLoading(false);
    });
  }, [inspectionId]);

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'InspectorTabs', params: { screen: 'Home' } }],
    });
  };

  if (loading || !inspection) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Submission Confirmation" subtitle="Finalizing records..." />
        <ActivityIndicator size="large" color={colors.brand.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Submission Successful"
        subtitle="PMU Field Verification Protocol Completed"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Success Icon */}
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-done" size={40} color={colors.text.inverse} />
          </View>

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
              <Text style={styles.detailValue}>
                {inspection.submittedBy || inspection.assignedOfficerName}
              </Text>
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
            />
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
  centerContainer: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    marginBottom: spacing.lg,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    gap: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontWeight: typography.weights.medium,
  },
  detailValue: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  auditNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: 8,
    marginBottom: spacing.lg,
  },
  auditNoticeText: {
    fontSize: 11,
    color: colors.brand.navyLight,
    lineHeight: 16,
    flex: 1,
  },
  actionRow: {
    width: '100%',
  },
});
