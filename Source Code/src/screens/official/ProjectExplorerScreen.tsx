/**
 * ProjectExplorerScreen
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Official Project Intelligence & Directory Console.
 * Multi-criteria search, filtering (status, priority, scheme), sorting,
 * executive KPI rollups, and drill-down to Project Details Dossier.
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
import { ProjectCard } from '../../components/project/ProjectCard';
import { projectService } from '../../services/master/projectService';
import { projectMonitoringEngine } from '../../services/analytics/projectMonitoringEngine';
import { MasterProject, MonitoringPriority, ProjectStatus, ProjectMonitoringProfile } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Statuses' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'INSPECTION_DUE', label: 'Inspection Due' },
  { key: 'DELAYED', label: 'Delayed' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'COMPLETED', label: 'Completed' },
];

const PRIORITY_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Priorities' },
  { key: 'CRITICAL', label: 'Critical' },
  { key: 'HIGH', label: 'High Attention' },
  { key: 'MEDIUM', label: 'Moderate' },
  { key: 'LOW', label: 'Low Concern' },
];

export const ProjectExplorerScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProjectMonitoringProfile>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'name' | 'sanctioned' | 'progress' | 'compliance'>('code');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await projectService.getProjects();
      setProjects(list);

      const profileMap: Record<string, ProjectMonitoringProfile> = {};
      for (const p of list) {
        const prof = projectMonitoringEngine.calculateProjectMonitoringProfile(p.projectId);
        if (prof) {
          profileMap[p.projectId] = prof;
        }
      }
      setProfiles(profileMap);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          (p.projectCode ? p.projectCode.toLowerCase().includes(q) : false) ||
          p.name.toLowerCase().includes(q) ||
          (p.location?.district ? p.location.district.toLowerCase().includes(q) : false) ||
          (p.location?.state ? p.location.state.toLowerCase().includes(q) : false) ||
          p.schemeId.toLowerCase().includes(q) ||
          p.organizationId.toLowerCase().includes(q)
      );
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter(p => p.status === selectedStatus);
    }

    if (selectedPriority !== 'ALL') {
      result = result.filter(p => {
        const prof = profiles[p.projectId];
        return prof ? prof.priority === selectedPriority : false;
      });
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'sanctioned':
          return b.sanctionedAmount - a.sanctionedAmount;
        case 'progress':
          return (b.progressPercentage ?? 0) - (a.progressPercentage ?? 0);
        case 'compliance':
          return (b.complianceScore ?? 0) - (a.complianceScore ?? 0);
        case 'code':
        default:
          return (a.projectCode || a.projectId).localeCompare(b.projectCode || b.projectId);
      }
    });
  }, [projects, profiles, searchQuery, selectedStatus, selectedPriority, sortBy]);

  // Summary KPIs
  const kpis = useMemo(() => {
    const total = projects.length;
    let totalSanctioned = 0;
    let totalBeneficiaries = 0;
    let highPriorityCount = 0;

    for (const p of projects) {
      totalSanctioned += p.sanctionedAmount || 0;
      totalBeneficiaries += p.beneficiaryTarget || 0;
      const prof = profiles[p.projectId];
      if (prof && (prof.priority === 'HIGH' || prof.priority === 'CRITICAL')) {
        highPriorityCount++;
      } else if (p.anomalyCount && p.anomalyCount > 0) {
        highPriorityCount++;
      }
    }

    return {
      total,
      totalSanctioned,
      totalBeneficiaries,
      highPriorityCount,
    };
  }, [projects, profiles]);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Project Intelligence"
        subtitle="Central Scheme Operations & Project Directory"
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

        {/* Executive Header Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextCol}>
            <View style={styles.provenanceBadge}>
              <Text style={styles.provenanceText}>CENTRAL PROJECT REGISTRY</Text>
            </View>
            <Text style={styles.heroTitle}>Operational Project Directory</Text>
            <Text style={styles.heroSubtitle}>
              Continuous administrative monitoring of sanctioned welfare interventions, physical milestones,
              grant disbursement tranches, and optical beneficiary counts under MoSJE / DoSJE programs.
            </Text>
          </View>
        </View>

        {/* Top KPI Statistics */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, isDesktop ? styles.kpiCardDesktop : styles.kpiCardMobile]}>
            <Text style={styles.kpiValue}>{kpis.total}</Text>
            <Text style={styles.kpiLabel}>Sanctioned Projects</Text>
          </View>
          <View style={[styles.kpiCard, isDesktop ? styles.kpiCardDesktop : styles.kpiCardMobile]}>
            <Text style={[styles.kpiValue, kpis.highPriorityCount > 0 ? { color: colors.status.highPriority } : {}]}>
              {kpis.highPriorityCount}
            </Text>
            <Text style={styles.kpiLabel}>Monitoring Priority</Text>
          </View>
          <View style={[styles.kpiCard, isDesktop ? styles.kpiCardDesktop : styles.kpiCardMobile]}>
            <Text style={styles.kpiValue}>{formatCurrency(kpis.totalSanctioned)}</Text>
            <Text style={styles.kpiLabel}>Sanctioned Grants</Text>
          </View>
          <View style={[styles.kpiCard, isDesktop ? styles.kpiCardDesktop : styles.kpiCardMobile]}>
            <Text style={[styles.kpiValue, { color: colors.status.normal }]}>
              {kpis.totalBeneficiaries}
            </Text>
            <Text style={styles.kpiLabel}>Target Reach</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by project code, title, district, state..."
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

        {/* Status Filter Chips */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>PROJECT STATUS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {STATUS_FILTERS.map(sf => {
              const active = selectedStatus === sf.key;
              return (
                <TouchableOpacity
                  key={sf.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedStatus(sf.key)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {sf.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Priority Filter Chips */}
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

        {/* Sort & Results Count Bar */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsCount}>
            Showing <Text style={styles.bold}>{filteredProjects.length}</Text> of {projects.length} projects
          </Text>
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort:</Text>
            {(['code', 'name', 'sanctioned', 'progress', 'compliance'] as const).map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
                onPress={() => setSortBy(s)}
              >
                <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Projects List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={styles.loadingText}>Loading project intelligence...</Text>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>No Matching Projects</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query, status, or monitoring priority filters.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
                setSelectedPriority('ALL');
              }}
            >
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.projectId}
                project={project}
                profile={profiles[project.projectId]}
                onPress={() =>
                  navigation.navigate('ProjectDetails', { projectId: project.projectId })
                }
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
    padding: spacing.base,
    paddingBottom: spacing.xl * 2,
  },
  contentDesktop: {
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  backBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  breadcrumbText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
    marginLeft: 4,
  },
  heroCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  heroTextCol: {
    flex: 1,
  },
  provenanceBadge: {
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
  },
  provenanceText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  kpiCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    ...shadows.xs,
  },
  kpiCardMobile: {
    flex: 1,
    minWidth: '47%',
  },
  kpiCardDesktop: {
    flex: 1,
    minWidth: '22%',
  },
  kpiValue: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  kpiLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: spacing.sm,
    minHeight: 46,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    fontFamily: typography.fontFamily,
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 6,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    marginBottom: spacing.sm,
  },
  filterSectionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterChipText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    fontFamily: typography.fontFamily,
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  resultsCount: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
  },
  bold: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.muted,
    marginRight: 2,
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 40,
    minWidth: 44,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.neutral.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortBtnActive: {
    backgroundColor: colors.brand.primary,
  },
  sortBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  sortBtnTextActive: {
    fontFamily: typography.fontFamily,
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  listContainer: {
    gap: spacing.xs,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  resetBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  resetBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
});