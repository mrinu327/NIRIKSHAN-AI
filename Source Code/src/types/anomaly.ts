/**
 * AI-Assisted Anomaly Detection Models for SIH26095
 * Ministry of Social Justice & Empowerment (MoSJE)
 *
 * SAFETY & GOVERNANCE COMPLIANCE:
 * - AI serves as advisory decision-support only.
 * - Anomaly score is an indicator of potential data variance, NOT an accusation of fraud.
 * - CCTV telemetry is an optical estimate and does not prove attendance.
 * - All actions require human official authorization.
 */

export type AnomalySeverity = 'Low' | 'Moderate' | 'High' | 'Critical';

export type AnomalyStatus =
  | 'New'
  | 'Under Review'
  | 'Confirmed for Follow-Up'
  | 'Dismissed'
  | 'Resolved';

export type AnomalyConfidence = 'Low' | 'Medium' | 'High';

export type AnomalyDismissalReason =
  | 'Data verified'
  | 'False positive'
  | 'Insufficient evidence'
  | 'Other';

export type AnomalySignalType =
  | 'CCTV_DISCREPANCY'
  | 'HISTORICAL_DEVIATION'
  | 'VALIDATION_ISSUE'
  | 'REPEATED_ATTENDANCE'
  | 'TELEMETRY_OFFLINE'
  | 'CAPACITY_VIOLATION';

export interface AnomalySignal {
  signalId: string;
  projectId: string;
  type: AnomalySignalType;
  severity: AnomalySeverity;
  title: string;
  explanation: string;
  scoreContribution: number;
  observedValue: number | string;
  expectedValue: number | string | null;
  difference: number | string | null;
  recommendation: string;
}

export interface AnomalyAssessment {
  id: string;
  projectId: string;
  projectName: string;
  overallScore: number; // 0–100 normalized score
  severity: AnomalySeverity;
  confidence: AnomalyConfidence;
  confidenceReason: string;
  status: AnomalyStatus;
  signals: AnomalySignal[];
  summary: string;
  recommendedAction: string;
  dismissalReason?: AnomalyDismissalReason;
  dismissalNotes?: string;
  generatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  isDecisionSupport: true;
}
