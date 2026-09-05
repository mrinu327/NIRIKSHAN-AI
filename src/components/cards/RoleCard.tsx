/**
 * RoleCard Component
 * Interactive role selection card for the login / onboarding screen.
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoleConfig } from '../../types/role';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface RoleCardProps {
  role: RoleConfig;
  isSelected: boolean;
  onSelect: () => void;
  style?: ViewStyle;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  isSelected,
  onSelect,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconContainer,
            isSelected && styles.iconContainerSelected,
          ]}
        >
          <Ionicons
            name={role.iconName as keyof typeof Ionicons.glyphMap}
            size={22}
            color={isSelected ? colors.brand.primary : colors.text.secondary}
          />
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{role.badgeLabel}</Text>
        </View>

        <View
          style={[
            styles.radioCircle,
            isSelected && styles.radioCircleSelected,
          ]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>

      <Text style={[styles.title, isSelected && styles.titleSelected]}>
        {role.title}
      </Text>

      <Text style={styles.subtitle}>{role.subtitle}</Text>

      <Text style={styles.description}>{role.description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  cardSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: colors.brand.primaryLight,
  },
  badge: {
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.neutral.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.brand.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand.primary,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  titleSelected: {
    color: colors.brand.navyLight,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.brand.accent,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 19,
  },
});
