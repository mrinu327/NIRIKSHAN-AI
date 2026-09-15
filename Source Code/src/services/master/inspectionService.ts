import {
  MasterInspection,
  Finding,
  MasterEvidence,
  SocialAudit,
  MasterAnomaly,
} from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';

export class MasterInspectionService {
  /**
   * Retrieve all inspections, optionally filtered by status or inspector
   */
  public async getInspections(filter?: {
    status?: string;
    inspectorId?: string;
    projectId?: string;
  }): Promise<MasterInspection[]> {
    let list = [...masterDataRegistry.inspections];
    if (filter?.status) {
      list = list.filter(i => i.inspectionStatus === filter.status || i.status === filter.status);
    }
    if (filter?.inspectorId) {
      list = list.filter(i => i.inspectorId === filter.inspectorId);
    }
    if (filter?.projectId) {
      list = list.filter(i => i.projectId === filter.projectId);
    }
    return list;
  }

  /**
   * Retrieve inspection by ID
   */
  public async getInspectionById(inspectionId: string): Promise<MasterInspection | undefined> {
    return masterLookup.getInspectionById(inspectionId);
  }

  /**
   * Retrieve findings for a specific inspection
   */
  public async getFindings(inspectionId: string): Promise<Finding[]> {
    return masterLookup.getFindingsByInspection(inspectionId);
  }

  /**
   * Retrieve evidence uploaded for a specific inspection
   */
  public async getEvidence(inspectionId: string): Promise<MasterEvidence[]> {
    return masterLookup.getEvidenceByInspection(inspectionId);
  }

  /**
   * Retrieve all anomalies associated with an inspection or its project
   */
  public async getAnomalies(projectId: string): Promise<MasterAnomaly[]> {
    return masterLookup.getAnomaliesByProject(projectId);
  }

  /**
   * Retrieve social audits for a project
   */
  public async getSocialAudits(projectId: string): Promise<SocialAudit[]> {
    return masterLookup.getSocialAuditsByProject(projectId);
  }
}

export const masterInspectionService = new MasterInspectionService();
