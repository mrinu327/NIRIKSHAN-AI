/**
 * AttendancePlaceholderScreen
 * SIH26095 | MoSJE NGO / Institute Portal
 *
 * Daily Attendance Records, Beneficiary Roll-Call Roster & Institutional Submission Ledger.
 * Dynamic reactive state synced with MoSJE central monitoring pipeline.
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import { AttendanceCard } from '../../components/cards/AttendanceCard';
import { mockAttendanceService } from '../../services/mock/mockAttendanceService';
import { mockNgoService } from '../../services/mock/mockNgoService';
import { AttendanceSummary, AttendanceSubmission } from '../../types/attendance';
import { BeneficiaryRecord, NgoComplianceStatus } from '../../types/ngo';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const AttendancePlaceholderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentRole, switchRole } = useAuth();

  // Active view: 'summary' (Attendance Card + History) | 'roster' (Beneficiary List)
  const [activeTab, setActiveTab] = useState<'summary' | 'roster'>('summary');

  // Dynamic state
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [history, setHistory] = useState<AttendanceSubmission[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRecord[]>([]);
  const [compliance, setCompliance] = useState<NgoComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Beneficiary search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');

  // Manual attendance submission modal
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [inputPresent, setInputPresent] = useState('42');
  const [inputTotal, setInputTotal] = useState('50');
  const [inputNotes, setInputNotes] = useState('Morning roll-call synced with biometric terminal BIO-01.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Motion values
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(12)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Pulsing skeleton animation loop
  useEffect(() => {
    if (loading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, {
            toValue: 0.85,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonPulse, {
            toValue: 0.35,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [loading]);

  const loadAllData = async () => {
    try {
      const [sumData, histData, benData, compData] = await Promise.all([
        mockAttendanceService.getTodaySummary(),
        mockAttendanceService.getAttendanceHistory(),
        mockNgoService.getBeneficiaries(),
        mockNgoService.getComplianceStatus(),
      ]);
      setSummary(sumData);
      setHistory(histData);
      setBeneficiaries(benData);
      setCompliance(compData);
      setInputPresent(String(sumData.todayPresent));
      setInputTotal(String(sumData.todayCapacity));
    } catch (err) {
      console.error('Error loading attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Subscribe to updates from services
    const unsubAtt = mockAttendanceService.subscribe(() => {
      loadAllData();
    });
    const unsubNgo = mockNgoService.subscribe(() => {
      loadAllData();
    });

    return () => {
      unsubAtt();
      unsubNgo();
    };
  }, []);

  useEffect(() => {
    if (!loading && (summary || history.length > 0)) {
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
  }, [loading, summary, history]);

  // Beneficiary filter logic
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterStatus === 'PRESENT') return b.attendanceStatus === 'Present';
      if (filterStatus === 'ABSENT') return b.attendanceStatus === 'Absent';
      return true;
    });
  }, [beneficiaries, searchQuery, filterStatus]);

  // Beneficiary attendance toggle handler
  const handleToggleBeneficiary = async (beneficiaryId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    await mockNgoService.toggleBeneficiaryAttendance(beneficiaryId, nextStatus, nextStatus === 'Present');
  };

  // Manual submission modal submit
  const handleConfirmSubmit = async () => {
    const presentNum = parseInt(inputPresent, 10);
    const totalNum = parseInt(inputTotal, 10);
    if (isNaN(presentNum) || isNaN(totalNum) || presentNum < 0 || totalNum <= 0) return;

    setIsSubmitting(true);
    await mockAttendanceService.submitDailyAttendance({
      projectId: 'PRJ-101',
      presentCount: presentNum,
      totalEnrolled: totalNum,
      notes: inputNotes,
      submittedBy: 'Dr. Rajesh Sharma (Centre In-charge)',
    });
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setSubmitModalVisible(false);
    }, 900);
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

  const presentBeneficiaryCount = beneficiaries.filter((b) => b.attendanceStatus === 'Present').length;
  const absentBeneficiaryCount = beneficiaries.filter((b) => b.attendanceStatus === 'Absent').length;

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
                Beneficiary Attendance
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Daily biometric & morning roll-call logs • DDRS Mandate
              </Text>
            </View>
          </View>

          {/* Sub-navigation Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'summary' && styles.tabButtonActive]}
              onPress={() => setActiveTab('summary')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="stats-chart-outline"
                size={14}
                color={activeTab === 'summary' ? colors.brand.primary : 'rgba(255,255,255,0.7)'}
              />
              <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
                Daily Ledger
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'roster' && styles.tabButtonActive]}
              onPress={() => setActiveTab('roster')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="people-outline"
                size={14}
                color={activeTab === 'roster' ? colors.brand.primary : 'rgba(255,255,255,0.7)'}
              />
              <Text style={[styles.tabText, activeTab === 'roster' && styles.tabTextActive]}>
                Beneficiary Roster ({beneficiaries.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Skeleton Today AttendanceCard */}
          <Animated.View style={[styles.skeletonAttendanceCard, { opacity: skeletonPulse }]} />

          {/* Skeleton SectionHeader */}
          <View style={styles.skeletonSectionHeader}>
            <Animated.View style={[styles.skeletonLine, { width: 160, height: 16, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 260, height: 12, marginTop: 6, opacity: skeletonPulse }]} />
          </View>

          {/* Skeleton Ledger Rows */}
          <View style={styles.skeletonLedgerBox}>
            <Animated.View style={[styles.skeletonLedgerRow, { opacity: skeletonPulse }]} />
            <View style={styles.skeletonDivider} />
            <Animated.View style={[styles.skeletonLedgerRow, { opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenSlide }] }}>
            {/* ========================================================================= */}
            {/* TAB 1: SUMMARY & RECENT SUBMISSIONS LEDGER */}
            {/* ========================================================================= */}
            {activeTab === 'summary' && (
              <>
                {summary && (
                  <AttendanceCard
                    summary={summary}
                    instituteName="Sunrise Rehabilitation Centre"
                  />
                )}

                {/* CCTV Telemetry Variance Indicator */}
                {compliance && compliance.variance > 0 ? (
                  <View style={styles.varianceCard}>
                    <View style={styles.varianceHeader}>
                      <View style={styles.varianceIconBadge}>
                        <Ionicons name="warning-outline" size={16} color={colors.status.warning} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.varianceTitle}>CCTV Variance Indicator Flagged</Text>
                        <Text style={styles.varianceSub}>
                          Entrance Camera Stream estimated {compliance.cctvEstimatedCount} vs{' '}
                          {summary?.todayPresent ?? 42} submitted attendance (Variance: {compliance.variance}).
                        </Text>
                      </View>
                    </View>
                    <View style={styles.varianceFooter}>
                      <Ionicons name="information-circle-outline" size={13} color={colors.text.secondary} />
                      <Text style={styles.varianceFooterText}>
                        Variance notice pending review in Inquiries tab.
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.alignedCard}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.status.normal} />
                    <Text style={styles.alignedText}>
                      CCTV Edge Telemetry headcount aligns with reported attendance records.
                    </Text>
                  </View>
                )}

                {/* Submit / Update Attendance Action Bar */}
                <View style={styles.updateActionBar}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionBarTitle}>Institutional Headcount Filing</Text>
                    <Text style={styles.actionBarSub}>
                      Last submitted today at {summary?.lastSubmittedTime ?? '09:30 AM'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionSubmitBtn}
                    onPress={() => setSubmitModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="send-outline" size={14} color={colors.text.inverse} />
                    <Text style={styles.actionSubmitBtnText}>Submit Update</Text>
                  </TouchableOpacity>
                </View>

                <SectionHeader
                  title="Recent Submissions"
                  subtitle="Historical log entries verified by MoSJE central system"
                  badgeCount={history.length}
                />

                <View style={styles.ledgerContainer}>
                  {history.map((item, index) => {
                    const isVerified = item.status === 'Verified';
                    const submittedByName = item.submittedBy.replace('Demo ', '');
                    const isLast = index === history.length - 1;

                    return (
                      <View
                        key={item.id}
                        style={[styles.historyRow, isLast && styles.historyRowLast]}
                      >
                        <View style={styles.histHeader}>
                          <View style={styles.histDateGroup}>
                            <Ionicons name="calendar-outline" size={14} color={colors.brand.primary} />
                            <Text style={styles.histDate}>{item.date}</Text>
                          </View>
                          <View
                            style={[
                              styles.verifiedTag,
                              isVerified ? styles.tagVerified : styles.tagSubmitted,
                            ]}
                          >
                            <Ionicons
                              name={isVerified ? 'checkmark-done' : 'checkmark'}
                              size={12}
                              color={isVerified ? colors.status.normal : colors.brand.primary}
                            />
                            <Text
                              style={[
                                styles.verifiedText,
                                { color: isVerified ? colors.status.normal : colors.brand.primary },
                              ]}
                            >
                              {item.status}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.histCount}>
                          {item.presentCount} / {item.totalEnrolled} Present ({item.absentCount} Absent)
                        </Text>

                        {item.notes ? (
                          <Text style={styles.histNotes} numberOfLines={2}>
                            {item.notes}
                          </Text>
                        ) : null}

                        <View style={styles.histFooter}>
                          <Ionicons name="person-outline" size={12} color={colors.text.muted} />
                          <Text style={styles.histSubmitted}>
                            Submitted by: {submittedByName} at {item.submittedAt}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: BENEFICIARY ROLL-CALL ROSTER */}
            {/* ========================================================================= */}
            {activeTab === 'roster' && (
              <>
                {/* Roster Metric Overview */}
                <View style={styles.rosterOverviewCard}>
                  <View style={styles.rosterOverviewItem}>
                    <Text style={styles.rosterOverviewNum}>{beneficiaries.length}</Text>
                    <Text style={styles.rosterOverviewLbl}>Enrolled</Text>
                  </View>
                  <View style={styles.rosterOverviewDivider} />
                  <View style={styles.rosterOverviewItem}>
                    <Text style={[styles.rosterOverviewNum, { color: colors.status.normal }]}>
                      {presentBeneficiaryCount}
                    </Text>
                    <Text style={styles.rosterOverviewLbl}>Present</Text>
                  </View>
                  <View style={styles.rosterOverviewDivider} />
                  <View style={styles.rosterOverviewItem}>
                    <Text style={[styles.rosterOverviewNum, { color: colors.status.warning }]}>
                      {absentBeneficiaryCount}
                    </Text>
                    <Text style={styles.rosterOverviewLbl}>Absent</Text>
                  </View>
                </View>

                {/* Search and Filters */}
                <View style={styles.filterSection}>
                  <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={16} color={colors.text.muted} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search by name, ID (e.g. BEN-101-01), or category..."
                      placeholderTextColor={colors.text.muted}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={16} color={colors.text.muted} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.filterChipsRow}>
                    <TouchableOpacity
                      style={[styles.filterChip, filterStatus === 'ALL' && styles.filterChipActive]}
                      onPress={() => setFilterStatus('ALL')}
                    >
                      <Text style={[styles.filterChipText, filterStatus === 'ALL' && styles.filterChipTextActive]}>
                        All ({beneficiaries.length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChip, filterStatus === 'PRESENT' && styles.filterChipActive]}
                      onPress={() => setFilterStatus('PRESENT')}
                    >
                      <Text style={[styles.filterChipText, filterStatus === 'PRESENT' && styles.filterChipTextActive]}>
                        Present ({presentBeneficiaryCount})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChip, filterStatus === 'ABSENT' && styles.filterChipActive]}
                      onPress={() => setFilterStatus('ABSENT')}
                    >
                      <Text style={[styles.filterChipText, filterStatus === 'ABSENT' && styles.filterChipTextActive]}>
                        Absent ({absentBeneficiaryCount})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <SectionHeader
                  title="Beneficiary Roll-Call Register"
                  subtitle="Tap attendance badge to toggle present/absent status"
                  badgeCount={filteredBeneficiaries.length}
                />

                {/* Beneficiary List Cards */}
                <View style={styles.rosterListContainer}>
                  {filteredBeneficiaries.map((ben) => {
                    const isPresent = ben.attendanceStatus === 'Present';
                    return (
                      <View key={ben.id} style={styles.benCard}>
                        <View style={styles.benMainInfo}>
                          <View style={styles.benTopRow}>
                            <Text style={styles.benId}>{ben.id}</Text>
                            <View
                              style={[
                                styles.verifBadge,
                                ben.verificationStatus.includes('Biometric')
                                  ? styles.verifBiometric
                                  : styles.verifManual,
                              ]}
                            >
                              <Ionicons
                                name={
                                  ben.verificationStatus.includes('Biometric')
                                    ? 'finger-print-outline'
                                    : 'clipboard-outline'
                                }
                                size={11}
                                color={
                                  ben.verificationStatus.includes('Biometric')
                                    ? colors.brand.primary
                                    : colors.text.secondary
                                }
                              />
                              <Text
                                style={[
                                  styles.verifBadgeText,
                                  {
                                    color: ben.verificationStatus.includes('Biometric')
                                      ? colors.brand.primary
                                      : colors.text.secondary,
                                  },
                                ]}
                              >
                                {ben.verificationStatus}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.benName}>{ben.name}</Text>
                          <Text style={styles.benMeta}>
                            {ben.age} yrs • {ben.gender} • {ben.category}
                          </Text>

                          {ben.lastVerifiedAt && (
                            <Text style={styles.benLastVerified}>
                              Verified at: {ben.lastVerifiedAt}
                              {ben.biometricTerminalId ? ` (${ben.biometricTerminalId})` : ''}
                            </Text>
                          )}
                        </View>

                        {/* Interactive Attendance Toggle Button */}
                        <TouchableOpacity
                          style={[
                            styles.attendanceToggleBtn,
                            isPresent ? styles.toggleBtnPresent : styles.toggleBtnAbsent,
                          ]}
                          onPress={() => handleToggleBeneficiary(ben.id, ben.attendanceStatus)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isPresent ? 'checkmark-circle' : 'close-circle-outline'}
                            size={16}
                            color={isPresent ? colors.status.normal : colors.text.muted}
                          />
                          <Text
                            style={[
                              styles.attendanceToggleText,
                              { color: isPresent ? colors.status.normal : colors.text.secondary },
                            ]}
                          >
                            {isPresent ? 'Present' : 'Absent'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* MANUAL ATTENDANCE SUBMISSION MODAL */}
      {/* ========================================================================= */}
      <Modal visible={submitModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Daily Attendance Filing</Text>
                <Text style={styles.modalSub}>Sunrise Rehabilitation Centre (PRJ-101)</Text>
              </View>
              <TouchableOpacity onPress={() => setSubmitModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {submitSuccess ? (
              <View style={styles.modalSuccessBox}>
                <Ionicons name="checkmark-circle" size={48} color={colors.status.normal} />
                <Text style={styles.modalSuccessText}>Attendance Submitted Successfully!</Text>
                <Text style={styles.modalSuccessSub}>Central MoSJE registry ledger updated.</Text>
              </View>
            ) : (
              <>
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Present Count</Text>
                    <TextInput
                      style={styles.modalInput}
                      keyboardType="numeric"
                      value={inputPresent}
                      onChangeText={setInputPresent}
                    />
                  </View>
                  <View style={{ width: spacing.md }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Total Capacity</Text>
                    <TextInput
                      style={styles.modalInput}
                      keyboardType="numeric"
                      value={inputTotal}
                      onChangeText={setInputTotal}
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.inputLabel}>In-charge Remarks / Verification Notes</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextArea]}
                    multiline
                    numberOfLines={3}
                    value={inputNotes}
                    onChangeText={setInputNotes}
                    placeholder="Enter notes on biometric sync, authorized leaves, etc."
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setSubmitModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    onPress={handleConfirmSubmit}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="cloud-upload-outline" size={16} color={colors.text.inverse} />
                    <Text style={styles.modalConfirmText}>
                      {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    paddingBottom: spacing.sm,
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
    marginBottom: spacing.sm,
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

  // Sub-navigation Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: borderRadius.md,
    padding: 3,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.neutral.surface,
  },
  tabText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: colors.brand.primary,
    fontWeight: typography.weights.bold,
  },

  // Main Scroll Content
  content: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },

  // Variance & Aligned Telemetry Banners
  varianceCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.warning + '40',
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  varianceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  varianceIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.status.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  varianceTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  varianceSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  varianceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  varianceFooterText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  alignedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.normalLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.normal + '30',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  alignedText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },

  // Update Action Bar
  updateActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  actionBarTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  actionBarSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  actionSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
    minHeight: 44,
  },
  actionSubmitBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.inverse,
  },

  // Structured Attendance Ledger
  ledgerContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
    ...shadows.xs,
  },
  historyRow: {
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  histHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  histDateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  histDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    gap: 4,
  },
  tagVerified: {
    backgroundColor: colors.status.normalLight,
  },
  tagSubmitted: {
    backgroundColor: colors.brand.primaryLight,
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  histCount: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navyLight,
    marginTop: 2,
  },
  histNotes: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  histFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.xs,
  },
  histSubmitted: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },

  // Beneficiary Roster Styles
  rosterOverviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  rosterOverviewItem: {
    alignItems: 'center',
  },
  rosterOverviewNum: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  rosterOverviewLbl: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  rosterOverviewDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.neutral.divider,
  },

  filterSection: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    padding: 0,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.brand.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  filterChipTextActive: {
    color: colors.brand.primary,
    fontWeight: typography.weights.bold,
  },

  rosterListContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
    ...shadows.xs,
  },
  benCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    gap: spacing.sm,
  },
  benMainInfo: {
    flex: 1,
  },
  benTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  benId: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  verifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    gap: 3,
  },
  verifBiometric: {
    backgroundColor: colors.brand.primaryLight,
  },
  verifManual: {
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  verifBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
  benName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  benMeta: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  benLastVerified: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },

  attendanceToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: 4,
    minHeight: 44,
    minWidth: 84,
  },
  toggleBtnPresent: {
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normal + '50',
  },
  toggleBtnAbsent: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
  },
  attendanceToggleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
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
    maxWidth: 480,
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
  modalSuccessBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  modalSuccessText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
    marginTop: spacing.xs,
  },
  modalSuccessSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  formField: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 4,
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
    height: 72,
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

  // Skeleton Styles
  skeletonAttendanceCard: {
    height: 190,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  skeletonSectionHeader: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonLedgerBox: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    ...shadows.xs,
  },
  skeletonLedgerRow: {
    height: 64,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
  },
  skeletonDivider: {
    height: spacing.sm,
  },
});
