/**
 * Attendance & Analytics Models for SIH26095
 * Ministry of Social Justice & Empowerment (MoSJE)
 */

export interface AttendanceSubmission {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  presentCount: number;
  totalEnrolled: number;
  absentCount: number;
  status: 'Submitted' | 'Pending Submission' | 'Flagged for Review' | 'Verified';
  submittedBy: string;
  submittedAt: string;
  batchId?: string;
  notes?: string;
}

export interface AttendanceSummary {
  todayPresent: number;
  todayCapacity: number;
  submissionStatus: 'Submitted' | 'Pending' | 'Late';
  lastSubmittedTime: string;
  weeklyAverage: number;
}

// ==========================================
// PHASE 4: ATTENDANCE ANALYTICS MODEL
// ==========================================

export interface AttendanceRecord {
  id: string;
  date: string;
  capacity: number;
  reportedAttendance: number;
  absentCount: number;
  attendanceRate: number;
  notes?: string;
  isSyntheticDemo: boolean;
}

export type AttendanceTrendDirection =
  | 'Stable'
  | 'Above historical average'
  | 'Below historical average'
  | 'Significant deviation';

export type ValidationSeverity = 'VALID' | 'WARNING' | 'INVALID';

export interface AttendanceValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
}

export interface AttendanceValidationResult {
  isValid: boolean;
  issues: AttendanceValidationIssue[];
  warnings: AttendanceValidationIssue[];
}

export type AnalyticsSignalType =
  | 'ATTENDANCE_EXCEEDS_CAPACITY'
  | 'SIGNIFICANT_HISTORICAL_DEVIATION'
  | 'CCTV_OCCUPANCY_DISCREPANCY'
  | 'REPEATED_IDENTICAL_ATTENDANCE'
  | 'CCTV_STREAM_UNAVAILABLE'
  | 'MISSING_ATTENDANCE_RECORD';

export interface AnalyticsSignal {
  id: string;
  signalType: AnalyticsSignalType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  explanation: string;
  sourceMetrics: {
    reportedValue: number | string;
    benchmarkValue?: number | string | null;
    variance?: number | string | null;
    unit?: string;
  };
  humanVerificationRecommended: boolean;
}

export interface AttendanceAnalytics {
  projectId: string;
  projectName: string;
  reportingDate: string;
  capacity: number;
  reportedAttendance: number;
  absentCount: number;
  attendanceRate: number;
  cctvEstimatedOccupancy: number | null;
  occupancyVariance: number | null;
  occupancyVariancePercentage: number | null;
  historicalAverageAttendance: number;
  historicalAverageAttendanceRate: number;
  attendanceTrend: AttendanceTrendDirection;
  capacityUtilization: number;
  validationResult: AttendanceValidationResult;
  analyticsSignals: AnalyticsSignal[];
  historicalRecords: AttendanceRecord[];
  isSyntheticDemo: boolean;
}
