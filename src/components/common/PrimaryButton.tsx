/**
 * PrimaryButton Component
 * Trustworthy, accessible primary action button.
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing, shadows } from '../../theme/spacing';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'danger' | 'success';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  iconName,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
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

  const getBackgroundColor = () => {
    if (disabled) return colors.neutral.borderStrong;
    switch (variant) {
      case 'danger':
        return colors.status.highPriority; // Master Red #C4402C
      case 'success':
        return colors.status.normal;       // Master Green #1E8E5A
      case 'primary':
      default:
        return colors.brand.primary;       // Signal Blue #2A5CE0
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          { backgroundColor: getBackgroundColor() },
          disabled && styles.buttonDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.text.inverse} size="small" />
        ) : (
          <View style={styles.content}>
            {iconName && (
              <Ionicons
                name={iconName}
                size={17}
                color={disabled ? colors.text.disabled : colors.text.inverse}
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
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    ...shadows.xs,
  },
  buttonDisabled: {
    opacity: 0.7,
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
    color: colors.text.inverse,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.1,
  },
  textDisabled: {
    color: colors.text.disabled,
  },
});
