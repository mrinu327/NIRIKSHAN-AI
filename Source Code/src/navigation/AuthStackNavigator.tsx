/**
 * AuthStackNavigator
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Implements the unauthenticated Two-Screen Authentication Flow:
 * - Screen 1: StakeholderSelection (Selection cards without credentials)
 * - Screen 2: StakeholderLogin (Dynamic stakeholder login page with Back button)
 *   Also provides route aliases: OfficialLogin, InspectorLogin, NgoLogin
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { StakeholderSelectionScreen } from '../screens/auth/LoginScreen';
import { StakeholderLoginScreen } from '../screens/auth/StakeholderLoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const OfficialLoginRoute: React.FC = () => <StakeholderLoginScreen role="official" />;
const InspectorLoginRoute: React.FC = () => <StakeholderLoginScreen role="inspector" />;
const NgoLoginRoute: React.FC = () => <StakeholderLoginScreen role="ngo" />;

export const AuthStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="StakeholderSelection"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="StakeholderSelection" component={StakeholderSelectionScreen} />
      <Stack.Screen name="StakeholderLogin" component={StakeholderLoginScreen} />
      <Stack.Screen name="OfficialLogin" component={OfficialLoginRoute} />
      <Stack.Screen name="InspectorLogin" component={InspectorLoginRoute} />
      <Stack.Screen name="NgoLogin" component={NgoLoginRoute} />
    </Stack.Navigator>
  );
};
