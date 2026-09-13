/**
 * OrganizationExplorerScreen
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Official Directory & Intelligence Console for Organizations, NGOs, and Institutions.
 * Provides multi-criteria filtering, search, KPI summaries, and navigation to detailed
 * risk and performance profiles.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { OrganizationCard } from '../../components/organization/OrganizationCard';
import { organizationService } from '../../services/master/organizationService';
import { organizationRiskEngine } from '../../services/analytics/organizationRiskEngine';
import { masterLookup } from '../../data/master';
import { Organization, MonitoringPriority, OrganizationType } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const TYPE_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Types' },
  { key: 'NGO', label: 'NGOs' },
  { key: 'TRUST', label: 'Trusts' },
  { key: 'SOCIETY', label: 'Societies' },
  { key: 'TRAINING_INSTITUTION', label: 'Institutions' },
];

const PRIORITY_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Priorities' },
  { key: 'CRITICAL', label: 'Critical Review' },
  { key: 'HIGH', label: 'Higher Priority' },
  { key: 'MEDIUM', label: 'Moderate' },
  { key: 'LOW', label: 'Low Concern' },
];

const ANOMALY_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Records' },
  { key: 'WITH_ANOMALIES', label: 'Has Anomalies' },
  { key: 'CLEAN', label: 'Clean Record' },
];

export const OrganizationExplorerScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedAnomalyFilter, setSelectedAnomalyFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'priority' | 'anomalies' | 'funding' | 'name'>('score');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const list = await organizationService.getOrganizations();
      setOrganizations(list);
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = useMemo(() => {
    let result = organizations;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => {
        const stateName = o.stateId ? masterLookup.getStateById(o.stateId)?.name.toLowerCase() : '';
        const districtName = o.districtId ? masterLookup.getDistrictById(o.districtId)?.name.toLowerCase() : '';
        return (
          o.name.toLowerCase().includes(q) ||
          o.organizationId.toLowerCase().includes(q) ||
          (o.ngoDarpanId && o.ngoDarpanId.toLowerCase().includes(q)) ||
          (o.registrationNumber && o.registrationNumber.toLowerCase().includes(q)) ||
          (o.address && o.address.toLowerCase().includes(q)) ||
          (stateName && stateName.includes(q)) ||
          (districtName && districtName.includes(q))
        );
      });
    }

    if (selectedType !== 'ALL') {
      result = result.filter(o => o.organizationType === selectedType || o.type === selectedType);
    }

    if (selectedPriority !== 'ALL') {
      result = result.filter(o => {
        const p = organizationRiskEngine.calculateMonitoringPriority(o.organizationId);
        return p.priority === selectedPriority || o.monitoringPriority === selectedPriority;
      });
    }

    if (selectedAnomalyFilter === 'WITH_ANOMALIES') {
      result = result.filter(o => masterLookup.getOrganizationAnomalies(o.organizationId).length > 0);
    } else if (selectedAnomalyFilter === 'CLEAN') {
      result = result.filter(o => masterLookup.getOrganizationAnomalies(o.organizationId).length === 0);
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'score': {
          const scoreA = organizationRiskEngine.calculateOrganizationRiskProfile(a.organizationId)?.score ?? 75;
          const scoreB = organizationRiskEngine.calculateOrganizationRiskProfile(b.organizationId)?.score ?? 75;
          return scoreB - scoreA;
        }
        case 'priority': {
          const weights: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          const pA = organizationRiskEngine.calculateMonitoringPriority(a.organizationId).priority;
          const pB = organizationRiskEngine.calculateMonitoringPriority(b.organizationId).priority;
          return (weights[pB] || 0) - (weights[pA] || 0);
        }
        case 'anomalies': {
          const anomA = masterLookup.getOrganizationAnomalies(a.organizationId).length;
          const anomB = masterLookup.getOrganizationAnomalies(b.organizationId).length;
          return anomB - anomA;
        }
        case 'funding':
          return (b.totalSanctionedAmount || 0) - (a.totalSanctionedAmount || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [organizations, searchQuery, selectedType, selectedPriority, selectedAnomalyFilter, sortBy]);

  // Aggregate KPI stats
  const kpis = useMemo(() => {
    const total = organizations.length;
    const highPriorityCount = organizations.filter(o => {
      const p = organizationRiskEngine.calculateMonitoringPriority(o.organizationId).priority;
      return p === 'HIGH' || p === 'CRITICAL';
    }).length;
    const totalSanctioned = organizations.reduce((acc, o) => acc + (o.totalSanctionedAmount || 0), 0);
    const avgScore =
      total > 0
        ? Math.round(
            organizations.reduce(
              (acc, o) =>
                acc + (organizationRiskEngine.calculateOrganizationRiskProfile(o.organizationId)?.score ?? 75),
              0
            ) / total
          )
        : 0;
    const totalAnomalies = organizations.reduce(
      (acc, o) => acc + masterLookup.getOrganizationAnomalies(o.organizationId).length,
      0
    );
    const totalOpenFindings = organizations.reduce(
      (acc, o) =>
        acc +
        masterLookup
          .getOrganizationFindings(o.organizationId)
          .filter(f => f.status === 'OPEN' || f.status === 'IN_REVIEW').length,
      0
    );

    return {
      total,
      highPriorityCount,
      totalSanctioned,
      avgScore,
      totalAnomalies,
      totalOpenFindings,
    };
  }, [organizations]);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Organization Intelligence"
        subtitle="Implementing Agencies, NGOs & Institutions"
      />

      <ScrollView
        contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb back button */}
        <TouchableOpacity
          style={styles.backBreadcrumb}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to Dashboard"
        >
          <Ionicons name="chevron-back" size={16} color={colors.brand.primary} />
          <Text style={styles.breadcrumbText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Executive Header Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextCol}>
            <View style={styles.provenanceBadge}>
              <Text style={styles.provenanceText}>MASTER REGISTRY</Text>
            </View>
            <Text style={styles.heroTitle}>Implementing Agency Directory</Text>
            <Text style={styles.heroSubtitle}>
              Consolidated registry of verified NGOs, charitable trusts, societies, and training institutions
              implementing central welfare schemes under MoSJE/DoSJE oversight.
            </Text>
          </View>
        </View>

        {/* Executive KPI Stats */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{kpis.total}</Text>
            <Text style={styles.kpiLabel}>Registered</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.brand.primary }]}>
              {kpis.avgScore}/100
            </Text>
            <Text style={styles.kpiLabel}>Avg. Score</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.status.highPriority }]}>
              {kpis.highPriorityCount}
            </Text>
            <Text style={styles.kpiLabel}>Higher Priority</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.status.warning }]}>
              {kpis.totalOpenFindings}
            </Text>
            <Text style={styles.kpiLabel}>Open Findings</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.status.highPriority }]}>
              {kpis.totalAnomalies}
            </Text>
            <Text style={styles.kpiLabel}>Anomalies</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by organization name, Darpan ID, PAN, or address..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips: Type */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>ORGANIZATION TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {TYPE_FILTERS.map(tf => {
              const active = selectedType === tf.key;
              return (
                <TouchableOpacity
                  key={tf.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedType(tf.key)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {tf.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Filter Chips: Priority */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>MONITORING PRIORITY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {PRIORITY_FILTERS.map(pf => {
              const active = selectedPriority === pf.key;
              return (
                <TouchableOpacity
                  key={pf.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedPriority(pf.key)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {pf.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Filter Chips: Observed Anomalies */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>OBSERVED ANOMALIES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {ANOMALY_FILTERS.map(af => {
              const active = selectedAnomalyFilter === af.key;
              return (
                <TouchableOpacity
                  key={af.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedAnomalyFilter(af.key)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {af.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Sort and Results Count Row */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            Showing <Text style={styles.boldNum}>{filteredOrganizations.length}</Text> organizations
          </Text>
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort: </Text>
            {(['score', 'priority', 'anomalies', 'funding', 'name'] as const).map(s => {
              const active = sortBy === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.sortButton, active && styles.sortButtonActive]}
                  onPress={() => setSortBy(s)}
                >
                  <Text style={[styles.sortButtonText, active && styles.sortButtonTextActive]}>
                    {s === 'score' ? 'Score' : s === 'priority' ? 'Priority' : s === 'anomalies' ? 'Anomalies' : s === 'funding' ? 'Grant' : 'Name'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={styles.loadingText}>Loading organization intelligence...</Text>
          </View>
        ) : filteredOrganizations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>No Organizations Match Filters</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria, clearing type selection, or resetting priority filters.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedPriority('ALL');
                setSelectedAnomalyFilter('ALL');
              }}
            >
              <Text style={styles.resetButtonText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Cards Listing */
          <View style={styles.listContainer}>
            {filteredOrganizations.map(org => (
              <OrganizationCard
                key={org.organizationId}
                organization={org}
                onPress={() => navigation.navigate('OrganizationDetails', { organizationId: org.organizationId })}
              />
            ))}
          </View>
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
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  contentDesktop: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  backBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  breadcrumbText: {
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
    marginLeft: 4,
  },
  heroCard: {
    backgroundColor: colors.brand.primaryLight || '#EEF2FF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  heroTextCol: {
    flex: 1,
  },
  provenanceBadge: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  provenanceText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  kpiCard: {
    flex: 1,
    minWidth: 90,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 10,
    color: colors.text.muted,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
  },
  clearBtn: {
    padding: 4,
  },
  filterSection: {
    marginBottom: spacing.sm,
  },
  filterSectionLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  resultsCount: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  boldNum: {
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginRight: 4,
  },
  sortButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortButtonActive: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
  },
  sortButtonText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  sortButtonTextActive: {
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  listContainer: {
    marginTop: spacing.xs,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.text.muted,
  },
  emptyState: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  resetButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
});
