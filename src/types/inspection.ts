/**
 * Inspection Models for SIH26095
 */

import { PriorityLevel } from './project';
export type { PriorityLevel };

export type InspectionType = 'Routine Inspection' | 'Surprise Inspection' | 'Special Audit' | 'Follow-up';
export type InspectionStatus =
  | 'Awaiting Assignment'
  | 'Assigned'
  | 'Accepted / Acknowledged'
  | 'In Progress'
  | 'Completed'
  | 'Pending Verification'
  | 'Scheduled';

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
  assignedOfficerDemoId?: string;
  assignmentMethod?: string; // e.g., 'Automated Random Selection'
  assignmentTimestamp?: string;
  eligibleInspectorsCount?: number;
  assignedDate: string;
  dueDate: string;
  scheduledTime?: string;
  triggerReason?: string; // e.g., 'Triggered by discrepancy alert #ALT-1092'
  checklistCompletedCount?: number;
  totalChecklistCount?: number;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface DemoInspector {
  id: string; // e.g. 'USR-INSP-DEMO-004'
  name: string; // e.g. 'Demo Field Inspector A'
  demoId: string; // e.g. 'PMU-DEMO-004'
  designation: string;
  department: string;
  organization: string;
  assignedLocation: string;
  jurisdiction: string;
  active: boolean;
  currentAssignmentCount: number;
  contactEmail: string;
}

export interface AssignmentAuditRecord {
  inspectionId: string;
  selectedInspectorId: string;
  selectedInspectorName: string;
  selectedInspectorDemoId: string;
  assignmentTimestamp: string;
  assignmentMethod: 'Automated Random Selection';
  eligibleInspectorCount: number;
  explanation: string;
}
