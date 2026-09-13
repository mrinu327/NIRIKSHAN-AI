/**
 * Master PMU & PMU Teams Dataset
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Models Project Monitoring Units and field inspection teams.
 * PRIVACY & SAFETY RULE: Strictly avoids real government employee names.
 * Uses institutional team and role placeholders (e.g. 'State Monitoring Team',
 * 'Regional Inspection Team', 'Scheme Monitoring Team').
 * Explicitly designated as DEMO / SIMULATED for prototype evaluation.
 */

import { PMU, PMUTeam } from '../../types/master';

export const MASTER_PMUS: PMU[] = [
  {
    pmuId: 'PMU-NATIONAL',
    name: 'National Project Monitoring Unit (MoSJE Central)',
    divisionId: 'DIV-DEPWD',
    description: 'Central project monitoring and surprise inspection coordination unit operating under MoSJE direction.',
    teamIds: ['TEAM-NAT-OVERSIGHT', 'TEAM-SURPRISE-RAPID'],
    statesCovered: ['ST-DL', 'ST-TN', 'ST-MH', 'ST-UP', 'ST-KA'],
    districtsCovered: [
      'DIST-DL-01',
      'DIST-DL-02',
      'DIST-DL-03',
      'DIST-DL-04',
      'DIST-TN-01',
      'DIST-TN-02',
      'DIST-MH-01',
      'DIST-MH-02',
      'DIST-UP-01',
      'DIST-UP-02',
      'DIST-KA-01',
    ],
    responsibilities: [
      'Surprise inspection authorization and random allocation',
      'National CCTV health and attendance telemetry monitoring',
      'High-risk project investigation coordination',
      'Cross-state compliance audit governance',
    ],
    active: true,
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE Prototype Registry',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-10T00:00:00Z',
      notes: 'Synthetic demo PMU unit modeling national field coordination mandate.',
    },
  },
  {
    pmuId: 'PMU-DELHI-NCR',
    name: 'Delhi NCR Regional Project Monitoring Unit',
    divisionId: 'DIV-DEPWD',
    description: 'Regional monitoring command overseeing welfare institutions and field audits across Delhi NCR districts.',
    teamIds: ['TEAM-DEL-NORTH', 'TEAM-DEL-CENTRAL'],
    statesCovered: ['ST-DL', 'ST-UP'],
    districtsCovered: ['DIST-DL-01', 'DIST-DL-02', 'DIST-DL-03', 'DIST-DL-04', 'DIST-UP-01'],
    responsibilities: [
      'On-site 100m geofence verification and biometric audits',
      'Biometric roster roll-call inspections',
      'Facility infrastructure and fire safety audits',
      'Rapid field response to CCTV discrepancy alerts',
    ],
    active: true,
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE Prototype Registry',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-10T00:00:00Z',
      notes: 'Synthetic demo regional PMU modeling Delhi NCR field unit.',
    },
  },
];

export const MASTER_PMU_TEAMS: PMUTeam[] = [
  {
    teamId: 'TEAM-DEL-NORTH',
    pmuId: 'PMU-DELHI-NCR',
    teamName: 'State Monitoring Team - Zone 1 (North / Rohini)',
    roles: [
      'Lead Inspection Officer',
      'Biometric Verification Specialist',
      'Technical Audit Associate',
    ],
    responsibilities: [
      'Routine and surprise physical inspections in North Delhi jurisdiction',
      'Geofence perimeter validation and biometric authentication',
      'Digital checklist completion and evidence tamper-sealing',
    ],
    statesCovered: ['ST-DL'],
    districtsCovered: ['DIST-DL-01'],
    activeMembers: 3,
    projectIds: ['PRJ-101'],
    inspectionIds: ['INSP-1092', 'INSP-8806'],
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE Prototype Registry',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-10T00:00:00Z',
      notes: 'Demo team placeholder modeling Zone 1 North Delhi auditors.',
    },
  },
  {
    teamId: 'TEAM-DEL-CENTRAL',
    pmuId: 'PMU-DELHI-NCR',
    teamName: 'Regional Inspection Team - Zone 2 (Central & West)',
    roles: [
      'Senior Field Audit Officer',
      'Financial Documentation Auditor',
      'Facility Verification Officer',
    ],
    responsibilities: [
      'Quarterly physical verification of de-addiction and senior care facilities',
      'Grant utilization and bank ledger reconciliation checks',
    ],
    statesCovered: ['ST-DL'],
    districtsCovered: ['DIST-DL-03', 'DIST-DL-04'],
    activeMembers: 3,
    projectIds: ['PRJ-102', 'PRJ-103', 'PRJ-105'],
    inspectionIds: ['INSP-1091', 'INSP-1093'],
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE Prototype Registry',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-10T00:00:00Z',
      notes: 'Demo team placeholder modeling Zone 2 Central/West Delhi auditors.',
    },
  },
  {
    teamId: 'TEAM-SURPRISE-RAPID',
    pmuId: 'PMU-NATIONAL',
    teamName: 'National Surprise Inspection & Rapid Verification Wing',
    roles: [
      'Special Audit Director',
      'Rapid Response Field Officer',
      'CCTV Computer Vision Telemetry Liaison',
    ],
    responsibilities: [
      'Unannounced high-priority surprise audits triggered by discrepancy telemetry',
      'Live surprise video verification call execution',
    ],
    statesCovered: ['ST-DL', 'ST-TN', 'ST-MH'],
    districtsCovered: ['DIST-DL-01', 'DIST-TN-01', 'DIST-MH-01'],
    activeMembers: 4,
    projectIds: ['PRJ-101', 'PRJ-104'],
    inspectionIds: ['INSP-1092'],
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE Prototype Registry',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-10T00:00:00Z',
      notes: 'Demo team placeholder modeling rapid response surprise inspection unit.',
    },
  },
];
