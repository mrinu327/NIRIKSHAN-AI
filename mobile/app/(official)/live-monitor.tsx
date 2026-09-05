import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../src/constants/theme';
import { GovHeader, Card } from '../../src/components/common';
import { api } from '../../src/services/api';
import { Camera, CameraStatus } from '@nirikshan/shared-types';

function formatHeartbeat(dateOrStr: string | Date | undefined) {
  if (!dateOrStr) return 'Active (Just now)';
  try {
    const diffMs = Date.now() - new Date(dateOrStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Active (Just now)';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  } catch {
    return 'Active';
  }
}

export default function OfficialLiveMonitor() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [selectedCam, setSelectedCam] = useState<string | null>(null);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const data = await api.getCameras();
      setCameras(data);
    } catch (e) {
      console.warn('Failed to load CCTV camera feeds:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCameras();
  };

  const handleRefreshCamera = async (cameraId: string) => {
    try {
      setSelectedCam(cameraId);
      const [health, people] = await Promise.all([
        api.getCameraHealth(cameraId),
        api.getCameraPeopleCount(cameraId),
      ]);

      setCameras((prev) =>
        prev.map((c) =>
          c.id === cameraId
            ? {
                ...c,
                status: health.status,
                lastHeartbeat: health.lastHeartbeat,
                peopleCount: people.count,
              }
            : c
        )
      );
    } catch (e) {
      console.warn(`Failed to refresh telemetry for ${cameraId}:`, e);
    } finally {
      setSelectedCam(null);
    }
  };

  const filteredCameras = cameras.filter((c) => {
    if (filter === 'ALL') return true;
    if (filter === 'ONLINE') return c.status === CameraStatus.ONLINE;
    if (filter === 'OFFLINE') return c.status === CameraStatus.OFFLINE;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="LIVE CCTV MONITOR" subtitle="Real-time Stream Telemetry & Computer Vision" />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.topInfoCard}>
          <Text style={styles.topInfoTitle}>📹 Camera Network Telemetry</Text>
          <Text style={styles.topInfoDesc}>
            Automated computer vision monitors stream heartbeats and provides people-count approximations for attendance verification.
          </Text>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['ALL', 'ONLINE', 'OFFLINE'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, filter === s && styles.filterChipActive]}
              onPress={() => setFilter(s)}
            >
              <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
                {s} ({s === 'ALL' ? cameras.length : cameras.filter((c) => c.status === s).length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.centerText}>Connecting to CCTV Telemetry Streams...</Text>
          </View>
        ) : filteredCameras.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerText}>No cameras found for filter: {filter}</Text>
          </View>
        ) : (
          filteredCameras.map((c) => {
            const isOnline = c.status === CameraStatus.ONLINE;
            const isOffline = c.status === CameraStatus.OFFLINE;
            const projectName =
              (c as any).project?.name || 'Registered Scheme Institute';
            const isUpdating = selectedCam === c.id;

            return (
              <Card key={c.id} style={styles.cameraCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleRefreshCamera(c.id)}
                >
                  <View style={styles.feedPlaceholder}>
                    <Text style={styles.feedIcon}>{isOnline ? '🎥' : '⚠️'}</Text>
                    <Text style={styles.feedText}>
                      {isOnline ? 'SIMULATED LIVE FEED (DEMO)' : 'FEED DISCONNECTED'}
                    </Text>

                    {isOnline && (
                      <View style={styles.peopleOverlay}>
                        <Text style={styles.peopleText}>👥 CV Count: ~{c.peopleCount}</Text>
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

                    {isUpdating && (
                      <View style={styles.updatingOverlay}>
                        <ActivityIndicator size="small" color={colors.white} />
                        <Text style={styles.updatingText}>Syncing Telemetry...</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cameraName}>{c.name}</Text>
                      <Text style={styles.tapHint}>Tap to ping ⟳</Text>
                    </View>
                    <Text style={styles.cameraProject}>{projectName}</Text>
                    <Text style={styles.cameraLocation}>📍 {c.location || 'Facility Zone'}</Text>
                    <View style={styles.cameraMeta}>
                      <Text style={styles.metaItem}>Quality: {c.streamQuality || '1080p / 25fps'}</Text>
                      <Text style={styles.metaItem}>Heartbeat: {formatHeartbeat(c.lastHeartbeat)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            );
          })
        )}
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
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tapHint: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '600',
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
  cameraLocation: {
    fontSize: 11,
    color: colors.textMuted,
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  centerBox: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  updatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatingText: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
});
