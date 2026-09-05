/**
 * Deterministic Attendance Analytics Engine
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * Provides pure, deterministic calculation functions, edge-case validation,
 * historical metric computation, and explainable signal generation.
 * Ready for Phase 5 AI Anomaly Detection ingestion.
 */

import {
  AttendanceRecord,
  AttendanceAnalytics,
  AttendanceTrendDirection,
  AttendanceValidationResult,
  AttendanceValidationIssue,
  AnalyticsSignal,
} from '../../types/attendance';

export interface ComputeAnalyticsInput {
  projectId: string;
  projectName: string;
  reportingDate: string;
  capacity: number;
  reportedAttendance: number;
  cctvEstimatedOccupancy: number | null;
  historicalRecords: AttendanceRecord[];
}

export class AttendanceAnalyticsEngine {
  /**
   * Deterministic Turnout / Attendance Rate:
   * (reportedAttendance / capacity) * 100
   * Guarded against capacity = 0.
   */
  static calculateAttendanceRate(reportedAttendance: number, capacity: number): number {
    if (capacity <= 0 || reportedAttendance < 0) return 0;
    const rate = (reportedAttendance / capacity) * 100;
    return Math.round(rate * 10) / 10;
  }

  /**
   * Absent Count:
   * capacity - reportedAttendance
   * Non-negative clamp.
   */
  static calculateAbsentCount(capacity: number, reportedAttendance: number): number {
    if (capacity <= 0) return 0;
    return Math.max(0, capacity - Math.max(0, reportedAttendance));
  }

  /**
   * Capacity Utilization:
   * Same as attendance rate relative to sanctioned capacity.
   */
  static calculateCapacityUtilization(reportedAttendance: number, capacity: number): number {
    return this.calculateAttendanceRate(reportedAttendance, capacity);
  }

  /**
   * CCTV Occupancy Variance:
   * reportedAttendance - cctvEstimatedOccupancy
   * Variance Percentage:
   * (variance / reportedAttendance) * 100 (relative to reported roll-call)
   */
  static calculateCctvVariance(
    reportedAttendance: number,
    cctvEstimatedOccupancy: number | null
  ): { variance: number | null; percentage: number | null } {
    if (cctvEstimatedOccupancy === null || cctvEstimatedOccupancy === undefined) {
      return { variance: null, percentage: null };
    }

    const variance = reportedAttendance - cctvEstimatedOccupancy;
    let percentage: number | null = null;
    if (reportedAttendance > 0) {
      percentage = Math.round((variance / reportedAttendance) * 1000) / 10;
    } else {
      percentage = 0;
    }

    return { variance, percentage };
  }

