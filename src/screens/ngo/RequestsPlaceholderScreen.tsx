/**
 * RequestsPlaceholderScreen
 * NGO / Institute - MoSJE Requests & Discrepancy Response Queue
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const RequestsPlaceholderScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Requests & Inquiries"
        subtitle="Official queries and inspection notices from MoSJE / PMU"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Active Requests"
          subtitle="Respond with explanations or updated documents"
          badgeCount={1}
        />

        <View style={styles.requestCard}>
          <View style={styles.reqHeader}>
            <View style={styles.reqBadge}>
              <Text style={styles.reqBadgeText}>ACTION REQUIRED</Text>
            </View>
            <Text style={styles.reqDate}>Today, 10:30 AM</Text>
          </View>

          <Text style={styles.reqTitle}>Clarification: Morning Roll-Call Variance</Text>
          <Text style={styles.reqSender}>Issued by: Joint Director Desk, MoSJE</Text>
          <Text style={styles.reqBody}>
            The automated telemetry recorded an entrance count below reported attendance. A PMU inspector has been assigned for routine physical verification today between 11:00 AM - 04:00 PM. Please ensure visitor logs and kitchen receipts are ready.
          </Text>

          <View style={styles.reqFooter}>
            <Ionicons name="document-text-outline" size={14} color={colors.brand.primary} />
            <Text style={styles.reqFooterText}>Reference Notice #MOSJE-REQ-2026-44</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  requestCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
    ...shadows.xs,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reqBadge: {
    backgroundColor: colors.status.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  reqBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.warning,
    letterSpacing: 0.5,
  },
  reqDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  reqTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 2,
  },
  reqSender: {
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  reqBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  reqFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  reqFooterText: {
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    marginLeft: 4,
    fontWeight: typography.weights.medium,
  },
});
