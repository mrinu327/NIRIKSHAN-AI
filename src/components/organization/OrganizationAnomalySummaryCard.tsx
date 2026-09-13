/**
 * OrganizationAnomalySummaryCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual card summarizing observed telemetry anomalies and cross-source variances
 * for an implementing agency. Links directly to full diagnostic dossiers.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MasterAnomaly } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface OrganizationAnomalySummaryCardProps {
  anomalies: MasterAnomaly[];
  onSelectAnomaly?: (anomalyId: string) => void;
  onAnomalyPress?: (anomalyId: string) => void;
  style?: ViewStyle;
}

export const OrganizationAnomalySummaryCard: React.FC<OrganizationAnomalySummaryCardProps> = ({
  anomalies,
  onSelectAnomaly,
  onAnomalyPress,
  style,
}) => {
  const handlePress = onAnomalyPress || onSelectAnomaly;
  const critical = anomalies.filter(a => a.severity === 'CRITICAL').length;
  const high = anomalies.filter(a => a.severity === 'HIGH').length;
  const medium = anomalies.filter(a => a.severity === 'MEDIUM').length;
  const low = anomalies.filter(a => a.severity === 'LOW').length;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="warning-outline" size={18} color={colors.status.highPriority} />
          <Text style={styles.title}>OBSERVED MONITORING ANOMALIES ({anomalies.length})</Text>
        </View>
        <View style={styles.badgeGroup}>
          {critical > 0 && (
            <View style={[styles.sevBadge, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.sevBadgeText, { color: '#991B1B' }]}>{critical} Critical</Text>
            </View>
          )}
          {high > 0 && (
            <View style={[styles.sevBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.sevBadgeText, { color: colors.status.highPriority }]}>{high} High</Text>
            </View>
          )}
          {anomalies.length === 0 && (
            <View style={[styles.sevBadge, { backgroundColor: `${colors.status.normal}15` }]}>
              <Text style={[styles.sevBadgeText, { color: colors.status.normal }]}>Clean Record</Text>
            </View>
          )}
        </View>
      </View>

      {anomalies.length === 0 ? (
        <View style={styles.cleanBox}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.status.normal} />
          <Text style={styles.cleanText}>No unresolved operational anomalies on record for this agency.</Text>
        </View>
      ) : (
        <View style={styles.anomaliesList}>
          {anomalies.map(anom => (
            <TouchableOpacity
              key={anom.anomalyId || anom.id}
              activeOpacity={0.7}
              style={styles.anomalyItem}
              onPress={() => handlePress && handlePress(anom.anomalyId || anom.id)}
            >
              <View style={styles.anomalyTop}>
                <View
                  style={[
                    styles.itemBadge,
                    {
                      backgroundColor:
                        anom.severity === 'CRITICAL'
                          ? '#FEE2E2'
                          : anom.severity === 'HIGH'
                          ? '#FEF3C7'
                          : colors.neutral.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.itemBadgeText,
                      {
                        color:
                          anom.severity === 'CRITICAL'
                            ? '#991B1B'
                            : anom.severity === 'HIGH'
                            ? colors.status.highPriority
                            : colors.text.secondary,
                      },
                    ]}
                  >
                    {anom.severity} PRIORITY
                  </Text>
                </View>
                <Text style={styles.anomalyIdText}>{anom.anomalyId || anom.id}</Text>
              </View>

              <Text style={styles.anomalyTitle}>{anom.title || anom.type}</Text>
              <Text style={styles.anomalyDesc} numberOfLines={2}>
                {anom.explanation || anom.description}
              </Text>

              <View style={styles.dossierLinkRow}>
                <Text style={styles.dossierLinkText}>Review Anomaly Diagnostic Dossier</Text>
                <Ionicons name="arrow-forward" size={12} color={colors.brand.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  sevBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  sevBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.3,
  },
  cleanBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral.background,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  cleanText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  anomaliesList: {
    gap: spacing.xs,
  },
  anomalyItem: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  anomalyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  itemBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.3,
  },
  anomalyIdText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
  },
  anomalyTitle: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  anomalyDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  dossierLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dossierLinkText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
});
