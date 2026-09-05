/**
 * AlertCard Component
 * Policy-compliant anomaly & discrepancy alert preview card.
 * Mobile-first responsive wrapping.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnomalyAlert } from '../../types/alert';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface AlertCardProps {
  alert: AnomalyAlert;
  onPress?: () => void;
  style?: ViewStyle;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress, style }) => {
  const isHigh = alert.severity === 'HIGH';

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        isHigh && styles.cardHighPriority,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryContainer}>
          <Ionicons
            name={isHigh ? 'warning' : 'information-circle'}
            size={16}
            color={isHigh ? colors.status.highPriority : colors.status.warning}
          />
          <Text
            style={[
              styles.categoryText,
              { color: isHigh ? colors.status.highPriority : colors.status.warning },
            ]}
          >
            {alert.category}
          </Text>
        </View>

        <Text style={styles.timestamp}>{alert.timestamp}</Text>
      </View>

      <Text style={styles.projectName} numberOfLines={2}>
        {alert.projectName}
      </Text>
      <Text style={styles.description}>{alert.description}</Text>

      {alert.metricComparison && (
        <View style={styles.metricsBox}>
          <View style={styles.metricPair}>
            <Text style={styles.metricSubLabel}>Submitted</Text>
            <Text style={styles.metricValue}>{alert.metricComparison.reportedAttendance}</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.metricPair}>
            <Text style={styles.metricSubLabel}>Feed Estimate</Text>
            <Text style={styles.metricValue}>{alert.metricComparison.headcountEstimate}</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.metricPair}>
            <Text style={styles.metricSubLabel}>Variance</Text>
            <Text style={[styles.metricValue, { color: colors.status.highPriority }]}>
              +{alert.metricComparison.difference}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.footerRow}>
        <View style={styles.reviewBadge}>
          <Ionicons name="person-outline" size={12} color={colors.brand.navyLight} />
          <Text style={styles.reviewBadgeText} numberOfLines={1}>
            Human Official Review Required
          </Text>
        </View>
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  cardHighPriority: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.highPriority,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  categoryText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  projectName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricPair: {
    alignItems: 'center',
    flex: 1,
  },
  metricSubLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  dividerVertical: {
    width: 1,
    height: 20,
    backgroundColor: colors.neutral.border,
  },
  footerRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    flexShrink: 1,
  },
  reviewBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.brand.navyLight,
    marginLeft: 4,
  },
});
