/**
 * Mock Attendance Service
 * SIH26095 | MoSJE
 */

import { AttendanceSubmission, AttendanceSummary } from '../../types/attendance';
import { MOCK_ATTENDANCE_SUMMARY, MOCK_ATTENDANCE_HISTORY } from '../../data/mockData';

export class MockAttendanceService {
  private summary: AttendanceSummary = { ...MOCK_ATTENDANCE_SUMMARY };
  private history: AttendanceSubmission[] = [...MOCK_ATTENDANCE_HISTORY];
  private listeners: Array<() => void> = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Attendance listener error:', err);
      }
    });
  }

  async getTodaySummary(projectId?: string): Promise<AttendanceSummary> {
    return { ...this.summary };
  }

  async getAttendanceHistory(projectId?: string): Promise<AttendanceSubmission[]> {
    return [...this.history];
  }

  async submitDailyAttendance(data: {
    projectId: string;
    presentCount: number;
    totalEnrolled: number;
    notes?: string;
    submittedBy?: string;
    verificationMethod?: 'BIOMETRIC' | 'ROLL_CALL' | 'HYBRID';
  }): Promise<{ success: boolean; submissionId: string; message: string; summary: AttendanceSummary }> {
    const timeStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const submissionId = `ATT-${Date.now().toString().slice(-4)}`;

    // Update current summary
    this.summary = {
      ...this.summary,
      todayPresent: data.presentCount,
      todayCapacity: data.totalEnrolled,
      submissionStatus: 'Submitted',
      lastSubmittedTime: `${timeStr} Today`,
      weeklyAverage: Number(
        ((this.summary.weeklyAverage * 6 + data.presentCount) / 7).toFixed(1)
      ),
    };

    const newSubmission: AttendanceSubmission = {
      id: submissionId,
      projectId: data.projectId || 'PRJ-101',
      projectName: 'Sunrise Rehabilitation Centre',
      date: 'Today (Submitted)',
      presentCount: data.presentCount,
      totalEnrolled: data.totalEnrolled,
      absentCount: data.totalEnrolled - data.presentCount,
      status: 'Submitted',
      submittedBy: data.submittedBy || 'Centre Administrator (NGO)',
      submittedAt: timeStr,
      batchId: 'BATCH-2026-A',
      notes: data.notes,
    };

    // Prepend to top of history
    this.history = [newSubmission, ...this.history.filter((h) => h.id !== newSubmission.id)];

    this.notify();

    return {
      success: true,
      submissionId,
      message: `Daily attendance (${data.presentCount}/${data.totalEnrolled}) successfully recorded and transmitted to MoSJE central registry.`,
      summary: { ...this.summary },
    };
  }

  async reset(): Promise<void> {
    this.summary = { ...MOCK_ATTENDANCE_SUMMARY };
    this.history = [...MOCK_ATTENDANCE_HISTORY];
    this.notify();
  }
}

export const mockAttendanceService = new MockAttendanceService();
