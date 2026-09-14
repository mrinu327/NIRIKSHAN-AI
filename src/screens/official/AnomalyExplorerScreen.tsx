/**
 * AnomalyExplorerScreen
 * SIH26095 | MoSJE Government Official Monitoring Workflow
 *
 * Directory and diagnostic console for observed data discrepancies,
 * multi-source evidence signals, and telemetry variances.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { AnomalyCard } from '../../components/anomaly/AnomalyCard';
import { MasterAnomaly, AnomalySeverityLevel } from '../../types/master';
import { anomalyService } from '../../services/master/anomalyService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type SortOption = 'severity' | 'confidence' | 'id';

export const AnomalyExplorerScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<MasterAnomaly[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | AnomalySeverityLevel>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('severity');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await anomalyService.getAnomalies();
      setAnomalies(data);
    } catch (err) {
      console.error('Failed to load anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', () => {
      loadData();
    });
    return unsub;
  }, [navigation]);

  // Filter & Sort Logic
  const filteredAnomalies = useMemo(() => {
    let result = [...anomalies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        a =>
          a.anomalyId.toLowerCase().includes(q) ||
          (a.title ? a.title.toLowerCase().includes(q) : false) ||
          (a.description ? a.description.toLowerCase().includes(q) : false) ||
          (a.type ? a.type.toLowerCase().includes(q) : false) ||
          a.projectId.toLowerCase().includes(q) ||
          a.organizationId.toLowerCase().includes(q)
      );
    }

    if (selectedSeverity !== 'ALL') {
      result = result.filter(a => a.severity.toUpperCase() === selectedSeverity.toUpperCase());
    }

    if (selectedType !== 'ALL') {
      result = result.filter(a => a.type === selectedType);
    }

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return (b.confidence ?? 0) - (a.confidence ?? 0);
        case 'id':
          return a.anomalyId.localeCompare(b.anomalyId);
        case 'severity':
        default: {
          const rank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, MODERATE: 2, LOW: 1 };
          const rA = rank[a.severity.toUpperCase()] || 0;
          const rB = rank[b.severity.toUpperCase()] || 0;
          if (rB !== rA) return rB - rA;
          return (b.confidence ?? 0) - (a.confidence ?? 0);
        }
      }
    });
  }, [anomalies, searchQuery, selectedSeverity, selectedType, sortBy]);

  // Executive KPI summary
  const kpis = useMemo(() => {
    let critical = 0;
    let high = 0;
    let requiresReview = 0;

    for (const a of anomalies) {
      const sev = a.severity.toUpperCase();
      if (sev === 'CRITICAL') critical++;
      else if (sev === 'HIGH') high++;

      if (a.status === 'OPEN' || a.status === 'PENDING_REVIEW' || a.status === 'ESCALATED') {
        requiresReview++;
      }
    }

    return {
      total: anomalies.length,
      critical,
      high,
      requiresReview,
    };
  }, [anomalies]);

  const severityOptions: Array<'ALL' | AnomalySeverityLevel> = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const typeOptions = [
    { label: 'All Types', value: 'ALL' },
    { label: 'Attendance / CCTV', value: 'ATTENDANCE_CCTV_MISMATCH' },
    { label: 'Beneficiary Verification', value: 'BENEFICIARY_VERIFICATION_MISMATCH' },
    { label: 'Financial Utilization', value: 'FINANCIAL_UTILIZATION_CONCERN' },
    { label: 'Inspection Overdue', value: 'INSPECTION_OVERDUE' },
    { label: 'CCTV Telemetry Offline', value: 'CCTV_OFFLINE_DURING_EXPECTED_HOURS' },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navyDark} />
      <AppHeader
        title="ANOMALY INTELLIGENCE"
        subtitle="Observed Data Discrepancies & Monitoring Signals"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Correlating multi-source monitoring signals...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Breadcrumb Navigation */}
          <TouchableOpacity
            style={styles.backBreadcrumb}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color={colors.brand.primary} />
            <Text style={styles.backBreadcrumbText}>Back to Dashboard</Text>
          </TouchableOpacity>

          {/* Executive KPI Deck */}
          <View style={[styles.kpiDeck, isDesktop && styles.desktopKpiDeck]}>
            <View style={[styles.kpiCard, isDesktop && styles.kpiCardDesktop]}>
              <Text style={styles.kpiValue}>{kpis.total}</Text>
              <Text style={styles.kpiLabel}>Total Observed Anomalies</Text>
            </View>
            <View style={[styles.kpiCard, isDesktop && styles.kpiCardDesktop]}>
              <Text style={[styles.kpiValue, { color: colors.status.highPriority }]}>{kpis.critical}</Text>
              <Text style={styles.kpiLabel}>Critical Review</Text>
            </View>
            <View style={[styles.kpiCard, isDesktop && styles.kpiCardDesktop]}>
              <Text style={[styles.kpiValue, { color: colors.status.highPriority }]}>{kpis.high}</Text>
              <Text style={styles.kpiLabel}>High Severity</Text>
            </View>
            <View style={[styles.kpiCard, isDesktop && styles.kpiCardDesktop]}>
              <Text style={[styles.kpiValue, { color: colors.status.warning }]}>{kpis.requiresReview}</Text>
              <Text style={styles.kpiLabel}>Requires Official Review</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.text.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Anomaly ID, Project, Org, or Discrepancy..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.searchClearBtn}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={18} color={colors.text.muted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Severity Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>DISCREPANCY SEVERITY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {severityOptions.map(sev => {
                const isSelected = selectedSeverity === sev;
                return (
                  <TouchableOpacity
                    key={sev}
                    activeOpacity={0.7}
                    onPress={() => setSelectedSeverity(sev)}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                      {sev === 'ALL' ? 'All Severities' : sev}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Type Filter Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>MONITORING CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {typeOptions.map(t => {
                const isSelected = selectedType === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    activeOpacity={0.7}
                    onPress={() => setSelectedType(t.value)}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Sort Controls & Count Header */}
          <View style={styles.listHeaderRow}>
            <Text style={styles.resultCount}>
              Showing <Text style={styles.boldCount}>{filteredAnomalies.length}</Text> anomaly signal(s)
            </Text>
            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort:</Text>
              {(['severity', 'confidence', 'id'] as SortOption[]).map(opt => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setSortBy(opt)}
                  style={[styles.sortBtn, sortBy === opt && styles.sortBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort by ${opt}`}
                >
                  <Text style={[styles.sortBtnText, sortBy === opt && styles.sortBtnTextActive]}>
                    {opt.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Anomaly Cards List */}
          {filteredAnomalies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="shield-checkmark-outline" size={48} color={colors.status.normal} />
              <Text style={styles.emptyTitle}>No Discrepancies Found</Text>
              <Text style={styles.emptySubtitle}>
                No observed data anomalies match the selected search or filter criteria.
              </Text>
              {(searchQuery || selectedSeverity !== 'ALL' || selectedType !== 'ALL') && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedSeverity('ALL');
                    setSelectedType('ALL');
                  }}
                >
                  <Text style={styles.clearBtnText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredAnomalies.map(anom => (
              <AnomalyCard
                key={anom.anomalyId || anom.id}
                anomaly={anom}
                onPress={() =>
                  navigation.navigate('AnomalyDetails', {
                    anomalyId: anom.anomalyId || anom.id,
                  })
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 13,
    fontFamily: typography.fontFamily,
    color: colors.text.muted,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  kpiDeck: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  desktopKpiDeck: {
    flexWrap: 'nowrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    ...shadows.xs,
  },
  kpiCardDesktop: {
    minWidth: '22%',
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: typography.fontFamily,
    color: colors.text.primary,
    padding: 0,
  },
  searchClearBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: spacing.sm,
  },
  filterSectionTitle: {
    fontSize: 10,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    marginBottom: 6,
    letterSpacing: 0.6,
  },
  chipScroll: {
    gap: 6,
    paddingBottom: 2,
  },
  filterChip: {
    minHeight: 44,
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  resultCount: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    color: colors.text.secondary,
  },
  boldCount: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    color: colors.text.muted,
    marginRight: 2,
  },
  sortBtn: {
    minHeight: 40,
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.neutral.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortBtnActive: {
    backgroundColor: colors.brand.primaryLight,
  },
  sortBtnText: {
    fontSize: 10,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  sortBtnTextActive: {
    color: colors.brand.primary,
    fontWeight: typography.weights.bold,
  },
  emptyContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginVertical: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: typography.fontFamily,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  backBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
    minHeight: 44,
  },
  backBreadcrumbText: {
    fontSize: 13,
    fontFamily: typography.fontFamily,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
  },
  clearBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    color: colors.text.inverse,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    fontSize: 12,
  },
});
