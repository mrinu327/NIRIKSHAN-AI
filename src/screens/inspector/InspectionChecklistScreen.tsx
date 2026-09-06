/**
 * InspectionChecklistScreen
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Multi-category structured inspection checklist with 4 evaluation states:
 * Not Checked | Verified | Needs Attention | Not Applicable
 * Mobile-first touch-friendly selector buttons (>=44px touch target) with real-time progress.
 * Integrated native-style executive header with back navigation.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { ChecklistItem, ChecklistStatus, ChecklistCategory } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type ChecklistRouteProp = RouteProp<InspectorStackParamList, 'InspectionChecklist'>;

const CATEGORIES: { id: ChecklistCategory; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    id: 'Project Operations',
    title: 'A. Project Operations',
    subtitle: 'Active mandate, service delivery, and staff attendance',
    icon: 'business',
  },
  {
    id: 'Beneficiary Verification',
    title: 'B. Beneficiary Verification',
    subtitle: 'Physical headcount, attendance audit, and activity check',
    icon: 'people',
  },
  {
    id: 'Infrastructure / Facility',
    title: 'C. Infrastructure / Facility',
    subtitle: 'Premises accessibility, safety, hygiene, and utilities',
    icon: 'shield-checkmark',
  },
  {
    id: 'Records / Documentation',
    title: 'D. Records / Documentation',
    subtitle: 'Biometric registers, vouchers, and statutory logs',
    icon: 'document-text',
  },
];

const STATUS_OPTIONS: {
  label: ChecklistStatus;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    label: 'Not Checked',
    color: colors.text.muted,
    bgColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    icon: 'ellipse-outline',
  },
  {
    label: 'Verified',
    color: colors.status.normal,
    bgColor: '#F0FDF4',
    borderColor: colors.status.normal,
    icon: 'checkmark-circle',
  },
  {
    label: 'Needs Attention',
    color: colors.status.warning,
    bgColor: '#FFFBEB',
    borderColor: colors.status.warning,
    icon: 'alert-circle',
  },
  {
    label: 'Not Applicable',
    color: '#475569',
    bgColor: '#F1F5F9',
    borderColor: '#94A3B8',
    icon: 'remove-circle-outline',
  },
];

export const InspectionChecklistScreen: React.FC = () => {
  const navigation = useNavigation<InspectorStackNavigationProp>();
  const route = useRoute<ChecklistRouteProp>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentRole, switchRole } = useAuth();
  const { inspectionId } = route.params;

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Motion values
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

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

  useEffect(() => {
    mockInspectionService.getChecklistTemplate(inspectionId).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [inspectionId]);

  useEffect(() => {
    if (!loading && items.length > 0) {
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
  }, [loading, items]);

  const handleStatusChange = (itemId: string, newStatus: ChecklistStatus) => {
    setValidationError(null);
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );
  };

  const handleNoteChange = (itemId: string, text: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes: text } : item))
    );
  };

  const completedCount = items.filter((i) => i.status !== 'Not Checked').length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  const handleProceed = async () => {
    if (completedCount < totalCount) {
      setValidationError(
        `Please evaluate all criteria before proceeding (${totalCount - completedCount} items still marked 'Not Checked').`
      );
      return;
    }

    setSaving(true);
    try {
      const responses = items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as Record<string, ChecklistItem>);

      await mockInspectionService.saveInspectionDraft(inspectionId, {
        checklistResponses: responses,
      });

      navigation.navigate('InspectionFindings', { inspectionId });
    } catch (err) {
      console.error('Failed to save checklist:', err);
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'official':
        return 'MoSJE Official';
      case 'inspector':
        return 'PMU Inspection Officer';
      case 'ngo':
        return 'NGO / Institute';
      default:
        return 'MoSJE Portal';
    }
  };

  // Skeleton Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

        {/* Integrated Skeleton Header */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
          <View style={styles.headerInner}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerBranding}>
                <View style={styles.headerEmblem}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
                </View>
                <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
              </View>
            </View>

            <View style={styles.headerMainRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBackBtn}
                accessibilityRole="button"
                accessibilityLabel="Back to overview"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Inspection Checklist
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Loading evaluation criteria...
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sticky Progress Bar Skeleton */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInner}>
            <View style={styles.progressTextRow}>
              <Animated.View style={[styles.skeletonLine, { width: 120, height: 14, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonLine, { width: 80, height: 14, opacity: skeletonPulse }]} />
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.skeletonLine, { width: '30%', height: '100%', opacity: skeletonPulse }]} />
            </View>
          </View>
        </View>

        {/* Skeleton Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonCategoryCard}>
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 18, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 240, height: 12, marginTop: 6, opacity: skeletonPulse }]} />
            <View style={{ marginTop: 16, gap: 12 }}>
              <Animated.View style={[styles.skeletonItemBox, { opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonItemBox, { opacity: skeletonPulse }]} />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Integrated Executive MoSJE Header with Native Back Navigation */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerBranding}>
              <View style={styles.headerEmblem}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
              </View>
              <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
            </View>

            <View style={styles.headerActionsRight}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{getRoleLabel()}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={switchRole}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.switchButton}
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.text.inverse} />
                <Text style={styles.switchText}>Switch Role</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerMainRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to overview"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Inspection Checklist
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Order #{inspectionId} • On-Site Assessment
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sticky Real-Time Checklist Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInner}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressTitle}>Checklist Progress</Text>
            <Text style={[styles.progressCount, isAllComplete && styles.progressCountComplete]}>
              {completedCount} / {totalCount} Completed ({progressPercent}%)
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` },
                isAllComplete && styles.progressFillComplete,
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + spacing.xxxl + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          }}
        >
          {/* Validation Error Banner */}
          {validationError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.status.warning} />
              <Text style={styles.errorBannerText}>{validationError}</Text>
            </View>
          ) : null}

          {/* Categories and Checklist Items */}
          {CATEGORIES.map((category) => {
            const categoryItems = items.filter((item) => item.category === category.id);
            const categoryCompleted = categoryItems.filter((item) => item.status !== 'Not Checked').length;
            const isCategoryComplete = categoryItems.length > 0 && categoryCompleted === categoryItems.length;

            return (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View
                    style={[
                      styles.categoryIconCircle,
                      isCategoryComplete && styles.categoryIconCircleComplete,
                    ]}
                  >
                    <Ionicons
                      name={category.icon}
                      size={18}
                      color={isCategoryComplete ? colors.status.normal : colors.brand.primary}
                    />
                  </View>
                  <View style={styles.categoryTextCol}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                  </View>
                  <View
                    style={[
                      styles.categoryBadge,
                      isCategoryComplete && styles.categoryBadgeComplete,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        isCategoryComplete && styles.categoryBadgeTextComplete,
                      ]}
                    >
                      {categoryCompleted}/{categoryItems.length}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemsList}>
                  {categoryItems.map((item, index) => {
                    const isNoteActive = activeNoteId === item.id || Boolean(item.notes);
                    const isVerified = item.status === 'Verified';
                    const isNeedsAttention = item.status === 'Needs Attention';
                    const isNA = item.status === 'Not Applicable';

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.itemBox,
                          isVerified && styles.itemBoxVerified,
                          isNeedsAttention && styles.itemBoxAttention,
                          isNA && styles.itemBoxNA,
                        ]}
                      >
                        <View style={styles.itemHeaderRow}>
                          <View
                            style={[
                              styles.itemNumBadge,
                              isVerified && styles.itemNumBadgeVerified,
                              isNeedsAttention && styles.itemNumBadgeAttention,
                              isNA && styles.itemNumBadgeNA,
                            ]}
                          >
                            <Text
                              style={[
                                styles.itemNumText,
                                isVerified && styles.itemNumTextVerified,
                                isNeedsAttention && styles.itemNumTextAttention,
                                isNA && styles.itemNumTextNA,
                              ]}
                            >
                              {index + 1}
                            </Text>
                          </View>
                          <View style={styles.itemTextCol}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemDesc}>{item.description}</Text>
                          </View>
                        </View>

                        {/* 4-Option Status Selector with >=44px Touch Targets */}
                        <View style={styles.optionsGrid}>
                          {STATUS_OPTIONS.map((opt) => {
                            const isSelected = item.status === opt.label;

                            return (
                              <TouchableOpacity
                                key={opt.label}
                                style={[
                                  styles.optionButton,
                                  isSelected && {
                                    backgroundColor: opt.bgColor,
                                    borderColor: opt.borderColor,
                                    borderWidth: 1.5,
                                  },
                                ]}
                                onPress={() => handleStatusChange(item.id, opt.label)}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={`${opt.label} for ${item.title}`}
                              >
                                <Ionicons
                                  name={opt.icon}
                                  size={15}
                                  color={isSelected ? opt.color : colors.text.muted}
                                  style={{ marginRight: 6 }}
                                />
                                <Text
                                  style={[
                                    styles.optionButtonText,
                                    isSelected && {
                                      color: opt.color,
                                      fontWeight: typography.weights.bold,
                                    },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {opt.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Optional Observation / Note Section */}
                        {isNoteActive ? (
                          <View style={styles.noteInputBox}>
                            <TextInput
                              style={styles.noteInput}
                              placeholder="Add inspector comment / observation..."
                              placeholderTextColor={colors.text.muted}
                              value={item.notes || ''}
                              onChangeText={(text) => handleNoteChange(item.id, text)}
                              multiline
                              numberOfLines={3}
                              textAlignVertical="top"
                            />
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.addNoteBtn}
                            onPress={() => setActiveNoteId(item.id)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Ionicons name="chatbubble-outline" size={12} color={colors.brand.primary} />
                            <Text style={styles.addNoteBtnText}>+ Add Observation Remark</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Action Section */}
          <View style={styles.actionSection}>
            <PrimaryButton
              title="Proceed to Findings & Evidence"
              iconName="arrow-forward"
              onPress={handleProceed}
              loading={saving}
              style={styles.primaryActionBtn}
            />
          </View>
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
  scrollContent: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
  },

  // Executive Header
  headerContainer: {
    backgroundColor: colors.brand.navy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    ...shadows.sm,
  },
  headerInner: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmblem: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerMinistry: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleBadgeText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(42, 92, 224, 0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(42, 92, 224, 0.4)',
  },
  switchText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },

  // Sticky Progress Bar
  progressContainer: {
    backgroundColor: colors.neutral.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    ...shadows.xs,
  },
  progressInner: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  progressCount: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  progressCountComplete: {
    color: colors.status.normal,
    fontWeight: typography.weights.bold,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.neutral.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
  },
  progressFillComplete: {
    backgroundColor: colors.status.normal,
  },

  // Validation Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.base,
    gap: 8,
  },
  errorBannerText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },

  // Category Cards
  categoryCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    gap: spacing.sm,
  },
  categoryIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconCircleComplete: {
    backgroundColor: '#F0FDF4',
  },
  categoryTextCol: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  categorySubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  categoryBadge: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  categoryBadgeComplete: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  categoryBadgeTextComplete: {
    color: colors.status.normal,
  },

  // Checklist Items List
  itemsList: {
    gap: spacing.sm + 2,
  },
  itemBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
  },
  itemBoxVerified: {
    borderColor: '#86EFAC',
    backgroundColor: '#FAFDFB',
  },
  itemBoxAttention: {
    borderColor: colors.status.warningBorder,
    backgroundColor: '#FFFDF9',
  },
  itemBoxNA: {
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  itemNumBadgeVerified: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  itemNumBadgeAttention: {
    backgroundColor: '#FFFBEB',
    borderColor: colors.status.warningBorder,
  },
  itemNumBadgeNA: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  itemNumText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  itemNumTextVerified: {
    color: colors.status.normal,
  },
  itemNumTextAttention: {
    color: colors.status.warning,
  },
  itemNumTextNA: {
    color: '#475569',
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.sizes.xs + 2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 20,
  },
  itemDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
    marginTop: 2,
  },

  // 4-Option Status Selector Grid (>=44px touch targets)
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '47%',
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  optionButtonText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },

  // Note Input Box
  noteInputBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  noteInput: {
    fontSize: 12,
    color: colors.text.primary,
    minHeight: 56,
    lineHeight: 18,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  addNoteBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },

  // Action Section
  actionSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  primaryActionBtn: {
    minHeight: 48,
  },

  // Skeleton Styles
  skeletonCategoryCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  skeletonItemBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    height: 110,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
});
