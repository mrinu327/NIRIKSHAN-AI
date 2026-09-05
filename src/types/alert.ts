/**
 * Alert / Anomaly Models for SIH26095
 *
 * SAFETY & POLICY COMPLIANCE:
 * - Alerts use neutral diagnostic terminology:
 *   "Potential anomaly", "Discrepancy detected", "Requires verification", "Human review required"
 * - Never labels an entity as fraudulent.
 * - Always requires human official review.
 */

export type AlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type AlertCategory = 
  | 'Discrepancy detected' 
  | 'Potential anomaly' 
  | 'Requires verification' 
  | 'CCTV telemetry offline' 
  | 'Inspection overdue';

export type AlertStatus = 'Pending Review' | 'Under Investigation' | 'Verified' | 'Dismissed';

export interface AnomalyAlert {
  id: string;
  projectId: string;
  projectName: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: string;
  description: string;
  metricComparison?: {
    reportedAttendance: number;
    headcountEstimate?: number;
    difference?: number;
  };
  humanReviewRequired: true;
  reviewedBy?: string;
  reviewedAt?: string;
}
