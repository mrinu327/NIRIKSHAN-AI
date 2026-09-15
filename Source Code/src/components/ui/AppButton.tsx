import React from 'react';
import {
  Pressable,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, typography } from '../../theme';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  const backgroundColor = isPrimary
    ? colors.brand.primary
    : isSecondary
      ? colors.palette.sageLight
      : isDanger
        ? colors.status.highPriority
        : 'transparent';

  const textColor = isPrimary || isDanger
    ? colors.text.inverse
    : colors.text.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          minHeight: 44,
          minWidth: 44,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: disabled
            ? colors.palette.parchmentDark
            : backgroundColor,
          borderWidth: isSecondary ? 1 : 0,
          borderColor: colors.palette.sageBorder,
          opacity: pressed && !disabled ? 0.82 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
            {
  fontFamily: typography.fontFamily,
  fontSize: typography.sizes.base,
  fontWeight: typography.weights.semibold,
  lineHeight: typography.lineHeights.base,
},          {
            color: disabled ? colors.text.disabled : textColor,
          },
          isGhost && {
            color: disabled
              ? colors.text.disabled
              : colors.brand.primary,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default AppButton;