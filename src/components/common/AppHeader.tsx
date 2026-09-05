/**
 * AppHeader Component
 * Executive government-grade header with title, role badge, and role switcher.
 * Responsive for both mobile and desktop viewports.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showRoleSwitch?: boolean;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showRoleSwitch = true,
  rightAction,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { currentRole, switchRole } = useAuth();

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'official':
        return 'MoSJE Official';
      case 'inspector':
        return 'PMU Inspector';
      case 'ngo':
        return 'Institute Rep';
      default:
        return 'Demo Mode';
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 12) + spacing.xs },
        style,
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={styles.branding}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={15} color={colors.text.inverse} />
            </View>
            <Text style={styles.ministryText}>MoSJE • SIH26095</Text>
          </View>

          {showRoleSwitch && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={switchRole}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.switchButton}
            >
              <Ionicons name="swap-horizontal" size={14} color={colors.brand.primaryLight} />
              <Text style={styles.switchText}>Switch Role</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mainRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {rightAction ? (
            rightAction
          ) : currentRole ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{getRoleLabel()}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand.navy,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
    ...shadows.sm,
  },
  inner: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  ministryText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#93C5FD',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    minHeight: 32,
  },
  switchText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginLeft: 4,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.xs,
    flexWrap: 'wrap',
    gap: 6,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: '#CBD5E1',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    borderColor: '#3B82F6',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    color: '#93C5FD',
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
