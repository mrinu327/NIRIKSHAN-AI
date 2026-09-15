import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Role } from '@nirikshan/shared-types';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface RoleBadgeProps {
  role: Role | string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (role) {
      case Role.OFFICIAL:
        return {
          bg: '#E0F2FE',
          text: colors.primary,
          label: 'DoSJE OFFICIAL',
        };
      case Role.INSPECTOR:
        return {
          bg: '#E0F7FA',
          text: colors.secondary,
          label: 'FIELD INSPECTOR',
        };
      case Role.NGO:
        return {
          bg: '#F3E8FF',
          text: '#6B21A8',
          label: 'NGO IN-CHARGE',
        };
      case Role.BENEFICIARY:
        return {
          bg: '#DCFCE7',
          text: colors.success,
          label: 'BENEFICIARY',
        };
      default:
        return {
          bg: colors.background,
          text: colors.textMuted,
          label: String(role),
        };
    }
  };

  const badge = getBadgeStyle();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badge.bg },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: badge.text },
          isSmall && styles.textSm,
        ]}
      >
        {badge.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 10,
  },
});
