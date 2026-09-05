import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          btn: { backgroundColor: colors.secondary },
          text: { color: colors.white },
        };
      case 'outline':
        return {
          btn: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.primary,
          },
          text: { color: colors.primary },
        };
      case 'danger':
        return {
          btn: { backgroundColor: colors.danger },
          text: { color: colors.white },
        };
      case 'success':
        return {
          btn: { backgroundColor: colors.success },
          text: { color: colors.white },
        };
      case 'primary':
      default:
        return {
          btn: { backgroundColor: colors.primary },
          text: { color: colors.white },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          btn: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md },
          text: { fontSize: typography.fontSize.sm },
        };
      case 'lg':
        return {
          btn: { paddingVertical: spacing.base, paddingHorizontal: spacing.xl },
          text: { fontSize: typography.fontSize.lg },
        };
      case 'md':
      default:
        return {
          btn: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
          text: { fontSize: typography.fontSize.base },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        vStyles.btn,
        sStyles.btn,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : colors.white}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[styles.text, vStyles.text, sStyles.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
