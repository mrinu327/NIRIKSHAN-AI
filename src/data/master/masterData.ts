import {
  Division,
  Scheme,
  PMU,
  PMUTeam,
  MasterState,
  MasterDistrict,
  Organization,
  MasterProject,
  MasterFunding,
  MasterBeneficiarySummary,
  MasterInspection,
  Finding,
  MasterEvidence,
  SocialAudit,
  MasterAnomaly,
  RiskScore,
  AIRecommendation,
  MasterNotification,
  MasterAuditLog,
  FilterCriteria,
} from '../../types/master';

import { MASTER_DIVISIONS } from './divisions';
import { MASTER_SCHEMES } from './schemes';
import { MASTER_PMUS, MASTER_PMU_TEAMS } from './pmus';
import { MASTER_STATES, MASTER_DISTRICTS } from './geography';
import { MASTER_ORGANIZATIONS } from './organizations';
import { MASTER_PROJECTS } from './projects';
import { MASTER_FUNDING } from './funding';
import { MASTER_BENEFICIARY_SUMMARIES } from './beneficiaries';
import { MASTER_INSPECTIONS } from './inspections';
import { MASTER_FINDINGS } from './findings';
import { MASTER_EVIDENCE } from './evidence';
import { MASTER_SOCIAL_AUDITS } from './socialAudits';
import { MASTER_ANOMALIES } from './anomalies';
import { MASTER_RISK_SCORES } from './riskScores';
import { MASTER_AI_RECOMMENDATIONS } from './aiRecommendations';
import { MASTER_NOTIFICATIONS } from './notifications';
import { MASTER_AUDIT_LOGS } from './auditLogs';

export interface MasterDataRegistry {
  divisions: Division[];
  schemes: Scheme[];
  pmus: PMU[];
  pmuTeams: PMUTeam[];
  states: MasterState[];
  districts: MasterDistrict[];
  organizations: Organization[];
  projects: MasterProject[];
  funding: MasterFunding[];
  beneficiaries: MasterBeneficiarySummary[];
  inspections: MasterInspection[];
  findings: Finding[];
  evidence: MasterEvidence[];
  socialAudits: SocialAudit[];
  anomalies: MasterAnomaly[];
  riskScores: RiskScore[];
  aiRecommendations: AIRecommendation[];
  notifications: MasterNotification[];
  auditLogs: MasterAuditLog[];
}

export const masterDataRegistry: MasterDataRegistry = {
  divisions: MASTER_DIVISIONS,
  schemes: MASTER_SCHEMES,
  pmus: MASTER_PMUS,
  pmuTeams: MASTER_PMU_TEAMS,
  states: MASTER_STATES,
  districts: MASTER_DISTRICTS,
  organizations: MASTER_ORGANIZATIONS,
  projects: MASTER_PROJECTS,
  funding: MASTER_FUNDING,
  beneficiaries: MASTER_BENEFICIARY_SUMMARIES,
  inspections: MASTER_INSPECTIONS,
  findings: MASTER_FINDINGS,
  evidence: MASTER_EVIDENCE,
  socialAudits: MASTER_SOCIAL_AUDITS,
  anomalies: MASTER_ANOMALIES,
  riskScores: MASTER_RISK_SCORES,
  aiRecommendations: MASTER_AI_RECOMMENDATIONS,
  notifications: MASTER_NOTIFICATIONS,
  auditLogs: MASTER_AUDIT_LOGS,
};

// ==========================================
// RELATIONSHIP TRAVERSAL HELPERS
// ==========================================

