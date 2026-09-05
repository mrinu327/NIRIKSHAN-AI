import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';

export default function InspectorOfflineQueue() {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const pendingItems = [
    {
      id: 'draft-001',
      title: 'Inspection Draft: Demo Welfare Institute',
      items: '3 Photos, 1 Audio Statement, Checklist Answers',
      size: '4.2 MB',
      time: 'Captured 25 mins ago',
    },
    {
      id: 'draft-002',
      title: 'GPS Geofence Proof: Coimbatore Site',
      items: 'EXIF Coordinates + SHA-256 Checksum',
      size: '128 KB',
      time: 'Captured 40 mins ago',
    },
  ];

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="OFFLINE QUEUE" subtitle="Local Draft Storage & Network Reconciliation" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Offline Status Alert */}
        <View style={styles.networkCard}>
          <View style={styles.networkTop}>
            <View style={styles.onlineDot} />
            <Text style={styles.networkStatus}>NETWORK RE-ESTABLISHED (4G ONLINE)</Text>
          </View>
          <Text style={styles.networkDesc}>
            Field inspection data stored securely in encrypted local storage. Ready to push to central DoSJE server.
          </Text>
        </View>

        {/* Sync Summary */}
        <Card
          title="Pending Sync Queue"
          subtitle={synced ? "All items synchronized" : `${pendingItems.length} items awaiting upload`}
        >
          {!synced ? (
            <>
              {pendingItems.map((item) => (
                <View key={item.id} style={styles.queueItem}>
                  <View style={styles.queueTop}>
                    <Text style={styles.queueTitle}>{item.title}</Text>
                    <Text style={styles.queueSize}>{item.size}</Text>
                  </View>
                  <Text style={styles.queueItems}>{item.items}</Text>
                  <Text style={styles.queueTime}>⏱️ {item.time}</Text>
                </View>
              ))}

              <Button
                title={syncing ? "Synchronizing with Server..." : "Sync All Items Now ➔"}
                loading={syncing}
                onPress={handleSync}
                style={styles.syncBtn}
              />
            </>
          ) : (
            <View style={styles.syncedBox}>
              <Text style={styles.syncedIcon}>✓</Text>
              <Text style={styles.syncedTitle}>Synced Successfully</Text>
              <Text style={styles.syncedDesc}>
                All field evidence and checklists have been uploaded and recorded in the audit trail.
              </Text>
            </View>
          )}
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
  networkCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  networkTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  networkStatus: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  networkDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  queueItem: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  queueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  queueSize: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textLight,
  },
  queueItems: {
    fontSize: 11,
    color: colors.secondary,
    marginTop: 2,
  },
  queueTime: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
  },
  syncBtn: {
    marginTop: spacing.sm,
  },
  syncedBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  syncedIcon: {
    fontSize: 32,
    color: colors.success,
    fontWeight: 'bold',
  },
  syncedTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.success,
    marginTop: 6,
  },
  syncedDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
});
