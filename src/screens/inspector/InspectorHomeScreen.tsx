import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { StatCard } from '../../components/common/StatCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { InspectionCard } from '../../components/cards/InspectionCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { mockAssignmentService } from '../../services/mock/mockAssignmentService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const InspectorHomeScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const isDesktop = width >= 900;

  const { currentUser, switchInspectorProfile } = useAuth();
  const activeOfficerId = currentUser?.id || 'USR-INSP-DEMO-004';
  const activeBadgeId = currentUser?.badgeId || 'PMU-DEMO-004';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState<'MY' | 'ALL'>('MY');
  const [ackNotice, setAckNotice] = useState<string | null>(null);

  const [stats, setStats] = useState({
    assignedInspections: 0,
    todaysTasks: 0,
    highPriority: 0,
    completedThisMonth: 11,
  });
  const [allInspections, setAllInspections] = useState<InspectionAssignment[]>([]);

  const loadInspectorData = useCallback(async () => {
    try {
      const [statsData, assignmentsData] = await Promise.all([
        mockInspectionService.getInspectorStats(activeBadgeId),
        mockInspectionService.getAssignedInspections(),
      ]);
      setStats(statsData);
      setAllInspections(assignmentsData);
    } catch (error) {
      console.error('Error loading inspector data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeBadgeId]);

  useEffect(() => {
    loadInspectorData();
  }, [loadInspectorData, currentUser]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInspectorData();
  };

  const handleSwitchOfficer = async () => {
    const nextKey = activeBadgeId === 'PMU-DEMO-004' ? 'inspector_b' : 'inspector_a';
    setLoading(true);
    await switchInspectorProfile(nextKey);
  };

  const handleAcknowledge = async (inspectionId: string) => {
    try {
      const updated = await mockAssignmentService.acknowledgeAssignment(
        inspectionId,
        activeOfficerId,
        currentUser?.name || 'Demo Field Inspector',
        activeBadgeId
      );
      if (updated) {
        setAckNotice(`Inspection #${inspectionId} acknowledged. Field visit dispatch confirmed.`);
        setTimeout(() => setAckNotice(null), 4000);
        await loadInspectorData();
      }
    } catch (err) {
      console.error('Error acknowledging inspection:', err);
    }
  };

  // Filter based on whether user wants to see only their assigned inspections or the full roster
  const displayedInspections = allInspections.filter((i) => {
    if (filterMode === 'MY') {
      return (
        i.assignedOfficerId === activeOfficerId ||
        i.assignedOfficerDemoId === activeBadgeId ||
        i.assignedOfficerName.toLowerCase() === (currentUser?.name || '').toLowerCase()
      );
    }
    return true;
  });

  const myCount = allInspections.filter(
    (i) =>
      i.assignedOfficerId === activeOfficerId ||
      i.assignedOfficerDemoId === activeBadgeId ||
      i.assignedOfficerName.toLowerCase() === (currentUser?.name || '').toLowerCase()
  ).length;

  const statItemWidth = isDesktop ? '23.8%' : isNarrow ? '100%' : '48%';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title={`Good morning, ${currentUser?.name ? currentUser.name.replace('Demo ', '') : 'Inspector'}`}
        subtitle={`${currentUser?.department || 'PMU Field Inspection Wing'} • ${currentUser?.assignedLocation || 'Delhi NCR'}`}
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
          {/* Active Officer Identity & Switch Banner */}
          <View style={styles.officerIdentityBanner}>
            <View style={styles.identityLeft}>
              <View style={styles.identityBadge}>
                <Ionicons name="person-circle" size={24} color={colors.brand.primary} />
              </View>
              <View style={styles.identityTextCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.identityName}>{currentUser?.name || 'Field Inspector'}</Text>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{activeBadgeId}</Text>
                  </View>
                </View>
                <Text style={styles.identityJurisdiction}>
                  {currentUser?.assignedLocation || 'Delhi NCR'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.switchOfficerBtn}
              onPress={handleSwitchOfficer}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={14} color={colors.brand.primary} style={{ marginRight: 4 }} />
              <Text style={styles.switchOfficerBtnText}>
                {activeBadgeId === 'PMU-DEMO-004' ? 'Switch to Inspector B' : 'Switch to Inspector A'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Acknowledgment Alert Toast */}
          {ackNotice && (
            <View style={styles.ackToast}>
              <Ionicons name="checkmark-circle" size={18} color={colors.status.normal} />
              <Text style={styles.ackToastText}>{ackNotice}</Text>
            </View>
          )}

          {/* Summary Stat Cards */}
          <SectionHeader
            title="Inspection Schedule Overview"
            subtitle="Current assignment workload and deadlines"
          />

          <View style={styles.statsGrid}>
            <StatCard
              label="My Assigned Inspections"
              value={myCount}
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

          {/* Assigned Field Inspections Header & Filter */}
          <View style={styles.rosterHeaderRow}>
            <SectionHeader
              title="Field Inspection Orders"
              subtitle="Physical verification, attendance audits, and geofenced evidence"
              badgeCount={displayedInspections.length}
            />

            <View style={styles.filterChipRow}>
              <TouchableOpacity
                style={[styles.rosterFilterChip, filterMode === 'MY' && styles.rosterFilterChipActive]}
                onPress={() => setFilterMode('MY')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.rosterFilterChipText,
                    filterMode === 'MY' && styles.rosterFilterChipTextActive,
                  ]}
                >
                  My Queue ({myCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rosterFilterChip, filterMode === 'ALL' && styles.rosterFilterChipActive]}
                onPress={() => setFilterMode('ALL')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.rosterFilterChipText,
                    filterMode === 'ALL' && styles.rosterFilterChipTextActive,
                  ]}
                >
                  All PMU Orders ({allInspections.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {displayedInspections.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={36} color={colors.text.muted} />
              <Text style={styles.emptyStateTitle}>No assignments in this queue</Text>
              <Text style={styles.emptyStateDesc}>
                {filterMode === 'MY'
                  ? 'No inspections currently assigned to this inspector. Switch to another inspector or view all PMU orders.'
                  : 'No field inspections found in roster.'}
              </Text>
            </View>
          ) : (
            displayedInspections.map((assignment) => (
              <InspectionCard
                key={assignment.id}
                inspection={assignment}
                isInspectorView={true}
                onAcknowledge={() => handleAcknowledge(assignment.id)}
              />
            ))
          )}
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
  officerIdentityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
    ...shadows.xs,
  },
  identityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 200,
  },
  identityBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  identityName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  badgePill: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  identityJurisdiction: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  switchOfficerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  switchOfficerBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  ackToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  ackToastText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.status.normal,
    flex: 1,
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
  rosterHeaderRow: {
    marginBottom: spacing.xs,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },
  rosterFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
  },
  rosterFilterChipActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  rosterFilterChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  rosterFilterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  emptyStateDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
    lineHeight: 16,
  },
});
