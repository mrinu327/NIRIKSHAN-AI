/**
 * Master Inspection Findings Dataset
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Models structured field findings recorded by PMU inspectors.
 * Explicitly designated as DEMO / SIMULATED for prototype evaluation.
 */

import { Finding } from '../../types/master';

export const MASTER_FINDINGS: Finding[] = [
  {
    findingId: 'FND-101-01',
    inspectionId: 'INSP-1092',
    projectId: 'PRJ-101',
    organizationId: 'ORG-SUNRISE',
    category: 'Beneficiary Verification',
    title: 'Headcount Reconciliation Variance',
    description: 'Physical count in classroom A and workshop observed 25 beneficiaries while register marked 42 present.',
    severity: 'HIGH',
    status: 'OPEN',
    evidenceIds: ['EVD-101-01'],
    anomalyIds: ['ALT-2601'],
    recommendedAction: 'Institute in-charge must submit roll-call explanation and sync biometric log within 48 hours.',
    createdAt: '2026-09-10T10:30:00Z',
    updatedAt: '2026-09-10T10:30:00Z',
  },
  {
    findingId: 'FND-101-02',
    inspectionId: 'INSP-1092',
    projectId: 'PRJ-101',
    organizationId: 'ORG-SUNRISE',
    category: 'Infrastructure / Facility',
    title: 'CCTV Camera 02 Obstructed Coverage',
    description: 'Rear corridor camera lens obscured by interior partition board, reducing field of view.',
    severity: 'MEDIUM',
    status: 'IN_REVIEW',
    evidenceIds: ['EVD-101-02'],
    anomalyIds: [],
    recommendedAction: 'Reposition camera mount to ensure unobstructed viewing angle of secondary exit.',
    createdAt: '2026-09-10T10:45:00Z',
    updatedAt: '2026-09-10T10:45:00Z',
  },
  {
    findingId: 'FND-103-01',
    inspectionId: 'INSP-1091',
    projectId: 'PRJ-103',
    organizationId: 'ORG-ASHADEEP',
    category: 'Records / Documentation',
    title: 'Medical Aid Log Up-to-date',
    description: 'Weekly geriatric physical therapy register verified and signed by visiting medical officer.',
    severity: 'INFO',
    status: 'RESOLVED',
    evidenceIds: ['EVD-103-01'],
    anomalyIds: [],
    recommendedAction: 'Maintain current standard of daily verification logging.',
    createdAt: '2026-09-03T12:15:00Z',
    updatedAt: '2026-09-03T13:45:00Z',
  },
];
