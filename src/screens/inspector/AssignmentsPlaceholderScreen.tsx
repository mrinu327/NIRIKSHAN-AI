/**
 * AssignmentsPlaceholderScreen
 * PMU Inspector - All Field Assignments & Route Map Preview
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { InspectionCard } from '../../components/cards/InspectionCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const AssignmentsPlaceholderScreen: React.FC = () => {
  const [assignments, setAssignments] = useState<InspectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockInspectionService.getAssignedInspections().then((data) => {
      setAssignments(data);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Field Assignments"
        subtitle="Assigned institutes and inspection orders"
      />

      {loading ? (
        <LoadingState message="Loading assignment queue..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <SectionHeader
            title="Active Inspection Orders"
            subtitle="Follow MoSJE protocol during on-site visit"
            badgeCount={assignments.length}
          />
          {assignments.map((assignment) => (
            <InspectionCard key={assignment.id} inspection={assignment} />
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
});
