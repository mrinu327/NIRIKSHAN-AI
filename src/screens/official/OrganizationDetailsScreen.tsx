/**
 * OrganizationDetailsScreen
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Comprehensive Intelligence Dossier for an Organization / NGO / Institution.
 * Features:
 * - Institutional Identity & Governance (Darpan ID, Masked PAN, Contact Summary)
 * - NIRIKSHAN Organization Risk & Performance Score
 * - 7-Factor Explainable Breakdown
 * - Strengths & Areas Requiring Administrative Review
 * - Recommended Administrative Actions
 * - Historical Performance Trend
 * - Implementing Projects & Scheme Links
 * - Field Inspections, Findings & Observed Anomalies
 * - Financial Grant Utilization Ledger
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackNavigationProp, OfficialStackParamList } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import {
  MonitoringPriorityBadge,
  OrganizationStatusBadge,
  OrganizationScoreCard,
  RiskFactorBreakdown,
  OrganizationFundingSummaryCard,
  OrganizationBeneficiarySummaryCard,
  OrganizationInspectionSummaryCard,
  OrganizationAnomalySummaryCard,
  OrganizationMonitoringPriorityCard,
} from '../../components/organization';
import { organizationService } from '../../services/master/organizationService';
import { organizationRiskEngine } from '../../services/analytics/organizationRiskEngine';
import { masterLookup } from '../../data/master';
import {
  Organization,
  OrganizationRiskProfile,
  OrganizationPerformanceSummary,
  OrganizationBeneficiarySummary,
  MasterProject,
  MasterInspection,
  MasterAnomaly,
  Finding,
  OrganizationFundingSummary,
} from '../../types/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const OrganizationDetailsScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<RouteProp<OfficialStackParamList, 'OrganizationDetails'>>();
  const { organizationId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [riskProfile, setRiskProfile] = useState<OrganizationRiskProfile | null>(null);
  const [perfSummary, setPerfSummary] = useState<OrganizationPerformanceSummary | null>(null);
  const [beneficiarySummary, setBeneficiarySummary] = useState<OrganizationBeneficiarySummary | null>(null);
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [inspections, setInspections] = useState<MasterInspection[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [anomalies, setAnomalies] = useState<MasterAnomaly[]>([]);
  const [fundingSummary, setFundingSummary] = useState<OrganizationFundingSummary | null>(null);

  useEffect(() => {
    loadDetails();
  }, [organizationId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const org = await organizationService.getOrganizationById(organizationId);
      if (!org) return;
      setOrganization(org);

      const [profile, perfSum, benSum, projList, inspList, fndList, anomList, fundSum] = await Promise.all([
        organizationRiskEngine.calculateOrganizationRiskProfile(organizationId),
        organizationService.getOrganizationPerformanceSummary(organizationId),
        organizationService.getOrganizationBeneficiarySummary(organizationId),
        organizationService.getOrganizationProjects(organizationId),
        Promise.resolve(masterLookup.getOrganizationInspections(organizationId)),
        organizationService.getOrganizationFindings(organizationId),
        organizationService.getOrganizationAnomalies(organizationId),
        organizationService.getOrganizationFundingSummary(organizationId),
      ]);

      setRiskProfile(profile || null);
      setPerfSummary(perfSum || null);
      setBeneficiarySummary(benSum || null);
      setProjects(projList);
      setInspections(inspList);
      setFindings(fndList);
      setAnomalies(anomList);
      setFundingSummary(fundSum || null);
    } catch (err) {
      console.error('Failed to load organization details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Organization Dossier" subtitle="Loading Intelligence Profile..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Synthesizing multi-factor risk & compliance telemetry...</Text>
        </View>
      </View>
    );
  }

  if (!organization) {
    return (
      <View style={styles.container}>
        <AppHeader title="Organization Not Found" subtitle="Entity Record Missing" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.status.highPriority} />
          <Text style={styles.errorTitle}>Organization Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The requested organization ID "{organizationId}" could not be located in the master registry.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Return to Directory</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={organization.name}
        subtitle={`${organization.organizationType || organization.type || 'Entity'} • ID: ${organization.organizationId}`}
      />

      <ScrollView
        contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb back to explorer */}
        <TouchableOpacity
          style={styles.backBreadcrumb}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to Organizations"
        >
          <Ionicons name="chevron-back" size={16} color={colors.brand.primary} />
          <Text style={styles.breadcrumbText}>Back to Organization Directory</Text>
        </TouchableOpacity>

        {/* Top Institutional Identity Banner */}
        <View style={styles.identityCard}>
          <View style={styles.identityHeader}>
            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{organization.organizationType || organization.type || 'NGO'}</Text>
              </View>
              <OrganizationStatusBadge status={organization.registrationStatus} />
              {organization.monitoringPriority && (
                <MonitoringPriorityBadge priority={organization.monitoringPriority} compact />
              )}
            </View>
          </View>

          <Text style={styles.orgName}>{organization.name}</Text>

          {/* Legal / Statutory Identifiers */}
          <View style={styles.metaGrid}>
            {organization.ngoDarpanId && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>NGO DARPAN ID</Text>
                <Text style={styles.metaValue}>{organization.ngoDarpanId}</Text>
              </View>
            )}
            {organization.panMasked && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>PAN (MASKED)</Text>
                <Text style={styles.metaValue}>{organization.panMasked}</Text>
              </View>
            )}
            {organization.registrationNumber && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>REGISTRATION NO.</Text>
                <Text style={styles.metaValue}>{organization.registrationNumber}</Text>
              </View>
            )}
            {organization.establishedYear && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>ESTABLISHED</Text>
                <Text style={styles.metaValue}>{organization.establishedYear}</Text>
              </View>
            )}
          </View>

          {/* Address */}
          {organization.address && (
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>REGISTERED PREMISES</Text>
              <Text style={styles.addressText}>📍 {organization.address}</Text>
            </View>
          )}

          {/* Masked Contact Summary */}
          {organization.contactSummary && (
            <View style={styles.contactRow}>
              {organization.contactSummary.officialDesignation && (
                <Text style={styles.contactItem}>
                  Designation: <Text style={styles.contactVal}>{organization.contactSummary.officialDesignation}</Text>
                </Text>
              )}
              {organization.contactSummary.emailMasked && (
                <Text style={styles.contactItem}>
                  Email: <Text style={styles.contactVal}>{organization.contactSummary.emailMasked}</Text>
                </Text>
              )}
              {organization.contactSummary.phoneMasked && (
                <Text style={styles.contactItem}>
                  Phone: <Text style={styles.contactVal}>{organization.contactSummary.phoneMasked}</Text>
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Monitoring Priority & Administrative Decision Support */}
        {perfSummary && (
          <View style={styles.sectionContainer}>
            <OrganizationMonitoringPriorityCard
              priority={perfSummary.monitoringPriority}
              score={perfSummary.performanceScore}
              scoreBand={perfSummary.scoreBand}
              explanation={organizationRiskEngine.generateScoreExplanation(organizationId)}
            />
          </View>
        )}

        {/* NIRIKSHAN AI Score Card */}
        {riskProfile && (
          <View style={styles.sectionContainer}>
            <OrganizationScoreCard profile={riskProfile} />
          </View>
        )}

        {/* 7-Factor Explainable Breakdown */}
        {riskProfile && (
          <View style={styles.sectionContainer}>
            <RiskFactorBreakdown factorBreakdown={riskProfile.factorBreakdown} />
          </View>
        )}

        {/* Strengths & Review Areas Grid */}
        {riskProfile && (
          <View style={styles.insightsRow}>
            {/* Positive Factors */}
            <View style={[styles.insightCard, styles.strengthCard]}>
              <View style={styles.insightHeader}>
                <Ionicons name="checkmark-circle" size={18} color={colors.status.normal} />
                <Text style={[styles.insightTitle, { color: colors.status.normal }]}>
                  OBSERVED PERFORMANCE STRENGTHS
                </Text>
              </View>
              {riskProfile.positiveFactors.map((item, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Areas Requiring Review */}
            <View style={[styles.insightCard, styles.reviewCard]}>
              <View style={styles.insightHeader}>
                <Ionicons
                  name={riskProfile.attentionFactors.length > 0 ? 'alert-circle' : 'checkmark-done'}
                  size={18}
                  color={riskProfile.attentionFactors.length > 0 ? colors.status.warning : colors.status.normal}
                />
                <Text
                  style={[
                    styles.insightTitle,
                    {
                      color:
                        riskProfile.attentionFactors.length > 0 ? colors.status.warning : colors.status.normal,
                    },
                  ]}
                >
                  AREAS REQUIRING REVIEW
                </Text>
              </View>
              {riskProfile.attentionFactors.length === 0 ? (
                <Text style={styles.cleanRecordText}>
                  No active operational concerns or compliance variances recorded for this agency.
                </Text>
              ) : (
                riskProfile.attentionFactors.map((item, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Recommended Administrative Actions */}
        {riskProfile && riskProfile.recommendedActions.length > 0 && (
          <View style={styles.actionsCard}>
            <View style={styles.actionsHeader}>
              <Ionicons name="bulb-outline" size={18} color={colors.brand.primary} />
              <Text style={styles.actionsTitle}>RECOMMENDED ADMINISTRATIVE ACTIONS</Text>
            </View>
            {riskProfile.recommendedActions.map((action, idx) => (
              <View key={idx} style={styles.actionItem}>
                <View style={styles.actionNumBadge}>
                  <Text style={styles.actionNumText}>{idx + 1}</Text>
                </View>
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Performance Trend Card */}
        {riskProfile && (
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>HISTORICAL PERFORMANCE TRAJECTORY</Text>
            {riskProfile.trendUnavailable ? (
              <View style={styles.trendUnavailableBox}>
                <Ionicons name="information-circle-outline" size={20} color={colors.brand.primary} />
                <Text style={styles.trendUnavailableText}>
                  {riskProfile.trendNote || 'Trend unavailable — insufficient historical observations.'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.trendSubtitle}>
                  Quarterly composite score evolution reflecting inspection outcomes and periodic filings.
                </Text>
                <View style={styles.trendGrid}>
                  {riskProfile.trend.map((pt, idx) => (
                    <View key={idx} style={styles.trendCol}>
                      <Text style={styles.trendValue}>{pt.value}</Text>
                      <View style={styles.trendBarTrack}>
                        <View
                          style={[
                            styles.trendBarFill,
                            {
                              height: `${Math.min(100, Math.max(10, pt.value))}%`,
                              backgroundColor:
                                pt.value >= 80
                                  ? colors.status.normal
                                  : pt.value >= 60
                                  ? colors.status.warning
                                  : colors.status.highPriority,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.trendLabel}>{pt.label}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Beneficiary Intelligence Section */}
        {beneficiarySummary && (
          <View style={styles.sectionContainer}>
            <OrganizationBeneficiarySummaryCard summary={beneficiarySummary} />
          </View>
        )}

        {/* Financial Grant Utilization Section */}
        {fundingSummary && (
          <View style={styles.sectionContainer}>
            <OrganizationFundingSummaryCard funding={fundingSummary} />
          </View>
        )}

        {/* Implementing Projects Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>IMPLEMENTING PROJECTS ({projects.length})</Text>
        </View>
        {projects.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBoxText}>No active projects linked to this organization.</Text>
          </View>
        ) : (
          projects.map(proj => (
            <TouchableOpacity
              key={proj.projectId}
              style={styles.projectCard}
              onPress={() => navigation.navigate('ProjectDetails', { projectId: proj.projectId })}
            >
              <View style={styles.projTop}>
                <Text style={styles.projCode}>{proj.code || proj.projectId}</Text>
                <Text style={styles.projStatus}>{proj.projectStatus || 'ACTIVE'}</Text>
              </View>
              <Text style={styles.projName}>{proj.name}</Text>
              <View style={styles.projMeta}>
                <Text style={styles.projMetaItem}>Scheme: {proj.schemeId || 'N/A'}</Text>
                <Text style={styles.projMetaItem}>Progress: {proj.progressPercentage ?? 0}%</Text>
                <Text style={styles.projMetaItem}>Compliance: {proj.complianceScore ?? 0}%</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Inspections & Field Findings Section */}
        {perfSummary && (
          <View style={styles.sectionContainer}>
            <OrganizationInspectionSummaryCard
              total={perfSummary.inspectionCount}
              completed={perfSummary.completedInspectionCount}
              pending={perfSummary.pendingInspectionCount}
              openFindings={perfSummary.openFindingCount}
              resolvedFindings={perfSummary.resolvedFindingCount}
              inspections={inspections}
              onInspectionPress={_id => navigation.navigate('OfficialTabs', { screen: 'Inspections' })}
            />
          </View>
        )}

        {/* Observed Anomaly Diagnostics Section */}
        <View style={styles.sectionContainer}>
          <OrganizationAnomalySummaryCard
            anomalies={anomalies}
            onAnomalyPress={id => navigation.navigate('AnomalyDetails', { anomalyId: id })}
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
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 3,
  },
  contentDesktop: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  backBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  breadcrumbText: {
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
    marginLeft: 4,
  },
  loadingContainer: {
    padding: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  errorSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  backBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  backBtnText: {
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  identityCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  identityHeader: {
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: colors.brand.primaryLight || '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  typeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  orgName: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 26,
    marginVertical: spacing.xs,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  metaItem: {
    minWidth: 130,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  addressBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  addressLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  contactItem: {
    fontSize: 11,
    color: colors.text.muted,
  },
  contactVal: {
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  sectionContainer: {
    marginBottom: spacing.md,
  },
  insightsRow: {
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  insightCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  strengthCard: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  reviewCard: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBEB',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 13,
    color: colors.text.secondary,
    marginRight: 6,
    lineHeight: 18,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  cleanRecordText: {
    fontSize: 12,
    color: colors.status.normal,
    fontStyle: 'italic',
  },
  actionsCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: spacing.md,
  },
  actionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  actionsTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  actionNumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  actionNumText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  actionText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 18,
  },
  trendCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  trendTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.8,
  },
  trendSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  trendUnavailableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  trendUnavailableText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  trendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: spacing.sm,
  },
  trendCol: {
    alignItems: 'center',
    flex: 1,
  },
  trendValue: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  trendBarTrack: {
    width: 24,
    height: 70,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  trendLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 6,
  },
  sectionHeaderRow: {
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.8,
  },
  emptyBox: {
    backgroundColor: colors.neutral.surface,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  emptyBoxText: {
    fontSize: 12,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  projectCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.xs,
  },
  projTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projCode: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  projStatus: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.status.normal,
  },
  projName: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginVertical: 4,
  },
  projMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  projMetaItem: {
    fontSize: 11,
    color: colors.text.muted,
  },
  anomaliesList: {
    marginBottom: spacing.sm,
  },
  anomalyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: spacing.xs,
  },
  anomalyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  anomalyBadge: {
    backgroundColor: colors.status.highPriority,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  anomalyBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  anomalyIdText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.text.muted,
  },
  anomalyTitleText: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: '#991B1B',
    marginBottom: 2,
  },
  anomalyDescText: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  inspectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.xs,
  },
  inspIconCol: {
    marginRight: spacing.sm,
  },
  inspInfoCol: {
    flex: 1,
  },
  inspId: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  inspType: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  inspDate: {
    fontSize: 10,
    color: colors.text.muted,
  },
  inspStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  inspStatusText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  fundingCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  fundingTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  fundingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  fundingItem: {
    alignItems: 'center',
  },
  fundingLabel: {
    fontSize: 9,
    color: colors.text.muted,
    marginBottom: 2,
  },
  fundingVal: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  utilTrack: {
    height: 6,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  utilFill: {
    height: '100%',
    borderRadius: 3,
  },
  utilRateText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  boldNum: {
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
});
