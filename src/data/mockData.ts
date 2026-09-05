/**
 * Synthetic Demo Dataset for SIH26095
 * Ministry of Social Justice & Empowerment (MoSJE)
 * 
 * NOTE: All data contained herein is purely synthetic mock data generated for
 * prototype demonstration purposes in the Smart India Hackathon 2026.
 * It does NOT represent any real individuals, institutions, or official records.
 */

import { Project, ProjectStatsSummary } from '../types/project';
import { AnomalyAlert } from '../types/alert';
import { InspectionAssignment } from '../types/inspection';
import { AttendanceSubmission, AttendanceSummary } from '../types/attendance';
import { RoleConfig, UserProfile } from '../types/role';

// ==========================================
// SHARED SOURCE OF TRUTH: SUNRISE REHABILITATION CENTRE ATTENDANCE
// ==========================================
export const SUNRISE_ATTENDANCE = {
  totalBeneficiaries: 50,
  currentSubmittedAttendance: 42,
  absent: 8,
  attendanceRate: 84, // 84%
  submittedAt: '09:28 AM Today',
  status: 'Submitted' as const,
};

// ==========================================
// ROLE SELECTION CONFIGURATIONS
// ==========================================
export const DEMO_ROLES: RoleConfig[] = [
  {
    id: 'official',
    title: 'Government Official',
    subtitle: 'Ministry of Social Justice & Empowerment',
    description: 'Monitor projects, review alerts and oversee inspections.',
    department: 'MoSJE Monitoring Division',
    badgeLabel: 'DEMO / REVIEWER',
    iconName: 'shield-checkmark',
  },
  {
    id: 'inspector',
    title: 'PMU / Inspection Officer',
    subtitle: 'Project Monitoring Unit (Field)',
    description: 'Manage assigned inspections and capture field evidence.',
    department: 'PMU Field Inspection Wing',
    badgeLabel: 'DEMO / AUDITOR',
    iconName: 'clipboard',
  },
  {
    id: 'ngo',
    title: 'NGO / Institute',
    subtitle: 'Implementing Agency Portal',
    description: 'Submit attendance and respond to monitoring activities.',
    department: 'Sunrise Rehabilitation Centre',
    badgeLabel: 'DEMO / INSTITUTE',
    iconName: 'business',
  },
];

export const DEMO_PROFILES: Record<string, UserProfile> = {
  official: {
    id: 'USR-GOV-DEMO-01',
    name: 'Demo Government Official',
    role: 'official',
    designation: 'National Monitoring Division',
    department: 'National Monitoring Division',
    organization: 'Ministry of Social Justice & Empowerment',
    email: 'official.demo@mosje.gov.in.demo',
    badgeId: 'GOV-DEMO-001',
  },
  inspector: {
    id: 'USR-INSP-DEMO-02',
    name: 'Demo PMU Inspector',
    role: 'inspector',
    designation: 'PMU Field Inspection Wing',
    department: 'PMU Field Inspection Wing',
    organization: 'State Project Monitoring Unit (Demo)',
    email: 'inspector.demo@pmu.gov.in.demo',
    assignedLocation: 'NCR North District (Demo)',
    badgeId: 'PMU-DEMO-002',
  },
  ngo: {
    id: 'USR-NGO-DEMO-03',
    name: 'Demo Institute Representative',
    role: 'ngo',
    designation: 'Centre Administrator (Demo)',
    department: 'Sunrise Rehabilitation Centre',
    organization: 'Sunrise Rehabilitation Centre (Demo)',
    email: 'admin.demo@sunriserehab.org.demo',
    assignedLocation: 'Sector 14, Rohini, New Delhi',
    badgeId: 'NGO-DEMO-003',
  },
};

