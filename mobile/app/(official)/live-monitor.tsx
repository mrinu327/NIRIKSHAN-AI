import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card } from '../../src/components/common';

export default function OfficialLiveMonitor() {
  const cameras = [
    {
      id: 'cam-001',
      name: 'Entrance Gate 1',
      project: 'Demo Welfare Institute - Coimbatore',
      status: 'ONLINE',
      quality: '1080p / 25fps',
      people: 8,
      lastHeartbeat: 'Just now',
    },
    {
      id: 'cam-002',
      name: 'Dining & Common Hall',
      project: 'Demo Welfare Institute - Coimbatore',
      status: 'ONLINE',
      quality: '1080p / 25fps',
      people: 42,
      lastHeartbeat: 'Just now',
    },
    {
      id: 'cam-004',
      name: 'Ward 2 Rehabilitation Hall',
      project: 'Demo De-addiction Kendra - Ludhiana',
      status: 'OFFLINE',
      quality: 'No Signal',
      people: 0,
      lastHeartbeat: '4 hours ago',
    },
    {
      id: 'cam-007',
      name: 'Consultation & Clinic Room',
      project: 'Demo Rehabilitation Centre - Lucknow',
      status: 'DELAYED',
      quality: '480p / 10fps',
      people: 4,
      lastHeartbeat: '15 mins ago',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="LIVE CCTV MONITOR" subtitle="Real-time Stream Telemetry & Computer Vision" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topInfoCard}>
          <Text style={styles.topInfoTitle}>📹 Camera Network Telemetry</Text>
          <Text style={styles.topInfoDesc}>
            Automated computer vision monitors stream heartbeats and provides people-count approximations for attendance verification.
          </Text>
        </View>

        {cameras.map((c) => {
          const isOnline = c.status === 'ONLINE';
          const isOffline = c.status === 'OFFLINE';
          return (
            <Card key={c.id} style={styles.cameraCard}>
              <View style={styles.feedPlaceholder}>
                <Text style={styles.feedIcon}>{isOnline ? '🎥' : '⚠️'}</Text>
                <Text style={styles.feedText}>
                  {isOnline ? 'SIMULATED LIVE FEED (DEMO)' : 'FEED DISCONNECTED'}
                </Text>

                {isOnline && (
                  <View style={styles.peopleOverlay}>
                    <Text style={styles.peopleText}>👥 CV Count: ~{c.people}</Text>
                  </View>
                )}

                <View
                  style={[
                    styles.statusChip,
                    isOnline
                      ? styles.statusOnline
                      : isOffline
                      ? styles.statusOffline
                      : styles.statusDelayed,
                  ]}
                >
                  <Text style={styles.statusChipText}>{c.status}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.cameraName}>{c.name}</Text>
                <Text style={styles.cameraProject}>{c.project}</Text>
                <View style={styles.cameraMeta}>
                  <Text style={styles.metaItem}>Quality: {c.quality}</Text>
                  <Text style={styles.metaItem}>Heartbeat: {c.lastHeartbeat}</Text>
                </View>
              </View>
            </Card>
          );
        })}
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
  topInfoCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  topInfoTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  topInfoDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
  },
  cameraCard: {
    padding: 0,
    overflow: 'hidden',
  },
  feedPlaceholder: {
    height: 160,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  feedIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  feedText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  peopleOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  peopleText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  statusChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusOnline: {
    backgroundColor: colors.success,
  },
  statusOffline: {
    backgroundColor: colors.danger,
  },
  statusDelayed: {
    backgroundColor: colors.warning,
  },
  statusChipText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBottom: {
    padding: spacing.md,
  },
  cameraName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  cameraProject: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  cameraMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  metaItem: {
    fontSize: 11,
    color: colors.textLight,
  },
});
