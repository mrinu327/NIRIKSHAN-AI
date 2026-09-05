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
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Stack.Screen name="AlertReview" component={AlertReviewScreen} />
      <Stack.Screen name="InitiateInspection" component={InitiateInspectionScreen} />
    </Stack.Navigator>
  );
};
