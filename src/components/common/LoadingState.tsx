/**
 * LoadingState Component
 * Consistent loading spinner and message.
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Retrieving official records...',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="small" color={colors.brand.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
});
