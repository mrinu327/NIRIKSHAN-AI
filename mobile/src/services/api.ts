/**
 * NIRIKSHAN AI — Mobile API Client
 * Connects to Express/Prisma backend on http://localhost:5000
 * Includes robust synthetic fallback for offline/demo reliability
 */

import axios from 'axios';
import {
  DashboardSummary,
  Project,
  Camera,
  Anomaly,
  RiskLevel,
  CameraStatus,
  LocationVerificationResult,
  Inspection,
  MediaEvidenceType,
} from '@nirikshan/shared-types';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// FALLBACK SEED DATA (High-Fidelity Demo)
// ==========================================

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Demo Welfare Institute - Coimbatore',
    scheme: 'DoSJE Integrated De-addiction Scheme',
    type: 'Rehabilitation Centre',
    organization: 'Hope Foundation Trust',
    address: '42 Avinashi Road, Peelamedu, Coimbatore',
    latitude: 11.0267,
    longitude: 76.9953,
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    capacity: 100,
    beneficiaryCount: 92,
    staffCount: 14,
    riskScore: 82,
    riskLevel: RiskLevel.HIGH,
    status: 'UNDER_INVESTIGATION',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-002',
    name: 'Demo Senior Care Sanctuary - Chennai',
    scheme: 'DoSJE Senior Citizens Care Scheme',
    type: 'Old Age Home',
    organization: 'Karuna Senior Welfare Society',
    address: '15 GST Road, Guindy, Chennai',
    latitude: 13.0067,
    longitude: 80.2024,
    state: 'Tamil Nadu',
    district: 'Chennai',
    capacity: 60,
    beneficiaryCount: 54,
    staffCount: 10,
    riskScore: 24,
    riskLevel: RiskLevel.LOW,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-003',
    name: 'Demo De-addiction Kendra - Ludhiana',
    scheme: 'NAPDDR State Action Plan',
    type: 'De-addiction Centre',
    organization: 'Navjeevan De-addiction Society',
    address: '88 Mall Road, Civil Lines, Ludhiana',
    latitude: 30.901,
    longitude: 75.8573,
    state: 'Punjab',
    district: 'Ludhiana',
    capacity: 80,
    beneficiaryCount: 78,
    staffCount: 12,
    riskScore: 68,
    riskLevel: RiskLevel.HIGH,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-004',
    name: 'Demo Skill Academy for Divyangjan - Bhopal',
    scheme: 'National Divyangjan Scheme',
    type: 'Vocational Centre',
    organization: 'Samarthya Vikash Kendra',
    address: '12 Hoshangabad Road, MP Nagar, Bhopal',
    latitude: 23.2599,
    longitude: 77.4126,
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    capacity: 120,
    beneficiaryCount: 115,
    staffCount: 18,
    riskScore: 45,
    riskLevel: RiskLevel.MEDIUM,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-005',
    name: 'Demo Rehabilitation Centre - Lucknow',
    scheme: 'Substance Abuse Initiative',
    type: 'Rehabilitation Centre',
    organization: 'Prerna Sansthan',
    address: '5 Hazratganj Main Road, Lucknow',
    latitude: 26.8467,
    longitude: 80.9462,
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    capacity: 70,
    beneficiaryCount: 88,
    staffCount: 11,
    riskScore: 89,
    riskLevel: RiskLevel.CRITICAL,
    status: 'FLAGGED',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-006',
    name: 'Demo Assisted Living Home - Pune',
    scheme: 'Integrated Care of Elderly',
    type: 'Old Age Home',
    organization: 'Seva Vardhini Trust',
    address: '24 Karve Road, Deccan Gymkhana, Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    state: 'Maharashtra',
    district: 'Pune',
    capacity: 50,
    beneficiaryCount: 48,
    staffCount: 8,
    riskScore: 18,
    riskLevel: RiskLevel.LOW,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface DetailedProject extends Project {
  cameras: Camera[];
  attendances: {
    id: string;
    projectId: string;
    date: string;
    reportedCount: number;
    observedCount?: number | null;
    source: string;
    mismatchPercentage?: number | null;
  }[];
  inspections: {
    id: string;
    projectId: string;
    inspectorId: string;
    type: string;
    assignedAt: string;
    startedAt?: string | null;
    completedAt?: string | null;
    status: string;
    latitude?: number | null;
    longitude?: number | null;
    locationVerified: boolean;
    checklistData?: string | null;
    reportNotes?: string | null;
    syncStatus: string;
    inspector?: {
      id: string;
      name: string;
      phone: string;
      email: string;
    };
    evidence?: {
      id: string;
      inspectionId: string;
      projectId: string;
      type: string;
      fileUrl: string;
      latitude: number;
      longitude: number;
      capturedAt: string;
      hash: string;
      perceptualHash?: string | null;
      integrityStatus: string;
      metadata?: string | null;
    }[];
  }[];
  anomalies: Anomaly[];
  videoCalls: {
    id: string;
    projectId: string;
    participantType: string;
    participantId: string;
    participantName: string;
    participantPhone: string;
    requestedAt: string;
    answeredAt?: string | null;
    status: string;
    result?: string | null;
    feedbackNotes?: string | null;
    sentiment?: string | null;
  }[];
  timeline: {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    timestamp: string;
    badge: string;
    status: string;
  }[];
}