  /**
   * Attendance Validation:
   * Edge-case evaluation with neutral diagnostics.
   */
  static validateAttendance(data: {
    reportedAttendance: number;
    capacity: number;
    absentCount?: number;
    cctvEstimatedOccupancy?: number | null;
  }): AttendanceValidationResult {
    const issues: AttendanceValidationIssue[] = [];
    const warnings: AttendanceValidationIssue[] = [];

    // Rule 1: Negative attendance
    if (data.reportedAttendance < 0) {
      issues.push({
        code: 'VAL-ERR-01',
        severity: 'INVALID',
        message: 'Reported attendance count cannot be negative.',
      });
    }

    // Rule 2: Negative capacity
    if (data.capacity < 0) {
      issues.push({
        code: 'VAL-ERR-02',
        severity: 'INVALID',
        message: 'Registered facility capacity cannot be negative.',
      });
    }

    // Rule 3: Zero capacity
    if (data.capacity === 0) {
      warnings.push({
        code: 'VAL-WARN-01',
        severity: 'WARNING',
        message: 'Facility is registered with 0 capacity. Attendance rate cannot be computed.',
      });
    }

    // Rule 4: Reported exceeds capacity
    if (data.capacity > 0 && data.reportedAttendance > data.capacity) {
      warnings.push({
        code: 'VAL-WARN-02',
        severity: 'WARNING',
        message: 'Reported attendance exceeds registered grant capacity. Verification recommended.',
      });
    }

    // Rule 5: Absent count consistency
    if (
      data.absentCount !== undefined &&
      data.capacity > 0 &&
      data.reportedAttendance >= 0 &&
      data.absentCount !== data.capacity - data.reportedAttendance
    ) {
      warnings.push({
        code: 'VAL-WARN-03',
        severity: 'WARNING',
        message: 'Absent count does not reconcile with stated capacity minus present count.',
      });
    }

    // Rule 6: Missing CCTV estimate (informative warning, not error)
    if (data.cctvEstimatedOccupancy === null || data.cctvEstimatedOccupancy === undefined) {
      warnings.push({
        code: 'VAL-WARN-04',
        severity: 'WARNING',
        message: 'CCTV occupancy estimate unavailable. Automated cross-check paused.',
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  }

  /**
   * Historical Baseline Calculation:
   * Deterministic averages across previous synthetic reporting windows.
   */
  static calculateHistoricalMetrics(history: AttendanceRecord[]): {
    averageAttendance: number;
    averageRate: number;
  } {
    if (!history || history.length === 0) {
      return { averageAttendance: 0, averageRate: 0 };
    }

    const totalAttendance = history.reduce((sum, r) => sum + r.reportedAttendance, 0);
    const totalRate = history.reduce((sum, r) => sum + r.attendanceRate, 0);

    const averageAttendance = Math.round((totalAttendance / history.length) * 10) / 10;
    const averageRate = Math.round((totalRate / history.length) * 10) / 10;

    return { averageAttendance, averageRate };
  }

  /**
   * Trend Classification:
   * Based on delta from historical average:
   * - Stable: within ±5%
   * - Above historical average: > +5% to +15%
   * - Below historical average: < -5% to -15%
   * - Significant deviation: > ±15%
   */
  static determineTrend(current: number, historicalAvg: number): AttendanceTrendDirection {
    if (historicalAvg <= 0) return 'Stable';

    const percentageDiff = ((current - historicalAvg) / historicalAvg) * 100;

    if (percentageDiff > 15 || percentageDiff < -15) {
      return 'Significant deviation';
    } else if (percentageDiff > 5) {
      return 'Above historical average';
    } else if (percentageDiff < -5) {
      return 'Below historical average';
    }
    return 'Stable';
  }

  /**
   * Explainable Analytics Signals:
   * Structured indicators ready for Phase 5 AI integration.
   */
  static generateAnalyticsSignals(params: {
    reportedAttendance: number;
    capacity: number;
    cctvEstimatedOccupancy: number | null;
    historicalAverage: number;
    trend: AttendanceTrendDirection;
    historicalRecords: AttendanceRecord[];
  }): AnalyticsSignal[] {
    const signals: AnalyticsSignal[] = [];
    const {
      reportedAttendance,
      capacity,
      cctvEstimatedOccupancy,
      historicalAverage,
      trend,
      historicalRecords,
    } = params;

    // Signal 1: CCTV Discrepancy
    if (cctvEstimatedOccupancy !== null) {
      const diff = reportedAttendance - cctvEstimatedOccupancy;
      if (Math.abs(diff) >= 5) {
        signals.push({
          id: 'SIG-CCTV-01',
          signalType: 'CCTV_OCCUPANCY_DISCREPANCY',
          severity: 'HIGH',
          title: 'CCTV Telemetry Discrepancy',
          explanation: `Reported attendance is ${reportedAttendance} while the demo CCTV estimated occupancy is ${cctvEstimatedOccupancy} (variance: +${diff}). This variance should be reviewed by an authorized official.`,
          sourceMetrics: {
            reportedValue: reportedAttendance,
            benchmarkValue: cctvEstimatedOccupancy,
            variance: diff > 0 ? `+${diff}` : `${diff}`,
            unit: 'attendees',
          },
          humanVerificationRecommended: true,
        });
      }
    } else {
      // Signal 2: CCTV Stream Unavailable
      signals.push({
        id: 'SIG-CCTV-02',
        signalType: 'CCTV_STREAM_UNAVAILABLE',
        severity: 'MEDIUM',
        title: 'CCTV Stream Telemetry Offline',
        explanation: 'CCTV occupancy estimate is unavailable during the current monitoring window. Camera stream may be disconnected or edge gateway offline.',
        sourceMetrics: {
          reportedValue: reportedAttendance,
          benchmarkValue: null,
          variance: null,
        },
        humanVerificationRecommended: false,
      });
    }

    // Signal 3: Historical Deviation
    if (historicalAverage > 0 && trend !== 'Stable') {
      const diff = Math.round((reportedAttendance - historicalAverage) * 10) / 10;
      const pct = Math.round(((reportedAttendance - historicalAverage) / historicalAverage) * 1000) / 10;
      const formattedDiff = diff > 0 ? `+${diff}` : `${diff}`;
      const formattedPct = pct > 0 ? `+${pct}%` : `${pct}%`;

      signals.push({
        id: 'SIG-HIST-01',
        signalType: 'SIGNIFICANT_HISTORICAL_DEVIATION',
        severity: trend === 'Significant deviation' ? 'HIGH' : 'MEDIUM',
        title: 'Historical Baseline Variance',
        explanation: `Current reported attendance (${reportedAttendance}) is ${formattedDiff} (${formattedPct}) compared with the 5-day historical baseline (${historicalAverage}). Human review recommended.`,
        sourceMetrics: {
          reportedValue: reportedAttendance,
          benchmarkValue: historicalAverage,
          variance: formattedDiff,
          unit: 'attendees',
        },
        humanVerificationRecommended: true,
      });
    }

    // Signal 4: Capacity Exceeded
    if (capacity > 0 && reportedAttendance > capacity) {
      signals.push({
        id: 'SIG-CAP-01',
        signalType: 'ATTENDANCE_EXCEEDS_CAPACITY',
        severity: 'HIGH',
        title: 'Reported Attendance Exceeds Sanctioned Capacity',
        explanation: `Reported roll-call (${reportedAttendance}) exceeds the government sanctioned project capacity (${capacity}). Requires administrative clarification.`,
        sourceMetrics: {
          reportedValue: reportedAttendance,
          benchmarkValue: capacity,
          variance: `+${reportedAttendance - capacity}`,
          unit: 'beneficiaries',
        },
        humanVerificationRecommended: true,
      });
    }

    // Signal 5: Repeated Identical Attendance
    if (historicalRecords.length >= 3) {
      const allSame = historicalRecords.every(
        (r) => r.reportedAttendance === historicalRecords[0].reportedAttendance
      );
      if (allSame && historicalRecords[0].reportedAttendance === reportedAttendance) {
        signals.push({
          id: 'SIG-PAT-01',
          signalType: 'REPEATED_IDENTICAL_ATTENDANCE',
          severity: 'LOW',
          title: 'Uniform Headcount Pattern',
          explanation: `Reported attendance has remained exactly ${reportedAttendance} across ${historicalRecords.length + 1} consecutive reporting periods. Periodic on-site sample verification is standard procedure.`,
          sourceMetrics: {
            reportedValue: reportedAttendance,
            benchmarkValue: reportedAttendance,
            variance: 0,
            unit: 'consecutive reports',
          },
          humanVerificationRecommended: false,
        });
      }
    }

    return signals;
  }

  /**
   * Main Entrypoint: Compute Full Attendance Analytics Object
   */
  static compute(input: ComputeAnalyticsInput): AttendanceAnalytics {
    const {
      projectId,
      projectName,
      reportingDate,
      capacity,
      reportedAttendance,
      cctvEstimatedOccupancy,
      historicalRecords,
    } = input;

    const attendanceRate = this.calculateAttendanceRate(reportedAttendance, capacity);
    const absentCount = this.calculateAbsentCount(capacity, reportedAttendance);
    const capacityUtilization = this.calculateCapacityUtilization(reportedAttendance, capacity);

    const { variance: occupancyVariance, percentage: occupancyVariancePercentage } =
      this.calculateCctvVariance(reportedAttendance, cctvEstimatedOccupancy);

    const validationResult = this.validateAttendance({
      reportedAttendance,
      capacity,
      absentCount,
      cctvEstimatedOccupancy,
    });

    const { averageAttendance, averageRate } = this.calculateHistoricalMetrics(historicalRecords);
    const attendanceTrend = this.determineTrend(reportedAttendance, averageAttendance);

    const analyticsSignals = this.generateAnalyticsSignals({
      reportedAttendance,
      capacity,
      cctvEstimatedOccupancy,
      historicalAverage: averageAttendance,
      trend: attendanceTrend,
      historicalRecords,
    });

    return {
      projectId,
      projectName,
      reportingDate,
      capacity,
      reportedAttendance,
      absentCount,
      attendanceRate,
      cctvEstimatedOccupancy,
      occupancyVariance,
      occupancyVariancePercentage,
      historicalAverageAttendance: averageAttendance,
      historicalAverageAttendanceRate: averageRate,
      attendanceTrend,
      capacityUtilization,
      validationResult,
      analyticsSignals,
      historicalRecords,
      isSyntheticDemo: true,
    };
  }
}
