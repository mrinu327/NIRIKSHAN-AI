/**
 * AlertsPlaceholderScreen (Inspector)
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Inspector Root Tab: Field Inspection Alerts / Anomaly Queue
 * Real-time monitoring of automated discrepancy triggers requiring
 * on-site verification before administrative audit sign-off.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { InspectorTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { AlertCard } from '../../components/cards/AlertCard';
import { mockAlertService } from '../../services/mock/mockAlertService';
import { AnomalyAlert } from '../../types/alert';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const AlertsPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<InspectorTabNavigationProp<'Alerts'>>();
  const { width } = useWindowDimensions();

  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Motion values
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Stagger animations for initial 5 cards
  const cardAnims = useRef<Animated.Value[]>(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;

  // Pulsing skeleton animation loop
  useEffect(() => {
    if (loading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, {
            toValue: 0.85,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonPulse, {
            toValue: 0.35,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [loading]);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await mockAlertService.getPendingAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load pending alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const unsubscribe = navigation.addListener('focus', () => {
      loadAlerts();
    });
    return unsubscribe;
  }, [navigation, loadAlerts]);

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
        Animated.stagger(
          50,
          cardAnims.map((anim) =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 240,
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    }
  }, [loading]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  // Skeleton Loader matching actual AlertCard layout
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader
          title="Field Inspection Alerts"
          subtitle="Institutes assigned due to automatic discrepancy triggers"
        />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Skeleton Section Header */}
          <View style={styles.skeletonHeaderRow}>
            <View>
              <Animated.View style={[styles.skeletonLine, { width: 220, height: 18, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonLine, { width: 280, height: 13, marginTop: 6, opacity: skeletonPulse }]} />
            </View>
            <Animated.View style={[styles.skeletonPill, { width: 28, height: 20, opacity: skeletonPulse }]} />
          </View>

          {/* Skeleton Cards */}
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <View style={styles.skeletonTopRow}>
                <Animated.View style={[styles.skeletonLine, { width: 140, height: 16, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonLine, { width: 60, height: 12, opacity: skeletonPulse }]} />
              </View>
              <Animated.View style={[styles.skeletonLine, { width: '80%', height: 20, marginTop: 10, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonLine, { width: '95%', height: 14, marginTop: 8, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonLine, { width: '70%', height: 14, marginTop: 4, opacity: skeletonPulse }]} />

              <View style={styles.skeletonMetricsBox}>
                <Animated.View style={[styles.skeletonBox, { flex: 1, height: 38, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonBox, { flex: 1, height: 38, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonBox, { flex: 1, height: 38, opacity: skeletonPulse }]} />
              </View>

              <Animated.View style={[styles.skeletonPill, { width: 160, height: 22, marginTop: 12, opacity: skeletonPulse }]} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Field Inspection Alerts"
        subtitle="Institutes assigned due to automatic discrepancy triggers"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brand.primary]}
            tintColor={colors.brand.primary}
          />
        }
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          }}
        >
          <SectionHeader
            title="Assigned Discrepancy Triggers"
            subtitle="Requires on-site verification before audit sign-off"
            badgeCount={alerts.length}
          />

          {alerts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={30} color={colors.text.muted} />
              </View>
              <Text style={styles.emptyTitle}>No Pending Alerts</Text>
              <Text style={styles.emptySubtitle}>
                All automated discrepancy triggers have been reviewed or dispatched for on-site verification.
              </Text>
            </View>
          ) : (
            <View style={styles.alertList}>
              {alerts.map((alert, index) => {
                const anim = index < 5 ? cardAnims[index] : screenFade;
                return (
                  <Animated.View
                    key={alert.id}
                    style={{
                      opacity: anim,
                      transform: [
                        {
                          translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [12, 0],
                          }),
                        },
                      ],
                    }}
                  >
                    <AlertCard
                      alert={alert}
                      style={alert.severity === 'MEDIUM' ? styles.alertCardMedium : undefined}
                    />
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>
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
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxxl + 24,
  },
  alertList: {
    gap: spacing.xs,
  },
  alertCardMedium: {
    borderLeftWidth: 3,
    borderLeftColor: colors.status.warning,
  },

  // Empty State
  emptyContainer: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.xs,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutral.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
    marginTop: 6,
  },

  // Skeleton Styles
  skeletonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  skeletonTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonMetricsBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  skeletonPill: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.full,
  },
});
