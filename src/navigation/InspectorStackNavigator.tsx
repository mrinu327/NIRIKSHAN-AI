/**
 * InspectorStackNavigator
 * SIH26095 | MoSJE PMU Inspector Field Workflow
 *
 * Encapsulates the 5-tab InspectorTabNavigator and provides push navigation
 * for the end-to-end Phase 3 field inspection workflow:
 * Overview -> Checklist -> Findings & Evidence -> Review -> Confirmation.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InspectorStackParamList } from '../types/navigation';
import { InspectorTabNavigator } from './InspectorTabNavigator';
import { InspectionOverviewScreen } from '../screens/inspector/InspectionOverviewScreen';
import { InspectionChecklistScreen } from '../screens/inspector/InspectionChecklistScreen';
import { InspectionFindingsScreen } from '../screens/inspector/InspectionFindingsScreen';
import { InspectionReviewScreen } from '../screens/inspector/InspectionReviewScreen';
import { InspectionConfirmationScreen } from '../screens/inspector/InspectionConfirmationScreen';
import { InspectionHistoryScreen } from '../screens/inspector/InspectionHistoryScreen';

const Stack = createNativeStackNavigator<InspectorStackParamList>();

export const InspectorStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="InspectorTabs" component={InspectorTabNavigator} />
      <Stack.Screen name="InspectionOverview" component={InspectionOverviewScreen} />
      <Stack.Screen name="InspectionChecklist" component={InspectionChecklistScreen} />
      <Stack.Screen name="InspectionFindings" component={InspectionFindingsScreen} />
      <Stack.Screen name="InspectionReview" component={InspectionReviewScreen} />
      <Stack.Screen name="InspectionConfirmation" component={InspectionConfirmationScreen} />
      <Stack.Screen name="InspectionHistory" component={InspectionHistoryScreen} />
    </Stack.Navigator>
  );
};
