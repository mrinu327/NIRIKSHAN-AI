/**
 * Anomaly Service
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Authoritative master service for querying, searching, filtering,
 * correlating, and summarizing observable anomaly intelligence.
 */

import {
  MasterAnomaly,
  AnomalyFilterCriteria,
  AnomalySummary,
  MasterEvidence,
  AnomalySeverityLevel,
} from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';
import { anomalyDetectionEngine } from '../analytics/anomalyDetectionEngine';

export class AnomalyService {
  /**
   * Explicit filter alias for compatibility with test assertions
   */
  public async filterAnomalies(criteria: AnomalyFilterCriteria): Promise<MasterAnomaly[]> {
    return this.getAnomalies(criteria);
  }

  /**
   * Retrieves anomalies, optionally filtered by criteria.
   */
  public async getAnomalies(criteria?: AnomalyFilterCriteria): Promise<MasterAnomaly[]> {
    const all = anomalyDetectionEngine.detectAllAnomalies();
    if (!criteria) return all;

    let filtered = [...all];

    if (criteria.searchQuery || criteria.search) {
      const q = (criteria.searchQuery || criteria.search || '').toLowerCase().trim();
      filtered = filtered.filter(a => {
        const idMatch = a.anomalyId.toLowerCase().includes(q) || (a.id && a.id.toLowerCase().includes(q));
        const titleMatch = a.title ? a.title.toLowerCase().includes(q) : false;
        const descMatch = (a.description ? a.description.toLowerCase().includes(q) : false) ||
          (a.explanation ? a.explanation.toLowerCase().includes(q) : false);
        const typeMatch = a.type ? a.type.toLowerCase().includes(q) : false;
        const proj = masterLookup.getProjectById(a.projectId);
        const org = masterLookup.getOrganizationById(a.organizationId);
        const projMatch = proj ? proj.name.toLowerCase().includes(q) || (proj.projectCode && proj.projectCode.toLowerCase().includes(q)) : false;
        const orgMatch = org ? org.name.toLowerCase().includes(q) : false;

        return idMatch || titleMatch || descMatch || typeMatch || projMatch || orgMatch;
      });
    }

    if (criteria.severity && criteria.severity !== 'ALL') {
      filtered = filtered.filter(a => a.severity.toUpperCase() === criteria.severity!.toUpperCase());
    }

    if (criteria.type && criteria.type !== 'ALL') {
      filtered = filtered.filter(a => a.type === criteria.type);
    }

    if (criteria.status && criteria.status !== 'ALL') {
      filtered = filtered.filter(a => a.status === criteria.status);
    }

    if (criteria.projectId) {
      filtered = filtered.filter(a => a.projectId === criteria.projectId);
    }

    if (criteria.organizationId) {
      filtered = filtered.filter(a => a.organizationId === criteria.organizationId);
    }

    if (criteria.schemeId) {
      filtered = filtered.filter(a => a.schemeId === criteria.schemeId);
    }

    if (criteria.divisionId) {
      filtered = filtered.filter(a => a.divisionId === criteria.divisionId);
    }

    return filtered;
  }

  /**
   * Retrieves an anomaly by its unique ID.
   */
  public async getAnomalyById(id: string): Promise<MasterAnomaly | undefined> {
    const all = anomalyDetectionEngine.detectAllAnomalies();
    return all.find(a => a.anomalyId === id || a.id === id);
  }

  /**
   * Retrieves anomalies for a specific project.
   */
  public async getAnomaliesByProject(projectId: string): Promise<MasterAnomaly[]> {
    return anomalyDetectionEngine.detectProjectAnomalies(projectId);
  }

  /**
   * Retrieves anomalies for an organization across its projects.
   */
  public async getAnomaliesByOrganization(organizationId: string): Promise<MasterAnomaly[]> {
    return anomalyDetectionEngine.detectOrganizationAnomalies(organizationId);
  }

  /**
   * Retrieves anomalies under a scheme.
   */
  public async getAnomaliesByScheme(schemeId: string): Promise<MasterAnomaly[]> {
    return anomalyDetectionEngine.detectSchemeAnomalies(schemeId);
  }

