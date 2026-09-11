/**
 * Mock Official Service
 * SIH26095 | MoSJE Government Official Monitoring Division
 *
 * Central reactive coordination layer for:
 * - Official dashboard operational metrics
 * - Multi-project telemetry & risk monitoring
 * - Alert triage and escalation lifecycle
 * - Automated and manual inspection dispatch (Routine & Surprise)
 * - Geofence status oversight
 * - Historical inspection archive
 */

import {
  OfficialDashboardMetrics,
  OfficialProjectDetail,
  GeofenceTelemetry,
  SurpriseDispatchParams,
  RoutineInspectionScheduleParams,
  InspectionHistoryFilter,
  OfficialActivityItem,
  ProjectOperationalRisk,
} from '../../types/official';
import { Project } from '../../types/project';
import { AnomalyAlert } from '../../types/alert';
import { InspectionAssignment } from '../../types/inspection';
import { mockProjectService } from './mockProjectService';
import { mockAlertService } from './mockAlertService';
import { mockInspectionService } from './mockInspectionService';
import { mockAssignmentService } from './mockAssignmentService';
import { mockCCTVService } from './mockCCTVService';
import { mockAttendanceService } from './mockAttendanceService';
import { mockNgoService } from './mockNgoService';

export class MockOfficialService {

  private listeners: Array<() => void> = [];
  private extraActivities: Map<string, OfficialActivityItem[]> = new Map();

  constructor() {
    // Initial activity log items for demo projects
    this.extraActivities.set('PRJ-101', [
      {
        id: 'ACT-01',
        projectId: 'PRJ-101',
        type: 'ALERT',
        title: 'CCTV Telemetry Discrepancy Flagged',
        timestamp: 'Today, 10:14 AM',
        status: 'Action Required',
        notes: 'Submitted attendance (42) differs from entrance camera count (25). Variance: 17.',
        referenceId: 'ALT-2601',
      },
      {
        id: 'ACT-02',
        projectId: 'PRJ-101',
        type: 'ATTENDANCE_SUBMISSION',
        title: 'Morning Roll-Call Register Submitted',
        timestamp: 'Today, 09:28 AM',
        status: 'Submitted',
        notes: '42 / 50 Present (84% Turnout). Synced via Biometric Terminal BIO-01.',
      },
      {
        id: 'ACT-03',
        projectId: 'PRJ-101',
        type: 'INSPECTION',
        title: 'Quarterly Physical Audit Completed',
        timestamp: '12 Jan 2026',
        status: 'Completed',
        notes: 'DDRS compliance verified with satisfactory hygiene and food standards.',
        referenceId: 'INSP-8803',
      },
    ]);
  }

