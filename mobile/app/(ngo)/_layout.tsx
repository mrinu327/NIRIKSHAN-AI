import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/constants/theme';

export default function NGOLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6B21A8',
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
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="verification"
        options={{
          title: 'Verification',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📹</Text>,
        }}
      />
      <Tabs.Screen
        name="cctv"
        options={{
          title: 'CCTV Status',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📡</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏢</Text>,
        }}
      />
    </Tabs>
  );
}
