/**
 * AlertsPlaceholderScreen (Inspector)
 * PMU Inspector - Inspection-related anomaly alerts
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { AlertCard } from '../../components/cards/AlertCard';
import { LoadingState } from '../../components/common/LoadingState';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { AnomalyAlert } from '../../types/alert';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const AlertsPlaceholderScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockAlertService.getPendingAlerts().then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Field Inspection Alerts"
        subtitle="Institutes assigned due to automatic discrepancy triggers"
      />

      {loading ? (
        <LoadingState message="Loading alert notifications..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <SectionHeader
            title="Assigned Discrepancy Triggers"
            subtitle="Requires on-site verification before audit sign-off"
            badgeCount={alerts.length}
          />
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
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
});
