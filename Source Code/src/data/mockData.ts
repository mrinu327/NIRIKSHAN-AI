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
import { InspectionAssignment, DemoInspector } from '../types/inspection';
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
// DEMO INSPECTOR POOL (MoSJE PMU ROSTER)
// ==========================================
export const DEMO_INSPECTORS: DemoInspector[] = [
  {
    id: 'USR-INSP-DEMO-004',
    name: 'Vikram Singh',
    demoId: 'INSP-DEL-042',
    designation: 'PMU Inspection Officer',
    department: 'PMU Field Inspection Wing',
    organization: 'State Project Monitoring Unit (Demo)',
    assignedLocation: 'Delhi North & NCR (Demo)',
    jurisdiction: 'Zone 1 - Rohini / North Delhi',
    active: true,
    currentAssignmentCount: 1,
    contactEmail: 'vikram.singh.pmu@mosje.gov.in.demo',
  },
  {
    id: 'USR-INSP-DEMO-005',
    name: 'Demo Field Inspector B',
    demoId: 'PMU-DEMO-005',
    designation: 'PMU Senior Inspection Officer',
    department: 'PMU Field Inspection Wing',
    organization: 'State Project Monitoring Unit (Demo)',
    assignedLocation: 'Delhi Central & NCR (Demo)',
    jurisdiction: 'Zone 2 - Central & West Delhi',
    active: true,
    currentAssignmentCount: 2,
    contactEmail: 'inspector.b.demo@pmu.gov.in.demo',
  },
  {
    id: 'USR-INSP-DEMO-006',
    name: 'Demo Field Inspector C',
    demoId: 'PMU-DEMO-006',
    designation: 'PMU Reserve Inspection Officer',
    department: 'PMU Field Inspection Wing',
    organization: 'State Project Monitoring Unit (Demo)',
    assignedLocation: 'NCR South District (Demo)',
    jurisdiction: 'Zone 3 - South Delhi',
    active: false, // Inactive / On Medical Leave to demonstrate transparent active pool filtering
    currentAssignmentCount: 0,
    contactEmail: 'inspector.c.demo@pmu.gov.in.demo',
  },
];

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
    name: 'Dr. Rajesh Kumar, IAS',
    role: 'official',
    designation: 'Joint Secretary (National Monitoring Division)',
    department: 'MoSJE Central Monitoring Wing',
    organization: 'Ministry of Social Justice & Empowerment',
    email: 'rajesh.kumar.ias@mosje.gov.in.demo',
    badgeId: 'MoSJE-DIR-2026-042',
    assignedLocation: 'Shastri Bhawan, New Delhi',
  },
  inspector: {
    id: 'USR-INSP-DEMO-004',
    name: 'Vikram Singh',
    role: 'inspector',
    designation: 'PMU Inspection Officer',
    department: 'PMU Field Inspection Wing',
    organization: 'State Project Monitoring Unit (Demo)',
    email: 'vikram.singh.pmu@mosje.gov.in.demo',
    assignedLocation: 'Delhi North & NCR (Demo)',
    badgeId: 'INSP-DEL-042',
  },
  inspector_a: {
    id: 'USR-INSP-DEMO-004',
    name: 'Vikram Singh',
    role: 'inspector',
    designation: 'PMU Inspection Officer',
    department: 'PMU Field Inspection Wing',
    organization: 'State Project Monitoring Unit (Demo)',
    email: 'vikram.singh.pmu@mosje.gov.in.demo',
    assignedLocation: 'Delhi North & NCR (Demo)',
    badgeId: 'INSP-DEL-042',
  },
  inspector_b: {
    id: 'USR-INSP-DEMO-005',
    name: 'Demo Field Inspector B',
    role: 'inspector',
    designation: 'PMU Senior Inspection Officer',
    department: 'PMU Field Inspection Wing',
    organization: 'State Project Monitoring Unit (Demo)',
    email: 'inspector.b.demo@pmu.gov.in.demo',
    assignedLocation: 'Delhi Central & NCR (Demo)',
    badgeId: 'PMU-DEMO-005',
  },
  ngo: {
    id: 'USR-NGO-DEMO-03',
    name: 'Sunrise Rehabilitation Centre',
    role: 'ngo',
    designation: 'Sanjay Gupta, Centre Director',
    department: 'DDRS Scheme Implementation',
    organization: 'Sunrise Rehabilitation Centre (DDRS Sanctioned)',
    email: 'sanjay.gupta@sunriserehab.org.demo',
    assignedLocation: 'Sector 14, Rohini, New Delhi',
    badgeId: 'NGO-DEL-2026-08',
    institutionScope: 'Sunrise Rehabilitation Centre (PRJ-101)',
  },
};

