/**
 * Master Division Service & Performance Engine
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Implements authoritative administrative division queries, relationship traversals,
 * and service-level performance calculations for the DoSJE Division Intelligence layer.
 */

import {
  Division,
  Scheme,
  MasterProject,
  Organization,
  MasterInspection,
  MasterAnomaly,
  DivisionPerformanceMetrics,
  MonitoringPriority,
} from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';

export class DivisionService {
  /**
   * Retrieve all MoSJE administrative divisions
   */
  public async getAllDivisions(): Promise<Division[]> {
    return [...masterDataRegistry.divisions];
  }

  /**
   * Backward-compatible alias for getAllDivisions
   */
  public async getDivisions(): Promise<Division[]> {
    return this.getAllDivisions();
  }

  /**
   * Retrieve division by unique ID or Code
   */
  public async getDivisionById(divisionId: string): Promise<Division | undefined> {
    return masterLookup.getDivisionById(divisionId);
  }

  /**
   * Case-insensitive search across division name, short name, code, responsible unit, and description
   */
  public async searchDivisions(query: string): Promise<Division[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAllDivisions();

    return masterDataRegistry.divisions.filter(d => {
      const matchName = d.name.toLowerCase().includes(q);
      const matchShort = d.shortName ? d.shortName.toLowerCase().includes(q) : false;
      const matchCode = d.code ? d.code.toLowerCase().includes(q) : false;
      const matchUnit = d.responsibleUnit ? d.responsibleUnit.toLowerCase().includes(q) : false;
      const matchDesc = d.description ? d.description.toLowerCase().includes(q) : false;
      return matchName || matchShort || matchCode || matchUnit || matchDesc;
    });
  }

  /**
   * Retrieve all schemes operating under this division
   */
  public async getDivisionSchemes(divisionId: string): Promise<Scheme[]> {
    return masterLookup.getSchemesByDivision(divisionId);
  }

  /**
   * Retrieve all projects under schemes belonging to this division
   */
  public async getDivisionProjects(divisionId: string): Promise<MasterProject[]> {
    return masterLookup.getProjectsByDivision(divisionId);
  }

  /**
   * Retrieve all organizations implementing projects under this division
   */
  public async getDivisionOrganizations(divisionId: string): Promise<Organization[]> {
    return masterLookup.getDivisionOrganizations(divisionId);
  }

  /**
   * Retrieve all inspections conducted for projects under this division
   */
  public async getDivisionInspectionSummary(divisionId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    inspections: MasterInspection[];
  }> {
    const inspections = masterLookup.getDivisionInspections(divisionId);
    const completed = inspections.filter(
      i =>
        i.inspectionStatus === 'Completed' ||
        i.submissionStatus === 'SUBMITTED' ||
        i.submissionStatus === 'VERIFIED'
    ).length;
    const pending = inspections.filter(
      i =>
        i.inspectionStatus === 'Assigned' ||
        i.inspectionStatus === 'In Progress' ||
        i.inspectionStatus === 'Scheduled' ||
        i.inspectionStatus === 'Awaiting Assignment'
    ).length;
    const overdue = inspections.filter(i => i.inspectionStatus === 'OVERDUE').length;

    return {
      total: inspections.length,
      completed,
      pending,
      overdue,
      inspections,
    };
  }

  /**
   * Retrieve all anomalies linked to projects under this division
   */
  public async getDivisionAnomalies(divisionId: string): Promise<MasterAnomaly[]> {
    return masterLookup.getDivisionAnomalies(divisionId);
  }

  /**
   * Calculate aggregated financial metrics for this division
   */
  public async getDivisionFundingSummary(divisionId: string): Promise<{
    divisionId: string;
    totalSanctionedCr: number;
    totalReleasedCr: number;
    totalUtilizedCr: number;
    totalUnspentCr: number;
    utilizationPercentage: number;
  }> {
    const projects = await this.getDivisionProjects(divisionId);
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
    } else {
      const schemes = await this.getDivisionSchemes(divisionId);
      schemes.forEach(s => {
        if (s.financialSummary) {
          sanctioned += s.financialSummary.sanctionedAmount;
          released += s.financialSummary.releasedAmount;
          utilized += s.financialSummary.utilizedAmount;
        }
      });
    }

