/**
 * AssignmentsPlaceholderScreen
 * SIH26095 | MoSJE PMU Field Assignments Workspace
 *
 * Operational docket for PMU inspection officers:
 * - Real-time active inspection assignment queue
 * - Status-based visual hierarchy with rapid on-site action dispatch
 * - Immediate acknowledgement protocol with feedback toast
 * - Responsive single-column layout for mobile and tablet/desktop
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { InspectorTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { InspectionCard } from '../../components/cards/InspectionCard';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { mockAssignmentService } from '../../services/mock/mockAssignmentService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const AssignmentsPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<InspectorTabNavigationProp<'Assignments'>>();
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const isDesktop = width >= 900;

  const { currentUser } = useAuth();
  const activeOfficerId = currentUser?.id || 'USR-INSP-DEMO-004';
  const activeBadgeId = currentUser?.badgeId || 'PMU-DEMO-004';

  type FilterType = 'ALL' | 'TODAY' | 'PENDING' | 'COMPLETED' | 'SURPRISE';
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [assignments, setAssignments] = useState<InspectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animations
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;
  const toastFade = useRef(new Animated.Value(0)).current;
  const toastSlide = useRef(new Animated.Value(-8)).current;

  // Stagger animations for first 5 cards
  const cardAnims = useRef<Animated.Value[]>(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;

  // Pulsing skeleton animation loop
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

  // Toast notification animation
  useEffect(() => {
    if (toastMessage) {
      toastFade.setValue(0);
      toastSlide.setValue(-8);
      Animated.parallel([
        Animated.timing(toastFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(toastSlide, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(toastFade, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setToastMessage(null));
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadAssignments = useCallback(async () => {
    try {
      const data = await mockInspectionService.getAssignedInspections();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
    const unsubscribe = navigation.addListener('focus', () => {
      loadAssignments();
    });
    return unsubscribe;
  }, [navigation, loadAssignments, currentUser]);

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
        Animated.stagger(
          50,
          cardAnims.map((anim) =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 240,
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    }
  }, [loading]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
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
        setToastMessage(`Assignment #${inspectionId} acknowledged for field visit.`);
        await loadAssignments();
      }
    } catch (err) {
      console.error('Error acknowledging assignment:', err);
    }
  };

  // Clean presentation labels
  const officerName = currentUser?.name ? currentUser.name.replace('Demo ', '') : 'Inspector';
  const badgeLabel = activeBadgeId.replace('DEMO-', '');
  const headerSubtitle = `Logged in as ${officerName} (${badgeLabel})`;

  // Skeleton Loader matching actual InspectionCard layout
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Field Assignments" subtitle={headerSubtitle} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Skeleton Section Header */}
          <View style={{ marginBottom: spacing.md }}>
            <Animated.View style={[styles.skeletonLine, { width: 200, height: 18, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 260, height: 13, marginTop: 6, opacity: skeletonPulse }]} />
          </View>

          {/* 3 Skeleton Cards */}
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Animated.View style={[styles.skeletonLine, { width: 110, height: 16, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonLine, { width: 70, height: 14, opacity: skeletonPulse }]} />
              </View>
              <Animated.View style={[styles.skeletonLine, { width: '80%', height: 20, marginTop: 12, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonLine, { width: '60%', height: 13, marginTop: 6, opacity: skeletonPulse }]} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Animated.View style={[styles.skeletonBox, { flex: 1, height: 42, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonBox, { flex: 1, height: 42, opacity: skeletonPulse }]} />
              </View>
              <Animated.View
                style={[
                  styles.skeletonLine,
                  { width: '100%', height: 44, marginTop: 14, borderRadius: borderRadius.sm, opacity: skeletonPulse },
                ]}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Filtered assignments calculation
  const filteredAssignments = assignments.filter((a) => {
    switch (activeFilter) {
      case 'TODAY':
        return (
          a.dueDate.toLowerCase().includes('today') ||
          a.assignedDate.toLowerCase().includes('today')
        );
      case 'PENDING':
        return (
          a.status === 'Assigned' ||
          a.status === 'In Progress' ||
          a.status === 'Accepted / Acknowledged'
        );
      case 'COMPLETED':
        return (
          a.status === 'Completed' ||
          a.status === 'Submitted / Awaiting Review'
        );
      case 'SURPRISE':
        return a.type === 'Surprise Inspection' || Boolean(a.isSurprise);
      case 'ALL':
      default:
        return true;
    }
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader title="Field Assignments" subtitle={headerSubtitle} />

      {/* Floating Confirmation Toast */}
      {toastMessage && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastFade,
              transform: [{ translateY: toastSlide }],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color={colors.status.normal} />
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMessage}
          </Text>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brand.primary]}
            tintColor={colors.brand.primary}
          />
        }
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          }}
        >
          <SectionHeader
            title="Active Inspection Orders"
            subtitle="Follow MoSJE protocol during on-site visit"
            badgeCount={filteredAssignments.length}
          />

          {/* Filter Chips Bar */}
          <View style={styles.filterBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {[
                { key: 'ALL', label: `All (${assignments.length})` },
                {
                  key: 'TODAY',
                  label: `Today (${assignments.filter((a) => a.dueDate.toLowerCase().includes('today') || a.assignedDate.toLowerCase().includes('today')).length})`,
                },
                {
                  key: 'PENDING',
                  label: `Pending (${assignments.filter((a) => a.status === 'Assigned' || a.status === 'In Progress' || a.status === 'Accepted / Acknowledged').length})`,
                },
                {
                  key: 'COMPLETED',
                  label: `Completed (${assignments.filter((a) => a.status === 'Completed' || a.status === 'Submitted / Awaiting Review').length})`,
                },
                {
                  key: 'SURPRISE',
                  label: `⚡ Surprise (${assignments.filter((a) => a.type === 'Surprise Inspection' || Boolean(a.isSurprise)).length})`,
                },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.filterChip,
                    activeFilter === tab.key && styles.filterChipActive,
                    tab.key === 'SURPRISE' && activeFilter === tab.key && styles.filterChipSurprise,
                  ]}
                  onPress={() => setActiveFilter(tab.key as FilterType)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === tab.key && styles.filterChipTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dedicated Inspection History Shortcut Banner */}
          {activeFilter === 'COMPLETED' && (
            <TouchableOpacity
              style={styles.historyBanner}
              onPress={() => navigation.navigate('InspectionHistory')}
              activeOpacity={0.8}
            >
              <View style={styles.historyBannerLeft}>
                <Ionicons name="time" size={18} color={colors.brand.primary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.historyBannerTitle}>Inspection History Archive</Text>
                  <Text style={styles.historyBannerSub}>
                    Browse all submitted audit dockets with verified SHA-256 evidence
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.brand.primary} />
            </TouchableOpacity>
          )}

          {filteredAssignments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="clipboard-outline"
                size={44}
                color={colors.text.muted}
                style={{ marginBottom: spacing.sm }}
              />
              <Text style={styles.emptyTitle}>No Matching Inspection Orders</Text>
              <Text style={styles.emptySubtitle}>
                There are currently no inspection assignments matching the selected filter.
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => setActiveFilter('ALL')}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={16} color={colors.brand.primary} style={{ marginRight: 6 }} />
                <Text style={styles.refreshButtonText}>View All Assignments</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredAssignments.map((assignment, index) => {
              const cardAnim = cardAnims[index] || new Animated.Value(1);
              const isHistorical =
                assignment.status === 'Completed' ||
                assignment.status === 'Submitted / Awaiting Review';
              return (
                <Animated.View
                  key={assignment.id}
                  style={{
                    opacity: cardAnim,
                    transform: [
                      {
                        translateY: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [12, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <InspectionCard
                    inspection={assignment}
                    isInspectorView={true}
                    onAcknowledge={() => handleAcknowledge(assignment.id)}
                    onOpenInspection={() =>
                      isHistorical
                        ? navigation.navigate('InspectionReview', { inspectionId: assignment.id })
                        : navigation.navigate('InspectionOverview', { inspectionId: assignment.id })
                    }
                    onPress={() =>
                      isHistorical
                        ? navigation.navigate('InspectionReview', { inspectionId: assignment.id })
                        : navigation.navigate('InspectionOverview', { inspectionId: assignment.id })
                    }
                  />
                </Animated.View>
              );
            })
          )}
        </Animated.View>
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
    paddingBottom: spacing.xxxl + 32,
  },

  // Floating Toast
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: spacing.base,
    right: spacing.base,
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.status.normal,
    ...shadows.md,
    zIndex: 9999,
  },
  toastText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },

  // Filter Tabs Bar
  filterBar: {
    marginBottom: spacing.base,
    marginTop: -spacing.xs,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterChipSurprise: {
    backgroundColor: colors.status.highPriority,
    borderColor: colors.status.highPriority,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },

  // History Banner
  historyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.brand.primary,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  historyBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  historyBannerTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  historyBannerSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Empty State
  emptyContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.xs,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  refreshButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },

  // Skeleton Styles
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
});
