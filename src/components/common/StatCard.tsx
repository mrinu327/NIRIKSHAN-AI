/**
 * StatCard Component
 * Metric highlight card for dashboards.
 * Mobile-first responsive sizing.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface StatCardProps {
  label: string;
  value: string | number;
  iconName: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'warning' | 'highPriority' | 'normal' | 'neutral';
  subtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  iconName,
  variant = 'neutral',
  subtitle,
  onPress,
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          iconColor: colors.brand.primary,
          iconBg: colors.brand.primaryLight,
          accentBorder: colors.brand.primary,
        };
      case 'warning':
        return {
          iconColor: colors.status.warning,
          iconBg: colors.status.warningLight,
          accentBorder: colors.status.warning,
        };
      case 'highPriority':
        return {
          iconColor: colors.status.highPriority,
          iconBg: colors.status.highPriorityLight,
          accentBorder: colors.status.highPriority,
        };
      case 'normal':
        return {
          iconColor: colors.status.normal,
          iconBg: colors.status.normalLight,
          accentBorder: colors.status.normal,
        };
      case 'neutral':
      default:
        return {
          iconColor: colors.text.secondary,
          iconBg: colors.neutral.surfaceSubtle,
          accentBorder: 'transparent',
        };
    }
  };

  const currentVariant = getVariantStyles();
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        { borderTopColor: currentVariant.accentBorder, borderTopWidth: variant !== 'neutral' ? 3 : 1 },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: currentVariant.iconBg }]}>
          <Ionicons name={iconName} size={17} color={currentVariant.iconColor} />
        </View>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
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
    ...shadows.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    gap: 6,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
    flexShrink: 1,
    textAlign: 'right',
  },
  label: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  subtitle: {
    fontSize: typography.sizes.xs - 1,
    color: colors.text.muted,
    marginTop: 2,
  },
});
