import {
  MasterProject,
  MasterInspection,
  MasterAnomaly,
  MasterEvidence,
  RiskScore,
  MasterFunding,
  MasterBeneficiarySummary,
  Finding,
  FilterCriteria,
  ProjectFilterCriteria,
  ProjectFundingIntelligence,
  ProjectBeneficiaryIntelligence,
  ProjectMonitoringIndicator,
  ProjectMonitoringProfile,
  MonitoringPriority,
  ProjectStatus,
} from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';
import { fundingIntelligenceService } from '../analytics/fundingIntelligenceService';
import { beneficiaryIntelligenceService } from '../analytics/beneficiaryIntelligenceService';
import { projectMonitoringEngine } from '../analytics/projectMonitoringEngine';

export class ProjectService {
  /**
   * Retrieve projects, optionally filtered by criteria
   */
  public async getProjects(criteria?: FilterCriteria | ProjectFilterCriteria): Promise<MasterProject[]> {
    if (!criteria) {
      return [...masterDataRegistry.projects];
    }
    return this.filterProjects(criteria as ProjectFilterCriteria);
  }

  /**
   * Retrieve project by ID or Code
   */
  public async getProjectById(id: string): Promise<MasterProject | undefined> {
    return masterLookup.getProjectById(id);
  }

  /**
   * Search projects by code, title/name, scheme, or organization name
   */
  public async searchProjects(query: string): Promise<MasterProject[]> {
    if (!query || query.trim() === '') {
      return [...masterDataRegistry.projects];
    }
    const q = query.toLowerCase().trim();
    return masterDataRegistry.projects.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const pCode = p.projectCode || p.code || p.projectId;
      const codeMatch = pCode.toLowerCase().includes(q);
      const scheme = masterLookup.getSchemeById(p.schemeId);
      const org = masterLookup.getOrganizationById(p.organizationId);
      const schemeMatch = scheme?.name.toLowerCase().includes(q) || (scheme?.code ? scheme.code.toLowerCase().includes(q) : false);
      const orgMatch = org?.name.toLowerCase().includes(q) || org?.organizationId.toLowerCase().includes(q);
      const locationMatch = (p.location?.district ? p.location.district.toLowerCase().includes(q) : false) ||
        (p.location?.city ? p.location.city.toLowerCase().includes(q) : false) ||
        (p.location?.state ? p.location.state.toLowerCase().includes(q) : false);
      return nameMatch || codeMatch || !!schemeMatch || !!orgMatch || locationMatch;
    });
  }

  /**
   * Filter projects across multi-dimensional criteria
   */
  public async filterProjects(criteria: ProjectFilterCriteria): Promise<MasterProject[]> {
    let result = [...masterDataRegistry.projects];

    if (criteria.divisionId && criteria.divisionId !== 'ALL') {
      const schemes = masterLookup.getSchemesByDivision(criteria.divisionId);
      const schemeIds = new Set(schemes.map(s => s.schemeId));
      result = result.filter(p => schemeIds.has(p.schemeId));
    }

    if (criteria.schemeId && criteria.schemeId !== 'ALL') {
      result = result.filter(p => p.schemeId === criteria.schemeId);
    }

    if (criteria.organizationId && criteria.organizationId !== 'ALL') {
      result = result.filter(p => p.organizationId === criteria.organizationId);
    }

    const statusFilter = criteria.status || (criteria as any).projectStatus;
    if (statusFilter && statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter || p.projectStatus === statusFilter);
    }

    if (criteria.state && criteria.state !== 'ALL') {
      result = result.filter(p => (p.location?.state || '').toLowerCase() === criteria.state?.toLowerCase());
    }

    if (criteria.district && criteria.district !== 'ALL') {
      result = result.filter(p => (p.location?.district || p.location?.city || '').toLowerCase() === criteria.district?.toLowerCase());
    }

    if (criteria.priority && criteria.priority !== 'ALL') {
      result = result.filter(p => {
        const profile = projectMonitoringEngine.calculateProjectMonitoringProfile(p.projectId);
        return p.priority === criteria.priority || profile?.priority === criteria.priority;
      });
    }

    const searchTerm = criteria.searchQuery || (criteria as any).search;
    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const pCode = p.projectCode || p.code || p.projectId;
        const codeMatch = pCode.toLowerCase().includes(q);
        const org = masterLookup.getOrganizationById(p.organizationId);
        const orgMatch = org?.name.toLowerCase().includes(q);
        return nameMatch || codeMatch || !!orgMatch;
      });
    }


    return result;
  }

  /**
   * Sort projects by chosen key and order
   */
  public sortProjects(
    projects: MasterProject[],
    sortBy: 'code' | 'name' | 'sanctionedAmount' | 'progressPercentage' | 'complianceScore' | 'priority' = 'code',
    order: 'asc' | 'desc' = 'asc'
  ): MasterProject[] {
    const priorityWeight: Record<MonitoringPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const sorted = [...projects].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'code': {
          const codeA = a.projectCode || a.code || a.projectId;
          const codeB = b.projectCode || b.code || b.projectId;
          comparison = codeA.localeCompare(codeB);
          break;
        }
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sanctionedAmount':
          comparison = a.sanctionedAmount - b.sanctionedAmount;
          break;
        case 'progressPercentage':
          comparison = (a.progressPercentage ?? 0) - (b.progressPercentage ?? 0);
          break;
        case 'complianceScore':
          comparison = (a.complianceScore ?? 0) - (b.complianceScore ?? 0);
          break;
        case 'priority': {
          const profA = projectMonitoringEngine.calculateProjectMonitoringProfile(a.projectId);
          const profB = projectMonitoringEngine.calculateProjectMonitoringProfile(b.projectId);
          const weightA = profA ? priorityWeight[profA.priority] : 0;
          const weightB = profB ? priorityWeight[profB.priority] : 0;
          comparison = weightA - weightB;
          break;
        }
      }
      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Retrieve all projects administered under a division
   */
  public async getProjectsByDivision(divisionId: string): Promise<MasterProject[]> {
    return masterLookup.getProjectsByDivision(divisionId);
  }

  /**
   * Retrieve all projects sanctioned under a scheme
   */
  public async getProjectsByScheme(schemeId: string): Promise<MasterProject[]> {
    return masterLookup.getProjectsByScheme(schemeId);
  }

  /**
   * Retrieve all projects operated by an organization
   */
  public async getProjectsByOrganization(organizationId: string): Promise<MasterProject[]> {
    return masterLookup.getProjectsByOrganization(organizationId);
  }

  /**
   * Retrieve projects in a specific state
   */
  public async getProjectsByState(state: string): Promise<MasterProject[]> {
    const s = state.toLowerCase().trim();
    return masterDataRegistry.projects.filter(p => (p.location?.state || '').toLowerCase() === s);
  }

  /**
   * Retrieve projects in a specific district
   */
  public async getProjectsByDistrict(district: string): Promise<MasterProject[]> {
    const d = district.toLowerCase().trim();
    return masterDataRegistry.projects.filter(p => (p.location?.district || p.location?.city || '').toLowerCase() === d);
  }


  /**
   * Retrieve dynamic funding ledger and metrics for project
   */
  public async getProjectFundingSummary(projectId: string): Promise<ProjectFundingIntelligence | undefined> {
    return fundingIntelligenceService.getProjectFunding(projectId);
  }

  /**
   * Retrieve beneficiary profile and attendance roll-call summary
   */
  public async getProjectBeneficiarySummary(
    projectId: string
  ): Promise<ProjectBeneficiaryIntelligence | undefined> {
    return beneficiaryIntelligenceService.getProjectBeneficiarySummary(projectId);
  }

  /**
   * Retrieve inspection execution summary for project
   */
  public async getProjectInspectionSummary(
    projectId: string
  ): Promise<{ total: number; completed: number; pending: number; latest?: MasterInspection }> {
    const inspections = masterLookup.getInspectionsByProject(projectId);
    const completed = inspections.filter(i => i.inspectionStatus === 'Completed').length;
    const pending = inspections.length - completed;

    // Find latest inspection by date
    const sorted = [...inspections].sort((a, b) => {
      const dateA = new Date(a.completedAt || a.scheduledAt || 0).getTime();
      const dateB = new Date(b.completedAt || b.scheduledAt || 0).getTime();
      return dateB - dateA;
    });

    return {
      total: inspections.length,
      completed,
      pending,
      latest: sorted[0],
    };
  }

  /**
   * Retrieve all inspections conducted for a project
   */
  public async getProjectInspections(projectId: string): Promise<MasterInspection[]> {
    return masterLookup.getInspectionsByProject(projectId);
  }

  /**
   * Retrieve findings from all inspections of this project
   */
  public async getProjectFindings(projectId: string): Promise<Finding[]> {
    return masterLookup.getProjectFindings(projectId);
  }

  /**
   * Retrieve evidence attachments for project
   */
  public async getProjectEvidence(projectId: string): Promise<MasterEvidence[]> {
    return masterLookup.getProjectEvidence(projectId);
  }

  /**
   * Retrieve all anomalies detected for a project
   */
  public async getProjectAnomalies(projectId: string): Promise<MasterAnomaly[]> {
    return masterLookup.getAnomaliesByProject(projectId);
  }

  /**
   * Retrieve high-level operational performance summary
   */
  public async getProjectPerformanceSummary(
    projectId: string
  ): Promise<{ completion: number; compliance: number; utilization: number; priority: MonitoringPriority } | undefined> {
    const proj = masterLookup.getProjectById(projectId);
    if (!proj) return undefined;

    const funding = await this.getProjectFundingSummary(projectId);
    const profile = projectMonitoringEngine.calculateProjectMonitoringProfile(projectId);

    return {
      completion: proj.progressPercentage ?? 75,
      compliance: proj.complianceScore ?? 75,
      utilization: funding?.utilizationPercentage ?? 80,
      priority: profile?.priority ?? 'LOW',
    };
  }

  /**
   * Retrieve structured observable monitoring indicators
   */
  public async getProjectMonitoringIndicators(projectId: string): Promise<ProjectMonitoringIndicator[]> {
    return projectMonitoringEngine.getProjectMonitoringIndicators(projectId);
  }

  /**
   * Retrieve comprehensive 7-factor explainable monitoring profile
   */
  public async getProjectMonitoringProfile(projectId: string): Promise<ProjectMonitoringProfile | undefined> {
    return projectMonitoringEngine.calculateProjectMonitoringProfile(projectId);
  }

  /**
   * Backward-compatibility helper for raw MasterFunding record
   */
  public async getProjectFunding(projectId: string): Promise<MasterFunding | undefined> {
    return masterLookup.getFundingByProject(projectId);
  }

  /**
   * Backward-compatibility helper for raw MasterBeneficiarySummary record
   */
  public async getProjectBeneficiaries(
    projectId: string
  ): Promise<MasterBeneficiarySummary | undefined> {
    return masterLookup.getBeneficiariesByProject(projectId);
  }

  /**
   * Backward-compatibility helper for AI-computed risk score evaluation
   */
  public async getProjectRiskScore(projectId: string): Promise<RiskScore | undefined> {
    return masterLookup.getRiskScoreByEntity(projectId);
  }
}

export const projectService = new ProjectService();

