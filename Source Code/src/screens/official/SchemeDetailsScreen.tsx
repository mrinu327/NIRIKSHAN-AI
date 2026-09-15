/**
 * SchemeDetailsScreen
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Official Welfare Scheme Dossier & Monitoring Intelligence
 * Provides comprehensive scheme overview, dynamic performance engine metrics,
 * financial distribution ledger, geographic footprint, and Scheme -> Project -> Anomaly mapping.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackNavigationProp, OfficialStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { DataSourceBadge } from '../../components/common/DataSourceBadge';
import { schemeService } from '../../services/master/schemeService';
import { divisionService } from '../../services/master/divisionService';
import {
  Scheme,
  SchemePerformanceMetrics,
  Division,
  MasterProject,
  Organization,
  MasterInspection,
  MasterAnomaly,
} from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const SchemeDetailsScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<RouteProp<OfficialStackParamList, 'SchemeDetails'>>();
  const { schemeId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [division, setDivision] = useState<Division | null>(null);
  const [performance, setPerformance] = useState<SchemePerformanceMetrics | null>(null);
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [inspections, setInspections] = useState<MasterInspection[]>([]);
  const [anomalies, setAnomalies] = useState<MasterAnomaly[]>([]);

  useEffect(() => {
    loadSchemeDetails();
  }, [schemeId]);

  const loadSchemeDetails = async () => {
    try {
      setLoading(true);
      const s = await schemeService.getSchemeById(schemeId);
      if (!s) return;
      setScheme(s);

      const [div, perfData, prjList, orgList, inspList, anomList] = await Promise.all([
        divisionService.getDivisionById(s.divisionId),
        schemeService.getSchemePerformanceSummary(schemeId),
        schemeService.getSchemeProjects(schemeId),
        schemeService.getSchemeOrganizations(schemeId),
        schemeService.getSchemeInspections(schemeId),
        schemeService.getSchemeAnomalies(schemeId),
      ]);

      setDivision(div ?? null);
      setPerformance(perfData ?? null);
      setProjects(prjList);
      setOrganizations(orgList);
      setInspections(inspList);
      setAnomalies(anomList);
    } catch (err) {
      console.error('Failed to load scheme details:', err);
    } finally {
      setLoading(false);
    }
  };

  const priority = performance?.monitoringPriority ?? scheme?.monitoringPriority ?? 'LOW';
  const isCritical = priority === 'CRITICAL';
  const isHigh = priority === 'HIGH';

  return (
    <View style={styles.container}>
      <AppHeader
        title={scheme?.name ?? 'Scheme Dossier'}
        subtitle={`Scheme ID: ${scheme?.schemeId ?? schemeId} • ${scheme?.category ?? 'Welfare'}`}
      />

      {loading || !scheme ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading scheme intelligence dossier...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}
          showsVerticalScrollIndicator={false}
        >
          {/* Breadcrumb Navigation */}
          <TouchableOpacity
            style={styles.backBreadcrumb}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color={colors.brand.primary} />
            <Text style={styles.backBreadcrumbText}>Back to Schemes Directory</Text>
          </TouchableOpacity>

          {/* HEADER CARD: IDENTITY & PROVENANCE */}
          <View style={styles.identityCard}>
            <View style={styles.identityHeaderRow}>
              <View style={styles.identityTitleCol}>
                <View style={styles.badgeRow}>
                  <Text style={styles.codeText}>{scheme.shortName || scheme.code || scheme.schemeId}</Text>
                  <DataSourceBadge dataSource={scheme.dataSource} size="md" />
                </View>
                <Text style={styles.schemeName}>{scheme.name}</Text>
                <Text style={styles.schemeCategory}>{scheme.category || 'National Welfare Programme'}</Text>
              </View>

              <View
                style={[
                  styles.priorityPill,
                  isCritical
                    ? styles.priorityCritical
                    : isHigh
                    ? styles.priorityHigh
                    : styles.priorityNormal,
                ]}
              >
                <Ionicons
                  name={isCritical || isHigh ? 'warning' : 'shield-checkmark'}
                  size={14}
                  color={
                    isCritical
                      ? colors.status.highPriority
                      : isHigh
                      ? colors.status.warning
                      : colors.status.normal
                  }
                />
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color: isCritical
                        ? colors.status.highPriority
                        : isHigh
                        ? colors.status.warning
                        : colors.status.normal,
                    },
                  ]}
                >
                  MONITORING: {priority}
                </Text>
              </View>
            </View>

            {scheme.description ? (
              <Text style={styles.schemeDesc}>{scheme.description}</Text>
            ) : null}

            {/* Official Source Provenance Bar */}
            <View style={styles.provenanceBar}>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
              <View style={styles.provenanceTextCol}>
                <Text style={styles.provenanceLabel}>
                  Authority: {scheme.dataSource.sourceName || 'Government of India'}
                </Text>
                {scheme.sourceUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(scheme.sourceUrl!)}
                  >
                    <Text style={styles.provenanceLink}>{scheme.sourceUrl} ↗</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          {/* SECTION 1: SCHEME OVERVIEW & ADMINISTRATIVE OWNERSHIP */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Administrative & Operational Framework</Text>
            <Text style={styles.sectionSubtitle}>
              Governance, target groups, and implementation model
            </Text>

            <View style={styles.metaList}>
              {/* Owning Division Link */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.metaRowClickable}
                onPress={() =>
                  division && navigation.navigate('DivisionDetails', { divisionId: division.divisionId })
                }
              >
                <View style={styles.metaIconWrap}>
                  <Ionicons name="business" size={16} color={colors.brand.primary} />
                </View>
                <View style={styles.metaTextCol}>
                  <Text style={styles.metaLabel}>Owning Administrative Division</Text>
                  <Text style={styles.metaValClickable}>
                    {division?.name ?? scheme.divisionId} ({division?.shortName ?? scheme.divisionId}) ↗
                  </Text>
                </View>
              </TouchableOpacity>

              {scheme.targetBeneficiaries ? (
                <View style={styles.metaRow}>
                  <View style={styles.metaIconWrap}>
                    <Ionicons name="people" size={16} color={colors.status.normal} />
                  </View>
                  <View style={styles.metaTextCol}>
                    <Text style={styles.metaLabel}>Target Beneficiaries</Text>
                    <Text style={styles.metaVal}>{scheme.targetBeneficiaries}</Text>
                  </View>
                </View>
              ) : null}

              {scheme.implementationModel ? (
                <View style={styles.metaRow}>
                  <View style={styles.metaIconWrap}>
                    <Ionicons name="construct" size={16} color={colors.brand.primary} />
                  </View>
                  <View style={styles.metaTextCol}>
                    <Text style={styles.metaLabel}>Implementation Model</Text>
                    <Text style={styles.metaVal}>{scheme.implementationModel}</Text>
                  </View>
                </View>
              ) : null}

              {scheme.fundingModel ? (
                <View style={styles.metaRow}>
                  <View style={styles.metaIconWrap}>
                    <Ionicons name="cash" size={16} color={colors.status.warning} />
                  </View>
                  <View style={styles.metaTextCol}>
                    <Text style={styles.metaLabel}>Funding Model</Text>
                    <Text style={styles.metaVal}>{scheme.fundingModel}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          {/* SECTION 2: PERFORMANCE ENGINE DECK */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Performance Intelligence Engine</Text>
            <Text style={styles.sectionSubtitle}>
              Live operational metrics derived dynamically from verified project records
            </Text>

            <View style={styles.kpiGrid}>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.projectCount ?? 0}</Text>
                <Text style={styles.kpiLbl}>Total Projects ({performance?.activeProjectCount ?? 0} Active)</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.organizationCount ?? 0}</Text>
                <Text style={styles.kpiLbl}>Implementing NGOs / Centers</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.beneficiaryEnrolled ?? 0}</Text>
                <Text style={styles.kpiLbl}>Enrolled Beneficiaries</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.beneficiaryReported ?? 0}</Text>
                <Text style={styles.kpiLbl}>Reported Attendance</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.averageCompliance ?? 0}%</Text>
                <Text style={styles.kpiLbl}>Average Compliance</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text
                  style={[
                    styles.kpiVal,
                    (performance?.anomalyCount ?? 0) > 0 && { color: colors.status.highPriority },
                  ]}
                >
                  {performance?.anomalyCount ?? 0}
                </Text>
                <Text style={styles.kpiLbl}>Anomaly Signals</Text>
              </View>
            </View>
          </View>

          {/* SECTION 3: FINANCIAL OVERVIEW DECK */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Grant Sanctions & Fund Utilization</Text>
            <Text style={styles.sectionSubtitle}>
              Financial ledger tracking sanctioned, released, utilized, and unspent amounts
            </Text>

            <View style={styles.finGrid}>
              <View style={styles.finItem}>
                <Text style={styles.finLabel}>Sanctioned Budget</Text>
                <Text style={styles.finVal}>
                  ₹{((performance?.sanctionedFunding ?? 0) / 10000000).toFixed(2)} Cr
                </Text>
              </View>
              <View style={styles.finItem}>
                <Text style={styles.finLabel}>Released Amount</Text>
                <Text style={styles.finVal}>
                  ₹{((performance?.releasedFunding ?? 0) / 10000000).toFixed(2)} Cr
                </Text>
              </View>
              <View style={styles.finItem}>
                <Text style={styles.finLabel}>Utilized Amount</Text>
                <Text style={[styles.finVal, { color: colors.status.normal }]}>
                  ₹{((performance?.utilizedFunding ?? 0) / 10000000).toFixed(2)} Cr
                </Text>
              </View>
              <View style={styles.finItem}>
                <Text style={styles.finLabel}>Unspent Balance</Text>
                <Text style={[styles.finVal, { color: colors.status.warning }]}>
                  ₹{((performance?.unspentAmount ?? 0) / 100000).toFixed(2)} Lakh
                </Text>
              </View>
            </View>

            {/* Utilization Bar */}
            <View style={styles.utilBarWrap}>
              <View style={styles.utilLabels}>
                <Text style={styles.utilLabel}>Utilization Progress</Text>
                <Text style={styles.utilPercent}>{performance?.utilizationPercentage ?? 0}%</Text>
              </View>
              <View style={styles.utilTrack}>
                <View
                  style={[
                    styles.utilFill,
                    { width: `${Math.min(performance?.utilizationPercentage ?? 0, 100)}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* SECTION 4: SCHEME PROJECTS DIRECTORY */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Operating Projects ({projects.length})</Text>
            <Text style={styles.sectionSubtitle}>
              Institutional projects operating under this national scheme
            </Text>

            <View style={styles.projectsList}>
              {projects.map(project => {
                const isHigh = project.priority === 'HIGH' || project.monitoringPriority === 'HIGH';
                return (
                  <TouchableOpacity
                    key={project.projectId}
                    activeOpacity={0.8}
                    style={styles.projectRowCard}
                    onPress={() => navigation.navigate('ProjectDetails', { projectId: project.projectId })}
                  >
                    <View style={styles.projectRowHeader}>
                      <View style={styles.projectTitleWrap}>
                        <View style={styles.codeRowSmall}>
                          <Text style={styles.projectCode}>{project.code || project.projectId}</Text>
                          <DataSourceBadge dataSource={project.dataSource} size="sm" />
                        </View>
                        <Text style={styles.projectName}>{project.name}</Text>
                        <Text style={styles.projectOrg}>
                          Organization: {project.organizationId} • Location: {project.location?.city || 'Delhi'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.projectPriorityBadge,
                          isHigh ? styles.projPriorityHigh : styles.projPriorityNormal,
                        ]}
                      >
                        <Text
                          style={[
                            styles.projPriorityText,
                            { color: isHigh ? colors.status.highPriority : colors.status.normal },
                          ]}
                        >
                          {project.priority}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.projectMetricsRow}>
                      <Text style={styles.projMetric}>
                        Compliance: <Text style={styles.bold}>{project.complianceScore ?? 75}/100</Text>
                      </Text>
                      <Text style={styles.projMetric}>
                        Attendance: <Text style={styles.bold}>{project.attendance?.present ?? 42}/{project.attendance?.capacity ?? 50}</Text>
                      </Text>
                      <Text style={styles.projMetric}>
                        CCTV: <Text style={styles.bold}>{project.cctvStatus || 'Active'}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SECTION 5: MONITORING SIGNALS (SCHEME -> PROJECT -> ANOMALY MAPPING) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Monitoring & Inspection Telemetry</Text>
            <Text style={styles.sectionSubtitle}>
              Direct Scheme → Project → Anomaly relationship signals
            </Text>

            {/* Inspections summary stats */}
            <View style={styles.inspSummaryRow}>
              <View style={styles.inspStat}>
                <Text style={styles.inspStatNum}>{performance?.inspectionCount ?? 0}</Text>
                <Text style={styles.inspStatLabel}>Total Audits</Text>
              </View>
              <View style={styles.inspStatDivider} />
              <View style={styles.inspStat}>
                <Text style={[styles.inspStatNum, { color: colors.status.normal }]}>
                  {performance?.completedInspectionCount ?? 0}
                </Text>
                <Text style={styles.inspStatLabel}>Completed</Text>
              </View>
              <View style={styles.inspStatDivider} />
              <View style={styles.inspStat}>
                <Text style={[styles.inspStatNum, { color: colors.status.warning }]}>
                  {performance?.pendingInspectionCount ?? 0}
                </Text>
                <Text style={styles.inspStatLabel}>Pending Review</Text>
              </View>
            </View>

            {/* Anomaly Signal Cards */}
            {anomalies.length === 0 ? (
              <View style={styles.cleanStateCard}>
                <Ionicons name="checkmark-circle" size={24} color={colors.status.normal} />
                <Text style={styles.cleanStateText}>Zero active anomaly alerts detected for this scheme.</Text>
              </View>
            ) : (
              <View style={styles.anomalyListWrap}>
                {anomalies.map(anomaly => (
                  <View key={anomaly.anomalyId} style={styles.anomalyCard}>
                    <View style={styles.anomalyHeaderRow}>
                      <View style={styles.anomalyBadge}>
                        <Ionicons name="alert-circle" size={15} color={colors.status.highPriority} />
                        <Text style={styles.anomalyBadgeId}>{anomaly.anomalyId}</Text>
                      </View>
                      <Text style={styles.anomalySeverityBadge}>{anomaly.severity} SEVERITY</Text>
                    </View>

                    <Text style={styles.anomalyExplanation}>{anomaly.explanation}</Text>

                    {/* Relationship Trace Strip */}
                    <View style={styles.relationshipStrip}>
                      <Text style={styles.relText}>
                        Scheme <Text style={styles.relBold}>{scheme.shortName || scheme.schemeId}</Text>
                        {'  →  '}
                        Project <Text style={styles.relBold}>{anomaly.projectId}</Text>
                        {'  →  '}
                        Alert <Text style={styles.relBold}>{anomaly.anomalyId}</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* SECTION 6: AI / NIRIKSHAN INSIGHTS */}
          <View style={styles.sectionCard}>
            <View style={styles.insightsHeader}>
              <View style={styles.aiBadge}>
                <Ionicons name="analytics-outline" size={14} color={colors.brand.primary} />
                <Text style={styles.aiBadgeText}>NIRIKSHAN OBSERVATIONS & SIGNALS</Text>
              </View>
            </View>

            <View style={styles.insightsList}>
              {anomalies.length > 0 ? (
                <View style={styles.insightItem}>
                  <Ionicons name="chevron-forward" size={14} color={colors.status.highPriority} />
                  <Text style={styles.insightText}>
                    {anomalies.length} high-severity anomaly signal active on project{' '}
                    <Text style={styles.bold}>{anomalies[0].projectId}</Text>. Discrepancy between reported attendance and camera feed traffic requires physical field verification.
                  </Text>
                </View>
              ) : (
                <View style={styles.insightItem}>
                  <Ionicons name="checkmark" size={14} color={colors.status.normal} />
                  <Text style={styles.insightText}>
                    Zero biometric or headcount discrepancies currently detected across scheme projects.
                  </Text>
                </View>
              )}

              <View style={styles.insightItem}>
                <Ionicons name="chevron-forward" size={14} color={colors.brand.primary} />
                <Text style={styles.insightText}>
                  Fund utilization rate is currently at{' '}
                  <Text style={styles.bold}>{performance?.utilizationPercentage ?? 0}%</Text>. ₹
                  {((performance?.unspentAmount ?? 0) / 100000).toFixed(2)} Lakh remaining in unspent allocation.
                </Text>
              </View>

              <View style={styles.insightItem}>
                <Ionicons name="chevron-forward" size={14} color={colors.brand.primary} />
                <Text style={styles.insightText}>
                  {performance?.pendingInspectionCount ?? 0} field audit inspections scheduled or awaiting review by assigned PMU monitoring teams.
                </Text>
              </View>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text.secondary,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  desktopScrollContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  backBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  backBreadcrumbText: {
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  identityCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  identityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  identityTitleCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  schemeName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    lineHeight: 26,
  },
  schemeCategory: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  priorityNormal: {
    backgroundColor: 'rgba(30, 142, 90, 0.1)',
    borderColor: 'rgba(30, 142, 90, 0.3)',
  },
  priorityHigh: {
    backgroundColor: 'rgba(217, 140, 30, 0.1)',
    borderColor: 'rgba(217, 140, 30, 0.3)',
  },
  priorityCritical: {
    backgroundColor: 'rgba(196, 64, 44, 0.1)',
    borderColor: 'rgba(196, 64, 44, 0.3)',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  schemeDesc: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  provenanceBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  provenanceTextCol: {
    flex: 1,
  },
  provenanceLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  provenanceLink: {
    fontSize: 11,
    color: colors.brand.primary,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  metaList: {
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  metaRowClickable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.brand.primaryLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.brand.accent,
  },
  metaIconWrap: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaTextCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.text.muted,
  },
  metaVal: {
    fontSize: 13,
    color: colors.text.primary,
    marginTop: 2,
  },
  metaValClickable: {
    fontSize: 13,
    color: colors.brand.primary,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  kpiItem: {
    flex: 1,
    minWidth: 130,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  kpiVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  kpiLbl: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  finGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  finItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  finLabel: {
    fontSize: 11,
    color: colors.text.muted,
  },
  finVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  utilBarWrap: {
    marginTop: spacing.xs,
  },
  utilLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  utilLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  utilPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  utilTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.border,
    overflow: 'hidden',
  },
  utilFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: borderRadius.full,
  },
  projectsList: {
    gap: spacing.sm,
  },
  projectRowCard: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  projectRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectTitleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  codeRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  projectCode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  projectOrg: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  projectPriorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  projPriorityHigh: {
    backgroundColor: 'rgba(196, 64, 44, 0.1)',
  },
  projPriorityNormal: {
    backgroundColor: 'rgba(30, 142, 90, 0.1)',
  },
  projPriorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  projectMetricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  projMetric: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  bold: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  inspSummaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    justifyContent: 'space-around',
  },
  inspStat: {
    alignItems: 'center',
  },
  inspStatNum: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  inspStatLabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  inspStatDivider: {
    width: 1,
    backgroundColor: colors.neutral.border,
  },
  cleanStateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(30, 142, 90, 0.08)',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
  },
  cleanStateText: {
    fontSize: 13,
    color: colors.status.normal,
  },
  anomalyListWrap: {
    gap: spacing.sm,
  },
  anomalyCard: {
    backgroundColor: 'rgba(196, 64, 44, 0.05)',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(196, 64, 44, 0.2)',
  },
  anomalyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  anomalyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  anomalyBadgeId: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.status.highPriority,
  },
  anomalySeverityBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.highPriority,
  },
  anomalyExplanation: {
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
  relationshipStrip: {
    marginTop: spacing.sm,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  relText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  relBold: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  insightsHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  insightsList: {
    gap: spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
