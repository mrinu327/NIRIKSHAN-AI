import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';

export default function InspectorMap() {
  const [demoInsideGeofence, setDemoInsideGeofence] = useState(true);

  const distanceMeters = demoInsideGeofence ? 43 : 340;
  const isVerified = distanceMeters <= 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="GPS & GEOFENCE" subtitle="Inspection Site Location Verification" />

      <View style={styles.container}>
        {/* Map Visualization Preview */}
        <View style={styles.mapCanvas}>
          <View style={styles.geofenceCircle}>
            <View style={styles.geofenceInner}>
              <Text style={styles.ngoPin}>🏢</Text>
              <Text style={styles.ngoPinText}>Demo Welfare Institute</Text>
            </View>
          </View>

          {/* Inspector Current GPS Pin */}
          <View
            style={[
              styles.inspectorPin,
              demoInsideGeofence ? styles.pinInside : styles.pinOutside,
            ]}
          >
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.pinLabel}>You ({distanceMeters}m)</Text>
          </View>

          {/* Geofence HUD */}
          <View style={styles.hudBadge}>
            <Text style={styles.hudText}>Geofence Radius: 100 Meters</Text>
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
              <Text style={styles.indicatorText}>
                {isVerified ? '✓ LOCATION VERIFIED' : '⚠ OUTSIDE GEOFENCE'}
              </Text>
            </View>
            <Text style={styles.distanceValue}>{distanceMeters} meters away</Text>
          </View>

          <Text style={styles.gpsCoords}>
            Current GPS: 11.0268° N, 76.9952° E (Accuracy: ±3.2m)
          </Text>
          <Text style={styles.siteCoords}>
            Registered Site: 11.0267° N, 76.9953° E
          </Text>

          {/* Demo Location Switcher Toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Demo GPS Simulator:</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                demoInsideGeofence ? styles.btnInside : styles.btnOutside,
              ]}
              onPress={() => setDemoInsideGeofence(!demoInsideGeofence)}
            >
              <Text style={styles.toggleBtnText}>
                {demoInsideGeofence ? 'Simulate Inside (43m)' : 'Simulate Outside (340m)'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={isVerified ? "Proceed to Inspection Checklist ➔" : "Cannot Start (Must Be Within 100m)"}
            disabled={!isVerified}
            variant={isVerified ? "primary" : "secondary"}
            onPress={() => {}}
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
    bottom: '15%',
    right: '15%',
  },
  pinIcon: {
    fontSize: 28,
  },
  pinLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
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
    color: colors.text,
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
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  btnInside: {
    backgroundColor: '#E0F2FE',
  },
  btnOutside: {
    backgroundColor: '#FEF3C7',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  proceedBtn: {
    marginTop: spacing.sm,
  },
});
