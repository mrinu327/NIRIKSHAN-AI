/**
 * OfficialStackNavigator
 * SIH26095 | MoSJE Government Official Monitoring Workflow
 *
 * Encapsulates the 5-tab OfficialTabNavigator and provides push navigation
 * for drill-down screens: ProjectDetails, AlertReview, and InitiateInspection.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OfficialStackParamList } from '../types/navigation';
import { OfficialTabNavigator } from './OfficialTabNavigator';
import { ProjectDetailsScreen } from '../screens/official/ProjectDetailsScreen';
import { AlertReviewScreen } from '../screens/official/AlertReviewScreen';
import { InitiateInspectionScreen } from '../screens/official/InitiateInspectionScreen';
import { AttendanceAnalyticsScreen } from '../screens/official/AttendanceAnalyticsScreen';
import { AnomalyDetailScreen } from '../screens/official/AnomalyDetailScreen';
import { DivisionExplorerScreen } from '../screens/official/DivisionExplorerScreen';
import { DivisionDetailsScreen } from '../screens/official/DivisionDetailsScreen';
import { SchemeExplorerScreen } from '../screens/official/SchemeExplorerScreen';
import { SchemeDetailsScreen } from '../screens/official/SchemeDetailsScreen';
import { OrganizationExplorerScreen } from '../screens/official/OrganizationExplorerScreen';
import { OrganizationDetailsScreen } from '../screens/official/OrganizationDetailsScreen';
import { ProjectExplorerScreen } from '../screens/official/ProjectExplorerScreen';
import { AnomalyExplorerScreen } from '../screens/official/AnomalyExplorerScreen';
import { AnomalyDetailsScreen } from '../screens/official/AnomalyDetailsScreen';

const Stack = createNativeStackNavigator<OfficialStackParamList>();

export const OfficialStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OfficialTabs" component={OfficialTabNavigator} />
      <Stack.Screen name="ProjectExplorer" component={ProjectExplorerScreen} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Stack.Screen name="AlertReview" component={AlertReviewScreen} />
      <Stack.Screen name="InitiateInspection" component={InitiateInspectionScreen} />
      <Stack.Screen name="AttendanceAnalytics" component={AttendanceAnalyticsScreen} />
      <Stack.Screen name="AnomalyDetail" component={AnomalyDetailScreen} />
      <Stack.Screen name="AnomalyExplorer" component={AnomalyExplorerScreen} />
      <Stack.Screen name="AnomalyDetails" component={AnomalyDetailsScreen} />
      <Stack.Screen name="DivisionExplorer" component={DivisionExplorerScreen} />
      <Stack.Screen name="DivisionDetails" component={DivisionDetailsScreen} />
      <Stack.Screen name="SchemeExplorer" component={SchemeExplorerScreen} />
      <Stack.Screen name="SchemeDetails" component={SchemeDetailsScreen} />
      <Stack.Screen name="OrganizationExplorer" component={OrganizationExplorerScreen} />
      <Stack.Screen name="OrganizationDetails" component={OrganizationDetailsScreen} />
    </Stack.Navigator>
  );
};

