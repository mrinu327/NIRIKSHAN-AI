/**
 * OrganizationMonitoringPriorityCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual card displaying an organization's deterministic monitoring priority
 * (NORMAL / WATCH / PRIORITY / CRITICAL REVIEW) with plain-language administrative rationale.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MonitoringPriority, OrganizationScoreExplanation } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export interface OrganizationMonitoringPriorityCardProps {
  priority: MonitoringPriority | string;
  score?: number;
  scoreBand?: string;
  label?: string;
  explanation?: string | OrganizationScoreExplanation;
  style?: ViewStyle;
}

export const OrganizationMonitoringPriorityCard: React.FC<OrganizationMonitoringPriorityCardProps> = ({
  priority,
  score,
  scoreBand,
  label,
  explanation,
  style,
}) => {
  const getTheme = () => {
    const p = String(priority).toUpperCase();
    if (p === 'CRITICAL' || p === 'CRITICAL REVIEW') {
      return {
        bg: '#FEE2E2',
        border: '#FECACA',
        text: '#991B1B',
        icon: 'alert-circle' as const,
        title: label || 'CRITICAL REVIEW PRIORITY',
      };
    }
    if (p === 'HIGH' || p === 'PRIORITY') {
      return {
        bg: '#FEF3C7',
        border: '#FDE68A',
        text: colors.status.highPriority,
        icon: 'warning' as const,
        title: label || 'HIGHER MONITORING PRIORITY',
      };
    }
    if (p === 'MEDIUM' || p === 'WATCH') {
      return {
        bg: '#EFF6FF',
        border: '#BFDBFE',
        text: colors.brand.primary,
        icon: 'eye' as const,
        title: label || 'WATCH STATUS (MODERATE CONCERN)',
      };
    }
    return {
      bg: `${colors.status.normal}10`,
      border: `${colors.status.normal}30`,
      text: colors.status.normal,
      icon: 'checkmark-circle' as const,
      title: label || 'NORMAL MONITORING (LOW CONCERN)',
    };
  };

  const theme = getTheme();
  const isExplanationObject = typeof explanation === 'object' && explanation !== null;
  const explanationObj = isExplanationObject ? (explanation as OrganizationScoreExplanation) : null;
  const displayScore = score ?? explanationObj?.overallScore;
  const displayBand = scoreBand ?? explanationObj?.scoreBand;

  return (
    <View style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name={theme.icon} size={18} color={theme.text} />
          <Text style={[styles.title, { color: theme.text }]}>{theme.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${theme.text}20` }]}>
          <Text style={[styles.badgeText, { color: theme.text }]}>{String(priority).toUpperCase()}</Text>
        </View>
      </View>

      {displayScore !== undefined && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Performance Score:</Text>
          <Text style={[styles.scoreValue, { color: theme.text }]}>{displayScore}/100</Text>
          {displayBand && <Text style={styles.scoreBand}>• {displayBand}</Text>}
        </View>
      )}

      {typeof explanation === 'string' && (
        <Text style={[styles.explanationText, { color: colors.text.primary }]}>{explanation}</Text>
      )}

      {explanationObj && (
        <View style={styles.explanationContainer}>
          {explanationObj.strongestFactors && explanationObj.strongestFactors.length > 0 && (
            <View style={styles.factorSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color={colors.status.normal} />
                <Text style={styles.sectionHeaderTitle}>Strongest Operational Drivers</Text>
              </View>
              {explanationObj.strongestFactors.map((factor, idx) => (
                <View key={`strong-${idx}`} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: colors.status.normal }]} />
                  <Text style={styles.bulletText}>{factor}</Text>
                </View>
              ))}
            </View>
          )}

          {explanationObj.weakerFactors && explanationObj.weakerFactors.length > 0 && (
            <View style={styles.factorSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="alert-circle-outline" size={14} color={colors.status.warning} />
                <Text style={styles.sectionHeaderTitle}>Factors Requiring Oversight</Text>
              </View>
              {explanationObj.weakerFactors.map((factor, idx) => (
                <View key={`weak-${idx}`} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: colors.status.warning }]} />
                  <Text style={styles.bulletText}>{factor}</Text>
                </View>
              ))}
            </View>
          )}

          {explanationObj.recommendedMonitoringActions && explanationObj.recommendedMonitoringActions.length > 0 && (
            <View style={styles.factorSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.brand.primary} />
                <Text style={styles.sectionHeaderTitle}>Recommended Monitoring Actions</Text>
              </View>
              {explanationObj.recommendedMonitoringActions.map((action, idx) => (
                <View key={`action-${idx}`} style={styles.bulletRow}>
                  <Ionicons name="chevron-forward" size={12} color={colors.brand.primary} style={styles.actionIcon} />
                  <Text style={styles.bulletText}>{action}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.footerRow}>
        <Ionicons name="information-circle-outline" size={13} color={colors.text.secondary} />
        <Text style={styles.footerText}>
          Determined by composite performance score, unresolved inspection findings, and observable telemetry anomalies.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.4,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs + 2,
    paddingVertical: 2,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  scoreBand: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  explanationContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  factorSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: borderRadius.sm,
    padding: spacing.xs + 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginLeft: spacing.xs,
    marginTop: 2,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.text.primary,
    flex: 1,
  },
  actionIcon: {
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  footerText: {
    fontSize: 10,
    color: colors.text.secondary,
    flex: 1,
  },
});
