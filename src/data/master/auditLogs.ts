import { MasterAuditLog } from '../../types/master';

export const MASTER_AUDIT_LOGS: MasterAuditLog[] = [
  {
    auditLogId: 'LOG-001',
    actorId: 'OFFICIAL-DEMO-01',
    actorRole: 'GOVERNMENT_OFFICIAL',
    action: 'INITIATE_INSPECTION',
    entityType: 'INSPECTION',
    entityId: 'INSP-1092',
    metadata: {
      projectId: 'PRJ-101',
      inspectionType: 'Surprise Inspection',
      reason: 'CCTV optical headcount anomaly ALT-2601',
    },
    timestamp: '2026-03-01T08:00:00Z',
  },
  {
    auditLogId: 'LOG-002',
    actorId: 'INSP-DEMO-01',
    actorRole: 'INSPECTION_OFFICER',
    action: 'GEOFENCE_VERIFY_START',
    entityType: 'INSPECTION',
    entityId: 'INSP-1092',
    metadata: {
      latitude: 28.7041,
      longitude: 77.1025,
      geofenceStatus: 'INSIDE',
      distanceMeters: 42,
    },
    timestamp: '2026-03-01T10:30:00Z',
  },
  {
    auditLogId: 'LOG-003',
    actorId: 'INSP-DEMO-01',
    actorRole: 'INSPECTION_OFFICER',
    action: 'UPLOAD_EVIDENCE',
    entityType: 'EVIDENCE',
    entityId: 'EVD-101-01',
    metadata: {
      type: 'PHOTO',
      hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      integrityStatus: 'VERIFIED',
    },
    timestamp: '2026-03-01T10:45:00Z',
  },
  {
    auditLogId: 'LOG-004',
    actorId: 'AI_SYSTEM',
    actorRole: 'SYSTEM',
    action: 'GENERATE_RECOMMENDATION',
    entityType: 'RECOMMENDATION',
    entityId: 'REC-PRJ-101-01',
    metadata: {
      confidenceScore: 0.94,
      actionType: 'TRIGGER_SURPRISE_INSPECTION',
    },
    timestamp: '2026-03-01T14:30:00Z',
  },
];
