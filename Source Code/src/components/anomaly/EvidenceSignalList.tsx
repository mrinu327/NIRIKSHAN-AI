/**
 * EvidenceSignalList Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Displays multi-source evidence signals supporting an observed anomaly.
 * Shows status (CORROBORATING, AVAILABLE, MISSING) and signal descriptions.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnomalySourceSignal } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface EvidenceSignalListProps {
  signals: AnomalySourceSignal[];
  style?: ViewStyle;
}

export const EvidenceSignalList: React.FC<EvidenceSignalListProps> = ({ signals, style }) => {
  if (!signals || signals.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Text style={styles.emptyText}>No cross-source evidence signals registered.</Text>
      </View>
    );
  }

  const getSignalStatusTheme = (status: 'AVAILABLE' | 'MISSING' | 'CORROBORATING') => {
    switch (status) {
      case 'CORROBORATING':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.status.normal,
          bg: colors.status.normalLight,
          label: 'Corroborating',
        };
      case 'AVAILABLE':
        return {
          icon: 'information-circle-outline' as const,
          color: colors.brand.primary,
          bg: '#EEF3FD',
          label: 'Available',
        };
      case 'MISSING':
      default:
        return {
          icon: 'alert-circle-outline' as const,
          color: colors.status.warning,
          bg: colors.status.warningLight,
          label: 'Missing / Gap',
        };
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>CROSS-SOURCE EVIDENCE SIGNALS</Text>
        <Text style={styles.signalCount}>
          {signals.filter(s => s.status === 'CORROBORATING').length} of {signals.length} Corroborating
        </Text>
      </View>

      {signals.map((sig, idx) => {
        const theme = getSignalStatusTheme(sig.status);
        return (
          <View key={idx} style={styles.signalRow}>
            <View style={[styles.statusPill, { backgroundColor: theme.bg }]}>
              <Ionicons name={theme.icon} size={14} color={theme.color} style={{ marginRight: 4 }} />
              <Text style={[styles.statusPillText, { color: theme.color }]}>{theme.label}</Text>
            </View>
            <View style={styles.signalTextCol}>
              <Text style={styles.signalName}>{sig.name}</Text>
              {sig.details ? <Text style={styles.signalDetails}>{sig.details}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  emptyContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  signalCount: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginRight: 8,
    marginTop: 1,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  signalTextCol: {
    flex: 1,
  },
  signalName: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  signalDetails: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
    lineHeight: 15,
  },
});
