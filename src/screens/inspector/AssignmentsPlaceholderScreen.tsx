import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { InspectionCard } from '../../components/cards/InspectionCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { mockAssignmentService } from '../../services/mock/mockAssignmentService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const AssignmentsPlaceholderScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const activeOfficerId = currentUser?.id || 'USR-INSP-DEMO-004';
  const activeBadgeId = currentUser?.badgeId || 'PMU-DEMO-004';

  const [assignments, setAssignments] = useState<InspectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = useCallback(async () => {
    try {
      const data = await mockInspectionService.getAssignedInspections();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments, currentUser]);

  const handleAcknowledge = async (inspectionId: string) => {
    try {
      await mockAssignmentService.acknowledgeAssignment(
        inspectionId,
        activeOfficerId,
        currentUser?.name || 'Demo Field Inspector',
        activeBadgeId
      );
      await loadAssignments();
    } catch (err) {
      console.error('Error acknowledging assignment:', err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Field Assignments"
        subtitle={`Logged in as ${currentUser?.name || 'Inspector'} (${activeBadgeId})`}
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
            <InspectionCard
              key={assignment.id}
              inspection={assignment}
              isInspectorView={true}
              onAcknowledge={() => handleAcknowledge(assignment.id)}
            />
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
