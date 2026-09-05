import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, RiskBadge, Button } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useInspectionStore } from '../../src/store/useInspectionStore';
import { api } from '../../src/services/api';
import { RiskLevel } from '@nirikshan/shared-types';

export default function InspectorAssignments() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setInspectionTarget = useInspectionStore((s) => s.setInspectionTarget);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await api.getMyInspections(user?.id);
      setAssignments(data);
    } catch (e) {
      console.warn('Failed to fetch inspector assignments:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const handleStartInspection = (task: any) => {
    const projName = task.project?.name || task.project || 'Demo Welfare Institute - Coimbatore';
    const projAddress = task.project?.address || task.address || '42 Avinashi Road, Peelamedu, Coimbatore';
    const projLat = task.project?.latitude || 11.0267;
    const projLon = task.project?.longitude || 76.9953;

    setInspectionTarget(task.id, task.projectId || 'proj-001', projName, projAddress, projLat, projLon);

    router.push({
      pathname: '/(inspector)/map',
      params: {
        inspectionId: task.id,
        projectId: task.projectId || 'proj-001',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="INSPECTOR TASKS" subtitle="Surprise Assignments & Field Deployments" />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Inspector Identity Card */}
        <View style={styles.inspectorBanner}>
          <View>
            <Text style={styles.inspectorGreeting}>Assigned PMU Officer</Text>
            <Text style={styles.inspectorName}>{user?.name || 'Priya Verma'}</Text>
            <Text style={styles.inspectorDistrict}>
              District: {user?.district || 'Coimbatore'} • {user?.state || 'Tamil Nadu'} PMU Unit
            </Text>
          </View>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeNumber}>ID #PMU-TN-042</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Field Deployments</Text>
          <Text style={styles.countBadge}>{assignments.length} Tasks Assigned</Text>
        </View>

        {assignments.map((task) => {
          const projName = task.project?.name || task.project || 'Demo Welfare Institute';
          const projAddress = task.project?.address || task.address || 'Field Location';
          const riskLvl = task.project?.riskLevel || task.riskLevel || RiskLevel.HIGH;
          const riskSc = task.project?.riskScore || task.riskScore || 80;
          const reason =
            task.project?.reason ||
            task.reason ||
            'High Attendance Mismatch flagged by central monitoring vision telemetry';
          const deadline = task.deadline || 'Today, 05:00 PM';
          const isCompleted = task.status === 'COMPLETED';

          return (
            <Card key={task.id} style={styles.taskCard}>
              <View style={styles.taskTop}>
                <RiskBadge level={riskLvl} score={riskSc} showScore={true} />
                <View style={styles.typePill}>
                  <Text style={styles.typePillText}>{task.type || 'SURPRISE PHYSICAL'}</Text>
                </View>
              </View>

              <Text style={styles.projectName}>{projName}</Text>
              <Text style={styles.projectAddress}>📍 {projAddress}</Text>

              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>Reason for Surprise Inspection:</Text>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>

              <View style={styles.taskFooter}>
                <Text style={styles.deadlineText}>⏰ Due: {deadline}</Text>
                <Button
                  title={isCompleted ? "Inspection Completed ✓" : "Start Inspection ➔"}
                  size="sm"
                  variant={isCompleted ? "secondary" : "primary"}
                  disabled={isCompleted}
                  onPress={() => handleStartInspection(task)}
                  style={styles.startBtn}
                />
              </View>
            </Card>
          );
        })}
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
    paddingBottom: spacing.xxl,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
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
