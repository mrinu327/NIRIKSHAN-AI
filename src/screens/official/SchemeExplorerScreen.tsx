/**
 * SchemeExplorerScreen
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Official Welfare Scheme Catalogue & Intelligence Explorer
 * Displays national schemes across DoSJE/MoSJE divisions with multi-criteria filtering,
 * category tabs, search, and real-time operational metrics.
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackNavigationProp, OfficialStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { DataSourceBadge } from '../../components/common/DataSourceBadge';
import { schemeService } from '../../services/master/schemeService';
import { divisionService } from '../../services/master/divisionService';
import {
  Scheme,
  SchemePerformanceMetrics,
  Division,
  SchemeCategory,
} from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'All', label: 'All Programmes' },
  { key: 'Social Defence', label: 'Social Defence' },
  { key: 'Senior Citizen Welfare', label: 'Senior Citizens' },
  { key: 'Economic Empowerment', label: 'Skill & Livelihood' },
  { key: 'Scheduled Caste Welfare', label: 'SC Welfare' },
  { key: 'Backward Classes Welfare', label: 'Backward Classes' },
  { key: 'Disability-related Programmes', label: 'Disability Care' },
];

export const SchemeExplorerScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<RouteProp<OfficialStackParamList, 'SchemeExplorer'>>();
  const initialDivisionId = route.params?.divisionId;
  const initialCategory = route.params?.category;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [performanceMap, setPerformanceMap] = useState<Record<string, SchemePerformanceMetrics>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedDivision, setSelectedDivision] = useState<string>(initialDivisionId || 'ALL');
  const [selectedSort, setSelectedSort] = useState<'name' | 'projects' | 'funding' | 'utilization' | 'priority'>('name');

  useEffect(() => {
    loadSchemesData();
  }, []);

  const loadSchemesData = async () => {
    try {
      setLoading(true);
      const [allSchemes, allDivisions] = await Promise.all([
        schemeService.getAllSchemes(),
        divisionService.getAllDivisions(),
      ]);

      setSchemes(allSchemes);
      setDivisions(allDivisions);

      const metricsMap: Record<string, SchemePerformanceMetrics> = {};
      for (const s of allSchemes) {
        const perf = await schemeService.getSchemePerformanceSummary(s.schemeId);
        if (perf) metricsMap[s.schemeId] = perf;
      }
      setPerformanceMap(metricsMap);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = useMemo(() => {
    let result = schemes;

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }

    // Filter by Division
    if (selectedDivision !== 'ALL') {
      result = result.filter(s => s.divisionId === selectedDivision);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          (s.shortName && s.shortName.toLowerCase().includes(q)) ||
          (s.code && s.code.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.targetBeneficiaries && s.targetBeneficiaries.toLowerCase().includes(q))
      );
    }

    // Sorting
    return [...result].sort((a, b) => {
      const perfA = performanceMap[a.schemeId];
      const perfB = performanceMap[b.schemeId];

      if (selectedSort === 'projects') {
        return (perfB?.projectCount ?? 0) - (perfA?.projectCount ?? 0);
      }
      if (selectedSort === 'funding') {
        return (perfB?.releasedFunding ?? 0) - (perfA?.releasedFunding ?? 0);
      }
      if (selectedSort === 'utilization') {
        return (perfB?.utilizationPercentage ?? 0) - (perfA?.utilizationPercentage ?? 0);
      }
      if (selectedSort === 'priority') {
        const rank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (rank[perfB?.monitoringPriority ?? 'LOW'] ?? 0) - (rank[perfA?.monitoringPriority ?? 'LOW'] ?? 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [schemes, performanceMap, searchQuery, selectedCategory, selectedDivision, selectedSort]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Scheme Catalogue"
        subtitle="National Welfare Schemes & Programme Directory • MoSJE / DoSJE"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading scheme catalogue...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}
          showsVerticalScrollIndicator={false}
        >
          {/* Breadcrumb Navigation */}
          <TouchableOpacity
            style={styles.backBreadcrumb}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color={colors.brand.primary} />
            <Text style={styles.backBreadcrumbText}>Back to Dashboard</Text>
          </TouchableOpacity>

          {/* SEARCH & FILTER TOOLBAR */}
          <View style={styles.toolbarCard}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color={colors.text.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search schemes by name, short code, target group, or guidelines..."
                placeholderTextColor={colors.text.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={18} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Division Filter Dropdown / Row */}
            <View style={styles.filterSectionRow}>
              <Text style={styles.filterSectionLabel}>Division:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.divScroll}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.divFilterPill, selectedDivision === 'ALL' && styles.divFilterPillActive]}
                  onPress={() => setSelectedDivision('ALL')}
                >
                  <Text style={[styles.divFilterText, selectedDivision === 'ALL' && styles.divFilterTextActive]}>
                    All Divisions
                  </Text>
                </TouchableOpacity>
                {divisions.map(div => {
                  const isSelected = selectedDivision === div.divisionId;
                  return (
                    <TouchableOpacity
                      key={div.divisionId}
                      activeOpacity={0.8}
                      style={[styles.divFilterPill, isSelected && styles.divFilterPillActive]}
                      onPress={() => setSelectedDivision(div.divisionId)}
                    >
                      <Text style={[styles.divFilterText, isSelected && styles.divFilterTextActive]}>
                        {div.shortName || div.code || div.divisionId}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Category Pills */}
            <View style={styles.categoryScrollWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      activeOpacity={0.8}
                      style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                      onPress={() => setSelectedCategory(cat.key)}
                    >
                      <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Sort row */}
            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              {(
                [
                  { key: 'name', label: 'Name' },
                  { key: 'projects', label: 'Projects' },
                  { key: 'funding', label: 'Funding' },
                  { key: 'utilization', label: 'Utilization' },
                  { key: 'priority', label: 'Priority' },
                ] as const
              ).map(item => {
                const isSelected = selectedSort === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.8}
                    style={[styles.sortPill, isSelected && styles.sortPillActive]}
                    onPress={() => setSelectedSort(item.key)}
                  >
                    <Text style={[styles.sortPillText, isSelected && styles.sortPillTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SCHEME LIST HEADER */}
          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>
              Monitored Schemes ({filteredSchemes.length})
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionLinkRow}
              onPress={() => navigation.navigate('DivisionExplorer')}
            >
              <Text style={styles.actionLinkText}>View All Divisions</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.brand.primary} />
            </TouchableOpacity>
          </View>

          {filteredSchemes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="search-outline" size={40} color={colors.text.muted} />
              <Text style={styles.emptyTitle}>No matching schemes found</Text>
              <Text style={styles.emptySubtitle}>Try changing category or division filters</Text>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {filteredSchemes.map(scheme => {
                const perf = performanceMap[scheme.schemeId];
                const priority = perf?.monitoringPriority ?? scheme.monitoringPriority;
                const isCritical = priority === 'CRITICAL';
                const isHigh = priority === 'HIGH';

                return (
                  <TouchableOpacity
                    key={scheme.schemeId}
                    activeOpacity={0.85}
                    style={styles.schemeCard}
                    onPress={() =>
                      navigation.navigate('SchemeDetails', { schemeId: scheme.schemeId })
                    }
                  >
                    {/* Top row */}
                    <View style={styles.schemeCardHeader}>
                      <View style={styles.schemeTitleWrap}>
                        <View style={styles.codeRow}>
                          <Text style={styles.schemeCodeText}>{scheme.shortName || scheme.code || scheme.schemeId}</Text>
                          <DataSourceBadge dataSource={scheme.dataSource} size="sm" />
                        </View>
                        <Text style={styles.schemeName}>{scheme.name}</Text>
                        <Text style={styles.schemeCategoryText}>
                          {scheme.category || 'General Welfare'} • Division: {scheme.divisionId}
                        </Text>
                      </View>

                      {/* Monitoring Priority Badge */}
                      <View
                        style={[
                          styles.priorityBadge,
                          isCritical
                            ? styles.priorityBadgeCritical
                            : isHigh
                            ? styles.priorityBadgeHigh
                            : styles.priorityBadgeNormal,
                        ]}
                      >
                        <Ionicons
                          name={isCritical || isHigh ? 'warning' : 'shield-checkmark'}
                          size={12}
                          color={
                            isCritical
                              ? colors.status.highPriority
                              : isHigh
                              ? colors.status.warning
                              : colors.status.normal
                          }
                        />
                        <Text
                          style={[
                            styles.priorityBadgeText,
                            {
                              color: isCritical
                                ? colors.status.highPriority
                                : isHigh
                                ? colors.status.warning
                                : colors.status.normal,
                            },
                          ]}
                        >
                          {priority}
                        </Text>
                      </View>
                    </View>

                    {/* Target Group */}
                    {scheme.targetBeneficiaries ? (
                      <View style={styles.beneficiaryRow}>
                        <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
                        <Text style={styles.beneficiaryText} numberOfLines={1}>
                          Target: {scheme.targetBeneficiaries}
                        </Text>
                      </View>
                    ) : null}

                    {/* Operational metrics chips */}
                    <View style={styles.metricsGrid}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{perf?.projectCount ?? scheme.projectIds.length}</Text>
                        <Text style={styles.metricLbl}>Projects</Text>
                      </View>
                      <View style={styles.metricItemDivider} />
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{perf?.organizationCount ?? scheme.implementingOrganizationIds.length}</Text>
                        <Text style={styles.metricLbl}>Partners</Text>
                      </View>
                      <View style={styles.metricItemDivider} />
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>
                          ₹{((perf?.releasedFunding ?? 0) / 10000000).toFixed(2)}Cr
                        </Text>
                        <Text style={styles.metricLbl}>Released</Text>
                      </View>
                      <View style={styles.metricItemDivider} />
                      <View style={styles.metricItem}>
                        <Text
                          style={[
                            styles.metricVal,
                            (perf?.anomalyCount ?? 0) > 0 && { color: colors.status.highPriority },
                          ]}
                        >
                          {perf?.anomalyCount ?? 0}
                        </Text>
                        <Text style={styles.metricLbl}>Anomalies</Text>
                      </View>
                    </View>

                    {/* Utilization Meter Bar */}
                    <View style={styles.utilBarWrap}>
                      <View style={styles.utilLabelsRow}>
                        <Text style={styles.utilLblText}>Grant Utilization</Text>
                        <Text style={styles.utilValText}>
                          {perf?.utilizationPercentage ?? 0}% (₹{((perf?.utilizedFunding ?? 0) / 10000000).toFixed(2)}Cr utilized)
                        </Text>
                      </View>
                      <View style={styles.utilTrack}>
                        <View
                          style={[
                            styles.utilFill,
                            { width: `${Math.min(perf?.utilizationPercentage ?? 0, 100)}%` },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Card Footer */}
                    <View style={styles.cardFooter}>
                      <Text style={styles.viewDetailsText}>View Complete Scheme Dossier</Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.brand.primary} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text.secondary,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  desktopScrollContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  backBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  backBreadcrumbText: {
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  toolbarCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 6,
  },
  filterSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  filterSectionLabel: {
    fontSize: 12,
    color: colors.text.muted,
    marginRight: spacing.xs,
  },
  divScroll: {
    flex: 1,
  },
  divFilterPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginRight: 6,
  },
  divFilterPillActive: {
    backgroundColor: 'rgba(42, 92, 224, 0.1)',
    borderColor: colors.brand.primary,
  },
  divFilterText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  divFilterTextActive: {
    color: colors.brand.primary,
    fontWeight: '700',
  },
  categoryScrollWrap: {
    marginTop: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginRight: spacing.xs,
  },
  categoryPillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  categoryPillText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  categoryPillTextActive: {
    color: colors.text.inverse,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  sortLabel: {
    fontSize: 12,
    color: colors.text.muted,
    marginRight: spacing.xs,
  },
  sortPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  sortPillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  sortPillText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  sortPillTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLinkText: {
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginTop: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },
  cardsGrid: {
    gap: spacing.md,
  },
  schemeCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  schemeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  schemeTitleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  schemeCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
    backgroundColor: 'rgba(42, 92, 224, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
  },
  schemeCategoryText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  priorityBadgeNormal: {
    backgroundColor: 'rgba(30, 142, 90, 0.1)',
    borderColor: 'rgba(30, 142, 90, 0.3)',
  },
  priorityBadgeHigh: {
    backgroundColor: 'rgba(217, 140, 30, 0.1)',
    borderColor: 'rgba(217, 140, 30, 0.3)',
  },
  priorityBadgeCritical: {
    backgroundColor: 'rgba(196, 64, 44, 0.1)',
    borderColor: 'rgba(196, 64, 44, 0.3)',
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  beneficiaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  beneficiaryText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  metricLbl: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  metricItemDivider: {
    width: 1,
    backgroundColor: colors.neutral.border,
  },
  utilBarWrap: {
    marginTop: spacing.sm,
  },
  utilLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  utilLblText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  utilValText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
  },
  utilTrack: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.border,
    overflow: 'hidden',
  },
  utilFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: borderRadius.full,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand.primary,
  },
});
