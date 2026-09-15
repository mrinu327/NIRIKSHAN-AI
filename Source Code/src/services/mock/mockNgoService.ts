/**
 * Mock NGO Service
 * SIH26095 | MoSJE NGO Portal Service
 *
 * Centralized dynamic service for:
 * - Beneficiary roster and roll-call records
 * - Official requests and clarification notices
 * - Institute compliance index calculation
 * - CCTV telemetry synchronization
 * - Surprise video-call verification lifecycle
 */

import {
  BeneficiaryRecord,
  NgoOfficialRequest,
  NgoComplianceStatus,
  SurpriseVideoCallSession,
  RequestCategory,
} from '../../types/ngo';
import { mockAttendanceService } from './mockAttendanceService';
import { mockCCTVService } from './mockCCTVService';
import { SUNRISE_ATTENDANCE } from '../../data/mockData';

// Initial synthetic beneficiary names under MoSJE DDRS mandate
const INITIAL_BENEFICIARIES_BASE = [
  { name: 'Ramesh Kumar', age: 28, gender: 'Male', category: 'Orthopedic Rehabilitation' },
  { name: 'Sunita Sharma', age: 34, gender: 'Female', category: 'Vocational Skill Training' },
  { name: 'Vikas Mehra', age: 22, gender: 'Male', category: 'De-addiction Rehabilitation' },
  { name: 'Anjali Verma', age: 31, gender: 'Female', category: 'Special Needs Care' },
  { name: 'Deepak Yadav', age: 40, gender: 'Male', category: 'Assistive Tech Training' },
  { name: 'Pooja Rani', age: 26, gender: 'Female', category: 'Vocational Skill Training' },
  { name: 'Manoj Tiwari', age: 38, gender: 'Male', category: 'De-addiction Rehabilitation' },
  { name: 'Kavita Devi', age: 45, gender: 'Female', category: 'Orthopedic Rehabilitation' },
  { name: 'Sanjay Rawat', age: 29, gender: 'Male', category: 'Special Needs Care' },
  { name: 'Preeti Joshi', age: 27, gender: 'Female', category: 'Vocational Skill Training' },
];

