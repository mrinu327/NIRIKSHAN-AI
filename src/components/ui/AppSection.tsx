import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme';

interface AppSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AppSection: React.FC<AppSectionProps> = ({
  title,
  subtitle,
  children,
  style,
}) => {
  return (
    <View style={[{ marginBottom: spacing.xl }, style]}>
      {(title || subtitle) && (
        <View style={{ marginBottom: spacing.md }}>
          {title && (
            <Text
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                lineHeight: typography.lineHeights.lg,
                color: colors.text.primary,
              }}
            >
              {title}
            </Text>
          )}

          {subtitle && (
            <Text
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
      )}

      {children}
    </View>
  );
};

export default AppSection;