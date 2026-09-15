/**
 * AnomalyCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Directory summary card for an observed anomaly, displaying ID,
 * title, linked project, organization, severity, confidence, and signals count.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MasterAnomaly } from '../../types/master';
import { masterLookup } from '../../data/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { AnomalySeverityBadge } from './AnomalySeverityBadge';
import { AnomalyConfidenceBadge } from './AnomalyConfidenceBadge';

interface AnomalyCardProps {
  anomaly: MasterAnomaly;
  onPress?: () => void;
  style?: ViewStyle;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly, onPress, style }) => {
  const project = masterLookup.getProjectById(anomaly.projectId);
  const organization = masterLookup.getOrganizationById(anomaly.organizationId);

  const Container = onPress ? TouchableOpacity : View;
  const isCritical = anomaly.severity === 'CRITICAL';
  const isHigh = anomaly.severity === 'HIGH';

  const signalsCount = anomaly.sourceSignals ? anomaly.sourceSignals.length : 0;
  const corroboratingCount = anomaly.sourceSignals
    ? anomaly.sourceSignals.filter(s => s.status === 'CORROBORATING').length
    : 0;

  return (
    <Container
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isCritical && styles.cardCritical,
        isHigh && styles.cardHigh,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.codeRow}>
          <Text style={styles.idText}>{anomaly.anomalyId || anomaly.id}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{anomaly.status}</Text>
          </View>
        </View>
        <AnomalySeverityBadge severity={anomaly.severity} compact />
      </View>

      <Text style={styles.titleText} numberOfLines={2}>
        {anomaly.title || anomaly.type}
      </Text>

      <Text style={styles.descText} numberOfLines={2}>
        {anomaly.explanation || anomaly.description}
      </Text>

      <View style={styles.entityRow}>
        <View style={styles.entityItem}>
          <Ionicons name="business-outline" size={12} color={colors.text.muted} style={{ marginRight: 3 }} />
          <Text style={styles.entityText} numberOfLines={1}>
            {project ? project.name : anomaly.projectId}
          </Text>
        </View>
        <Text style={styles.entitySep}>•</Text>
        <View style={styles.entityItem}>
          <Ionicons name="home-outline" size={12} color={colors.text.muted} style={{ marginRight: 3 }} />
          <Text style={styles.entityText} numberOfLines={1}>
            {organization ? organization.name : anomaly.organizationId}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <AnomalyConfidenceBadge
          confidence={anomaly.confidence ?? 80}
          level={anomaly.confidenceLevel}
        />
        <View style={styles.signalsBadge}>
          <Ionicons name="layers-outline" size={11} color={colors.brand.primary} style={{ marginRight: 3 }} />
          <Text style={styles.signalsText}>
            {corroboratingCount > 0 ? `${corroboratingCount} Corroborating Signals` : `${signalsCount} Signals`}
          </Text>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  cardCritical: {
    borderLeftWidth: 3.5,
    borderLeftColor: colors.status.highPriority,
  },
  cardHigh: {
    borderLeftWidth: 3.5,
    borderLeftColor: colors.status.highPriority,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  statusPill: {
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  titleText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  descText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  entityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: 4,
  },
  entityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '45%',
  },
  entityText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.muted,
  },
  entitySep: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.neutral.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.surfaceSubtle,
  },
  signalsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  signalsText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
});
