/**
 * NIRIKSHAN AI — Dashboard Data Store (Zustand)
 * Manages fetching and caching of dashboard KPIs, alerts, risk distribution
 * Uses local mock data for demo mode; API-ready with axios.
 */

import { create } from 'zustand';
import { RiskLevel } from '@nirikshan/shared-types';

export interface DashboardKPI {
  totalProjects: number;
  activeProjects: number;
  highRiskProjects: number;
  openAlerts: number;
  camerasOnline: number;
  camerasOffline: number;
  camerasDelayed: number;
  pendingInspections: number;
  projectsUnderInvestigation: number;
  attendanceMismatches: number;
}

export interface LiveAlert {
  id: string;
  title: string;
  project: string;
  district: string;
  state: string;
  severity: RiskLevel;
  score: number;
  explanation: string;
  recommendedAction: string;
  timestamp: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE';
}

export interface RiskDistribution {
  [RiskLevel.CRITICAL]: number;
  [RiskLevel.HIGH]: number;
  [RiskLevel.MEDIUM]: number;
  [RiskLevel.LOW]: number;
  total: number;
}

interface DashboardState {
  kpi: DashboardKPI;
  alerts: LiveAlert[];
  riskDistribution: RiskDistribution;
  isLoading: boolean;
  lastRefreshed: Date | null;
  acknowledgeAlert: (alertId: string) => void;
  markFalsePositive: (alertId: string) => void;
  assignInspection: (alertId: string) => void;
  refresh: () => void;
}

const DEMO_ALERTS: LiveAlert[] = [
  {
    id: 'anom-001',
    title: 'High Attendance Discrepancy (33.7%)',
    project: 'Demo Welfare Institute',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    severity: RiskLevel.HIGH,
    score: 82,
    explanation: 'Reported: 92 beneficiaries vs Observed: ~61 unique individuals by dining hall computer vision during peak lunch hours.',
    recommendedAction: 'Assign surprise physical inspection within 48 hours. Cross-verify NGO attendance register.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  {
    id: 'anom-005',
    title: 'Attendance Sanction Exceeded (+25.7%)',
    project: 'Demo Rehabilitation Centre',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    severity: RiskLevel.CRITICAL,
    score: 91,
    explanation: 'Facility licensed for 70 beds. NGO reported 88 active beneficiaries. Video analytics observe only ~45 attendees in common areas.',
    recommendedAction: 'Critical: Immediate surprise inspection and headcount verification. Flag for senior review.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  {
    id: 'anom-002',
    title: 'CCTV Offline During Working Hours',
    project: 'Demo De-addiction Kendra',
    district: 'Ludhiana',
    state: 'Punjab',
    severity: RiskLevel.HIGH,
    score: 68,
    explanation: 'Camera "Ward 2 Rehabilitation Hall" stopped transmitting heartbeats 4+ hours ago without maintenance notice filed.',
    recommendedAction: 'Contact NGO CCTV coordinator. If no response in 2 hours, dispatch surprise inspector.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  {
    id: 'anom-004',
    title: 'Possible Duplicate Evidence Re-use',
    project: 'Demo Drug De-addiction',
    district: 'Ahmedabad',
    state: 'Gujarat',
    severity: RiskLevel.HIGH,
    score: 84,
    explanation: 'Submitted photo evidence SHA-256 hash matches an identical submission from 45 days ago in another inspection report.',
    recommendedAction: 'Request original unedited photos with EXIF metadata from NGO. Escalate to legal cell if pattern continues.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  {
    id: 'anom-006',
    title: 'GPS Drift During Inspection',
    project: 'Demo Women Empowerment Centre',
    district: 'Pune',
    state: 'Maharashtra',
    severity: RiskLevel.MEDIUM,
    score: 45,
    explanation: 'Inspector GPS log shows location 2.3 km from registered site during active inspection session. Device may have been stationary.',
    recommendedAction: 'Request inspector explanation. Compare with timestamped photos taken during inspection.',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    status: 'ACKNOWLEDGED',
  },
];

export const useDashboardStore = create<DashboardState>()((set) => ({
  kpi: {
    totalProjects: 12,
    activeProjects: 10,
    highRiskProjects: 5,
    openAlerts: 15,
    camerasOnline: 7,
    camerasOffline: 2,
    camerasDelayed: 1,
    pendingInspections: 3,
    projectsUnderInvestigation: 1,
    attendanceMismatches: 4,
  },
  alerts: DEMO_ALERTS,
  riskDistribution: {
    [RiskLevel.CRITICAL]: 1,
    [RiskLevel.HIGH]: 4,
    [RiskLevel.MEDIUM]: 3,
    [RiskLevel.LOW]: 4,
    total: 12,
  },
  isLoading: false,
  lastRefreshed: new Date(),

  acknowledgeAlert: (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a
      ),
    }));
  },

  markFalsePositive: (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'FALSE_POSITIVE' as const } : a
      ),
      kpi: { ...state.kpi, openAlerts: Math.max(0, state.kpi.openAlerts - 1) },
    }));
  },

  assignInspection: (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a
      ),
      kpi: { ...state.kpi, pendingInspections: state.kpi.pendingInspections + 1 },
    }));
  },

  refresh: () => {
    set({ isLoading: true, lastRefreshed: new Date() });
    setTimeout(() => {
      set({ isLoading: false });
    }, 1200);
  },
}));
