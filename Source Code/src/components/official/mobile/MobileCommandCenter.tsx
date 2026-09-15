import React, { useState } from 'react';
import AppSurface from '../../ui/AppSurface';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabNavigationProp } from '../../../types/navigation';
import { Project, ProjectStatsSummary } from '../../../types/project';
import { AnomalyAlert } from '../../../types/alert';
import {
  Division,
  Scheme,
  Organization,
  MasterProject,
  MasterAnomaly,
  AnomalySummary,
} from '../../../types/master';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import { MonitoringPriorityBadge } from '../../organization/MonitoringPriorityBadge';
import { ProjectStatusBadge } from '../../project/ProjectStatusBadge';
import { DataSourceBadge } from '../../common/DataSourceBadge';
import { AnomalySeverityBadge } from '../../anomaly/AnomalySeverityBadge';
import { AnomalyConfidenceBadge } from '../../anomaly/AnomalyConfidenceBadge';

type MobileModule =
  | 'console'
  | 'priority'
  | 'administrative'
  | 'organization'
  | null;

type Props = {
  stats: ProjectStatsSummary | null;
  priorityProjects: Project[];
  criticalAlerts: AnomalyAlert[];
  topDivisions: Division[];
  topSchemes: Scheme[];
  topOrganizations: Organization[];
  topProjects: MasterProject[];
  topAnomalies: MasterAnomaly[];
  anomalySummary: AnomalySummary | null;
  orgKpis: {
    total: number;
    avgScore: number;
    highPriority: number;
    openFindings: number;
    anomalies: number;
  };
  navigation: OfficialTabNavigationProp<'Dashboard'>;
  refreshing: boolean;
  onRefresh: () => void;
};

