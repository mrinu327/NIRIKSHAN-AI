import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

interface DemoBannerProps {
  customText?: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ customText }) => {
  const isDemoMode = useAuthStore((s) => s.isDemoMode);

  if (!isDemoMode) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.dot} />
      <Text style={styles.bannerText}>
        {customText || 'PROTOTYPE DEMO MODE — Synthetic data for SIH26095 demonstration'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.demoBadgeBg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.demoBadgeText,
    marginRight: 6,
  },
  bannerText: {
    color: colors.demoBadgeText,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
});
