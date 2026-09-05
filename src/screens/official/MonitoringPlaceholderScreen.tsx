/**
 * MonitoringPlaceholderScreen
 * MoSJE Official - National Institutes & Projects Directory
 * High-integrity facility registry and real-time telemetry oversight.
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockProjectService } from '../../services/mock/mockProjectService';
import { Project } from '../../types/project';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const MonitoringPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'Monitoring'>>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HIGH_PRIORITY' | 'INSPECTION_DUE' | 'COMPLIANT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Entrance animation
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

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
    const unsubscribe = navigation.addListener('focus', () => {
      loadProjects();
    });
    return unsubscribe;
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="National Facility Directory"
        subtitle="MoSJE Institutional Registry • Telemetry & Audit Profiles"
      />

      {loading ? (
        <LoadingState message="Fetching institutional telemetry directory..." />
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
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Chips with dynamic counts */}
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
                    activeOpacity={0.7}
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

            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id })}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={36} color={colors.text.muted} />
                <Text style={styles.emptyTitle}>No matching institutions found</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing the search query or adjusting your filter selection.
                </Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
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
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    minHeight: 34,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
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
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 4,
    textAlign: 'center',
  },
});

