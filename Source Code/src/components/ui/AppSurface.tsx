import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme';

interface AppSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glass?: boolean;
  padding?: number;
}

const AppSurface: React.FC<AppSurfaceProps> = ({
  children,
  style,
  glass = false,
  padding = spacing.lg,
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: glass
            ? colors.ui.glassBg
            : colors.neutral.surface,
          borderRadius: borderRadius.lg,
          padding,
          borderWidth: 1,
          borderColor: glass
            ? colors.ui.glassBorder
            : colors.neutral.border,
          ...shadows.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default AppSurface;