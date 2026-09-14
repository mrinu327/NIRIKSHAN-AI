/**
 * RoleCard Component
 * Interactive role selection card for the login / onboarding screen.
 */

import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoleConfig } from '../../types/role';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface RoleCardProps {
  role: RoleConfig;
  isSelected: boolean;
  onSelect: () => void;
  badgeLabel?: string;
  style?: ViewStyle;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  isSelected,
  onSelect,
  badgeLabel,
  style,
}) => {
  const animValue = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isSelected ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  const animatedBorderColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.neutral.border, colors.brand.primary],
  });

  const animatedBgColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.neutral.surface, colors.brand.primaryLight],
  });

  const radioScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const handleMouseEnter = () => {
    Animated.timing(hoverAnim, {
      toValue: -3,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleMouseLeave = () => {
    Animated.timing(hoverAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const displayBadge = badgeLabel || role.badgeLabel;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onSelect}
      // @ts-ignore - supported by react-native-web
      onMouseEnter={handleMouseEnter}
      // @ts-ignore - supported by react-native-web
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      <Animated.View
        style={[
          styles.card,
          {
            borderColor: animatedBorderColor,
            backgroundColor: animatedBgColor,
            borderWidth: isSelected ? 2 : 1,
            borderLeftWidth: isSelected ? 4 : 1,
            transform: [{ translateY: hoverAnim }],
          },
          isSelected && styles.cardSelected,
        ]}
      >
        <View style={styles.rowContainer}>
          {/* Leading Icon */}
          <View
            style={[
              styles.iconContainer,
              isSelected && styles.iconContainerSelected,
            ]}
          >
            <Ionicons
              name={role.iconName as keyof typeof Ionicons.glyphMap}
              size={20}
              color={isSelected ? colors.brand.primary : colors.brand.navy}
            />
          </View>

          {/* Center Info */}
          <View style={styles.infoCol}>
            <Text style={[styles.title, isSelected && styles.titleSelected]}>
              {role.title}
            </Text>
            <Text style={[styles.contextLabel, isSelected && styles.contextLabelSelected]}>
              {role.subtitle}
            </Text>
            {role.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {role.description}
              </Text>
            ) : null}
          </View>

          {/* Trailing Selection Affordance */}
          <View
            style={[
              styles.radioCircle,
              isSelected && styles.radioCircleSelected,
            ]}
          >
            {isSelected && (
              <Animated.View
                style={[
                  styles.radioInner,
                  { transform: [{ scale: radioScale }] },
                ]}
              >
                <Ionicons name="checkmark" size={13} color={colors.text.inverse} />
              </Animated.View>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 1,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    minHeight: 82,
    justifyContent: 'center',
    ...shadows.xs,
  },
  cardSelected: {
    ...shadows.sm,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  iconContainerSelected: {
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.status.infoBorder,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  titleSelected: {
    color: colors.brand.navyDark,
  },
  contextLabel: {
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  contextLabelSelected: {
    color: colors.brand.primaryHover,
  },
  description: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    lineHeight: 16,
    marginTop: 3,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.neutral.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  radioInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
