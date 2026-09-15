import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Role } from '@nirikshan/shared-types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface RoleBadgeProps {
  role: Role | string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (role) {
      case Role.OFFICIAL:
        return {
          bg: colors.palette.oliveLight,
          border: colors.palette.sageBorder,
          text: colors.palette.olivewood,
          label: 'DoSJE OFFICIAL',
        };
      case Role.INSPECTOR:
        return {
          bg: colors.palette.sandLight,
          border: colors.palette.sandBorder,
          text: colors.palette.barkSecondary,
          label: 'FIELD INSPECTOR',
        };
      case Role.NGO:
        return {
          bg: colors.palette.parchmentDark,
          border: colors.palette.sandBorder,
          text: colors.palette.bark,
          label: 'NGO IN-CHARGE',
        };
      case Role.BENEFICIARY:
        return {
          bg: colors.status.normalLight,
          border: colors.status.normalBorder,
          text: colors.status.normal,
          label: 'BENEFICIARY',
        };
      default:
        return {
          bg: colors.neutral.surfaceSubtle,
          border: colors.neutral.border,
          text: colors.text.muted,
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
        { backgroundColor: badge.bg, borderColor: badge.border },
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
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 10,
  },
});
