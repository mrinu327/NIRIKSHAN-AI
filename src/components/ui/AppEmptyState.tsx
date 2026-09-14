import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme';

interface AppEmptyStateProps {
  title: string;
  message?: string;
}

const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  title,
  message,
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
      <Text
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.md,
          fontWeight: typography.weights.semibold,
          lineHeight: typography.lineHeights.md,
          color: colors.text.primary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>

      {message && (
        <Text
          style={{
            marginTop: spacing.sm,
            maxWidth: 420,
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.regular,
            lineHeight: typography.lineHeights.sm,
            color: colors.text.secondary,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

export default AppEmptyState;