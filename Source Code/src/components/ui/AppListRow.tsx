import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme';

interface AppListRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const AppListRow: React.FC<AppListRowProps> = ({
  title,
  subtitle,
  value,
  onPress,
  style,
}) => {
  const content = (
    <View
      style={[
        {
          minHeight: 56,
          paddingVertical: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.neutral.divider,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.medium,
            lineHeight: typography.lineHeights.base,
            color: colors.text.primary,
          }}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            numberOfLines={2}
            style={{
              marginTop: spacing.xs,
              fontFamily: typography.fontFamily,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.regular,
              lineHeight: typography.lineHeights.sm,
              color: colors.text.secondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {value && (
        <Text
          numberOfLines={1}
          style={{
            maxWidth: '40%',
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold,
            lineHeight: typography.lineHeights.sm,
            color: colors.text.primary,
            textAlign: 'right',
          }}
        >
          {value}
        </Text>
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        minHeight: 56,
      })}
    >
      {content}
    </Pressable>
  );
};

export default AppListRow;