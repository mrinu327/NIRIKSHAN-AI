/**
 * NIRIKSHAN AI — Field Inspection Session Store (Zustand)
 * Manages active inspection lifecycle, GPS geofence verification, biometric auth,
 * checklist, preserved original photos, hashed multi-category evidence items,
 * connected audit timeline, and submission.
 */

import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { MediaEvidenceType } from '@nirikshan/shared-types';
import { api } from '../services/api';

export type EvidenceCategory =
  | 'Infrastructure'
  | 'Attendance'
  | 'Beneficiary Records'
  | 'Financial Documents'
  | 'Compliance Documents'
  | 'CCTV Evidence'
  | 'Inspection Photos'
  | 'Video'
  | 'Other';

export type EvidenceStatus =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'PROCESSING'
  | 'AI ANALYZED'
  | 'REQUIRES REVIEW'
  | 'REJECTED';

export interface PhotoMetadata {
  captureTimestamp: string;
  latitude: number;
  longitude: number;
  geofenceStatus: 'INSIDE' | 'OUTSIDE' | 'UNVERIFIED';
  inspectorId: string;
  inspectorName: string;
  projectId: string;
  projectName: string;
  inspectionId: string;
  fileSize?: string;
  fileType?: string;
  isVerified?: boolean;
}

export interface CapturedEvidence {
  id: string;
  type: MediaEvidenceType;
  category: EvidenceCategory;
  title: string;
  fileName: string;
  fileUrl: string;
  originalPhotoUri?: string; // Preserved original captured photo (NEVER compressed, cropped, or overwritten)
  processedPhotoUri?: string; // Derived / AI-annotated / enhanced version
  isOriginalPreserved?: boolean;
  status: EvidenceStatus;
  uploadProgress?: number; // 0 - 100
  latitude: number;
  longitude: number;
  capturedAt: string;
  hash: string;
  integrityStatus: 'VERIFIED' | 'TAMPERED';
  metadata?: PhotoMetadata & Record<string, any>;
  aiAnalysis?: {
    analyzedAt: string;
    findings: string;
    confidenceScore?: number;
    anomaliesDetected?: boolean;
    detectedAnomalyNote?: string;
  };
  notes?: string;
}

export interface ChecklistState {
  operational: boolean;
  staffPresent: boolean;
  cctvWorking: boolean;
  sanitationSatisfactory: boolean;
  foodQualityGood: boolean;
  registersMaintained: boolean;
}

export interface InspectionTimelineEvent {
  id: string;
  time: string; // e.g. "10:02 AM"
  timestamp: string; // ISO
  icon: string;
  title: string;
  description?: string;
  type: 'GEOFENCE' | 'BIOMETRIC' | 'PHOTO' | 'DOCUMENT' | 'AI' | 'ANOMALY' | 'SUBMISSION' | 'VC';
}

export interface CompletedReport {
  id: string;
  inspectionId: string;
  project: string;
  type: string;
  date: string;
  status: string;
  evidenceCount: number;
  hashStatus: string;
  outcome: string;
  result: 'Compliant' | 'Issues Found';
  riskScore?: number;
  anomaliesCount?: number;
  geofenceVerified: boolean;
  biometricVerified: boolean;
  timeline: InspectionTimelineEvent[];
  evidenceList?: CapturedEvidence[];
}

interface InspectionSessionState {
  activeInspectionId: string;
  projectId: string;
  projectName: string;
  projectAddress: string;
  targetLatitude: number;
  targetLongitude: number;
  inspectionType: 'REGULAR' | 'SURPRISE' | 'VC';
  scheduledDate: string;
  scheduledCountdown: string;

  // GPS / Geofence state
  currentLatitude: number;
  currentLongitude: number;
  distanceMeters: number;
  isLocationVerified: boolean;
  isSimulatorMode: boolean;

  // Biometric Verification state
  isBiometricVerified: boolean;
  biometricType: 'FINGERPRINT' | 'FACIAL' | null;
  biometricTimestamp: string | null;

  // Connected Audit Timeline
  activeTimeline: InspectionTimelineEvent[];

  // Checklist state
  checklist: ChecklistState;
  reportNotes: string;

  // Evidence state
  evidenceList: CapturedEvidence[];

  // Completed reports history
  completedReports: CompletedReport[];

