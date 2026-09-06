/**
 * AssignmentsPlaceholderScreen
 * SIH26095 | MoSJE PMU Field Assignments Workspace
 *
 * Operational docket for PMU inspection officers:
 * - Real-time active inspection assignment queue
 * - Status-based visual hierarchy with rapid on-site action dispatch
 * - Immediate acknowledgement protocol with feedback toast
 * - Responsive single-column layout for mobile and tablet/desktop
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
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { InspectorTabNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
import { InspectionCard } from '../../components/cards/InspectionCard';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { mockAssignmentService } from '../../services/mock/mockAssignmentService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const AssignmentsPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation<InspectorTabNavigationProp<'Assignments'>>();
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const isDesktop = width >= 900;

  const { currentUser } = useAuth();
  const activeOfficerId = currentUser?.id || 'USR-INSP-DEMO-004';
  const activeBadgeId = currentUser?.badgeId || 'PMU-DEMO-004';

  const [assignments, setAssignments] = useState<InspectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animations
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;
  const toastFade = useRef(new Animated.Value(0)).current;
  const toastSlide = useRef(new Animated.Value(-8)).current;

  // Stagger animations for first 5 cards
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

  // Toast notification animation
  useEffect(() => {
    if (toastMessage) {
      toastFade.setValue(0);
      toastSlide.setValue(-8);
      Animated.parallel([
        Animated.timing(toastFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(toastSlide, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(toastFade, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setToastMessage(null));
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadAssignments = useCallback(async () => {
    try {
      const data = await mockInspectionService.getAssignedInspections();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
    const unsubscribe = navigation.addListener('focus', () => {
      loadAssignments();
    });
    return unsubscribe;
  }, [navigation, loadAssignments, currentUser]);

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
    loadAssignments();
  };

  const handleAcknowledge = async (inspectionId: string) => {
    try {
      const updated = await mockAssignmentService.acknowledgeAssignment(
        inspectionId,
        activeOfficerId,
        currentUser?.name || 'Demo Field Inspector',
        activeBadgeId
      );
      if (updated) {
        setToastMessage(`Assignment #${inspectionId} acknowledged for field visit.`);
        await loadAssignments();
      }
    } catch (err) {
      console.error('Error acknowledging assignment:', err);
    }
  };

  // Clean presentation labels
  const officerName = currentUser?.name ? currentUser.name.replace('Demo ', '') : 'Inspector';
  const badgeLabel = activeBadgeId.replace('DEMO-', '');
  const headerSubtitle = `Logged in as ${officerName} (${badgeLabel})`;

  // Skeleton Loader matching actual InspectionCard layout
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Field Assignments" subtitle={headerSubtitle} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Skeleton Section Header */}
          <View style={{ marginBottom: spacing.md }}>
            <Animated.View style={[styles.skeletonLine, { width: 200, height: 18, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 260, height: 13, marginTop: 6, opacity: skeletonPulse }]} />
          </View>

          {/* 3 Skeleton Cards */}
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Animated.View style={[styles.skeletonLine, { width: 110, height: 16, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonLine, { width: 70, height: 14, opacity: skeletonPulse }]} />
              </View>
              <Animated.View style={[styles.skeletonLine, { width: '80%', height: 20, marginTop: 12, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonLine, { width: '60%', height: 13, marginTop: 6, opacity: skeletonPulse }]} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Animated.View style={[styles.skeletonBox, { flex: 1, height: 42, opacity: skeletonPulse }]} />
                <Animated.View style={[styles.skeletonBox, { flex: 1, height: 42, opacity: skeletonPulse }]} />
              </View>
              <Animated.View
                style={[
                  styles.skeletonLine,
                  { width: '100%', height: 44, marginTop: 14, borderRadius: borderRadius.sm, opacity: skeletonPulse },
                ]}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader title="Field Assignments" subtitle={headerSubtitle} />

      {/* Floating Confirmation Toast */}
      {toastMessage && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastFade,
              transform: [{ translateY: toastSlide }],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color={colors.status.normal} />
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMessage}
          </Text>
        </Animated.View>
      )}

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
            title="Active Inspection Orders"
            subtitle="Follow MoSJE protocol during on-site visit"
            badgeCount={assignments.length}
          />

          {assignments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="clipboard-outline"
                size={44}
                color={colors.text.muted}
                style={{ marginBottom: spacing.sm }}
              />
              <Text style={styles.emptyTitle}>No Active Inspection Orders</Text>
              <Text style={styles.emptySubtitle}>
                There are currently no inspection assignments in your queue.
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={16} color={colors.brand.primary} style={{ marginRight: 6 }} />
                <Text style={styles.refreshButtonText}>Refresh Queue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            assignments.map((assignment, index) => {
              const cardAnim = cardAnims[index] || new Animated.Value(1);
              return (
                <Animated.View
                  key={assignment.id}
                  style={{
                    opacity: cardAnim,
                    transform: [
                      {
                        translateY: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [12, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <InspectionCard
                    inspection={assignment}
                    isInspectorView={true}
                    onAcknowledge={() => handleAcknowledge(assignment.id)}
                    onOpenInspection={() =>
                      navigation.navigate('InspectionOverview', { inspectionId: assignment.id })
                    }
                    onPress={() =>
                      navigation.navigate('InspectionOverview', { inspectionId: assignment.id })
                    }
                  />
                </Animated.View>
              );
            })
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
    maxWidth: 1200,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxxl + 32,
  },

  // Floating Toast
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: spacing.base,
    right: spacing.base,
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.status.normal,
    ...shadows.md,
    zIndex: 9999,
  },
  toastText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },

  // Empty State
  emptyContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.xs,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.brand.primaryLight,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  refreshButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },

  // Skeleton Styles
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.xs,
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
});