// ==========================================
// MOCK PROJECTS
// ==========================================
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-101',
    name: 'Sunrise Rehabilitation Centre',
    code: 'MOSJE-DL-2026-01',
    category: 'Rehabilitation',
    location: {
      city: 'New Delhi',
      state: 'Delhi',
      address: 'Plot 42, Institutional Area, Sector 14, Rohini',
    },
    status: 'High Priority',
    priority: 'HIGH',
    attendance: {
      present: SUNRISE_ATTENDANCE.currentSubmittedAttendance,
      capacity: SUNRISE_ATTENDANCE.totalBeneficiaries,
      submittedAt: SUNRISE_ATTENDANCE.submittedAt,
      status: SUNRISE_ATTENDANCE.status,
    },
    cctvStatus: 'Discrepancy Detected',
    lastInspectionDate: '12 Jan 2026',
    nextInspectionDueDate: '10 Feb 2026',
    assignedOfficer: 'Demo PMU Inspector',
    complianceScore: 71,
    notes: 'Camera telemetry indicates discrepancy between submitted attendance (42) and entry estimates (25). Flagged for surprise verification.',
  },
  {
    id: 'PRJ-102',
    name: 'Jeevan Support Institute',
    code: 'MOSJE-MH-2026-14',
    category: 'Special Care',
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Survey 18/2, Baner Road, Pune',
    },
    status: 'Normal',
    priority: 'NORMAL',
    attendance: {
      present: 84,
      capacity: 90,
      submittedAt: '09:45 AM Today',
      status: 'Submitted',
    },
    cctvStatus: 'Online',
    lastInspectionDate: '04 Feb 2026',
    nextInspectionDueDate: '20 Apr 2026',
    assignedOfficer: 'Kavita Deshmukh (Demo)',
    complianceScore: 94,
    notes: 'All biometric submissions and feed heartbeats operating within normal parameters.',
  },
  {
    id: 'PRJ-103',
    name: 'Udaya Welfare Hostel',
    code: 'MOSJE-KA-2026-08',
    category: 'Welfare Hostel',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      address: '22/B, 5th Main, Jayanagar 4th Block',
    },
    status: 'Inspection Due',
    priority: 'MEDIUM',
    attendance: {
      present: 62,
      capacity: 65,
      submittedAt: '10:00 AM Today',
      status: 'Submitted',
    },
    cctvStatus: 'Online',
    lastInspectionDate: '01 Nov 2025',
    nextInspectionDueDate: '05 Feb 2026',
    assignedOfficer: 'S. Ramanathan (Demo)',
    complianceScore: 86,
    notes: 'Quarterly routine audit is past due date. Scheduled for PMU assignment.',
  },
  {
    id: 'PRJ-104',
    name: 'Saksham Community Centre',
    code: 'MOSJE-MP-2026-19',
    category: 'Community Support',
    location: {
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      address: 'Near Old Subhash Nagar, Bhopal',
    },
    status: 'Normal',
    priority: 'NORMAL',
    attendance: {
      present: 45,
      capacity: 50,
      submittedAt: '09:15 AM Today',
      status: 'Verified',
    },
    cctvStatus: 'Intermittent',
    lastInspectionDate: '18 Dec 2025',
    nextInspectionDueDate: '18 Mar 2026',
    assignedOfficer: 'Mohd. Tariq (Demo)',
    complianceScore: 89,
    notes: 'CCTV telemetry connection experienced 2 minor drops this morning. Connectivity restored.',
  },
  {
    id: 'PRJ-105',
    name: 'Nayi Disha Training Institute',
    code: 'MOSJE-UP-2026-32',
    category: 'Skill Development',
    location: {
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      address: 'Vibhuti Khand, Gomti Nagar, Lucknow',
    },
    status: 'High Priority',
    priority: 'HIGH',
    attendance: {
      present: 29,
      capacity: 60,
      submittedAt: 'Pending',
      status: 'Pending',
    },
    cctvStatus: 'Offline',
    lastInspectionDate: '15 Oct 2025',
    nextInspectionDueDate: '15 Jan 2026',
    assignedOfficer: 'Pooja Tiwari (Demo)',
    complianceScore: 64,
    notes: 'Telemetry offline for 48+ hours and today attendance submission delayed past 11:00 AM cutoff.',
  },
];

// ==========================================
// MOCK ALERTS (MoSJE Compliant Neutral Phrasing)
// ==========================================
export const MOCK_ALERTS: AnomalyAlert[] = [
  {
    id: 'ALT-2601',
    projectId: 'PRJ-101',
    projectName: 'Sunrise Rehabilitation Centre',
    category: 'Discrepancy detected',
    severity: 'HIGH',
    status: 'Pending Review',
    timestamp: 'Today, 10:14 AM',
    description: 'Submitted attendance (42) differs from estimated feed traffic (25). Requires verification.',
    metricComparison: {
      reportedAttendance: SUNRISE_ATTENDANCE.currentSubmittedAttendance,
      headcountEstimate: 25,
      difference: 17,
    },
    humanReviewRequired: true,
  },
  {
    id: 'ALT-2602',
    projectId: 'PRJ-105',
    projectName: 'Nayi Disha Training Institute',
    category: 'CCTV telemetry offline',
    severity: 'HIGH',
    status: 'Pending Review',
    timestamp: 'Yesterday, 06:30 PM',
    description: 'CCTV feed stream lost contact with regional edge gateway. Human review required for field verification.',
    humanReviewRequired: true,
  },
  {
    id: 'ALT-2603',
    projectId: 'PRJ-103',
    projectName: 'Udaya Welfare Hostel',
    category: 'Inspection overdue',
    severity: 'MEDIUM',
    status: 'Pending Review',
    timestamp: 'Yesterday, 09:00 AM',
    description: 'Quarterly compliance review elapsed 90-day grace period. Needs PMU inspector dispatch.',
    humanReviewRequired: true,
  },
];