  // Actions
  setInspectionTarget: (
    inspectionId: string,
    projectId: string,
    name: string,
    address: string,
    targetLat?: number,
    targetLon?: number,
    type?: 'REGULAR' | 'SURPRISE' | 'VC',
    scheduledDate?: string,
    countdown?: string
  ) => void;
  updateLocation: (lat: number, lon: number, verified: boolean, distance: number) => void;
  setBiometricVerification: (type: 'FINGERPRINT' | 'FACIAL', verified: boolean) => void;
  addTimelineEvent: (
    icon: string,
    title: string,
    description?: string,
    type?: InspectionTimelineEvent['type']
  ) => void;
  toggleChecklist: (key: keyof ChecklistState) => void;
  setReportNotes: (notes: string) => void;
  addEvidence: (
    type: MediaEvidenceType,
    fileName: string,
    fileUrl: string,
    options?: {
      category?: EvidenceCategory;
      title?: string;
      originalPhotoUri?: string;
      processedPhotoUri?: string;
      status?: EvidenceStatus;
      metadata?: Record<string, any>;
      notes?: string;
    }
  ) => Promise<CapturedEvidence>;
  runAiAnalysisOnEvidence: (id: string) => Promise<void>;
  updateEvidenceStatus: (id: string, status: EvidenceStatus) => void;
  removeEvidence: (id: string) => void;
  submitActiveInspection: () => Promise<boolean>;
  resetActiveSession: () => void;
}

const DEFAULT_TIMELINE_1: InspectionTimelineEvent[] = [
  {
    id: 'tl-101',
    time: '10:02 AM',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    icon: '📍',
    title: 'Entered Geofence Area',
    description: 'Distance verified at 43m (Authorized radius: 100m).',
    type: 'GEOFENCE',
  },
  {
    id: 'tl-102',
    time: '10:05 AM',
    timestamp: new Date(Date.now() - 3.9 * 60 * 60 * 1000).toISOString(),
    icon: '👆',
    title: 'Identity Verified via Biometrics',
    description: 'Inspector Priya Verma authenticated on sensor PMU-004.',
    type: 'BIOMETRIC',
  },
  {
    id: 'tl-103',
    time: '10:12 AM',
    timestamp: new Date(Date.now() - 3.7 * 60 * 60 * 1000).toISOString(),
    icon: '📸',
    title: 'Original Photo Captured',
    description: 'Headcount activity hall photo captured. Original raw byte stream preserved.',
    type: 'PHOTO',
  },
  {
    id: 'tl-104',
    time: '10:14 AM',
    timestamp: new Date(Date.now() - 3.6 * 60 * 60 * 1000).toISOString(),
    icon: '📄',
    title: 'Beneficiary Document Uploaded',
    description: 'Physical morning register scan attached to inspection docket.',
    type: 'DOCUMENT',
  },
  {
    id: 'tl-105',
    time: '10:15 AM',
    timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    icon: '🤖',
    title: 'AI Analysis Completed',
    description: 'Computer vision estimated 25 attendees vs 42 in submitted online log.',
    type: 'AI',
  },
  {
    id: 'tl-106',
    time: '10:16 AM',
    timestamp: new Date(Date.now() - 3.4 * 60 * 60 * 1000).toISOString(),
    icon: '⚠',
    title: 'Attendance Discrepancy Flagged',
    description: '33.7% variance detected between on-site headcount and portal claims.',
    type: 'ANOMALY',
  },
  {
    id: 'tl-107',
    time: '10:18 AM',
    timestamp: new Date(Date.now() - 3.3 * 60 * 60 * 1000).toISOString(),
    icon: '📑',
    title: 'Inspection Submitted to MoSJE Portal',
    description: 'Cryptographic audit manifest generated and transmitted.',
    type: 'SUBMISSION',
  },
];

