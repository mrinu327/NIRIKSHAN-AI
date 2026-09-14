/**
 * RequestsPlaceholderScreen
 * SIH26095 | MoSJE NGO / Institute Portal
 *
 * Official Requests & Correspondence Queue.
 * Displays official inquiries, clarification notices, and action-required items from MoSJE / PMU.
 * Includes official clarification response, new request creation, and surprise video-call verification.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { SectionHeader } from '../../components/common/SectionHeader';
import { mockNgoService } from '../../services/mock/mockNgoService';
import { SurpriseVideoCallModal } from './SurpriseVideoCallModal';
import { NgoOfficialRequest, RequestCategory, SurpriseVideoCallSession } from '../../types/ngo';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const RequestsPlaceholderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentRole, switchRole } = useAuth();

  const [requests, setRequests] = useState<NgoOfficialRequest[]>([]);
  const [incomingVc, setIncomingVc] = useState<SurpriseVideoCallSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Surprise VC modal
  const [vcModalVisible, setVcModalVisible] = useState(false);

  // Response inline state
  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Create request modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newReqCategory, setNewReqCategory] = useState<RequestCategory>('Variance Clarification');
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqDesc, setNewReqDesc] = useState('');
  const [isCreatingReq, setIsCreatingReq] = useState(false);

  // Motion values
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(12)).current;

  const loadData = async () => {
    try {
      const [reqList, vc] = await Promise.all([
        mockNgoService.getRequests(),
        mockNgoService.getIncomingSurpriseVideoCall(),
      ]);
      setRequests(reqList);
      setIncomingVc(vc);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = mockNgoService.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(screenFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(screenSlide, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const handleOpenResponse = (reqId: string) => {
    setRespondingReqId(reqId);
    setResponseText(
      'Morning roll-call verified 42 beneficiaries present on site. 8 beneficiaries are currently on sanctioned day-leave / OPD visits as documented in institutional visitor register.'
    );
  };

  const handleSubmitResponse = async (reqId: string) => {
    if (!responseText.trim()) return;
    setIsSubmittingResponse(true);
    await mockNgoService.respondToRequest(reqId, responseText.trim());
    setIsSubmittingResponse(false);
    setRespondingReqId(null);
    setResponseText('');
  };

  const handleCreateRequest = async () => {
    if (!newReqTitle.trim() || !newReqDesc.trim()) return;
    setIsCreatingReq(true);
    await mockNgoService.createNgoRequest({
      category: newReqCategory,
      title: newReqTitle.trim(),
      description: newReqDesc.trim(),
    });
    setIsCreatingReq(false);
    setCreateModalVisible(false);
    setNewReqTitle('');
    setNewReqDesc('');
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

  const actionRequiredCount = requests.filter((r) => r.status === 'Action Required').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Executive Government-Grade MoSJE Header */}
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
                accessibilityRole="button"
                accessibilityLabel="Switch Role"
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.text.inverse} />
                <Text style={styles.switchText}>Switch Role</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerMainRow}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Requests & Inquiries
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Official queries, audits, and inspection notices from MoSJE / PMU
              </Text>
            </View>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setCreateModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.text.inverse} />
              <Text style={styles.headerActionBtnText}>New Inquiry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenSlide }] }}>
          {/* Incoming Surprise Video Call Banner */}
          {incomingVc && incomingVc.status === 'REQUESTED' && (
            <View style={styles.vcCard}>
              <View style={styles.vcIconBox}>
                <Ionicons name="videocam" size={22} color={colors.text.inverse} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.vcBadge}>
                  <Text style={styles.vcBadgeText}>PRIORITY CALL REQUEST</Text>
                </View>
                <Text style={styles.vcTitle}>Surprise Video Verification</Text>
                <Text style={styles.vcSub}>
                  {incomingVc.officerName} • {incomingVc.officerTitle}
                </Text>
                <Text style={styles.vcNotes}>"{incomingVc.notes}"</Text>
              </View>
              <TouchableOpacity
                style={styles.vcActionBtn}
                onPress={() => setVcModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.vcActionBtnText}>Answer Call</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Active Section Header with Tab Badge */}
          <SectionHeader
            title="Official Correspondence"
            subtitle="Review queries and submit institutional explanations"
            badgeCount={requests.length}
          />

          {/* Requests List */}
          <View style={{ gap: spacing.md }}>
            {requests.map((req) => {
              const isActionReq = req.status === 'Action Required';
              const isResponded = req.status === 'Responded';
              const isResolved = req.status === 'Resolved';
              const isReplying = respondingReqId === req.id;

              return (
                <View
                  key={req.id}
                  style={[
                    styles.requestCard,
                    isActionReq && styles.cardActionReq,
                    isResponded && styles.cardResponded,
                    isResolved && styles.cardResolved,
                  ]}
                >
                  {/* Request Header Status Strip */}
                  <View style={styles.reqHeader}>
                    <View
                      style={[
                        styles.reqBadge,
                        isActionReq && styles.badgeActionReq,
                        isResponded && styles.badgeResponded,
                        isResolved && styles.badgeResolved,
                      ]}
                    >
                      <Ionicons
                        name={
                          isActionReq
                            ? 'alert-circle'
                            : isResolved
                            ? 'checkmark-done-circle'
                            : 'checkmark-circle'
                        }
                        size={13}
                        color={
                          isActionReq
                            ? colors.status.warning
                            : isResolved
                            ? colors.status.normal
                            : colors.brand.primary
                        }
                      />
                      <Text
                        style={[
                          styles.reqBadgeText,
                          {
                            color: isActionReq
                              ? colors.status.warning
                              : isResolved
                              ? colors.status.normal
                              : colors.brand.primary,
                          },
                        ]}
                      >
                        {req.status.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.reqDateContainer}>
                      <Ionicons name="time-outline" size={13} color={colors.text.muted} />
                      <Text style={styles.reqDate}>{req.issuedAt}</Text>
                    </View>
                  </View>

                  {/* Request Title */}
                  <Text style={styles.reqTitle}>{req.title}</Text>

                  {/* Category & Issuing Authority */}
                  <View style={styles.senderRow}>
                    <View style={styles.senderIconBox}>
                      <Ionicons
                        name={req.direction === 'OUTGOING_FROM_NGO' ? 'paper-plane' : 'business'}
                        size={12}
                        color={colors.brand.primary}
                      />
                    </View>
                    <Text style={styles.reqSender}>
                      {req.direction === 'OUTGOING_FROM_NGO' ? 'Raised by' : 'Issued by'}: {req.issuedBy}
                    </Text>
                  </View>

                  {/* Official Inset Statement Body */}
                  <View style={styles.bodyBox}>
                    <Text style={styles.reqBody}>{req.description}</Text>
                  </View>

                  {/* Official Response History If Present */}
                  {req.responseNotes ? (
                    <View style={styles.responseBox}>
                      <View style={styles.responseHeader}>
                        <Ionicons name="return-down-forward" size={14} color={colors.brand.primary} />
                        <Text style={styles.responseHeaderText}>
                          Institutional Clarification ({req.respondedAt ?? 'Recorded'})
                        </Text>
                      </View>
                      <Text style={styles.responseText}>{req.responseNotes}</Text>
                      {req.respondedBy ? (
                        <Text style={styles.responseBy}>Filed by: {req.respondedBy}</Text>
                      ) : null}
                    </View>
                  ) : null}

                  {/* Action Bar / Response Trigger */}
                  {isActionReq && !isReplying && (
                    <View style={styles.reqActionsBar}>
                      <TouchableOpacity
                        style={styles.replyButton}
                        onPress={() => handleOpenResponse(req.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.text.inverse} />
                        <Text style={styles.replyButtonText}>Submit Official Clarification</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Inline Response Form */}
                  {isReplying && (
                    <View style={styles.replyForm}>
                      <Text style={styles.replyFormLabel}>Institutional Response Note</Text>
                      <TextInput
                        style={styles.replyInput}
                        multiline
                        numberOfLines={4}
                        value={responseText}
                        onChangeText={setResponseText}
                        placeholder="Type response notes or discrepancy explanation..."
                        placeholderTextColor={colors.text.muted}
                      />
                      <View style={styles.replyFormActions}>
                        <TouchableOpacity
                          style={styles.replyCancelBtn}
                          onPress={() => setRespondingReqId(null)}
                        >
                          <Text style={styles.replyCancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.replySubmitBtn}
                          onPress={() => handleSubmitResponse(req.id)}
                          disabled={isSubmittingResponse}
                        >
                          <Ionicons name="send" size={13} color={colors.text.inverse} />
                          <Text style={styles.replySubmitText}>
                            {isSubmittingResponse ? 'Sending...' : 'Send Clarification'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Document Reference Notice Footer */}
                  <View style={styles.reqFooter}>
                    <View style={styles.refPill}>
                      <Ionicons name="document-text-outline" size={13} color={colors.brand.primary} />
                      <Text style={styles.reqFooterText}>Reference Notice #{req.id}</Text>
                    </View>
                    <Text style={styles.categoryTag}>{req.category}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* SURPRISE VIDEO-CALL VERIFICATION MODAL */}
      {/* ========================================================================= */}
      <SurpriseVideoCallModal
        visible={vcModalVisible}
        onClose={() => setVcModalVisible(false)}
        session={incomingVc}
      />

      {/* ========================================================================= */}
      {/* CREATE NEW NGO INQUIRY MODAL */}
      {/* ========================================================================= */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Raise MoSJE Inquiry</Text>
                <Text style={styles.modalSub}>Sunrise Rehabilitation Centre (PRJ-101)</Text>
              </View>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formField}>
              <Text style={styles.inputLabel}>Inquiry Category</Text>
              <View style={styles.categoryPickerRow}>
                {(
                  [
                    'Variance Clarification',
                    'Grant Inquiry',
                    'Facility Update',
                    'Technical Issue',
                  ] as RequestCategory[]
                ).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      newReqCategory === cat && styles.catChipActive,
                    ]}
                    onPress={() => setNewReqCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        newReqCategory === cat && styles.catChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.inputLabel}>Subject / Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. DDRS Q4 Equipment Grant Disbursement Status"
                placeholderTextColor={colors.text.muted}
                value={newReqTitle}
                onChangeText={setNewReqTitle}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.inputLabel}>Detailed Description / Justification</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                multiline
                numberOfLines={4}
                placeholder="Specify grant details, facility equipment update, or inquiry context..."
                placeholderTextColor={colors.text.muted}
                value={newReqDesc}
                onChangeText={setNewReqDesc}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleCreateRequest}
                disabled={isCreatingReq}
              >
                <Ionicons name="paper-plane" size={14} color={colors.text.inverse} />
                <Text style={styles.modalConfirmText}>
                  {isCreatingReq ? 'Submitting...' : 'Submit Inquiry'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },

  // Executive MoSJE Header
  headerContainer: {
    backgroundColor: colors.brand.navy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    ...shadows.sm,
  },
  headerInner: {
    width: '100%',
    maxWidth: 1200,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 28,
  },
  switchText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.lg + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  headerActionBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },

  // Main Scroll Content
  content: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },

  // Surprise VC Alert Card
  vcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.xs,
  },
  vcIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.status.highPriority,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vcBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  vcBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
  },
  vcTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  vcSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 1,
  },
  vcNotes: {
    fontSize: 11,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  vcActionBtn: {
    backgroundColor: colors.status.highPriority,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  vcActionBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },

  // Request Card
  requestCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.neutral.border,
    ...shadows.xs,
  },
  cardActionReq: {
    borderLeftColor: colors.status.warning,
  },
  cardResponded: {
    borderLeftColor: colors.brand.primary,
  },
  cardResolved: {
    borderLeftColor: colors.status.normal,
  },

  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  reqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    gap: 4,
  },
  badgeActionReq: {
    backgroundColor: colors.status.warningLight,
    borderColor: 'rgba(217, 140, 30, 0.3)',
  },
  badgeResponded: {
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.brand.primary + '30',
  },
  badgeResolved: {
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normal + '30',
  },
  reqBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  reqDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reqDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  reqTitle: {
    fontSize: typography.sizes.base + 1,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    letterSpacing: -0.2,
    marginTop: 2,
    lineHeight: 22,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 6,
  },
  senderIconBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqSender: {
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
  },
  bodyBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  reqBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Official Response Box
  responseBox: {
    backgroundColor: colors.brand.primaryLight + '50',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.brand.primary + '30',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  responseHeaderText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  responseText: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    lineHeight: 18,
  },
  responseBy: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 4,
  },

  // Action Button for Reply
  reqActionsBar: {
    marginTop: spacing.md,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  replyButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },

  // Reply Form
  replyForm: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.brand.primary + '40',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  replyFormLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 6,
  },
  replyInput: {
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    textAlignVertical: 'top',
    height: 80,
  },
  replyFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  replyCancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  replyCancelText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  replySubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    gap: 5,
  },
  replySubmitText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },

  // Footer
  reqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  refPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.brand.accent,
    gap: 6,
  },
  reqFooterText: {
    fontSize: 11,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
  },
  categoryTag: {
    fontSize: 11,
    color: colors.text.muted,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  formField: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 6,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  catChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.surfaceSubtle,
    minHeight: 36,
    justifyContent: 'center',
  },
  catChipActive: {
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.brand.primary,
  },
  catChipText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  catChipTextActive: {
    color: colors.brand.primary,
    fontWeight: typography.weights.bold,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  modalTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modalCancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  modalCancelText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  modalConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    gap: 6,
    minHeight: 44,
  },
  modalConfirmText: {
    fontSize: typography.sizes.xs,
    color: colors.text.inverse,
    fontWeight: typography.weights.semibold,
  },
});
