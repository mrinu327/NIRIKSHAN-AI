/**
 * Mock Analytics Service
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * Implements deterministic attendance analytics and synthetic historical baselines
 * for MoSJE project monitoring and official oversight.
 */

import { AttendanceAnalytics, AttendanceRecord } from '../../types/attendance';
import { SUNRISE_ATTENDANCE } from '../../data/mockData';
import { AttendanceAnalyticsEngine } from '../analytics/attendanceAnalyticsEngine';

// ==========================================
// SYNTHETIC DEMO HISTORY: SUNRISE REHABILITATION CENTRE (PRJ-101)
// Explicitly labelled as synthetic demo data for Hackathon evaluation.
// ==========================================
export const SUNRISE_HISTORICAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'HIST-SUN-05',
    date: '02 Sep 2026',
    capacity: 50,
    reportedAttendance: 38,
    absentCount: 12,
    attendanceRate: 76,
    notes: 'Regular operational morning session',
    isSyntheticDemo: true,
  },
  {
    id: 'HIST-SUN-04',
    date: '01 Sep 2026',
    capacity: 50,
    reportedAttendance: 39,
    absentCount: 11,
    attendanceRate: 78,
    notes: 'Physiotherapy batch attendance',
    isSyntheticDemo: true,
  },
  {
    id: 'HIST-SUN-03',
    date: '29 Aug 2026',
    capacity: 50,
    reportedAttendance: 37,
    absentCount: 13,
    attendanceRate: 74,
    notes: 'Routine roll-call verified',
    isSyntheticDemo: true,
  },
  {
    id: 'HIST-SUN-02',
    date: '28 Aug 2026',
    capacity: 50,
    reportedAttendance: 38,
    absentCount: 12,
    attendanceRate: 76,
    notes: 'Vocational training day',
    isSyntheticDemo: true,
  },
  {
    id: 'HIST-SUN-01',
    date: '27 Aug 2026',
    capacity: 50,
    reportedAttendance: 36,
    absentCount: 14,
    attendanceRate: 72,
    notes: 'Morning assembly roll-call',
    isSyntheticDemo: true,
  },
];

export class MockAnalyticsService {
  private followUpFlags: Record<string, { marked: boolean; timestamp: string; notes?: string }> = {};

  async getAttendanceTrends() {
    return [
      { day: 'Mon', averageAttendance: 88 },
      { day: 'Tue', averageAttendance: 91 },
      { day: 'Wed', averageAttendance: 86 },
      { day: 'Thu', averageAttendance: 89 },
      { day: 'Fri', averageAttendance: 84 },
    ];
  }

  async getAnomalyRate() {
    return {
      totalVerifications: 412,
      anomaliesDetected: 7,
      anomalyRatePercent: 1.7,
    };
  }

  /**
   * Retrieves deterministic attendance analytics for a specific project.
   * Maintains strict single source of truth for Sunrise Rehabilitation Centre:
   * Capacity: 50, Reported: 42, Absent: 8, Rate: 84%, CCTV: 25, Variance: +17.
   */
  async getProjectAttendanceAnalytics(projectId: string): Promise<AttendanceAnalytics> {
    if (projectId === 'PRJ-101' || projectId.toLowerCase().includes('sunrise')) {
      return AttendanceAnalyticsEngine.compute({
        projectId: 'PRJ-101',
        projectName: 'Sunrise Rehabilitation Centre',
        reportingDate: 'Today (04 Sep 2026)',
        capacity: SUNRISE_ATTENDANCE.totalBeneficiaries,
        reportedAttendance: SUNRISE_ATTENDANCE.currentSubmittedAttendance,
        cctvEstimatedOccupancy: 25,
        historicalRecords: SUNRISE_HISTORICAL_ATTENDANCE,
      });
    }

    if (projectId === 'PRJ-105') {
      // Nayi Disha: Telemetry Offline (cctvEstimatedOccupancy: null -> unavailable, not 0)
      const mockHistory: AttendanceRecord[] = [
        { id: 'H-1', date: '02 Sep', capacity: 60, reportedAttendance: 30, absentCount: 30, attendanceRate: 50, isSyntheticDemo: true },
        { id: 'H-2', date: '01 Sep', capacity: 60, reportedAttendance: 31, absentCount: 29, attendanceRate: 51.7, isSyntheticDemo: true },
        { id: 'H-3', date: '29 Aug', capacity: 60, reportedAttendance: 28, absentCount: 32, attendanceRate: 46.7, isSyntheticDemo: true },
      ];
      return AttendanceAnalyticsEngine.compute({
        projectId: 'PRJ-105',
        projectName: 'Nayi Disha Training Institute',
        reportingDate: 'Today (04 Sep 2026)',
        capacity: 60,
        reportedAttendance: 29,
        cctvEstimatedOccupancy: null, // CCTV is Offline
        historicalRecords: mockHistory,
      });
    }

    // Default Fallback (e.g. Jeevan Support Institute PRJ-102)
    const genericHistory: AttendanceRecord[] = [
      { id: 'GH-1', date: '02 Sep', capacity: 90, reportedAttendance: 85, absentCount: 5, attendanceRate: 94.4, isSyntheticDemo: true },
      { id: 'GH-2', date: '01 Sep', capacity: 90, reportedAttendance: 83, absentCount: 7, attendanceRate: 92.2, isSyntheticDemo: true },
      { id: 'GH-3', date: '29 Aug', capacity: 90, reportedAttendance: 84, absentCount: 6, attendanceRate: 93.3, isSyntheticDemo: true },
    ];
    return AttendanceAnalyticsEngine.compute({
      projectId,
      projectName: 'Jeevan Support Institute',
      reportingDate: 'Today (04 Sep 2026)',
      capacity: 90,
      reportedAttendance: 84,
      cctvEstimatedOccupancy: 81,
      historicalRecords: genericHistory,
    });
  }

  async markProjectForFollowUp(
    projectId: string,
    notes?: string
  ): Promise<{ success: boolean; marked: boolean; message: string }> {
    const isCurrentlyMarked = !!this.followUpFlags[projectId]?.marked;
    const newStatus = !isCurrentlyMarked;

    this.followUpFlags[projectId] = {
      marked: newStatus,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      notes,
    };

    return {
      success: true,
      marked: newStatus,
      message: newStatus
        ? 'Facility flagged for official administrative follow-up.'
        : 'Follow-up flag cleared by authorized official.',
    };
  }

  isFollowUpMarked(projectId: string): boolean {
    return !!this.followUpFlags[projectId]?.marked;
  }
}

export const mockAnalyticsService = new MockAnalyticsService();
