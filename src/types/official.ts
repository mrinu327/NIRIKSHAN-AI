/**
 * Official Workflow Domain Types
 * SIH26095 | MoSJE Government Official Monitoring Division
 */

import { InspectionType, PriorityLevel, InspectionAssignment } from './inspection';
import { Project } from './project';
import { AnomalyAlert } from './alert';

export type ProjectOperationalRisk = 'HEALTHY' | 'ATTENTION_REQUIRED' | 'CRITICAL';

export interface GeofenceTelemetry {
  projectId: string;
  latitude: number;
  longitude: number;
  perimeterRadiusMeters: number; // Configured boundary (e.g. 100m)
  status: 'Inside Perimeter' | 'Boundary Warning' | 'Outside Perimeter';
  distanceFromCenterMeters: number;
  distanceFromBoundaryMeters: number;
  lastUpdated: string;
  source: 'GPS / Cellular Edge Gateway';
}

export interface ComplianceComponentBreakdown {
  attendanceScore: number; // e.g. 84
  cctvStatus: 'Synchronized' | 'Flagged Discrepancy' | 'Offline';
  inspectionStanding: 'Up to Date' | 'Due' | 'Overdue';
  geofenceIntegrity: 'Compliant' | 'Violation Detected';
  overallScore: number; // e.g. 71 / 100
}

export interface OfficialProjectDetail extends Project {
  riskLevel: ProjectOperationalRisk;
  geofence: GeofenceTelemetry;
  complianceBreakdown: ComplianceComponentBreakdown;
  recentActivity: OfficialActivityItem[];
}

export interface OfficialActivityItem {
  id: string;
  projectId: string;
  type: 'INSPECTION' | 'ALERT' | 'ATTENDANCE_SUBMISSION' | 'OFFICIAL_NOTICE' | 'STATUS_CHANGE';
  title: string;
  timestamp: string;
  status: string;
  notes?: string;
  referenceId?: string;
}

export interface OfficialDashboardMetrics {
  totalProjects: number;
  totalNgos: number;
  activeAlertsCount: number;
  pendingAlerts?: number;
  activeInspections?: number;
  inspectionsInProgressCount: number;
  pendingInspectionsCount: number;
  completedInspectionsCount: number;
  surpriseInspectionsCount: number;
  overallComplianceAverage: number;
  
  // Risk distributions
  healthyProjectsCount: number;
  attentionProjectsCount: number;
  criticalProjectsCount: number;

  // CCTV subsystem summary
  cctvOnlineCount: number;
  cctvTotalCount: number;
  cctvOfflineCount: number;
  cctvDiscrepancyCount: number;
}

export interface SurpriseDispatchParams {
  projectId: string;
  projectName?: string;
  projectAddress?: string;
  city?: string;
  priority: PriorityLevel;
  reason: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerDemoId?: string;
  assignedInspector?: string;
  authorizingOfficial: string;
  scheduledTime?: string;
}

export interface RoutineInspectionScheduleParams {
  projectId: string;
  projectName?: string;
  projectAddress?: string;
  city?: string;
  type: InspectionType;
  priority: PriorityLevel;
  instructions?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerDemoId?: string;
  assignedInspector?: string;
  reason?: string;
  scheduledDate: string;
  authorizingOfficial: string;
}

export interface InspectionHistoryFilter {
  query?: string;
  typeFilter?: 'ALL' | 'Routine' | 'Surprise' | 'Special Audit';
  statusFilter?: 'ALL' | 'Completed' | 'In Progress' | 'Submitted / Awaiting Review';
}
