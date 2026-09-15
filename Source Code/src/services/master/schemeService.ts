/**
 * Master Scheme Service & Performance Engine
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Implements authoritative scheme catalogue queries, relationship traversals,
 * and service-level performance calculations for the DoSJE Scheme Intelligence layer.
 */

import {
  Scheme,
  MasterProject,
  Organization,
  MasterInspection,
  MasterAnomaly,
  SchemePerformanceMetrics,
  MonitoringPriority,
} from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';

export class SchemeService {
  /**
   * Retrieve all schemes in the catalogue
   */
  public async getAllSchemes(): Promise<Scheme[]> {
    return [...masterDataRegistry.schemes];
  }

  /**
   * Backward-compatible alias for getAllSchemes
   */
  public async getSchemes(divisionId?: string): Promise<Scheme[]> {
    if (divisionId) {
      return this.getSchemesByDivision(divisionId);
    }
    return this.getAllSchemes();
  }

  /**
   * Retrieve scheme by unique ID or Code
   */
  public async getSchemeById(schemeId: string): Promise<Scheme | undefined> {
    return masterLookup.getSchemeById(schemeId);
  }

  /**
   * Case-insensitive search across scheme name, short name, code, category, and description
   */
  public async searchSchemes(query: string): Promise<Scheme[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAllSchemes();

    return masterDataRegistry.schemes.filter(s => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchShort = s.shortName ? s.shortName.toLowerCase().includes(q) : false;
      const matchCode = s.code ? s.code.toLowerCase().includes(q) : false;
      const matchCategory = s.category ? s.category.toLowerCase().includes(q) : false;
      const matchDesc = s.description ? s.description.toLowerCase().includes(q) : false;
      const matchBeneficiary = s.targetBeneficiaries ? s.targetBeneficiaries.toLowerCase().includes(q) : false;
      const matchFunding = s.fundingModel ? s.fundingModel.toLowerCase().includes(q) : false;
      return matchName || matchShort || matchCode || matchCategory || matchDesc || matchBeneficiary || matchFunding;
    });
  }

  /**
   * Retrieve schemes overseen by an administrative division
   */
  public async getSchemesByDivision(divisionId: string): Promise<Scheme[]> {
    return masterLookup.getSchemesByDivision(divisionId);
  }

  /**
   * Retrieve all currently active schemes
   */
  public async getActiveSchemes(): Promise<Scheme[]> {
    return masterDataRegistry.schemes.filter(s => s.status === 'ACTIVE');
  }

  /**
   * Retrieve schemes by operational status
   */
  public async getSchemesByStatus(status: string): Promise<Scheme[]> {
    return masterDataRegistry.schemes.filter(s => s.status === status);
  }

  /**
   * Retrieve schemes by monitoring priority level
   */
  public async getSchemesByPriority(priority: MonitoringPriority): Promise<Scheme[]> {
    return masterDataRegistry.schemes.filter(s => s.monitoringPriority === priority);
  }

  /**
   * Retrieve schemes by grouping category (e.g., Social Defence, SC Welfare, Senior Citizens)
   */
  public async getSchemesByCategory(category: string): Promise<Scheme[]> {
    if (category === 'All') return this.getAllSchemes();
    return masterDataRegistry.schemes.filter(s => s.category === category);
  }

  /**
   * Retrieve schemes that operate projects in a specific state
   */
  public async getSchemesByState(stateId: string): Promise<Scheme[]> {
    const projectsInState = masterLookup.getProjectsByState(stateId);
    const schemeIds = new Set(projectsInState.map(p => p.schemeId));
    return masterDataRegistry.schemes.filter(s => schemeIds.has(s.schemeId));
  }

  /**
   * Retrieve all projects sanctioned under this scheme
   */
  public async getSchemeProjects(schemeId: string): Promise<MasterProject[]> {
    return masterLookup.getProjectsByScheme(schemeId);
  }

  /**
   * Retrieve all organizations implementing projects under this scheme
   */
  public async getSchemeOrganizations(schemeId: string): Promise<Organization[]> {
    return masterLookup.getSchemeOrganizations(schemeId);
  }

  /**
   * Retrieve all inspection records linked to this scheme
   */
  public async getSchemeInspections(schemeId: string): Promise<MasterInspection[]> {
    return masterLookup.getSchemeInspections(schemeId);
  }

  /**
   * Retrieve all anomalies linked to projects under this scheme
   */
  public async getSchemeAnomalies(schemeId: string): Promise<MasterAnomaly[]> {
    return masterLookup.getSchemeAnomalies(schemeId);
  }

  /**
   * Calculate financial summary for a scheme
   */
  public async getSchemeFundingSummary(schemeId: string): Promise<{
    schemeId: string;
    totalBudgetCr: number;
    sanctionedAmount: number;
    releasedAmount: number;
    utilizedAmount: number;
    unspentAmount: number;
    utilizationPercentage: number;
  } | undefined> {
    const scheme = masterLookup.getSchemeById(schemeId);
    if (!scheme) return undefined;

    const projects = await this.getSchemeProjects(schemeId);
    const projectFundingRecords = masterDataRegistry.funding.filter(f =>
      projects.some(p => p.projectId === f.projectId)
    );

    let sanctioned = 0;
    let released = 0;
    let utilized = 0;

    if (projectFundingRecords.length > 0) {
      sanctioned = projectFundingRecords.reduce((acc, f) => acc + f.sanctionedAmount, 0);
      released = projectFundingRecords.reduce((acc, f) => acc + f.releasedAmount, 0);
      utilized = projectFundingRecords.reduce((acc, f) => acc + f.utilizedAmount, 0);
    } else if (scheme.financialSummary) {
      sanctioned = scheme.financialSummary.sanctionedAmount;
      released = scheme.financialSummary.releasedAmount;
      utilized = scheme.financialSummary.utilizedAmount;
    }

    const unspent = released - utilized;
    const utilizationPercentage = released > 0 ? (utilized / released) * 100 : 0;
    const totalBudgetCr = scheme.totalBudgetCr ?? Number((sanctioned / 10000000).toFixed(2));

    return {
      schemeId: scheme.schemeId,
      totalBudgetCr,
      sanctionedAmount: sanctioned,
      releasedAmount: released,
      utilizedAmount: utilized,
      unspentAmount: unspent,
      utilizationPercentage: Number(utilizationPercentage.toFixed(1)),
    };
  }

  /**
   * Backward-compatible alias for getSchemeFundingSummary
   */
  public async getSchemeFinancials(schemeId: string) {
    const summary = await this.getSchemeFundingSummary(schemeId);
    if (!summary) return undefined;

    return {
      schemeId: summary.schemeId,
      totalBudgetCr: summary.totalBudgetCr,
      allocatedCr: Number((summary.sanctionedAmount / 10000000).toFixed(2)),
      releasedCr: Number((summary.releasedAmount / 10000000).toFixed(2)),
      utilizedCr: Number((summary.utilizedAmount / 10000000).toFixed(2)),
      unspentCr: Number((summary.unspentAmount / 10000000).toFixed(2)),
      utilizationPercentage: summary.utilizationPercentage,
    };
  }

  /**
   * SCHEME PERFORMANCE ENGINE
   * Dynamically aggregates operational, financial, beneficiary, inspection, and anomaly metrics
   */
  public async getSchemePerformanceSummary(
    schemeId: string
  ): Promise<SchemePerformanceMetrics | undefined> {
    const scheme = masterLookup.getSchemeById(schemeId);
    if (!scheme) return undefined;

    const division = masterLookup.getDivisionById(scheme.divisionId);
    const projects = await this.getSchemeProjects(schemeId);
    const orgs = await this.getSchemeOrganizations(schemeId);
    const inspections = await this.getSchemeInspections(schemeId);
    const anomalies = await this.getSchemeAnomalies(schemeId);
    const fundingSummary = await this.getSchemeFundingSummary(schemeId);

    // Project breakdown
    const activeProjects = projects.filter(p => p.projectStatus === 'ACTIVE');
    const completedProjects = projects.filter(p => p.projectStatus === 'COMPLETED');

    // Beneficiary metrics
    const projectIds = new Set(projects.map(p => p.projectId));
    const beneficiaryRecords = masterDataRegistry.beneficiaries.filter(b =>
      projectIds.has(b.projectId)
    );

    let benTarget = 0;
    let benEnrolled = 0;
    let benReported = 0;
    let benVerified = 0;

    beneficiaryRecords.forEach(b => {
      benTarget += b.targetCount;
      benEnrolled += b.enrolledCount;
      benReported += b.reportedCount;
      benVerified += b.verifiedCount;
    });

    // Fallback to project beneficiary fields if no separate summary record
    if (beneficiaryRecords.length === 0) {
      projects.forEach(p => {
        benTarget += p.beneficiaryTarget ?? 0;
        benReported += p.beneficiaryReported ?? 0;
        benVerified += p.beneficiaryVerified ?? 0;
        benEnrolled += p.beneficiaryTarget ?? 0;
      });
    }

    // Inspection breakdown
    const completedInspections = inspections.filter(
      i =>
        i.inspectionStatus === 'Completed' ||
        i.submissionStatus === 'SUBMITTED' ||
        i.submissionStatus === 'VERIFIED'
    );
    const pendingInspections = inspections.filter(
      i =>
        i.inspectionStatus === 'Assigned' ||
        i.inspectionStatus === 'In Progress' ||
        i.inspectionStatus === 'Scheduled' ||
        i.inspectionStatus === 'Awaiting Assignment'
    );
    const overdueInspections = inspections.filter(i => i.inspectionStatus === 'OVERDUE');

    // Anomaly breakdown
    const highSeverityAnomalies = anomalies.filter(
      a => a.severity === 'CRITICAL' || a.severity === 'HIGH'
    );

    // Averages across projects
    let sumProgress = 0;
    let sumCompliance = 0;
    let countCompliance = 0;
    let sumRisk = 0;

    projects.forEach(p => {
      sumProgress += p.progressPercentage ?? 0;
      if (typeof p.complianceScore === 'number') {
        sumCompliance += p.complianceScore;
        countCompliance++;
      }
      if (typeof p.riskScore === 'number') {
        sumRisk += p.riskScore;
      }
    });

    const averageProjectProgress =
      projects.length > 0 ? Number((sumProgress / projects.length).toFixed(1)) : 0;
    const averageCompliance =
      countCompliance > 0 ? Number((sumCompliance / countCompliance).toFixed(1)) : 75;
    const averageRiskScore =
      projects.length > 0 ? Number((sumRisk / projects.length).toFixed(1)) : 30;

    // Transparent Monitoring Priority Calculation
    let priority: MonitoringPriority = 'LOW';
    if (highSeverityAnomalies.length >= 2 || averageCompliance < 60) {
      priority = 'CRITICAL';
    } else if (highSeverityAnomalies.length >= 1 || averageCompliance < 75 || pendingInspections.length > 1) {
      priority = 'HIGH';
    } else if (anomalies.length > 0 || (fundingSummary && fundingSummary.utilizationPercentage < 75)) {
      priority = 'MEDIUM';
    }

    return {
      schemeId: scheme.schemeId,
      name: scheme.name,
      shortName: scheme.shortName ?? scheme.code,
      divisionId: scheme.divisionId,
      divisionName: division?.name ?? scheme.divisionId,
      projectCount: projects.length,
      activeProjectCount: activeProjects.length,
      completedProjectCount: completedProjects.length,
      organizationCount: orgs.length,
      sanctionedFunding: fundingSummary?.sanctionedAmount ?? 0,
      releasedFunding: fundingSummary?.releasedAmount ?? 0,
      utilizedFunding: fundingSummary?.utilizedAmount ?? 0,
      unspentAmount: fundingSummary?.unspentAmount ?? 0,
      utilizationPercentage: fundingSummary?.utilizationPercentage ?? 0,
      beneficiaryTarget: benTarget,
      beneficiaryEnrolled: benEnrolled,
      beneficiaryReported: benReported,
      beneficiaryVerified: benVerified,
      inspectionCount: inspections.length,
      completedInspectionCount: completedInspections.length,
      pendingInspectionCount: pendingInspections.length,
      overdueInspectionCount: overdueInspections.length,
      anomalyCount: anomalies.length,
      highSeverityAnomalyCount: highSeverityAnomalies.length,
      averageProjectProgress,
      averageCompliance,
      averageRiskScore,
      monitoringPriority: priority,
    };
  }
}

export const schemeService = new SchemeService();
