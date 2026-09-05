import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card } from '../../src/components/common';

export default function InspectorReports() {
  const reports = [
    {
      id: 'rep-001',
      project: 'Demo Senior Care Sanctuary - Chennai',
      type: 'Routine Semi-Annual Audit',
      date: '28 Aug 2026',
      status: 'SUBMITTED & VERIFIED',
      evidenceCount: 4,
      hashStatus: 'SHA-256 HASH VERIFIED',
      outcome: 'Compliant with DoSJE elder care standards.',
    },
    {
      id: 'rep-002',
      project: 'Demo Skill Academy - Bhopal',
      type: 'Surprise Physical Inspection',
      date: '15 Aug 2026',
      status: 'AUDIT RECORDED',
      evidenceCount: 6,
      hashStatus: 'SHA-256 HASH VERIFIED',
      outcome: 'Divyangjan vocational training equipment verified operational.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="INSPECTION REPORTS" subtitle="Submitted Field Evidence & Audit History" />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>My Completed Field Reports</Text>

        {reports.map((r) => (
          <Card key={r.id} style={styles.reportCard}>
            <View style={styles.reportTop}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{r.status}</Text>
              </View>
              <Text style={styles.reportDate}>{r.date}</Text>
            </View>

            <Text style={styles.projectName}>{r.project}</Text>
            <Text style={styles.reportType}>{r.type}</Text>

            <View style={styles.outcomeBox}>
              <Text style={styles.outcomeText}>{r.outcome}</Text>
            </View>

            <View style={styles.reportFooter}>
              <Text style={styles.evidenceText}>📁 {r.evidenceCount} Media Items</Text>
              <Text style={styles.hashText}>🔒 {r.hashStatus}</Text>
            </View>
          </Card>
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
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  reportCard: {
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.success,
  },
  reportDate: {
    fontSize: 11,
    color: colors.textLight,
  },
  projectName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  reportType: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  outcomeBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
  },
  outcomeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  evidenceText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  hashText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },
});
