import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/constants/theme';

export default function InspectorLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="inspect"
        options={{
          title: 'Inspect',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📍</Text>,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📑</Text>,
        }}
      />
      <Tabs.Screen
        name="offline-queue"
        options={{
          title: 'Sync',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
