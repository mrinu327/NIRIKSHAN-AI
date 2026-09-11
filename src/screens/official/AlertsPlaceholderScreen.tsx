/**
 * AlertsPlaceholderScreen
 * MoSJE Official - Anomaly Alerts & Human Review Queue
 * Formal triage desk for unverified telemetry discrepancies.
 * 
 * Step 3D: Operational Alerts Queue & Triage Desk
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { mockOfficialService } from '../../services/mock/mockOfficialService';
import { AnomalyAlert } from '../../types/alert';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const AlertsPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'Alerts'>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'INVESTIGATION' | 'VERIFIED'>('ALL');

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

  const loadAlerts = async () => {
    try {
      const data = await mockAlertService.getAllAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const unsubscribeFocus = navigation.addListener('focus', () => {
      loadAlerts();
    });
    const unsubscribeOfficial = mockOfficialService.subscribe(() => {
      loadAlerts();
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

  // Compute dynamic counts
  const pendingCount = alerts.filter((a) => a.status === 'Pending Review').length;
  const investigationCount = alerts.filter((a) => a.status === 'Under Investigation').length;
  const verifiedCount = alerts.filter((a) => a.status === 'Verified' || a.status === 'Dismissed').length;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'PENDING') return a.status === 'Pending Review';
    if (filter === 'INVESTIGATION') return a.status === 'Under Investigation';
    if (filter === 'VERIFIED') return a.status === 'Verified' || a.status === 'Dismissed';
    return true;
  });

  // Category visual presentation helper
  const getCategoryDetails = (category: AnomalyAlert['category']) => {
    switch (category) {
      case 'Discrepancy detected':
        return {
          icon: 'alert-circle-outline' as const,
          color: colors.status.highPriority,
          bg: colors.status.highPriorityLight,
        };
      case 'CCTV telemetry offline':
        return {
          icon: 'videocam-off-outline' as const,
          color: colors.status.highPriority,
          bg: colors.status.highPriorityLight,
        };
      case 'Inspection overdue':
        return {
          icon: 'time-outline' as const,
          color: colors.status.warning,
          bg: colors.status.warningLight,
        };
      case 'Potential anomaly':
        return {
          icon: 'warning-outline' as const,
          color: colors.status.warning,
          bg: colors.status.warningLight,
        };
      case 'Requires verification':
      default:
        return {
          icon: 'shield-checkmark-outline' as const,
          color: colors.brand.primary,
          bg: colors.brand.primaryLight,
        };
    }
  };

  // Severity visual badge helper
  const getSeverityDetails = (severity: AnomalyAlert['severity']) => {
    switch (severity) {
      case 'HIGH':
        return {
          label: 'HIGH SEVERITY',
          color: colors.status.highPriority,
          bg: colors.status.highPriorityLight,
          borderColor: colors.status.highPriorityBorder,
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM SEVERITY',
          color: colors.status.warning,
          bg: colors.status.warningLight,
          borderColor: colors.status.warningBorder,
        };
      case 'LOW':
      case 'INFO':
      default:
        return {
          label: 'INFORMATIONAL',
          color: colors.brand.primary,
          bg: colors.brand.primaryLight,
          borderColor: colors.status.infoBorder,
        };
    }
  };

  // Status badge details
  const getStatusBadge = (status: AnomalyAlert['status']) => {
    switch (status) {
      case 'Pending Review':
        return {
          label: 'Official Review Required',
          icon: 'shield-checkmark-outline' as const,
          color: colors.brand.primary,
          bg: colors.brand.primaryLight,
          borderColor: colors.status.infoBorder,
        };
      case 'Under Investigation':
        return {
          label: 'Follow-up Scheduled',
          icon: 'time-outline' as const,
          color: colors.status.warning,
          bg: colors.status.warningLight,
          borderColor: colors.status.warningBorder,
        };
      case 'Verified':
        return {
          label: 'Inspection Initiated',
          icon: 'checkmark-circle-outline' as const,
          color: colors.status.normal,
          bg: colors.status.normalLight,
          borderColor: colors.status.normalBorder,
        };
      case 'Dismissed':
      default:
        return {
          label: 'Dismissed',
          icon: 'close-circle-outline' as const,
          color: colors.text.muted,
          bg: colors.neutral.surfaceSubtle,
          borderColor: colors.neutral.border,
        };
    }
  };

  // Render individual operational alert card
  const renderAlertCard = (alert: AnomalyAlert, index: number) => {
    const isHigh = alert.severity === 'HIGH';
    const categoryDetails = getCategoryDetails(alert.category);
    const severityDetails = getSeverityDetails(alert.severity);
    const statusBadge = getStatusBadge(alert.status);

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
      <Animated.View key={alert.id} style={[styles.cardCol, cardMotionStyle]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.card,
            isHigh && styles.cardHighPriority,
            {
              borderLeftColor: isHigh
                ? colors.status.highPriority
                : alert.severity === 'MEDIUM'
                ? colors.status.warning
                : colors.brand.primary,
            },
          ]}
          onPress={() => navigation.navigate('AlertReview', { alertId: alert.id })}
        >
          {/* Card Top Row: Category Pill + Severity Badge + Timestamp */}
          <View style={styles.cardHeaderRow}>
            {/* Category Pill */}
            <View style={[styles.categoryPill, { backgroundColor: categoryDetails.bg }]}>
              <Ionicons name={categoryDetails.icon} size={13} color={categoryDetails.color} />
              <Text style={[styles.categoryText, { color: categoryDetails.color }]}>
                {alert.category}
              </Text>
            </View>

            {/* Severity & Timestamp */}
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor: severityDetails.bg,
                    borderColor: severityDetails.borderColor,
                  },
                ]}
              >
                <Text style={[styles.severityBadgeText, { color: severityDetails.color }]}>
                  {severityDetails.label}
                </Text>
              </View>
              <Text style={styles.timestamp}>{alert.timestamp}</Text>
            </View>
          </View>

          {/* Facility Name & Alert ID Row */}
          <View style={styles.facilityRow}>
            <Text style={styles.facilityName} numberOfLines={2}>
              {alert.projectName}
            </Text>
            <View style={styles.alertIdPill}>
              <Text style={styles.alertIdText}>#{alert.id}</Text>
            </View>
          </View>

          {/* Diagnostic Description */}
          <Text style={styles.description}>{alert.description}</Text>

          {/* Telemetry Comparison Table (if available) */}
          {alert.metricComparison && (
            <View style={styles.metricsBox}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>SUBMITTED ROLL-CALL</Text>
                <Text style={styles.metricValue}>
                  {alert.metricComparison.reportedAttendance}
                </Text>
                <Text style={styles.metricSubLabel}>Beneficiaries Reported</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>FEED HEADCOUNT</Text>
                <Text style={styles.metricValue}>
                  {alert.metricComparison.headcountEstimate ?? '--'}
                </Text>
                <Text style={styles.metricSubLabel}>CCTV Optical Estimate</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>RECORDED VARIANCE</Text>
                <Text style={[styles.metricValue, { color: colors.status.highPriority }]}>
                  +{alert.metricComparison.difference}
                </Text>
                <Text style={[styles.metricSubLabel, { color: colors.status.highPriority }]}>
                  Discrepancy Signal
                </Text>
              </View>
            </View>
          )}

          {/* Card Footer: Official Status & Action Affordance */}
          <View style={styles.cardFooter}>
            <View style={styles.footerStatusGroup}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusBadge.bg,
                    borderColor: statusBadge.borderColor,
                  },
                ]}
              >
                <Ionicons name={statusBadge.icon} size={13} color={statusBadge.color} />
                <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                  {statusBadge.label}
                </Text>
              </View>

              {alert.reviewedAt ? (
                <Text style={styles.reviewedMetaText} numberOfLines={1}>
                  {alert.reviewedAt}
                </Text>
              ) : null}
            </View>

            <View style={styles.actionAffordance}>
              <Text style={styles.actionText}>Review Anomaly</Text>
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
        title="Anomaly Triage & Review"
        subtitle="Automated Screening Signals • Official Human Verification Desk"
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
            <Text style={styles.loadingBannerText}>Loading anomaly alerts queue...</Text>
          </View>
          {/* Skeleton placeholders */}
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.skeletonCard}>
              <View style={styles.skeletonHeaderRow}>
                <View style={styles.skeletonPill} />
                <View style={styles.skeletonBadge} />
              </View>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonDesc} />
              <View style={styles.skeletonMetricsBox} />
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
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Triage Protocol Notice Banner */}
            <View style={styles.protocolBanner}>
              <Ionicons name="shield-checkmark" size={18} color={colors.brand.primary} />
              <Text style={styles.protocolText}>
                <Text style={{ fontWeight: typography.weights.bold }}>Operational Directive: </Text>
                Signals flagged by rule checks and camera telemetry represent unverified discrepancies. An official review is mandatory prior to on-site dispatch.
              </Text>
            </View>

            {/* Operational Filter Chips with dynamic counts */}
            <View style={styles.filterRow}>
              {[
                { id: 'ALL', label: `All Alerts (${alerts.length})` },
                { id: 'PENDING', label: `Pending Review (${pendingCount})` },
                { id: 'INVESTIGATION', label: `Follow-up (${investigationCount})` },
                { id: 'VERIFIED', label: `Reviewed (${verifiedCount})` },
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

            {/* Section Header */}
            <SectionHeader
              title="Prioritized Review Queue"
              subtitle="Tap an alert to inspect side-by-side telemetry and record a governance decision"
              badgeCount={filteredAlerts.length}
            />

            {/* Alert List */}
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => renderAlertCard(alert, index))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={40} color={colors.status.normal} />
                <Text style={styles.emptyTitle}>Queue Cleared</Text>
                <Text style={styles.emptySubtitle}>
                  No anomaly alerts match the current filter selection.
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => setFilter('ALL')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh-outline" size={15} color={colors.brand.primary} />
                  <Text style={styles.resetButtonText}>View All Alerts</Text>
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

  // Protocol Directive Banner
  protocolBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderColor: 'rgba(42, 92, 224, 0.22)',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 10,
    ...shadows.xs,
  },
  protocolText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    lineHeight: 18,
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

  // Alert Card
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
  cardHighPriority: {
    backgroundColor: '#FFFDFD',
    borderColor: 'rgba(196, 64, 44, 0.25)',
  },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 5,
  },
  categoryText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.4,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
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
  alertIdPill: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  alertIdText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
  },

  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: 6,
  },

  // Comparative Telemetry Table
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: typography.sizes.base + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  metricSubLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.neutral.divider,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm + 2,
    paddingTop: spacing.xs + 3,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.surfaceSubtle,
    flexWrap: 'wrap',
    gap: 8,
  },
  footerStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
  reviewedMetaText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  actionAffordance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },

  // Loading skeleton state
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
    minHeight: 160,
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
  skeletonDesc: {
    width: '90%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.neutral.surfaceSubtle,
    marginBottom: spacing.sm,
  },
  skeletonMetricsBox: {
    height: 48,
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
});

