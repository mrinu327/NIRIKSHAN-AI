/**
 * AnomalyActionCard Component
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Displays recommended administrative review actions and decision-support guidance.
 * POLICY: Recommendations are non-punitive, administrative verification steps.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface AnomalyActionCardProps {
  actions: string[];
  onActionPress?: (action: string, index: number) => void;
  style?: ViewStyle;
}

export const AnomalyActionCard: React.FC<AnomalyActionCardProps> = ({
  actions,
  onActionPress,
  style,
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Ionicons name="shield-outline" size={16} color={colors.brand.primary} style={{ marginRight: 6 }} />
        <Text style={styles.headerTitle}>RECOMMENDED ADMINISTRATIVE ACTIONS</Text>
      </View>
      <Text style={styles.subtitle}>
        Human official verification steps suggested by NIRIKSHAN AI decision support:
      </Text>

      {actions.map((act, idx) => {
        const ItemWrapper = onActionPress ? TouchableOpacity : View;
        return (
          <ItemWrapper
            key={idx}
            activeOpacity={0.7}
            onPress={() => onActionPress && onActionPress(act, idx)}
            style={styles.actionItem}
          >
            <View style={styles.numBadge}>
              <Text style={styles.numText}>{idx + 1}</Text>
            </View>
            <Text style={styles.actionText}>{act}</Text>
            {onActionPress && (
              <Ionicons name="chevron-forward" size={14} color={colors.brand.primary} style={{ marginLeft: 4 }} />
            )}
          </ItemWrapper>
        );
      })}

      <View style={styles.safetyNotice}>
        <Ionicons name="information-circle-outline" size={13} color={colors.text.muted} style={{ marginRight: 4 }} />
        <Text style={styles.safetyText}>
          Administrative advisory only. Actions require human officer validation.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  numBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  numText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  actionText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 16,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  safetyText: {
    fontSize: 10,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
});