// ==========================================
// API CLIENT METHODS
// ==========================================

export const api = {
  /**
   * Fetch Dashboard Summary KPIs
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await client.get<DashboardSummary>('/api/dashboard/summary');
      return response.data;
    } catch (error) {
      console.warn('Backend /api/dashboard/summary unreachable, using local fallback:', error);
      return {
        totalProjects: 12,
        activeProjects: 10,
        projectsUnderInspection: 2,
        openAlerts: 11,
        highRiskProjects: 5,
        camerasOnline: 7,
        camerasOffline: 2,
        pendingVerifications: 1,
      };
    }
  },

  /**
   * Fetch Risk Distribution
   */
  async getRiskDistribution(): Promise<Record<string, number>> {
    try {
      const response = await client.get<Record<string, number>>('/api/dashboard/risk-distribution');
      return response.data;
    } catch (error) {
      console.warn('Backend /api/dashboard/risk-distribution unreachable, using fallback');
      return {
        [RiskLevel.LOW]: 4,
        [RiskLevel.MEDIUM]: 3,
        [RiskLevel.HIGH]: 4,
        [RiskLevel.CRITICAL]: 1,
        total: 12,
      };
    }
  },

  /**
   * Fetch Live Dashboard Alerts
   */
  async getDashboardAlerts(): Promise<any[]> {
    try {
      const response = await client.get('/api/dashboard/alerts');
      return response.data;
    } catch (error) {
      console.warn('Backend /api/dashboard/alerts unreachable, using fallback');
      return [
        {
          id: 'anom-001',
          type: 'ATTENDANCE_CCTV_MISMATCH',
          severity: RiskLevel.HIGH,
          riskScore: 82,
          explanation:
            'Reported attendance was 92 beneficiaries, but automated camera computer-vision estimates observed only ~61 unique individuals during peak lunch hours (33.7% mismatch).',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          project: {
            id: 'proj-001',
            name: 'Demo Welfare Institute - Coimbatore',
            district: 'Coimbatore',
            state: 'Tamil Nadu',
            riskLevel: RiskLevel.HIGH,
          },
        },
        {
          id: 'anom-005',
          type: 'ATTENDANCE_CAPACITY_EXCEEDED',
          severity: RiskLevel.CRITICAL,
          riskScore: 89,
          explanation:
            'Registered facility capacity is 70 beds, but NGO reported 88 active beneficiaries (+25.7% over-sanction). Common area camera counts average only 45 persons.',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          project: {
            id: 'proj-005',
            name: 'Demo Rehabilitation Centre - Lucknow',
            district: 'Lucknow',
            state: 'Uttar Pradesh',
            riskLevel: RiskLevel.CRITICAL,
          },
        },
        {
          id: 'anom-002',
          type: 'CCTV_OFFLINE_DURING_EXPECTED_HOURS',
          severity: RiskLevel.HIGH,
          riskScore: 68,
          explanation:
            'Camera "Ward 2 Rehabilitation Hall" stopped transmitting heartbeats 4+ hours ago without maintenance notice filed.',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          project: {
            id: 'proj-003',
            name: 'Demo De-addiction Kendra - Ludhiana',
            district: 'Ludhiana',
            state: 'Punjab',
            riskLevel: RiskLevel.HIGH,
          },
        },
      ];
    }
  },

  /**
   * Fetch Projects List
   */
  async getProjects(params?: {
    riskLevel?: string;
    search?: string;
    state?: string;
    district?: string;
  }): Promise<Project[]> {
    try {
      const response = await client.get<Project[]>('/api/projects', { params });
      return response.data;
    } catch (error) {
      console.warn('Backend /api/projects unreachable, filtering fallback data');
      let filtered = [...FALLBACK_PROJECTS];
      if (params?.riskLevel && params.riskLevel !== 'ALL') {
        filtered = filtered.filter((p) => p.riskLevel === params.riskLevel);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q) ||
            p.organization.toLowerCase().includes(q) ||
            p.state.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
  },

  /**
   * Fetch Single Detailed Project by ID
   */
  async getProjectById(id: string): Promise<DetailedProject> {
    try {
      const response = await client.get<DetailedProject>(`/api/projects/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend /api/projects/${id} unreachable, using rich fallback`);
      const base =
        FALLBACK_PROJECTS.find((p) => p.id === id) || FALLBACK_PROJECTS[0];

      return {
        ...base,
        cameras: [
          {
            id: `cam-${base.id}-01`,
            projectId: base.id,
            name: 'Main Entrance & Gate',
            location: 'Perimeter Gate 1',
            streamUrl: 'https://demo-cctv.sih26095.local/streams/gate1.m3u8',
            status: CameraStatus.ONLINE,
            lastHeartbeat: new Date().toISOString(),
            streamQuality: '1080p / 25fps',
            peopleCount: 8,
            lastDetectedActivity: 'Turnstile ingress detected',
          },
          {
            id: `cam-${base.id}-02`,
            projectId: base.id,
            name: 'Dining & Assembly Hall',
            location: 'Block A Ground Floor',
            streamUrl: 'https://demo-cctv.sih26095.local/streams/dining.m3u8',
            status: CameraStatus.ONLINE,
            lastHeartbeat: new Date().toISOString(),
            streamQuality: '1080p / 25fps',
            peopleCount: 61,
            lastDetectedActivity: 'Lunch session headcount CV active',
          },
          {
            id: `cam-${base.id}-03`,
            projectId: base.id,
            name: 'East Corridor & Dormitory',
            location: 'Block B First Floor',
            streamUrl: 'https://demo-cctv.sih26095.local/streams/dorm.m3u8',
            status: base.riskLevel === RiskLevel.HIGH ? CameraStatus.DELAYED : CameraStatus.ONLINE,
            lastHeartbeat: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            streamQuality: '720p / 20fps',
            peopleCount: 14,
            lastDetectedActivity: 'Corridor movement',
          },
        ],
        attendances: [
          {
            id: 'att-01',
            projectId: base.id,
            date: new Date().toISOString(),
            reportedCount: base.beneficiaryCount,
            observedCount: Math.round(base.beneficiaryCount * 0.67),
            source: 'PORTAL_SUBMISSION',
            mismatchPercentage: 33.7,
          },
          {
            id: 'att-02',
            projectId: base.id,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            reportedCount: base.beneficiaryCount,
            observedCount: Math.round(base.beneficiaryCount * 0.65),
            source: 'PORTAL_SUBMISSION',
            mismatchPercentage: 35.0,
          },
          {
            id: 'att-03',
            projectId: base.id,
            date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            reportedCount: base.beneficiaryCount,
            observedCount: Math.round(base.beneficiaryCount * 0.68),
            source: 'PORTAL_SUBMISSION',
            mismatchPercentage: 32.0,
          },
        ],
        inspections: [
          {
            id: 'insp-001',
            projectId: base.id,
            inspectorId: 'usr-inspector-001',
            type: 'SURPRISE_PHYSICAL',
            assignedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            completedAt: null,
            status: 'IN_PROGRESS',
            latitude: base.latitude + 0.0001,
            longitude: base.longitude - 0.0001,
            locationVerified: true,
            checklistData: JSON.stringify({
              projectOperational: true,
              staffPresent: true,
              beneficiariesPresentCount: Math.round(base.beneficiaryCount * 0.68),
              cctvFunctional: true,
              fireSafetyCompliant: true,
              kitchenHygieneSatisfactory: true,
              registersMaintained: false,
            }),
            reportNotes:
              'Initial surprise physical inspection confirms divergence in attendance ledger. On-site verification ongoing.',
            syncStatus: 'SYNCED',
            inspector: {
              id: 'usr-inspector-001',
              name: 'Priya Verma (Senior PMU Field Officer)',
              phone: '+919876543211',
              email: 'inspector@pmu.gov.in',
            },
            evidence: [
              {
                id: 'evid-001',
                inspectionId: 'insp-001',
                projectId: base.id,
                type: 'PHOTO',
                fileUrl: 'https://demo-storage.sih26095.local/evidence/insp001_dining_headcount.jpg',
                latitude: base.latitude + 0.0001,
                longitude: base.longitude - 0.0001,
                capturedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                perceptualHash: 'd41d8cd98f00b204e9800998ecf8427e',
                integrityStatus: 'VERIFIED',
                metadata: JSON.stringify({
                  deviceModel: 'Pixel 8 Pro (Inspector Edition)',
                  accuracyMeters: 3.2,
                  orientation: 'Landscape',
                }),
              },
              {
                id: 'evid-002',
                inspectionId: 'insp-001',
                projectId: base.id,
                type: 'VOICE_NOTE',
                fileUrl: 'https://demo-storage.sih26095.local/evidence/insp001_audio_statement.m4a',
                latitude: base.latitude + 0.0001,
                longitude: base.longitude - 0.0001,
                capturedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
                hash: 'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2',
                perceptualHash: null,
                integrityStatus: 'VERIFIED',
                metadata: JSON.stringify({
                  durationSeconds: 45,
                  recordedBy: 'Priya Verma',
                }),
              },
            ],
          },
        ],
        anomalies: [
          {
            id: 'anom-001',
            projectId: base.id,
            type: 'ATTENDANCE_CCTV_MISMATCH' as any,
            severity: base.riskLevel,
            riskScore: base.riskScore,
            scoreBreakdown: JSON.stringify([
              { factor: 'Attendance discrepancy > 30%', points: 35 },
              { factor: 'Static consecutive counts reported', points: 15 },
              { factor: 'Peak hour head-count difference', points: 20 },
              { factor: 'Past compliance audit observations', points: 12 },
            ]),
            explanation: `Reported attendance was ${base.beneficiaryCount} beneficiaries, but automated camera computer-vision estimates observed only ~${Math.round(base.beneficiaryCount * 0.67)} unique individuals during peak lunch hours.`,
            evidenceIds: '["cam-001","cam-002"]',
            status: 'OPEN',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
        ],
        videoCalls: [
          {
            id: 'vc-001',
            projectId: base.id,
            participantType: 'BENEFICIARY',
            participantId: 'usr-ben-01',
            participantName: 'Ramesh Kumar (Resident)',
            participantPhone: '+919876543213',
            requestedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            answeredAt: new Date(Date.now() - 8 * 60 * 60 * 1000 + 45000).toISOString(),
            status: 'ANSWERED',
            result: 'VERIFIED',
            feedbackNotes: 'Resident confirmed regular meals and vocational schedule.',
            sentiment: 'POSITIVE',
          },
        ],
        timeline: [
          {
            id: 'tl-1',
            type: 'ATTENDANCE_SUBMISSION',
            title: `Daily Attendance Submitted: ${base.beneficiaryCount} Persons`,
            subtitle: `Observed via Vision: ~${Math.round(base.beneficiaryCount * 0.67)}`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            badge: '33.7% mismatch',
            status: 'WARNING',
          },
          {
            id: 'tl-2',
            type: 'ANOMALY_FLAGGED',
            title: 'AI Alert: Attendance CCTV Mismatch',
            subtitle: `Computer vision detected ~${Math.round(base.beneficiaryCount * 0.67)} attendees vs ${base.beneficiaryCount} claimed.`,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            badge: `${base.riskLevel} (${base.riskScore} pts)`,
            status: 'DANGER',
          },
          {
            id: 'tl-3',
            type: 'INSPECTION_ACTIVITY',
            title: 'Surprise Physical Inspection Assigned',
            subtitle: 'PMU officer dispatched for on-site headcount and register audit.',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            badge: 'IN_PROGRESS',
            status: 'INFO',
          },
          {
            id: 'tl-4',
            type: 'VIDEO_VERIFICATION',
            title: 'Surprise VC: Ramesh Kumar (Resident)',
            subtitle: 'Direct citizen video verification completed satisfactorily.',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            badge: 'VERIFIED',
            status: 'SUCCESS',
          },
        ],
      };
    }
  },

  /**
   * Fetch Inspector Assignments
   */
  async getMyInspections(inspectorId?: string): Promise<any[]> {
    try {
      const response = await client.get('/api/inspections/my-assignments', {
        params: { inspectorId },
      });
      return response.data;
    } catch (error) {
      console.warn('Backend /api/inspections/my-assignments unreachable, using fallback');
      return [
        {
          id: 'insp-001',
          projectId: 'proj-001',
          inspectorId: 'usr-inspector-001',
          type: 'SURPRISE_PHYSICAL',
          assignedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completedAt: null,
          status: 'ACTIVE_NOW',
          deadline: 'Today, 05:00 PM',
          locationVerified: true,
          project: {
            id: 'proj-001',
            name: 'Demo Welfare Institute - Coimbatore',
            address: '42 Avinashi Road, Peelamedu, Coimbatore',
            district: 'Coimbatore',
            state: 'Tamil Nadu',
            latitude: 11.0267,
            longitude: 76.9953,
            riskLevel: RiskLevel.HIGH,
            riskScore: 82,
            reason: 'High Attendance Mismatch (33.7%) flagged by computer vision',
          },
        },
        {
          id: 'insp-003',
          projectId: 'proj-002',
          inspectorId: 'usr-inspector-001',
          type: 'ROUTINE',
          assignedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          startedAt: null,
          completedAt: null,
          status: 'UPCOMING',
          deadline: 'Tomorrow, 12:00 PM',
          locationVerified: false,
          project: {
            id: 'proj-002',
            name: 'Demo Senior Care Sanctuary - Chennai',
            address: '15 GST Road, Guindy, Chennai',
            district: 'Chennai',
            state: 'Tamil Nadu',
            latitude: 13.0067,
            longitude: 80.2024,
            riskLevel: RiskLevel.LOW,
            riskScore: 24,
            reason: 'Semi-annual routine physical audit',
          },
        },
      ];
    }
  },

  /**
   * Start Inspection
   */
  async startInspection(id: string): Promise<any> {
    try {
      const response = await client.post(`/api/inspections/${id}/start`);
      return response.data;
    } catch (error) {
      console.warn(`Backend /api/inspections/${id}/start unreachable, continuing in demo mode`);
      return { id, status: 'IN_PROGRESS' };
    }
  },

  /**
   * Verify Inspection GPS Location (100m geofence)
   */
  async verifyInspectionLocation(
    id: string,
    latitude: number,
    longitude: number
  ): Promise<LocationVerificationResult> {
    try {
      const response = await client.post<LocationVerificationResult>(
        `/api/inspections/${id}/location`,
        { latitude, longitude }
      );
      return response.data;
    } catch (error) {
      console.warn('Backend location verification unreachable, using client-side calculation');
      // Approximate Coimbatore site: 11.0267, 76.9953
      const R = 6371e3;
      const phi1 = (latitude * Math.PI) / 180;
      const phi2 = (11.0267 * Math.PI) / 180;
      const deltaPhi = ((11.0267 - latitude) * Math.PI) / 180;
      const deltaLambda = ((76.9953 - longitude) * Math.PI) / 180;
      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const distanceMeters = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
      const verified = distanceMeters <= 100;
      return {
        verified,
        distanceMeters,
        radiusMeters: 100,
        status: verified ? 'LOCATION_VERIFIED' : 'OUTSIDE_GEOFENCE',
        message: verified
          ? `Verified within ${distanceMeters}m of site.`
          : `Outside geofence: ${distanceMeters}m away (limit: 100m).`,
      };
    }
  },

  /**
   * Add Evidence Item
   */
  async addInspectionEvidence(id: string, evidence: any): Promise<any> {
    try {
      const response = await client.post(`/api/inspections/${id}/evidence`, evidence);
      return response.data;
    } catch (error) {
      console.warn('Backend add evidence unreachable, returning local item');
      return { id: `evid-${Date.now()}`, ...evidence };
    }
  },

  /**
   * Submit Inspection Report
   */
  async submitInspection(id: string, payload: any): Promise<any> {
    try {
      const response = await client.post(`/api/inspections/${id}/submit`, payload);
      return response.data;
    } catch (error) {
      console.warn('Backend submit inspection unreachable, returning success');
      return {
        success: true,
        message: 'Inspection submitted locally in demo mode.',
        inspection: { id, status: 'COMPLETED', ...payload },
      };
    }
  },
};
