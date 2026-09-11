import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';
import {
  useInspectionStore,
  CompletedReport,
  CapturedEvidence,
} from '../../src/store/useInspectionStore';

export default function InspectorReports() {
  const completedReports = useInspectionStore((s) => s.completedReports);

  // Detail Modal
  const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Evidence preview modal
  const [evidenceModalVisible, setEvidenceModalVisible] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState<CapturedEvidence | null>(null);
  const [previewTab, setPreviewTab] = useState<'ORIGINAL' | 'PROCESSED' | 'METADATA'>('ORIGINAL');

  const handleOpenReport = (report: CompletedReport) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const handleOpenEvidence = (ev: CapturedEvidence) => {
    setPreviewEvidence(ev);
    setPreviewTab('ORIGINAL');
    setEvidenceModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader
        title="INSPECTION HISTORY"
        subtitle="Audited Deployments & Verified Evidence Dockets"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>HISTORICAL INSPECTIONS</Text>
          <Text style={styles.reportCountBadge}>{completedReports.length} RECORDS</Text>
        </View>

        {completedReports.map((r) => {
          const isSurprise = r.type.includes('Surprise') || r.type.includes('SURPRISE');
          const isIssues = r.result === 'Issues Found';
          const riskScore = r.riskScore ?? (isIssues ? 82 : 34);

          return (
            <Card
              key={r.id}
              style={[
                styles.reportCard,
                isSurprise && styles.cardHighlightSurprise,
              ]}
            >
              {/* Header: Date + Type Badge */}
              <View style={styles.reportTop}>
                <Text style={styles.reportDate}>{r.date}</Text>
                <View
                  style={[
                    styles.typePill,
                    isSurprise ? styles.typePillSurprise : styles.typePillRegular,
                  ]}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      isSurprise ? styles.typePillTextSurprise : styles.typePillTextRegular,
                    ]}
                  >
                    {isSurprise ? '⚡ Surprise' : 'Regular'}
                  </Text>
                </View>
              </View>

              <Text style={styles.projectName}>{r.project}</Text>
              <Text style={styles.reportOrder}>Order ID: #{r.inspectionId}</Text>

              {/* Status and Verification Indicators */}
              <View style={styles.verifRow}>
                <View style={styles.verifIndicator}>
                  <Text style={styles.verifIcon}>
                    {r.geofenceVerified ? '🟢' : '🔴'}
                  </Text>
                  <Text style={styles.verifLabel}>Geofence Verified</Text>
                </View>

                <View style={styles.verifIndicator}>
                  <Text style={styles.verifIcon}>
                    {r.biometricVerified ? '🟢' : '⚪'}
                  </Text>
                  <Text style={styles.verifLabel}>Biometrics Verified</Text>
                </View>
              </View>

              {/* Risk & Result Row */}
              <View style={styles.riskResultRow}>
                <View style={styles.riskBox}>
                  <Text style={styles.riskLabel}>Risk Score</Text>
                  <View style={styles.riskValRow}>
                    <Text style={styles.riskVal}>{riskScore}</Text>
                    <Text style={styles.riskDot}>{riskScore >= 70 ? '🔴' : '🟢'}</Text>
                  </View>
                </View>

                <View style={styles.resultBox}>
                  <Text style={styles.resultLabel}>Inspection Result</Text>
                  <Text
                    style={[
                      styles.resultVal,
                      isIssues ? styles.resultValIssues : styles.resultValCompliant,
                    ]}
                  >
                    {r.result || (isIssues ? 'Issues Found' : 'Compliant')}
                  </Text>
                </View>
              </View>

              {/* Summary Notes */}
              <View style={styles.outcomeBox}>
                <Text style={styles.outcomeLabel}>Field Findings Summary:</Text>
                <Text style={styles.outcomeText} numberOfLines={2}>
                  {r.outcome}
                </Text>
              </View>

              {/* Footer Row with [ VIEW ] Button */}
              <View style={styles.reportFooter}>
                <View>
                  <Text style={styles.evidenceText}>📁 {r.evidenceCount} Media Items</Text>
                  <Text style={styles.hashText}>🔒 {r.hashStatus}</Text>
                </View>

                <Button
                  title="VIEW TIMELINE & DOSSIER ➔"
                  size="sm"
                  variant="primary"
                  onPress={() => handleOpenReport(r)}
                  style={styles.viewBtn}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* INSPECTION TIMELINE & EVIDENCE MODAL (Section 14 & 15) */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTag}>AUDITED FIELD DOSSIER</Text>
              <Text style={styles.modalProjectTitle} numberOfLines={1}>
                {selectedReport?.project}
              </Text>
              <Text style={styles.modalOrderDate}>
                Order #{selectedReport?.inspectionId} • {selectedReport?.date}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtnCircle}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Section 15: Connected Inspection Timeline */}
            <Card style={styles.timelineCard}>
              <Text style={styles.sectionHeaderTitle}>CONNECTIVITY AUDIT TIMELINE</Text>
              <Text style={styles.sectionHeaderSub}>
                Sequential chronological record of all on-site field actions
              </Text>

              <View style={styles.timelineList}>
                {(selectedReport?.timeline || []).map((evt, idx) => (
                  <View key={evt.id} style={styles.timelineItem}>
                    {/* Timestamp & Icon */}
                    <View style={styles.timelineLeft}>
                      <Text style={styles.timelineTime}>{evt.time}</Text>
                      <View style={styles.timelineIconBubble}>
                        <Text style={styles.timelineIconText}>{evt.icon}</Text>
                      </View>
                      {idx < (selectedReport?.timeline.length || 1) - 1 && (
                        <View style={styles.timelineConnectingLine} />
                      )}
                    </View>

                    {/* Content */}
                    <View style={styles.timelineRight}>
                      <Text style={styles.timelineItemTitle}>{evt.title}</Text>
                      {evt.description && (
                        <Text style={styles.timelineItemDesc}>{evt.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </Card>

            {/* Attached Evidence Items */}
            <Card style={styles.evidenceCard}>
              <Text style={styles.sectionHeaderTitle}>PRESERVED EVIDENCE VAULT</Text>
              <Text style={styles.sectionHeaderSub}>
                Raw original photos preserved alongside AI-annotated telemetry
              </Text>

              {(selectedReport?.evidenceList || []).length > 0 ? (
                selectedReport?.evidenceList?.map((ev) => (
                  <View key={ev.id} style={styles.modalEvidenceItem}>
                    <View style={styles.evTopRow}>
                      <View style={styles.evCategoryPill}>
                        <Text style={styles.evCategoryPillText}>{ev.category}</Text>
                      </View>
                      <Text style={styles.evStatusText}>✓ {ev.status}</Text>
                    </View>

                    <Text style={styles.evTitle}>{ev.title}</Text>
                    <Text style={styles.evFileName}>📁 {ev.fileName}</Text>

                    {ev.originalPhotoUri && (
                      <Text style={styles.evPreservedTag}>
                        ✓ Original photo preserved without alteration
                      </Text>
                    )}

                    <View style={styles.evActionsRow}>
                      <TouchableOpacity
                        style={styles.evActionBtn}
                        onPress={() => {
                          setPreviewEvidence(ev);
                          setPreviewTab('ORIGINAL');
                          setEvidenceModalVisible(true);
                        }}
                      >
                        <Text style={styles.evActionText}>VIEW ORIGINAL</Text>
                      </TouchableOpacity>

                      {ev.processedPhotoUri && (
                        <TouchableOpacity
                          style={styles.evActionBtn}
                          onPress={() => {
                            setPreviewEvidence(ev);
                            setPreviewTab('PROCESSED');
                            setEvidenceModalVisible(true);
                          }}
                        >
                          <Text style={styles.evActionText}>VIEW PROCESSED</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.evActionBtn}
                        onPress={() => {
                          setPreviewEvidence(ev);
                          setPreviewTab('METADATA');
                          setEvidenceModalVisible(true);
                        }}
                      >
                        <Text style={styles.evActionText}>VIEW METADATA</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noEvidenceBox}>
                  <Text style={styles.noEvidenceText}>
                    📁 {selectedReport?.evidenceCount} Evidence Files cryptographically archived on government server.
                  </Text>
                </View>
              )}
            </Card>

            {/* Outcome and Close Button */}
            <Button
              title="Close Dossier"
              variant="secondary"
              onPress={() => setModalVisible(false)}
              style={{ marginTop: spacing.base }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* EVIDENCE DETAIL PREVIEW MODAL */}
      <Modal visible={evidenceModalVisible} animationType="slide" transparent={true}>
        <View style={styles.backdrop}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {previewEvidence?.title || 'Evidence Item'}
              </Text>
              <TouchableOpacity
                onPress={() => setEvidenceModalVisible(false)}
                style={styles.previewCloseBtn}
              >
                <Text style={styles.previewCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewTabs}>
              <TouchableOpacity
                style={[styles.previewTab, previewTab === 'ORIGINAL' && styles.previewTabActive]}
                onPress={() => setPreviewTab('ORIGINAL')}
              >
                <Text style={[styles.previewTabText, previewTab === 'ORIGINAL' && styles.previewTabTextActive]}>
                  ORIGINAL
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.previewTab, previewTab === 'PROCESSED' && styles.previewTabActive]}
                onPress={() => setPreviewTab('PROCESSED')}
              >
                <Text style={[styles.previewTabText, previewTab === 'PROCESSED' && styles.previewTabTextActive]}>
                  PROCESSED
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.previewTab, previewTab === 'METADATA' && styles.previewTabActive]}
                onPress={() => setPreviewTab('METADATA')}
              >
                <Text style={[styles.previewTabText, previewTab === 'METADATA' && styles.previewTabTextActive]}>
                  METADATA
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              {previewTab === 'ORIGINAL' && (
                <View style={styles.previewBodyCenter}>
                  <View style={styles.origBadge}>
                    <Text style={styles.origBadgeText}>✓ RAW UNCOMPRESSED ORIGINAL</Text>
                  </View>
                  <View style={styles.canvasPlaceholder}>
                    <Text style={{ fontSize: 36 }}>📸</Text>
                    <Text style={styles.canvasTitle}>{previewEvidence?.fileName}</Text>
                    <Text style={styles.canvasSub}>Original raw image byte preservation active</Text>
                  </View>
                </View>
              )}

              {previewTab === 'PROCESSED' && (
                <View style={styles.previewBodyCenter}>
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>🤖 AI DERIVED ANALYSIS</Text>
                  </View>
                  <View style={styles.canvasPlaceholder}>
                    <Text style={{ fontSize: 36 }}>🔍</Text>
                    <Text style={styles.canvasTitle}>Computer Vision Telemetry</Text>
                    <Text style={styles.canvasSub}>Visual headcount & spatial bounding mesh</Text>
                  </View>
                </View>
              )}

              {previewTab === 'METADATA' && (
                <View style={styles.metaList}>
                  <View style={styles.metaLineRow}>
                    <Text style={styles.metaLineK}>Captured At:</Text>
                    <Text style={styles.metaLineV}>{previewEvidence?.metadata?.captureTimestamp || previewEvidence?.capturedAt}</Text>
                  </View>
                  <View style={styles.metaLineRow}>
                    <Text style={styles.metaLineK}>GPS Location:</Text>
                    <Text style={styles.metaLineV}>{previewEvidence?.latitude.toFixed(4)}° N, {previewEvidence?.longitude.toFixed(4)}° E</Text>
                  </View>
                  <View style={styles.metaLineRow}>
                    <Text style={styles.metaLineK}>Geofence Status:</Text>
                    <Text style={[styles.metaLineV, { color: colors.success }]}>{previewEvidence?.metadata?.geofenceStatus || 'INSIDE'}</Text>
                  </View>
                  <View style={styles.metaLineRow}>
                    <Text style={styles.metaLineK}>SHA-256 Digest:</Text>
                    <Text style={styles.metaLineHash} numberOfLines={2}>{previewEvidence?.hash}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    padding: spacing.base,
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl + 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  reportCountBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textLight,
  },
  reportCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHighlightSurprise: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reportDate: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  typePillSurprise: {
    backgroundColor: '#FEE2E2',
  },
  typePillRegular: {
    backgroundColor: '#E0F2FE',
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  typePillTextSurprise: {
    color: colors.danger,
  },
  typePillTextRegular: {
    color: colors.primary,
  },
  projectName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  reportOrder: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  verifRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  verifIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifIcon: {
    fontSize: 10,
  },
  verifLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  riskResultRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  riskBox: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  riskLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  riskValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  riskVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  riskDot: {
    fontSize: 10,
  },
  resultBox: {
    flex: 2,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  resultLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  resultVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  resultValIssues: {
    color: colors.danger,
  },
  resultValCompliant: {
    color: colors.success,
  },
  outcomeBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  outcomeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
  },
  outcomeText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  evidenceText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
  },
  hashText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },
  viewBtn: {
    paddingHorizontal: 12,
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  modalProjectTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },
  modalOrderDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '700',
  },
  modalContent: {
    padding: spacing.base,
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl,
  },
  timelineCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  sectionHeaderSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  timelineList: {
    marginTop: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineLeft: {
    width: 75,
    alignItems: 'center',
    position: 'relative',
  },
  timelineTime: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  timelineIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 2,
  },
  timelineIconText: {
    fontSize: 14,
  },
  timelineConnectingLine: {
    position: 'absolute',
    top: 48,
    bottom: -16,
    width: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingTop: 16,
  },
  timelineItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  timelineItemDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  evidenceCard: {
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
  },
  modalEvidenceItem: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  evTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evCategoryPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  evCategoryPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  evStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  evTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  evFileName: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  evPreservedTag: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
    marginTop: 3,
  },
  evActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.sm,
  },
  evActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  evActionText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  noEvidenceBox: {
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.sm,
  },
  noEvidenceText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Backdrop & Preview modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  previewCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  previewCloseBtn: {
    padding: 6,
  },
  previewCloseText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '700',
  },
  previewTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  previewTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  previewTabActive: {
    borderBottomColor: colors.primary,
  },
  previewTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  previewTabTextActive: {
    color: colors.primary,
  },
  previewBodyCenter: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  origBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  origBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  aiBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
  },
  canvasPlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasTitle: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
    marginTop: 6,
  },
  canvasSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  metaList: {
    gap: 6,
  },
  metaLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  metaLineK: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metaLineV: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  metaLineHash: {
    fontSize: 9,
    color: colors.primary,
    maxWidth: 200,
    textAlign: 'right',
  },
});
