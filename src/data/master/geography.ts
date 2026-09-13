/**
 * Master Geographical Dataset
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Provides realistic geographical demo records for states and districts
 * to demonstrate multi-tier filtering, regional risk mapping, and PMU coverage.
 * NOTE: Explicitly marked as synthetic demo data for prototype evaluation.
 */

import { State, District } from '../../types/master';

export const MASTER_STATES: State[] = [
  {
    stateId: 'ST-DL',
    name: 'Delhi',
    code: 'DL',
    districtIds: ['DIST-DL-01', 'DIST-DL-02', 'DIST-DL-03', 'DIST-DL-04'],
    active: true,
  },
  {
    stateId: 'ST-TN',
    name: 'Tamil Nadu',
    code: 'TN',
    districtIds: ['DIST-TN-01', 'DIST-TN-02'],
    active: true,
  },
  {
    stateId: 'ST-MH',
    name: 'Maharashtra',
    code: 'MH',
    districtIds: ['DIST-MH-01', 'DIST-MH-02'],
    active: true,
  },
  {
    stateId: 'ST-UP',
    name: 'Uttar Pradesh',
    code: 'UP',
    districtIds: ['DIST-UP-01', 'DIST-UP-02'],
    active: true,
  },
  {
    stateId: 'ST-KA',
    name: 'Karnataka',
    code: 'KA',
    districtIds: ['DIST-KA-01'],
    active: true,
  },
];

export const MASTER_DISTRICTS: District[] = [
  // Delhi
  {
    districtId: 'DIST-DL-01',
    name: 'North Delhi',
    stateId: 'ST-DL',
    code: 'DL-NO',
    active: true,
  },
  {
    districtId: 'DIST-DL-02',
    name: 'South Delhi',
    stateId: 'ST-DL',
    code: 'DL-SO',
    active: true,
  },
  {
    districtId: 'DIST-DL-03',
    name: 'Central Delhi',
    stateId: 'ST-DL',
    code: 'DL-CE',
    active: true,
  },
  {
    districtId: 'DIST-DL-04',
    name: 'West Delhi',
    stateId: 'ST-DL',
    code: 'DL-WE',
    active: true,
  },

  // Tamil Nadu
  {
    districtId: 'DIST-TN-01',
    name: 'Coimbatore',
    stateId: 'ST-TN',
    code: 'TN-CBE',
    active: true,
  },
  {
    districtId: 'DIST-TN-02',
    name: 'Chennai',
    stateId: 'ST-TN',
    code: 'TN-CHN',
    active: true,
  },

  // Maharashtra
  {
    districtId: 'DIST-MH-01',
    name: 'Mumbai Suburban',
    stateId: 'ST-MH',
    code: 'MH-MUM',
    active: true,
  },
  {
    districtId: 'DIST-MH-02',
    name: 'Pune',
    stateId: 'ST-MH',
    code: 'MH-PUN',
    active: true,
  },

  // Uttar Pradesh
  {
    districtId: 'DIST-UP-01',
    name: 'Gautam Buddha Nagar',
    stateId: 'ST-UP',
    code: 'UP-GBN',
    active: true,
  },
  {
    districtId: 'DIST-UP-02',
    name: 'Lucknow',
    stateId: 'ST-UP',
    code: 'UP-LKO',
    active: true,
  },

  // Karnataka
  {
    districtId: 'DIST-KA-01',
    name: 'Bengaluru Urban',
    stateId: 'ST-KA',
    code: 'KA-BLR',
    active: true,
  },
];
