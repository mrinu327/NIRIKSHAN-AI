/**
 * SIH26095 NIRIKSHAN AI — Shared Types & Interfaces
 * Centralized Monitoring & Surprise Inspection Mobile App for DoSJE
 */

// ==========================================
// ENUMS
// ==========================================

export enum Role {
  OFFICIAL = 'OFFICIAL',
  INSPECTOR = 'INSPECTOR',
  NGO = 'NGO',
  BENEFICIARY = 'BENEFICIARY',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum CameraStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  NO_SIGNAL = 'NO_SIGNAL',
  DELAYED = 'DELAYED',
}

export enum InspectionStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  ESCALATED = 'ESCALATED',
}

export enum AnomalyType {
  ATTENDANCE_CAPACITY_EXCEEDED = 'ATTENDANCE_CAPACITY_EXCEEDED',
  ATTENDANCE_CCTV_MISMATCH = 'ATTENDANCE_CCTV_MISMATCH',
  REPEATED_ATTENDANCE_PATTERN = 'REPEATED_ATTENDANCE_PATTERN',
  CCTV_OFFLINE_DURING_EXPECTED_HOURS = 'CCTV_OFFLINE_DURING_EXPECTED_HOURS',
  INSPECTOR_GPS_MISMATCH = 'INSPECTOR_GPS_MISMATCH',
  DUPLICATE_EVIDENCE = 'DUPLICATE_EVIDENCE',
  MISSED_VIDEO_VERIFICATION = 'MISSED_VIDEO_VERIFICATION',
  OVERDUE_INSPECTION = 'OVERDUE_INSPECTION',
  SUDDEN_BEHAVIOR_CHANGE = 'SUDDEN_BEHAVIOR_CHANGE',
}

export enum MediaEvidenceType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  VOICE_NOTE = 'VOICE_NOTE',
}

export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}

// ==========================================
// CORE ENTITY INTERFACES
// ==========================================

export interface User {
  id: string;
  name: string;
  role: Role;
  phone: string;
  email: string;
  state: string;
  district: string;
  active: boolean;
  createdAt?: string | Date;
}

export interface Project {
  id: string;
  name: string;
  scheme: string;
  type: string;
  organization: string;
  address: string;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  capacity: number;
  beneficiaryCount: number;
  staffCount: number;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Attendance {
  id: string;
  projectId: string;
  date: string | Date;
  reportedCount: number;
  observedCount?: number | null;
  source: string;
  mismatchPercentage?: number | null;
  createdAt?: string | Date;
}

export interface Camera {
  id: string;
  projectId: string;
  name: string;
  location: string;
  streamUrl: string;
  status: CameraStatus;
  lastHeartbeat: string | Date;
  streamQuality: string;
  peopleCount: number;
  lastDetectedActivity?: string | null;
}

export interface Inspection {
  id: string;
  projectId: string;
  inspectorId: string;
  type: string;
  assignedAt: string | Date;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  status: InspectionStatus;
  latitude?: number | null;
  longitude?: number | null;
  locationVerified: boolean;
  checklistData?: string | null;
  reportNotes?: string | null;
  syncStatus: string;
  project?: Project;
  inspector?: User;
}

export interface Evidence {
  id: string;
  inspectionId: string;
  projectId: string;
  type: MediaEvidenceType;
  fileUrl: string;
  latitude: number;
  longitude: number;
  capturedAt: string | Date;
  hash: string;
  perceptualHash?: string | null;
  integrityStatus: string;
  metadata?: string | null;
}

export interface ScoreIncrement {
  factor: string;
  points: number;
}

export interface Anomaly {
  id: string;
  projectId: string;
  type: AnomalyType;
  severity: RiskLevel;
  riskScore: number;
  scoreBreakdown: string; // JSON of ScoreIncrement[]
  explanation: string;
  evidenceIds?: string | null;
  status: string; // 'OPEN' | 'REVIEWED' | 'FALSE_POSITIVE' | 'ESCALATED'
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  createdAt: string | Date;
  project?: Project;
}

export interface VideoVerification {
  id: string;
  projectId: string;
  participantType: 'INCHARGE' | 'STAFF' | 'BENEFICIARY';
  participantId: string;
  participantName: string;
  participantPhone: string;
  requestedAt: string | Date;
  answeredAt?: string | Date | null;
  status: 'REQUESTED' | 'ANSWERED' | 'MISSED';
  result?: 'VERIFIED' | 'SUSPICIOUS' | 'UNREACHABLE' | null;
  feedbackNotes?: string | null;
  sentiment?: Sentiment | null;
  project?: Project;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: string | null;
  createdAt: string | Date;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: string | null;
  timestamp: string | Date;
  actor?: User;
}

// ==========================================
// DTOs & API PAYLOADS
// ==========================================

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
  demoRole?: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  projectsUnderInspection: number;
  openAlerts: number;
  highRiskProjects: number;
  camerasOnline: number;
  camerasOffline: number;
  pendingVerifications: number;
}

export interface AssignInspectionRequest {
  projectId: string;
  type?: string;
  inspectorId?: string; // Optional: if omitted, system picks eligible random
  reason: string;
}

export interface VerifyLocationRequest {
  latitude: number;
  longitude: number;
}

export interface LocationVerificationResult {
  verified: boolean;
  distanceMeters: number;
  radiusMeters: number;
  status: 'LOCATION_VERIFIED' | 'OUTSIDE_GEOFENCE';
  message: string;
}

export interface SubmitInspectionRequest {
  checklistData: Record<string, any>;
  reportNotes: string;
  latitude: number;
  longitude: number;
  locationVerified: boolean;
  evidenceItems: {
    type: MediaEvidenceType;
    fileUrl: string;
    latitude: number;
    longitude: number;
    hash: string;
    metadata?: Record<string, any>;
  }[];
}

// ==========================================
// SERVICE INTERFACES
// ==========================================

export interface CameraHealth {
  status: CameraStatus;
  lastHeartbeat: Date;
  latencyMs: number;
}

export interface PeopleCountEstimate {
  count: number;
  confidence: number;
  detectedAt: Date;
}

export interface CCTVProvider {
  getStreamUrl(cameraId: string): Promise<string>;
  getHealth(cameraId: string): Promise<CameraHealth>;
  getPeopleCountEstimate(cameraId: string): Promise<PeopleCountEstimate>;
}

export interface AttendanceAnalysis {
  projectId: string;
  reportedCount: number;
  observedCount: number;
  capacity: number;
  mismatchPercentage: number;
  isCapacityExceeded: boolean;
  hasSuspiciousPattern: boolean;
  anomaliesDetected: AnomalyType[];
}

export interface AnomalyOutput {
  riskScore: number;
  severity: RiskLevel;
  anomalyType: AnomalyType;
  explanation: string;
  scoreBreakdown: ScoreIncrement[];
  recommendedAction: string;
  evidenceIds: string[];
}

export interface AnomalyEngine {
  analyzeProject(projectId: string): Promise<AnomalyOutput[]>;
}

export interface OfflineSyncQueueItem {
  id: string;
  action: 'SUBMIT_INSPECTION' | 'UPLOAD_EVIDENCE' | 'UPDATE_CHECKLIST';
  payload: any;
  timestamp: number;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  error?: string;
}