export const masterLookup = {
  // Divisions & Schemes
  getDivisionById: (id: string): Division | undefined =>
    masterDataRegistry.divisions.find(d => d.divisionId === id),

  getSchemesByDivision: (divisionId: string): Scheme[] =>
    masterDataRegistry.schemes.filter(s => s.divisionId === divisionId),

  getSchemeById: (id: string): Scheme | undefined =>
    masterDataRegistry.schemes.find(s => s.schemeId === id),

  // PMUs & Teams
  getPmuById: (id: string): PMU | undefined =>
    masterDataRegistry.pmus.find(p => p.pmuId === id),

  getTeamsByPmu: (pmuId: string): PMUTeam[] =>
    masterDataRegistry.pmuTeams.filter(t => t.pmuId === pmuId),

  getTeamById: (id: string): PMUTeam | undefined =>
    masterDataRegistry.pmuTeams.find(t => t.teamId === id),

  // Geography
  getStateById: (id: string): MasterState | undefined =>
    masterDataRegistry.states.find(s => s.stateId === id),

  getDistrictsByState: (stateId: string): MasterDistrict[] =>
    masterDataRegistry.districts.filter(d => d.stateId === stateId),

  getDistrictById: (id: string): MasterDistrict | undefined =>
    masterDataRegistry.districts.find(d => d.districtId === id),

  // Organizations
  getOrganizationById: (id: string): Organization | undefined =>
    masterDataRegistry.organizations.find(o => o.organizationId === id),

  getOrganizationsByType: (type: string): Organization[] =>
    masterDataRegistry.organizations.filter(o => o.organizationType === type),

  getNgos: (): Organization[] =>
    masterDataRegistry.organizations.filter(o => o.organizationType === 'NGO' || o.organizationType === 'TRUST' || o.organizationType === 'SOCIETY'),

  getInstitutions: (): Organization[] =>
    masterDataRegistry.organizations.filter(o => o.organizationType === 'INSTITUTION' || o.organizationType === 'TRAINING_INSTITUTION'),

  // Projects
  getProjectById: (id: string): MasterProject | undefined =>
    masterDataRegistry.projects.find(p => p.projectId === id || p.code === id),

  getProjectsByOrganization: (orgId: string): MasterProject[] =>
    masterDataRegistry.projects.filter(p => p.organizationId === orgId),

  getProjectsByScheme: (schemeId: string): MasterProject[] =>
    masterDataRegistry.projects.filter(p => p.schemeId === schemeId),

  getProjectsByDivision: (divisionId: string): MasterProject[] => {
    const schemeIds = masterDataRegistry.schemes
      .filter(s => s.divisionId === divisionId)
      .map(s => s.schemeId);
    return masterDataRegistry.projects.filter(
      p => p.divisionId === divisionId || (p.schemeId && schemeIds.includes(p.schemeId))
    );
  },

  getProjectsByState: (stateId: string): MasterProject[] =>
    masterDataRegistry.projects.filter(p => p.stateId === stateId),

  // Funding
  getFundingByProject: (projectId: string): MasterFunding | undefined =>
    masterDataRegistry.funding.find(f => f.projectId === projectId),

  getFundingByOrganization: (orgId: string): MasterFunding[] =>
    masterDataRegistry.funding.filter(f => f.organizationId === orgId),

  // Beneficiaries
  getBeneficiariesByProject: (projectId: string): MasterBeneficiarySummary | undefined =>
    masterDataRegistry.beneficiaries.find(b => b.projectId === projectId),

  // Inspections
  getInspectionById: (id: string): MasterInspection | undefined =>
    masterDataRegistry.inspections.find(i => i.inspectionId === id || i.id === id),

  getInspectionsByProject: (projectId: string): MasterInspection[] =>
    masterDataRegistry.inspections.filter(i => i.projectId === projectId),

  getInspectionsByInspector: (inspectorId: string): MasterInspection[] =>
    masterDataRegistry.inspections.filter(i => i.inspectorId === inspectorId),

  // Findings & Evidence
  getFindingsByInspection: (inspectionId: string): Finding[] =>
    masterDataRegistry.findings.filter(f => f.inspectionId === inspectionId),

  getEvidenceByInspection: (inspectionId: string): MasterEvidence[] =>
    masterDataRegistry.evidence.filter(e => e.inspectionId === inspectionId),

  // Anomalies & Risks
  getAnomaliesByProject: (projectId: string): MasterAnomaly[] =>
    masterDataRegistry.anomalies.filter(a => a.projectId === projectId),

  getAnomalyById: (id: string): MasterAnomaly | undefined =>
    masterDataRegistry.anomalies.find(a => a.anomalyId === id || a.id === id),

  getRiskScoreByEntity: (entityId: string): RiskScore | undefined =>
    masterDataRegistry.riskScores.find(r => r.entityId === entityId),

  getRecommendationsByEntity: (entityId: string): AIRecommendation[] =>
    masterDataRegistry.aiRecommendations.filter(r => r.targetEntityId === entityId),

  getSocialAuditsByProject: (projectId: string): SocialAudit[] =>
    masterDataRegistry.socialAudits.filter(s => s.projectId === projectId),

  // Notifications & Audit Logs
  getNotificationsByRole: (role: string): MasterNotification[] =>
    masterDataRegistry.notifications.filter(n => !n.role || n.role === role),

  getAuditLogsByEntity: (entityType: string, entityId: string): MasterAuditLog[] =>
    masterDataRegistry.auditLogs.filter(l => l.entityType === entityType && l.entityId === entityId),

  // Scheme & Division Extended Relationships
  getSchemeOrganizations: (schemeId: string): Organization[] => {
    const scheme = masterLookup.getSchemeById(schemeId);
    if (!scheme) return [];
    const projects = masterLookup.getProjectsByScheme(schemeId);
    const orgIdSet = new Set<string>([
      ...scheme.implementingOrganizationIds,
      ...projects.map(p => p.organizationId),
    ]);
    return masterDataRegistry.organizations.filter(o => orgIdSet.has(o.organizationId));
  },

  getDivisionOrganizations: (divisionId: string): Organization[] => {
    const division = masterLookup.getDivisionById(divisionId);
    const schemes = masterLookup.getSchemesByDivision(divisionId);
    const projects = masterLookup.getProjectsByDivision(divisionId);
    const orgIdSet = new Set<string>([
      ...(division?.organizationIds ?? []),
      ...schemes.flatMap(s => s.implementingOrganizationIds),
      ...projects.map(p => p.organizationId),
    ]);
    return masterDataRegistry.organizations.filter(o => orgIdSet.has(o.organizationId));
  },

  getSchemeInspections: (schemeId: string): MasterInspection[] => {
    const projects = masterLookup.getProjectsByScheme(schemeId);
    const projectIds = new Set(projects.map(p => p.projectId));
    return masterDataRegistry.inspections.filter(
      i => (i.schemeId && i.schemeId === schemeId) || projectIds.has(i.projectId)
    );
  },

  getDivisionInspections: (divisionId: string): MasterInspection[] => {
    const projects = masterLookup.getProjectsByDivision(divisionId);
    const projectIds = new Set(projects.map(p => p.projectId));
    return masterDataRegistry.inspections.filter(
      i => (i.divisionId && i.divisionId === divisionId) || projectIds.has(i.projectId)
    );
  },

  getSchemeAnomalies: (schemeId: string): MasterAnomaly[] => {
    const projects = masterLookup.getProjectsByScheme(schemeId);
    const projectIds = new Set(projects.map(p => p.projectId));
    return masterDataRegistry.anomalies.filter(
      a => (a.schemeId && a.schemeId === schemeId) || projectIds.has(a.projectId)
    );
  },

  getDivisionAnomalies: (divisionId: string): MasterAnomaly[] => {
    const projects = masterLookup.getProjectsByDivision(divisionId);
    const projectIds = new Set(projects.map(p => p.projectId));
    return masterDataRegistry.anomalies.filter(a => projectIds.has(a.projectId));
  },

  // Organization Extended Relationships
  getOrganizationProjects: (orgId: string): MasterProject[] =>
    masterDataRegistry.projects.filter(p => p.organizationId === orgId),

  getOrganizationSchemes: (orgId: string): Scheme[] => {
    const org = masterLookup.getOrganizationById(orgId);
    const projects = masterLookup.getProjectsByOrganization(orgId);
    const schemeIds = new Set<string>([
      ...(org?.schemeIds ?? []),
      ...(projects.map(p => p.schemeId).filter(Boolean) as string[]),
    ]);
    return masterDataRegistry.schemes.filter(s => schemeIds.has(s.schemeId));
  },

  getOrganizationInspections: (orgId: string): MasterInspection[] => {
    const org = masterLookup.getOrganizationById(orgId);
    const projects = masterLookup.getProjectsByOrganization(orgId);
    const projectIds = new Set(projects.map(p => p.projectId));
    const explicitIds = new Set(org?.inspectionIds ?? []);
    return masterDataRegistry.inspections.filter(
      i => explicitIds.has(i.inspectionId) || (i.id && explicitIds.has(i.id)) || (i.projectId && projectIds.has(i.projectId))
    );
  },

  getOrganizationFindings: (orgId: string): Finding[] => {
    const org = masterLookup.getOrganizationById(orgId);
    const inspections = masterLookup.getOrganizationInspections(orgId);
    const inspIds = new Set(inspections.map(i => i.inspectionId || i.id).filter(Boolean));
    const explicitIds = new Set(org?.findingIds ?? []);
    return masterDataRegistry.findings.filter(
      f => explicitIds.has(f.findingId) || (f.inspectionId && inspIds.has(f.inspectionId))
    );
  },

  getOrganizationEvidence: (orgId: string): MasterEvidence[] => {
    const inspections = masterLookup.getOrganizationInspections(orgId);
    const inspIds = new Set(inspections.map(i => i.inspectionId || i.id).filter(Boolean));
    return masterDataRegistry.evidence.filter(
      e => e.inspectionId && inspIds.has(e.inspectionId)
    );
  },

  getOrganizationAnomalies: (orgId: string): MasterAnomaly[] => {
    const org = masterLookup.getOrganizationById(orgId);
    const projects = masterLookup.getProjectsByOrganization(orgId);
    const projectIds = new Set(projects.map(p => p.projectId));
    const explicitIds = new Set(org?.anomalyIds ?? []);
    return masterDataRegistry.anomalies.filter(
      a => explicitIds.has(a.anomalyId) || (a.id && explicitIds.has(a.id)) || (a.projectId && projectIds.has(a.projectId))
    );
  },

  // Project Extended Relationships
  getProjectOrganization: (projectId: string): Organization | undefined => {
    const proj = masterLookup.getProjectById(projectId);
    return proj ? masterLookup.getOrganizationById(proj.organizationId) : undefined;
  },

  getProjectScheme: (projectId: string): Scheme | undefined => {
    const proj = masterLookup.getProjectById(projectId);
    return proj?.schemeId ? masterLookup.getSchemeById(proj.schemeId) : undefined;
  },

  getProjectDivision: (projectId: string): Division | undefined => {
    const proj = masterLookup.getProjectById(projectId);
    if (proj?.divisionId) return masterLookup.getDivisionById(proj.divisionId);
    if (proj?.schemeId) {
      const scheme = masterLookup.getSchemeById(proj.schemeId);
      if (scheme?.divisionId) return masterLookup.getDivisionById(scheme.divisionId);
    }
    return undefined;
  },

  getProjectEvidence: (projectId: string): MasterEvidence[] => {
    const inspections = masterLookup.getInspectionsByProject(projectId);
    const inspIds = new Set(inspections.map(i => i.inspectionId || i.id));
    return masterDataRegistry.evidence.filter(
      e => e.projectId === projectId || (e.inspectionId && inspIds.has(e.inspectionId))
    );
  },

  getProjectFindings: (projectId: string): Finding[] => {
    const inspections = masterLookup.getInspectionsByProject(projectId);
    const inspIds = new Set(inspections.map(i => i.inspectionId || i.id));
    return masterDataRegistry.findings.filter(
      f => (f as any).projectId === projectId || (f.inspectionId && inspIds.has(f.inspectionId))
    );
  },

  // Generic Filter Engine
  filterProjects: (criteria: FilterCriteria): MasterProject[] => {
    return masterDataRegistry.projects.filter(p => {
      if (criteria.search) {
        const query = criteria.search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCode = p.code ? p.code.toLowerCase().includes(query) : false;
        const matchesId = p.projectId.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesId) return false;
      }
      if (criteria.divisionId && p.divisionId !== criteria.divisionId) {
        const scheme = masterLookup.getSchemeById(p.schemeId);
        if (!scheme || scheme.divisionId !== criteria.divisionId) return false;
      }
      if (criteria.schemeId && p.schemeId !== criteria.schemeId) return false;
      if (criteria.stateId && p.stateId !== criteria.stateId) return false;
      if (criteria.districtId && p.districtId !== criteria.districtId) return false;
      if (criteria.projectStatus && p.projectStatus !== criteria.projectStatus) return false;
      if (criteria.priority && p.priority !== criteria.priority) return false;
      return true;
    });
  },
};
