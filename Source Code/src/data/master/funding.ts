/**
 * Master Funding Dataset
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Tracks grant sanctions, releases, utilization, and unspent balances.
 * CONSISTENCY RULE:
 * unspentAmount = releasedAmount - utilizedAmount
 * utilizationPercentage = (utilizedAmount / releasedAmount) * 100
 * Explicitly designated as DEMO / SIMULATED for prototype evaluation.
 */

import { Funding } from '../../types/master';

export const MASTER_FUNDING: Funding[] = [
  {
    fundingId: 'FND-101-2026',
    projectId: 'PRJ-101',
    organizationId: 'ORG-SUNRISE',
    schemeId: 'SCH-DDRS',
    sanctionedAmount: 4800000,
    releasedAmount: 3600000,
    utilizedAmount: 2850000,
    unspentAmount: 750000, // 3600000 - 2850000
    utilizationPercentage: 79.17, // (2850000 / 3600000) * 100
    releaseDate: '2025-05-14',
    financialYear: '2025-26',
    status: 'UTILIZATION_PENDING',
    anomalyIds: ['ALT-2601'],
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE Public Financial Management System (PFMS Simulated)',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-10T00:00:00Z',
      notes: 'Synthetic demo grant release record for Sunrise Rehabilitation Centre.',
    },
  },
  {
    fundingId: 'FND-102-2026',
    projectId: 'PRJ-102',
    organizationId: 'ORG-NAVJEEVAN',
    schemeId: 'SCH-NAPDDR',
    sanctionedAmount: 5200000,
    releasedAmount: 4000000,
    utilizedAmount: 3450000,
    unspentAmount: 550000,
    utilizationPercentage: 86.25,
    releaseDate: '2025-06-10',
    financialYear: '2025-26',
    status: 'RELEASED',
    anomalyIds: [],
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE PFMS Simulated',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-08T00:00:00Z',
      notes: 'Synthetic demo grant release record for Navjeevan Welfare Trust.',
    },
  },
  {
    fundingId: 'FND-103-2026',
    projectId: 'PRJ-103',
    organizationId: 'ORG-ASHADEEP',
    schemeId: 'SCH-AVAY',
    sanctionedAmount: 4800000,
    releasedAmount: 3800000,
    utilizedAmount: 3100000,
    unspentAmount: 700000,
    utilizationPercentage: 81.58,
    releaseDate: '2025-04-20',
    financialYear: '2025-26',
    status: 'RELEASED',
    anomalyIds: [],
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE PFMS Simulated',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-05T00:00:00Z',
      notes: 'Synthetic demo grant release record for Asha Deep Senior Care.',
    },
  },
  {
    fundingId: 'FND-104-2026',
    projectId: 'PRJ-104',
    organizationId: 'ORG-SAMARPAN',
    schemeId: 'SCH-PM-DAKSH',
    sanctionedAmount: 6400000,
    releasedAmount: 5000000,
    utilizedAmount: 4200000,
    unspentAmount: 800000,
    utilizationPercentage: 84.0,
    releaseDate: '2025-05-30',
    financialYear: '2025-26',
    status: 'PARTIALLY_RELEASED',
    anomalyIds: [],
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE PFMS Simulated',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-09-01T00:00:00Z',
      notes: 'Synthetic demo grant release record for Samarpan Institute.',
    },
  },
  {
    fundingId: 'FND-105-2026',
    projectId: 'PRJ-105',
    organizationId: 'ORG-PRERNA',
    schemeId: 'SCH-DDRS',
    sanctionedAmount: 3700000,
    releasedAmount: 2900000,
    utilizedAmount: 2250000,
    unspentAmount: 650000,
    utilizationPercentage: 77.59,
    releaseDate: '2025-07-15',
    financialYear: '2025-26',
    status: 'RELEASED',
    anomalyIds: [],
    dataSource: {
      type: 'DEMO',
      sourceName: 'MoSJE PFMS Simulated',
      verificationStatus: 'DEMO',
      lastUpdated: '2026-08-28T00:00:00Z',
      notes: 'Synthetic demo grant release record for Prerna Special School.',
    },
  },
];
