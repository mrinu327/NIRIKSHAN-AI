/**
 * SecondaryButton Component
 * Outlined / subtle secondary action button.
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
  Animated,
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          isOutline ? styles.outline : styles.ghost,
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.content}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={17}
              color={disabled ? colors.text.disabled : isOutline ? colors.text.primary : colors.brand.primary}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              isOutline ? styles.outlineText : styles.ghostText,
              disabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
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
    opacity: 0.6,
    borderColor: colors.neutral.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.xs + 2,
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    letterSpacing: 0.1,
  },
  outlineText: {
    color: colors.text.primary,
  },
  ghostText: {
    color: colors.brand.primary,
  },
  textDisabled: {
    color: colors.text.disabled,
  },
});
