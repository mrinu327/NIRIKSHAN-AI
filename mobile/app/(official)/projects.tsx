import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, RiskBadge } from '../../src/components/common';
import { RiskLevel } from '@nirikshan/shared-types';

export default function OfficialProjects() {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const projects = [
    {
      id: 'proj-001',
      name: 'Demo Welfare Institute - Coimbatore',
      scheme: 'DoSJE Integrated De-addiction Scheme',
      type: 'Rehabilitation Centre',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      riskLevel: RiskLevel.HIGH,
      riskScore: 82,
      beneficiaries: 92,
    },
    {
      id: 'proj-002',
      name: 'Demo Senior Care Sanctuary - Chennai',
      scheme: 'DoSJE Senior Citizens Care Scheme',
      type: 'Old Age Home',
      district: 'Chennai',
      state: 'Tamil Nadu',
      riskLevel: RiskLevel.LOW,
      riskScore: 24,
      beneficiaries: 54,
    },
    {
      id: 'proj-003',
      name: 'Demo De-addiction Kendra - Ludhiana',
      scheme: 'NAPDDR State Action Plan',
      type: 'De-addiction Centre',
      district: 'Ludhiana',
      state: 'Punjab',
      riskLevel: RiskLevel.HIGH,
      riskScore: 68,
      beneficiaries: 78,
    },
    {
      id: 'proj-004',
      name: 'Demo Skill Academy for Divyangjan - Bhopal',
      scheme: 'National Divyangjan Scheme',
      type: 'Vocational Centre',
      district: 'Bhopal',
      state: 'Madhya Pradesh',
      riskLevel: RiskLevel.MEDIUM,
      riskScore: 45,
      beneficiaries: 115,
    },
    {
      id: 'proj-005',
      name: 'Demo Rehabilitation Centre - Lucknow',
      scheme: 'Substance Abuse Initiative',
      type: 'Rehabilitation Centre',
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      riskLevel: RiskLevel.CRITICAL,
      riskScore: 89,
      beneficiaries: 65,
    },
    {
      id: 'proj-006',
      name: 'Demo Assisted Living Home - Pune',
      scheme: 'Integrated Care of Elderly',
      type: 'Old Age Home',
      district: 'Pune',
      state: 'Maharashtra',
      riskLevel: RiskLevel.LOW,
      riskScore: 18,
      beneficiaries: 48,
    },
  ];

  const filteredProjects = projects.filter((p) => {
    const matchesFilter = filter === 'ALL' || p.riskLevel === filter;
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="REGISTERED PROJECTS" subtitle="DoSJE Scheme Institutes & Monitoring" />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by institute name or district..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Chips */}
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

        {/* Project List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredProjects.map((p) => (
            <View key={p.id} style={styles.projectCard}>
              <View style={styles.projectTop}>
                <RiskBadge level={p.riskLevel} score={p.riskScore} showScore={true} />
                <Text style={styles.projectTypeBadge}>{p.type}</Text>
              </View>

              <Text style={styles.projectName}>{p.name}</Text>
              <Text style={styles.projectScheme}>{p.scheme}</Text>

              <View style={styles.projectFooter}>
                <Text style={styles.projectLocation}>
                  📍 {p.district}, {p.state}
                </Text>
                <Text style={styles.projectBeneficiaries}>
                  👥 {p.beneficiaries} Beneficiaries
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
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
    marginBottom: spacing.sm,
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
  filterRow: {
    maxHeight: 36,
    marginBottom: spacing.base,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
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
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.white,
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
  projectTypeBadge: {
    fontSize: 11,
    color: colors.textMuted,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  projectName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  projectScheme: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  projectLocation: {
    fontSize: 11,
    color: colors.textLight,
  },
  projectBeneficiaries: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
});
