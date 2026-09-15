/**
 * CorrelationSignalCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Displays correlated anomalies / related monitoring signals across
 * the same project, organization, or discrepancy category.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MasterAnomaly } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { AnomalySeverityBadge } from './AnomalySeverityBadge';

interface CorrelationSignalCardProps {
  correlatedAnomalies: MasterAnomaly[];
  onAnomalyPress?: (anomalyId: string) => void;
  style?: ViewStyle;
}

export const CorrelationSignalCard: React.FC<CorrelationSignalCardProps> = ({
  correlatedAnomalies,
  onAnomalyPress,
  style,
}) => {
  if (!correlatedAnomalies || correlatedAnomalies.length === 0) {
    return (
      <View style={[styles.card, style]}>
        <View style={styles.headerRow}>
          <Ionicons name="git-network-outline" size={16} color={colors.brand.primary} style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>CORRELATED MONITORING SIGNALS</Text>
        </View>
        <Text style={styles.emptyText}>
          No additional correlated monitoring signals detected for this entity.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Ionicons name="git-network-outline" size={16} color={colors.brand.primary} style={{ marginRight: 6 }} />
        <Text style={styles.headerTitle}>CORRELATED MONITORING SIGNALS</Text>
      </View>
      <Text style={styles.subtitle}>
        {correlatedAnomalies.length} related monitoring signal(s) identified across linked projects/entities:
      </Text>

      {correlatedAnomalies.map(anom => {
        const ItemWrapper = onAnomalyPress ? TouchableOpacity : View;
        return (
          <ItemWrapper
            key={anom.anomalyId || anom.id}
            activeOpacity={0.7}
            onPress={() => onAnomalyPress && onAnomalyPress(anom.anomalyId || anom.id)}
            style={styles.correlatedItem}
          >
            <View style={styles.itemTop}>
              <Text style={styles.itemId}>{anom.anomalyId || anom.id}</Text>
              <AnomalySeverityBadge severity={anom.severity} compact />
            </View>
            <Text style={styles.itemTitle}>{anom.title || anom.type}</Text>
            <Text style={styles.itemDesc} numberOfLines={2}>
              {anom.explanation || anom.description}
            </Text>
            {onAnomalyPress && (
              <View style={styles.navHint}>
                <Text style={styles.navHintText}>View Diagnostic Dossier</Text>
                <Ionicons name="arrow-forward" size={11} color={colors.brand.primary} />
              </View>
            )}
          </ItemWrapper>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  correlatedItem: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  itemId: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 15,
  },
  navHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  navHintText: {
    fontSize: 10,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
    marginRight: 4,
  },
});