    const unspent = released - utilized;
    const utilizationPercentage = released > 0 ? (utilized / released) * 100 : 0;

    return {
      divisionId,
      totalSanctionedCr: Number((sanctioned / 10000000).toFixed(2)),
      totalReleasedCr: Number((released / 10000000).toFixed(2)),
      totalUtilizedCr: Number((utilized / 10000000).toFixed(2)),
      totalUnspentCr: Number((unspent / 10000000).toFixed(2)),
      utilizationPercentage: Number(utilizationPercentage.toFixed(1)),
    };
  }

  /**
   * DIVISION PERFORMANCE ENGINE
   * Dynamically aggregates schemes, projects, organizations, inspections, anomalies, and financial performance
   */
  public async getDivisionPerformanceSummary(
    divisionId: string
  ): Promise<DivisionPerformanceMetrics & { schemesCount: number; averageUtilization: number }> {
    const division = masterLookup.getDivisionById(divisionId);
    const schemes = await this.getDivisionSchemes(divisionId);
    const projects = await this.getDivisionProjects(divisionId);
    const orgs = await this.getDivisionOrganizations(divisionId);
    const inspSummary = await this.getDivisionInspectionSummary(divisionId);
    const anomalies = await this.getDivisionAnomalies(divisionId);
    const fundingSummary = await this.getDivisionFundingSummary(divisionId);

    const activeSchemes = schemes.filter(s => s.status === 'ACTIVE').length;
    const activeProjects = projects.filter(p => p.projectStatus === 'ACTIVE').length;
    const completedProjects = projects.filter(p => p.projectStatus === 'COMPLETED').length;

    const highSeverityAnomalies = anomalies.filter(
      a => a.severity === 'CRITICAL' || a.severity === 'HIGH'
    ).length;

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
    const averageComplianceScore =
      countCompliance > 0 ? Number((sumCompliance / countCompliance).toFixed(1)) : 75;
    const averageRiskScore =
      projects.length > 0 ? Number((sumRisk / projects.length).toFixed(1)) : 30;

    // Transparent Monitoring Priority based on observable data
    let priority: MonitoringPriority = 'LOW';
    if (highSeverityAnomalies >= 2 || averageComplianceScore < 60) {
      priority = 'CRITICAL';
    } else if (highSeverityAnomalies >= 1 || averageComplianceScore < 75 || inspSummary.pending > 1) {
      priority = 'HIGH';
    } else if (anomalies.length > 0 || fundingSummary.utilizationPercentage < 75) {
      priority = 'MEDIUM';
    }

    return {
      divisionId,
      name: division?.name ?? divisionId,
      code: division?.code ?? division?.shortName,
      totalSchemes: schemes.length,
      activeSchemes,
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalOrganizations: orgs.length,
      totalInspections: inspSummary.total,
      completedInspections: inspSummary.completed,
      pendingInspections: inspSummary.pending,
      overdueInspections: inspSummary.overdue,
      totalAnomalies: anomalies.length,
      highSeverityAnomalies,
      totalSanctionedCr: fundingSummary.totalSanctionedCr,
      totalReleasedCr: fundingSummary.totalReleasedCr,
      totalUtilizedCr: fundingSummary.totalUtilizedCr,
      totalUnspentCr: fundingSummary.totalUnspentCr,
      utilizationPercentage: fundingSummary.utilizationPercentage,
      averageProjectProgress,
      averageComplianceScore,
      averageRiskScore,
      monitoringPriority: priority,

      // Backward compatibility fields
      schemesCount: schemes.length,
      averageUtilization: fundingSummary.utilizationPercentage,
    };
  }
}

export const divisionService = new DivisionService();
