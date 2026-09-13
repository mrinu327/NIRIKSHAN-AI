/**
 * AnomalyExplanationCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Details the observed discrepancy, reported vs expected values,
 * variance percentage, threshold, and plain-language diagnostic reasoning.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MasterAnomaly } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface AnomalyExplanationCardProps {
  anomaly: MasterAnomaly;
  style?: ViewStyle;
}

export const AnomalyExplanationCard: React.FC<AnomalyExplanationCardProps> = ({ anomaly, style }) => {
  const obs = anomaly.observedValues || {};
  const exp = anomaly.expectedValues || {};
  const variance = anomaly.variance;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Ionicons name="analytics-outline" size={16} color={colors.brand.primary} style={{ marginRight: 6 }} />
        <Text style={styles.headerTitle}>OBSERVED DISCREPANCY & REASONING</Text>
      </View>

      {/* Variance Metric Highlight */}
      {variance ? (
        <View style={styles.varianceHighlight}>
          <View style={styles.varianceCol}>
            <Text style={styles.varianceLabel}>Absolute Variance</Text>
            <Text style={styles.varianceVal}>
              {variance.absolute !== undefined ? `${variance.absolute}` : 'N/A'}
            </Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.varianceCol}>
            <Text style={styles.varianceLabel}>Divergence %</Text>
            <Text style={[styles.varianceVal, { color: colors.status.highPriority }]}>
              {variance.percentage !== undefined ? `${variance.percentage}%` : 'N/A'}
            </Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.varianceCol}>
            <Text style={styles.varianceLabel}>Review Threshold</Text>
            <Text style={styles.thresholdVal} numberOfLines={1}>
              {anomaly.threshold || 'Configured Limit'}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Values Grid */}
      <View style={styles.valuesGrid}>
        <View style={styles.valueBox}>
          <Text style={styles.boxLabel}>OBSERVED TELEMETRY</Text>
          {Object.entries(obs).length > 0 ? (
            Object.entries(obs).map(([k, v]) => (
              <Text key={k} style={styles.boxText}>
                <Text style={styles.boxKey}>{k}: </Text>
                {String(v)}
              </Text>
            ))
          ) : (
            <Text style={styles.boxText}>Telemetry captured from field stream</Text>
          )}
        </View>

        <View style={styles.valueBox}>
          <Text style={styles.boxLabel}>EXPECTED / REPORTED NORM</Text>
          {Object.entries(exp).length > 0 ? (
            Object.entries(exp).map(([k, v]) => (
              <Text key={k} style={styles.boxText}>
                <Text style={styles.boxKey}>{k}: </Text>
                {String(v)}
              </Text>
            ))
          ) : (
            <Text style={styles.boxText}>Institutional baseline / register log</Text>
          )}
        </View>
      </View>

      {/* Plain Language Explanation */}
      <View style={styles.explanationBox}>
        <Text style={styles.explanationTitle}>Why Was This Anomaly Flagged?</Text>
        <Text style={styles.explanationText}>{anomaly.explanation || anomaly.description}</Text>
      </View>
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
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  varianceHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  varianceCol: {
    flex: 1,
    alignItems: 'center',
  },
  varianceLabel: {
    fontSize: 9,
    color: colors.text.muted,
    marginBottom: 2,
  },
  varianceVal: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  thresholdVal: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.neutral.border,
    marginHorizontal: 4,
  },
  valuesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  valueBox: {
    flex: 1,
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  boxLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  boxText: {
    fontSize: 11,
    color: colors.text.primary,
    marginTop: 2,
  },
  boxKey: {
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  explanationBox: {
    backgroundColor: '#EEF3FD',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.primary,
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    marginBottom: 3,
  },
  explanationText: {
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 16,
  },
});