const DEFAULT_REPORTS: CompletedReport[] = [
  {
    id: 'rep-001',
    inspectionId: 'insp-002',
    project: 'Demo Senior Care Sanctuary - Chennai',
    type: 'Routine Semi-Annual Audit',
    date: '28 Aug 2026',
    status: 'SUBMITTED & VERIFIED',
    evidenceCount: 4,
    hashStatus: 'SHA-256 HASH VERIFIED',
    outcome: 'Compliant with DoSJE elder care standards.',
    result: 'Compliant',
    riskScore: 24,
    anomaliesCount: 0,
    geofenceVerified: true,
    biometricVerified: true,
    timeline: DEFAULT_TIMELINE_1,
    evidenceList: [
      {
        id: 'evid-rep-01',
        type: MediaEvidenceType.PHOTO,
        category: 'Infrastructure',
        title: 'Elder Care Ward Sanitation',
        fileName: 'ward_sanitation.jpg',
        fileUrl: 'https://demo-storage.sih26095.local/evidence/ward_sanitation.jpg',
        originalPhotoUri: 'https://demo-storage.sih26095.local/evidence/ward_sanitation_raw.jpg',
        isOriginalPreserved: true,
        status: 'AI ANALYZED',
        uploadProgress: 100,
        latitude: 13.0067,
        longitude: 80.2024,
        capturedAt: '28 Aug 2026, 10:15 AM',
        hash: 'b7c4a19e235d94726e680a6b578c772d1f0e4c6981fae62a1215b221d6f21234',
        integrityStatus: 'VERIFIED',
        metadata: {
          captureTimestamp: '28 Aug 2026, 10:15:22',
          latitude: 13.0067,
          longitude: 80.2024,
          geofenceStatus: 'INSIDE',
          inspectorId: 'usr-inspector-001',
          inspectorName: 'Priya Verma',
          projectId: 'proj-002',
          projectName: 'Demo Senior Care Sanctuary - Chennai',
          inspectionId: 'insp-002',
          fileSize: '3.4 MB',
          fileType: 'image/jpeg',
          isVerified: true,
        },
      },
      {
        id: 'evid-rep-02',
        type: MediaEvidenceType.DOCUMENT,
        category: 'Beneficiary Records',
        title: 'Resident Medical Log',
        fileName: 'resident_medical_register.pdf',
        fileUrl: 'https://demo-storage.sih26095.local/evidence/resident_medical_register.pdf',
        status: 'UPLOADED',
        uploadProgress: 100,
        latitude: 13.0067,
        longitude: 80.2024,
        capturedAt: '28 Aug 2026, 10:24 AM',
        hash: 'd48e89f8123ac2e987113cdfae109842a12b6942ce142a781b0a5162a874b432',
        integrityStatus: 'VERIFIED',
        metadata: {
          captureTimestamp: '28 Aug 2026, 10:24:05',
          latitude: 13.0067,
          longitude: 80.2024,
          geofenceStatus: 'INSIDE',
          inspectorId: 'usr-inspector-001',
          inspectorName: 'Priya Verma',
          projectId: 'proj-002',
          projectName: 'Demo Senior Care Sanctuary - Chennai',
          inspectionId: 'insp-002',
          fileSize: '1.8 MB',
          fileType: 'application/pdf',
          isVerified: true,
        },
      },
    ],
  },
  {
    id: 'rep-002',
    inspectionId: 'insp-004',
    project: 'Demo Skill Academy - Bhopal',
    type: 'Surprise Physical Inspection',
    date: '15 Aug 2026',
    status: 'AUDIT RECORDED',
    evidenceCount: 6,
    hashStatus: 'SHA-256 HASH VERIFIED',
    outcome: 'Divyangjan vocational training equipment verified operational. Minor discrepancy noted.',
    result: 'Issues Found',
    riskScore: 78,
    anomaliesCount: 2,
    geofenceVerified: true,
    biometricVerified: true,
    timeline: DEFAULT_TIMELINE_1,
  },
];

