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
  | 'Submitted / Awaiting Review'
  | 'Completed'
  | 'Pending Verification'
  | 'Scheduled';

export type ChecklistStatus = 'Not Checked' | 'Verified' | 'Needs Attention' | 'Not Applicable';

export type ChecklistCategory =
  | 'Project Operations'
  | 'Beneficiary Verification'
  | 'Infrastructure / Facility'
  | 'Records / Documentation';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  status: ChecklistStatus;
  notes?: string;
}

export interface InspectionFindings {
  overallObservation: string;
  keyFindings: string;
  issuesRequiringFollowUp: string;
  additionalRemarks: string;
}

export interface MockEvidenceItem {
  id: string;
  type: 'photo' | 'video' | 'document';
  category: 'Facility Entrance' | 'Attendance Register' | 'Service Delivery Area' | 'General Infrastructure';
  title: string;
  timestamp: string;
  locationStatus: 'Pending GPS integration';
  demoLabel: string;
}

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
  startedAt?: string;
  submittedAt?: string;
  submittedBy?: string;
  checklistResponses?: Record<string, ChecklistItem>;
  findings?: InspectionFindings;
  evidenceItems?: MockEvidenceItem[];
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
