/**
 * Master Social Audits Dataset
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Models community-driven social audit sessions and beneficiary feedback.
 * Explicitly designated as DEMO / SIMULATED for prototype evaluation.
 */

import { SocialAudit } from '../../types/master';

export const MASTER_SOCIAL_AUDITS: SocialAudit[] = [
  {
    socialAuditId: 'SOC-101-2025',
    projectId: 'PRJ-101',
    organizationId: 'ORG-SUNRISE',
    conductedDate: '2025-11-20',
    auditorType: 'JOINT_TEAM',
    participantCount: 34,
    satisfactionRating: 3.8,
    keyObservations: [
      'Beneficiaries reported satisfaction with daily meal and physical therapy services.',
      'Parents noted irregular afternoon transport services on alternating days.',
    ],
    discrepanciesIdentified: [
      'Attendance register signature dates had minor formatting mismatches.',
    ],
    resolutionStatus: 'UNDER_REVIEW',
    dataSource: {
      type: 'DEMO',
      sourceName: 'Social Audit Unit Registry',
      verificationStatus: 'DEMO',
      lastUpdated: '2025-11-25T00:00:00Z',
      notes: 'Synthetic social audit report for Sunrise Rehabilitation Centre.',
    },
  },
  {
    socialAuditId: 'SOC-103-2025',
    projectId: 'PRJ-103',
    organizationId: 'ORG-ASHADEEP',
    conductedDate: '2025-12-08',
    auditorType: 'COMMUNITY_MEMBERS',
    participantCount: 28,
    satisfactionRating: 4.7,
    keyObservations: [
      'Residents praised medical attention and recreational activities.',
      'Living quarters cleanly maintained with accessible ramps.',
    ],
    discrepanciesIdentified: [],
    resolutionStatus: 'RESOLVED',
    dataSource: {
      type: 'DEMO',
      sourceName: 'Social Audit Unit Registry',
      verificationStatus: 'DEMO',
      lastUpdated: '2025-12-10T00:00:00Z',
      notes: 'Synthetic social audit report for Asha Deep Senior Care.',
    },
  },
];
