/**
 * Master Risk Scores Dataset
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Models explainable multi-factor risk assessments for projects and organizations.
 * SAFETY RULE: Risk scores are diagnostic indicators to assist human officials.
 * Never used to make autonomous enforcement decisions.
 * Explicitly designated as DEMO / SIMULATED for prototype evaluation.
 */

import { RiskScore } from '../../types/master';

export const MASTER_RISK_SCORES: RiskScore[] = [
  {
    riskScoreId: 'RSK-PRJ-101',
    entityId: 'PRJ-101',
    entityType: 'PROJECT',
    overallScore: 78,
    riskLevel: 'HIGH',
    factors: [
      {
        category: 'Attendance & CCTV',
        factor: 'Reported vs Camera Headcount Discrepancy',
        weight: 0.45,
        score: 85,
        description: '42 attendance claimed vs 25 optical count observed.',
      },
      {
        category: 'Inspection Status',
        factor: 'Surprise Audit Due',
        weight: 0.3,
        score: 75,
        description: 'Discrepancy alert requires physical ground verification.',
      },
      {
        category: 'Financial Utilization',
        factor: 'Grant Utilization Pace',
        weight: 0.25,
        score: 70,
        description: '79.2% utilization rate against 85% expected milestone.',
      },
    ],
    evaluatedAt: '2026-09-10T10:14:00Z',
    nextEvaluationDue: '2026-09-17T10:14:00Z',
    dataSource: {
      type: 'DEMO',
      sourceName: 'AI Risk Engine Evaluation',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-10T10:14:00Z',
    },
  },
  {
    riskScoreId: 'RSK-PRJ-102',
    entityId: 'PRJ-102',
    entityType: 'PROJECT',
    overallScore: 32,
    riskLevel: 'MEDIUM',
    factors: [
      {
        category: 'Attendance & CCTV',
        factor: 'Headcount Alignment',
        weight: 0.45,
        score: 25,
        description: '54 attendance vs 52 optical count (within normal variance).',
      },
      {
        category: 'Inspection Status',
        factor: 'Routine Audit Schedule',
        weight: 0.3,
        score: 40,
        description: 'Bi-annual routine inspection upcoming.',
      },
      {
        category: 'Financial Utilization',
        factor: 'Grant Utilization Pace',
        weight: 0.25,
        score: 35,
        description: '86.25% utilization on track with project timeline.',
      },
    ],
    evaluatedAt: '2026-09-08T11:00:00Z',
    nextEvaluationDue: '2026-09-22T11:00:00Z',
    dataSource: {
      type: 'DEMO',
      sourceName: 'AI Risk Engine Evaluation',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-08T11:00:00Z',
    },
  },
  {
    riskScoreId: 'RSK-PRJ-103',
    entityId: 'PRJ-103',
    entityType: 'PROJECT',
    overallScore: 18,
    riskLevel: 'LOW',
    factors: [
      {
        category: 'Attendance & CCTV',
        factor: 'Headcount Alignment',
        weight: 0.45,
        score: 10,
        description: 'Perfect alignment: 38 reported vs 38 verified.',
      },
      {
        category: 'Inspection Status',
        factor: 'Recent Follow-up Audit',
        weight: 0.3,
        score: 15,
        description: 'Follow-up audit completed with 94/100 score.',
      },
      {
        category: 'Financial Utilization',
        factor: 'Grant Utilization Pace',
        weight: 0.25,
        score: 30,
        description: '81.58% utilization on track.',
      },
    ],
    evaluatedAt: '2026-09-05T14:30:00Z',
    nextEvaluationDue: '2026-10-05T14:30:00Z',
    dataSource: {
      type: 'DEMO',
      sourceName: 'AI Risk Engine Evaluation',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-05T14:30:00Z',
    },
  },
];
