import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';
import { useInspectionStore } from '../../src/store/useInspectionStore';

export default function InspectorMap() {
  const router = useRouter();
  const {
    activeInspectionId,
    projectName,
    targetLatitude,
    targetLongitude,
    updateLocation,
  } = useInspectionStore();

  const [mode, setMode] = useState<'SIMULATOR' | 'DEVICE'>('SIMULATOR');
  const [simInside, setSimInside] = useState(true);
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Haversine distance calculator
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // Request device GPS
  const requestDeviceLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        const loc = await Location.getCurrentPositionAsync({});
        setDeviceCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        setMode('DEVICE');
      } else {
        setPermissionGranted(false);
        setMode('SIMULATOR');
      }
    } catch (e) {
      console.warn('Device location unavailable on this platform:', e);
      setPermissionGranted(false);
      setMode('SIMULATOR');
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestDeviceLocation();
    }
  }, []);

  // Compute active GPS & distance based on mode
  let currentLat = simInside ? targetLatitude + 0.0001 : targetLatitude + 0.003;
  let currentLon = simInside ? targetLongitude - 0.0001 : targetLongitude + 0.002;

  if (mode === 'DEVICE' && deviceCoords) {
    currentLat = deviceCoords.lat;
    currentLon = deviceCoords.lon;
  }

  const distanceMeters =
    mode === 'SIMULATOR'
      ? simInside
        ? 43
        : 340
      : calculateDistance(currentLat, currentLon, targetLatitude, targetLongitude);

  const radiusMeters = 100; // Strict 100m geofence
  const isVerified = distanceMeters <= radiusMeters;

  useEffect(() => {
    updateLocation(currentLat, currentLon, isVerified, distanceMeters);
  }, [currentLat, currentLon, isVerified, distanceMeters]);

  const handleProceed = () => {
    if (!isVerified) return;
    router.push({
      pathname: '/(inspector)/inspect',
      params: { inspectionId: activeInspectionId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="GPS & GEOFENCE" subtitle="Strict 100m Inspection Site Verification" />

      <View style={styles.container}>
        {/* Map Visualization Preview */}
        <View style={styles.mapCanvas}>
          <View style={styles.geofenceCircle}>
            <View style={styles.geofenceInner}>
              <Text style={styles.ngoPin}>🏢</Text>
              <Text style={styles.ngoPinText} numberOfLines={1}>
                {projectName}
              </Text>
            </View>
          </View>

          {/* Inspector Current GPS Pin */}
          <View
            style={[
              styles.inspectorPin,
              isVerified ? styles.pinInside : styles.pinOutside,
            ]}
          >
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.pinLabel}>You ({distanceMeters}m)</Text>
          </View>

          {/* Geofence HUD */}
          <View style={styles.hudBadge}>
            <Text style={styles.hudText}>Geofence Radius: 100 Meters</Text>
          </View>

          {/* Mode Pill */}
          <View style={styles.modePill}>
            <Text style={styles.modePillText}>
              {mode === 'DEVICE' ? '🛰️ DEVICE GPS' : '🧪 DEMO GPS SIMULATOR'}
            </Text>
          </View>
        </View>

        {/* Verification Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIndicator,
                isVerified ? styles.statusGreen : styles.statusRed,
              ]}
            >
              <Text
                style={[
                  styles.indicatorText,
                  isVerified ? styles.indicatorTextGreen : styles.indicatorTextRed,
                ]}
              >
                {isVerified ? '✓ LOCATION VERIFIED' : '⚠ OUTSIDE GEOFENCE'}
              </Text>
            </View>
            <Text style={styles.distanceValue}>{distanceMeters} meters away</Text>
          </View>

          <Text style={styles.gpsCoords}>
            Current GPS: {currentLat.toFixed(4)}° N, {currentLon.toFixed(4)}° E (Accuracy: ±3.2m)
          </Text>
          <Text style={styles.siteCoords}>
            Registered Site: {targetLatitude.toFixed(4)}° N, {targetLongitude.toFixed(4)}° E
          </Text>

          {/* Demo Location Switcher Toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Demo GPS Simulator:</Text>
            <View style={styles.toggleBtnGroup}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.toggleBtn,
                  simInside && mode === 'SIMULATOR' ? styles.btnInsideActive : styles.btnInactive,
                ]}
                onPress={() => {
                  setMode('SIMULATOR');
                  setSimInside(true);
                }}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    simInside && mode === 'SIMULATOR' && styles.toggleBtnTextActive,
                  ]}
                >
                  Inside (43m)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.toggleBtn,
                  !simInside && mode === 'SIMULATOR' ? styles.btnOutsideActive : styles.btnInactive,
                ]}
                onPress={() => {
                  setMode('SIMULATOR');
                  setSimInside(false);
                }}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    !simInside && mode === 'SIMULATOR' && styles.toggleBtnTextActive,
                  ]}
                >
                  Outside (340m)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title={
              isVerified
                ? "Proceed to Inspection Checklist ➔"
                : "Cannot Start (Must Be Within 100m)"
            }
            disabled={!isVerified}
            variant={isVerified ? "primary" : "secondary"}
            onPress={handleProceed}
            style={styles.proceedBtn}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    padding: spacing.base,
    backgroundColor: colors.background,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  geofenceCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(30, 111, 140, 0.15)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  geofenceInner: {
    alignItems: 'center',
    maxWidth: 160,
  },
  ngoPin: {
    fontSize: 28,
  },
  ngoPinText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 2,
    textAlign: 'center',
  },
  inspectorPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinInside: {
    bottom: '48%',
    right: '42%',
  },
  pinOutside: {
    bottom: '12%',
    right: '12%',
  },
  pinIcon: {
    fontSize: 28,
  },
  pinLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  hudBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  hudText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  modePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  statusCard: {
    marginTop: spacing.base,
    marginBottom: 0,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusGreen: {
    backgroundColor: '#DCFCE7',
  },
  statusRed: {
    backgroundColor: '#FEE2E2',
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '800',
  },
  indicatorTextGreen: {
    color: colors.success,
  },
  indicatorTextRed: {
    color: colors.danger,
  },
  distanceValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  gpsCoords: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  siteCoords: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  toggleBtnGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnInsideActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  btnOutsideActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  btnInactive: {
    backgroundColor: colors.background,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  toggleBtnTextActive: {
    color: colors.white,
  },
  proceedBtn: {
    marginTop: spacing.sm,
  },
});