  /**
   * Retrieves anomalies under an administrative division.
   */
  public async getAnomaliesByDivision(divisionId: string): Promise<MasterAnomaly[]> {
    return anomalyDetectionEngine.detectDivisionAnomalies(divisionId);
  }

  /**
   * Retrieves anomalies filtered by severity level.
   */
  public async getAnomaliesBySeverity(severity: string): Promise<MasterAnomaly[]> {
    const all = anomalyDetectionEngine.detectAllAnomalies();
    return all.filter(a => a.severity.toUpperCase() === severity.toUpperCase());
  }

  /**
   * Retrieves anomalies filtered by controlled type.
   */
  public async getAnomaliesByType(type: string): Promise<MasterAnomaly[]> {
    const all = anomalyDetectionEngine.detectAllAnomalies();
    return all.filter(a => a.type === type);
  }

  /**
   * Retrieves anomalies filtered by review status.
   */
  public async getAnomaliesByStatus(status: string): Promise<MasterAnomaly[]> {
    const all = anomalyDetectionEngine.detectAllAnomalies();
    return all.filter(a => a.status === status);
  }

  /**
   * Searches anomalies across IDs, titles, descriptions, project, and organization names.
   */
  public async searchAnomalies(query: string): Promise<MasterAnomaly[]> {
    return this.getAnomalies({ searchQuery: query });
  }

  /**
   * Retrieves correlated anomalies for a specific anomaly.
   */
  public async getCorrelatedAnomalies(anomalyId: string): Promise<MasterAnomaly[]> {
    const target = await this.getAnomalyById(anomalyId);
    if (!target) return [];

    const all = anomalyDetectionEngine.detectAllAnomalies();
    return all.filter(
      a =>
        a.anomalyId !== anomalyId &&
        (target.relatedAnomalyIds?.includes(a.anomalyId) ||
          a.projectId === target.projectId ||
          a.organizationId === target.organizationId ||
          a.type === target.type)
    );
  }

  /**
   * Retrieves evidence records linked to an anomaly.
   */
  public async getAnomalyEvidence(anomalyId: string): Promise<MasterEvidence[]> {
    const anom = await this.getAnomalyById(anomalyId);
    if (!anom || !anom.evidenceIds || anom.evidenceIds.length === 0) {
      return [];
    }

    return masterDataRegistry.evidence.filter(e => anom.evidenceIds!.includes(e.evidenceId));
  }

  /**
   * Generates summary statistics and counts for anomalies.
   */
  public async getAnomalySummary(scope?: {
    divisionId?: string;
    schemeId?: string;
    organizationId?: string;
    projectId?: string;
  }): Promise<AnomalySummary> {
    let anomalies = anomalyDetectionEngine.detectAllAnomalies();

    if (scope?.projectId) {
      anomalies = anomalies.filter(a => a.projectId === scope.projectId);
    } else if (scope?.organizationId) {
      anomalies = anomalies.filter(a => a.organizationId === scope.organizationId);
    } else if (scope?.schemeId) {
      anomalies = anomalies.filter(a => a.schemeId === scope.schemeId);
    } else if (scope?.divisionId) {
      anomalies = anomalies.filter(a => a.divisionId === scope.divisionId);
    }

    const byType: Record<string, number> = {};
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let requiresReview = 0;

    for (const a of anomalies) {
      byType[a.type] = (byType[a.type] || 0) + 1;

      const sev = a.severity.toUpperCase();
      if (sev === 'CRITICAL') critical++;
      else if (sev === 'HIGH') high++;
      else if (sev === 'MEDIUM' || sev === 'MODERATE') medium++;
      else low++;

      if (a.status === 'OPEN' || a.status === 'PENDING_REVIEW' || a.status === 'ESCALATED') {
        requiresReview++;
      }
    }

    return {
      total: anomalies.length,
      critical,
      high,
      medium,
      low,
      requiresReview,
      byType,
    };
  }
}

export const anomalyService = new AnomalyService();
