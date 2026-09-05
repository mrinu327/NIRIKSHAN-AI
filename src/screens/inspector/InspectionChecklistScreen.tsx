/**
 * InspectionChecklistScreen
 * SIH26095 | MoSJE PMU Field Inspection Workflow
 *
 * Multi-category structured inspection checklist with 4 evaluation states:
 * Not Checked | Verified | Needs Attention | Not Applicable
 * Mobile-first touch-friendly selector pills with real-time progress.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionHeader } from '../../components/common/SectionHeader';
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

const STATUS_OPTIONS: { label: ChecklistStatus; color: string; bgColor: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Not Checked', color: colors.text.muted, bgColor: colors.neutral.surfaceSubtle, icon: 'ellipse-outline' },
  { label: 'Verified', color: colors.status.normal, bgColor: '#F0FDF4', icon: 'checkmark-circle' },
  { label: 'Needs Attention', color: colors.status.warning, bgColor: '#FFFBEB', icon: 'alert-circle' },
  { label: 'Not Applicable', color: '#475569', bgColor: '#F1F5F9', icon: 'remove-circle-outline' },
];

export const InspectionChecklistScreen: React.FC = () => {
  const navigation = useNavigation<InspectorStackNavigationProp>();
  const route = useRoute<ChecklistRouteProp>();
  const { inspectionId } = route.params;

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    mockInspectionService.getChecklistTemplate(inspectionId).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [inspectionId]);

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
        <AppHeader title="Inspection Checklist" subtitle="Loading evaluation template..." />
        <ActivityIndicator size="large" color={colors.brand.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />
      <AppHeader
        title="Inspection Checklist"
        subtitle={`Order #${inspectionId} • On-Site Assessment`}
      />

      {/* Sticky Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInner}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressTitle}>Checklist Progress</Text>
            <Text style={styles.progressCount}>
              {completedCount} / {totalCount} Completed ({progressPercent}%)
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color={colors.brand.primary} />
          <Text style={styles.backButtonText}>Back to Overview</Text>
        </TouchableOpacity>

        {validationError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.status.warning} />
            <Text style={styles.errorBannerText}>{validationError}</Text>
          </View>
        )}

        {/* Categories and Checklist Items */}
        {CATEGORIES.map((category) => {
          const categoryItems = items.filter((item) => item.category === category.id);
          const categoryCompleted = categoryItems.filter((item) => item.status !== 'Not Checked').length;

          return (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIconCircle}>
                  <Ionicons name={category.icon} size={18} color={colors.brand.primary} />
                </View>
                <View style={styles.categoryTextCol}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {categoryCompleted}/{categoryItems.length}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {categoryItems.map((item, index) => {
                  const isNoteActive = activeNoteId === item.id || Boolean(item.notes);

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.itemBox,
                        item.status === 'Verified' && styles.itemBoxVerified,
                        item.status === 'Needs Attention' && styles.itemBoxAttention,
                        item.status === 'Not Applicable' && styles.itemBoxNA,
                      ]}
                    >
                      <View style={styles.itemHeaderRow}>
                        <View style={styles.itemNumBadge}>
                          <Text style={styles.itemNumText}>{index + 1}</Text>
                        </View>
                        <View style={styles.itemTextCol}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <Text style={styles.itemDesc}>{item.description}</Text>
                        </View>
                      </View>

                      {/* 4-Option Status Selector */}
                      <View style={styles.optionsRow}>
                        {STATUS_OPTIONS.map((opt) => {
                          const isSelected = item.status === opt.label;

                          return (
                            <TouchableOpacity
                              key={opt.label}
                              style={[
                                styles.optionPill,
                                isSelected && {
                                  backgroundColor: opt.bgColor,
                                  borderColor: opt.color,
                                  borderWidth: 1.5,
                                },
                              ]}
                              onPress={() => handleStatusChange(item.id, opt.label)}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name={opt.icon}
                                size={13}
                                color={isSelected ? opt.color : colors.text.muted}
                                style={{ marginRight: 3 }}
                              />
                              <Text
                                style={[
                                  styles.optionPillText,
                                  isSelected && {
                                    color: opt.color,
                                    fontWeight: typography.weights.bold,
                                  },
                                ]}
                              >
                                {opt.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Optional Note Section */}
                      {isNoteActive ? (
                        <View style={styles.noteInputBox}>
                          <TextInput
                            style={styles.noteInput}
                            placeholder="Add inspector comment / observation..."
                            placeholderTextColor={colors.text.muted}
                            value={item.notes || ''}
                            onChangeText={(text) => handleNoteChange(item.id, text)}
                            multiline
                          />
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addNoteBtn}
                          onPress={() => setActiveNoteId(item.id)}
                          activeOpacity={0.7}
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

        {/* Action Button */}
        <View style={styles.actionSection}>
          <PrimaryButton
            title="Proceed to Findings & Evidence"
            iconName="arrow-forward"
            onPress={handleProceed}
            loading={saving}
          />
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
  centerContainer: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
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
    marginBottom: 4,
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
  progressTrack: {
    height: 6,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  backButtonText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
    marginLeft: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  errorBannerText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: '#92400E',
    flex: 1,
  },
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
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    gap: spacing.sm,
  },
  categoryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.text.muted,
  },
  categoryBadge: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
  },
  itemBoxVerified: {
    borderColor: '#BBF7D0',
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
    gap: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  itemNumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  itemNumText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 18,
  },
  itemDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 15,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  optionPillText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  noteInputBox: {
    marginTop: spacing.xs + 2,
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
  },
  noteInput: {
    fontSize: 11,
    color: colors.text.primary,
    minHeight: 36,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  addNoteBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  actionSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