// ==========================================
// MOCK INSPECTIONS
// ==========================================
export const MOCK_INSPECTIONS: InspectionAssignment[] = [
  {
    id: 'INSP-8801',
    projectId: 'PRJ-101',
    projectName: 'Sunrise Rehabilitation Centre',
    projectAddress: 'Plot 42, Institutional Area, Sector 14, Rohini',
    city: 'New Delhi',
    type: 'Surprise Inspection',
    priority: 'HIGH',
    status: 'Assigned',
    assignedOfficerId: 'USR-INSP-DEMO-02',
    assignedOfficerName: 'Demo PMU Inspector',
    assignedDate: 'Today, 10:30 AM',
    dueDate: 'Today, 04:00 PM',
    scheduledTime: '11:45 AM',
    triggerReason: 'Triggered by discrepancy alert #ALT-2601 (Variance between 42 reported and 25 estimated)',
    checklistCompletedCount: 0,
    totalChecklistCount: 8,
  },
  {
    id: 'INSP-8802',
    projectId: 'PRJ-102',
    projectName: 'Jeevan Support Institute',
    projectAddress: 'Survey 18/2, Baner Road, Pune',
    city: 'Pune',
    type: 'Routine Inspection',
    priority: 'NORMAL',
    status: 'In Progress',
    assignedOfficerId: 'USR-INSP-DEMO-02',
    assignedOfficerName: 'Demo PMU Inspector',
    assignedDate: '02 Feb 2026',
    dueDate: '15 Feb 2026',
    scheduledTime: '02:00 PM',
    triggerReason: 'Annual Scheduled PMU Verification',
    checklistCompletedCount: 5,
    totalChecklistCount: 10,
  },
  {
    id: 'INSP-8803',
    projectId: 'PRJ-103',
    projectName: 'Udaya Welfare Hostel',
    projectAddress: '22/B, 5th Main, Jayanagar 4th Block',
    city: 'Bengaluru',
    type: 'Special Audit',
    priority: 'MEDIUM',
    status: 'Scheduled',
    assignedOfficerId: 'USR-INSP-DEMO-02',
    assignedOfficerName: 'Demo PMU Inspector',
    assignedDate: '01 Feb 2026',
    dueDate: '20 Feb 2026',
    scheduledTime: '10:00 AM (Tomorrow)',
    triggerReason: 'Quarterly Overdue Routine Audit',
    checklistCompletedCount: 0,
    totalChecklistCount: 12,
  },
];

// ==========================================
// MOCK ATTENDANCE SUMMARY (SHARED SINGLE SOURCE OF TRUTH)
// ==========================================
export const MOCK_ATTENDANCE_SUMMARY: AttendanceSummary = {
  todayPresent: SUNRISE_ATTENDANCE.currentSubmittedAttendance,
  todayCapacity: SUNRISE_ATTENDANCE.totalBeneficiaries,
  submissionStatus: SUNRISE_ATTENDANCE.status,
  lastSubmittedTime: SUNRISE_ATTENDANCE.submittedAt,
  weeklyAverage: 43.5,
};

export const MOCK_ATTENDANCE_HISTORY: AttendanceSubmission[] = [
  {
    id: 'ATT-901',
    projectId: 'PRJ-101',
    projectName: 'Sunrise Rehabilitation Centre',
    date: 'Today (04 Sep)',
    presentCount: SUNRISE_ATTENDANCE.currentSubmittedAttendance,
    totalEnrolled: SUNRISE_ATTENDANCE.totalBeneficiaries,
    absentCount: SUNRISE_ATTENDANCE.absent,
    status: 'Submitted',
    submittedBy: 'Demo Institute Representative',
    submittedAt: '09:28 AM',
    batchId: 'BATCH-2026-A',
  },
  {
    id: 'ATT-900',
    projectId: 'PRJ-101',
    projectName: 'Sunrise Rehabilitation Centre',
    date: 'Yesterday (03 Sep)',
    presentCount: 44,
    totalEnrolled: 50,
    absentCount: 6,
    status: 'Verified',
    submittedBy: 'Demo Institute Representative',
    submittedAt: '09:18 AM',
    batchId: 'BATCH-2026-A',
  },
];

// ==========================================
// MOCK OFFICIAL DASHBOARD SUMMARY
// ==========================================
export const MOCK_OFFICIAL_STATS: ProjectStatsSummary = {
  totalProjects: 148,
  highPriorityCount: 6,
  pendingInspectionsCount: 14,
  activeCCTVCount: 139,
  totalAlertsCount: 9,
};

// ==========================================
// MOCK INSPECTOR SUMMARY
// ==========================================
export const MOCK_INSPECTOR_STATS = {
  assignedInspections: 3,
  todaysTasks: 2,
  highPriority: 1,
  completedThisMonth: 11,
};
