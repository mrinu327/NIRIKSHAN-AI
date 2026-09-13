/**
 * AnomalyConfidenceBadge Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Displays deterministic evidence confidence score (0–100) and confidence tier:
 * High (>=75%), Medium (50–74%), Low (<50%).
 *
 * POLICY: Measures corroborating evidence strength, NOT fraud probability.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnomalyConfidenceLevel } from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/spacing';

interface AnomalyConfidenceBadgeProps {
  confidence: number;
  level?: AnomalyConfidenceLevel;
  style?: ViewStyle;
  showScore?: boolean;
}

export const AnomalyConfidenceBadge: React.FC<AnomalyConfidenceBadgeProps> = ({
  confidence,
  level,
  style,
  showScore = true,
}) => {
  const resolvedLevel: AnomalyConfidenceLevel =
    level || (confidence >= 75 ? 'HIGH' : confidence >= 50 ? 'MEDIUM' : 'LOW');

  const getTheme = () => {
    switch (resolvedLevel) {
      case 'HIGH':
        return {
          bg: '#EEF3FD',
          text: colors.brand.primary,
          border: '#BDD1F7',
          icon: 'shield-checkmark' as const,
          label: 'High Confidence',
        };
      case 'MEDIUM':
        return {
          bg: colors.status.warningLight,
          text: colors.status.warning,
          border: colors.status.warningBorder,
          icon: 'shield-outline' as const,
          label: 'Moderate Confidence',
        };
      case 'LOW':
      default:
        return {
          bg: colors.neutral.surfaceSubtle,
          text: colors.text.muted,
          border: colors.neutral.border,
          icon: 'help-circle-outline' as const,
          label: 'Low Confidence',
        };
    }
  };

  const theme = getTheme();

  return (
    <View style={[styles.badge, { backgroundColor: theme.bg, borderColor: theme.border }, style]}>
      <Ionicons name={theme.icon} size={11} color={theme.text} style={styles.icon} />
      <Text style={[styles.text, { color: theme.text }]}>
        {showScore ? `${confidence}% Confidence` : theme.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.2,
  },
});
