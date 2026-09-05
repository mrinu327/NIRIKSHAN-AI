import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';

export default function OfficialInspections() {
  const ongoingInspections = [
    {
      id: 'insp-001',
      project: 'Demo Welfare Institute - Coimbatore',
      inspector: 'Priya Verma (PMU Lead)',
      type: 'SURPRISE PHYSICAL',
      status: 'IN_PROGRESS',
      started: '2 hours ago',
      geofence: 'VERIFIED (43m from site)',
    },
    {
      id: 'insp-002',
      project: 'Demo Senior Care Sanctuary - Chennai',
      inspector: 'Priya Verma (PMU Lead)',
      type: 'ROUTINE AUDIT',
      status: 'COMPLETED',
      started: '7 days ago',
      geofence: 'VERIFIED',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="INSPECTIONS & VC" subtitle="Surprise Field Verification & Oversight" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Surprise Action Card */}
        <Card
          title="Trigger Surprise Verification"
          subtitle="Random selection of eligible inspector or instant VC call"
        >
          <Text style={styles.actionDesc}>
            Prioritize verification based on AI anomaly scores. Choose between field deployment and random video conferencing.
          </Text>
          <View style={styles.actionButtons}>
            <Button
              title="🎲 Assign Random Inspector"
              onPress={() => {}}
              style={styles.primaryAction}
            />
            <Button
              title="📹 Instant Surprise VC Call"
              variant="secondary"
              onPress={() => {}}
            />
          </View>
        </Card>

        {/* Ongoing Inspections List */}
        <Text style={styles.sectionHeader}>Active & Recent Inspections</Text>
        {ongoingInspections.map((insp) => (
          <View key={insp.id} style={styles.inspCard}>
            <View style={styles.inspTop}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{insp.type}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  insp.status === 'IN_PROGRESS'
                    ? styles.statusProgress
                    : styles.statusComplete,
                ]}
              >
                <Text style={styles.statusText}>{insp.status}</Text>
              </View>
            </View>

            <Text style={styles.inspProject}>{insp.project}</Text>
            <Text style={styles.inspInspector}>👤 Inspector: {insp.inspector}</Text>

            <View style={styles.inspMeta}>
              <Text style={styles.metaText}>⏱️ Started: {insp.started}</Text>
              <Text style={styles.metaText}>📍 Geofence: {insp.geofence}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    padding: spacing.base,
    backgroundColor: colors.background,
  },
  actionDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  actionButtons: {
    gap: spacing.sm,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  sectionHeader: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  inspCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  inspTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusProgress: {
    backgroundColor: '#FEF3C7',
  },
  statusComplete: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  inspProject: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  inspInspector: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  inspMeta: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: colors.textLight,
  },
});