// Uppercase aliases for complete cross-role support
DEMO_PROFILES.OFFICIAL = DEMO_PROFILES.official;
DEMO_PROFILES.INSPECTOR = DEMO_PROFILES.inspector;
DEMO_PROFILES.NGO = DEMO_PROFILES.ngo;

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
    status: 'Awaiting Assignment',
    assignedOfficerId: '',
    assignedOfficerName: 'Unassigned (Awaiting Automated Selection)',
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
    assignedOfficerId: 'USR-INSP-DEMO-005',
    assignedOfficerName: 'Demo Field Inspector B',
    assignedOfficerDemoId: 'PMU-DEMO-005',
    assignmentMethod: 'Automated Random Selection',
    assignmentTimestamp: '02 Feb 2026, 09:30 AM',
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
    assignedOfficerId: 'USR-INSP-DEMO-004',
    assignedOfficerName: 'Demo Field Inspector A',
    assignedOfficerDemoId: 'PMU-DEMO-004',
    assignmentMethod: 'Automated Random Selection',
    assignmentTimestamp: '01 Feb 2026, 11:00 AM',
    assignedDate: '01 Feb 2026',
    dueDate: '20 Feb 2026',
    scheduledTime: '10:00 AM (Tomorrow)',
    triggerReason: 'Quarterly Overdue Routine Audit',
    checklistCompletedCount: 0,
    totalChecklistCount: 12,
  },
  {
    id: 'INSP-8798',
    projectId: 'PRJ-104',
    projectName: 'Samarthya Disability Skill Development Centre',
    projectAddress: 'Plot 15, Industrial Estate, Okhla Phase III',
    city: 'New Delhi',
    type: 'Routine Inspection',
    priority: 'NORMAL',
    status: 'Completed',
    assignedOfficerId: 'USR-INSP-DEMO-004',
    assignedOfficerName: 'Demo Field Inspector A',
    assignedOfficerDemoId: 'PMU-DEMO-004',
    assignmentMethod: 'Automated Random Selection',
    assignmentTimestamp: '18 Jan 2026, 09:15 AM',
    assignedDate: '18 Jan 2026',
    dueDate: '18 Jan 2026',
    scheduledTime: '11:00 AM',
    triggerReason: 'Routine annual institutional inspection schedule',
    checklistCompletedCount: 13,
    totalChecklistCount: 13,
    acknowledgedAt: '18 Jan 2026, 09:30 AM',
    acknowledgedBy: 'Demo Field Inspector A (PMU-DEMO-004)',
    startedAt: '18 Jan 2026, 10:45 AM',
    submittedAt: '18 Jan 2026, 03:45 PM',
    submittedBy: 'Demo Field Inspector A (PMU-DEMO-004)',
    isLocationVerified: true,
    distanceMeters: 42,
    geofenceStatus: 'INSIDE',
    geofenceVerifiedAt: '18 Jan 2026, 10:42 AM',
    isBiometricVerified: true,
    biometricType: 'FINGERPRINT',
    biometricTimestamp: '18 Jan 2026, 10:44 AM',
    checklistResponses: {
      'chk-op-1': { id: 'chk-op-1', category: 'Project Operations', title: 'Project / institute is operational', description: 'Facility is open, functioning, and actively engaged in MoSJE mandate.', status: 'Verified' },
      'chk-op-2': { id: 'chk-op-2', category: 'Project Operations', title: 'Services are being provided', description: 'Authorized rehabilitation, vocational, or care services are actively being delivered to beneficiaries.', status: 'Verified' },
      'chk-op-3': { id: 'chk-op-3', category: 'Project Operations', title: 'Staff are present', description: 'Required administrative, medical, teaching, or caretaking staff are on-site.', status: 'Verified' },
      'chk-op-4': { id: 'chk-op-4', category: 'Project Operations', title: 'Beneficiary activity is observable', description: 'Enrolled beneficiaries are engaged in scheduled daily activities, therapy, or classrooms.', status: 'Verified' },
      'chk-ben-1': { id: 'chk-ben-1', category: 'Beneficiary Verification', title: 'Beneficiary records are available for verification', description: 'Physical or digital beneficiary identity rosters are accessible for audit.', status: 'Verified' },
      'chk-ben-2': { id: 'chk-ben-2', category: 'Beneficiary Verification', title: 'Reported beneficiary count can be cross-checked', description: 'Physical headcount can be reconciled against the daily reported attendance submission.', status: 'Verified' },
      'chk-ben-3': { id: 'chk-ben-3', category: 'Beneficiary Verification', title: 'Observed beneficiary activity is consistent with reported information', description: 'Activities observed correspond directly with sanctioned project category.', status: 'Verified' },
      'chk-inf-1': { id: 'chk-inf-1', category: 'Infrastructure / Facility', title: 'Facility is accessible', description: 'Physical premises location matches registered institutional area and ingress/egress is unobstructed.', status: 'Verified' },
      'chk-inf-2': { id: 'chk-inf-2', category: 'Infrastructure / Facility', title: 'Required facilities are available', description: 'Mandatory amenities including clean drinking water, barrier-free access, and sanitation are present.', status: 'Verified' },
      'chk-inf-3': { id: 'chk-inf-3', category: 'Infrastructure / Facility', title: 'Basic infrastructure appears operational', description: 'Power backup, ventilation, fire safety equipment, and CCTV edge hardware appear operational.', status: 'Verified' },
      'chk-rec-1': { id: 'chk-rec-1', category: 'Records / Documentation', title: 'Attendance / beneficiary records available', description: 'Daily biometric logs or physical sign-in registers are available for inspection.', status: 'Verified' },
      'chk-rec-2': { id: 'chk-rec-2', category: 'Records / Documentation', title: 'Relevant registers / documents available', description: 'Staff attendance register, visitor logs, and daily medical logs are maintained up to date.', status: 'Verified' },
      'chk-rec-3': { id: 'chk-rec-3', category: 'Records / Documentation', title: 'Required project records available for inspection', description: 'Sanction order, expenditure vouchers, and meal schedule registers available on request.', status: 'Verified' },
    },
    findings: {
      overallObservation: 'Institution is functioning with full compliance to MoSJE scheme norms. Skill training equipment is well maintained and accessible to orthopedically handicapped students.',
      keyFindings: '32 beneficiaries physically present verified against 34 in morning roster. Two absent beneficiaries had written leave requests in file. Barrier-free ramp and tactile pavers installed.',
      issuesRequiringFollowUp: 'Biometric fingerprint reader USB cable is worn; institution in-charge requested replacement sensor unit.',
      additionalRemarks: 'Vocational computer lab operational. Recommended for continuation of quarterly grant release.',
    },
    evidenceItems: [
      {
        id: 'evid-hist-01',
        type: 'photo',
        category: 'Attendance Headcount',
        title: 'Computer Training Hall Headcount',
        timestamp: '18 Jan 2026, 11:15 AM',
        fileUri: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
        originalPhotoUri: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
        latitude: 28.5355,
        longitude: 77.2711,
        geofenceStatus: 'INSIDE',
        hash: '8f7a91c0b34de123fa99b244ce90d65b1287e0fa19a4e8d2bb29851f11a43290',
        fileSize: '2.4 MB',
        fileType: 'image/jpeg',
        integrityStatus: 'VERIFIED',
      },
      {
        id: 'evid-hist-02',
        type: 'photo',
        category: 'Infrastructure',
        title: 'Barrier-Free Ramp & Entrance',
        timestamp: '18 Jan 2026, 11:32 AM',
        fileUri: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80',
        originalPhotoUri: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80',
        latitude: 28.5356,
        longitude: 77.2712,
        geofenceStatus: 'INSIDE',
        hash: 'e499c891f7b0a12e3458cd801aa32ef1769842f1a90c42738b52a1910ef41b65',
        fileSize: '1.9 MB',
        fileType: 'image/jpeg',
        integrityStatus: 'VERIFIED',
      },
    ],
  },
  {
    id: 'INSP-8799',
    projectId: 'PRJ-105',
    projectName: 'Navjyoti Integrated Rehabilitation Centre',
    projectAddress: 'Opposite Community Hall, Rohini Sector 7',
    city: 'New Delhi',
    type: 'Surprise Inspection',
    priority: 'HIGH',
    isSurprise: true,
    status: 'Submitted / Awaiting Review',
    assignedOfficerId: 'USR-INSP-DEMO-004',
    assignedOfficerName: 'Demo Field Inspector A',
    assignedOfficerDemoId: 'PMU-DEMO-004',
    assignmentMethod: 'Automated Random Selection',
    assignmentTimestamp: '02 Feb 2026, 08:30 AM',
    assignedDate: '02 Feb 2026',
    dueDate: '02 Feb 2026',
    scheduledTime: '10:15 AM',
    triggerReason: 'Surprise audit triggered by automated biometric anomaly alert #ALT-1088',
    checklistCompletedCount: 13,
    totalChecklistCount: 13,
    acknowledgedAt: '02 Feb 2026, 08:45 AM',
    acknowledgedBy: 'Demo Field Inspector A (PMU-DEMO-004)',
    startedAt: '02 Feb 2026, 10:20 AM',
    submittedAt: '02 Feb 2026, 02:45 PM',
    submittedBy: 'Demo Field Inspector A (PMU-DEMO-004)',
    isLocationVerified: true,
    distanceMeters: 56,
    geofenceStatus: 'INSIDE',
    geofenceVerifiedAt: '02 Feb 2026, 10:18 AM',
    isBiometricVerified: true,
    biometricType: 'FINGERPRINT',
    biometricTimestamp: '02 Feb 2026, 10:19 AM',
    checklistResponses: {
      'chk-op-1': { id: 'chk-op-1', category: 'Project Operations', title: 'Project / institute is operational', description: 'Facility is open, functioning, and actively engaged in MoSJE mandate.', status: 'Verified' },
      'chk-op-2': { id: 'chk-op-2', category: 'Project Operations', title: 'Services are being provided', description: 'Authorized rehabilitation, vocational, or care services are actively being delivered to beneficiaries.', status: 'Verified' },
      'chk-op-3': { id: 'chk-op-3', category: 'Project Operations', title: 'Staff are present', description: 'Required administrative, medical, teaching, or caretaking staff are on-site.', status: 'Needs Attention', notes: 'Part-time counselor was absent without substitute.' },
      'chk-op-4': { id: 'chk-op-4', category: 'Project Operations', title: 'Beneficiary activity is observable', description: 'Enrolled beneficiaries are engaged in scheduled daily activities, therapy, or classrooms.', status: 'Verified' },
      'chk-ben-1': { id: 'chk-ben-1', category: 'Beneficiary Verification', title: 'Beneficiary records are available for verification', description: 'Physical or digital beneficiary identity rosters are accessible for audit.', status: 'Verified' },
      'chk-ben-2': { id: 'chk-ben-2', category: 'Beneficiary Verification', title: 'Reported beneficiary count can be cross-checked', description: 'Physical headcount can be reconciled against the daily reported attendance submission.', status: 'Needs Attention', notes: 'Headcount 19 vs claimed 26. 7 absent.' },
      'chk-ben-3': { id: 'chk-ben-3', category: 'Beneficiary Verification', title: 'Observed beneficiary activity is consistent with reported information', description: 'Activities observed correspond directly with sanctioned project category.', status: 'Verified' },
      'chk-inf-1': { id: 'chk-inf-1', category: 'Infrastructure / Facility', title: 'Facility is accessible', description: 'Physical premises location matches registered institutional area and ingress/egress is unobstructed.', status: 'Verified' },
      'chk-inf-2': { id: 'chk-inf-2', category: 'Infrastructure / Facility', title: 'Required facilities are available', description: 'Mandatory amenities including clean drinking water, barrier-free access, and sanitation are present.', status: 'Verified' },
      'chk-inf-3': { id: 'chk-inf-3', category: 'Infrastructure / Facility', title: 'Basic infrastructure appears operational', description: 'Power backup, ventilation, fire safety equipment, and CCTV edge hardware appear operational.', status: 'Verified' },
      'chk-rec-1': { id: 'chk-rec-1', category: 'Records / Documentation', title: 'Attendance / beneficiary records available', description: 'Daily biometric logs or physical sign-in registers are available for inspection.', status: 'Verified' },
      'chk-rec-2': { id: 'chk-rec-2', category: 'Records / Documentation', title: 'Relevant registers / documents available', description: 'Staff attendance register, visitor logs, and daily medical logs are maintained up to date.', status: 'Verified' },
      'chk-rec-3': { id: 'chk-rec-3', category: 'Records / Documentation', title: 'Required project records available for inspection', description: 'Sanction order, expenditure vouchers, and meal schedule registers available on request.', status: 'Verified' },
    },
    findings: {
      overallObservation: 'Surprise field inspection carried out following discrepancy alert. Facility is operational, but morning attendance numbers showed variance against portal claims.',
      keyFindings: '19 resident patients observed during physical headcount compared to 26 in submitted portal roster. Management provided explanation that 5 patients were on hospital OPD visits and 2 on sanctioned family leave.',
      issuesRequiringFollowUp: 'Official medical referral slips for 5 hospital OPD patients must be uploaded to MoSJE portal within 48 hours for regularisation.',
      additionalRemarks: 'Kitchen hygiene and medication storage were compliant. Surprise protocol maintained with zero advance notice.',
    },
    evidenceItems: [
      {
        id: 'evid-hist-03',
        type: 'photo',
        category: 'Physical Headcount',
        title: 'Morning Gathering & Headcount Photo',
        timestamp: '02 Feb 2026, 10:45 AM',
        fileUri: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80',
        originalPhotoUri: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80',
        latitude: 28.7041,
        longitude: 77.1025,
        geofenceStatus: 'INSIDE',
        hash: '3d81b942a4901f4c78119842c2635a812df9045b8423e80911762e10a2bc61a4',
        fileSize: '2.1 MB',
        fileType: 'image/jpeg',
        integrityStatus: 'VERIFIED',
      },
    ],
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
