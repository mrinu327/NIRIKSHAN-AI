/**
 * InspectorHomeScreen
 * SIH26095 | MoSJE PMU Field Inspection Officer Workflow
 *
 * Operational field inspection workspace for PMU officers:
 * - Active officer credentials and profile switcher
 * - Current assigned inspection hero card with rapid action dispatch
 * - Inspection schedule overview statistics
 * - Filterable roster of assigned field orders (My Queue vs All PMU Orders)
 * Fully responsive for mobile and desktop viewports.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { InspectorTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { StatCard } from '../../components/common/StatCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { InspectionCard } from '../../components/cards/InspectionCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { mockAssignmentService } from '../../services/mock/mockAssignmentService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const InspectorHomeScreen: React.FC = () => {
  const navigation = useNavigation<InspectorTabNavigationProp<'Home'>>();
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

  // Entrance animations
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  // Skeleton pulse animation
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Toast animation
  const toastFade = useRef(new Animated.Value(0)).current;
  const toastSlide = useRef(new Animated.Value(-8)).current;

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
    if (ackNotice) {
      toastFade.setValue(0);
      toastSlide.setValue(-8);
      Animated.parallel([
        Animated.timing(toastFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastSlide, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [ackNotice]);

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
    const unsubscribe = navigation.addListener('focus', () => {
      loadInspectorData();
    });
    return unsubscribe;
  }, [navigation, loadInspectorData, currentUser]);

  useEffect(() => {
    if (!loading) {
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
  }, [loading]);

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

  // The primary current assigned inspection to highlight as Hero Card
  const currentAssignedInspection =
    displayedInspections.find(
      (i) =>
        i.status === 'In Progress' ||
        i.status === 'Accepted / Acknowledged' ||
        i.status === 'Assigned'
    ) || displayedInspections[0];

  const statItemWidth = isDesktop ? '23.8%' : isNarrow ? '100%' : '48%';

  const headerTitle = `Good morning, ${currentUser?.name ? currentUser.name.replace('Demo ', '') : 'Inspector'}`;
  const headerSubtitle = `${currentUser?.department || 'PMU Field Inspection Wing'} • ${currentUser?.assignedLocation || 'Delhi NCR'}`;

  // Skeleton loading screen
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title={headerTitle} subtitle={headerSubtitle} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Identity Skeleton */}
          <View style={styles.skeletonCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Animated.View style={[styles.skeletonCircle, { opacity: skeletonPulse }]} />
              <View style={{ flex: 1, gap: 6 }}>
                <Animated.View style={[styles.skeletonLine, { width: 140, height: 16, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonLine, { width: 90, height: 12, opacity: skeletonPulse }]} />
              </View>
            </View>
          </View>

          {/* Hero Card Skeleton */}
          <View style={[styles.skeletonCard, { marginTop: spacing.sm }]}>
            <Animated.View style={[styles.skeletonLine, { width: 200, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '80%', height: 24, marginTop: 12, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '60%', height: 14, marginTop: 8, opacity: skeletonPulse }]} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <Animated.View style={[styles.skeletonBox, { width: '30%', height: 40, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonBox, { width: '30%', height: 40, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonBox, { width: '30%', height: 40, opacity: skeletonPulse }]} />
            </View>
            <Animated.View style={[styles.skeletonLine, { width: '100%', height: 44, marginTop: 16, borderRadius: borderRadius.md, opacity: skeletonPulse }]} />
          </View>

          {/* Stats Grid Skeleton */}
          <View style={styles.statsGrid}>
            <Animated.View style={[styles.skeletonStatBox, { width: statItemWidth, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonStatBox, { width: statItemWidth, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonStatBox, { width: statItemWidth, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonStatBox, { width: statItemWidth, opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader title={headerTitle} subtitle={headerSubtitle} />

      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          },
        ]}
      >
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
                <Ionicons name="person-circle" size={26} color={colors.brand.primary} />
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
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Switch active inspector profile"
            >
              <Ionicons name="swap-horizontal" size={15} color={colors.brand.primary} style={{ marginRight: 5 }} />
              <Text style={styles.switchOfficerBtnText}>
                {activeBadgeId === 'PMU-DEMO-004' ? 'Switch to Inspector B' : 'Switch to Inspector A'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Acknowledgment Alert Toast */}
          {ackNotice && (
            <Animated.View
              style={[
                styles.ackToast,
                {
                  opacity: toastFade,
                  transform: [{ translateY: toastSlide }],
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.status.normal} />
              <Text style={styles.ackToastText}>{ackNotice}</Text>
            </Animated.View>
          )}

          {/* Current Assigned Inspection Hero Card (Phase 3 Requirement) */}
          {currentAssignedInspection && (
            <View
              style={[
                styles.heroCard,
                currentAssignedInspection.priority === 'HIGH' && styles.heroCardHighPriority,
              ]}
            >
              <View style={styles.heroHeader}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.liveIndicator}>
                    <View style={styles.livePulse} />
                    <Text style={styles.heroHeaderTag}>CURRENT ASSIGNED INSPECTION</Text>
                  </View>
                  <StatusBadge
                    label={currentAssignedInspection.status}
                    variant={
                      currentAssignedInspection.status === 'Submitted / Awaiting Review'
                        ? 'info'
                        : currentAssignedInspection.status === 'Accepted / Acknowledged'
                        ? 'normal'
                        : 'warning'
                    }
                    size="sm"
                  />
                </View>
                <Text style={styles.heroInspectionId}>Order #{currentAssignedInspection.id}</Text>
              </View>

              <Text style={styles.heroProjectName}>{currentAssignedInspection.projectName}</Text>

              <View style={styles.heroMetaGrid}>
                <View style={styles.heroMetaItem}>
                  <Text style={styles.heroMetaLabel}>Priority</Text>
                  <PriorityBadge priority={currentAssignedInspection.priority} />
                </View>

                <View style={styles.heroMetaItem}>
                  <Text style={styles.heroMetaLabel}>Type</Text>
                  <Text style={styles.heroMetaValue}>{currentAssignedInspection.type}</Text>
                </View>

                <View style={styles.heroMetaItem}>
                  <Text style={styles.heroMetaLabel}>Assigned Time</Text>
                  <Text style={styles.heroMetaValue}>
                    {currentAssignedInspection.assignmentTimestamp || currentAssignedInspection.assignedDate}
                  </Text>
                </View>
              </View>

              <View style={styles.heroAddressRow}>
                <Ionicons name="location-outline" size={16} color={colors.brand.primary} style={{ marginTop: 1 }} />
                <Text style={styles.heroAddressText} numberOfLines={2}>
                  {currentAssignedInspection.projectAddress}
                </Text>
              </View>

              {/* Surprise Dispatch Tag */}
              {(currentAssignedInspection.type === 'Surprise Inspection' || currentAssignedInspection.isSurprise) && (
                <View style={styles.surpriseDispatchBadge}>
                  <Ionicons name="flash" size={12} color={colors.status.highPriority} />
                  <Text style={styles.surpriseDispatchText}>SURPRISE DISPATCH — CONFIDENTIAL PROTOCOL</Text>
                </View>
              )}

              {/* Security Verification Status Strip */}
              <View style={styles.heroVerificationStrip}>
                <View style={styles.verificationTag}>
                  <Ionicons
                    name={
                      currentAssignedInspection.isLocationVerified
                        ? 'checkmark-circle'
                        : currentAssignedInspection.geofenceStatus === 'OVERRIDDEN'
                        ? 'shield-checkmark'
                        : 'location-outline'
                    }
                    size={12}
                    color={
                      currentAssignedInspection.isLocationVerified
                        ? colors.status.normal
                        : currentAssignedInspection.geofenceStatus === 'OVERRIDDEN'
                        ? colors.brand.primary
                        : colors.status.warning
                    }
                  />
                  <Text
                    style={[
                      styles.verificationTagText,
                      currentAssignedInspection.isLocationVerified && styles.verificationTagSuccess,
                      currentAssignedInspection.geofenceStatus === 'OVERRIDDEN' && styles.verificationTagInfo,
                    ]}
                  >
                    {currentAssignedInspection.isLocationVerified
                      ? '100m Geofence Verified'
                      : currentAssignedInspection.geofenceStatus === 'OVERRIDDEN'
                      ? 'Exemption Active'
                      : 'Geofence Check Pending'}
                  </Text>
                </View>

                <View style={styles.verificationTag}>
                  <Ionicons
                    name={
                      currentAssignedInspection.isBiometricVerified
                        ? 'finger-print'
                        : 'finger-print-outline'
                    }
                    size={12}
                    color={
                      currentAssignedInspection.isBiometricVerified
                        ? colors.status.normal
                        : colors.text.muted
                    }
                  />
                  <Text
                    style={[
                      styles.verificationTagText,
                      currentAssignedInspection.isBiometricVerified && styles.verificationTagSuccess,
                    ]}
                  >
                    {currentAssignedInspection.isBiometricVerified
                      ? 'Biometrics Verified'
                      : 'Biometrics Required'}
                  </Text>
                </View>
              </View>

              {currentAssignedInspection.triggerReason ? (
                <View style={styles.heroTriggerBox}>
                  <Ionicons name="information-circle-outline" size={13} color={colors.brand.navyLight} />
                  <Text style={styles.heroTriggerText} numberOfLines={2}>
                    Reason: {currentAssignedInspection.triggerReason}
                  </Text>
                </View>
              ) : null}

              <View style={styles.heroActionRow}>
                <PrimaryButton
                  title={
                    currentAssignedInspection.status === 'Submitted / Awaiting Review'
                      ? 'View Submitted Inspection'
                      : currentAssignedInspection.status === 'In Progress'
                      ? 'Resume Inspection'
                      : 'Open Inspection'
                  }
                  iconName={
                    currentAssignedInspection.status === 'Submitted / Awaiting Review'
                      ? 'eye-outline'
                      : 'play-circle'
                  }
                  onPress={() =>
                    navigation.navigate('InspectionOverview', {
                      inspectionId: currentAssignedInspection.id,
                    })
                  }
                  style={styles.heroPrimaryBtn}
                />
              </View>
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
              subtitle="View audit history"
              onPress={() => navigation.navigate('InspectionHistory')}
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
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Filter by My Queue"
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
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Filter by All PMU Orders"
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
                onOpenInspection={() =>
                  navigation.navigate('InspectionOverview', { inspectionId: assignment.id })
                }
                onPress={() =>
                  navigation.navigate('InspectionOverview', { inspectionId: assignment.id })
                }
                onAcknowledge={() => handleAcknowledge(assignment.id)}
              />
            ))
          )}
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
  scrollContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: 90,
  },

  /* Active Officer Identity Banner */
  officerIdentityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    letterSpacing: 0.3,
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
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 8,
    minHeight: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
  },
  switchOfficerBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },

  /* Acknowledgment Toast */
  ackToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs + 2,
    ...shadows.xs,
  },
  ackToastText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.status.normal,
    flex: 1,
  },

  /* Current Assigned Inspection Hero Card */
  heroCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.brand.primary,
    borderWidth: 1,
    borderLeftWidth: 5,
    borderLeftColor: colors.brand.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  heroCardHighPriority: {
    borderLeftColor: colors.status.highPriority,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: 6,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flexWrap: 'wrap',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.brand.accent,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    gap: 5,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.primary,
  },
  heroHeaderTag: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.6,
  },
  heroInspectionId: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
  },
  heroProjectName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    marginVertical: 4,
    lineHeight: 24,
  },
  heroMetaGrid: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    gap: 12,
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  heroMetaItem: {
    minWidth: '28%',
    flex: 1,
  },
  heroMetaLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  heroMetaValue: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  heroAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    marginBottom: spacing.md,
    gap: 6,
  },
  heroAddressText: {
    fontSize: typography.sizes.xs + 1,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  surpriseDispatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.status.highPriorityLight,
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: spacing.xs + 2,
    alignSelf: 'flex-start',
  },
  surpriseDispatchText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    letterSpacing: 0.4,
  },
  heroVerificationStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: spacing.xs + 2,
  },
  verificationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  verificationTagText: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  verificationTagSuccess: {
    color: colors.status.normal,
    fontWeight: typography.weights.bold,
  },
  verificationTagInfo: {
    color: colors.brand.primary,
    fontWeight: typography.weights.bold,
  },
  heroTriggerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.status.infoBorder,
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: spacing.xs + 2,
  },
  heroTriggerText: {
    fontSize: 11,
    color: colors.brand.navyLight,
    flex: 1,
    lineHeight: 15,
  },
  heroActionRow: {
    marginTop: 2,
  },
  heroPrimaryBtn: {
    minHeight: 48,
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statGridItem: {
    marginBottom: spacing.md,
  },

  /* Roster Header & Filter Chips */
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rosterFilterChipActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  rosterFilterChipText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  rosterFilterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },

  /* Empty State */
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

  /* Skeleton Loading Styles */
  skeletonCard: {
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
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.border,
  },
  skeletonBox: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
  },
  skeletonStatBox: {
    height: 100,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
});
