/**
 * OfficialTabNavigator
 * 5-tab bottom navigation for MoSJE / Government Official.
 * Mobile-first touch targets and narrow screen optimization.
 * Tabs: Dashboard | Monitoring | Alerts | Inspections | More
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { OfficialTabParamList } from '../types/navigation';
import { OfficialHomeScreen } from '../screens/official/OfficialHomeScreen';
import { MonitoringPlaceholderScreen } from '../screens/official/MonitoringPlaceholderScreen';
import { AlertsPlaceholderScreen } from '../screens/official/AlertsPlaceholderScreen';
import { InspectionsPlaceholderScreen } from '../screens/official/InspectionsPlaceholderScreen';
import { MorePlaceholderScreen } from '../screens/official/MorePlaceholderScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const Tab = createBottomTabNavigator<OfficialTabParamList>();

export const OfficialTabNavigator: React.FC = () => {
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
        name="Dashboard"
        component={OfficialHomeScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Monitoring"
        component={MonitoringPlaceholderScreen}
        options={{
          tabBarLabel: 'Monitoring',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'videocam' : 'videocam-outline'}
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
          tabBarBadge: 6,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'warning' : 'warning-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Inspections"
        component={InspectionsPlaceholderScreen}
        options={{
          tabBarLabel: 'Inspections',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'clipboard' : 'clipboard-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MorePlaceholderScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline'}
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
    height: Platform.OS === 'ios' ? 84 : 60,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 24 : 6,
  },
  tabBarItem: {
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    marginTop: 1,
  },
  badge: {
    backgroundColor: colors.status.highPriority,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    lineHeight: 16,
  },
});
