/**
 * OfficialHomeScreen
 * Government Official / MoSJE Monitoring Dashboard.
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
import { useNavigation } from '@react-navigation/native';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { StatCard } from '../../components/common/StatCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { AlertCard } from '../../components/cards/AlertCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { Project, ProjectStatsSummary } from '../../types/project';
import { AnomalyAlert } from '../../types/alert';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const OfficialHomeScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'Dashboard'>>();
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ProjectStatsSummary | null>(null);
  const [priorityProjects, setPriorityProjects] = useState<Project[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<AnomalyAlert[]>([]);

  const loadDashboardData = async () => {
    try {
      const [statsData, projectsData, alertsData] = await Promise.all([
        mockProjectService.getOfficialStats(),
        mockProjectService.getPriorityProjects(),
        mockAlertService.getPendingAlerts(),
      ]);
      setStats(statsData);
      setPriorityProjects(projectsData.slice(0, 3));
      setCriticalAlerts(alertsData.slice(0, 1));
    } catch (error) {
      console.error('Error loading official dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const statItemWidth = isDesktop ? '23.8%' : isNarrow ? '100%' : '48%';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Good morning, Official"
        subtitle="National Monitoring Division • Central Desk"
      />

      {loading ? (
        <LoadingState message="Connecting to MoSJE telemetry stream..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.primary]} />
          }
        >
          {/* Summary Stat Cards Grid */}
          <SectionHeader
            title="National Telemetry Overview"
            subtitle="Real-time aggregate status across institutes"
          />

          <View style={styles.statsGrid}>
            <StatCard
              label="Projects Monitored"
              value={stats?.totalProjects ?? 148}
              iconName="business"
              variant="primary"
              subtitle="Registered institutes"
              onPress={() => navigation.navigate('Monitoring')}
              style={[styles.statGridItem, { width: statItemWidth }]}
            />
            <StatCard
              label="Alerts Requiring Review"
              value={stats?.highPriorityCount ?? 6}
              iconName="alert-circle"
              variant="highPriority"
              subtitle="Human review needed"
              onPress={() => navigation.navigate('Alerts')}
              style={[styles.statGridItem, { width: statItemWidth }]}
            />
            <StatCard
              label="Pending Inspections"
              value={stats?.pendingInspectionsCount ?? 14}
              iconName="clipboard"
              variant="warning"
              subtitle="Field audits pending"
              onPress={() => navigation.navigate('Inspections')}
              style={[styles.statGridItem, { width: statItemWidth }]}
            />
            <StatCard
              label="CCTV Status"
              value={`${stats?.activeCCTVCount ?? 139}/148`}
              iconName="videocam"
              variant="normal"
              subtitle="93.9% active cameras"
              onPress={() => navigation.navigate('Monitoring')}
              style={[styles.statGridItem, { width: statItemWidth }]}
            />
          </View>

          {/* Critical Human Review Alert Banner */}
          {criticalAlerts.length > 0 && (
            <>
              <SectionHeader
                title="Immediate Review Required"
                subtitle="Rule check anomaly detected from biometric & video streams"
              />
              {criticalAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onPress={() => navigation.navigate('AlertReview', { alertId: alert.id })}
                />
              ))}
            </>
          )}

          {/* Priority Attention Section */}
          <SectionHeader
            title="Priority Attention"
            subtitle="Institutes flagged for high variance or inspection due dates"
            badgeCount={priorityProjects.length}
          />

          {priorityProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id })}
            />
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
