/**
 * InspectionsPlaceholderScreen
 * MoSJE Official - Surprise Inspection & PMU Dispatch Management
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { InspectionCard } from '../../components/cards/InspectionCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const InspectionsPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'Inspections'>>();
  const [inspections, setInspections] = useState<InspectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SURPRISE' | 'ROUTINE'>('ALL');

  const loadInspections = async () => {
    try {
      const data = await mockInspectionService.getAssignedInspections();
      setInspections(data);
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
    const unsubscribe = navigation.addListener('focus', () => {
      loadInspections();
    });
    return unsubscribe;
  }, [navigation]);

  const filteredInspections = inspections.filter((i) => {
    if (filter === 'SURPRISE') return i.type === 'Surprise Inspection';
    if (filter === 'ROUTINE') return i.type === 'Routine Inspection' || i.type === 'Special Audit';
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Field Inspection Oversight"
        subtitle="Surprise and routine PMU audits across districts"
      />

      {loading ? (
        <LoadingState message="Loading inspection assignments..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {[
              { id: 'ALL', label: `All Orders (${inspections.length})` },
              { id: 'SURPRISE', label: 'Surprise Audits' },
              { id: 'ROUTINE', label: 'Routine / Scheduled' },
            ].map((chip) => {
              const isActive = filter === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setFilter(chip.id as any)}
                  activeOpacity={0.7}
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

          {filteredInspections.map((inspection) => (
            <InspectionCard key={inspection.id} inspection={inspection} />
          ))}
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
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
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
});
