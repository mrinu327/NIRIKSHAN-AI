import { masterDataRegistry, masterLookup } from '../../data/master';

export interface NationalDashboardMetrics {
  totalOrganizations: number;
  totalNgos: number;
  totalInstitutions: number;
  totalProjects: number;
  activeProjects: number;
  totalBeneficiariesEnrolled: number;
  totalBeneficiariesActive: number;
  totalSanctionedCr: number;
  totalReleasedCr: number;
  totalUtilizedCr: number;
  totalUnspentCr: number;
  overallUtilizationPercentage: number;
  totalInspections: number;
  completedInspections: number;
  pendingInspections: number;
  activeAnomaliesCount: number;
  highRiskProjectsCount: number;
  aiRecommendationsCount: number;
}

export interface DivisionAnalyticsSummary {
  divisionId: string;
  name: string;
  code: string;
  schemesCount: number;
  projectsCount: number;
  activeProjectsCount: number;
  totalSanctionedCr: number;
  totalReleasedCr: number;
  totalUtilizedCr: number;
  utilizationPercentage: number;
  criticalAnomaliesCount: number;
}

export interface GeographicAnalyticsSummary {
  stateId: string;
  stateName: string;
  stateCode: string;
  projectsCount: number;
  organizationsCount: number;
  totalReleasedCr: number;
  totalUtilizedCr: number;
}

export class AnalyticsAggregationService {
  /**
   * National Executive Level Overview
   */
  public async getNationalDashboardMetrics(): Promise<NationalDashboardMetrics> {
    const orgs = masterDataRegistry.organizations;
    const ngos = masterLookup.getNgos();
    const insts = masterLookup.getInstitutions();
    const projects = masterDataRegistry.projects;
    const funding = masterDataRegistry.funding;
    const beneficiaries = masterDataRegistry.beneficiaries;
    const inspections = masterDataRegistry.inspections;
    const anomalies = masterDataRegistry.anomalies;
    const risks = masterDataRegistry.riskScores;
    const recs = masterDataRegistry.aiRecommendations;

    const activeProjects = projects.filter(p => p.projectStatus === 'ACTIVE').length;
    const totalEnrolled = beneficiaries.reduce((acc, b) => acc + b.enrolledCount, 0);
    const totalActive = beneficiaries.reduce((acc, b) => acc + b.reportedCount, 0);

    const totalSanctioned = funding.reduce((acc, f) => acc + f.sanctionedAmount, 0);
    const totalReleased = funding.reduce((acc, f) => acc + f.releasedAmount, 0);
    const totalUtilized = funding.reduce((acc, f) => acc + f.utilizedAmount, 0);
    const totalUnspent = totalReleased - totalUtilized;

    const overallUtilization = totalReleased > 0 ? (totalUtilized / totalReleased) * 100 : 0;

    const completedInspections = inspections.filter(
      i => i.inspectionStatus === 'Completed' || i.submissionStatus === 'SUBMITTED' || i.submissionStatus === 'VERIFIED'
    ).length;

    const activeAnomalies = anomalies.filter(
      a => a.status === 'OPEN' || a.status === 'PENDING_REVIEW'
    ).length;

    const highRiskProjects = risks.filter(
      r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL'
    ).length;

    return {
      totalOrganizations: orgs.length,
      totalNgos: ngos.length,
      totalInstitutions: insts.length,
      totalProjects: projects.length,
      activeProjects,
      totalBeneficiariesEnrolled: totalEnrolled,
      totalBeneficiariesActive: totalActive,
      totalSanctionedCr: Number((totalSanctioned / 10000000).toFixed(2)),
      totalReleasedCr: Number((totalReleased / 10000000).toFixed(2)),
      totalUtilizedCr: Number((totalUtilized / 10000000).toFixed(2)),
      totalUnspentCr: Number((totalUnspent / 10000000).toFixed(2)),
      overallUtilizationPercentage: Number(overallUtilization.toFixed(1)),
      totalInspections: inspections.length,
      completedInspections,
      pendingInspections: inspections.length - completedInspections,
      activeAnomaliesCount: activeAnomalies,
      highRiskProjectsCount: highRiskProjects,
      aiRecommendationsCount: recs.length,
    };
  }

  /**
   * Division Performance Analytics
   */
  public async getDivisionAnalytics(): Promise<DivisionAnalyticsSummary[]> {
    return masterDataRegistry.divisions.map(div => {
      const schemes = masterLookup.getSchemesByDivision(div.divisionId);
      const projects = masterLookup.getProjectsByDivision(div.divisionId);
      const activeProjects = projects.filter(p => p.projectStatus === 'ACTIVE');

      const totalSanctionedCr = schemes.reduce(
        (acc, s) => acc + (s.totalBudgetCr ?? (s.financialSummary ? s.financialSummary.sanctionedAmount / 10000000 : 0)),
        0
      );
      const totalReleasedCr = schemes.reduce(
        (acc, s) => acc + (s.financialSummary?.releasedCr ?? (s.financialSummary ? s.financialSummary.releasedAmount / 10000000 : 0)),
        0
      );
      const totalUtilizedCr = schemes.reduce(
        (acc, s) => acc + (s.financialSummary?.utilizedCr ?? (s.financialSummary ? s.financialSummary.utilizedAmount / 10000000 : 0)),
        0
      );
      const utilizationPercentage =
        totalReleasedCr > 0 ? (totalUtilizedCr / totalReleasedCr) * 100 : 0;

      const projectIds = projects.map(p => p.projectId);
      const criticalAnomaliesCount = masterDataRegistry.anomalies.filter(
        a => projectIds.includes(a.projectId) && (a.severity === 'CRITICAL' || a.severity === 'HIGH')
      ).length;

      return {
        divisionId: div.divisionId,
        name: div.name,
        code: div.code ?? div.shortName ?? div.divisionId,
        schemesCount: schemes.length,
        projectsCount: projects.length,
        activeProjectsCount: activeProjects.length,
        totalSanctionedCr: Number(totalSanctionedCr.toFixed(2)),
        totalReleasedCr: Number(totalReleasedCr.toFixed(2)),
        totalUtilizedCr: Number(totalUtilizedCr.toFixed(2)),
        utilizationPercentage: Number(utilizationPercentage.toFixed(1)),
        criticalAnomaliesCount,
      };
    });
  }

  /**
   * State / Geographic Analytics
   */
  public async getGeographicDistribution(): Promise<GeographicAnalyticsSummary[]> {
    return masterDataRegistry.states.map(state => {
      const projects = masterLookup.getProjectsByState(state.stateId);
      const orgIds = new Set(projects.map(p => p.organizationId));

      const fundingRecords = masterDataRegistry.funding.filter(f =>
        projects.some(p => p.projectId === f.projectId)
      );

      const totalReleased = fundingRecords.reduce((acc, f) => acc + f.releasedAmount, 0);
      const totalUtilized = fundingRecords.reduce((acc, f) => acc + f.utilizedAmount, 0);

      return {
        stateId: state.stateId,
        stateName: state.name,
        stateCode: state.code ?? state.stateId,
        projectsCount: projects.length,
        organizationsCount: orgIds.size,
        totalReleasedCr: Number((totalReleased / 10000000).toFixed(2)),
        totalUtilizedCr: Number((totalUtilized / 10000000).toFixed(2)),
      };
    });
  }
}

export const analyticsAggregationService = new AnalyticsAggregationService();
