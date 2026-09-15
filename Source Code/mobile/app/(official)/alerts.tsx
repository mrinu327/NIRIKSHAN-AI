import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, RiskBadge, Button } from '../../src/components/common';
import { RiskLevel } from '@nirikshan/shared-types';
import { useDashboardStore } from '../../src/store/useDashboardStore';

function formatTimeAgo(dateStr: string) {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(1, mins)} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export default function OfficialAlerts() {
  const [filter, setFilter] = useState('ALL');
  const {
    alerts,
    isLoading,
    fetchDashboardData,
    assignInspection,
    markFalsePositive,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchDashboardData} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No alerts found matching filter: {filter}</Text>
            </View>
          ) : (
            filtered.map((a) => (
              <View key={a.id} style={styles.alertCard}>
                <View style={styles.cardHeader}>
                  <RiskBadge level={a.severity} score={a.score} showScore={true} />
                  <Text style={styles.timeText}>{formatTimeAgo(a.timestamp)}</Text>
                </View>

                <Text style={styles.alertTitle}>{a.title}</Text>
                <Text style={styles.projectName}>
                  🏛️ {a.project} • {a.district}, {a.state}
                </Text>
                <Text style={styles.explanationText}>{a.explanation}</Text>

                {/* Human-in-the-loop action buttons */}
                {a.status === 'OPEN' ? (
                  <View style={styles.actionRow}>
                    <Button
                      title="Assign Surprise Inspection"
                      size="sm"
                      onPress={() => assignInspection(a.id)}
                      style={styles.actionBtn}
                    />
                    <Button
                      title="False Positive"
                      variant="outline"
                      size="sm"
                      onPress={() => markFalsePositive(a.id)}
                      style={styles.dismissBtn}
                    />
                  </View>
                ) : (
                  <View style={styles.statusBadgeRow}>
                    <View
                      style={[
                        styles.resolvedPill,
                        a.status === 'FALSE_POSITIVE'
                          ? styles.dismissedPill
                          : styles.assignedPill,
                      ]}
                    >
                      <Text style={styles.resolvedText}>
                        {a.status === 'FALSE_POSITIVE'
                          ? '✕ DISMISSED AS FALSE POSITIVE'
                          : '✓ PMU INSPECTION ASSIGNED'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
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
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  statusBadgeRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
  },
  resolvedPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  assignedPill: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  dismissedPill: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  resolvedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
});

