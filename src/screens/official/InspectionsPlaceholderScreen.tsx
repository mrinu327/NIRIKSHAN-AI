/**
 * InspectionsPlaceholderScreen
 * MoSJE Official - Field Inspection Oversight & Automated PMU Allocation
 * High-integrity inspection order queue and dossier review desk.
 * 
 * Step 3E: Operational Inspections Workspace
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Modal,
  Animated,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { mockOfficialService } from '../../services/mock/mockOfficialService';
import {
  mockAssignmentService,
  AutomatedAssignmentResult,
} from '../../services/mock/mockAssignmentService';
import { InspectionAssignment, DemoInspector } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const InspectionsPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'Inspections'>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  // View Mode: Active Oversight vs Historical Archive
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');

  // Active Inspections State
  const [inspections, setInspections] = useState<InspectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'SURPRISE' | 'ROUTINE'>('ALL');

  // Archive State
  const [archiveInspections, setArchiveInspections] = useState<InspectionAssignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [archiveStatusFilter, setArchiveStatusFilter] = useState<'ALL' | 'COMPLETED' | 'SUBMITTED' | 'IN_PROGRESS'>('ALL');
  const [archiveTypeFilter, setArchiveTypeFilter] = useState<'ALL' | 'SURPRISE' | 'ROUTINE' | 'SPECIAL'>('ALL');

  // Modal State for Automated Random Assignment
  const [selectedInspection, setSelectedInspection] = useState<InspectionAssignment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [allInspectors, setAllInspectors] = useState<DemoInspector[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<AutomatedAssignmentResult | null>(null);

  // Modal State for Submitted Inspection Dossier Review (Phase 3 Sync)
  const [dossierInspection, setDossierInspection] = useState<InspectionAssignment | null>(null);
  const [dossierModalVisible, setDossierModalVisible] = useState(false);

  // Entrance & pulse animations
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

  const loadInspections = async () => {
    try {
      const data = await mockInspectionService.getAssignedInspections();
      setInspections(data);
      const allData = await mockInspectionService.getAllInspections();
      setArchiveInspections(allData);
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
    const unsubscribeFocus = navigation.addListener('focus', () => {
      loadInspections();
    });
    const unsubscribeOfficial = mockOfficialService.subscribe(() => {
      loadInspections();
    });
    return () => {
      unsubscribeFocus();
      unsubscribeOfficial();
    };
  }, [navigation]);

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

  const handleOpenAssignmentModal = async (inspection: InspectionAssignment) => {
    setSelectedInspection(inspection);
    setAssignmentResult(null);
    setIsAssigning(false);
    const pool = await mockAssignmentService.getAllInspectors();
    setAllInspectors(pool);
    setModalVisible(true);
  };

  const handleExecuteAutomatedAssignment = async () => {
    if (!selectedInspection) return;
    setIsAssigning(true);
    try {
      const result = await mockAssignmentService.assignInspectorRandomly(selectedInspection.id);
      setAssignmentResult(result);
    } catch (error) {
      console.error('Failed automated assignment:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmAndClose = async () => {
    setModalVisible(false);
    setSelectedInspection(null);
    setAssignmentResult(null);
    await loadInspections();
  };

  const handleOpenDossier = (inspection: InspectionAssignment) => {
    setDossierInspection(inspection);
    setDossierModalVisible(true);
  };

  // Compute dynamic filter counts
  const submittedCount = inspections.filter((i) => i.status === 'Submitted / Awaiting Review').length;
  const surpriseCount = inspections.filter((i) => i.type === 'Surprise Inspection').length;
  const routineCount = inspections.filter((i) => i.type === 'Routine Inspection' || i.type === 'Special Audit').length;

  const filteredInspections = inspections.filter((i) => {
    if (filter === 'SUBMITTED') return i.status === 'Submitted / Awaiting Review';
    if (filter === 'SURPRISE') return i.type === 'Surprise Inspection';
    if (filter === 'ROUTINE') return i.type === 'Routine Inspection' || i.type === 'Special Audit';
    return true;
  });

  const filteredArchive = archiveInspections.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.projectName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.assignedOfficerName && item.assignedOfficerName.toLowerCase().includes(q)) ||
        (item.city && item.city.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (archiveStatusFilter === 'COMPLETED' && item.status !== 'Completed' && item.status !== 'Accepted / Acknowledged') return false;
    if (archiveStatusFilter === 'SUBMITTED' && item.status !== 'Submitted / Awaiting Review') return false;
    if (archiveStatusFilter === 'IN_PROGRESS' && item.status !== 'In Progress') return false;

    if (archiveTypeFilter === 'SURPRISE' && item.type !== 'Surprise Inspection') return false;
    if (archiveTypeFilter === 'ROUTINE' && item.type !== 'Routine Inspection') return false;
    if (archiveTypeFilter === 'SPECIAL' && item.type !== 'Special Audit') return false;

    return true;
  });

  const activeInspectorsCount = allInspectors.filter((i) => i.active).length;
  const inactiveInspectorsCount = allInspectors.filter((i) => !i.active).length;

  // Type styling helper
  const getTypeDetails = (type: InspectionAssignment['type']) => {
    switch (type) {
      case 'Surprise Inspection':
        return {
          icon: 'flash-outline' as const,
          color: colors.status.highPriority,
          bg: colors.status.highPriorityLight,
          label: 'Surprise Inspection',
        };
      case 'Special Audit':
        return {
          icon: 'clipboard-outline' as const,
          color: colors.status.warning,
          bg: colors.status.warningLight,
          label: 'Special Audit',
        };
      case 'Routine Inspection':
      default:
        return {
          icon: 'calendar-outline' as const,
          color: colors.brand.primary,
          bg: colors.brand.primaryLight,
          label: 'Routine Inspection',
        };
    }
  };

  // Status badge helper
  const getInspectionStatusDetails = (status: InspectionAssignment['status']) => {
    switch (status) {
      case 'Awaiting Assignment':
        return {
          label: 'Awaiting Assignment',
          color: colors.status.warning,
          bg: colors.status.warningLight,
          borderColor: colors.status.warningBorder,
        };
      case 'Assigned':
        return {
          label: 'Assigned',
          color: colors.brand.primary,
          bg: colors.brand.primaryLight,
          borderColor: colors.status.infoBorder,
        };
      case 'In Progress':
        return {
          label: 'In Progress',
          color: colors.status.warning,
          bg: colors.status.warningLight,
          borderColor: colors.status.warningBorder,
        };
      case 'Submitted / Awaiting Review':
        return {
          label: 'Submitted for Review',
          color: colors.brand.primary,
          bg: colors.brand.primaryLight,
          borderColor: colors.status.infoBorder,
        };
      case 'Accepted / Acknowledged':
      case 'Completed':
        return {
          label: status,
          color: colors.status.normal,
          bg: colors.status.normalLight,
          borderColor: colors.status.normalBorder,
        };
      case 'Scheduled':
      default:
        return {
          label: 'Scheduled',
          color: colors.text.muted,
          bg: colors.neutral.surfaceSubtle,
          borderColor: colors.neutral.border,
        };
    }
  };

  // Accent left border color
  const getCardAccentColor = (inspection: InspectionAssignment) => {
    if (inspection.type === 'Surprise Inspection' || inspection.priority === 'HIGH') {
      return colors.status.highPriority;
    }
    if (inspection.status === 'Awaiting Assignment' || inspection.status === 'In Progress') {
      return colors.status.warning;
    }
    if (inspection.status === 'Submitted / Awaiting Review') {
      return colors.brand.primary;
    }
    if (inspection.status === 'Completed' || inspection.status === 'Accepted / Acknowledged') {
      return colors.status.normal;
    }
    return colors.brand.primary;
  };

  // Render individual inspection card
  const renderInspectionCard = (inspection: InspectionAssignment, index: number) => {
    const isSurprise = inspection.type === 'Surprise Inspection';
    const isAwaiting = inspection.status === 'Awaiting Assignment';
    const isSubmitted = inspection.status === 'Submitted / Awaiting Review';
    const isAcknowledged = inspection.status === 'Accepted / Acknowledged';

    const typeDetails = getTypeDetails(inspection.type);
    const statusDetails = getInspectionStatusDetails(inspection.status);
    const accentColor = getCardAccentColor(inspection);

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
      <Animated.View key={inspection.id} style={[styles.cardCol, cardMotionStyle]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.card,
            isSurprise && styles.cardSurprise,
            { borderLeftColor: accentColor },
          ]}
          onPress={() => {
            if (isAwaiting) {
              handleOpenAssignmentModal(inspection);
            } else {
              handleOpenDossier(inspection);
            }
          }}
        >
          {/* Card Top Row: Type Pill + Status Badge */}
          <View style={styles.cardHeaderRow}>
            {/* Inspection Type Pill */}
            <View style={[styles.typePill, { backgroundColor: typeDetails.bg }]}>
              <Ionicons name={typeDetails.icon} size={13} color={typeDetails.color} />
              <Text style={[styles.typePillText, { color: typeDetails.color }]}>
                {typeDetails.label}
              </Text>
            </View>

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusDetails.bg,
                  borderColor: statusDetails.borderColor,
                },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusDetails.color }]}>
                {statusDetails.label}
              </Text>
            </View>
          </View>

          {/* Facility Name & Order ID */}
          <View style={styles.facilityRow}>
            <Text style={styles.facilityName} numberOfLines={2}>
              {inspection.projectName}
            </Text>
            <View style={styles.orderIdPill}>
              <Text style={styles.orderIdText}>#{inspection.id}</Text>
            </View>
          </View>

          {/* Location / Address */}
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={colors.text.muted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {inspection.projectAddress} • {inspection.city}
            </Text>
          </View>

          {/* Unassigned / Officer Roster Block */}
          {isAwaiting ? (
            <View style={styles.unassignedBox}>
              <View style={styles.unassignedHeader}>
                <Ionicons name="alert-circle-outline" size={15} color={colors.status.warning} />
                <Text style={styles.unassignedHeaderText}>Roster Status: Unassigned</Text>
              </View>
              <Text style={styles.unassignedNotice}>
                Inspection order created. Awaiting automated random assignment from active PMU inspector pool.
              </Text>
              <TouchableOpacity
                style={styles.runAssignmentBtn}
                onPress={() => handleOpenAssignmentModal(inspection)}
                activeOpacity={0.8}
              >
                <Ionicons name="shuffle-outline" size={15} color={colors.text.inverse} />
                <Text style={styles.runAssignmentBtnText}>Run Automated Assignment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.officerBox}>
              <View style={styles.officerRow}>
                <View style={styles.officerInfoCol}>
                  <Text style={styles.officerLabel}>ASSIGNED PMU OFFICER</Text>
                  <Text style={styles.officerName}>
                    {inspection.assignedOfficerName}{' '}
                    {inspection.assignedOfficerDemoId ? (
                      <Text style={styles.officerBadgeText}>
                        ({inspection.assignedOfficerDemoId.replace('-DEMO', '')})
                      </Text>
                    ) : null}
                  </Text>
                </View>

                {inspection.assignmentMethod && (
                  <View style={styles.methodTag}>
                    <Ionicons name="shuffle" size={11} color={colors.brand.primary} />
                    <Text style={styles.methodTagText}>{inspection.assignmentMethod}</Text>
                  </View>
                )}
              </View>

              {/* Submission or Acknowledgment Status Notice */}
              {isSubmitted ? (
                <View style={styles.submittedBanner}>
                  <Ionicons name="shield-checkmark-outline" size={13} color={colors.brand.primary} />
                  <Text style={styles.submittedBannerText}>
                    Submitted for MoSJE review on {inspection.submittedAt || 'Today'} by {inspection.submittedBy || inspection.assignedOfficerName}
                  </Text>
                </View>
              ) : isAcknowledged ? (
                <View style={styles.acknowledgedBanner}>
                  <Ionicons name="checkmark-circle-outline" size={13} color={colors.status.normal} />
                  <Text style={styles.acknowledgedText}>
                    Acknowledged by {inspection.acknowledgedBy || inspection.assignedOfficerName}
                    {inspection.acknowledgedAt ? ` • ${inspection.acknowledgedAt}` : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Operational Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>PRIORITY LEVEL</Text>
              <View style={styles.priorityPillContainer}>
                <View
                  style={[
                    styles.priorityPill,
                    inspection.priority === 'HIGH' && styles.priorityHigh,
                    inspection.priority === 'MEDIUM' && styles.priorityMedium,
                    inspection.priority === 'NORMAL' && styles.priorityNormal,
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityPillText,
                      inspection.priority === 'HIGH' && { color: colors.status.highPriority },
                      inspection.priority === 'MEDIUM' && { color: colors.status.warning },
                      inspection.priority === 'NORMAL' && { color: colors.status.normal },
                    ]}
                  >
                    {inspection.priority}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>SCHEDULED WINDOW</Text>
              <Text style={styles.detailValue}>
                {inspection.scheduledTime || inspection.dueDate}
              </Text>
            </View>
          </View>

          {/* Trigger Reason Strip (if present) */}
          {inspection.triggerReason ? (
            <View style={styles.triggerContainer}>
              <Ionicons
                name="information-circle-outline"
                size={13}
                color={colors.brand.primary}
                style={{ marginTop: 1 }}
              />
              <Text style={styles.triggerText} numberOfLines={2}>
                {inspection.triggerReason}
              </Text>
            </View>
          ) : null}

          {/* Evidence Checklist Progress Strip (if present) */}
          {inspection.totalChecklistCount ? (
            <View style={styles.checklistRow}>
              <Text style={styles.checklistLabel}>Evidence Checklist Progress</Text>
              <Text style={styles.checklistValue}>
                {inspection.checklistCompletedCount} / {inspection.totalChecklistCount} Items
              </Text>
            </View>
          ) : null}

          {/* Geofence Telemetry Status Strip */}
          <View style={styles.geofenceCardIndicator}>
            <View style={styles.geofenceIndicatorLeft}>
              <Ionicons
                name={
                  inspection.isLocationVerified || inspection.status === 'Completed' || inspection.status === 'Submitted / Awaiting Review'
                    ? 'shield-checkmark'
                    : 'navigate-circle-outline'
                }
                size={13}
                color={
                  inspection.isLocationVerified || inspection.status === 'Completed' || inspection.status === 'Submitted / Awaiting Review'
                    ? colors.status.normal
                    : colors.status.warning
                }
              />
              <Text
                style={[
                  styles.geofenceIndicatorText,
                  {
                    color:
                      inspection.isLocationVerified || inspection.status === 'Completed' || inspection.status === 'Submitted / Awaiting Review'
                        ? colors.status.normal
                        : colors.status.warning,
                  },
                ]}
              >
                {inspection.isLocationVerified || inspection.status === 'Completed' || inspection.status === 'Submitted / Awaiting Review'
                  ? 'Geofence: 100m Perimeter Verified (On-Site)'
                  : 'Geofence: Pending Physical Ingress'}
              </Text>
            </View>
            <Text style={styles.evidenceFileCount}>
              {inspection.evidenceItems?.length || 3} Files Attached
            </Text>
          </View>

          {/* Card Footer: Action Affordance */}
          <View style={styles.cardFooter}>
            <View style={styles.footerDateContainer}>
              <Ionicons name="time-outline" size={13} color={colors.text.muted} />
              <Text style={styles.footerDateText}>
                Assigned: {inspection.assignedDate} • Due: {inspection.dueDate}
              </Text>
            </View>

            <View style={styles.actionAffordance}>
              <Text style={styles.actionText}>
                {isSubmitted
                  ? 'Review Dossier'
                  : isAwaiting
                  ? 'Assign Officer'
                  : 'Order Details'}
              </Text>
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
        title="Field Inspection Oversight"
        subtitle="Surprise & Routine PMU Audits • Allocation & Dossier Review"
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
            <Text style={styles.loadingBannerText}>Loading inspection assignments...</Text>
          </View>
          {/* Skeleton placeholders */}
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.skeletonCard}>
              <View style={styles.skeletonHeaderRow}>
                <View style={styles.skeletonPill} />
                <View style={styles.skeletonBadge} />
              </View>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonMeta} />
              <View style={styles.skeletonBox} />
              <View style={styles.skeletonFooter} />
            </View>
          ))}
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
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* View Mode Segment Switcher: Active vs Archive */}
            <View style={styles.segmentToggleContainer}>
              <TouchableOpacity
                style={[styles.segmentBtn, viewMode === 'ACTIVE' && styles.segmentBtnActive]}
                onPress={() => setViewMode('ACTIVE')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={15}
                  color={viewMode === 'ACTIVE' ? colors.brand.primary : colors.text.muted}
                />
                <Text style={[styles.segmentBtnText, viewMode === 'ACTIVE' && styles.segmentBtnTextActive]}>
                  Active Oversight ({inspections.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, viewMode === 'ARCHIVE' && styles.segmentBtnActive]}
                onPress={() => setViewMode('ARCHIVE')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="archive-outline"
                  size={15}
                  color={viewMode === 'ARCHIVE' ? colors.brand.primary : colors.text.muted}
                />
                <Text style={[styles.segmentBtnText, viewMode === 'ARCHIVE' && styles.segmentBtnTextActive]}>
                  Inspection Archive ({archiveInspections.length})
                </Text>
              </TouchableOpacity>
            </View>

            {viewMode === 'ACTIVE' ? (
              <>
                {/* Operational Filter Chips */}
                <View style={styles.filterRow}>
                  {[
                    { id: 'ALL', label: `All Orders (${inspections.length})` },
                    { id: 'SUBMITTED', label: `Submitted / Review (${submittedCount})` },
                    { id: 'SURPRISE', label: `Surprise Audits (${surpriseCount})` },
                    { id: 'ROUTINE', label: `Routine / Scheduled (${routineCount})` },
                  ].map((chip) => {
                    const isActive = filter === chip.id;
                    return (
                      <TouchableOpacity
                        key={chip.id}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                        onPress={() => setFilter(chip.id as any)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                          {chip.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <SectionHeader
                  title="Active Inspection Orders"
                  subtitle="Assignments triggered by alerts and routine governance timelines"
                  badgeCount={filteredInspections.length}
                />

                {filteredInspections.length > 0 ? (
                  filteredInspections.map((inspection, index) => renderInspectionCard(inspection, index))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="clipboard-outline" size={40} color={colors.text.muted} />
                    <Text style={styles.emptyTitle}>No matching inspection orders</Text>
                    <Text style={styles.emptySubtitle}>
                      No inspection orders match the selected filter criteria.
                    </Text>
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => setFilter('ALL')}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="refresh-outline" size={15} color={colors.brand.primary} />
                      <Text style={styles.resetButtonText}>View All Orders</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Archive Search Bar */}
                <View style={styles.searchBarContainer}>
                  <Ionicons name="search-outline" size={18} color={colors.text.muted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by facility, order #, city, or officer..."
                    placeholderTextColor={colors.text.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={16} color={colors.text.muted} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Archive Status Filters */}
                <View style={styles.filterRow}>
                  {[
                    { id: 'ALL', label: 'All Statuses' },
                    { id: 'COMPLETED', label: 'Completed' },
                    { id: 'SUBMITTED', label: 'Submitted' },
                    { id: 'IN_PROGRESS', label: 'In Progress' },
                  ].map((chip) => {
                    const isActive = archiveStatusFilter === chip.id;
                    return (
                      <TouchableOpacity
                        key={chip.id}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                        onPress={() => setArchiveStatusFilter(chip.id as any)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                          {chip.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Archive Type Filters */}
                <View style={[styles.filterRow, { marginTop: -4 }]}>
                  {[
                    { id: 'ALL', label: 'All Types' },
                    { id: 'SURPRISE', label: '⚡ Surprise' },
                    { id: 'ROUTINE', label: '📅 Routine' },
                    { id: 'SPECIAL', label: '📋 Special' },
                  ].map((chip) => {
                    const isActive = archiveTypeFilter === chip.id;
                    return (
                      <TouchableOpacity
                        key={chip.id}
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                        onPress={() => setArchiveTypeFilter(chip.id as any)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                          {chip.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <SectionHeader
                  title="Historical PMU Inspection Archive"
                  subtitle="Searchable dossier repository of all conducted and submitted inspections"
                  badgeCount={filteredArchive.length}
                />

                {filteredArchive.length > 0 ? (
                  filteredArchive.map((inspection, index) => renderInspectionCard(inspection, index))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="archive-outline" size={40} color={colors.text.muted} />
                    <Text style={styles.emptyTitle}>No archived inspections match</Text>
                    <Text style={styles.emptySubtitle}>
                      Try adjusting your search query or filter settings.
                    </Text>
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => {
                        setSearchQuery('');
                        setArchiveStatusFilter('ALL');
                        setArchiveTypeFilter('ALL');
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="refresh-outline" size={15} color={colors.brand.primary} />
                      <Text style={styles.resetButtonText}>Reset Filters</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Automated Random Assignment Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="shuffle" size={20} color={colors.brand.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Automated Field Assignment</Text>
                  <Text style={styles.modalSubtitle}>Impartial automated selection protocol</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Inspection Target Card */}
              {selectedInspection && (
                <View style={styles.targetSection}>
                  <View style={styles.targetTopRow}>
                    <Text style={styles.targetIdText}>#{selectedInspection.id}</Text>
                    <StatusBadge label={selectedInspection.type} variant="highPriority" size="sm" />
                  </View>
                  <Text style={styles.targetNameText}>{selectedInspection.projectName}</Text>
                  <Text style={styles.targetAddressText}>{selectedInspection.projectAddress}</Text>

                  {selectedInspection.triggerReason ? (
                    <View style={styles.triggerAlertBox}>
                      <Ionicons name="information-circle" size={14} color={colors.brand.navyLight} />
                      <Text style={styles.triggerAlertText} numberOfLines={2}>
                        {selectedInspection.triggerReason}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Roster & Pool Status */}
              <View style={styles.poolSection}>
                <View style={styles.poolHeaderRow}>
                  <Text style={styles.poolSectionTitle}>PMU Field Inspector Pool</Text>
                  <View style={styles.poolBadge}>
                    <Text style={styles.poolBadgeText}>
                      {activeInspectorsCount} Active • {inactiveInspectorsCount} Excluded
                    </Text>
                  </View>
                </View>

                {allInspectors.map((inspector) => (
                  <View
                    key={inspector.id}
                    style={[
                      styles.inspectorItem,
                      !inspector.active && styles.inspectorItemInactive,
                      assignmentResult?.selectedInspector.id === inspector.id &&
                        styles.inspectorItemSelected,
                    ]}
                  >
                    <View style={styles.inspectorInfoLeft}>
                      <View
                        style={[
                          styles.inspectorStatusDot,
                          {
                            backgroundColor: inspector.active
                              ? colors.status.normal
                              : colors.text.muted,
                          },
                        ]}
                      />
                      <View>
                        <View style={styles.inspectorNameRow}>
                          <Text
                            style={[
                              styles.inspectorItemName,
                              !inspector.active && styles.inspectorTextMuted,
                            ]}
                          >
                            {inspector.name}
                          </Text>
                          <Text style={styles.inspectorCodeBadge}>
                            ({inspector.demoId.replace('-DEMO', '')})
                          </Text>
                        </View>
                        <Text style={styles.inspectorSubLoc}>
                          {inspector.assignedLocation} • {inspector.jurisdiction}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.inspectorStatusCol}>
                      {inspector.active ? (
                        <View style={styles.activeTag}>
                          <Text style={styles.activeTagText}>Eligible</Text>
                        </View>
                      ) : (
                        <View style={styles.inactiveTag}>
                          <Text style={styles.inactiveTagText}>On Leave (Excluded)</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Selection Result / Explainability Box */}
              {assignmentResult && (
                <View style={styles.resultBox}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.status.normal} />
                    <Text style={styles.resultTitle}>Inspector Selected Impartially</Text>
                  </View>

                  <View style={styles.selectedOfficerCard}>
                    <Text style={styles.selectedOfficerLabel}>Selected Field Officer:</Text>
                    <Text style={styles.selectedOfficerName}>
                      {assignmentResult.selectedInspector.name}{' '}
                      <Text style={styles.selectedOfficerId}>
                        ({assignmentResult.selectedInspector.demoId.replace('-DEMO', '')})
                      </Text>
                    </Text>
                    <Text style={styles.selectedOfficerZone}>
                      {assignmentResult.selectedInspector.assignedLocation}
                    </Text>
                  </View>

                  <View style={styles.explainabilityBox}>
                    <Ionicons name="shield-checkmark-outline" size={15} color={colors.brand.primary} />
                    <Text style={styles.explainabilityText}>
                      {assignmentResult.auditRecord.explanation}
                    </Text>
                  </View>

                  <View style={styles.auditMetaRow}>
                    <Text style={styles.auditMetaText}>
                      Method: {assignmentResult.auditRecord.assignmentMethod}
                    </Text>
                    <Text style={styles.auditMetaText}>
                      Timestamp: {assignmentResult.auditRecord.assignmentTimestamp}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              {assignmentResult ? (
                <PrimaryButton
                  title="Confirm & Dispatch Assignment"
                  iconName="paper-plane"
                  onPress={handleConfirmAndClose}
                />
              ) : (
                <View style={styles.modalActionButtons}>
                  <PrimaryButton
                    title="Execute Automated Assignment"
                    iconName="shuffle"
                    onPress={handleExecuteAutomatedAssignment}
                    loading={isAssigning}
                  />
                  <SecondaryButton
                    title="Cancel"
                    onPress={() => setModalVisible(false)}
                    disabled={isAssigning}
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Submitted Inspection Dossier Review Modal */}
      <Modal
        visible={dossierModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDossierModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 680 }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalIconCircle, { backgroundColor: colors.brand.primaryLight, borderColor: colors.brand.primary }]}>
                  <Ionicons name="document-text" size={20} color={colors.brand.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Inspection Dossier & Audit Record</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {dossierInspection ? `Order #${dossierInspection.id} • ${dossierInspection.type}` : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setDossierModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {dossierInspection && (
                <>
                  {/* Target Card */}
                  <View style={styles.targetSection}>
                    <View style={styles.targetTopRow}>
                      <Text style={styles.targetIdText}>#{dossierInspection.id}</Text>
                      <StatusBadge
                        label={dossierInspection.status}
                        variant={
                          dossierInspection.status === 'Submitted / Awaiting Review'
                            ? 'normal'
                            : dossierInspection.status === 'In Progress'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      />
                    </View>
                    <Text style={styles.targetNameText}>{dossierInspection.projectName}</Text>
                    <Text style={styles.targetAddressText}>{dossierInspection.projectAddress}</Text>

                    <View style={styles.dossierMetaGrid}>
                      <View style={styles.dossierMetaItem}>
                        <Text style={styles.dossierMetaLabel}>Assigned Inspector</Text>
                        <Text style={styles.dossierMetaVal}>
                          {dossierInspection.assignedOfficerName}{' '}
                          {dossierInspection.assignedOfficerDemoId ? `(${dossierInspection.assignedOfficerDemoId.replace('-DEMO', '')})` : ''}
                        </Text>
                      </View>
                      <View style={styles.dossierMetaItem}>
                        <Text style={styles.dossierMetaLabel}>Scheduled Date</Text>
                        <Text style={styles.dossierMetaVal}>{dossierInspection.assignedDate || dossierInspection.dueDate}</Text>
                      </View>
                    </View>

                    {dossierInspection.submittedAt && (
                      <View style={styles.submissionNoticeBox}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.status.normal} />
                        <Text style={styles.submissionNoticeText}>
                          Submitted: {dossierInspection.submittedAt} by {dossierInspection.submittedBy || dossierInspection.assignedOfficerName}
                        </Text>
                      </View>
                    )}

                    {/* Geofence & Boundary Verification Card */}
                    <View style={styles.dossierGeofenceCard}>
                      <View style={styles.dossierGeofenceHeader}>
                        <Ionicons name="navigate-circle" size={15} color={colors.brand.primary} />
                        <Text style={styles.dossierGeofenceTitle}>PHYSICAL GEOFENCE & LOCATION AUDIT</Text>
                      </View>
                      <View style={styles.dossierGeofenceGrid}>
                        <View style={styles.dossierGeofenceItem}>
                          <Text style={styles.dossierGeofenceLabel}>Configured Boundary</Text>
                          <Text style={styles.dossierGeofenceVal}>100 meters</Text>
                        </View>
                        <View style={styles.dossierGeofenceItem}>
                          <Text style={styles.dossierGeofenceLabel}>On-Site Verification</Text>
                          <Text style={[styles.dossierGeofenceVal, { color: colors.status.normal }]}>
                            {dossierInspection.isLocationVerified ? 'Verified (Within 100m)' : 'Verified (On-Site Ingress)'}
                          </Text>
                        </View>
                        <View style={styles.dossierGeofenceItem}>
                          <Text style={styles.dossierGeofenceLabel}>Audit Timestamp</Text>
                          <Text style={styles.dossierGeofenceVal}>
                            {dossierInspection.geofenceVerifiedAt || '09:42 AM Today'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* If not yet submitted */}
                  {dossierInspection.status !== 'Submitted / Awaiting Review' ? (
                    <View style={styles.pendingReportBox}>
                      <Ionicons name="time-outline" size={28} color={colors.brand.navyLight} />
                      <Text style={styles.pendingReportTitle}>Inspection Awaiting Field Submission</Text>
                      <Text style={styles.pendingReportText}>
                        This inspection is currently assigned or in progress with {dossierInspection.assignedOfficerName}.
                        The verified checklist, neutral findings, and photographic/digital evidence will populate here automatically once submitted from the field mobile app.
                      </Text>
                    </View>
                  ) : (
                    <>
                      {/* Checklist Summary Cards */}
                      {(() => {
                        const items = dossierInspection.checklistResponses
                          ? Object.values(dossierInspection.checklistResponses)
                          : [];
                        const verifiedCount = items.filter((i) => i.status === 'Verified').length;
                        const attentionCount = items.filter((i) => i.status === 'Needs Attention').length;
                        const naCount = items.filter((i) => i.status === 'Not Applicable').length;

                        return (
                          <View style={styles.dossierSection}>
                            <Text style={styles.dossierSectionTitle}>Checklist Verification Summary</Text>
                            <View style={styles.checklistSummaryRow}>
                              <View style={[styles.summaryStatCard, { backgroundColor: colors.status.normalLight, borderColor: colors.status.normalBorder }]}>
                                <Text style={[styles.summaryStatVal, { color: colors.status.normal }]}>{verifiedCount}</Text>
                                <Text style={styles.summaryStatLabel}>Verified</Text>
                              </View>
                              <View style={[styles.summaryStatCard, { backgroundColor: colors.status.warningLight, borderColor: colors.status.warningBorder }]}>
                                <Text style={[styles.summaryStatVal, { color: colors.status.warning }]}>{attentionCount}</Text>
                                <Text style={styles.summaryStatLabel}>Needs Attention</Text>
                              </View>
                              <View style={[styles.summaryStatCard, { backgroundColor: colors.neutral.surfaceSubtle, borderColor: colors.neutral.border }]}>
                                <Text style={[styles.summaryStatVal, { color: colors.text.muted }]}>{naCount}</Text>
                                <Text style={styles.summaryStatLabel}>N/A</Text>
                              </View>
                            </View>

                            {/* Checklist Items Details */}
                            <View style={styles.dossierChecklistList}>
                              {items.map((item) => (
                                <View key={item.id} style={styles.dossierChecklistItem}>
                                  <View style={styles.dossierChecklistLeft}>
                                    <Text style={styles.dossierChecklistCategory}>{item.category}</Text>
                                    <Text style={styles.dossierChecklistTitle}>{item.title}</Text>
                                    {item.notes ? (
                                      <Text style={styles.dossierChecklistNotes}>Remark: {item.notes}</Text>
                                    ) : null}
                                  </View>
                                  <View
                                    style={[
                                      styles.dossierStatusBadge,
                                      item.status === 'Verified' && { backgroundColor: colors.status.normalLight },
                                      item.status === 'Needs Attention' && { backgroundColor: colors.status.warningLight },
                                      item.status === 'Not Applicable' && { backgroundColor: colors.neutral.surfaceSubtle },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.dossierStatusText,
                                        item.status === 'Verified' && { color: colors.status.normal },
                                        item.status === 'Needs Attention' && { color: colors.status.warning },
                                        item.status === 'Not Applicable' && { color: colors.text.secondary },
                                      ]}
                                    >
                                      {item.status}
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        );
                      })()}

                      {/* Neutral Findings Section */}
                      {dossierInspection.findings && (
                        <View style={styles.dossierSection}>
                          <Text style={styles.dossierSectionTitle}>Inspector Field Observations</Text>
                          <View style={styles.findingsBlock}>
                            <Text style={styles.findingFieldLabel}>Overall Observation</Text>
                            <Text style={styles.findingFieldValue}>
                              {dossierInspection.findings.overallObservation || 'None recorded'}
                            </Text>
                          </View>

                          <View style={styles.findingsBlock}>
                            <Text style={styles.findingFieldLabel}>Key Findings</Text>
                            <Text style={styles.findingFieldValue}>
                              {dossierInspection.findings.keyFindings || 'None recorded'}
                            </Text>
                          </View>

                          <View style={styles.findingsBlock}>
                            <Text style={styles.findingFieldLabel}>Recommended Follow-Up</Text>
                            <Text style={styles.findingFieldValue}>
                              {dossierInspection.findings.issuesRequiringFollowUp || 'None recorded'}
                            </Text>
                          </View>

                          {dossierInspection.findings.additionalRemarks ? (
                            <View style={styles.findingsBlock}>
                              <Text style={styles.findingFieldLabel}>Additional Remarks</Text>
                              <Text style={styles.findingFieldValue}>
                                {dossierInspection.findings.additionalRemarks}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      )}

                      {/* Evidence Section */}
                      <View style={styles.dossierSection}>
                        <View style={styles.evidenceHeaderRow}>
                          <Text style={styles.dossierSectionTitle}>Attached Digital Evidence</Text>
                          <Text style={styles.evidenceCountBadge}>
                            {dossierInspection.evidenceItems?.length || 0} Files
                          </Text>
                        </View>

                        {dossierInspection.evidenceItems && dossierInspection.evidenceItems.length > 0 ? (
                          dossierInspection.evidenceItems.map((ev) => (
                            <View key={ev.id} style={styles.dossierEvidenceCard}>
                              <View style={styles.evidenceIconBox}>
                                <Ionicons
                                  name={ev.type === 'video' ? 'videocam' : ev.type === 'document' ? 'document-attach' : 'camera'}
                                  size={18}
                                  color={colors.brand.primary}
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.evidenceTitleText}>{ev.title}</Text>
                                <Text style={styles.evidenceMetaText}>
                                  {ev.category} • {ev.timestamp}
                                </Text>
                                {ev.demoLabel ? (
                                  <Text style={styles.evidenceNoteText}>Note: {ev.demoLabel}</Text>
                                ) : null}
                              </View>
                              <View style={styles.gpsBadge}>
                                <Ionicons name="location-outline" size={11} color="#B45309" />
                                <Text style={styles.gpsBadgeText}>{ev.locationStatus}</Text>
                              </View>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noEvidenceText}>No media files attached to this inspection.</Text>
                        )}
                      </View>

                      {/* Governance & Audit Box */}
                      <View style={styles.governanceNoticeBox}>
                        <Ionicons name="shield-checkmark" size={16} color={colors.brand.navyLight} />
                        <Text style={styles.governanceNoticeText}>
                          Official MoSJE PMU Inspection Record. Prototype Mode: All data entries are captured for audit simulation. Pending backend GPS verification and biometric digital sign-off.
                        </Text>
                      </View>
                    </>
                  )}
                </>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <PrimaryButton
                title="Close Dossier"
                onPress={() => setDossierModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: spacing.xxl + 24,
  },

  // LIVE STREAM badge in AppHeader
  liveTelemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normalBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.status.normal,
    marginRight: 6,
  },
  liveTelemetryText: {
    color: colors.status.normal,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.6,
  },

  // Segmented view switcher (Active vs Archive)
  segmentToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.base,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    gap: 6,
    minHeight: 44,
  },
  segmentBtnActive: {
    backgroundColor: colors.neutral.surface,
    ...shadows.xs,
  },
  segmentBtnText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  segmentBtnTextActive: {
    color: colors.brand.primary,
    fontWeight: typography.weights.bold,
  },

  // Archive Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
    marginBottom: spacing.md,
    gap: 8,
    ...shadows.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    paddingVertical: 8,
  },

  // Geofence status strip in card
  geofenceCardIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  geofenceIndicatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  geofenceIndicatorText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  evidenceFileCount: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },

  // Dossier geofence card
  dossierGeofenceCard: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  dossierGeofenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dossierGeofenceTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  dossierGeofenceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  dossierGeofenceItem: {
    flex: 1,
  },
  dossierGeofenceLabel: {
    fontSize: 9,
    color: colors.text.muted,
    marginBottom: 2,
  },
  dossierGeofenceVal: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
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

  // Card Column & Container
  cardCol: {
    width: '100%',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    padding: spacing.base,
    ...shadows.xs,
  },
  cardSurprise: {
    backgroundColor: colors.neutral.surface,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: 6,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 5,
  },
  typePillText: {
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

  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: 8,
  },
  facilityName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 22,
  },
  orderIdPill: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  orderIdText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
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

  // Unassigned Box
  unassignedBox: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  unassignedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  unassignedHeaderText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.status.warning,
  },
  unassignedNotice: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  runAssignmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    gap: 6,
  },
  runAssignmentBtnText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },

  // Officer Box
  officerBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  officerInfoCol: {
    flex: 1,
  },
  officerLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  officerName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  officerBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    fontWeight: typography.weights.medium,
  },
  methodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.status.infoBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    gap: 4,
  },
  methodTagText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },

  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    marginTop: spacing.xs + 2,
    gap: 6,
  },
  submittedBannerText: {
    fontSize: 11,
    color: colors.brand.primary,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  acknowledgedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.normalLight,
    borderWidth: 1,
    borderColor: colors.status.normalBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    marginTop: spacing.xs + 2,
    gap: 6,
  },
  acknowledgedText: {
    fontSize: 11,
    color: colors.status.normal,
    fontWeight: typography.weights.medium,
    flex: 1,
  },

  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  priorityPillContainer: {
    flexDirection: 'row',
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
  },
  priorityHigh: {
    backgroundColor: colors.status.highPriorityLight,
    borderColor: colors.status.highPriorityBorder,
  },
  priorityMedium: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
  },
  priorityNormal: {
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normalBorder,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.3,
  },

  // Trigger reason
  triggerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.xs + 2,
    marginTop: spacing.sm,
    gap: 6,
  },
  triggerText: {
    fontSize: typography.sizes.xs - 0.5,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },

  // Checklist row
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: spacing.xs + 2,
  },
  checklistLabel: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  checklistValue: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm + 2,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.surfaceSubtle,
    flexWrap: 'wrap',
    gap: 8,
  },
  footerDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerDateText: {
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
    marginBottom: spacing.md,
    minHeight: 170,
  },
  skeletonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  skeletonPill: {
    width: 120,
    height: 22,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  skeletonBadge: {
    width: 80,
    height: 22,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  skeletonTitle: {
    width: '70%',
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
    marginBottom: spacing.sm,
  },
  skeletonBox: {
    height: 50,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.surfaceSubtle,
    marginBottom: spacing.sm,
  },
  skeletonFooter: {
    height: 20,
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

  /* Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    overflow: 'hidden',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  modalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  modalSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScroll: {
    padding: spacing.lg,
  },
  targetSection: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  targetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  targetIdText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  targetNameText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  targetAddressText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  triggerAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginTop: spacing.xs,
    gap: 6,
  },
  triggerAlertText: {
    fontSize: 11,
    color: colors.brand.primary,
    flex: 1,
  },
  poolSection: {
    marginBottom: spacing.md,
  },
  poolHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  poolSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  poolBadge: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  poolBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  inspectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: 6,
  },
  inspectorItemInactive: {
    backgroundColor: colors.neutral.surfaceSubtle,
    opacity: 0.65,
  },
  inspectorItemSelected: {
    borderColor: colors.status.normal,
    backgroundColor: colors.status.normalLight,
  },
  inspectorInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  inspectorStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inspectorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inspectorItemName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  inspectorCodeBadge: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  inspectorTextMuted: {
    color: colors.text.muted,
  },
  inspectorSubLoc: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 1,
  },
  inspectorStatusCol: {
    marginLeft: spacing.sm,
  },
  activeTag: {
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normalBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
  },
  inactiveTag: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  inactiveTagText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  resultBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
  },
  selectedOfficerCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedOfficerLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  selectedOfficerName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  selectedOfficerId: {
    color: colors.brand.primary,
  },
  selectedOfficerZone: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  explainabilityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.brand.primary,
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    padding: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  explainabilityText: {
    fontSize: 11,
    color: colors.brand.primary,
    lineHeight: 16,
    flex: 1,
  },
  auditMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
  },
  auditMetaText: {
    fontSize: 10,
    color: colors.text.muted,
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  modalActionButtons: {
    width: '100%',
  },

  /* Dossier Review Modal Styles */
  dossierMetaGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  dossierMetaItem: {
    flex: 1,
  },
  dossierMetaLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  dossierMetaVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: 2,
  },
  submissionNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.status.normalLight,
    borderWidth: 1,
    borderColor: colors.status.normalBorder,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.xs,
    marginTop: spacing.xs,
  },
  submissionNoticeText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.status.normal,
  },
  pendingReportBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderStyle: 'dashed',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  pendingReportTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    marginTop: spacing.xs,
  },
  pendingReportText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  dossierSection: {
    marginTop: spacing.md,
  },
  dossierSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    marginBottom: spacing.xs,
  },
  checklistSummaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryStatCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryStatVal: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  summaryStatLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  dossierChecklistList: {
    gap: 6,
  },
  dossierChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  dossierChecklistLeft: {
    flex: 1,
  },
  dossierChecklistCategory: {
    fontSize: 9,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontWeight: typography.weights.medium,
  },
  dossierChecklistTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  dossierChecklistNotes: {
    fontSize: 11,
    color: colors.status.warning,
    fontStyle: 'italic',
    marginTop: 2,
  },
  dossierStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  dossierStatusText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  findingsBlock: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  findingFieldLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  findingFieldValue: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    lineHeight: 18,
  },
  evidenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  evidenceCountBadge: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  dossierEvidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  evidenceIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceTitleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  evidenceMetaText: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  evidenceNoteText: {
    fontSize: 10,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 1,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.status.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.status.warningBorder,
  },
  gpsBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.status.warning,
  },
  noEvidenceText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  governanceNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  governanceNoticeText: {
    fontSize: 10,
    color: colors.text.secondary,
    lineHeight: 14,
    flex: 1,
  },
});
