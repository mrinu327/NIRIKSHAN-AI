/**
 * NgoTabNavigator
 * 5-tab bottom navigation for NGO / Institute Representative.
 * Mobile-first touch targets and narrow screen optimization.
 * Tabs: Home | Attendance | Status | Requests | Profile
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { NgoTabParamList } from '../types/navigation';
import { NgoHomeScreen } from '../screens/ngo/NgoHomeScreen';
import { AttendancePlaceholderScreen } from '../screens/ngo/AttendancePlaceholderScreen';
import { StatusPlaceholderScreen } from '../screens/ngo/StatusPlaceholderScreen';
import { RequestsPlaceholderScreen } from '../screens/ngo/RequestsPlaceholderScreen';
import { ProfilePlaceholderScreen } from '../screens/ngo/ProfilePlaceholderScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const Tab = createBottomTabNavigator<NgoTabParamList>();

export const NgoTabNavigator: React.FC = () => {
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
        component={NgoHomeScreen}
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
        name="Attendance"
        component={AttendancePlaceholderScreen}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Status"
        component={StatusPlaceholderScreen}
        options={{
          tabBarLabel: 'Status',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsPlaceholderScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarBadge: 1,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'mail' : 'mail-outline'}
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
              name={focused ? 'business' : 'business-outline'}
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
    backgroundColor: colors.status.warning,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    lineHeight: 16,
  },
});
