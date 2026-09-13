/**
 * Master Divisions Dataset
 * SIH26095 | MoSJE Nirikshan AI
 *
 * PROVENANCE CLASSIFICATION:
 * - DIV-SD: OFFICIAL / VERIFIED DoSJE (socialjustice.gov.in)
 * - DIV-SCD: OFFICIAL / VERIFIED DoSJE (socialjustice.gov.in, pmajay.dosje.gov.in)
 * - DIV-DEPWD: PUBLIC / VERIFIED allied department under MoSJE, NOT DoSJE (depwd.gov.in)
 * - DIV-SAGE: DEMO / UNVERIFIED compatibility/prototype desk (officially under Social Defence)
 *
 * All currently represented division and scheme records have explicit provenance classification;
 * official records are verified against authoritative public sources, while allied/public and demo records are clearly labelled.
 */

import { Division } from '../../types/master';

export const MASTER_DIVISIONS: Division[] = [
  {
    divisionId: 'DIV-DEPWD',
    name: 'Disability Empowerment & Rehabilitation Division',
    shortName: 'DEPwD Desk',
    code: 'DIV-DEPWD',
    description: 'Oversees disability rehabilitation schemes, DDRS grant management, and special school aid under Ministry of Social Justice and Empowerment.',
    responsibleUnit: 'DEPwD National Monitoring Desk',
    active: true,
    schemeIds: ['SCH-DDRS'],
    projectIds: ['PRJ-101', 'PRJ-105'],
    organizationIds: ['ORG-SUNRISE', 'ORG-PRERNA'],
    performanceSummary: {
      totalProjects: 2,
      activeProjects: 2,
      completedProjects: 0,
      highPriorityProjects: 1,
      anomalyCount: 1,
    },
    monitoringSummary: {
      activeProjects: 2,
      highPriorityProjects: 1,
      criticalProjects: 0,
      anomalyCount: 1,
      inspectionsDue: 1,
      inspectionsCompleted: 1,
    },
    financialSummary: {
      sanctionedAmount: 8500000,
      releasedAmount: 6500000,
      utilizedAmount: 5100000,
      utilizationPercentage: 78.46,
    },
    dataSource: {
      type: 'PUBLIC',
      verificationStatus: 'VERIFIED',
      sourceName: 'Department of Empowerment of Persons with Disabilities (DEPwD), MoSJE',
      sourceUrl: 'https://depwd.gov.in',
      lastUpdated: '2026-03-01T00:00:00Z',
      notes: 'Allied sister department under MoSJE, NOT DoSJE. Operates as an independent department under the Ministry; included to monitor DDRS projects.',
    },
  },
  {
    divisionId: 'DIV-SD',
    name: 'Social Defence & Substance Demand Reduction Division',
    shortName: 'Social Defence',
    code: 'DIV-SD',
    description: 'Formulates and executes national policies on substance demand reduction, Nasha Mukt Bharat Abhiyaan, and vulnerable citizen welfare.',
    responsibleUnit: 'National Action Plan Monitoring Cell',
    active: true,
    schemeIds: ['SCH-NAPDDR'],
    projectIds: ['PRJ-102'],
    organizationIds: ['ORG-NAVJEEVAN'],
    performanceSummary: {
      totalProjects: 1,
      activeProjects: 1,
      completedProjects: 0,
      highPriorityProjects: 0,
      anomalyCount: 0,
    },
    monitoringSummary: {
      activeProjects: 1,
      highPriorityProjects: 0,
      criticalProjects: 0,
      anomalyCount: 0,
      inspectionsDue: 0,
      inspectionsCompleted: 1,
    },
    financialSummary: {
      sanctionedAmount: 5200000,
      releasedAmount: 4000000,
      utilizedAmount: 3450000,
      utilizationPercentage: 86.25,
    },
    dataSource: {
      type: 'OFFICIAL',
      verificationStatus: 'VERIFIED',
      sourceName: 'Department of Social Justice and Empowerment (DoSJE), Government of India',
      sourceUrl: 'https://socialjustice.gov.in',
      lastUpdated: '2026-03-01T00:00:00Z',
      notes: 'Official DoSJE division overseeing NAPDDR, de-addiction counseling, and social defence initiatives.',
    },
  },
  {
    divisionId: 'DIV-SCD',
    name: 'Scheduled Castes Development & Livelihood Division',
    shortName: 'SC Development',
    code: 'DIV-SCD',
    description: 'Directs educational, economic, and skill empowerment for Scheduled Castes communities, administering PM-AJAY, PM-DAKSH, and national fellowships.',
    responsibleUnit: 'SCD / PM-AJAY National Monitoring Wing',
    active: true,
    schemeIds: ['SCH-PM-DAKSH'],
    projectIds: ['PRJ-104'],
    organizationIds: ['ORG-SAMARPAN'],
    performanceSummary: {
      totalProjects: 1,
      activeProjects: 1,
      completedProjects: 0,
      highPriorityProjects: 0,
      anomalyCount: 0,
    },
    monitoringSummary: {
      activeProjects: 1,
      highPriorityProjects: 0,
      criticalProjects: 0,
      anomalyCount: 0,
      inspectionsDue: 1,
      inspectionsCompleted: 0,
    },
    financialSummary: {
      sanctionedAmount: 6400000,
      releasedAmount: 5000000,
      utilizedAmount: 4200000,
      utilizationPercentage: 84.0,
    },
    dataSource: {
      type: 'OFFICIAL',
      verificationStatus: 'VERIFIED',
      sourceName: 'Department of Social Justice and Empowerment (DoSJE), Government of India',
      sourceUrl: 'https://pmajay.dosje.gov.in',
      lastUpdated: '2026-03-01T00:00:00Z',
      notes: 'Official DoSJE division responsible for Scheduled Castes development and flagship socio-economic programs.',
    },
  },
  {
    divisionId: 'DIV-SAGE',
    name: 'Senior Citizens Welfare & Social Care Division',
    shortName: 'Senior Care Desk',
    code: 'DIV-SAGE',
    description: 'Administers senior care homes, geriatric rehabilitation, and Atal Vayo Abhyuday Yojana (AVAY).',
    responsibleUnit: 'Senior Care Schemes Directorate (Simulated)',
    active: true,
    schemeIds: ['SCH-AVAY'],
    projectIds: ['PRJ-103'],
    organizationIds: ['ORG-ASHADEEP'],
    performanceSummary: {
      totalProjects: 1,
      activeProjects: 1,
      completedProjects: 0,
      highPriorityProjects: 0,
      anomalyCount: 0,
    },
    monitoringSummary: {
      activeProjects: 1,
      highPriorityProjects: 0,
      criticalProjects: 0,
      anomalyCount: 0,
      inspectionsDue: 0,
      inspectionsCompleted: 1,
    },
    financialSummary: {
      sanctionedAmount: 4800000,
      releasedAmount: 3800000,
      utilizedAmount: 3100000,
      utilizationPercentage: 81.58,
    },
    dataSource: {
      type: 'DEMO',
      verificationStatus: 'UNVERIFIED',
      sourceName: 'MoSJE Prototype Registry (SAGE Initiative Representation)',
      sourceUrl: 'https://socialjustice.gov.in',
      lastUpdated: '2026-03-01T00:00:00Z',
      notes: 'DEMO / UNVERIFIED compatibility/prototype desk. Retained for backward compatibility with PRJ-103. In the official DoSJE organizational directory, Senior Citizens Welfare (AVAY/SAGE) operates under the Social Defence Division.',
    },
  },
];
