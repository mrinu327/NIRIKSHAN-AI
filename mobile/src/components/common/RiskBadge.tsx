import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskLevel } from '@nirikshan/shared-types';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

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
          bg: '#DCFCE7',
          text: colors.success,
          label: 'LOW RISK',
        };
      case RiskLevel.MEDIUM:
        return {
          bg: '#FEF3C7',
          text: colors.warning,
          label: 'MEDIUM RISK',
        };
      case RiskLevel.HIGH:
        return {
          bg: '#FEE2E2',
          text: colors.danger,
          label: 'HIGH RISK',
        };
      case RiskLevel.CRITICAL:
        return {
          bg: '#7F1D1D',
          text: colors.white,
          label: 'CRITICAL',
        };
      default:
        return {
          bg: colors.background,
          text: colors.textMuted,
          label: String(level),
        };
    }
  };

  const style = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
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
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
