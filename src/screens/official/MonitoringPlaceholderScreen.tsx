/**
 * MonitoringPlaceholderScreen
 * MoSJE Official - National Institutional Telemetry & Inspection Directory
 * High-integrity facility registry and real-time telemetry oversight.
 * 
 * Step 3C: Operational Live Monitoring Grid
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  TextInput,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { mockOfficialService } from '../../services/mock/mockOfficialService';
import { Project } from '../../types/project';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const MonitoringPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'Monitoring'>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HIGH_PRIORITY' | 'INSPECTION_DUE' | 'COMPLIANT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Screen entrance & pulse animations
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const livePulse = useRef(new Animated.Value(1)).current;

  // Stagger animations for initial 5 cards
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Subtle breathing pulse loop (~2.0s) for LIVE STREAM badge
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [livePulse]);

  const loadProjects = async () => {
    try {
      const data = await mockProjectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    const unsubFocus = navigation.addListener('focus', () => {
      loadProjects();
    });
    const unsubService = mockOfficialService.subscribe(() => {
      loadProjects();
    });
    return () => {
      unsubFocus();
      unsubService();
    };
  }, [navigation]);

  useEffect(() => {
    if (!loading) {
      // Screen entrance + card stagger animation
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
          45,
          cardAnims.map((anim) =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    }
  }, [loading]);

  // Compute dynamic filter counts
  const highPriorityCount = projects.filter(
    (p) => p.priority === 'HIGH' || p.status === 'High Priority'
  ).length;
  const inspectionDueCount = projects.filter(
    (p) => p.status === 'Inspection Due'
  ).length;
  const compliantCount = projects.filter(
    (p) => p.status === 'Normal' || p.status === 'Compliant'
  ).length;

  const filteredProjects = projects.filter((p) => {
    const matchesFilter =
      selectedFilter === 'ALL' ||
      (selectedFilter === 'HIGH_PRIORITY' && (p.priority === 'HIGH' || p.status === 'High Priority')) ||
      (selectedFilter === 'INSPECTION_DUE' && p.status === 'Inspection Due') ||
      (selectedFilter === 'COMPLIANT' && (p.status === 'Normal' || p.status === 'Compliant'));

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // CCTV status presentation helper
  const getCctvDetails = (status: Project['cctvStatus']) => {
    switch (status) {
      case 'Online':
        return {
          icon: 'videocam-outline' as const,
          color: colors.status.normal,
          bg: colors.status.normalLight,
          label: 'CCTV Online',
        };
      case 'Discrepancy Detected':
        return {
          icon: 'alert-circle-outline' as const,
          color: colors.status.highPriority,
          bg: colors.status.highPriorityLight,
          label: 'Variance Detected',
        };
      case 'Offline':
        return {
          icon: 'videocam-off-outline' as const,
          color: colors.status.highPriority,
          bg: colors.status.highPriorityLight,
          label: 'CCTV Offline',
        };
      case 'Intermittent':
      default:
        return {
          icon: 'videocam-outline' as const,
          color: colors.status.warning,
          bg: colors.status.warningLight,
          label: 'Intermittent',
        };
    }
  };

  // Facility status badge details
  const getStatusBadgeDetails = (project: Project) => {
    if (project.priority === 'HIGH' || project.status === 'High Priority') {
      return {
        label: 'HIGH PRIORITY',
        color: colors.status.highPriority,
        bg: colors.status.highPriorityLight,
        borderColor: colors.status.highPriorityBorder,
      };
    }
    if (project.status === 'Inspection Due') {
      return {
        label: 'INSPECTION DUE',
        color: colors.status.warning,
        bg: colors.status.warningLight,
        borderColor: colors.status.warningBorder,
      };
    }
    if (project.status === 'Under Review') {
      return {
        label: 'UNDER REVIEW',
        color: colors.brand.primary,
        bg: colors.brand.primaryLight,
        borderColor: colors.status.infoBorder,
      };
    }
    return {
      label: 'COMPLIANT',
      color: colors.status.normal,
      bg: colors.status.normalLight,
      borderColor: colors.status.normalBorder,
    };
  };

  // State accent border color (4px left stripe)
  const getCardAccentColor = (project: Project) => {
    if (
      project.priority === 'HIGH' ||
      project.status === 'High Priority' ||
      project.cctvStatus === 'Discrepancy Detected' ||
      project.cctvStatus === 'Offline'
    ) {
      return colors.status.highPriority;
    }
    if (
      project.status === 'Inspection Due' ||
      project.cctvStatus === 'Intermittent' ||
      project.priority === 'MEDIUM'
    ) {
      return colors.status.warning;
    }
    return colors.status.normal;
  };

  // Attendance status badge styling
  const getAttendanceStatusTag = (status: Project['attendance']['status']) => {
    switch (status) {
      case 'Submitted':
        return { color: colors.status.normal, bg: colors.status.normalLight, text: 'Submitted' };
      case 'Verified':
        return { color: colors.brand.primary, bg: colors.brand.primaryLight, text: 'Verified' };
      case 'Pending':
        return { color: colors.status.warning, bg: colors.status.warningLight, text: 'Pending' };
      case 'Flagged':
      default:
        return { color: colors.status.highPriority, bg: colors.status.highPriorityLight, text: 'Flagged' };
    }
  };

  // Compliance score color
  const getComplianceColor = (score: number) => {
    if (score >= 85) return colors.status.normal;
    if (score >= 70) return colors.status.warning;
    return colors.status.highPriority;
  };

  // Render individual facility monitoring card
  const renderFacilityCard = (project: Project, index: number) => {
    const cctv = getCctvDetails(project.cctvStatus);
    const statusBadge = getStatusBadgeDetails(project);
    const accentColor = getCardAccentColor(project);
    const attTag = getAttendanceStatusTag(project.attendance.status);
    const complianceColor = getComplianceColor(project.complianceScore);

    const anim = index < cardAnims.length ? cardAnims[index] : null;
    const cardMotionStyle = anim
      ? {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        }
      : undefined;

    return (
      <Animated.View
        key={project.id}
        style={[
          isDesktop ? styles.cardColDesktop : styles.cardColMobile,
          cardMotionStyle,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.card, { borderLeftColor: accentColor }]}
          onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id })}
        >
          {/* Top Row: CCTV Pill + Operational Status Pill */}
          <View style={styles.cardHeaderRow}>
            {/* CCTV Telemetry Pill */}
            <View style={[styles.cctvPill, { backgroundColor: cctv.bg }]}>
              <Ionicons name={cctv.icon} size={13} color={cctv.color} />
              <Text style={[styles.cctvPillText, { color: cctv.color }]}>
                {cctv.label}
              </Text>
            </View>

            {/* Status / Priority Badge */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusBadge.bg,
                  borderColor: statusBadge.borderColor,
                },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                {statusBadge.label}
              </Text>
            </View>
          </View>

          {/* Facility Identity */}
          <Text style={styles.facilityName} numberOfLines={2}>
            {project.name}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={colors.text.muted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {project.location.city}, {project.location.state} • {project.code} • {project.category}
            </Text>
          </View>

          <View style={styles.cardDivider} />

          {/* Telemetry Data Deck (2 Columns) */}
          <View style={styles.telemetryDeck}>
            {/* Column 1: Attendance */}
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>TODAY'S ATTENDANCE</Text>
              <View style={styles.telemetryValueRow}>
                <Text style={styles.telemetryValue}>
                  {project.attendance.present}
                </Text>
                <Text style={styles.telemetrySub}> / {project.attendance.capacity}</Text>
              </View>
              <View style={[styles.attStatusPill, { backgroundColor: attTag.bg }]}>
                <Text style={[styles.attStatusText, { color: attTag.color }]}>
                  {attTag.text}
                </Text>
              </View>
            </View>

            {/* Column 2: Compliance Score & Due Date */}
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>COMPLIANCE RATING</Text>
              <View style={styles.telemetryValueRow}>
                <Text style={[styles.telemetryValue, { color: complianceColor }]}>
                  {project.complianceScore}%
                </Text>
              </View>
              <Text style={styles.telemetryScheduleText} numberOfLines={1}>
                {project.nextInspectionDueDate
                  ? `Due: ${project.nextInspectionDueDate}`
                  : `Officer: ${project.assignedOfficer || 'Assigned'}`}
              </Text>
            </View>
          </View>

          {/* Diagnostic Note Strip (if available) */}
          {project.notes ? (
            <View style={styles.notesStrip}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={colors.text.muted}
                style={{ marginTop: 1 }}
              />
              <Text style={styles.notesText} numberOfLines={2}>
                {project.notes}
              </Text>
            </View>
          ) : null}

          {/* Card Footer: Submission Timestamp & Action Affordance */}
          <View style={styles.cardFooter}>
            <View style={styles.timestampContainer}>
              <Ionicons name="time-outline" size={13} color={colors.text.muted} />
              <Text style={styles.timestampText}>
                {project.attendance.submittedAt && project.attendance.submittedAt !== 'Pending'
                  ? `Updated: ${project.attendance.submittedAt}`
                  : 'Submission: Pending'}
              </Text>
            </View>

            <View style={styles.actionAffordance}>
              <Text style={styles.actionText}>Inspect Facility</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.brand.primary} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Live Monitoring"
        subtitle="MoSJE Institutional Registry • Telemetry & Audit Profiles"
        rightAction={
          <View style={styles.liveTelemetryBadge}>
            <Animated.View style={[styles.liveDot, { opacity: livePulse }]} />
            <Text style={styles.liveTelemetryText}>LIVE STREAM</Text>
          </View>
        }
      />

      {loading ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.loadingBanner}>
            <Text style={styles.loadingBannerText}>Connecting to MoSJE institutional telemetry directory...</Text>
          </View>
          {/* Skeleton placeholders */}
          <View style={styles.gridContainer}>
            {[1, 2, 3, 4].map((item) => (
              <View
                key={item}
                style={[
                  isDesktop ? styles.cardColDesktop : styles.cardColMobile,
                  styles.skeletonCard,
                ]}
              >
                <View style={styles.skeletonRow}>
                  <View style={styles.skeletonPill} />
                  <View style={styles.skeletonBadge} />
                </View>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonMeta} />
                <View style={styles.skeletonDivider} />
                <View style={styles.skeletonTelemetryRow}>
                  <View style={styles.skeletonCol} />
                  <View style={styles.skeletonCol} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
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
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={colors.text.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search facility name, district, or scheme code..."
                placeholderTextColor={colors.text.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Search facilities"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={18} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Operational Filter Chips with dynamic counts */}
            <View style={styles.filterRow}>
              {[
                { id: 'ALL', label: `All Facilities (${projects.length})` },
                { id: 'HIGH_PRIORITY', label: `High Priority (${highPriorityCount})` },
                { id: 'INSPECTION_DUE', label: `Inspection Due (${inspectionDueCount})` },
                { id: 'COMPLIANT', label: `Compliant (${compliantCount})` },
              ].map((chip) => {
                const isActive = selectedFilter === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setSelectedFilter(chip.id as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Directory Section Header */}
            <SectionHeader
              title="Monitored Institutions"
              subtitle="Select any institution to inspect attendance telemetry, CCTV feeds & audit logs"
              badgeCount={filteredProjects.length}
            />

            {/* Responsive Live Monitoring Grid */}
            {filteredProjects.length > 0 ? (
              <View style={styles.gridContainer}>
                {filteredProjects.map((project, index) => renderFacilityCard(project, index))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={40} color={colors.text.muted} />
                <Text style={styles.emptyTitle}>No matching institutions found</Text>
                <Text style={styles.emptySubtitle}>
                  No monitored facilities match the current query or active filter. Adjust your criteria or reset filters.
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSelectedFilter('ALL');
                    setSearchQuery('');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh-outline" size={15} color={colors.brand.primary} />
                  <Text style={styles.resetButtonText}>Reset Filters & Search</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
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
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },

  // LIVE STREAM badge in AppHeader
  liveTelemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 142, 90, 0.18)',
    borderColor: 'rgba(30, 142, 90, 0.5)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  liveTelemetryText: {
    color: '#D1FAE5',
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.6,
  },

  // Search input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Operational filter chips
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },

  // Grid layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardColDesktop: {
    width: '48.8%',
    marginBottom: spacing.md,
  },
  cardColMobile: {
    width: '100%',
    marginBottom: spacing.md,
  },

  // Individual Operational Facility Card
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    padding: spacing.base,
    ...shadows.xs,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cctvPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 5,
  },
  cctvPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.3,
  },

  // Facility Identity
  facilityName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    flex: 1,
  },

  cardDivider: {
    height: 1,
    backgroundColor: colors.neutral.divider,
    marginVertical: spacing.sm + 2,
  },

  // Telemetry data deck
  telemetryDeck: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  telemetryCol: {
    flex: 1,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  telemetryValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  telemetryValue: {
    fontSize: typography.sizes.base + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  telemetrySub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.regular,
  },
  attStatusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginTop: 4,
  },
  attStatusText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  telemetryScheduleText: {
    fontSize: typography.sizes.xs - 1,
    color: colors.text.muted,
    marginTop: 5,
  },

  // Notes strip
  notesStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.xs + 2,
    marginTop: spacing.sm,
    gap: 6,
  },
  notesText: {
    fontSize: typography.sizes.xs - 0.5,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },

  // Card footer & action affordance
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm + 2,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.surfaceSubtle,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestampText: {
    fontSize: typography.sizes.xs - 1,
    color: colors.text.muted,
  },
  actionAffordance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },

  // Skeleton loading state
  loadingBanner: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
  },
  loadingBannerText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    minHeight: 180,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  skeletonPill: {
    width: 80,
    height: 22,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  skeletonBadge: {
    width: 70,
    height: 22,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  skeletonTitle: {
    width: '75%',
    height: 18,
    borderRadius: 4,
    backgroundColor: colors.neutral.surfaceSubtle,
    marginBottom: spacing.xs,
  },
  skeletonMeta: {
    width: '50%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  skeletonDivider: {
    height: 1,
    backgroundColor: colors.neutral.divider,
    marginVertical: spacing.sm,
  },
  skeletonTelemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonCol: {
    width: '45%',
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.neutral.surfaceSubtle,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 18,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
    minHeight: 44,
  },
  resetButtonText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
});

