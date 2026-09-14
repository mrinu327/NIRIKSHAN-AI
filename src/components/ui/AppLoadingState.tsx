import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme';

interface AppLoadingStateProps {
  message?: string;
}

const AppLoadingState: React.FC<AppLoadingStateProps> = ({
  message = 'Loading...',
}) => {
  return (
    <View
      style={{
        minHeight: 140,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator
        size="small"
        color={colors.brand.primary}
      />

      <Text
        style={{
          marginTop: spacing.md,
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.medium,
          lineHeight: typography.lineHeights.sm,
          color: colors.text.secondary,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default AppLoadingState;