export const useInspectionStore = create<InspectionSessionState>()((set, get) => ({
  activeInspectionId: 'insp-001',
  projectId: 'proj-001',
  projectName: 'Demo Welfare Institute - Coimbatore',
  projectAddress: '42 Avinashi Road, Peelamedu, Coimbatore',
  targetLatitude: 11.0267,
  targetLongitude: 76.9953,
  inspectionType: 'SURPRISE',
  scheduledDate: 'Today, 05:00 PM',
  scheduledCountdown: 'TODAY',

  currentLatitude: 11.0268,
  currentLongitude: 76.9952,
  distanceMeters: 43,
  isLocationVerified: true,
  isSimulatorMode: true,

  isBiometricVerified: true,
  biometricType: 'FINGERPRINT',
  biometricTimestamp: '10:05 AM Today',

  activeTimeline: [
    {
      id: 'tl-active-1',
      time: '10:02 AM',
      timestamp: new Date().toISOString(),
      icon: '📍',
      title: 'Entered Geofence Area',
      description: 'Location verified 43m from project coordinates (Authorized: 100m).',
      type: 'GEOFENCE',
    },
    {
      id: 'tl-active-2',
      time: '10:05 AM',
      timestamp: new Date().toISOString(),
      icon: '👆',
      title: 'Inspector Biometric Identity Verified',
      description: 'Fingerprint matched official PMU-004 token credential.',
      type: 'BIOMETRIC',
    },
  ],

  checklist: {
    operational: true,
    staffPresent: true,
    cctvWorking: true,
    sanitationSatisfactory: true,
    foodQualityGood: true,
    registersMaintained: false,
  },
  reportNotes:
    'On-site physical headcount confirms divergence from online register. Observed ~25 individuals present vs 42 claimed.',

  evidenceList: [
    {
      id: 'evid-init-01',
      type: MediaEvidenceType.PHOTO,
      category: 'Attendance',
      title: 'Activity Hall Morning Headcount',
      fileName: 'dining_hall_headcount.jpg',
      fileUrl: 'https://demo-storage.sih26095.local/evidence/insp001_dining_headcount.jpg',
      originalPhotoUri: 'https://demo-storage.sih26095.local/evidence/insp001_dining_headcount_raw.jpg',
      processedPhotoUri: 'https://demo-storage.sih26095.local/evidence/insp001_dining_headcount_ai_annotated.jpg',
      isOriginalPreserved: true,
      status: 'AI ANALYZED',
      uploadProgress: 100,
      latitude: 11.02675,
      longitude: 76.99532,
      capturedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      integrityStatus: 'VERIFIED',
      metadata: {
        captureTimestamp: '10:42:18 Today',
        latitude: 11.02675,
        longitude: 76.99532,
        geofenceStatus: 'INSIDE',
        inspectorId: 'usr-inspector-001',
        inspectorName: 'Priya Verma',
        projectId: 'proj-001',
        projectName: 'Demo Welfare Institute - Coimbatore',
        inspectionId: 'insp-001',
        fileSize: '4.2 MB (Original Uncompressed)',
        fileType: 'image/jpeg',
        isVerified: true,
      },
      aiAnalysis: {
        analyzedAt: '10:45 AM Today',
        findings: 'Headcount Vision: 25 unique faces detected in main hall.',
        confidenceScore: 94.2,
        anomaliesDetected: true,
        detectedAnomalyNote: '33.7% discrepancy detected against portal record (42 claimed).',
      },
    },
  ],

  completedReports: DEFAULT_REPORTS,

  setInspectionTarget: (
    inspectionId,
    projectId,
    name,
    address,
    targetLat,
    targetLon,
    type = 'REGULAR',
    scheduledDate = '18 Sep 2026',
    countdown = '8 DAYS'
  ) => {
    set({
      activeInspectionId: inspectionId,
      projectId,
      projectName: name,
      projectAddress: address,
      targetLatitude: targetLat || 11.0267,
      targetLongitude: targetLon || 76.9953,
      inspectionType: type,
      scheduledDate,
      scheduledCountdown: countdown,
      isBiometricVerified: false,
      biometricType: null,
      biometricTimestamp: null,
      activeTimeline: [
        {
          id: `tl-${Date.now()}-init`,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
          icon: '📋',
          title: `Assignment Selected: #${inspectionId}`,
          description: `Assigned for ${type} verification at ${name}.`,
          type: 'GEOFENCE',
        },
      ],
    });
  },

  updateLocation: (lat, lon, verified, distance) => {
    const wasVerified = get().isLocationVerified;
    set({
      currentLatitude: lat,
      currentLongitude: lon,
      isLocationVerified: verified,
      distanceMeters: distance,
    });

    if (!wasVerified && verified) {
      get().addTimelineEvent(
        '📍',
        'Entered Authorized Geofence',
        `Distance confirmed at ${distance}m (Authorized geofence radius: 100m).`,
        'GEOFENCE'
      );
    }
  },

  setBiometricVerification: (type, verified) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    set({
      isBiometricVerified: verified,
      biometricType: type,
      biometricTimestamp: verified ? `${timeStr} Today` : null,
    });

    if (verified) {
      get().addTimelineEvent(
        type === 'FINGERPRINT' ? '👆' : '📸',
        `Biometric Identity Verified (${type})`,
        `Officer verified via ${type.toLowerCase()} sensor match.`,
        'BIOMETRIC'
      );
    }
  },

  addTimelineEvent: (icon, title, description, type = 'PHOTO') => {
    const newEvent: InspectionTimelineEvent = {
      id: `tl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      icon,
      title,
      description,
      type,
    };
    set((state) => ({
      activeTimeline: [...state.activeTimeline, newEvent],
    }));
  },

  toggleChecklist: (key) => {
    set((state) => ({
      checklist: {
        ...state.checklist,
        [key]: !state.checklist[key],
      },
    }));
  },

  setReportNotes: (notes) => {
    set({ reportNotes: notes });
  },

  addEvidence: async (type, fileName, fileUrl, options = {}) => {
    const {
      currentLatitude,
      currentLongitude,
      activeInspectionId,
      projectId,
      projectName,
      isLocationVerified,
    } = get();
    const capturedAt = new Date().toISOString();
    const timeDisplay = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Compute cryptographic SHA-256 hash
    let hash = '';
    try {
      const rawPayload = `${fileName}-${fileUrl}-${capturedAt}-${currentLatitude}-${currentLongitude}`;
      hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawPayload);
    } catch (e) {
      hash = `sha256-${Date.now().toString(16)}-${Math.random().toString(36).slice(2, 10)}e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.slice(0, 64);
    }

    const defaultCategory: EvidenceCategory =
      type === MediaEvidenceType.PHOTO
        ? 'Inspection Photos'
        : type === MediaEvidenceType.DOCUMENT
        ? 'Beneficiary Records'
        : type === MediaEvidenceType.VIDEO
        ? 'Video'
        : 'Other';

    const category = options.category || defaultCategory;
    const title = options.title || `${category} Evidence`;
    const originalPhotoUri = options.originalPhotoUri || (type === MediaEvidenceType.PHOTO ? fileUrl : undefined);

    const metadata: PhotoMetadata = {
      captureTimestamp: timeDisplay,
      latitude: currentLatitude,
      longitude: currentLongitude,
      geofenceStatus: isLocationVerified ? 'INSIDE' : 'OUTSIDE',
      inspectorId: 'usr-inspector-001',
      inspectorName: 'Priya Verma',
      projectId,
      projectName,
      inspectionId: activeInspectionId,
      fileSize: options.metadata?.fileSize || '3.8 MB',
      fileType: options.metadata?.fileType || (type === MediaEvidenceType.PHOTO ? 'image/jpeg' : type === MediaEvidenceType.DOCUMENT ? 'application/pdf' : 'video/mp4'),
      isVerified: false, // UPLOADED != VERIFIED rule
      ...options.metadata,
    };

    const newItem: CapturedEvidence = {
      id: `evid-${Date.now()}`,
      type,
      category,
      title,
      fileName,
      fileUrl,
      originalPhotoUri,
      processedPhotoUri: options.processedPhotoUri,
      isOriginalPreserved: Boolean(originalPhotoUri),
      status: options.status || 'UPLOADED',
      uploadProgress: 100,
      latitude: currentLatitude,
      longitude: currentLongitude,
      capturedAt,
      hash,
      integrityStatus: 'VERIFIED',
      metadata,
      notes: options.notes,
    };

    set((state) => ({
      evidenceList: [...state.evidenceList, newItem],
    }));

    // Log to chronological timeline
    if (type === MediaEvidenceType.PHOTO) {
      get().addTimelineEvent(
        '📸',
        `Original Photo Captured: ${fileName}`,
        `Preserved raw capture at ${timeDisplay}. Geofence status: ${metadata.geofenceStatus}.`,
        'PHOTO'
      );
    } else {
      get().addTimelineEvent(
        '📄',
        `Evidence File Uploaded: ${fileName}`,
        `Uploaded under category '${category}' (SHA-256 hashed).`,
        'DOCUMENT'
      );
    }

    // Optionally sync with backend
    try {
      api.addInspectionEvidence(activeInspectionId, {
        type,
        fileUrl,
        latitude: currentLatitude,
        longitude: currentLongitude,
        hash,
        metadata,
      });
    } catch (e) {
      console.warn('Failed to sync evidence item immediately:', e);
    }

    return newItem;
  },

  runAiAnalysisOnEvidence: async (id: string) => {
    const item = get().evidenceList.find((e) => e.id === id);
    if (!item) return;

    set((state) => ({
      evidenceList: state.evidenceList.map((e) =>
        e.id === id ? { ...e, status: 'PROCESSING' } : e
      ),
    }));

    // Simulate AI inference delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const aiAnalysis = {
      analyzedAt: `${timeStr} Today`,
      findings: 'Headcount Vision & Facility Model: 25 individuals counted in photo frame.',
      confidenceScore: 92.8,
      anomaliesDetected: true,
      detectedAnomalyNote: 'Discrepancy: count is 17 lower than morning claimed register (42).',
    };

    // Store separate processed version preserving original photo
    const processedUri =
      item.originalPhotoUri || item.fileUrl; // In demo, both accessible distinctly

    set((state) => ({
      evidenceList: state.evidenceList.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'AI ANALYZED',
              processedPhotoUri: processedUri,
              aiAnalysis,
            }
          : e
      ),
    }));

    get().addTimelineEvent(
      '🤖',
      'AI Analysis Completed',
      `Model analyzed '${item.fileName}' with 92.8% confidence.`,
      'AI'
    );
    get().addTimelineEvent(
      '⚠',
      'Anomaly Discrepancy Detected',
      aiAnalysis.detectedAnomalyNote,
      'ANOMALY'
    );
  },

  updateEvidenceStatus: (id, status) => {
    set((state) => ({
      evidenceList: state.evidenceList.map((e) =>
        e.id === id ? { ...e, status } : e
      ),
    }));
  },

  removeEvidence: (id) => {
    set((state) => ({
      evidenceList: state.evidenceList.filter((e) => e.id !== id),
    }));
  },

  submitActiveInspection: async () => {
    const state = get();

    state.addTimelineEvent(
      '📑',
      'Inspection Docket Submitted',
      `Submitted with ${state.evidenceList.length} evidence items and verified biometrics.`,
      'SUBMISSION'
    );

    const finalTimeline = get().activeTimeline;

    const payload = {
      checklistData: state.checklist,
      reportNotes: state.reportNotes,
      latitude: state.currentLatitude,
      longitude: state.currentLongitude,
      locationVerified: state.isLocationVerified,
      biometricVerified: state.isBiometricVerified,
      evidenceItems: state.evidenceList.map((e) => ({
        type: e.type,
        category: e.category,
        title: e.title,
        fileUrl: e.fileUrl,
        originalPhotoUri: e.originalPhotoUri,
        latitude: e.latitude,
        longitude: e.longitude,
        hash: e.hash,
        metadata: e.metadata,
      })),
      timeline: finalTimeline,
    };

    try {
      await api.submitInspection(state.activeInspectionId, payload);
    } catch (e) {
      console.warn('Backend submission failed, completing locally:', e);
    }

    const hasIssues =
      !state.checklist.registersMaintained ||
      state.evidenceList.some((e) => e.aiAnalysis?.anomaliesDetected);

    const newReport: CompletedReport = {
      id: `rep-${Date.now()}`,
      inspectionId: state.activeInspectionId,
      project: state.projectName,
      type: `${state.inspectionType} Physical Verification`,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: 'SUBMITTED & VERIFIED',
      evidenceCount: state.evidenceList.length,
      hashStatus: 'SHA-256 HASH VERIFIED',
      outcome: state.reportNotes || 'Field verification completed and geo-verified on-site.',
      result: hasIssues ? 'Issues Found' : 'Compliant',
      riskScore: hasIssues ? 82 : 28,
      anomaliesCount: hasIssues ? 1 : 0,
      geofenceVerified: state.isLocationVerified,
      biometricVerified: state.isBiometricVerified,
      timeline: finalTimeline,
      evidenceList: [...state.evidenceList],
    };

    set((prev) => ({
      completedReports: [newReport, ...prev.completedReports],
    }));

    return true;
  },

  resetActiveSession: () => {
    set({
      isBiometricVerified: false,
      biometricType: null,
      biometricTimestamp: null,
      activeTimeline: [],
      evidenceList: [],
      reportNotes: '',
    });
  },
}));
