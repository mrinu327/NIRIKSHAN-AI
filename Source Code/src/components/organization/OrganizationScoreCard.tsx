/**
 * OrganizationScoreCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Prominently presents the NIRIKSHAN Organization Risk & Performance Score.
 * Fully transparent, non-accusatory, explainable presentation.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { OrganizationRiskProfile } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { MonitoringPriorityBadge } from './MonitoringPriorityBadge';

interface OrganizationScoreCardProps {
  profile: OrganizationRiskProfile;
  style?: ViewStyle;
}

export const OrganizationScoreCard: React.FC<OrganizationScoreCardProps> = ({ profile, style }) => {
  const { score, band, monitoringPriority } = profile;

  const getScoreColor = (val: number) => {
    if (val >= 80) return colors.status.normal;
    if (val >= 60) return colors.status.warning;
    if (val >= 40) return colors.status.highPriority;
    return '#991B1B';
  };

  const scoreColor = getScoreColor(score);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.engineLabel}>NIRIKSHAN AI ANALYTICS</Text>
          <Text style={styles.cardTitle}>Organization Risk & Performance Score</Text>
        </View>
        <MonitoringPriorityBadge priority={monitoringPriority} compact />
      </View>

      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <View style={styles.scoreDetails}>
          <Text style={[styles.bandLabel, { color: scoreColor }]}>{band}</Text>
          <Text style={styles.explainerText}>
            Multi-factor evaluation across 7 administrative, physical, and financial dimensions.
          </Text>
        </View>
      </View>

      <View style={styles.guidanceBox}>
        <Text style={styles.guidanceText}>
          Higher score indicates stronger observed performance and lower monitoring concern.
        </Text>
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  engineLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    marginRight: spacing.md,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    lineHeight: 28,
  },
  scoreMax: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  scoreDetails: {
    flex: 1,
  },
  bandLabel: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  explainerText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  guidanceBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  guidanceText: {
    fontSize: 11,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
});
