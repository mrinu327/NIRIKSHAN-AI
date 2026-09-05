import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, RiskBadge, Button } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';
import { RiskLevel } from '@nirikshan/shared-types';

export default function InspectorAssignments() {
  const user = useAuthStore((s) => s.user);

  const assignments = [
    {
      id: 'insp-001',
      project: 'Demo Welfare Institute - Coimbatore',
      address: '42 Avinashi Road, Peelamedu, Coimbatore',
      type: 'SURPRISE PHYSICAL INSPECTION',
      deadline: 'Today, 05:00 PM',
      riskLevel: RiskLevel.HIGH,
      riskScore: 82,
      reason: 'High Attendance Mismatch (33.7%) flagged by computer vision',
      status: 'ACTIVE_NOW',
    },
    {
      id: 'insp-003',
      project: 'Demo Senior Care Sanctuary - Chennai',
      address: '15 GST Road, Guindy, Chennai',
      type: 'ROUTINE VERIFICATION',
      deadline: 'Tomorrow, 12:00 PM',
      riskLevel: RiskLevel.LOW,
      riskScore: 24,
      reason: 'Semi-annual routine physical audit',
      status: 'UPCOMING',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="INSPECTOR TASKS" subtitle="Surprise Assignments & Field Deployments" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Inspector Identity Card */}
        <View style={styles.inspectorBanner}>
          <View>
            <Text style={styles.inspectorGreeting}>Assigned PMU Officer</Text>
            <Text style={styles.inspectorName}>{user?.name || 'Priya Verma'}</Text>
            <Text style={styles.inspectorDistrict}>
              District: Coimbatore • Tamil Nadu PMU Unit
            </Text>
          </View>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeNumber}>ID #PMU-TN-042</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Deployments</Text>

        {assignments.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <View style={styles.taskTop}>
              <RiskBadge level={task.riskLevel} score={task.riskScore} showScore={true} />
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>{task.type}</Text>
              </View>
            </View>

            <Text style={styles.projectName}>{task.project}</Text>
            <Text style={styles.projectAddress}>📍 {task.address}</Text>

            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>Reason for Surprise Inspection:</Text>
              <Text style={styles.reasonText}>{task.reason}</Text>
            </View>

            <View style={styles.taskFooter}>
              <Text style={styles.deadlineText}>⏰ Due: {task.deadline}</Text>
              <Button
                title="Start Inspection ➔"
                size="sm"
                onPress={() => {}}
                style={styles.startBtn}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    padding: spacing.base,
    backgroundColor: colors.background,
  },
  inspectorBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  inspectorGreeting: {
    fontSize: 11,
    color: colors.textMuted,
  },
  inspectorName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  inspectorDistrict: {
    fontSize: 11,
    color: colors.secondary,
    marginTop: 2,
  },
  badgeWrap: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  badgeNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  taskCard: {
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  taskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  projectName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  projectAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  reasonBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  reasonText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    marginTop: 2,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  deadlineText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
  },
  startBtn: {
    paddingHorizontal: spacing.md,
  },
});
