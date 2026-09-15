import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, RiskBadge } from '../../src/components/common';
import { api } from '../../src/services/api';
import { Project, RiskLevel } from '@nirikshan/shared-types';

export default function OfficialProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const filteredProjects = projects.filter((p) => {
    const matchesFilter = filter === 'ALL' || p.riskLevel === filter;
    const query = search.toLowerCase();
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(query) ||
      p.district.toLowerCase().includes(query) ||
      p.organization.toLowerCase().includes(query) ||
      p.state.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const handleOpenProject = (projectId: string) => {
    router.push({
      pathname: '/(official)/project-details',
      params: { id: projectId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="REGISTERED PROJECTS" subtitle="DoSJE Scheme Institutes & Monitoring" />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by institute, NGO, or district..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.filterChip, filter === lvl && styles.filterChipActive]}
                onPress={() => setFilter(lvl)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === lvl && styles.filterChipTextActive,
                  ]}
                >
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.projectCountBadge}>{filteredProjects.length} Projects</Text>
        </View>

        {/* Project List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading facilities & risk telemetry...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {filteredProjects.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📂</Text>
                <Text style={styles.emptyTitle}>No Matching Facilities Found</Text>
                <Text style={styles.emptySub}>
                  Try clearing the search query or changing the risk level filter.
                </Text>
              </View>
            ) : (
              filteredProjects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.projectCard}
                  activeOpacity={0.85}
                  onPress={() => handleOpenProject(p.id)}
                >
                  <View style={styles.projectTop}>
                    <RiskBadge level={p.riskLevel as RiskLevel} score={p.riskScore} showScore={true} />
                    <View style={styles.topRightTags}>
                      <Text style={styles.projectTypeBadge}>{p.type}</Text>
                      {p.status === 'UNDER_INVESTIGATION' && (
                        <View style={styles.investigationBadge}>
                          <Text style={styles.investigationText}>AUDIT ACTIVE</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={styles.projectName}>{p.name}</Text>
                  <Text style={styles.projectOrg}>🏢 {p.organization}</Text>
                  <Text style={styles.projectScheme}>{p.scheme}</Text>

                  <View style={styles.projectStatsRow}>
                    <View style={styles.statPill}>
                      <Text style={styles.statLabel}>Capacity:</Text>
                      <Text style={styles.statValue}> {p.capacity} beds</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statLabel}>Beneficiaries:</Text>
                      <Text style={styles.statValue}> {p.beneficiaryCount}</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statLabel}>Staff:</Text>
                      <Text style={styles.statValue}> {p.staffCount}</Text>
                    </View>
                  </View>

                  <View style={styles.projectFooter}>
                    <Text style={styles.projectLocation}>
                      📍 {p.district}, {p.state}
                    </Text>
                    <Text style={styles.viewDetailsPrompt}>
                      Open 7-Tab Profile →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    padding: spacing.base,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs + 2,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 12,
    color: colors.textLight,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  projectCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    paddingLeft: spacing.xs,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  emptySub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  projectTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  topRightTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectTypeBadge: {
    fontSize: 10,
    color: colors.textMuted,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  investigationBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  investigationText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.danger,
  },
  projectName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  projectOrg: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  projectScheme: {
    fontSize: 11,
    color: colors.secondary,
    marginTop: 1,
  },
  projectStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs + 2,
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  statValue: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  projectLocation: {
    fontSize: 11,
    color: colors.textLight,
  },
  viewDetailsPrompt: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
});
