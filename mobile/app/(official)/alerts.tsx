import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, RiskBadge, Button } from '../../src/components/common';
import { RiskLevel } from '@nirikshan/shared-types';

export default function OfficialAlerts() {
  const [filter, setFilter] = useState('ALL');

  const alerts = [
    {
      id: 'anom-001',
      title: 'High Attendance Discrepancy (33.7%)',
      project: 'Demo Welfare Institute - Coimbatore',
      severity: RiskLevel.HIGH,
      score: 82,
      time: '2 hours ago',
      explanation:
        'Reported: 92 beneficiaries vs Observed: ~61 unique individuals by dining hall computer vision during peak lunch hours.',
    },
    {
      id: 'anom-002',
      title: 'CCTV Offline During Working Hours',
      project: 'Demo De-addiction Kendra - Ludhiana',
      severity: RiskLevel.HIGH,
      score: 68,
      time: '4 hours ago',
      explanation:
        'Camera "Ward 2 Rehabilitation Hall" stopped transmitting heartbeats 4 hours ago without maintenance notice.',
    },
    {
      id: 'anom-003',
      title: 'Attendance Sanction Exceeded (+25.7%)',
      project: 'Demo Rehabilitation Centre - Lucknow',
      severity: RiskLevel.CRITICAL,
      score: 89,
      time: '6 hours ago',
      explanation:
        'Registered facility capacity is 70 beds, but NGO reported 88 active beneficiaries. Video analytics observe only ~45 attendees.',
    },
    {
      id: 'anom-004',
      title: 'Possible Duplicate Evidence Re-use',
      project: 'Demo Drug De-addiction - Ahmedabad',
      severity: RiskLevel.HIGH,
      score: 84,
      time: '12 hours ago',
      explanation:
        'Submitted photo evidence matches identical SHA-256 hash submitted 45 days ago in another quarterly inspection report.',
    },
  ];

  const filtered = filter === 'ALL' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="ALERT CENTER" subtitle="AI Anomaly Detection & Human-in-the-Loop Actions" />

      <View style={styles.container}>
        {/* Severity Filter Chips */}
        <View style={styles.filterBar}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, filter === s && styles.filterChipActive]}
              onPress={() => setFilter(s)}
            >
              <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {filtered.map((a) => (
            <View key={a.id} style={styles.alertCard}>
              <View style={styles.cardHeader}>
                <RiskBadge level={a.severity} score={a.score} showScore={true} />
                <Text style={styles.timeText}>{a.time}</Text>
              </View>

              <Text style={styles.alertTitle}>{a.title}</Text>
              <Text style={styles.projectName}>{a.project}</Text>
              <Text style={styles.explanationText}>{a.explanation}</Text>

              {/* Human-in-the-loop action buttons */}
              <View style={styles.actionRow}>
                <Button
                  title="Assign Surprise Inspection"
                  size="sm"
                  onPress={() => {}}
                  style={styles.actionBtn}
                />
                <Button
                  title="False Positive"
                  variant="outline"
                  size="sm"
                  onPress={() => {}}
                  style={styles.dismissBtn}
                />
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
  filterBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  timeText: {
    fontSize: 11,
    color: colors.textLight,
  },
  alertTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  projectName: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  explanationText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: spacing.xs,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 2,
  },
  dismissBtn: {
    flex: 1,
  },
});