  // ==========================================
  // PUB / SUB REACTIVITY
  // ==========================================
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Official service listener error:', err);
      }
    });
  }

  // ==========================================
  // DASHBOARD OPERATIONAL METRICS
  // ==========================================
  async getDashboardMetrics(): Promise<OfficialDashboardMetrics> {
    const [projects, alerts, inspections, cctv] = await Promise.all([
      mockProjectService.getProjects(),
      mockAlertService.getAllAlerts(),
      mockInspectionService.getAllInspections(),
      mockCCTVService.getOverallCCTVStatus(),
    ]);

    const activeAlerts = alerts.filter(
      (a) => a.status === 'Pending Review' || a.status === 'Under Investigation'
    );

    const pendingInspections = inspections.filter(
      (i) => i.status === 'Awaiting Assignment' || i.status === 'Assigned'
    );
    const inProgressInspections = inspections.filter((i) => i.status === 'In Progress');
    const completedInspections = inspections.filter(
      (i) => i.status === 'Completed' || i.status.includes('Submitted')
    );
    const surpriseInspections = inspections.filter((i) => i.type === 'Surprise Inspection');

    // Risk distributions
    let healthyCount = 0;
    let attentionCount = 0;
    let criticalCount = 0;
    let complianceSum = 0;

    projects.forEach((p) => {
      complianceSum += p.complianceScore;
      if (p.priority === 'HIGH' || p.cctvStatus === 'Offline' || p.complianceScore < 70) {
        criticalCount++;
      } else if (p.priority === 'MEDIUM' || p.cctvStatus === 'Discrepancy Detected' || p.complianceScore < 85) {
        attentionCount++;
      } else {
        healthyCount++;
      }
    });

    const overallAvg = projects.length > 0 ? Math.round(complianceSum / projects.length) : 84;

    return {
      totalProjects: projects.length,
      totalNgos: projects.length, // Each project maps to a registered implementing NGO/institute
      activeAlertsCount: activeAlerts.length,
      inspectionsInProgressCount: inProgressInspections.length,
      pendingInspectionsCount: pendingInspections.length,
      completedInspectionsCount: completedInspections.length,
      surpriseInspectionsCount: surpriseInspections.length,
      overallComplianceAverage: overallAvg,
      healthyProjectsCount: healthyCount,
      attentionProjectsCount: attentionCount,
      criticalProjectsCount: criticalCount,
      pendingAlerts: activeAlerts.length,
      activeInspections: inProgressInspections.length + pendingInspections.length,
      cctvOnlineCount: cctv.online,
      cctvTotalCount: cctv.total,
      cctvOfflineCount: cctv.offline,
      cctvDiscrepancyCount: projects.filter((p) => p.cctvStatus === 'Discrepancy Detected').length,
    };
  }

  // ==========================================
  // PROJECT & NGO MONITORING
  // ==========================================
  async getProjects(): Promise<Project[]> {
    return mockProjectService.getProjects();
  }

  async getOfficialProjectDetail(projectId: string): Promise<OfficialProjectDetail | undefined> {
    const project = await mockProjectService.getProjectById(projectId);
    if (!project) return undefined;

    // Determine operational risk level
    let riskLevel: ProjectOperationalRisk = 'HEALTHY';
    if (project.priority === 'HIGH' || project.cctvStatus === 'Offline' || project.complianceScore < 70) {
      riskLevel = 'CRITICAL';
    } else if (project.priority === 'MEDIUM' || project.cctvStatus === 'Discrepancy Detected' || project.complianceScore < 85) {
      riskLevel = 'ATTENTION_REQUIRED';
    }

    // Geofence Telemetry (Enforcing standard 100m perimeter)
    const geofence: GeofenceTelemetry = {
      projectId: project.id,
      latitude: project.id === 'PRJ-101' ? 28.7041 : 18.5204,
      longitude: project.id === 'PRJ-101' ? 77.1025 : 73.8567,
      perimeterRadiusMeters: 100, // 100m government compliance boundary
      status: 'Inside Perimeter',
      distanceFromCenterMeters: project.id === 'PRJ-101' ? 24 : 12,
      distanceFromBoundaryMeters: project.id === 'PRJ-101' ? 76 : 88,
      lastUpdated: '09:30 AM Today',
      source: 'GPS / Cellular Edge Gateway',
    };

    // Component Compliance Breakdown
    const complianceBreakdown = {
      attendanceScore: Math.round((project.attendance.present / project.attendance.capacity) * 100),
      cctvStatus:
        project.cctvStatus === 'Online'
          ? ('Synchronized' as const)
          : project.cctvStatus === 'Offline'
          ? ('Offline' as const)
          : ('Flagged Discrepancy' as const),
      inspectionStanding:
        project.status === 'Inspection Due'
          ? ('Due' as const)
          : project.lastInspectionDate?.includes('2025')
          ? ('Overdue' as const)
          : ('Up to Date' as const),
      geofenceIntegrity: 'Compliant' as const,
      overallScore: project.complianceScore,
    };

    // Activity ledger
    const projectActivities = this.extraActivities.get(projectId) || [];

    return {
      ...project,
      riskLevel,
      geofence,
      complianceBreakdown,
      recentActivity: projectActivities,
    };
  }

  // ==========================================
  // ALERT REVIEW & TRIAGE ACTIONS
  // ==========================================
  async getAllAlerts(): Promise<AnomalyAlert[]> {
    return mockAlertService.getAllAlerts();
  }

  async getAlertById(alertId: string): Promise<AnomalyAlert | undefined> {
    return mockAlertService.getAlertById(alertId);
  }

  async acknowledgeAlert(alertId: string, notes?: string): Promise<boolean> {
    const success = await mockAlertService.acknowledgeAlert(alertId, notes);
    if (success) {
      if (alertId === 'ALT-2601') {
        mockNgoService.addOfficialNotice({
          title: 'Official Acknowledgment: Discrepancy Alert Verified',
          description: `Discrepancy alert #ALT-2601 has been reviewed and acknowledged by Central Desk (${notes || 'Official verification in progress'}).`,
          referenceId: alertId,
          projectId: 'PRJ-101',
        });
      }
      this.notify();
    }
    return success;
  }

  async markUnderInvestigation(alertId: string, notes?: string): Promise<AnomalyAlert | undefined> {
    const alert = await mockAlertService.markForFollowUp(alertId, notes);
    if (alertId === 'ALT-2601') {
      mockNgoService.addOfficialNotice({
        title: 'Status Update: Variance Case Under Investigation',
        description: `Central Monitoring Wing has placed disparity case #ALT-2601 under formal PMU investigation (${notes || 'Review in progress'}).`,
        referenceId: alertId,
        projectId: 'PRJ-101',
      });
    }
    this.notify();
    return alert;
  }


  async dismissAlert(alertId: string, notes?: string): Promise<AnomalyAlert | undefined> {
    const alert = await mockAlertService.dismissAlert(alertId, notes);
    this.notify();
    return alert;
  }

  async escalateAlert(alertId: string, notes?: string): Promise<AnomalyAlert | undefined> {
    const alert = await mockAlertService.getAlertById(alertId);
    if (alert) {
      alert.status = 'Escalated' as any;
      alert.reviewedBy = 'Dr. Rajesh Kumar, IAS (Central Desk)';
      alert.reviewedAt = 'Today (Escalated for immediate field audit)';
      this.notify();
    }
    return alert;
  }

  // ==========================================
  // INSPECTION DISPATCH & OVERSIGHT
  // ==========================================
  async getAllInspections(): Promise<InspectionAssignment[]> {
    return mockInspectionService.getAllInspections();
  }

  async dispatchSurpriseInspection(params: SurpriseDispatchParams): Promise<InspectionAssignment> {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const project = await mockProjectService.getProjectById(params.projectId);
    const projectName = params.projectName || project?.name || 'Selected Facility';
    const projectAddress = params.projectAddress || project?.location.address || 'District Facility Office';
    const city = params.city || project?.location.city || 'Delhi';

    let assignedId = params.assignedOfficerId || '';
    let assignedName = params.assignedInspector || params.assignedOfficerName || '';
    let assignedDemoId = params.assignedOfficerDemoId;
    let assignmentMethod = assignedName ? 'Official Direct Selection' : 'Automated Random Selection (Anti-Collusion Protocol)';

    // If no specific inspector was picked, trigger automated random assignment
    if (!assignedName) {
      const eligible = await mockAssignmentService.getEligibleInspectors();
      if (eligible.length > 0) {
        const rand = eligible[Math.floor(Math.random() * eligible.length)];
        assignedId = rand.id;
        assignedName = rand.name;
        assignedDemoId = rand.demoId;
        assignmentMethod = 'Automated Random Selection (Anti-Collusion Protocol)';
      }
    }

    const created = await mockInspectionService.createInspectionRequest({
      projectId: params.projectId,
      projectName,
      projectAddress,
      city,
      type: 'Surprise Inspection',
      priority: params.priority,
      triggerReason: `⚡ SURPRISE INSPECTION: ${params.reason} [Authorized by ${params.authorizingOfficial} at ${timeStr}]`,
      scheduledTime: params.scheduledTime || 'Immediate PMU Dispatch (Within 2 Hours)',
    });

    // Update assignment details
    if (assignedId || assignedName) {
      await mockInspectionService.updateInspectionAssignment(created.id, {
        status: 'Assigned',
        assignedOfficerId: assignedId,
        assignedOfficerName: assignedName,
        assignedOfficerDemoId: assignedDemoId,
        assignmentMethod,
        assignmentTimestamp: `${timeStr} Today`,
      });
      created.status = 'Assigned';
      created.assignedOfficerId = assignedId;
      created.assignedOfficerName = assignedName;
      created.assignedOfficerDemoId = assignedDemoId;
      created.assignmentMethod = assignmentMethod;
      created.assignmentTimestamp = `${timeStr} Today`;
    }

    // Add entry to project recent activity
    const existingActs = this.extraActivities.get(params.projectId) || [];
    existingActs.unshift({
      id: `ACT-DISPATCH-${Date.now()}`,
      projectId: params.projectId,
      type: 'INSPECTION',
      title: `⚡ Surprise Field Audit Dispatched (#${created.id})`,
      timestamp: `Today, ${timeStr}`,
      status: 'Assigned',
      notes: `Inspector: ${assignedName}. Reason: ${params.reason}`,
      referenceId: created.id,
    });
    this.extraActivities.set(params.projectId, existingActs);

    // Cross-role sync: Post notice to NGO request ledger for PRJ-101
    if (params.projectId === 'PRJ-101') {
      try {
        mockNgoService.addOfficialNotice({
          title: `⚡ Surprise Field Audit Dispatched (#${created.id})`,
          description: `A PMU field inspector (${assignedName || 'PMU Officer'}) has been dispatched under surprise audit protocol (${params.reason}). Please ensure institutional registers and facilities are accessible.`,
          referenceId: created.id,
          projectId: 'PRJ-101',
        });
      } catch (err) {
        console.error('Failed to notify NGO of dispatch:', err);
      }
    }

    this.notify();
    return created;
  }


  async scheduleRoutineInspection(params: RoutineInspectionScheduleParams): Promise<InspectionAssignment> {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const project = await mockProjectService.getProjectById(params.projectId);
    const projectName = params.projectName || project?.name || 'Selected Facility';
    const projectAddress = params.projectAddress || project?.location.address || 'District Facility Office';
    const city = params.city || project?.location.city || 'Delhi';

    let assignedId = params.assignedOfficerId || '';
    let assignedName = params.assignedInspector || params.assignedOfficerName || '';
    let assignedDemoId = params.assignedOfficerDemoId;

    if (!assignedName) {
      const eligible = await mockAssignmentService.getEligibleInspectors();
      if (eligible.length > 0) {
        const rand = eligible[Math.floor(Math.random() * eligible.length)];
        assignedId = rand.id;
        assignedName = rand.name;
        assignedDemoId = rand.demoId;
      }
    }

    const created = await mockInspectionService.createInspectionRequest({
      projectId: params.projectId,
      projectName,
      projectAddress,
      city,
      type: params.type,
      priority: params.priority,
      triggerReason: `Regular Scheduled Audit: ${params.instructions || params.reason || 'Statutory review'} [Approved by ${params.authorizingOfficial}]`,
      scheduledTime: params.scheduledDate,
    });

    if (assignedId) {
      await mockInspectionService.updateInspectionAssignment(created.id, {
        status: 'Assigned',
        assignedOfficerId: assignedId,
        assignedOfficerName: assignedName,
        assignedOfficerDemoId: assignedDemoId,
        assignmentMethod: 'Official Roster Allocation',
        assignmentTimestamp: `${timeStr} Today`,
      });
      created.status = 'Assigned';
      created.assignedOfficerId = assignedId;
      created.assignedOfficerName = assignedName;
      created.assignedOfficerDemoId = assignedDemoId;
      created.assignmentMethod = 'Official Roster Allocation';
      created.assignmentTimestamp = `${timeStr} Today`;
    }

    const existingActs = this.extraActivities.get(params.projectId) || [];
    existingActs.unshift({
      id: `ACT-ROUTINE-${Date.now()}`,
      projectId: params.projectId,
      type: 'INSPECTION',
      title: `${params.type} Scheduled (#${created.id})`,
      timestamp: `Today, ${timeStr}`,
      status: 'Assigned',
      notes: `Assigned to ${assignedName}. Scheduled for ${params.scheduledDate}.`,
      referenceId: created.id,
    });
    this.extraActivities.set(params.projectId, existingActs);

    this.notify();
    return created;
  }

  // ==========================================
  // INSPECTION HISTORY & ARCHIVE
  // ==========================================
  async filterInspectionHistory(filter: InspectionHistoryFilter): Promise<InspectionAssignment[]> {
    const all = await mockInspectionService.getAllInspections();
    return all.filter((i) => {
      // Type filter
      if (filter.typeFilter && filter.typeFilter !== 'ALL') {
        if (filter.typeFilter === 'Surprise' && i.type !== 'Surprise Inspection') return false;
        if (filter.typeFilter === 'Routine' && i.type !== 'Routine Inspection') return false;
        if (filter.typeFilter === 'Special Audit' && i.type !== 'Special Audit') return false;
      }

      // Status filter
      if (filter.statusFilter && filter.statusFilter !== 'ALL') {
        if (filter.statusFilter === 'Completed' && i.status !== 'Completed' && !i.status.includes('Submitted')) return false;
        if (filter.statusFilter === 'In Progress' && i.status !== 'In Progress') return false;
        if (filter.statusFilter === 'Submitted / Awaiting Review' && !i.status.includes('Submitted')) return false;
      }

      // Text query filter
      if (filter.query && filter.query.trim().length > 0) {
        const q = filter.query.toLowerCase().trim();
        const matchesName = i.projectName.toLowerCase().includes(q);
        const matchesId = i.id.toLowerCase().includes(q);
        const matchesOfficer = i.assignedOfficerName.toLowerCase().includes(q);
        const matchesCity = i.city.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesOfficer && !matchesCity) return false;
      }

      return true;
    });
  }

  async reset(): Promise<void> {
    await mockProjectService.reset();
    await mockAlertService.reset();
    await mockInspectionService.reset();
    this.notify();
  }
}

export const mockOfficialService = new MockOfficialService();
