/**
 * InspectionPlaceholderScreen
 * PMU Inspector - Active Inspection Workflow & Evidence Capture Preview
 * SIH26095 | MoSJE
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { InspectorTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { SUNRISE_ATTENDANCE } from '../../data/mockData';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const InspectionPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<InspectorTabNavigationProp<'Inspection'>>();
  const [activeInspection, setActiveInspection] = useState<InspectionAssignment | null>(null);

  useEffect(() => {
    mockInspectionService.getAssignedInspections().then((list) => {
      const active =
        list.find((i) => i.status === 'In Progress') ||
        list.find((i) => i.status === 'Accepted / Acknowledged') ||
        list[0];
      setActiveInspection(active || null);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Field Inspection Tool"
        subtitle="On-site evidence capture & biometric audit tool"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Inspection Preview Banner */}
        <View style={styles.activeBanner}>
          <View style={styles.activeHeader}>
            <View style={styles.liveDot} />
            <Text style={styles.activeLabel}>
              {activeInspection?.type === 'Surprise Inspection'
                ? 'SURPRISE INSPECTION ORDER'
                : 'ACTIVE INSPECTION ORDER'}
            </Text>
            {activeInspection && (
              <View style={{ marginLeft: 'auto' }}>
                <StatusBadge label={activeInspection.status} variant="warning" size="sm" />
              </View>
            )}
          </View>
          <Text style={styles.activeTitle}>
            {activeInspection?.projectName || 'Sunrise Rehabilitation Centre'}
          </Text>
          <Text style={styles.activeSub}>
            {activeInspection?.projectAddress || 'Sector 14, Rohini, New Delhi'} • Order #{activeInspection?.id || 'INSP-2026-881'}
          </Text>

          {/* Quick Action Button */}
          {activeInspection && (
            <View style={styles.actionBtnRow}>
              <PrimaryButton
                title={
                  activeInspection.status === 'In Progress'
                    ? 'Resume On-Site Inspection'
                    : activeInspection.status === 'Submitted / Awaiting Review'
                    ? 'View Submitted Audit Record'
                    : 'Open Field Inspection Dossier'
                }
                iconName={activeInspection.status === 'In Progress' ? 'play-circle' : 'arrow-forward'}
                onPress={() =>
                  navigation.navigate('InspectionOverview', { inspectionId: activeInspection.id })
                }
                style={styles.launchBtn}
              />
            </View>
          )}
        </View>

        <SectionHeader
          title="On-Site Verification Protocol"
          subtitle="Mandatory checklist requirements for field verification"
        />

        <View style={styles.checklistContainer}>
          <View style={styles.checkItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={18} color={colors.brand.primary} />
            </View>
            <View style={styles.checkTextContainer}>
              <Text style={styles.checkTitle}>GPS Geofence Validation</Text>
              <Text style={styles.checkDesc}>Requires officer within 100m of facility boundary.</Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera" size={18} color={colors.brand.primary} />
            </View>
            <View style={styles.checkTextContainer}>
              <Text style={styles.checkTitle}>Watermarked Timestamp Photos</Text>
              <Text style={styles.checkDesc}>Assembly hall, kitchen hygiene, and CCTV feed monitor.</Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={18} color={colors.brand.primary} />
            </View>
            <View style={styles.checkTextContainer}>
              <Text style={styles.checkTitle}>Physical Headcount Audit</Text>
              <Text style={styles.checkDesc}>
                {`Compare actual present count against submitted ${SUNRISE_ATTENDANCE.currentSubmittedAttendance} attendees (Capacity: ${SUNRISE_ATTENDANCE.totalBeneficiaries}, ${SUNRISE_ATTENDANCE.attendanceRate}% turnout, ${SUNRISE_ATTENDANCE.absent} absent).`}
              </Text>
            </View>
          </View>

          <View style={[styles.checkItem, styles.checkItemLast]}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text" size={18} color={colors.brand.primary} />
            </View>
            <View style={styles.checkTextContainer}>
              <Text style={styles.checkTitle}>Digital Signature & Submission</Text>
              <Text style={styles.checkDesc}>Joint sign-off by Inspector and Institute In-charge.</Text>
            </View>
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.brand.navyLight} />
          <Text style={styles.noticeText}>
            Interactive checklist and camera capture are verified per MoSJE field operating rules.
          </Text>
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
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxxl + 24,
  },
  activeBanner: {
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
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.highPriority,
    marginRight: 6,
  },
  activeLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    letterSpacing: 0.5,
  },
  activeTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  activeSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  actionBtnRow: {
    marginTop: spacing.md,
  },
  launchBtn: {
    minHeight: 46,
  },
  checklistContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.xs,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: spacing.base,
    marginBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  checkItemLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  checkTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  checkDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 18,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#D0DDF7',
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  noticeText: {
    fontSize: typography.sizes.xs,
    color: colors.brand.navyLight,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 17,
  },
});
