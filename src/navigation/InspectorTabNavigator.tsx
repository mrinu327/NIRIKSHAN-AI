/**
 * InspectorTabNavigator
 * 5-tab bottom navigation for PMU / Field Inspection Officer.
 * Mobile-first touch targets and narrow screen optimization.
 * Tabs: Home | Assignments | Inspection | Alerts | Profile
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { InspectorTabParamList } from '../types/navigation';
import { InspectorHomeScreen } from '../screens/inspector/InspectorHomeScreen';
import { AssignmentsPlaceholderScreen } from '../screens/inspector/AssignmentsPlaceholderScreen';
import { InspectionPlaceholderScreen } from '../screens/inspector/InspectionPlaceholderScreen';
import { AlertsPlaceholderScreen } from '../screens/inspector/AlertsPlaceholderScreen';
import { ProfilePlaceholderScreen } from '../screens/inspector/ProfilePlaceholderScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const Tab = createBottomTabNavigator<InspectorTabParamList>();

export const InspectorTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={InspectorHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsPlaceholderScreen}
        options={{
          tabBarLabel: 'Assignments',
          tabBarBadge: 3,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Inspection"
        component={InspectionPlaceholderScreen}
        options={{
          tabBarLabel: 'Inspection',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'camera' : 'camera-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsPlaceholderScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePlaceholderScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.neutral.surface,
    borderTopColor: colors.neutral.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 62,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tabBarItem: {
    paddingVertical: 2,
    paddingHorizontal: 0,
    minHeight: 44,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    marginTop: 1,
  },
  badge: {
    backgroundColor: colors.brand.primary,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    lineHeight: 16,
  },
});
