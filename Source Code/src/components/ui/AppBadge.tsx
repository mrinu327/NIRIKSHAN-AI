import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, typography } from '../../theme';

type BadgeVariant =
  | 'normal'
  | 'warning'
  | 'highPriority'
  | 'info'
  | 'offline';

interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'info',
  style,
}) => {
  const status = colors.status[variant];

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          minHeight: 28,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: borderRadius.sm,
          backgroundColor: status + '18',
          borderWidth: 1,
          borderColor: status + '45',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.semibold,
          lineHeight: typography.lineHeights.xs,
          color: status,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default AppBadge;