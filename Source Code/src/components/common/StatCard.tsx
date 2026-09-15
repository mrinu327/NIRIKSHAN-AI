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
          hasAccent: true,
        };
      case 'warning':
        return {
          iconColor: colors.status.warning,
          iconBg: colors.status.warningLight,
          accentBorder: colors.status.warning,
          hasAccent: true,
        };
      case 'highPriority':
        return {
          iconColor: colors.status.highPriority,
          iconBg: colors.status.highPriorityLight,
          accentBorder: colors.status.highPriority,
          hasAccent: true,
        };
      case 'normal':
        return {
          iconColor: colors.status.normal,
          iconBg: colors.status.normalLight,
          accentBorder: colors.status.normal,
          hasAccent: true,
        };
      case 'neutral':
      default:
        return {
          iconColor: colors.text.muted,
          iconBg: colors.neutral.surfaceSubtle,
          accentBorder: colors.neutral.border,
          hasAccent: false,
        };
    }
  };

  const currentVariant = getVariantStyles();
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        currentVariant.hasAccent && {
          borderTopColor: currentVariant.accentBorder,
          borderTopWidth: 3,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: currentVariant.iconBg }]}>
          <Ionicons name={iconName} size={16} color={currentVariant.iconColor} />
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
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.4,
    flexShrink: 1,
    textAlign: 'right',
  },
  label: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  subtitle: {
    fontSize: typography.sizes.xs - 1,
    color: colors.text.muted,
    marginTop: 2,
  },
});
