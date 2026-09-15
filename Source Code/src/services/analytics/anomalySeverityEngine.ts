/**
 * Anomaly Severity Engine
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Deterministic, explainable severity calculation based on observable thresholds.
 * Strictly avoids machine-learning or hidden black-box scoring.
 *
 * POLICY NOTE: Severity indicates the magnitude of data variance/inconsistency.
 * It is NOT an indicator of criminality or fraud.
 */

import { AnomalySeverityLevel } from '../../types/master';

export class AnomalySeverityEngine {
  /**
   * Evaluates attendance roll-call vs optical CCTV feed discrepancy severity.
   *
   * Thresholds:
   *  - < 10%: LOW (Operational fluctuation)
   *  - 10% – 20%: MEDIUM (Moderate discrepancy requiring attention)
   *  - 20% – 40%: HIGH (Significant variance requiring verification)
   *  - > 40%: CRITICAL (Severe divergence requiring priority physical audit)
   */
  public calculateAttendanceSeverity(variancePercentage: number): AnomalySeverityLevel {
    const absPct = Math.abs(variancePercentage);
    if (absPct > 40) return 'CRITICAL';
    if (absPct >= 20) return 'HIGH';
    if (absPct >= 10) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Evaluates project completion progress vs grant utilization rate.
   *
   * Observable Patterns:
   *  A. Progress ahead of utilization: Completion > 80% with Utilization < 40%
   *  B. Utilization ahead of progress: Utilization > 85% with Completion < 40%
   */
  public calculateFinancialSeverity(
    progressPercentage: number,
    utilizationPercentage: number
  ): AnomalySeverityLevel {
    const divergence = Math.abs(progressPercentage - utilizationPercentage);

    // Severe divergence: high utilization with very low physical progress or vice-versa
    if (
      (utilizationPercentage >= 85 && progressPercentage <= 30) ||
      (progressPercentage >= 85 && utilizationPercentage <= 30) ||
      divergence >= 50
    ) {
      return 'CRITICAL';
    }
    if (
      (utilizationPercentage >= 75 && progressPercentage <= 45) ||
      (progressPercentage >= 75 && utilizationPercentage <= 45) ||
      divergence >= 30
    ) {
      return 'HIGH';
    }
    if (divergence >= 15) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Evaluates mandatory inspection schedule overdue severity.
   * Default is MEDIUM; escalates to HIGH if overdue by > 45 days or with unresolved findings.
   */
  public calculateInspectionSeverity(
    daysOverdue: number,
    hasUnresolvedFindings: boolean = false
  ): AnomalySeverityLevel {
    if (daysOverdue > 90 || (daysOverdue > 45 && hasUnresolvedFindings)) {
      return 'CRITICAL';
    }
    if (daysOverdue > 45 || (daysOverdue > 14 && hasUnresolvedFindings)) {
      return 'HIGH';
    }
    if (daysOverdue > 15) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Evaluates beneficiary verification gap severity.
   * Unverified ratio = (reported - verified) / reported * 100
   */
  public calculateBeneficiarySeverity(unverifiedRatio: number): AnomalySeverityLevel {
    const absRatio = Math.abs(unverifiedRatio);
    if (absRatio > 50) return 'CRITICAL';
    if (absRatio >= 30) return 'HIGH';
    if (absRatio >= 15) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Evaluates documentation gaps based on count of missing statutory artifacts.
   */
  public calculateDocumentationSeverity(missingCount: number): AnomalySeverityLevel {
    if (missingCount >= 4) return 'CRITICAL';
    if (missingCount >= 2) return 'HIGH';
    if (missingCount >= 1) return 'MEDIUM';
    return 'LOW';
  }
}

export const anomalySeverityEngine = new AnomalySeverityEngine();
