/**
 * Mock Attendance Service
 * SIH26095 | MoSJE
 */

import { AttendanceSubmission, AttendanceSummary } from '../../types/attendance';
import { MOCK_ATTENDANCE_SUMMARY, MOCK_ATTENDANCE_HISTORY } from '../../data/mockData';

export class MockAttendanceService {
  async getTodaySummary(projectId?: string): Promise<AttendanceSummary> {
    return MOCK_ATTENDANCE_SUMMARY;
  }

  async getAttendanceHistory(projectId?: string): Promise<AttendanceSubmission[]> {
    return MOCK_ATTENDANCE_HISTORY;
  }

  async submitDailyAttendance(data: {
    projectId: string;
    presentCount: number;
    totalEnrolled: number;
    notes?: string;
  }): Promise<{ success: boolean; submissionId: string; message: string }> {
    return {
      success: true,
      submissionId: `ATT-${Date.now().toString().slice(-4)}`,
      message: 'Attendance successfully submitted for daily validation.',
    };
  }
}

export const mockAttendanceService = new MockAttendanceService();
