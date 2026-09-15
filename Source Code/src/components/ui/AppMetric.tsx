import React from 'react';
import { Text, View, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme';

interface AppMetricProps {
  label: string;
  value: string | number;
  detail?: string;
  style?: StyleProp<ViewStyle>;
}

const AppMetric: React.FC<AppMetricProps> = ({
  label,
  value,
  detail,
  style,
}) => {
  return (
    <View
      style={[
        {
          minWidth: 0,
          paddingVertical: spacing.sm,
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.medium,
          lineHeight: typography.lineHeights.sm,
          color: colors.text.secondary,
        }}
      >
        {label}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          marginTop: spacing.xs,
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.xxl,
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.xxl,
          color: colors.text.primary,
        }}
      >
        {value}
      </Text>

      {detail && (
        <Text
          numberOfLines={2}
          style={{
            marginTop: spacing.xs,
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.regular,
            lineHeight: typography.lineHeights.xs,
            color: colors.text.muted,
          }}
        >
          {detail}
        </Text>
      )}
    </View>
  );
};

export default AppMetric;