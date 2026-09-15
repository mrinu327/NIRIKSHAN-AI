/**
 * Master Beneficiary Summaries Dataset
 * SIH26095 | MoSJE Nirikshan AI
 *
 * PRIVACY & SAFETY RULE: Strictly contains aggregate statistical figures and discrepancy
 * flags. Completely free of personally identifiable beneficiary information (PII).
 * Detailed individual rosters remain encapsulated in institutional services.
 * Explicitly designated as DEMO / SIMULATED for prototype evaluation.
 */

import { BeneficiarySummary } from '../../types/master';

export const MASTER_BENEFICIARY_SUMMARIES: BeneficiarySummary[] = [
  {
    beneficiarySummaryId: 'BEN-SUM-101',
    projectId: 'PRJ-101',
    organizationId: 'ORG-SUNRISE',
    targetCount: 50,
    enrolledCount: 50,
    reportedCount: 42,
    verifiedCount: 25, // Optical headcount estimate from entrance camera
    attendanceRate: 84.0,
    demographicSummary: {
      ageGroups: {
        '18-25': 14,
        '26-35': 21,
        '36-50': 12,
        '50+': 3,
      },
      genderSummary: {
        Male: 32,
        Female: 18,
      },
    },
    geographicSummary: {
      stateId: 'ST-DL',
      districtId: 'DIST-DL-01',
      localityCount: 8,
    },
    discrepancyFlags: ['ATTENDANCE_CCTV_MISMATCH'],
    anomalyIds: ['ALT-2601'],
    dataSource: {
      type: 'DEMO',
      sourceName: 'Institutional Roll-Call & Vision Telemetry Aggregate',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-10T09:28:00Z',
      notes: 'Demonstrates 42 reported attendance vs 25 optical verification variance.',
    },
  },
  {
    beneficiarySummaryId: 'BEN-SUM-102',
    projectId: 'PRJ-102',
    organizationId: 'ORG-NAVJEEVAN',
    targetCount: 60,
    enrolledCount: 60,
    reportedCount: 54,
    verifiedCount: 52,
    attendanceRate: 90.0,
    demographicSummary: {
      ageGroups: {
        '18-25': 20,
        '26-35': 26,
        '36-50': 14,
      },
      genderSummary: {
        Male: 45,
        Female: 15,
      },
    },
    geographicSummary: {
      stateId: 'ST-DL',
      districtId: 'DIST-DL-04',
      localityCount: 12,
    },
    discrepancyFlags: [],
    anomalyIds: [],
    dataSource: {
      type: 'DEMO',
      sourceName: 'Institutional Aggregate Telemetry',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-08T11:00:00Z',
      notes: 'Compliant de-addiction facility demographic summary.',
    },
  },
  {
    beneficiarySummaryId: 'BEN-SUM-103',
    projectId: 'PRJ-103',
    organizationId: 'ORG-ASHADEEP',
    targetCount: 40,
    enrolledCount: 40,
    reportedCount: 38,
    verifiedCount: 38,
    attendanceRate: 95.0,
    demographicSummary: {
      ageGroups: {
        '60-70': 18,
        '71-80': 15,
        '80+': 7,
      },
      genderSummary: {
        Male: 16,
        Female: 24,
      },
    },
    geographicSummary: {
      stateId: 'ST-DL',
      districtId: 'DIST-DL-01',
      localityCount: 5,
    },
    discrepancyFlags: [],
    anomalyIds: [],
    dataSource: {
      type: 'DEMO',
      sourceName: 'Institutional Aggregate Telemetry',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-05T14:30:00Z',
      notes: 'Senior citizens residential care demographic summary.',
    },
  },
  {
    beneficiarySummaryId: 'BEN-SUM-104',
    projectId: 'PRJ-104',
    organizationId: 'ORG-SAMARPAN',
    targetCount: 80,
    enrolledCount: 80,
    reportedCount: 72,
    verifiedCount: 68,
    attendanceRate: 90.0,
    demographicSummary: {
      ageGroups: {
        '18-25': 48,
        '26-35': 24,
      },
      genderSummary: {
        Male: 42,
        Female: 38,
      },
    },
    geographicSummary: {
      stateId: 'ST-DL',
      districtId: 'DIST-DL-02',
      localityCount: 14,
    },
    discrepancyFlags: [],
    anomalyIds: [],
    dataSource: {
      type: 'DEMO',
      sourceName: 'Institutional Aggregate Telemetry',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-01T16:00:00Z',
      notes: 'PM-DAKSH vocational skills training cohort summary.',
    },
  },
  {
    beneficiarySummaryId: 'BEN-SUM-105',
    projectId: 'PRJ-105',
    organizationId: 'ORG-PRERNA',
    targetCount: 35,
    enrolledCount: 35,
    reportedCount: 32,
    verifiedCount: 32,
    attendanceRate: 91.4,
    demographicSummary: {
      ageGroups: {
        '6-12': 14,
        '13-18': 18,
      },
      genderSummary: {
        Male: 18,
        Female: 14,
      },
    },
    geographicSummary: {
      stateId: 'ST-DL',
      districtId: 'DIST-DL-03',
      localityCount: 6,
    },
    discrepancyFlags: [],
    anomalyIds: [],
    dataSource: {
      type: 'DEMO',
      sourceName: 'Institutional Aggregate Telemetry',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-08-28T10:15:00Z',
      notes: 'Special education school student demographic summary.',
    },
  },
];
