/**
 * AlertsPlaceholderScreen
 * MoSJE Official - Anomaly Alerts & Human Review Queue
 * Formal triage desk for unverified telemetry discrepancies.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { AlertCard } from '../../components/cards/AlertCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { AnomalyAlert } from '../../types/alert';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const AlertsPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<OfficialTabNavigationProp<'Alerts'>>();
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'INVESTIGATION' | 'VERIFIED'>('ALL');

  // Entrance animation
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;

  const loadAlerts = async () => {
    try {
      const data = await mockAlertService.getAllAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const unsubscribe = navigation.addListener('focus', () => {
      loadAlerts();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(screenFade, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(screenSlide, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  // Compute dynamic counts
  const pendingCount = alerts.filter((a) => a.status === 'Pending Review').length;
  const investigationCount = alerts.filter((a) => a.status === 'Under Investigation').length;
  const verifiedCount = alerts.filter((a) => a.status === 'Verified' || a.status === 'Dismissed').length;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'PENDING') return a.status === 'Pending Review';
    if (filter === 'INVESTIGATION') return a.status === 'Under Investigation';
    if (filter === 'VERIFIED') return a.status === 'Verified' || a.status === 'Dismissed';
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Anomaly Triage & Review"
        subtitle="Automated Screening Signals • Official Human Verification Desk"
      />

      {loading ? (
        <LoadingState message="Loading anomaly alerts queue..." />
      ) : (
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: screenFade,
              transform: [{ translateY: screenSlide }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Triage Protocol Notice Banner */}
            <View style={styles.protocolBanner}>
              <Ionicons name="shield-checkmark" size={18} color={colors.brand.primary} />
              <Text style={styles.protocolText}>
                <Text style={{ fontWeight: typography.weights.bold }}>Operational Directive: </Text>
                Signals flagged by rule checks and camera telemetry represent unverified discrepancies. An official review is mandatory prior to on-site dispatch.
              </Text>
            </View>

            {/* Filter Chips with dynamic counts */}
            <View style={styles.filterRow}>
              {[
                { id: 'ALL', label: `All Alerts (${alerts.length})` },
                { id: 'PENDING', label: `Pending Review (${pendingCount})` },
                { id: 'INVESTIGATION', label: `Follow-up (${investigationCount})` },
                { id: 'VERIFIED', label: `Reviewed (${verifiedCount})` },
              ].map((chip) => {
                const isActive = filter === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setFilter(chip.id as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <SectionHeader
              title="Prioritized Review Queue"
              subtitle="Tap an alert to inspect side-by-side telemetry and record a governance decision"
              badgeCount={filteredAlerts.length}
            />

            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onPress={() => navigation.navigate('AlertReview', { alertId: alert.id })}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={36} color={colors.status.normal} />
                <Text style={styles.emptyTitle}>Queue Cleared</Text>
                <Text style={styles.emptySubtitle}>
                  No anomaly alerts match the current filter selection.
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  animatedContainer: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  protocolBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderColor: 'rgba(42, 92, 224, 0.25)',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 10,
  },
  protocolText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.brand.navy,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    minHeight: 34,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 4,
    textAlign: 'center',
  },
});

