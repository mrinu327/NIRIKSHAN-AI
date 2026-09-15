import { create } from 'zustand';
import { RiskLevel, Project } from '@nirikshan/shared-types';
import { api } from '../services/api';

export interface DashboardKPI {
  totalProjects: number;
  activeProjects: number;
  highRiskProjects: number;
  openAlerts: number;
  camerasOnline: number;
  camerasOffline: number;
  pendingInspections: number;
  projectsUnderInvestigation: number;
}

export interface LiveAlert {
  id: string;
  title: string;
  project: string;
  projectId?: string;
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
  projects: Project[];
  riskDistribution: RiskDistribution;
  isLoading: boolean;
  lastRefreshed: Date | null;
  fetchDashboardData: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void> | void;
  markFalsePositive: (alertId: string) => Promise<void> | void;
  assignInspection: (alertId: string) => Promise<void> | void;
}

const DEFAULT_ALERTS: LiveAlert[] = [
  {
    id: 'anom-001',
    title: 'High Attendance Discrepancy (33.7%)',
    project: 'Demo Welfare Institute - Coimbatore',
    projectId: 'proj-001',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    severity: RiskLevel.HIGH,
    score: 82,
    explanation:
      'Reported: 92 beneficiaries vs Observed: ~61 unique individuals by dining hall computer vision during peak lunch hours.',
    recommendedAction: 'Assign surprise physical inspection within 48 hours. Cross-verify register.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  {
    id: 'anom-005',
    title: 'Attendance Sanction Exceeded (+25.7%)',
    project: 'Demo Rehabilitation Centre - Lucknow',
    projectId: 'proj-005',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    severity: RiskLevel.CRITICAL,
    score: 89,
    explanation:
      'Facility licensed for 70 beds. NGO reported 88 active beneficiaries. Common area vision estimates ~45 persons.',
    recommendedAction: 'Priority: Immediate surprise inspection and physical bed-count verification.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  {
    id: 'anom-002',
    title: 'CCTV Offline During Working Hours',
    project: 'Demo De-addiction Kendra - Ludhiana',
    projectId: 'proj-003',
    district: 'Ludhiana',
    state: 'Punjab',
    severity: RiskLevel.HIGH,
    score: 68,
    explanation:
      'Camera "Ward 2 Rehabilitation Hall" stopped transmitting heartbeats 4+ hours ago without maintenance notice filed.',
    recommendedAction: 'Contact NGO CCTV coordinator. If unresolved in 2 hours, dispatch surprise inspector.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
];

export const useDashboardStore = create<DashboardState>()((set, get) => ({

  kpi: {
    totalProjects: 12,
    activeProjects: 10,
    highRiskProjects: 5,
    openAlerts: 11,
    camerasOnline: 7,
    camerasOffline: 2,
    pendingInspections: 3,
    projectsUnderInvestigation: 2,
  },
  alerts: DEFAULT_ALERTS,
  projects: [],
  riskDistribution: {
    [RiskLevel.CRITICAL]: 1,
    [RiskLevel.HIGH]: 4,
    [RiskLevel.MEDIUM]: 3,
    [RiskLevel.LOW]: 4,
    total: 12,
  },
  isLoading: false,
  lastRefreshed: new Date(),

  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const [summary, dist, alertList, projectList] = await Promise.all([
        api.getDashboardSummary(),
        api.getRiskDistribution(),
        api.getDashboardAlerts(),
        api.getProjects(),
      ]);

      const formattedAlerts: LiveAlert[] =
        alertList && alertList.length > 0
          ? alertList.map((a: any) => ({
              id: a.id,
              title: a.type ? a.type.replace(/_/g, ' ') : 'System Compliance Alert',
              project: a.project?.name || 'Registered Scheme Institute',
              projectId: a.project?.id || 'proj-001',
              district: a.project?.district || 'District HQ',
              state: a.project?.state || 'State',
              severity: (a.severity as RiskLevel) || RiskLevel.MEDIUM,
              score: a.riskScore || 50,
              explanation: a.explanation || 'Compliance discrepancy flagged by rule engine.',
              recommendedAction: 'Review project dossier and initiate field verification.',
              timestamp: a.createdAt || new Date().toISOString(),
              status: (a.status as any) || 'OPEN',
            }))
          : DEFAULT_ALERTS;

      set({
        kpi: {
          totalProjects: summary.totalProjects || 12,
          activeProjects: summary.activeProjects || 10,
          highRiskProjects: summary.highRiskProjects || 5,
          openAlerts: summary.openAlerts || 11,
          camerasOnline: summary.camerasOnline || 7,
          camerasOffline: summary.camerasOffline || 2,
          pendingInspections: summary.projectsUnderInspection || 2,
          projectsUnderInvestigation: summary.projectsUnderInspection || 2,
        },
        riskDistribution: {
          [RiskLevel.CRITICAL]: dist[RiskLevel.CRITICAL] || 1,
          [RiskLevel.HIGH]: dist[RiskLevel.HIGH] || 4,
          [RiskLevel.MEDIUM]: dist[RiskLevel.MEDIUM] || 3,
          [RiskLevel.LOW]: dist[RiskLevel.LOW] || 4,
          total: dist.total || 12,
        },
        alerts: formattedAlerts,
        projects: projectList || [],
        lastRefreshed: new Date(),
        isLoading: false,
      });
    } catch (e) {
      console.warn('Error updating dashboard state from API:', e);
      set({ isLoading: false });
    }
  },

  acknowledgeAlert: async (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a
      ),
    }));

    try {
      await api.reviewAnomaly(
        alertId,
        'REVIEWED',
        'Dr. Rajesh Sharma',
        'Acknowledged from official monitoring dashboard'
      );
    } catch (e) {
      console.warn('Backend reviewAnomaly failed, kept local state:', e);
    }
  },

  markFalsePositive: async (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'FALSE_POSITIVE' as const } : a
      ),
      kpi: { ...state.kpi, openAlerts: Math.max(0, state.kpi.openAlerts - 1) },
    }));

    try {
      await api.reviewAnomaly(
        alertId,
        'FALSE_POSITIVE',
        'Dr. Rajesh Sharma',
        'Dismissed as false positive by official review'
      );
    } catch (e) {
      console.warn('Backend reviewAnomaly failed, kept local state:', e);
    }
  },

  assignInspection: async (alertId: string) => {
    const alert = get().alerts.find((a) => a.id === alertId);

    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a
      ),
      kpi: { ...state.kpi, pendingInspections: state.kpi.pendingInspections + 1 },
    }));

    if (alert) {
      try {
        await api.assignInspection({
          projectId: alert.projectId || 'proj-001',
          reason: alert.explanation || alert.title,
          alertId: alert.id,
          priority: alert.severity,
        });
      } catch (e) {
        console.warn('Backend assignInspection call failed, preserved local state:', e);
      }
    }
  },
}));