const Row = ({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string | number;
  muted?: boolean;
}) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel} numberOfLines={1}>
      {label}
    </Text>
    <Text
      style={[styles.dataValue, muted && styles.dataValueMuted]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

export default function MobileCommandCenter({
  stats,
  priorityProjects,
  criticalAlerts,
  topDivisions,
  topSchemes,
  topOrganizations,
  topProjects,
  topAnomalies,
  anomalySummary,
  orgKpis,
  navigation,
  refreshing,
  onRefresh,
}: Props) {
  const [selectedModule, setSelectedModule] = useState<MobileModule>(null);

  const topAlert = criticalAlerts[0];
  const reportedCount = topAlert?.metricComparison?.reportedAttendance ?? 42;
  const cctvCount = topAlert?.metricComparison?.headcountEstimate ?? 25;
  const diffCount =
    topAlert?.metricComparison?.difference ??
    (reportedCount - cctvCount);

  const goBack = () => setSelectedModule(null);

  const ModuleHeader = ({
    eyebrow,
    title,
    description,
  }: {
    eyebrow: string;
    title: string;
    description?: string;
  }) => (
    <View style={styles.moduleHeader}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Back to Command Center"
        activeOpacity={0.75}
        style={styles.backButton}
        onPress={goBack}
      >
        <Ionicons
          name="arrow-back"
          size={18}
          color={colors.brand.primary}
        />
        <Text style={styles.backText}>Command Center</Text>
      </TouchableOpacity>

      <Text style={styles.moduleEyebrow}>{eyebrow}</Text>
      <Text style={styles.moduleTitle} numberOfLines={3}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.moduleDescription} numberOfLines={3}>
          {description}
        </Text>
      ) : null}
    </View>
  );

  const renderLauncher = () => (
    <>
      <View style={styles.launcherIntro}>
        <Text style={styles.eyebrow}>NATIONAL MONITORING DIVISION</Text>
        <Text style={styles.title} numberOfLines={2}>
          Command Center
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          Select an operational area to continue.
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.82}
        style={styles.consoleHero}
        onPress={() => setSelectedModule('console')}
      >
        <View style={styles.heroIcon}>
          <Ionicons
            name="radio-outline"
            size={21}
            color={colors.brand.primary}
          />
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>LIVE OPERATIONS</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            Central Command Console
          </Text>
          <Text style={styles.heroDescription} numberOfLines={2}>
            Current alerts, verification signals and national metrics.
          </Text>
        </View>

        <View style={styles.arrowCircle}>
          <Ionicons
            name="arrow-forward"
            size={17}
            color={colors.brand.primary}
          />
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>OPERATIONS</Text>

      <View style={styles.moduleGrid}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          style={styles.moduleTile}
          onPress={() => setSelectedModule('priority')}
        >
          <View style={[styles.tileIcon, styles.warningIcon]}>
            <Ionicons
              name="warning-outline"
              size={19}
              color={colors.status.highPriority}
            />
          </View>
          <View style={styles.tileContent}>
            <Text style={styles.tileTitle} numberOfLines={2}>
              Priority Operations
            </Text>
            <Text style={styles.tileMeta} numberOfLines={1}>
              {priorityProjects.length} active items
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.text.muted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          style={styles.moduleTile}
          onPress={() => setSelectedModule('administrative')}
        >
          <View style={styles.tileIcon}>
            <Ionicons
              name="layers-outline"
              size={19}
              color={colors.brand.primary}
            />
          </View>
          <View style={styles.tileContent}>
            <Text style={styles.tileTitle} numberOfLines={2}>
              Administrative Intelligence
            </Text>
            <Text style={styles.tileMeta} numberOfLines={1}>
              Divisions & schemes
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.text.muted}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.82}
        style={styles.organizationTile}
        onPress={() => setSelectedModule('organization')}
      >
        <View style={styles.tileIcon}>
          <Ionicons
            name="business-outline"
            size={19}
            color={colors.brand.primary}
          />
        </View>
        <View style={styles.tileContent}>
          <Text style={styles.tileTitle} numberOfLines={2}>
            Organization & Project Oversight
          </Text>
          <Text style={styles.tileMeta} numberOfLines={2}>
            Implementing agencies, projects and risk telemetry
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={17}
          color={colors.text.muted}
        />
      </TouchableOpacity>
    </>
  );

  const renderConsole = () => (
    <>
      <ModuleHeader
        eyebrow="CENTRAL COMMAND CONSOLE"
        title="Operational Overview"
        description="Live verification and national monitoring signals."
      />

      {topAlert ? (
        <AppSurface style={styles.alertSurface}>
          <View style={styles.alertHeader}>
            <View style={styles.alertBadge}>
              <Ionicons
                name="alert-circle"
                size={14}
                color={colors.status.highPriority}
              />
              <Text style={styles.alertBadgeText}>ACTION REQUIRED</Text>
            </View>
            <Text style={styles.alertCode} numberOfLines={1}>
              {topAlert.id}
            </Text>
          </View>

          <Text style={styles.alertTitle} numberOfLines={3}>
            {topAlert.projectName}
          </Text>

          <Text style={styles.alertDescription} numberOfLines={4}>
            {topAlert.description}
          </Text>

          <View style={styles.comparison}>
            <View style={styles.comparisonCell}>
              <Text style={styles.comparisonLabel} numberOfLines={2}>
                Reported
              </Text>
              <Text style={styles.comparisonValue}>
                {reportedCount}
              </Text>
              <Text style={styles.comparisonHint} numberOfLines={2}>
                Biometric
              </Text>
            </View>

            <View style={styles.comparisonDivider} />

            <View style={styles.comparisonCell}>
              <Text style={styles.comparisonLabel} numberOfLines={2}>
                CCTV estimate
              </Text>
              <Text style={styles.comparisonValue}>
                {cctvCount}
              </Text>
              <Text style={styles.comparisonHint} numberOfLines={2}>
                Optical
              </Text>
            </View>

            <View style={styles.comparisonDivider} />

            <View style={styles.comparisonCell}>
              <Text style={styles.comparisonLabel} numberOfLines={2}>
                Variance
              </Text>
              <Text
                style={[
                  styles.comparisonValue,
                  styles.varianceValue,
                ]}
              >
                +{diffCount}
              </Text>
              <Text style={styles.comparisonHint} numberOfLines={2}>
                Disparity
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate('AlertReview', {
                alertId: topAlert.id,
              })
            }
          >
            <Text style={styles.primaryButtonText}>
              Review Alert
            </Text>
            <Ionicons
              name="arrow-forward"
              size={15}
              color={colors.text.inverse}
            />
          </TouchableOpacity>
        </AppSurface>
      ) : (
        <AppSurface>
          <Text style={styles.surfaceTitle}>No active discrepancy</Text>
          <Text style={styles.surfaceHint}>
            There are currently no pending discrepancy signals.
          </Text>
        </AppSurface>
      )}

      <Text style={styles.sectionLabel}>NATIONAL SNAPSHOT</Text>

      <AppSurface>
        <Row
          label="Registered institutes"
          value={orgKpis.total}
        />
        <Row
          label="Average compliance"
          value={`${orgKpis.avgScore}/100`}
        />
        <Row
          label="Higher-priority organizations"
          value={orgKpis.highPriority}
        />
        <Row
          label="Open audit findings"
          value={orgKpis.openFindings}
        />
        <Row
          label="Active discrepancies"
          value={orgKpis.anomalies}
        />
        <Row
          label="Pending field audits"
          value={stats?.pendingInspectionsCount ?? 14}
        />
      </AppSurface>

      <Text style={styles.sectionLabel}>OPERATIONAL ACTIONS</Text>

      <AppSurface>
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.actionRow}
          onPress={() =>
            navigation.navigate('InitiateInspection', {
              projectId: 'PRJ-101',
            })
          }
        >
          <View style={styles.actionIcon}>
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={colors.brand.primary}
            />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>
              Initiate Inspection
            </Text>
            <Text style={styles.actionHint}>
              Start a field audit
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={colors.text.muted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.actionRow}
          onPress={() => navigation.navigate('Alerts')}
        >
          <View style={styles.actionIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.status.highPriority}
            />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Review Alerts</Text>
            <Text style={styles.actionHint}>
              {stats?.highPriorityCount ?? 6} pending verification
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={colors.text.muted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.actionRow}
          onPress={() => navigation.navigate('Monitoring')}
        >
          <View style={styles.actionIcon}>
            <Ionicons
              name="business-outline"
              size={18}
              color={colors.brand.primary}
            />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>
              Projects Directory
            </Text>
            <Text style={styles.actionHint}>
              {stats?.totalProjects ?? 148} monitored projects
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={colors.text.muted}
          />
        </TouchableOpacity>
      </AppSurface>
    </>
  );

  const renderPriority = () => (
    <>
      <ModuleHeader
        eyebrow="PRIORITY OPERATIONS"
        title="Attention Queue"
        description="Institutions and signals requiring closer review."
      />

      <AppSurface>
        {priorityProjects.length > 0 ? (
          priorityProjects.map((project, index) => {
            const isHigh =
              project.priority === 'HIGH' ||
              project.status === 'High Priority';
            const isDue = project.status === 'Inspection Due';
            const accent = isHigh
              ? colors.status.highPriority
              : isDue
                ? colors.status.warning
                : colors.status.normal;

            return (
              <TouchableOpacity
                key={project.id}
                activeOpacity={0.78}
                style={[
                  styles.queueRow,
                  index < priorityProjects.length - 1 &&
                    styles.rowBorder,
                ]}
                onPress={() =>
                  navigation.navigate('ProjectDetails', {
                    projectId: project.id,
                  })
                }
              >
                <View
                  style={[
                    styles.queueAccent,
                    { backgroundColor: accent },
                  ]}
                />

                <View style={styles.queueContent}>
                  <View style={styles.queueTitleRow}>
                    <View style={styles.queueTitleWrap}>
                      <Text
                        style={styles.queueTitle}
                        numberOfLines={2}
                      >
                        {project.name}
                      </Text>
                      <Text
                        style={styles.queueCode}
                        numberOfLines={1}
                      >
                        {project.code}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.statusText,
                        { color: accent },
                      ]}
                      numberOfLines={2}
                    >
                      {isHigh
                        ? 'High priority'
                        : isDue
                          ? 'Inspection due'
                          : project.status}
                    </Text>
                  </View>

                  <Text
                    style={styles.queueMeta}
                    numberOfLines={1}
                  >
                    {project.category} · {project.location.city},{' '}
                    {project.location.state}
                  </Text>

                  <View style={styles.queueBottom}>
                    <Text style={styles.queueMetric}>
                      Attendance {project.attendance.present}/
                      {project.attendance.capacity}
                    </Text>
                    <Text
                      style={[
                        styles.queueMetric,
                        {
                          color:
                            project.cctvStatus === 'Online'
                              ? colors.status.normal
                              : colors.status.warning,
                        },
                      ]}
                    >
                      CCTV {project.cctvStatus}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={colors.text.muted}
                />
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.surfaceHint}>
            No priority projects are currently queued.
          </Text>
        )}
      </AppSurface>

      <Text style={styles.sectionLabel}>ANOMALY INTELLIGENCE</Text>

      <AppSurface>
        <View style={styles.inlineHeading}>
          <View style={styles.tileIcon}>
            <Ionicons
              name="analytics-outline"
              size={18}
              color={colors.brand.primary}
            />
          </View>
          <View style={styles.inlineHeadingText}>
            <Text style={styles.surfaceTitle} numberOfLines={2}>
              Evidence signals
            </Text>
            <Text style={styles.surfaceHint} numberOfLines={2}>
              Cross-source monitoring anomalies
            </Text>
          </View>
        </View>

        {topAnomalies.map((anom, index) => (
          <TouchableOpacity
            key={anom.anomalyId || anom.id || index}
            activeOpacity={0.78}
            style={[
              styles.anomalyRow,
              index < topAnomalies.length - 1 &&
                styles.rowBorder,
            ]}
            onPress={() =>
              navigation.navigate('AnomalyDetails', {
                anomalyId: anom.anomalyId || anom.id,
              })
            }
          >
            <View style={styles.anomalyText}>
              <Text style={styles.queueCode}>
                {anom.anomalyId || anom.id}
              </Text>
              <Text
                style={styles.queueTitle}
                numberOfLines={2}
              >
                {anom.title || anom.type}
              </Text>
              <Text style={styles.queueMeta} numberOfLines={1}>
                {anom.status} · {anom.confidence ?? 80}% confidence
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={colors.text.muted}
            />
          </TouchableOpacity>
        ))}
      </AppSurface>

      {anomalySummary ? (
        <Text style={styles.footerNote} numberOfLines={3}>
          Monitoring summary available across current anomaly signals.
        </Text>
      ) : null}
    </>
  );

  const renderAdministrative = () => (
    <>
      <ModuleHeader
        eyebrow="ADMINISTRATIVE INTELLIGENCE"
        title="Divisions & Schemes"
        description="Administrative governance and national welfare oversight."
      />

      <AppSurface>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.surfaceTitle}>
            Administrative divisions
          </Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('DivisionExplorer')}
          >
            <Text style={styles.linkText}>View all</Text>
          </TouchableOpacity>
        </View>

        {topDivisions.map((div, index) => (
          <TouchableOpacity
            key={div.divisionId}
            activeOpacity={0.78}
            style={[
              styles.listRow,
              index < topDivisions.length - 1 &&
                styles.rowBorder,
            ]}
            onPress={() =>
              navigation.navigate('DivisionDetails', {
                divisionId: div.divisionId,
              })
            }
          >
            <View style={styles.listText}>
              <Text style={styles.queueCode}>
                {div.code || div.divisionId}
              </Text>
              <Text
                style={styles.queueTitle}
                numberOfLines={2}
              >
                {div.name}
              </Text>
              <Text style={styles.queueMeta}>
                {div.schemeIds.length} schemes ·{' '}
                {div.projectIds.length} projects
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={colors.text.muted}
            />
          </TouchableOpacity>
        ))}
      </AppSurface>

      <AppSurface>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.surfaceTitle}>
            National welfare schemes
          </Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('SchemeExplorer')}
          >
            <Text style={styles.linkText}>View all</Text>
          </TouchableOpacity>
        </View>

        {topSchemes.map((scheme, index) => (
          <TouchableOpacity
            key={scheme.schemeId}
            activeOpacity={0.78}
            style={[
              styles.listRow,
              index < topSchemes.length - 1 &&
                styles.rowBorder,
            ]}
            onPress={() =>
              navigation.navigate('SchemeDetails', {
                schemeId: scheme.schemeId,
              })
            }
          >
            <View style={styles.listText}>
              <Text style={styles.queueCode}>
                {scheme.shortName || scheme.schemeId}
              </Text>
              <Text
                style={styles.queueTitle}
                numberOfLines={2}
              >
                {scheme.name}
              </Text>
              <Text style={styles.queueMeta}>
                {scheme.projectIds.length} projects · Released ₹
                {(
                  (scheme.financialSummary?.releasedAmount ?? 0) /
                  100000
                ).toFixed(0)}
                L
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={colors.text.muted}
            />
          </TouchableOpacity>
        ))}
      </AppSurface>
    </>
  );

  const renderOrganization = () => (
    <>
      <ModuleHeader
        eyebrow="ORGANIZATION & PROJECT OVERSIGHT"
        title="Implementation Network"
        description="Organizations, projects and risk telemetry."
      />

      <AppSurface>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.surfaceTitle}>
            Implementing agencies
          </Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate('OrganizationExplorer')
            }
          >
            <Text style={styles.linkText}>View all</Text>
          </TouchableOpacity>
        </View>

        {topOrganizations.map((org, index) => (
          <TouchableOpacity
            key={org.organizationId}
            activeOpacity={0.78}
            style={[
              styles.listRow,
              index < topOrganizations.length - 1 &&
                styles.rowBorder,
            ]}
            onPress={() =>
              navigation.navigate('OrganizationDetails', {
                organizationId: org.organizationId,
              })
            }
          >
            <View style={styles.listText}>
              <View style={styles.badgeLine}>
                <Text style={styles.queueCode}>
                  {org.organizationType || org.type || 'NGO'}
                </Text>
                {org.monitoringPriority ? (
                  <MonitoringPriorityBadge
                    priority={org.monitoringPriority}
                    compact
                  />
                ) : null}
              </View>

              <Text
                style={styles.queueTitle}
                numberOfLines={2}
              >
                {org.name}
              </Text>

              <Text style={styles.queueMeta}>
                Projects {org.projectIds?.length ?? 0} · Score{' '}
                {org.complianceScore ?? 80}/100
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color={colors.text.muted}
            />
          </TouchableOpacity>
        ))}
      </AppSurface>

      <AppSurface>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.surfaceTitle}>
            Sanctioned central projects
          </Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('ProjectExplorer')}
          >
            <Text style={styles.linkText}>View all</Text>
          </TouchableOpacity>
        </View>

        {topProjects.map((project, index) => (
          <TouchableOpacity
            key={project.projectId}
            activeOpacity={0.78}
            style={[
              styles.listRow,
              index < topProjects.length - 1 &&
                styles.rowBorder,
            ]}
            onPress={() =>
              navigation.navigate('ProjectDetails', {
                projectId: project.projectId,
              })
            }
          >
            <View style={styles.listText}>
              <View style={styles.badgeLine}>
                <Text style={styles.queueCode}>
                  {project.projectCode}
                </Text>
                <ProjectStatusBadge
                  status={(project.status as any) || 'ACTIVE'}
                />
              </View>

              <Text
                style={styles.queueTitle}
                numberOfLines={2}
              >
                {project.name}
              </Text>

              <Text style={styles.queueMeta}>
                Progress {project.progressPercentage ?? 75}% ·
                Sanctioned ₹
                {(project.sanctionedAmount / 100000).toFixed(0)}
                L
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color={colors.text.muted}
            />
          </TouchableOpacity>
        ))}
      </AppSurface>
    </>
  );

  const content =
    selectedModule === null
      ? renderLauncher()
      : selectedModule === 'console'
        ? renderConsole()
        : selectedModule === 'priority'
          ? renderPriority()
          : selectedModule === 'administrative'
            ? renderAdministrative()
            : renderOrganization();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.brand.primary]}
        />
      }
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 112,
  },

  launcherIntro: {
    marginBottom: 18,
  },

  eyebrow: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.05,
    color: colors.brand.primary,
    marginBottom: 7,
  },

  title: {
    fontFamily: typography.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },

  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
  },

  consoleHero: {
    minHeight: 142,
    borderRadius: 20,
    padding: 18,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    ...shadows.sm,
  },

  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.normalLight,
    marginRight: 13,
  },

  heroContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  heroEyebrow: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.9,
    color: colors.status.normal,
    marginBottom: 6,
  },

  heroTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },

  heroDescription: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text.secondary,
  },

  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.background,
  },

  sectionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.95,
    color: colors.text.muted,
    marginBottom: 10,
  },

  moduleGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  moduleTile: {
    flex: 1,
    minWidth: 0,
    minHeight: 126,
    padding: 15,
    borderRadius: 18,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    justifyContent: 'space-between',
    marginRight: 6,
    ...shadows.sm,
  },

  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.normalLight,
    marginBottom: 14,
  },

  warningIcon: {
    backgroundColor: colors.status.highPriorityLight,
  },

  tileContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },

  tileTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },

  tileMeta: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    color: colors.text.muted,
  },

  organizationTile: {
    minHeight: 94,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    ...shadows.sm,
  },

  moduleHeader: {
    marginBottom: 20,
  },

  backButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingRight: 8,
  },

  backText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    marginLeft: 7,
  },

  moduleEyebrow: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.95,
    color: colors.brand.primary,
    marginBottom: 6,
  },

  moduleTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 5,
  },

  moduleDescription: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
  },

  surface: {
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    ...shadows.sm,
  },

  surfaceTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  surfaceHint: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text.muted,
  },

  alertSurface: {
    borderColor: colors.status.highPriorityBorder,
  },

  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.status.highPriorityLight,
  },

  alertBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.55,
    color: colors.status.highPriority,
    marginLeft: 5,
  },

  alertCode: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    marginLeft: 8,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.muted,
  },

  alertTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 6,
  },

  alertDescription: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.secondary,
    marginBottom: 15,
  },

  comparison: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 14,
  },

  comparisonCell: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 7,
  },

  comparisonDivider: {
    width: 1,
    backgroundColor: colors.neutral.border,
  },

  comparisonLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    color: colors.text.muted,
    marginBottom: 4,
  },

  comparisonValue: {
    fontFamily: typography.fontFamily,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  varianceValue: {
    color: colors.status.highPriority,
  },

  comparisonHint: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    lineHeight: 13,
    color: colors.text.muted,
    marginTop: 2,
  },

  primaryButton: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    marginRight: 8,
  },

  dataRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },

  dataLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
    paddingRight: 12,
  },

  dataValue: {
    maxWidth: '35%',
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'right',
  },

  dataValueMuted: {
    color: colors.text.muted,
  },

  actionRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },

  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.background,
    marginRight: 11,
  },

  actionText: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  actionHint: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    color: colors.text.muted,
    marginTop: 2,
  },

  queueRow: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },

  queueAccent: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 11,
  },

  queueContent: {
    flex: 1,
    minWidth: 0,
  },

  queueTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },

  queueTitleWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 7,
  },

  queueTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  queueCode: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
    letterSpacing: 0.25,
  },

  statusText: {
    maxWidth: 92,
    fontFamily: typography.fontFamily,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: typography.weights.bold,
    textAlign: 'right',
    flexShrink: 0,
  },

  queueMeta: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    lineHeight: 15,
    color: colors.text.muted,
  },

  queueBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  queueMetric: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    lineHeight: 15,
    color: colors.text.secondary,
    marginRight: 14,
  },

  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },

  inlineHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  inlineHeadingText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  anomalyRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },

  anomalyText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  footerNote: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    color: colors.text.muted,
    marginBottom: 12,
  },

  sectionHeadingRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  linkText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },

  listRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },

  listText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  badgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 3,
  },
});


