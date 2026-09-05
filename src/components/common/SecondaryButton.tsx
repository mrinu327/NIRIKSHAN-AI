/**
 * SecondaryButton Component
 * Outlined / subtle secondary action button.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  variant?: 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  iconName,
  variant = 'outline',
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        isOutline ? styles.outline : styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={18}
            color={disabled ? colors.text.disabled : colors.brand.primary}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.text,
            disabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  outline: {
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
    borderColor: colors.neutral.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    color: colors.brand.navyLight,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  textDisabled: {
    color: colors.text.disabled,
  },
});
