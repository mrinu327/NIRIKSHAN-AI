/**
 * Attendance Models for SIH26095
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
