/**
 * Mock Anomaly Assessment Service
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * Manages session lifecycle for AI-assisted anomaly detection assessments.
 * Coordinates with mockAnalyticsService, mockAlertService, and mockInspectionService.
 */

import {
  AnomalyAssessment,
  AnomalyStatus,
  AnomalyDismissalReason,
} from '../../types/anomaly';
import { mockAnalyticsService } from './mockAnalyticsService';
import { mockAlertService } from './mockAlertService';
import { explainableAnomalyEngine } from '../analytics/anomalyDetectionEngine';

export class MockAnomalyService {
  private assessments: Record<string, AnomalyAssessment> = {};

  /**
   * Retrieves or computes the Anomaly Assessment for a specific project.
   * Consumes Phase 4 Attendance Analytics.
   */
  async getAssessmentForProject(projectId: string): Promise<AnomalyAssessment> {
    // If already generated and modified in session, return modified assessment
    if (this.assessments[projectId]) {
      return { ...this.assessments[projectId] };
    }

    // Otherwise compute fresh assessment from Phase 4 analytics
    const analytics = await mockAnalyticsService.getProjectAttendanceAnalytics(projectId);
    const assessment = explainableAnomalyEngine.assess(analytics);
    this.assessments[projectId] = assessment;
    return { ...assessment };
  }

  /**
   * Updates assessment status (e.g. New -> Under Review -> Confirmed for Follow-Up / Dismissed).
   */
  async updateAssessmentStatus(
    projectId: string,
    status: AnomalyStatus,
    data?: {
      dismissalReason?: AnomalyDismissalReason;
      dismissalNotes?: string;
      reviewedBy?: string;
    }
  ): Promise<AnomalyAssessment> {
    const assessment = await this.getAssessmentForProject(projectId);

    const updated: AnomalyAssessment = {
      ...assessment,
      status,
      dismissalReason: data?.dismissalReason || assessment.dismissalReason,
      dismissalNotes: data?.dismissalNotes || assessment.dismissalNotes,
      reviewedBy: data?.reviewedBy || 'Demo Government Official',
      reviewedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' Today',
    };

    this.assessments[projectId] = updated;

    // Cross-sync with mockAlertService
    if (status === 'Confirmed for Follow-Up') {
      const alerts = await mockAlertService.getAlertsByProjectId(projectId);
      if (alerts.length > 0) {
        await mockAlertService.markForFollowUp(alerts[0].id, 'Confirmed by AI anomaly review');
      }
    } else if (status === 'Dismissed') {
      const alerts = await mockAlertService.getAlertsByProjectId(projectId);
      if (alerts.length > 0) {
        await mockAlertService.dismissAlert(alerts[0].id, data?.dismissalNotes || 'Dismissed via AI assessment');
      }
    }

    return { ...updated };
  }

  /**
   * Marks assessment resolved upon inspection initiation.
   */
  async markInspectionInitiated(projectId: string, inspectionId?: string): Promise<void> {
    const assessment = await this.getAssessmentForProject(projectId);
    this.assessments[projectId] = {
      ...assessment,
      status: 'Resolved',
      reviewedBy: 'Demo Government Official',
      reviewedAt: `Inspection Initiated${inspectionId ? ` #${inspectionId}` : ''}`,
    };
  }
}

export const mockAnomalyService = new MockAnomalyService();
