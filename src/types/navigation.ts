/**
 * Navigation Type Definitions
 * SIH26095 | MoSJE
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { UserRole } from './role';

export type RootStackParamList = {
  RoleSelection: undefined;
  OfficialApp: undefined;
  InspectorApp: undefined;
  NgoApp: undefined;
};

// MoSJE Official Tab Parameter List
export type OfficialTabParamList = {
  Dashboard: undefined;
  Monitoring: undefined;
  Alerts: undefined;
  Inspections: undefined;
  More: undefined;
};

// MoSJE Official Stack Parameter List (Phase 2A drill-down workflow)
export type OfficialStackParamList = {
  OfficialTabs: { screen?: keyof OfficialTabParamList } | undefined;
  ProjectDetails: { projectId: string };
  AlertReview: { alertId: string };
  InitiateInspection: { projectId: string; alertId?: string };
  AttendanceAnalytics: { projectId: string };
  AnomalyDetail: { projectId: string; assessmentId?: string };
};

// Type-safe navigation props for Official workflow
export type OfficialStackNavigationProp = NativeStackNavigationProp<OfficialStackParamList>;
export type OfficialTabNavigationProp<T extends keyof OfficialTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<OfficialTabParamList, T>,
  NativeStackNavigationProp<OfficialStackParamList>
>;

// PMU Inspector Tab Parameter List
export type InspectorTabParamList = {
  Home: undefined;
  Assignments: undefined;
  Inspection: undefined;
  Alerts: undefined;
  Profile: undefined;
};

// PMU Inspector Stack Parameter List (Phase 3 inspection workflow)
export type InspectorStackParamList = {
  InspectorTabs: { screen?: keyof InspectorTabParamList } | undefined;
  InspectionOverview: { inspectionId: string };
  InspectionChecklist: { inspectionId: string };
  InspectionFindings: { inspectionId: string };
  InspectionReview: { inspectionId: string };
  InspectionConfirmation: { inspectionId: string };
};

// Type-safe navigation props for Inspector workflow
export type InspectorStackNavigationProp = NativeStackNavigationProp<InspectorStackParamList>;
export type InspectorTabNavigationProp<T extends keyof InspectorTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<InspectorTabParamList, T>,
  NativeStackNavigationProp<InspectorStackParamList>
>;

// NGO Institute Tab Parameter List
export type NgoTabParamList = {
  Home: undefined;
  Attendance: undefined;
  Status: undefined;
  Requests: undefined;
  Profile: undefined;
};
