import { AIRecommendation } from '../../types/master';

export const MASTER_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    recommendationId: 'REC-PRJ-101-01',
    targetEntityId: 'PRJ-101',
    targetEntityType: 'PROJECT',
    title: 'Trigger Surprise Physical Inspection',
    summary:
      'Optical headcount deviation detected: CCTV camera stream detected 25 present vs 42 marked present in attendance log.',
    actionType: 'TRIGGER_SURPRISE_INSPECTION',
    confidenceScore: 0.94,
    reasoning: [
      'Discrepancy of 17 beneficiaries between physical register and camera feed',
      'Historical attendance variance exceeds 20% threshold',
      'Surprise inspection SLA recommended within 48 hours',
    ],
    priority: 'HIGH',
    status: 'PENDING',
    generatedAt: '2026-03-01T14:30:00Z',
    dataSource: {
      type: 'DEMO',
      capturedAt: '2026-03-01T14:30:00Z',
      verificationStatus: 'DEMO',
      syncStatus: 'SYNCED',
    },
  },
  {
    recommendationId: 'REC-PRJ-101-02',
    targetEntityId: 'PRJ-101',
    targetEntityType: 'PROJECT',
    title: 'Withhold Next Grant Tranche Pending Verification',
    summary:
      'Utilized funds exceed verified beneficiary service delivery threshold by 28%.',
    actionType: 'WITHHOLD_FUND_RELEASE',
    confidenceScore: 0.88,
    reasoning: [
      'Total released: ₹35,00,000, Utilized: ₹28,50,000',
      'Attendance discrepancy ALT-2601 unresolved',
      'MoSJE financial compliance guidelines require verified biometric parity',
    ],
    priority: 'CRITICAL',
    status: 'PENDING',
    generatedAt: '2026-03-01T15:00:00Z',
    dataSource: {
      type: 'DEMO',
      capturedAt: '2026-03-01T15:00:00Z',
      verificationStatus: 'DEMO',
      syncStatus: 'SYNCED',
    },
  },
  {
    recommendationId: 'REC-PRJ-104-01',
    targetEntityId: 'PRJ-104',
    targetEntityType: 'PROJECT',
    title: 'Schedule Video Verification Call',
    summary:
      'Scheduled inspection pending with high geolocation accuracy requirement.',
    actionType: 'SCHEDULE_VIDEO_VERIFICATION',
    confidenceScore: 0.82,
    reasoning: [
      'Project status is ACTIVE with low anomaly risk',
      'Remote geo-tagged VC verification will accelerate milestone compliance check',
    ],
    priority: 'MEDIUM',
    status: 'ACCEPTED',
    generatedAt: '2026-02-28T09:00:00Z',
    dataSource: {
      type: 'DEMO',
      capturedAt: '2026-02-28T09:00:00Z',
      verificationStatus: 'DEMO',
      syncStatus: 'SYNCED',
    },
  },
  {
    recommendationId: 'REC-ORG-SAMARPAN-01',
    targetEntityId: 'ORG-SAMARPAN',
    targetEntityType: 'ORGANIZATION',
    title: 'Initiate Document Inquiry on Dormant Project',
    summary:
      'PRJ-105 status suspended due to pending documentation renewal.',
    actionType: 'INITIATE_DOCUMENT_INQUIRY',
    confidenceScore: 0.91,
    reasoning: [
      'Niti Aayog Darpan ID re-validation pending beyond 60 days',
      'Utilization certificate for 2025-26 fiscal cycle overdue',
    ],
    priority: 'HIGH',
    status: 'PENDING',
    generatedAt: '2026-02-15T11:20:00Z',
    dataSource: {
      type: 'DEMO',
      capturedAt: '2026-02-15T11:20:00Z',
      verificationStatus: 'DEMO',
      syncStatus: 'SYNCED',
    },
  },
];
