/**
 * DivisionExplorerScreen
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Official Directory & Intelligence Console for Administrative Divisions
 * Enables MoSJE leadership and PMU officers to explore division-level mandates,
 * scheme allocations, active project footprints, and operational health.
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
import { DataSourceBadge } from '../../components/common/DataSourceBadge';
import { divisionService } from '../../services/master/divisionService';
import { Division, DivisionPerformanceMetrics } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const DivisionExplorerScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [performanceMap, setPerformanceMap] = useState<Record<string, DivisionPerformanceMetrics>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'name' | 'schemes' | 'projects' | 'utilization' | 'anomalies'>('name');

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    try {
      setLoading(true);
      const list = await divisionService.getAllDivisions();
      setDivisions(list);

      const metricsMap: Record<string, DivisionPerformanceMetrics> = {};
      for (const div of list) {
        const perf = await divisionService.getDivisionPerformanceSummary(div.divisionId);
        metricsMap[div.divisionId] = perf;
      }
      setPerformanceMap(metricsMap);
    } catch (err) {
      console.error('Failed to load divisions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDivisions = useMemo(() => {
    let result = divisions;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          (d.shortName && d.shortName.toLowerCase().includes(q)) ||
          (d.code && d.code.toLowerCase().includes(q)) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          (d.responsibleUnit && d.responsibleUnit.toLowerCase().includes(q))
      );
    }

    return [...result].sort((a, b) => {
      const perfA = performanceMap[a.divisionId];
      const perfB = performanceMap[b.divisionId];

      if (selectedSort === 'schemes') {
        return (perfB?.totalSchemes ?? 0) - (perfA?.totalSchemes ?? 0);
      }
      if (selectedSort === 'projects') {
        return (perfB?.totalProjects ?? 0) - (perfA?.totalProjects ?? 0);
      }
      if (selectedSort === 'utilization') {
        return (perfB?.utilizationPercentage ?? 0) - (perfA?.utilizationPercentage ?? 0);
      }
      if (selectedSort === 'anomalies') {
        return (perfB?.totalAnomalies ?? 0) - (perfA?.totalAnomalies ?? 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [divisions, performanceMap, searchQuery, selectedSort]);

  // Aggregate stats
  const totalDivisionsCount = divisions.length;
  const totalSchemesCount = Object.values(performanceMap).reduce((acc, p) => acc + p.totalSchemes, 0);
  const totalProjectsCount = Object.values(performanceMap).reduce((acc, p) => acc + p.totalProjects, 0);
  const totalCriticalFlags = Object.values(performanceMap).reduce((acc, p) => acc + p.highSeverityAnomalies, 0);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Administrative Divisions"
        subtitle="Ministry of Social Justice and Empowerment • Division & Desk Directory"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading division intelligence...</Text>
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

          {/* PROVENANCE SCOPE CLARIFICATION BANNER */}
          <View style={styles.scopeClarificationCard}>
            <View style={styles.scopeClarificationHeader}>
              <Ionicons name="information-circle" size={16} color={colors.brand.primary} />
              <Text style={styles.scopeClarificationTitle}>Administrative Scope & Provenance Classification</Text>
            </View>
            <Text style={styles.scopeClarificationText}>
              All currently represented division and scheme records have explicit provenance classification; official records are verified against authoritative public sources, while allied/public and demo records are clearly labelled.
            </Text>
            <View style={styles.scopePillsRow}>
              <View style={[styles.scopePill, styles.scopePillOfficial]}>
                <View style={[styles.pillDot, { backgroundColor: colors.status.normal }]} />
                <Text style={styles.scopePillText}>DIV-SD, DIV-SCD: Official DoSJE</Text>
              </View>
              <View style={[styles.scopePill, styles.scopePillAllied]}>
                <View style={[styles.pillDot, { backgroundColor: colors.brand.primary }]} />
                <Text style={styles.scopePillText}>DIV-DEPWD: Allied Dept (MoSJE), NOT DoSJE</Text>
              </View>
              <View style={[styles.scopePill, styles.scopePillDemo]}>
                <View style={[styles.pillDot, { backgroundColor: colors.status.warning }]} />
                <Text style={styles.scopePillText}>DIV-SAGE: Demo / Prototype Desk</Text>
              </View>
            </View>
          </View>

          {/* TOP METRICS SUMMARY DECK */}
          <View style={[styles.statsDeck, isDesktop && styles.desktopStatsDeck]}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name="business" size={20} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={styles.statValue}>{totalDivisionsCount}</Text>
                <Text style={styles.statLabel}>Divisions</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(42, 92, 224, 0.1)' }]}>
                <Ionicons name="layers" size={20} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={styles.statValue}>{totalSchemesCount}</Text>
                <Text style={styles.statLabel}>Welfare Schemes</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(30, 142, 90, 0.1)' }]}>
                <Ionicons name="folder-open" size={20} color={colors.status.normal} />
              </View>
              <View>
                <Text style={styles.statValue}>{totalProjectsCount}</Text>
                <Text style={styles.statLabel}>Monitored Projects</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconWrap,
                  {
                    backgroundColor:
                      totalCriticalFlags > 0 ? 'rgba(196, 64, 44, 0.1)' : 'rgba(30, 142, 90, 0.1)',
                  },
                ]}
              >
                <Ionicons
                  name={totalCriticalFlags > 0 ? 'alert-circle' : 'shield-checkmark'}
                  size={20}
                  color={totalCriticalFlags > 0 ? colors.status.highPriority : colors.status.normal}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.statValue,
                    totalCriticalFlags > 0 && { color: colors.status.highPriority },
                  ]}
                >
                  {totalCriticalFlags}
                </Text>
                <Text style={styles.statLabel}>Critical Flags</Text>
              </View>
            </View>
          </View>

          {/* SEARCH & SORT TOOLBAR */}
          <View style={styles.toolbarCard}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color={colors.text.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search divisions by name, code, mandate, or desk..."
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

            {/* Sort pills */}
            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              {(
                [
                  { key: 'name', label: 'Name' },
                  { key: 'schemes', label: 'Schemes' },
                  { key: 'projects', label: 'Projects' },
                  { key: 'utilization', label: 'Utilization' },
                  { key: 'anomalies', label: 'Anomalies' },
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

          {/* DIVISION CARDS DIRECTORY */}
          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>
              Represented Divisions & Desks ({filteredDivisions.length})
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionLinkRow}
              onPress={() => navigation.navigate('SchemeExplorer')}
            >
              <Text style={styles.actionLinkText}>View All Schemes</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.brand.primary} />
            </TouchableOpacity>
          </View>

          {filteredDivisions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="search-outline" size={40} color={colors.text.muted} />
              <Text style={styles.emptyTitle}>No matching divisions found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search criteria</Text>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {filteredDivisions.map(division => {
                const perf = performanceMap[division.divisionId];
                const priority = perf?.monitoringPriority ?? 'LOW';
                const isCritical = priority === 'CRITICAL';
                const isHigh = priority === 'HIGH';

                return (
                  <TouchableOpacity
                    key={division.divisionId}
                    activeOpacity={0.85}
                    style={styles.divisionCard}
                    onPress={() =>
                      navigation.navigate('DivisionDetails', { divisionId: division.divisionId })
                    }
                  >
                    {/* Header */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardTitleWrap}>
                        <View style={styles.codeBadgeRow}>
                          <Text style={styles.codeText}>{division.code || division.divisionId}</Text>
                          <DataSourceBadge dataSource={division.dataSource} size="sm" />
                        </View>
                        <Text style={styles.cardName}>{division.name}</Text>
                        {division.responsibleUnit ? (
                          <Text style={styles.cardUnit}>
                            Desk: {division.responsibleUnit}
                          </Text>
                        ) : null}

                        {/* Visually obvious Provenance / Status Pill */}
                        <View style={styles.cardScopeBadgeRow}>
                          {division.divisionId === 'DIV-SD' || division.divisionId === 'DIV-SCD' ? (
                            <View style={styles.cardScopePillOfficial}>
                              <Ionicons name="shield-checkmark" size={11} color={colors.status.normal} />
                              <Text style={styles.cardScopeTextOfficial}>OFFICIAL / VERIFIED DoSJE DIVISION</Text>
                            </View>
                          ) : division.divisionId === 'DIV-DEPWD' ? (
                            <View style={styles.cardScopePillAllied}>
                              <Ionicons name="business" size={11} color={colors.brand.primary} />
                              <Text style={styles.cardScopeTextAllied}>PUBLIC / VERIFIED ALLIED DEPT (MoSJE) — NOT DoSJE</Text>
                            </View>
                          ) : (
                            <View style={styles.cardScopePillDemo}>
                              <Ionicons name="flask" size={11} color={colors.status.warning} />
                              <Text style={styles.cardScopeTextDemo}>DEMO / UNVERIFIED PROTOTYPE DESK</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Monitoring Priority Flag */}
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

                    {/* Description */}
                    {division.description ? (
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {division.description}
                      </Text>
                    ) : null}

                    {/* Operational metrics chips */}
                    <View style={styles.metricsGrid}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{perf?.totalSchemes ?? division.schemeIds.length}</Text>
                        <Text style={styles.metricLbl}>Schemes</Text>
                      </View>
                      <View style={styles.metricItemDivider} />
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{perf?.totalProjects ?? division.projectIds.length}</Text>
                        <Text style={styles.metricLbl}>Projects</Text>
                      </View>
                      <View style={styles.metricItemDivider} />
                      <View style={styles.metricItem}>
                        <Text style={styles.metricVal}>{perf?.activeProjects ?? 0}</Text>
                        <Text style={styles.metricLbl}>Active</Text>
                      </View>
                      <View style={styles.metricItemDivider} />
                      <View style={styles.metricItem}>
                        <Text
                          style={[
                            styles.metricVal,
                            (perf?.totalAnomalies ?? 0) > 0 && { color: colors.status.highPriority },
                          ]}
                        >
                          {perf?.totalAnomalies ?? 0}
                        </Text>
                        <Text style={styles.metricLbl}>Anomalies</Text>
                      </View>
                    </View>

                    {/* Financial Progress Bar */}
                    <View style={styles.fundingBarContainer}>
                      <View style={styles.fundingLabelsRow}>
                        <Text style={styles.fundingLabel}>Fund Utilization</Text>
                        <Text style={styles.fundingPercent}>
                          {perf?.utilizationPercentage ?? 0}% (₹{perf?.totalUtilizedCr ?? 0}Cr / ₹{perf?.totalReleasedCr ?? 0}Cr)
                        </Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min(perf?.utilizationPercentage ?? 0, 100)}%` },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Footer Action */}
                    <View style={styles.cardFooterRow}>
                      <Text style={styles.viewDetailsText}>View Full Intelligence Dossier</Text>
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
  scopeClarificationCard: {
    backgroundColor: 'rgba(42, 92, 224, 0.05)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(42, 92, 224, 0.2)',
    marginBottom: spacing.base,
  },
  scopeClarificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  scopeClarificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  scopeClarificationText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  scopePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  scopePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  scopePillOfficial: {
    backgroundColor: 'rgba(30, 142, 90, 0.08)',
    borderColor: 'rgba(30, 142, 90, 0.25)',
  },
  scopePillAllied: {
    backgroundColor: 'rgba(42, 92, 224, 0.08)',
    borderColor: 'rgba(42, 92, 224, 0.25)',
  },
  scopePillDemo: {
    backgroundColor: 'rgba(217, 140, 30, 0.08)',
    borderColor: 'rgba(217, 140, 30, 0.25)',
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scopePillText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  statsDeck: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  desktopStatsDeck: {
    flexWrap: 'nowrap',
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(42, 92, 224, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
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
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
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
    fontSize: 12,
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
  divisionCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  codeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
    backgroundColor: 'rgba(42, 92, 224, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
  },
  cardUnit: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  cardScopeBadgeRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardScopePillOfficial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30, 142, 90, 0.1)',
    borderColor: 'rgba(30, 142, 90, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  cardScopeTextOfficial: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.normal,
    letterSpacing: 0.3,
  },
  cardScopePillAllied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(42, 92, 224, 0.1)',
    borderColor: 'rgba(42, 92, 224, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  cardScopeTextAllied: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.primary,
    letterSpacing: 0.3,
  },
  cardScopePillDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 140, 30, 0.1)',
    borderColor: 'rgba(217, 140, 30, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  cardScopeTextDemo: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.warning,
    letterSpacing: 0.3,
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
    letterSpacing: 0.5,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginTop: spacing.sm,
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
    fontSize: 16,
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
  fundingBarContainer: {
    marginTop: spacing.sm,
  },
  fundingLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fundingLabel: {
    fontSize: 12,
    color: colors.text.muted,
  },
  fundingPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressTrack: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: borderRadius.full,
  },
  cardFooterRow: {
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
