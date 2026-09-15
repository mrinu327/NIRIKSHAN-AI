import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskLevel } from '@nirikshan/shared-types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = false }) => {
  const getStyle = () => {
    switch (level) {
      case RiskLevel.LOW:
        return {
          bg: colors.status.normalLight,
          border: colors.status.normalBorder,
          text: colors.status.normal,
          label: 'LOW RISK',
        };
      case RiskLevel.MEDIUM:
        return {
          bg: colors.status.warningLight,
          border: colors.status.warningBorder,
          text: colors.status.warning,
          label: 'MEDIUM RISK',
        };
      case RiskLevel.HIGH:
        return {
          bg: colors.status.highPriorityLight,
          border: colors.status.highPriorityBorder,
          text: colors.status.highPriority,
          label: 'HIGH RISK',
        };
      case RiskLevel.CRITICAL:
        return {
          bg: colors.status.highPriority,
          border: colors.status.highPriority,
          text: colors.text.inverse,
          label: 'CRITICAL',
        };
      default:
        return {
          bg: colors.neutral.surfaceSubtle,
          border: colors.neutral.border,
          text: colors.text.muted,
          label: String(level),
        };
    }
  };

  const style = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.text, { color: style.text }]}>
        {style.label}
        {showScore && score !== undefined ? ` • ${score}/100` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
});
