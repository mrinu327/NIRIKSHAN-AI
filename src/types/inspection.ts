/**
 * Inspection Models for SIH26095
 */

import { PriorityLevel } from './project';
export type { PriorityLevel };

export type InspectionType = 'Routine Inspection' | 'Surprise Inspection' | 'Special Audit' | 'Follow-up';
export type InspectionStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Pending Verification' | 'Scheduled';

export interface InspectionAssignment {
  id: string;
  projectId: string;
  projectName: string;
  projectAddress: string;
  city: string;
  type: InspectionType;
  priority: PriorityLevel;
  status: InspectionStatus;
  assignedOfficerId: string;
  assignedOfficerName: string;
  assignedDate: string;
  dueDate: string;
  scheduledTime?: string;
  triggerReason?: string; // e.g., 'Triggered by discrepancy alert #ALT-1092'
  checklistCompletedCount?: number;
  totalChecklistCount?: number;
}
