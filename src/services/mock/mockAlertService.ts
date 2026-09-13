/**
 * Mock Alert Service
 * SIH26095 | MoSJE
 *
 * Adheres strictly to AI safety policies:
 * - Diagnostic neutral phrasing ("Discrepancy detected", "Requires verification")
 * - Does not automate punitive actions.
 */

import { AnomalyAlert } from '../../types/alert';
import { MOCK_ALERTS } from '../../data/mockData';

export class MockAlertService {
  private alerts: AnomalyAlert[] = MOCK_ALERTS.map((a) => ({
    ...a,
    metricComparison: a.metricComparison ? { ...a.metricComparison } : undefined,
  }));


  async getPendingAlerts(): Promise<AnomalyAlert[]> {
    return [...this.alerts];
  }

  async getAllAlerts(): Promise<AnomalyAlert[]> {
    return [...this.alerts];
  }

  async getAlertById(id: string): Promise<AnomalyAlert | undefined> {
    return this.alerts.find((a) => a.id === id);
  }

  async getAlertsByProjectId(projectId: string): Promise<AnomalyAlert[]> {
    return this.alerts.filter((a) => a.projectId === projectId);
  }

  async markForFollowUp(id: string, notes?: string): Promise<AnomalyAlert | undefined> {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.status = 'Under Investigation';
      alert.reviewedBy = 'Demo Government Official';
      alert.reviewedAt = 'Today (Follow-up scheduled)';
    }
    return alert;
  }

  async dismissAlert(id: string, notes?: string): Promise<AnomalyAlert | undefined> {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.status = 'Dismissed';
      alert.reviewedBy = 'Demo Government Official';
      alert.reviewedAt = 'Today (Marked as reviewed)';
    }
    return alert;
  }

  async markInspectionInitiated(id: string, inspectionId?: string): Promise<AnomalyAlert | undefined> {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.status = 'Verified';
      alert.reviewedBy = 'Demo Government Official';
      alert.reviewedAt = `Today (Inspection initiated${inspectionId ? ` #${inspectionId}` : ''})`;
    }
    return alert;
  }

  async acknowledgeAlert(id: string, reviewerNotes?: string): Promise<boolean> {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.status = 'Verified';
      alert.reviewedBy = 'Demo Government Official';
      alert.reviewedAt = 'Today';
      return true;
    }
    return false;
  }

  async reset(): Promise<void> {
    this.alerts = MOCK_ALERTS.map((a) => ({
      ...a,
      metricComparison: a.metricComparison ? { ...a.metricComparison } : undefined,
    }));
  }
}


export const mockAlertService = new MockAlertService();