export class MockNgoService {
  private beneficiaries: BeneficiaryRecord[] = [];
  private requests: NgoOfficialRequest[] = [];
  private activeVideoCall: SurpriseVideoCallSession | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.initializeState();
  }

  private initializeState() {
    // 50 Sanctioned Beneficiaries (42 Present, 8 Absent matching initial SUNRISE_ATTENDANCE)
    this.beneficiaries = Array.from({ length: 50 }, (_, i) => {
      const base = INITIAL_BENEFICIARIES_BASE[i % INITIAL_BENEFICIARIES_BASE.length];
      const isPresent = i < SUNRISE_ATTENDANCE.currentSubmittedAttendance; // First 42 are present
      const padNum = (i + 1).toString().padStart(2, '0');

      return {
        id: `BEN-101-${padNum}`,
        projectId: 'PRJ-101',
        name: i < 10 ? base.name : `${base.name.split(' ')[0]} ${padNum}`,
        age: base.age + (i % 7),
        gender: base.gender as 'Male' | 'Female',
        category: base.category,
        enrolledDate: '15 Jan 2025',
        attendanceStatus: isPresent ? 'Present' : 'Absent',
        verificationStatus: isPresent ? 'Biometric Verified' : 'Manual Roll-Call',
        lastVerifiedAt: isPresent ? '09:25 AM Today' : undefined,
        biometricTerminalId: isPresent ? 'BIO-01' : undefined,
        hasDiscrepancy: !isPresent && i >= 42 && i < 45, // First 3 absentees flagged for explanation
      };
    });

    // Initial official notice from MoSJE
    this.requests = [
      {
        id: 'MOSJE-REQ-2026-44',
        projectId: 'PRJ-101',
        title: 'Clarification: Morning Roll-Call Variance',
        category: 'Variance Clarification',
        status: 'Action Required',
        issuedBy: 'Joint Director Desk, MoSJE',
        issuedAt: 'Today, 10:30 AM',
        description:
          'The automated telemetry recorded an entrance count below reported attendance. A PMU inspector has been assigned for routine physical verification today between 11:00 AM - 04:00 PM. Please ensure visitor logs and kitchen receipts are ready.',
        direction: 'INCOMING_FROM_OFFICIAL',
        referenceNoticeId: 'REF-MOSJE-2026-88',
      },
    ];

    // Initial pending surprise video call verification request (ready for demo launch)
    this.activeVideoCall = {
      id: 'VC-REQ-2026-09',
      projectId: 'PRJ-101',
      officerName: 'Priya Verma',
      officerTitle: 'PMU Central Verification Cell',
      requestedAt: '10:45 AM Today',
      status: 'REQUESTED',
      checklist: {
        inchargeIdentityVerified: false,
        headcountVerified: false,
        facilityInspected: false,
      },
      observedCount: 25,
      notes: 'Automated video verification audit triggered by CCTV attendance variance.',
    };
  }

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
        console.error('NGO service listener error:', err);
      }
    });
  }

  // ==========================================
  // BENEFICIARY ROSTER METHODS
  // ==========================================
  async getBeneficiaries(projectId?: string): Promise<BeneficiaryRecord[]> {
    return [...this.beneficiaries];
  }

  async toggleBeneficiaryAttendance(
    beneficiaryId: string,
    status: 'Present' | 'Absent' | 'On Leave',
    isBiometric = false
  ): Promise<BeneficiaryRecord | undefined> {
    const index = this.beneficiaries.findIndex((b) => b.id === beneficiaryId);
    if (index === -1) return undefined;

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    this.beneficiaries[index] = {
      ...this.beneficiaries[index],
      attendanceStatus: status,
      verificationStatus: isBiometric ? 'Biometric Verified' : 'Manual Roll-Call',
      lastVerifiedAt: status === 'Present' ? `${timeStr} Today` : undefined,
    };

    // Calculate updated present count
    const presentCount = this.beneficiaries.filter((b) => b.attendanceStatus === 'Present').length;
    await mockAttendanceService.submitDailyAttendance({
      projectId: 'PRJ-101',
      presentCount,
      totalEnrolled: this.beneficiaries.length,
      notes: `Updated via institutional roll-call register.`,
    });

    this.notify();
    return this.beneficiaries[index];
  }

  // ==========================================
  // COMPLIANCE & STATUS DYNAMIC CALCULATION
  // ==========================================
  async getComplianceStatus(projectId = 'PRJ-101'): Promise<NgoComplianceStatus> {
    const summary = await mockAttendanceService.getTodaySummary(projectId);
    const streams = await mockCCTVService.getProjectStreams(projectId);
    const primaryCam = streams[0];

    const cctvEstimatedCount = primaryCam?.currentEstimatedCount ?? 25;
    const reportedCount = summary.todayPresent;
    const capacity = summary.todayCapacity;
    const variance = Math.abs(reportedCount - cctvEstimatedCount);

    const unresolvedRequests = this.requests.filter((r) => r.status === 'Action Required').length;

    // Dynamic compliance scoring algorithm:
    // Base 100:
    // - Minus 20 points if CCTV headcount variance > 10 (unresolved variance)
    // - Minus 9 points if there is an unresponded official inquiry notice
    // Initial: 100 - 20 - 9 = 71 / 100!
    // When the NGO responds to the notice: 100 - 20 = 80 / 100!
    // When variance is resolved / verified: 100 / 100!
    let score = 100;
    if (variance > 10) score -= 20;
    if (unresolvedRequests > 0) score -= 9 * unresolvedRequests;
    if (score < 40) score = 40;

    const attendanceRate = Math.round((reportedCount / capacity) * 100);

    return {
      complianceScore: score,
      attendanceRate,
      cctvStatus: primaryCam?.status || 'Online',
      cctvEstimatedCount,
      reportedCount,
      capacity,
      variance,
      unresolvedRequestsCount: unresolvedRequests,
      lastAuditedDate: '12 Jan 2026',
    };
  }

  // ==========================================
  // OFFICIAL REQUESTS & NOTICES METHODS
  // ==========================================
  async getRequests(projectId = 'PRJ-101'): Promise<NgoOfficialRequest[]> {
    return [...this.requests];
  }

  async respondToRequest(
    requestId: string,
    responseNotes: string,
    respondedBy = 'Amit Sundaram (Centre Administrator)'
  ): Promise<NgoOfficialRequest | undefined> {
    const index = this.requests.findIndex((r) => r.id === requestId);
    if (index === -1) return undefined;

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    this.requests[index] = {
      ...this.requests[index],
      status: 'Responded',
      responseNotes,
      respondedAt: `Today, ${timeStr}`,
      respondedBy,
    };

    this.notify();
    return this.requests[index];
  }

  async createNgoRequest(data: {
    category: RequestCategory;
    title: string;
    description: string;
    projectId?: string;
  }): Promise<NgoOfficialRequest> {
    const id = `NGO-REQ-2026-${880 + this.requests.length + 1}`;
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newReq: NgoOfficialRequest = {
      id,
      projectId: data.projectId || 'PRJ-101',
      title: data.title,
      category: data.category,
      status: 'Under Review',
      issuedBy: 'Sunrise Rehabilitation Centre (NGO)',
      issuedAt: `Today, ${timeStr}`,
      description: data.description,
      direction: 'OUTGOING_FROM_NGO',
    };

    this.requests.unshift(newReq);
    this.notify();
    return newReq;
  }

  addOfficialNotice(data: {
    title: string;
    description: string;
    referenceId?: string;
    projectId?: string;
  }): NgoOfficialRequest {
    const id = `MOSJE-REQ-2026-${900 + this.requests.length + 1}`;
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newReq: NgoOfficialRequest = {
      id,
      projectId: data.projectId || 'PRJ-101',
      title: data.title,
      category: 'Variance Clarification',
      status: 'Action Required',
      issuedBy: 'MoSJE Central Desk',
      issuedAt: `Today, ${timeStr}`,
      description: data.description,
      direction: 'INCOMING_FROM_OFFICIAL',
      referenceNoticeId: data.referenceId,
    };

    this.requests.unshift(newReq);
    this.notify();
    return newReq;
  }


  // ==========================================
  // SURPRISE VIDEO CALL VERIFICATION METHODS
  // ==========================================
  async getIncomingSurpriseVideoCall(): Promise<SurpriseVideoCallSession | null> {
    return this.activeVideoCall;
  }

  async completeSurpriseVideoCall(
    sessionId: string,
    data: {
      checklist: {
        inchargeIdentityVerified: boolean;
        headcountVerified: boolean;
        facilityInspected: boolean;
      };
      observedCount: number;
      notes: string;
    }
  ): Promise<SurpriseVideoCallSession | null> {
    if (!this.activeVideoCall || this.activeVideoCall.id !== sessionId) return null;

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    this.activeVideoCall = {
      ...this.activeVideoCall,
      status: 'COMPLETED',
      result: 'VERIFIED',
      answeredAt: `Today, ${timeStr}`,
      checklist: data.checklist,
      observedCount: data.observedCount,
      notes: data.notes,
    };

    // Auto-resolve corresponding official variance request if any
    const reqIndex = this.requests.findIndex((r) => r.category === 'Variance Clarification');
    if (reqIndex !== -1 && this.requests[reqIndex].status !== 'Resolved') {
      this.requests[reqIndex] = {
        ...this.requests[reqIndex],
        status: 'Resolved',
        responseNotes: `Surprise video verification successfully completed on-site. Headcount verified: ${data.observedCount} beneficiaries.`,
        respondedAt: `Today, ${timeStr}`,
      };
    }

    this.notify();
    return this.activeVideoCall;
  }

  async reset(): Promise<void> {
    this.initializeState();
    this.notify();
  }
}

export const mockNgoService = new MockNgoService();
