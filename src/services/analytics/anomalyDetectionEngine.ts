/**
 * Explainable AI-Assisted Anomaly Detection Engine
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * Consumes structured attendance analytics from Phase 4 and generates
 * a transparent, deterministic 0–100 Anomaly Score with explainable contributions
 * and confidence ratings.
 *
 * NOTE: AI functions strictly as decision-support. No punitive actions or
 * fraud accusations are automated.
 */

import { AttendanceAnalytics } from '../../types/attendance';
import {
  AnomalyAssessment,
  AnomalySignal,
  AnomalySeverity,
  AnomalyConfidence,
} from '../../types/anomaly';

export interface AnomalyDetectionEngine {
  assess(analytics: AttendanceAnalytics): AnomalyAssessment;
}

export class ExplainableAnomalyEngine implements AnomalyDetectionEngine {
  /**
   * Evaluates Phase 4 Attendance Analytics and produces an explainable Anomaly Assessment.
   */
  assess(analytics: AttendanceAnalytics): AnomalyAssessment {
    const signals: AnomalySignal[] = [];
    const {
      projectId,
      projectName,
      reportedAttendance,
      capacity,
      cctvEstimatedOccupancy,
      occupancyVariance,
      historicalAverageAttendance,
      attendanceTrend,
      validationResult,
      historicalRecords,
    } = analytics;

    // -------------------------------------------------------------
    // Signal 1: Attendance vs CCTV Estimated Occupancy Discrepancy
    // -------------------------------------------------------------
    if (cctvEstimatedOccupancy !== null) {
      const diff = occupancyVariance !== null ? occupancyVariance : reportedAttendance - cctvEstimatedOccupancy;

      let scoreContribution = 0;
      let severity: AnomalySeverity = 'Low';

      if (diff >= 15) {
        scoreContribution = 35;
        severity = 'High';
      } else if (diff >= 10) {
        scoreContribution = 25;
        severity = 'Moderate';
      } else if (diff >= 5) {
        scoreContribution = 15;
        severity = 'Moderate';
      }

      if (scoreContribution > 0) {
        signals.push({
          signalId: 'SIG-ANO-CCTV',
          projectId,
          type: 'CCTV_DISCREPANCY',
          severity,
          title: 'Attendance vs CCTV Occupancy Discrepancy',
          explanation: `Reported attendance (${reportedAttendance}) is materially higher than the automated CCTV optical occupancy estimate (${cctvEstimatedOccupancy}). CCTV is an optical estimate and does not independently prove or disprove attendance.`,
          scoreContribution,
          observedValue: reportedAttendance,
          expectedValue: cctvEstimatedOccupancy,
          difference: `+${diff}`,
          recommendation: 'Cross-check physical morning register against gate telemetry.',
        });
      }
    } else {
      // Missing CCTV Telemetry (Gives an informational signal, NOT a fraud conclusion)
      signals.push({
        signalId: 'SIG-ANO-OFFLINE',
        projectId,
        type: 'TELEMETRY_OFFLINE',
        severity: 'Moderate',
        title: 'CCTV Stream Telemetry Offline',
        explanation: 'CCTV camera stream was unavailable during this reporting cycle. Automated optical estimation could not be cross-checked against roll-call.',
        scoreContribution: 10,
        observedValue: 'Offline',
        expectedValue: 'Online Stream',
        difference: 'Unavailable',
        recommendation: 'Verify camera connectivity and edge gateway status.',
      });
    }

    // -------------------------------------------------------------
    // Signal 2: Historical Attendance Deviation
    // -------------------------------------------------------------
    if (historicalAverageAttendance > 0 && attendanceTrend !== 'Stable') {
      const diff = Math.round((reportedAttendance - historicalAverageAttendance) * 10) / 10;
      const pct = Math.round(((reportedAttendance - historicalAverageAttendance) / historicalAverageAttendance) * 1000) / 10;

      let scoreContribution = 0;
      let severity: AnomalySeverity = 'Moderate';

      if (attendanceTrend === 'Significant deviation') {
        scoreContribution = 25;
        severity = 'High';
      } else if (attendanceTrend === 'Above historical average') {
        scoreContribution = 15;
        severity = 'Moderate';
      } else if (attendanceTrend === 'Below historical average') {
        scoreContribution = 10;
        severity = 'Moderate';
      }

      if (scoreContribution > 0) {
        signals.push({
          signalId: 'SIG-ANO-HIST',
          projectId,
          type: 'HISTORICAL_DEVIATION',
          severity,
          title: 'Historical Baseline Deviation',
          explanation: `Reported attendance (${reportedAttendance}) deviates by ${diff > 0 ? `+${diff}` : `${diff}`} (${pct > 0 ? `+${pct}%` : `${pct}%`}) from the 5-day synthetic baseline (~${Math.round(historicalAverageAttendance)}).`,
          scoreContribution,
          observedValue: reportedAttendance,
          expectedValue: `~${Math.round(historicalAverageAttendance)}`,
          difference: diff > 0 ? `+${diff}` : `${diff}`,
          recommendation: 'Review historical shift factors such as special therapy sessions or admissions.',
        });
      }
    }

    // -------------------------------------------------------------
    // Signal 3: Capacity Bounds Violation
    // -------------------------------------------------------------
    if (capacity > 0 && reportedAttendance > capacity) {
      signals.push({
        signalId: 'SIG-ANO-CAP',
        projectId,
        type: 'CAPACITY_VIOLATION',
        severity: 'Critical',
        title: 'Roll-Call Exceeds Sanctioned Capacity',
        explanation: `Reported roll-call count (${reportedAttendance}) exceeds the registered grant allocation capacity (${capacity}).`,
        scoreContribution: 35,
        observedValue: reportedAttendance,
        expectedValue: capacity,
        difference: `+${reportedAttendance - capacity}`,
        recommendation: 'Obtain administrative justification for capacity overflow.',
      });
    }

    // -------------------------------------------------------------
    // Signal 4: Repeated Identical Attendance Pattern
    // -------------------------------------------------------------
    if (historicalRecords && historicalRecords.length >= 3) {
      const allSame = historicalRecords.every(
        (r) => r.reportedAttendance === historicalRecords[0].reportedAttendance
      );
      if (allSame && historicalRecords[0].reportedAttendance === reportedAttendance) {
        signals.push({
          signalId: 'SIG-ANO-REPEAT',
          projectId,
          type: 'REPEATED_ATTENDANCE',
          severity: 'Low',
          title: 'Uniform Headcount Pattern',
          explanation: `Reported attendance has remained exactly ${reportedAttendance} across ${historicalRecords.length + 1} consecutive sessions.`,
          scoreContribution: 10,
          observedValue: reportedAttendance,
          expectedValue: 'Variable Roll-Call',
          difference: '0 variance',
          recommendation: 'Conduct standard random sample roll-call verification.',
        });
      }
    }

    // -------------------------------------------------------------
    // Signal 5: Data Bounds / Validation Issue
    // -------------------------------------------------------------
    if (!validationResult.isValid) {
      signals.push({
        signalId: 'SIG-ANO-VAL',
        projectId,
        type: 'VALIDATION_ISSUE',
        severity: 'High',
        title: 'Data Integrity Bounds Issue',
        explanation: validationResult.issues.map((i) => i.message).join(' '),
        scoreContribution: 20,
        observedValue: 'Invalid Values',
        expectedValue: 'Valid Bounds',
        difference: 'Flagged',
        recommendation: 'Require institute to correct submitted registry entries.',
      });
    }

    // -------------------------------------------------------------
    // Overall Score Normalization (0–100)
    // -------------------------------------------------------------
    const rawScore = signals.reduce((sum, s) => sum + s.scoreContribution, 0);
    const overallScore = Math.min(100, Math.max(0, rawScore));

    // Determine Severity
    let severity: AnomalySeverity = 'Low';
    if (overallScore >= 75) {
      severity = 'Critical';
    } else if (overallScore >= 50) {
      severity = 'High';
    } else if (overallScore >= 25) {
      severity = 'Moderate';
    }

    // Determine Confidence (Independent from severity)
    let confidence: AnomalyConfidence = 'Medium';
    let confidenceReason = '';

    if (cctvEstimatedOccupancy === null) {
      confidence = 'Low';
      confidenceReason = 'CCTV telemetry is offline; cross-verification is limited to self-reported roll-call logs.';
    } else if (signals.length >= 2) {
      confidence = 'Medium';
      confidenceReason = 'Two independent operational signals are available; CCTV telemetry is active but is an optical estimate.';
    } else if (overallScore < 25) {
      confidence = 'High';
      confidenceReason = 'Telemetry streams and roll-call records are consistent with baseline historical patterns.';
    } else {
      confidence = 'Medium';
      confidenceReason = 'Telemetry stream available with moderate signal corroboration.';
    }

    // Recommended Action Phrasing
    let recommendedAction = '';
    if (overallScore >= 50) {
      recommendedAction = 'Human verification recommended. Consider reviewing physical attendance registers or initiating an impartial surprise inspection.';
    } else if (overallScore >= 25) {
      recommendedAction = 'Administrative monitoring advised. Flag for next scheduled reporting review.';
    } else {
      recommendedAction = 'Standard operational monitoring. Telemetry operating within normal parameters.';
    }

    // Narrative Summary
    const summary =
      signals.length > 0
        ? `Assessment identified ${signals.length} active operational signal(s) contributing to an Anomaly Score of ${overallScore}/100 (${severity} Severity, ${confidence} Confidence).`
        : `Assessment indicates normal operational metrics with an Anomaly Score of ${overallScore}/100.`;

    return {
      id: `ASM-${projectId}-${Date.now().toString().slice(-4)}`,
      projectId,
      projectName,
      overallScore,
      severity,
      confidence,
      confidenceReason,
      status: 'New',
      signals,
      summary,
      recommendedAction,
      generatedAt: 'Today (Real-Time Telemetry)',
      isDecisionSupport: true,
    };
  }
}

export const explainableAnomalyEngine = new ExplainableAnomalyEngine();
