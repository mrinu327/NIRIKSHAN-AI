/**
 * AlertsPlaceholderScreen
 * MoSJE Official - Anomaly Alerts & Human Review Queue
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
        title="Anomaly Alerts Queue"
        subtitle="Rule check & machine variance alerts requiring human verification"
      />

      {loading ? (
        <LoadingState message="Loading anomaly alerts..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {[
              { id: 'ALL', label: `All (${alerts.length})` },
              { id: 'PENDING', label: 'Pending Review' },
              { id: 'INVESTIGATION', label: 'Under Follow-up' },
              { id: 'VERIFIED', label: 'Reviewed / Verified' },
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
            title="Human Review Alert Queue"
            subtitle="Tap any alert card below to open detailed review and take governance action"
            badgeCount={filteredAlerts.length}
          />

          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onPress={() => navigation.navigate('AlertReview', { alertId: alert.id })}
            />
          ))}
        </ScrollView>
      )}
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
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
});
