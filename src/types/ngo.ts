/**
 * NGO / Institute Domain Types
 * SIH26095 | MoSJE NGO Portal
 */

export interface BeneficiaryRecord {
  id: string; // e.g. 'BEN-101-01'
  projectId: string; // e.g. 'PRJ-101'
  name: string; // e.g. 'Ramesh Kumar'
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  category: string; // e.g. 'Orthopedic Rehabilitation', 'Special Care', 'De-addiction'
  enrolledDate: string;
  attendanceStatus: 'Present' | 'Absent' | 'On Leave';
  verificationStatus: 'Biometric Verified' | 'Manual Roll-Call' | 'Pending Verification';
  lastVerifiedAt?: string;
  biometricTerminalId?: string;
  hasDiscrepancy?: boolean;
}

export type RequestCategory =
  | 'Variance Clarification'
  | 'Inspection Notice'
  | 'CCTV Health Inquiry'
  | 'Data Correction'
  | 'Grant Compliance'
  | 'Grant Inquiry'
  | 'Facility Update'
  | 'Technical Issue';

export type RequestStatus =
  | 'Action Required'
  | 'Responded'
  | 'Resolved'
  | 'Under Review';

export interface NgoOfficialRequest {
  id: string; // e.g. 'MOSJE-REQ-2026-44'
  projectId: string;
  title: string;
  category: RequestCategory;
  status: RequestStatus;
  issuedBy: string; // e.g. 'Joint Director Desk, MoSJE'
  issuedAt: string;
  description: string;
  direction: 'INCOMING_FROM_OFFICIAL' | 'OUTGOING_FROM_NGO';
  responseNotes?: string;
  respondedAt?: string;
  respondedBy?: string;
  referenceNoticeId?: string;
}

export interface NgoComplianceStatus {
  complianceScore: number; // e.g. 71
  attendanceRate: number; // e.g. 84
  cctvStatus: 'Online' | 'Offline' | 'Intermittent';
  cctvEstimatedCount: number; // e.g. 25
  reportedCount: number; // e.g. 42
  capacity: number; // e.g. 50
  variance: number; // e.g. 17
  unresolvedRequestsCount: number;
  lastAuditedDate: string;
}

export interface SurpriseVideoCallSession {
  id: string;
  projectId: string;
  officerName: string;
  officerTitle: string;
  requestedAt: string;
  answeredAt?: string;
  status: 'REQUESTED' | 'ANSWERED' | 'COMPLETED' | 'MISSED';
  result?: 'VERIFIED' | 'SUSPICIOUS' | 'UNREACHABLE';
  checklist: {
    inchargeIdentityVerified: boolean;
    headcountVerified: boolean;
    facilityInspected: boolean;
  };
  observedCount?: number;
  notes?: string;
}
