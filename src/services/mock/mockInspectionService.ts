/**
 * Mock Inspection Service
 * SIH26095 | MoSJE
 */

import {
  InspectionAssignment,
  InspectionType,
  PriorityLevel,
  ChecklistItem,
  InspectionFindings,
  MockEvidenceItem,
} from '../../types/inspection';
import { MOCK_INSPECTIONS, MOCK_INSPECTOR_STATS, MOCK_OFFICIAL_STATS } from '../../data/mockData';

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  // A. Project Operations
  {
    id: 'chk-op-1',
    category: 'Project Operations',
    title: 'Project / institute is operational',
    description: 'Facility is open, functioning, and actively engaged in MoSJE mandate.',
    status: 'Not Checked',
  },
  {
    id: 'chk-op-2',
    category: 'Project Operations',
    title: 'Services are being provided',
    description: 'Authorized rehabilitation, vocational, or care services are actively being delivered to beneficiaries.',
    status: 'Not Checked',
  },
  {
    id: 'chk-op-3',
    category: 'Project Operations',
    title: 'Staff are present',
    description: 'Required administrative, medical, teaching, or caretaking staff are on-site.',
    status: 'Not Checked',
  },
  {
    id: 'chk-op-4',
    category: 'Project Operations',
    title: 'Beneficiary activity is observable',
    description: 'Enrolled beneficiaries are engaged in scheduled daily activities, therapy, or classrooms.',
    status: 'Not Checked',
  },

  // B. Beneficiary Verification
  {
    id: 'chk-ben-1',
    category: 'Beneficiary Verification',
    title: 'Beneficiary records are available for verification',
    description: 'Physical or digital beneficiary identity rosters are accessible for audit.',
    status: 'Not Checked',
  },
  {
    id: 'chk-ben-2',
    category: 'Beneficiary Verification',
    title: 'Reported beneficiary count can be cross-checked',
    description: 'Physical headcount can be reconciled against the daily reported attendance submission.',
    status: 'Not Checked',
  },
  {
    id: 'chk-ben-3',
    category: 'Beneficiary Verification',
    title: 'Observed beneficiary activity is consistent with reported information',
    description: 'Activities observed correspond directly with sanctioned project category.',
    status: 'Not Checked',
  },

  // C. Infrastructure / Facility
  {
    id: 'chk-inf-1',
    category: 'Infrastructure / Facility',
    title: 'Facility is accessible',
    description: 'Physical premises location matches registered institutional area and ingress/egress is unobstructed.',
    status: 'Not Checked',
  },
  {
    id: 'chk-inf-2',
    category: 'Infrastructure / Facility',
    title: 'Required facilities are available',
    description: 'Mandatory amenities including clean drinking water, barrier-free access, and sanitation are present.',
    status: 'Not Checked',
  },
  {
    id: 'chk-inf-3',
    category: 'Infrastructure / Facility',
    title: 'Basic infrastructure appears operational',
    description: 'Power backup, ventilation, fire safety equipment, and CCTV edge hardware appear operational.',
    status: 'Not Checked',
  },

  // D. Records / Documentation
  {
    id: 'chk-rec-1',
    category: 'Records / Documentation',
    title: 'Attendance / beneficiary records available',
    description: 'Daily biometric logs or physical sign-in registers are available for inspection.',
    status: 'Not Checked',
  },
  {
    id: 'chk-rec-2',
    category: 'Records / Documentation',
    title: 'Relevant registers / documents available',
    description: 'Staff attendance register, visitor logs, and daily medical logs are maintained up to date.',
    status: 'Not Checked',
  },
  {
    id: 'chk-rec-3',
    category: 'Records / Documentation',
    title: 'Required project records available for inspection',
    description: 'Sanction order, expenditure vouchers, and meal schedule registers available on request.',
    status: 'Not Checked',
  },
];

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
      totalChecklistCount: DEFAULT_CHECKLIST_ITEMS.length,
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

    const acknowledgedAt =
      new Date().toLocaleTimeString('en-IN', {
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

  async getChecklistTemplate(inspectionId: string): Promise<ChecklistItem[]> {
    const inspection = await this.getInspectionById(inspectionId);
    if (inspection?.checklistResponses) {
      return Object.values(inspection.checklistResponses);
    }
    return DEFAULT_CHECKLIST_ITEMS.map((item) => ({ ...item }));
  }

  async startInspection(id: string): Promise<InspectionAssignment | undefined> {
    const index = this.inspections.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    const startedAt =
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' Today';

    // If no responses initialized yet, populate with default checklist template
    const responses: Record<string, ChecklistItem> =
      this.inspections[index].checklistResponses ||
      DEFAULT_CHECKLIST_ITEMS.reduce((acc, item) => {
        acc[item.id] = { ...item };
        return acc;
      }, {} as Record<string, ChecklistItem>);

    this.inspections[index] = {
      ...this.inspections[index],
      status: 'In Progress',
      startedAt: this.inspections[index].startedAt || startedAt,
      checklistResponses: responses,
      totalChecklistCount: DEFAULT_CHECKLIST_ITEMS.length,
    };

    return this.inspections[index];
  }

  async saveInspectionDraft(
    id: string,
    draft: Partial<InspectionAssignment>
  ): Promise<InspectionAssignment | undefined> {
    const index = this.inspections.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    let completedCount = this.inspections[index].checklistCompletedCount || 0;
    if (draft.checklistResponses) {
      completedCount = Object.values(draft.checklistResponses).filter(
        (item) => item.status !== 'Not Checked'
      ).length;
    }

    this.inspections[index] = {
      ...this.inspections[index],
      ...draft,
      checklistCompletedCount: completedCount,
    };

    return this.inspections[index];
  }

  async submitInspection(
    id: string,
    data: {
      checklistResponses: Record<string, ChecklistItem>;
      findings: InspectionFindings;
      evidenceItems: MockEvidenceItem[];
      submittedBy: string;
      officerDemoId?: string;
    }
  ): Promise<InspectionAssignment | undefined> {
    const index = this.inspections.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    const submittedAt =
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' Today';

    const completedCount = Object.values(data.checklistResponses).filter(
      (item) => item.status !== 'Not Checked'
    ).length;

    this.inspections[index] = {
      ...this.inspections[index],
      status: 'Submitted / Awaiting Review',
      submittedAt,
      submittedBy: `${data.submittedBy}${data.officerDemoId ? ` (${data.officerDemoId})` : ''}`,
      checklistResponses: data.checklistResponses,
      findings: data.findings,
      evidenceItems: data.evidenceItems,
      checklistCompletedCount: completedCount,
      totalChecklistCount: DEFAULT_CHECKLIST_ITEMS.length,
    };

    return this.inspections[index];
  }

  async reset(): Promise<void> {
    this.inspections = [...MOCK_INSPECTIONS];
  }
}

export const mockInspectionService = new MockInspectionService();
