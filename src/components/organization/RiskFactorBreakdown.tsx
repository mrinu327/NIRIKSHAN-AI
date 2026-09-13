/**
 * RiskFactorBreakdown Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Detailed visual breakdown of the 7 weighted scoring factors.
 * Provides transparent, explainable audit trails for administrative evaluation.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { OrganizationRiskProfile, OrganizationRiskFactorItem } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface RiskFactorBreakdownProps {
  factorBreakdown: OrganizationRiskProfile['factorBreakdown'];
  style?: ViewStyle;
}

interface FactorRowProps {
  title: string;
  factor: OrganizationRiskFactorItem;
  weightPct: number;
}

const FactorRow: React.FC<FactorRowProps> = ({ title, factor, weightPct }) => {
  const getMeterColor = (val: number) => {
    if (val >= 80) return colors.status.normal;
    if (val >= 60) return colors.status.warning;
    if (val >= 40) return colors.status.highPriority;
    return '#991B1B';
  };

  const meterColor = getMeterColor(factor.rawScore);
  const maxWeighted = Math.round(100 * factor.weight * 10) / 10;

  return (
    <View style={styles.factorRow}>
      <View style={styles.factorHeader}>
        <View style={styles.factorTitleRow}>
          <Text style={styles.factorTitle}>{title}</Text>
          <View style={styles.weightBadge}>
            <Text style={styles.weightText}>{weightPct}%</Text>
          </View>
        </View>
        <Text style={styles.factorScores}>
          <Text style={[styles.rawScoreText, { color: meterColor }]}>{factor.rawScore}</Text>
          <Text style={styles.scoreSub}>/100 (contrib: {factor.weightedScore}/{maxWeighted})</Text>
        </Text>
      </View>

      <Text style={styles.factorDesc}>{factor.description}</Text>

      {/* Progress Bar */}
      <View style={styles.meterTrack}>
        <View
          style={[
            styles.meterFill,
            {
              width: `${Math.min(100, Math.max(0, factor.rawScore))}%`,
              backgroundColor: meterColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

export const RiskFactorBreakdown: React.FC<RiskFactorBreakdownProps> = ({ factorBreakdown, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionHeader}>FACTOR ANALYSIS & EXPLAINABILITY (7 DIMENSIONS)</Text>

      <FactorRow
        title="Inspection Performance"
        factor={factorBreakdown.inspectionPerformance}
        weightPct={25}
      />
      <FactorRow
        title="Statutory Compliance"
        factor={factorBreakdown.compliance}
        weightPct={20}
      />
      <FactorRow
        title="Financial Grant Utilization"
        factor={factorBreakdown.financialUtilization}
        weightPct={15}
      />
      <FactorRow
        title="Project Milestone Outcomes"
        factor={factorBreakdown.projectOutcomes}
        weightPct={15}
      />
      <FactorRow
        title="Documentation & Filings"
        factor={factorBreakdown.documentation}
        weightPct={10}
      />
      <FactorRow
        title="Beneficiary Verification"
        factor={factorBreakdown.beneficiaryVerification}
        weightPct={10}
      />
      <FactorRow
        title="Historical Anomalies"
        factor={factorBreakdown.historicalAnomalies}
        weightPct={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  factorRow: {
    marginBottom: spacing.md,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  factorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  factorTitle: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginRight: 6,
  },
  weightBadge: {
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  weightText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  factorScores: {
    fontSize: 11,
  },
  rawScoreText: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  scoreSub: {
    fontSize: 10,
    color: colors.text.muted,
  },
  factorDesc: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 4,
  },
  meterTrack: {
    height: 6,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
});
