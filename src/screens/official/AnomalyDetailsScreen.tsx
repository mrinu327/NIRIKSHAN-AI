/**
 * AnomalyDetailsScreen
 * SIH26095 | MoSJE Government Official Monitoring Workflow
 *
 * Dedicated explainable anomaly dossier detailing observed data discrepancies,
 * independent supporting signals, multi-hop entity traversal, and non-punitive
 * administrative verification actions.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialStackParamList, OfficialStackNavigationProp } from '../../types/navigation';
import { AppHeader } from '../../components/common/AppHeader';
import { DataSourceBadge } from '../../components/common/DataSourceBadge';
import { AnomalySeverityBadge } from '../../components/anomaly/AnomalySeverityBadge';
import { AnomalyConfidenceBadge } from '../../components/anomaly/AnomalyConfidenceBadge';
import { AnomalyExplanationCard } from '../../components/anomaly/AnomalyExplanationCard';
import { EvidenceSignalList } from '../../components/anomaly/EvidenceSignalList';
import { AnomalyActionCard } from '../../components/anomaly/AnomalyActionCard';
import { CorrelationSignalCard } from '../../components/anomaly/CorrelationSignalCard';
import { MasterAnomaly, MasterProject, Organization, Scheme, Division } from '../../types/master';
import { anomalyService } from '../../services/master/anomalyService';
import { masterLookup } from '../../data/master';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type AnomalyDetailsRouteProp = RouteProp<OfficialStackParamList, 'AnomalyDetails'>;

export const AnomalyDetailsScreen: React.FC = () => {
  const navigation = useNavigation<OfficialStackNavigationProp>();
  const route = useRoute<AnomalyDetailsRouteProp>();
  const { anomalyId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [loading, setLoading] = useState(true);
  const [anomaly, setAnomaly] = useState<MasterAnomaly | null>(null);
  const [correlated, setCorrelated] = useState<MasterAnomaly[]>([]);
  const [project, setProject] = useState<MasterProject | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [division, setDivision] = useState<Division | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const anom = await anomalyService.getAnomalyById(anomalyId);
      if (anom) {
        setAnomaly(anom);
        const [corrList, proj, org, sch, div] = await Promise.all([
          anomalyService.getCorrelatedAnomalies(anom.anomalyId),
          Promise.resolve(masterLookup.getProjectById(anom.projectId)),
          Promise.resolve(masterLookup.getOrganizationById(anom.organizationId)),
          Promise.resolve(anom.schemeId ? masterLookup.getSchemeById(anom.schemeId) : undefined),
          Promise.resolve(anom.divisionId ? masterLookup.getDivisionById(anom.divisionId) : undefined),
        ]);

        setCorrelated(corrList);
        setProject(proj || null);
        setOrganization(org || null);
        setScheme(sch || null);
        setDivision(div || null);
      }
    } catch (err) {
      console.error('Failed to load anomaly details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [anomalyId]);

  const handleActionPress = (action: string) => {
    Alert.alert(
      'Administrative Action',
      `Official action selected:\n\n"${action}"\n\nWould you like to initiate this verification workflow?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            if (action.toLowerCase().includes('inspection')) {
              if (project) {
                navigation.navigate('InitiateInspection', { projectId: project.projectId, alertId: anomaly?.anomalyId });
              }
            } else if (action.toLowerCase().includes('attendance') || action.toLowerCase().includes('cctv')) {
              if (project) {
                navigation.navigate('AttendanceAnalytics', { projectId: project.projectId });
              }
            } else {
              Alert.alert('Action Recorded', 'Official acknowledgment logged in Central Monitoring Ledger.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navyDark} />
      <AppHeader
        title="ANOMALY INTELLIGENCE DOSSIER"
        subtitle={anomaly ? `${anomaly.anomalyId} • ${anomaly.type}` : 'Diagnostic Evaluation'}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Synthesizing diagnostic dossier...</Text>
        </View>
      ) : !anomaly ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.status.warning} />
          <Text style={styles.errorTitle}>Anomaly Not Found</Text>
          <Text style={styles.errorSubtitle}>The requested anomaly record could not be resolved.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Return to Anomaly Explorer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Breadcrumb Navigation */}
          <View style={styles.breadcrumbRow}>
            <TouchableOpacity onPress={() => navigation.navigate('AnomalyExplorer')}>
              <Text style={styles.breadcrumbLink}>Anomaly Intelligence</Text>
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={12} color={colors.text.muted} style={{ marginHorizontal: 4 }} />
            <Text style={styles.breadcrumbCurrent}>{anomaly.anomalyId}</Text>
          </View>

          {/* SECTION A: Anomaly Identity Card */}
          <View style={styles.identityCard}>
            <View style={styles.topBadgeRow}>
              <View style={styles.idGroup}>
                <Text style={styles.anomalyIdText}>{anomaly.anomalyId}</Text>
                <DataSourceBadge dataSource={anomaly.dataSource} size="sm" />
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{anomaly.status}</Text>
              </View>
            </View>

            <Text style={styles.titleText}>{anomaly.title || anomaly.type}</Text>
            <Text style={styles.detectedDateText}>
              Detected: {anomaly.detectedAt || anomaly.createdAt} • Evaluated by NIRIKSHAN Rule Engine
            </Text>

            <View style={styles.badgeRow}>
              <AnomalySeverityBadge severity={anomaly.severity} />
              <AnomalyConfidenceBadge
                confidence={anomaly.confidence ?? 85}
                level={anomaly.confidenceLevel}
              />
            </View>
          </View>

          {/* SECTION B & C: Observed Discrepancy & Reasoning */}
          <AnomalyExplanationCard anomaly={anomaly} />

          {/* SECTION D: Supporting Signals */}
          <EvidenceSignalList signals={anomaly.sourceSignals || []} style={{ marginVertical: spacing.xs }} />

          {/* SECTION E: Linked Hierarchy Entities */}
          <View style={styles.entitiesCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="git-branch-outline" size={16} color={colors.brand.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>ADMINISTRATIVE & PROJECT HIERARCHY</Text>
            </View>

            <View style={styles.entityGrid}>
              {/* Project Link */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.entityItem}
                onPress={() => project && navigation.navigate('ProjectDetails', { projectId: project.projectId })}
              >
                <View style={styles.entityIconBox}>
                  <Ionicons name="business" size={16} color={colors.brand.primary} />
                </View>
                <View style={styles.entityTextBox}>
                  <Text style={styles.entityCategory}>MONITORED PROJECT</Text>
                  <Text style={styles.entityName} numberOfLines={1}>{project ? project.name : anomaly.projectId}</Text>
                  <Text style={styles.entitySub}>{project?.projectCode || anomaly.projectId} • Tap to view dossier</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
              </TouchableOpacity>

              {/* Organization Link */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.entityItem}
                onPress={() => organization && navigation.navigate('OrganizationDetails', { organizationId: organization.organizationId })}
              >
                <View style={styles.entityIconBox}>
                  <Ionicons name="home" size={16} color="#7E22CE" />
                </View>
                <View style={styles.entityTextBox}>
                  <Text style={styles.entityCategory}>IMPLEMENTING AGENCY</Text>
                  <Text style={styles.entityName} numberOfLines={1}>{organization ? organization.name : anomaly.organizationId}</Text>
                  <Text style={styles.entitySub}>{organization?.type || 'NGO / Trust'} • Tap to view profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
              </TouchableOpacity>

              {/* Scheme Link */}
              {scheme && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.entityItem}
                  onPress={() => navigation.navigate('SchemeDetails', { schemeId: scheme.schemeId })}
                >
                  <View style={styles.entityIconBox}>
                    <Ionicons name="ribbon" size={16} color="#0D9488" />
                  </View>
                  <View style={styles.entityTextBox}>
                    <Text style={styles.entityCategory}>NATIONAL WELFARE SCHEME</Text>
                    <Text style={styles.entityName} numberOfLines={1}>{scheme.name}</Text>
                    <Text style={styles.entitySub}>{scheme.code || scheme.schemeId} • Tap to view guidelines</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </TouchableOpacity>
              )}

              {/* Division Link */}
              {division && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.entityItem}
                  onPress={() => navigation.navigate('DivisionDetails', { divisionId: division.divisionId })}
                >
                  <View style={styles.entityIconBox}>
                    <Ionicons name="globe-outline" size={16} color="#2563EB" />
                  </View>
                  <View style={styles.entityTextBox}>
                    <Text style={styles.entityCategory}>ADMINISTRATIVE DIVISION</Text>
                    <Text style={styles.entityName} numberOfLines={1}>{division.name}</Text>
                    <Text style={styles.entitySub}>{division.code || division.divisionId} • Tap to view division</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* SECTION F: Correlated Monitoring Signals */}
          <CorrelationSignalCard
            correlatedAnomalies={correlated}
            onAnomalyPress={id => navigation.push('AnomalyDetails', { anomalyId: id })}
            style={{ marginVertical: spacing.xs }}
          />

          {/* SECTION G: Recommended Actions */}
          <AnomalyActionCard
            actions={anomaly.recommendedActions || []}
            onActionPress={handleActionPress}
            style={{ marginVertical: spacing.xs }}
          />

          {/* SECTION H: False Positive Safety Disclaimer */}
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={16} color={colors.status.normal} style={{ marginRight: 6 }} />
              <Text style={styles.safetyTitle}>EVALUATION SAFETY & LIMITATIONS POLICY</Text>
            </View>
            <Text style={styles.safetyBody}>
              • Optical CCTV headcounts are edge estimates and may undercount due to camera angle, obstruction, or session overlap.
              {'\n'}• High discrepancy severity indicates observable variance magnitude, NOT confirmed non-compliance or fraud.
              {'\n'}• All decisions, inquiries, and inspections must be independently authorized by a designated Government Officer.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.text.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  errorSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
    marginBottom: spacing.md,
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
    fontSize: 12,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  breadcrumbLink: {
    fontSize: 11,
    color: colors.brand.primary,
    fontWeight: typography.weights.semibold,
  },
  breadcrumbCurrent: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  identityCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.xs,
    ...shadows.xs,
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  idGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  anomalyIdText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  statusPill: {
    backgroundColor: colors.neutral.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  titleText: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 22,
  },
  detectedDateText: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  entitiesCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginVertical: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  entityGrid: {
    gap: 8,
  },
  entityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  entityIconBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.neutral.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  entityTextBox: {
    flex: 1,
  },
  entityCategory: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.4,
  },
  entityName: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 1,
  },
  entitySub: {
    fontSize: 10,
    color: colors.brand.primary,
    marginTop: 1,
  },
  safetyCard: {
    backgroundColor: colors.status.normalLight,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.status.normalBorder,
    marginTop: spacing.sm,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  safetyTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.status.normal,
    letterSpacing: 0.5,
  },
  safetyBody: {
    fontSize: 11,
    color: colors.text.primary,
    lineHeight: 16,
  },
});
