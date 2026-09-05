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
    if (!officerId) {
      return [...this.inspections];
    }
    // Filter for the specified officer (by user ID or demo badge ID)
    return this.inspections.filter(
      (i) => i.assignedOfficerId === officerId || i.assignedOfficerDemoId === officerId
    );
  }

  async getAllInspections(): Promise<InspectionAssignment[]> {
    return [...this.inspections];
  }

  async getInspectorStats(officerId?: string) {
    const officerInspections = officerId
      ? this.inspections.filter(
          (i) => i.assignedOfficerId === officerId || i.assignedOfficerDemoId === officerId
        )
      : this.inspections;

    return {
      assignedInspections: officerInspections.length,
      todaysTasks: officerInspections.filter((i) => i.dueDate.toLowerCase().includes('today')).length,
      highPriority: officerInspections.filter((i) => i.priority === 'HIGH').length,
      completedThisMonth: MOCK_INSPECTOR_STATS.completedThisMonth,
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
      status: 'Awaiting Assignment',
      assignedOfficerId: '',
      assignedOfficerName: 'Unassigned (Awaiting Automated Selection)',
      assignedOfficerDemoId: undefined,
      assignmentMethod: undefined,
      assignmentTimestamp: undefined,
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

  async updateInspectionAssignment(
    id: string,
    updateData: Partial<InspectionAssignment>
  ): Promise<InspectionAssignment | undefined> {
    const index = this.inspections.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    this.inspections[index] = {
      ...this.inspections[index],
      ...updateData,
    };
    return this.inspections[index];
  }

  async acknowledgeInspection(
    id: string,
    officerId: string,
    officerName: string,
    officerDemoId?: string
  ): Promise<InspectionAssignment | undefined> {
    const index = this.inspections.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    const acknowledgedAt = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' Today';

    this.inspections[index] = {
      ...this.inspections[index],
      status: 'Accepted / Acknowledged',
      acknowledgedAt,
      acknowledgedBy: `${officerName}${officerDemoId ? ` (${officerDemoId})` : ''}`,
    };

    return this.inspections[index];
  }

  async reset(): Promise<void> {
    this.inspections = [...MOCK_INSPECTIONS];
  }
}

export const mockInspectionService = new MockInspectionService();
