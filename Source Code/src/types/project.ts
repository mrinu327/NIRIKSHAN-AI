/**
 * Project / Institute Model for SIH26095
 */

export type ProjectStatus = 'Normal' | 'High Priority' | 'Inspection Due' | 'Under Review' | 'Compliant';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
export type CCTVStatus = 'Online' | 'Offline' | 'Intermittent' | 'Discrepancy Detected';

export interface Project {
  id: string;
  name: string;
  code: string;
  category: 'Rehabilitation' | 'Skill Development' | 'Special Care' | 'Welfare Hostel' | 'Community Support';
  location: {
    city: string;
    state: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: ProjectStatus;
  priority: PriorityLevel;
  attendance: {
    present: number;
    capacity: number;
    submittedAt?: string;
    status: 'Submitted' | 'Pending' | 'Flagged' | 'Verified';
  };
  cctvStatus: CCTVStatus;
  lastInspectionDate?: string;
  nextInspectionDueDate?: string;
  assignedOfficer?: string;
  complianceScore: number; // 0-100
  notes?: string;
}

export interface ProjectStatsSummary {
  totalProjects: number;
  highPriorityCount: number;
  pendingInspectionsCount: number;
  activeCCTVCount: number;
  totalAlertsCount: number;
  criticalComplianceCount?: number;
  totalBeneficiariesCount?: number;
  averageAttendanceRate?: number;
}
