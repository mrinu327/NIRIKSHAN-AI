/**
 * InspectorHomeScreen
 * PMU / Field Inspection Officer Home Dashboard.
 * Mobile-first responsive layout with dynamic card stacking.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { StatCard } from '../../components/common/StatCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { InspectionCard } from '../../components/cards/InspectionCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const InspectorHomeScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    assignedInspections: 3,
    todaysTasks: 2,
    highPriority: 1,
    completedThisMonth: 11,
  });
  const [inspections, setInspections] = useState<InspectionAssignment[]>([]);

  const loadInspectorData = async () => {
    try {
      const [statsData, assignmentsData] = await Promise.all([
        mockInspectionService.getInspectorStats(),
        mockInspectionService.getAssignedInspections(),
      ]);
      setStats(statsData);
      setInspections(assignmentsData);
    } catch (error) {
      console.error('Error loading inspector data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInspectorData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInspectorData();
  };

  const statItemWidth = isDesktop ? '23.8%' : isNarrow ? '100%' : '48%';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Good morning, Inspector"
        subtitle="PMU Field Unit • Delhi NCR Division"
      />

      {loading ? (
        <LoadingState message="Synchronizing field inspection roster..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
          }
        >
          {/* Summary Stat Cards */}
          <SectionHeader
            title="Inspection Schedule Overview"
            subtitle="Current assignment workload and deadlines"
          />

          <View style={styles.statsGrid}>
            <StatCard
              label="Assigned Inspections"
              value={stats.assignedInspections}
              iconName="clipboard"
              variant="primary"
              subtitle="Active docket"
              style={[styles.statGridItem, { width: statItemWidth }]}
            />
            <StatCard
              label="Today's Tasks"
              value={stats.todaysTasks}
              iconName="today"
              variant="warning"
              subtitle="Scheduled for today"
              style={[styles.statGridItem, { width: statItemWidth }]}
            />
            <StatCard
              label="High Priority"
              value={stats.highPriority}
              iconName="flash"
              variant="highPriority"
              subtitle="Surprise / Urgent"
              style={[styles.statGridItem, { width: statItemWidth }]}
            />
            <StatCard
              label="Completed"
              value={stats.completedThisMonth}
              iconName="checkmark-done-circle"
              variant="normal"
              subtitle="Submitted audits"
              style={[styles.statGridItem, { width: statItemWidth }]}
            />
          </View>

          {/* Assigned Field Inspections */}
          <SectionHeader
            title="Assigned Field Audits"
            subtitle="Verify physical attendance, facilities, and capture evidence"
            badgeCount={inspections.length}
          />

          {inspections.map((assignment) => (
            <InspectionCard key={assignment.id} inspection={assignment} />
          ))}
        </ScrollView>
      )}
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
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statGridItem: {
    marginBottom: spacing.md,
  },
});
