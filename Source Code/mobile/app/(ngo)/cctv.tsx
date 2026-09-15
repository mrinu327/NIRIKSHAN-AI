import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../src/constants/theme';
import { GovHeader, Card } from '../../src/components/common';

export default function NGOcctv() {
  const localCameras = [
    {
      id: 'cam-001',
      name: 'Main Entrance Gate',
      location: 'Perimeter Gate 1',
      status: 'ONLINE',
      heartbeat: 'Active (2s ago)',
    },
    {
      id: 'cam-002',
      name: 'Dining & Common Hall',
      location: 'Block A Ground Floor',
      status: 'ONLINE',
      heartbeat: 'Active (3s ago)',
    },
    {
      id: 'cam-003',
      name: 'Dormitory Corridor East',
      location: 'Block B First Floor',
      status: 'ONLINE',
      heartbeat: 'Active (5s ago)',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="FACILITY CCTV STATUS" subtitle="Registered IP Camera Streams" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📡 Mandatory CCTV Compliance</Text>
          <Text style={styles.infoBody}>
            As per DoSJE guidelines, all common areas and dining halls must maintain uninterrupted video telemetry during operational hours (08:00 - 20:00).
          </Text>
        </View>

        <Card title="Institute Cameras (3 Connected)" subtitle="Demo Welfare Institute - Coimbatore">
          {localCameras.map((cam) => (
            <View key={cam.id} style={styles.camRow}>
              <View style={styles.camLeft}>
                <Text style={styles.camName}>{cam.name}</Text>
                <Text style={styles.camLoc}>{cam.location}</Text>
                <Text style={styles.camHeartbeat}>Telemetry: {cam.heartbeat}</Text>
              </View>

              <View style={styles.onlineBadge}>
                <Text style={styles.onlineText}>{cam.status}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    padding: spacing.base,
    backgroundColor: colors.background,
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: spacing.base,
  },
  infoTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  infoBody: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  camRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  camLeft: {
    flex: 1,
  },
  camName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  camLoc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  camHeartbeat: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
  onlineBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  onlineText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
});
