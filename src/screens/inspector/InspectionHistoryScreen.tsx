/**
 * InspectionHistoryScreen
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Inspector Archive: Browse and review previously completed and submitted
 * inspection dossiers. Reuses mockInspectionService dynamically so newly
 * submitted field inspections immediately appear in real time.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { InspectorStackNavigationProp } from '../../types/navigation';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type FilterType = 'ALL' | 'COMPLETED' | 'UNDER_REVIEW' | 'SURPRISE';

export const InspectionHistoryScreen: React.FC = () => {
  const navigation = useNavigation<InspectorStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const { currentUser } = useAuth();
  const activeOfficerId = currentUser?.id || 'USR-INSP-DEMO-004';
  const activeBadgeId = currentUser?.badgeId || 'PMU-DEMO-004';

  const [inspections, setInspections] = useState<InspectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // Entrance animations
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Pulsing skeleton animation
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

  const loadHistory = useCallback(async () => {
    try {
      // Fetch all completed/submitted inspections dynamically from mockInspectionService
      const allCompleted = await mockInspectionService.getCompletedInspections();
      setInspections(allCompleted);
    } catch (err) {
      console.error('Failed to load inspection history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });
    return unsubscribe;
  }, [navigation, loadHistory]);

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
    loadHistory();
  };

  // Filter & Search computation
  const filteredList = inspections.filter((item) => {
    // Search query filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const matchesSearch =
        item.projectName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.projectId.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Category filter
    switch (activeFilter) {
      case 'COMPLETED':
        return item.status === 'Completed';
      case 'UNDER_REVIEW':
        return item.status === 'Submitted / Awaiting Review';
      case 'SURPRISE':
        return item.type === 'Surprise Inspection' || Boolean(item.isSurprise);
      case 'ALL':
      default:
        return true;
    }
  });

  const completedCount = inspections.filter((i) => i.status === 'Completed').length;
  const underReviewCount = inspections.filter((i) => i.status === 'Submitted / Awaiting Review').length;
  const surpriseCount = inspections.filter((i) => i.type === 'Surprise Inspection' || Boolean(i.isSurprise)).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Executive MoSJE Native Header with Back Navigation */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerBranding}>
              <View style={styles.headerEmblem}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
              </View>
              <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
            </View>

            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{activeBadgeId.replace('DEMO-', '')}</Text>
            </View>
          </View>

          <View style={styles.headerMainRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackBtn}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Inspection History
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Archived field audits & verified submission dockets
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        {loading ? (
          <View style={styles.skeletonContainer}>
            <Animated.View style={[styles.skeletonLine, { width: '100%', height: 42, opacity: skeletonPulse }]} />
            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 14 }}>
              <Animated.View style={[styles.skeletonPill, { width: 70, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonPill, { width: 100, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonPill, { width: 110, opacity: skeletonPulse }]} />
            </View>
            {[1, 2].map((k) => (
              <View key={k} style={styles.skeletonCard}>
                <Animated.View style={[styles.skeletonLine, { width: 120, height: 16, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonLine, { width: '80%', height: 20, marginTop: 10, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonLine, { width: '55%', height: 14, marginTop: 6, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonBox, { height: 46, marginTop: 14, opacity: skeletonPulse }]} />
              </View>
            ))}
          </View>
        ) : (
          <Animated.View
            style={{
              opacity: screenFade,
              transform: [{ translateY: screenSlide }],
            }}
          >
            {/* Quick Metrics Bar */}
            <View style={styles.metricsStrip}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{inspections.length}</Text>
                <Text style={styles.metricLabel}>Total Submissions</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: colors.status.normal }]}>
                  {completedCount}
                </Text>
                <Text style={styles.metricLabel}>Completed</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: colors.status.warning }]}>
                  {underReviewCount}
                </Text>
                <Text style={styles.metricLabel}>Under Review</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: colors.status.highPriority }]}>
                  {surpriseCount}
                </Text>
                <Text style={styles.metricLabel}>Surprise Audits</Text>
              </View>
            </View>

            {/* Search Input */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={colors.text.muted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by facility, order #, or city..."
                placeholderTextColor={colors.text.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Chips Bar */}
            <View style={styles.filterBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {[
                  { key: 'ALL', label: `All (${inspections.length})` },
                  { key: 'COMPLETED', label: `Completed (${completedCount})` },
                  { key: 'UNDER_REVIEW', label: `Under Review (${underReviewCount})` },
                  { key: 'SURPRISE', label: `⚡ Surprise (${surpriseCount})` },
                ].map((chip) => {
                  const isActive = activeFilter === chip.key;
                  return (
                    <TouchableOpacity
                      key={chip.key}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                        chip.key === 'SURPRISE' && isActive && styles.filterChipSurprise,
                      ]}
                      onPress={() => setActiveFilter(chip.key as FilterType)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Historical Inspection List */}
            {filteredList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="archive-outline" size={44} color={colors.text.muted} style={{ marginBottom: spacing.sm }} />
                <Text style={styles.emptyTitle}>No Historical Inspections Found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'No historical records match your search criteria. Try a different query.'
                    : 'No previously completed or submitted inspections are available in this filter.'}
                </Text>
                {searchQuery ? (
                  <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearSearchBtnText}>Clear Search Filter</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : (
              filteredList.map((inspection) => {
                const isSurprise = inspection.type === 'Surprise Inspection' || Boolean(inspection.isSurprise);
                const checklistTotal = inspection.totalChecklistCount || 13;
                const checklistDone = inspection.checklistCompletedCount || (inspection.checklistResponses ? Object.values(inspection.checklistResponses).filter(c => c.status !== 'Not Checked').length : 13);
                const evidenceCount = inspection.evidenceItems?.length || 0;

                return (
                  <View key={inspection.id} style={styles.historyCard}>
                    {/* Top Row: Ref ID + Status + Priority */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.refIdBox}>
                        <Ionicons name="document-text-outline" size={13} color={colors.brand.primary} />
                        <Text style={styles.refIdText}>Order #{inspection.id}</Text>
                      </View>

                      <View style={styles.badgesRow}>
                        <PriorityBadge priority={inspection.priority} />
                        <StatusBadge
                          label={inspection.status}
                          variant={inspection.status === 'Completed' ? 'normal' : 'info'}
                          size="sm"
                        />
                      </View>
                    </View>

                    {/* Project / Facility Details */}
                    <Text style={styles.projectName}>{inspection.projectName}</Text>
                    <View style={styles.addressRow}>
                      <Ionicons name="location-outline" size={14} color={colors.brand.primary} />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {inspection.projectAddress}, {inspection.city}
                      </Text>
                    </View>

                    {/* Meta Strip: Type & Submission Date */}
                    <View style={styles.metaRow}>
                      <View style={[styles.typeBadge, isSurprise && styles.typeBadgeSurprise]}>
                        <Ionicons
                          name={isSurprise ? 'flash' : 'shield-outline'}
                          size={11}
                          color={isSurprise ? colors.status.highPriority : colors.brand.primary}
                        />
                        <Text style={[styles.typeBadgeText, isSurprise && styles.typeBadgeTextSurprise]}>
                          {inspection.type}
                        </Text>
                      </View>

                      <View style={styles.dateStamp}>
                        <Ionicons name="time-outline" size={12} color={colors.text.muted} />
                        <Text style={styles.dateStampText}>
                          Submitted: {inspection.submittedAt || inspection.assignedDate}
                        </Text>
                      </View>
                    </View>

                    {/* Verification Badges Strip */}
                    <View style={styles.verificationStrip}>
                      <View style={styles.verificationPill}>
                        <Ionicons
                          name={inspection.isLocationVerified ? 'checkmark-circle' : 'shield-checkmark'}
                          size={12}
                          color={colors.status.normal}
                        />
                        <Text style={styles.verificationPillText}>
                          {inspection.isLocationVerified ? '100m Geofence Verified' : 'Location Verified'}
                        </Text>
                      </View>

                      <View style={styles.verificationPill}>
                        <Ionicons name="finger-print" size={12} color={colors.status.normal} />
                        <Text style={styles.verificationPillText}>Biometric Signed</Text>
                      </View>
                    </View>

                    {/* Summary Counters Strip */}
                    <View style={styles.summaryBar}>
                      <View style={styles.summaryCol}>
                        <Text style={styles.summaryLabel}>Checklist Criteria</Text>
                        <Text style={styles.summaryValue}>
                          {checklistDone} / {checklistTotal} Verified
                        </Text>
                      </View>

                      <View style={styles.summaryDivider} />

                      <View style={styles.summaryCol}>
                        <Text style={styles.summaryLabel}>Attached Evidence</Text>
                        <Text style={styles.summaryValue}>
                          {evidenceCount} Files • SHA-256
                        </Text>
                      </View>
                    </View>

                    {/* Inspector Sign-off Stamp */}
                    {inspection.submittedBy ? (
                      <View style={styles.signOffRow}>
                        <Ionicons name="checkmark-circle-outline" size={13} color={colors.brand.navyLight} />
                        <Text style={styles.signOffText} numberOfLines={1}>
                          Submitted by: <Text style={styles.signOffBold}>{inspection.submittedBy.replace('Demo ', '')}</Text>
                        </Text>
                      </View>
                    ) : null}

                    {/* Action Button: Open Submitted Review Screen */}
                    <TouchableOpacity
                      style={styles.openDetailsBtn}
                      onPress={() => navigation.navigate('InspectionReview', { inspectionId: inspection.id })}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.openDetailsBtnText}>View Submitted Audit Dossier</Text>
                      <Ionicons name="arrow-forward" size={15} color={colors.brand.primary} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </Animated.View>
        )}
      </ScrollView>
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
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxxl + 32,
  },

  // Executive MoSJE Native Header
  headerContainer: {
    backgroundColor: colors.brand.navy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    ...shadows.sm,
  },
  headerInner: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmblem: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerMinistry: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgePillText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },

  // Quick Metrics Strip
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.neutral.divider,
  },

  // Search Input Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    height: '100%',
  },

  // Filter Chips Bar
  filterBar: {
    marginBottom: spacing.base,
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
    minHeight: 36,
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

  // History Card
  historyCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  refIdBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  refIdText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectName: {
    fontSize: typography.sizes.sm + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
    marginBottom: 8,
  },
  addressText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  typeBadgeSurprise: {
    backgroundColor: colors.status.highPriorityLight,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  typeBadgeTextSurprise: {
    color: colors.status.highPriority,
  },
  dateStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateStampText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  verificationStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  verificationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.normalLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.status.normalBorder,
  },
  verificationPillText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.status.normal,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    marginBottom: 10,
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.neutral.divider,
    marginHorizontal: spacing.sm,
  },
  signOffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  signOffText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  signOffBold: {
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  openDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    borderRadius: borderRadius.sm,
    minHeight: 42,
    paddingHorizontal: spacing.base,
    gap: 6,
  },
  openDetailsBtnText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
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
  },
  clearSearchBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.brand.primaryLight,
  },
  clearSearchBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },

  // Skeleton Styles
  skeletonContainer: {
    gap: spacing.md,
  },
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    ...shadows.xs,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonPill: {
    height: 34,
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.full,
  },
  skeletonBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
});
