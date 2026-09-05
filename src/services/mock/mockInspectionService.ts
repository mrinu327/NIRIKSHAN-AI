/**
 * Mock Inspection Service
 * SIH26095 | MoSJE
 */

import { InspectionAssignment, InspectionType, PriorityLevel } from '../../types/inspection';
import { MOCK_INSPECTIONS, MOCK_INSPECTOR_STATS, MOCK_OFFICIAL_STATS } from '../../data/mockData';

export interface CreateInspectionParams {
  projectId: string;
  projectName: string;
  projectAddress: string;
  city: string;
  type?: InspectionType;
  priority?: PriorityLevel;
  triggerReason?: string;
  scheduledTime?: string;
}

export class MockInspectionService {
  private inspections: InspectionAssignment[] = [...MOCK_INSPECTIONS];

  async getAssignedInspections(officerId?: string): Promise<InspectionAssignment[]> {
    return [...this.inspections];
  }

  async getInspectorStats(officerId?: string) {
    return {
      ...MOCK_INSPECTOR_STATS,
      assignedInspections: this.inspections.length,
    };
  }

  async getInspectionById(id: string): Promise<InspectionAssignment | undefined> {
    return this.inspections.find((i) => i.id === id);
  }

  async getInspectionsByProjectId(projectId: string): Promise<InspectionAssignment[]> {
    return this.inspections.filter((i) => i.projectId === projectId);
  }

  async createInspectionRequest(params: CreateInspectionParams): Promise<InspectionAssignment> {
    const id = `INSP-${8800 + this.inspections.length + 1}`;
    const newInspection: InspectionAssignment = {
      id,
      projectId: params.projectId,
      projectName: params.projectName,
      projectAddress: params.projectAddress,
      city: params.city,
      type: params.type || 'Surprise Inspection',
      priority: params.priority || 'HIGH',
      status: 'Assigned',
      assignedOfficerId: 'USR-INSP-DEMO-02',
      assignedOfficerName: 'Demo PMU Inspector',
      assignedDate: 'Today, Just now',
      dueDate: 'Today, Within 4 Hours',
      scheduledTime: params.scheduledTime || 'Immediate PMU Dispatch',
      triggerReason: params.triggerReason || 'Official monitoring review escalation',
      checklistCompletedCount: 0,
      totalChecklistCount: 8,
    };

    // Prepend to top of inspection list so newly initiated inspections appear first!
    this.inspections.unshift(newInspection);
    MOCK_OFFICIAL_STATS.pendingInspectionsCount += 1;

    return newInspection;
  }

  async reset(): Promise<void> {
    this.inspections = [...MOCK_INSPECTIONS];
  }
}

export const mockInspectionService = new MockInspectionService();
