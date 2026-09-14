/**
 * DivisionDetailsScreen
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Official Deep Intelligence Dossier for Administrative Divisions
 * Displays division mandate, scheme performance table, financial ledger,
 * state coverage, and aggregated telemetry signals with transparent provenance.
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
import { divisionService } from '../../services/master/divisionService';
import { schemeService } from '../../services/master/schemeService';
import {
  Division,
  DivisionPerformanceMetrics,
  Scheme,
  SchemePerformanceMetrics,
  MasterAnomaly,
} from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const DivisionDetailsScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<RouteProp<OfficialStackParamList, 'DivisionDetails'>>();
  const { divisionId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [division, setDivision] = useState<Division | null>(null);
  const [performance, setPerformance] = useState<DivisionPerformanceMetrics | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [schemePerfMap, setSchemePerfMap] = useState<Record<string, SchemePerformanceMetrics>>({});
  const [anomalies, setAnomalies] = useState<MasterAnomaly[]>([]);

  useEffect(() => {
    loadDivisionDetails();
  }, [divisionId]);

  const loadDivisionDetails = async () => {
    try {
      setLoading(true);
      const div = await divisionService.getDivisionById(divisionId);
      if (!div) return;
      setDivision(div);

      const [perfData, schemeList, anomalyList] = await Promise.all([
        divisionService.getDivisionPerformanceSummary(divisionId),
        divisionService.getDivisionSchemes(divisionId),
        divisionService.getDivisionAnomalies(divisionId),
      ]);

      setPerformance(perfData);
      setSchemes(schemeList);
      setAnomalies(anomalyList);

      const sMap: Record<string, SchemePerformanceMetrics> = {};
      for (const s of schemeList) {
        const sPerf = await schemeService.getSchemePerformanceSummary(s.schemeId);
        if (sPerf) sMap[s.schemeId] = sPerf;
      }
      setSchemePerfMap(sMap);
    } catch (err) {
      console.error('Failed to load division details:', err);
    } finally {
      setLoading(false);
    }
  };

  const priority = performance?.monitoringPriority ?? 'LOW';
  const isCritical = priority === 'CRITICAL';
  const isHigh = priority === 'HIGH';

  return (
    <View style={styles.container}>
      <AppHeader
        title={division?.name ?? 'Division Dossier'}
        subtitle={`Desk: ${division?.responsibleUnit ?? 'MoSJE'}`}
      />

      {loading || !division ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading division dossier...</Text>
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
            <Text style={styles.backBreadcrumbText}>Back to Administrative Divisions</Text>
          </TouchableOpacity>

          {/* TOP IDENTITY & PROVENANCE CARD */}
          <View style={styles.identityCard}>
            <View style={styles.identityHeader}>
              <View style={styles.identityTitleCol}>
                <View style={styles.badgeRow}>
                  <Text style={styles.codeText}>{division.code || division.divisionId}</Text>
                  <DataSourceBadge dataSource={division.dataSource} size="md" />
                </View>
                <Text style={styles.divisionName}>{division.name}</Text>
                {division.shortName ? (
                  <Text style={styles.shortName}>Short Name / Ref: {division.shortName}</Text>
                ) : null}
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

            {division.description ? (
              <Text style={styles.divisionDesc}>{division.description}</Text>
            ) : null}

            {/* PROVENANCE / STATUS CLARIFICATION BOX */}
            <View
              style={[
                styles.jurisdictionBox,
                division.divisionId === 'DIV-SD' || division.divisionId === 'DIV-SCD'
                  ? styles.jurisdictionOfficial
                  : division.divisionId === 'DIV-DEPWD'
                  ? styles.jurisdictionAllied
                  : styles.jurisdictionDemo,
              ]}
            >
              <View style={styles.jurisdictionHeader}>
                <Ionicons
                  name={
                    division.divisionId === 'DIV-SD' || division.divisionId === 'DIV-SCD'
                      ? 'shield-checkmark'
                      : division.divisionId === 'DIV-DEPWD'
                      ? 'business'
                      : 'flask'
                  }
                  size={16}
                  color={
                    division.divisionId === 'DIV-SD' || division.divisionId === 'DIV-SCD'
                      ? colors.status.normal
                      : division.divisionId === 'DIV-DEPWD'
                      ? colors.brand.primary
                      : colors.status.warning
                  }
                />
                <Text
                  style={[
                    styles.jurisdictionTag,
                    {
                      color:
                        division.divisionId === 'DIV-SD' || division.divisionId === 'DIV-SCD'
                          ? colors.status.normal
                          : division.divisionId === 'DIV-DEPWD'
                          ? colors.brand.primary
                          : colors.status.warning,
                    },
                  ]}
                >
                  {division.divisionId === 'DIV-SD' || division.divisionId === 'DIV-SCD'
                    ? 'OFFICIAL / VERIFIED DoSJE DIVISION'
                    : division.divisionId === 'DIV-DEPWD'
                    ? 'PUBLIC / VERIFIED ALLIED DEPARTMENT (MoSJE) — NOT DoSJE'
                    : 'DEMO / UNVERIFIED COMPATIBILITY / PROTOTYPE DESK'}
                </Text>
              </View>
              <Text style={styles.jurisdictionDesc}>
                {division.divisionId === 'DIV-SD'
                  ? 'Official administrative division under the Department of Social Justice and Empowerment (DoSJE), Government of India. Formulates and executes national policies on substance demand reduction and social defence programs.'
                  : division.divisionId === 'DIV-SCD'
                  ? 'Official administrative division under the Department of Social Justice and Empowerment (DoSJE), Government of India. Directs socio-economic and skill empowerment programs under PM-AJAY and PM-DAKSH.'
                  : division.divisionId === 'DIV-DEPWD'
                  ? 'Department of Empowerment of Persons with Disabilities (DEPwD) is an allied sister department under the Ministry of Social Justice and Empowerment (MoSJE), separate from DoSJE. Represented in Nirikshan AI to track DDRS grant-in-aid projects (PRJ-101, PRJ-105).'
                  : 'Prototype desk representation retained for backward compatibility with PRJ-103. In official Government of India administrative hierarchy, Senior Citizens Welfare (AVAY/SAGE) operates under the Social Defence Division.'}
              </Text>
            </View>

            {/* Official Source Provenance Bar */}
            <View style={styles.provenanceBar}>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
              <View style={styles.provenanceTextCol}>
                <Text style={styles.provenanceLabel}>
                  Source Authority: {division.dataSource.sourceName || 'Government of India'}
                </Text>
                {division.dataSource.sourceUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(division.dataSource.sourceUrl!)}
                  >
                    <Text style={styles.provenanceLink}>{division.dataSource.sourceUrl} ↗</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          {/* SECTION 1: PERFORMANCE ENGINE METRICS (18 COMPUTED METRICS) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Operational Performance Deck</Text>
            <Text style={styles.sectionSubtitle}>
              Aggregated real-time metrics across all schemes and field projects
            </Text>

            <View style={styles.kpiGrid}>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.totalSchemes ?? 0}</Text>
                <Text style={styles.kpiLbl}>Schemes ({performance?.activeSchemes ?? 0} Active)</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.totalProjects ?? 0}</Text>
                <Text style={styles.kpiLbl}>Projects ({performance?.activeProjects ?? 0} Active)</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.totalOrganizations ?? 0}</Text>
                <Text style={styles.kpiLbl}>Implementing Partners</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.averageComplianceScore ?? 0}%</Text>
                <Text style={styles.kpiLbl}>Avg Compliance Score</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiVal}>{performance?.totalInspections ?? 0}</Text>
                <Text style={styles.kpiLbl}>Inspections ({performance?.completedInspections ?? 0} Done)</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text
                  style={[
                    styles.kpiVal,
                    (performance?.totalAnomalies ?? 0) > 0 && { color: colors.status.highPriority },
                  ]}
                >
                  {performance?.totalAnomalies ?? 0}
                </Text>
                <Text style={styles.kpiLbl}>Telemetry Anomalies</Text>
              </View>
            </View>
          </View>

          {/* SECTION 2: FINANCIAL SUMMARY DECK */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Financial Allocation & Grant Utilization</Text>
            <Text style={styles.sectionSubtitle}>
              Grant sanctions, releases, and unspent balances under division purview
            </Text>

            <View style={styles.finGrid}>
              <View style={styles.finCard}>
                <Text style={styles.finLabel}>Sanctioned Budget</Text>
                <Text style={styles.finVal}>₹{performance?.totalSanctionedCr ?? 0} Cr</Text>
              </View>
              <View style={styles.finCard}>
                <Text style={styles.finLabel}>Released Amount</Text>
                <Text style={styles.finVal}>₹{performance?.totalReleasedCr ?? 0} Cr</Text>
              </View>
              <View style={styles.finCard}>
                <Text style={styles.finLabel}>Utilized Amount</Text>
                <Text style={[styles.finVal, { color: colors.status.normal }]}>
                  ₹{performance?.totalUtilizedCr ?? 0} Cr
                </Text>
              </View>
              <View style={styles.finCard}>
                <Text style={styles.finLabel}>Unspent Balance</Text>
                <Text style={[styles.finVal, { color: colors.status.warning }]}>
                  ₹{performance?.totalUnspentCr ?? 0} Cr
                </Text>
              </View>
            </View>

            {/* Utilization Bar */}
            <View style={styles.utilizationRow}>
              <View style={styles.utilLabels}>
                <Text style={styles.utilLabel}>Overall Utilization Rate</Text>
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

          {/* SECTION 3: SCHEME PERFORMANCE TABLE / DIRECTORY */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderFlex}>
              <View>
                <Text style={styles.sectionTitle}>Welfare Schemes ({schemes.length})</Text>
                <Text style={styles.sectionSubtitle}>
                  Programmes operating under this administrative division
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.actionBtnSmall}
                onPress={() => navigation.navigate('SchemeExplorer', { divisionId: division.divisionId })}
              >
                <Text style={styles.actionBtnSmallText}>Explorer View</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.brand.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.schemesList}>
              {schemes.map(scheme => {
                const sPerf = schemePerfMap[scheme.schemeId];
                return (
                  <TouchableOpacity
                    key={scheme.schemeId}
                    activeOpacity={0.8}
                    style={styles.schemeRowCard}
                    onPress={() => navigation.navigate('SchemeDetails', { schemeId: scheme.schemeId })}
                  >
                    <View style={styles.schemeRowTop}>
                      <View style={styles.schemeRowTitleWrap}>
                        <View style={styles.badgeRow}>
                          <Text style={styles.schemeCodeText}>{scheme.shortName || scheme.code || scheme.schemeId}</Text>
                          <DataSourceBadge dataSource={scheme.dataSource} size="sm" />
                        </View>
                        <Text style={styles.schemeRowName}>{scheme.name}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                    </View>

                    <View style={styles.schemeRowMetrics}>
                      <Text style={styles.schemeMetricText}>
                        Projects: <Text style={styles.boldNum}>{sPerf?.projectCount ?? scheme.projectIds.length}</Text>
                      </Text>
                      <Text style={styles.schemeMetricText}>
                        Funding: <Text style={styles.boldNum}>₹{((sPerf?.releasedFunding ?? 0) / 10000000).toFixed(2)}Cr</Text>
                      </Text>
                      <Text style={styles.schemeMetricText}>
                        Utilization: <Text style={styles.boldNum}>{sPerf?.utilizationPercentage ?? 0}%</Text>
                      </Text>
                      <Text style={styles.schemeMetricText}>
                        Anomalies: <Text style={styles.boldNum}>{sPerf?.anomalyCount ?? scheme.anomalyCount}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SECTION 4: ANOMALIES & TELEMETRY SIGNALS */}
          {anomalies.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderFlex}>
                <View>
                  <Text style={styles.sectionTitle}>Active Anomaly Signals ({anomalies.length})</Text>
                  <Text style={styles.sectionSubtitle}>
                    Discrepancy telemetry detected in division projects
                  </Text>
                </View>
              </View>

              <View style={styles.anomalyList}>
                {anomalies.map(anomaly => (
                  <View key={anomaly.anomalyId} style={styles.anomalyCard}>
                    <View style={styles.anomalyCardTop}>
                      <View style={styles.anomalyBadge}>
                        <Ionicons name="alert-circle" size={14} color={colors.status.highPriority} />
                        <Text style={styles.anomalyBadgeText}>{anomaly.anomalyId}</Text>
                      </View>
                      <Text style={styles.anomalySeverityText}>{anomaly.severity} SEVERITY</Text>
                    </View>
                    <Text style={styles.anomalyExpl}>{anomaly.explanation}</Text>
                    <Text style={styles.anomalyProject}>Target Project: {anomaly.projectId}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
  identityHeader: {
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
  divisionName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    lineHeight: 26,
  },
  shortName: {
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
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normalBorder,
  },
  priorityHigh: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
  },
  priorityCritical: {
    backgroundColor: colors.status.highPriorityLight,
    borderColor: colors.status.highPriorityBorder,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divisionDesc: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  jurisdictionBox: {
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
  },
  jurisdictionOfficial: {
    backgroundColor: colors.status.normalLight,
    borderColor: colors.status.normalBorder,
  },
  jurisdictionAllied: {
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.brand.accent,
  },
  jurisdictionDemo: {
    backgroundColor: colors.status.warningLight,
    borderColor: colors.status.warningBorder,
  },
  jurisdictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  jurisdictionTag: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  jurisdictionDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
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
  sectionHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnSmallText: {
    fontSize: 12,
    color: colors.brand.primary,
    fontWeight: '600',
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
  finCard: {
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
  utilizationRow: {
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
  schemesList: {
    gap: spacing.sm,
  },
  schemeRowCard: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  schemeRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schemeRowTitleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  schemeCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  schemeRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  schemeRowMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  schemeMetricText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  boldNum: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  anomalyList: {
    gap: spacing.sm,
  },
  anomalyCard: {
    backgroundColor: 'rgba(196, 64, 44, 0.05)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(196, 64, 44, 0.2)',
  },
  anomalyCardTop: {
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
  anomalyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.status.highPriority,
  },
  anomalySeverityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.status.highPriority,
  },
  anomalyExpl: {
    fontSize: 12,
    color: colors.text.primary,
  },
  anomalyProject: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 4,
  },
});
