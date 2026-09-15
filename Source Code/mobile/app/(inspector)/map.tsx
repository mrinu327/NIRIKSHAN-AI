import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useInspectionStore } from '../../src/store/useInspectionStore';

export default function InspectorMap() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    activeInspectionId,
    projectName,
    projectAddress,
    targetLatitude,
    targetLongitude,
    isLocationVerified,
    distanceMeters,
    isBiometricVerified,
    biometricType,
    updateLocation,
    setBiometricVerification,
    addTimelineEvent,
  } = useInspectionStore();

  const [mode, setMode] = useState<'SIMULATOR' | 'DEVICE'>('SIMULATOR');
  const [simInside, setSimInside] = useState(true);
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Workflow Step: 'GEOFENCE' -> 'BIOMETRIC' -> 'AUTHORIZED'
  const [workflowStep, setWorkflowStep] = useState<'GEOFENCE' | 'BIOMETRIC' | 'AUTHORIZED'>('GEOFENCE');

  // Biometric Mode & State
  const [selectedBioMethod, setSelectedBioMethod] = useState<'FINGERPRINT' | 'FACIAL'>('FINGERPRINT');
  const [bioState, setBioState] = useState<'IDLE' | 'SCANNING' | 'VERIFIED' | 'FAILED'>('IDLE');

  // Scanning animation values
  const scanAnim = useRef(new Animated.Value(0)).current;

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
    setIsVerifying(true);
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
    } finally {
      setIsVerifying(false);
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

  const calculatedDist =
    mode === 'SIMULATOR'
      ? simInside
        ? 18
        : 340
      : calculateDistance(currentLat, currentLon, targetLatitude, targetLongitude);

  const radiusMeters = 100; // Strict 100m geofence
  const verified = calculatedDist <= radiusMeters;

  useEffect(() => {
    updateLocation(currentLat, currentLon, verified, calculatedDist);
  }, [currentLat, currentLon, verified, calculatedDist]);

  const handleRetryLocation = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 600);
  };

  // Biometric Scan Trigger
  const handleTriggerBiometricScan = () => {
    setBioState('SCANNING');
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(() => {
      setBioState('VERIFIED');
      setBiometricVerification(selectedBioMethod, true);
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
      setWorkflowStep('AUTHORIZED');
    }, 1800);
  };

  const handleTriggerBiometricFail = () => {
    setBioState('SCANNING');
    setTimeout(() => {
      setBioState('FAILED');
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
    }, 1200);
  };

  const handleStartInspection = () => {
    if (!verified || !isBiometricVerified) return;

    addTimelineEvent(
      '🚀',
      'Field Inspection Started',
      `Inspection begun by ${user?.name || 'Inspector'} following geo-biometric verification.`,
      'GEOFENCE'
    );

    router.push({
      pathname: '/(inspector)/inspect',
      params: { inspectionId: activeInspectionId },
    });
  };

  // Geofence status label
  const getStatusBadge = () => {
    if (isVerifying) {
      return {
        label: '🟡 VERIFYING LOCATION',
        bg: '#FEF3C7',
        textColor: '#92400E',
      };
    }
    if (mode === 'DEVICE' && permissionGranted === false) {
      return {
        label: '⚪ LOCATION UNAVAILABLE',
        bg: '#F1F5F9',
        textColor: '#64748B',
      };
    }
    if (verified) {
      return {
        label: '🟢 LOCATION VERIFIED',
        bg: '#DCFCE7',
        textColor: '#166534',
      };
    }
    return {
      label: '🔴 OUTSIDE GEOFENCE',
      bg: '#FEE2E2',
      textColor: '#991B1B',
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader
        title="GEOFENCE & BIOMETRICS"
        subtitle="Step 1 & 2: Mandatory Identity & Site Authorization"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Step Indicator Header */}
        <View style={styles.stepperContainer}>
          <View
            style={[
              styles.stepBubble,
              workflowStep === 'GEOFENCE' && styles.stepBubbleActive,
              workflowStep !== 'GEOFENCE' && styles.stepBubbleCompleted,
            ]}
          >
            <Text style={styles.stepBubbleText}>
              {workflowStep !== 'GEOFENCE' ? '✓' : '1'}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              workflowStep === 'GEOFENCE' && styles.stepLabelActive,
            ]}
          >
            Geofence
          </Text>

          <View style={styles.stepConnector} />

          <View
            style={[
              styles.stepBubble,
              workflowStep === 'BIOMETRIC' && styles.stepBubbleActive,
              workflowStep === 'AUTHORIZED' && styles.stepBubbleCompleted,
            ]}
          >
            <Text style={styles.stepBubbleText}>
              {workflowStep === 'AUTHORIZED' ? '✓' : '2'}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              workflowStep === 'BIOMETRIC' && styles.stepLabelActive,
            ]}
          >
            Biometric
          </Text>

          <View style={styles.stepConnector} />

          <View
            style={[
              styles.stepBubble,
              workflowStep === 'AUTHORIZED' && styles.stepBubbleActive,
            ]}
          >
            <Text style={styles.stepBubbleText}>3</Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              workflowStep === 'AUTHORIZED' && styles.stepLabelActive,
            ]}
          >
            Authorized
          </Text>
        </View>

        {/* STEP 1: GEOFENCE VERIFICATION */}
        {workflowStep === 'GEOFENCE' && (
          <View>
            {/* Interactive Radar Visualizer */}
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
                  verified ? styles.pinInside : styles.pinOutside,
                ]}
              >
                <Text style={styles.pinIcon}>📍</Text>
                <Text style={styles.pinLabel}>You ({distanceMeters}m)</Text>
              </View>

              {/* Geofence HUD */}
              <View style={styles.hudBadge}>
                <Text style={styles.hudText}>Authorized Radius: 100m</Text>
              </View>

              {/* Mode Pill */}
              <View style={styles.modePill}>
                <Text style={styles.modePillText}>
                  {mode === 'DEVICE' ? '🛰️ DEVICE GPS' : '🧪 REALISTIC SIMULATOR'}
                </Text>
              </View>
            </View>

            {/* Location Verification Status Card */}
            <Card style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusIndicator, { backgroundColor: statusBadge.bg }]}>
                  <Text style={[styles.indicatorText, { color: statusBadge.textColor }]}>
                    {statusBadge.label}
                  </Text>
                </View>
                <Text style={styles.distanceValue}>{distanceMeters} metres</Text>
              </View>

              <Text style={styles.locationProjectName}>{projectName}</Text>
              <Text style={styles.locationAddress}>📍 {projectAddress}</Text>

              <View style={styles.coordsGrid}>
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Distance to Project</Text>
                  <Text style={styles.coordVal}>{distanceMeters} metres</Text>
                </View>
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Authorized Geofence</Text>
                  <Text style={styles.coordVal}>100 metres radius</Text>
                </View>
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Inspector Current Lat</Text>
                  <Text style={styles.coordVal}>{currentLat.toFixed(5)}° N</Text>
                </View>
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Inspector Current Lon</Text>
                  <Text style={styles.coordVal}>{currentLon.toFixed(5)}° E</Text>
                </View>
              </View>

              {/* Outside Warning If Applicable */}
              {!verified && (
                <View style={styles.outsideWarningBox}>
                  <Text style={styles.outsideWarningTitle}>🔴 OUTSIDE AUTHORIZED AREA</Text>
                  <Text style={styles.outsideWarningText}>
                    You are currently {distanceMeters} metres away from the project perimeter.
                    You must move inside the 100m geofence to start the inspection.
                  </Text>
                  <TouchableOpacity
                    style={styles.retryLocationBtn}
                    onPress={handleRetryLocation}
                  >
                    <Text style={styles.retryLocationBtnText}>RETRY LOCATION 🔄</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Realistic Simulator Switcher */}
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Simulator Location Control:</Text>
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
                      Inside (18m)
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

              {/* Action Button: Disabled if Outside Geofence */}
              <Button
                title={
                  verified
                    ? "CONTINUE TO BIOMETRIC VERIFICATION ➔"
                    : "START INSPECTION DISABLED (Must Be Inside Geofence)"
                }
                disabled={!verified}
                variant={verified ? "primary" : "secondary"}
                onPress={() => setWorkflowStep('BIOMETRIC')}
                style={styles.proceedBtn}
              />
            </Card>
          </View>
        )}

        {/* STEP 2: BIOMETRIC VERIFICATION */}
        {workflowStep === 'BIOMETRIC' && (
          <View>
            <Card style={styles.biometricCard}>
              <Text style={styles.biometricHeaderTitle}>INSPECTOR VERIFICATION</Text>
              <Text style={styles.biometricHeaderSub}>
                Authenticate official PMU biometric credentials prior to field assessment
              </Text>

              {/* Biometric Method Selector */}
              <View style={styles.bioMethodTabs}>
                <TouchableOpacity
                  style={[
                    styles.bioMethodTab,
                    selectedBioMethod === 'FINGERPRINT' && styles.bioMethodTabActive,
                  ]}
                  onPress={() => {
                    setSelectedBioMethod('FINGERPRINT');
                    setBioState('IDLE');
                  }}
                >
                  <Text style={styles.bioMethodIcon}>👆</Text>
                  <Text
                    style={[
                      styles.bioMethodLabel,
                      selectedBioMethod === 'FINGERPRINT' && styles.bioMethodLabelActive,
                    ]}
                  >
                    Fingerprint
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.bioMethodTab,
                    selectedBioMethod === 'FACIAL' && styles.bioMethodTabActive,
                  ]}
                  onPress={() => {
                    setSelectedBioMethod('FACIAL');
                    setBioState('IDLE');
                  }}
                >
                  <Text style={styles.bioMethodIcon}>📸</Text>
                  <Text
                    style={[
                      styles.bioMethodLabel,
                      selectedBioMethod === 'FACIAL' && styles.bioMethodLabelActive,
                    ]}
                  >
                    Facial Verification
                  </Text>
                </TouchableOpacity>
              </View>

              {/* FINGERPRINT INTERFACE */}
              {selectedBioMethod === 'FINGERPRINT' && (
                <View style={styles.sensorContainer}>
                  <Text style={styles.sensorInstruction}>
                    {bioState === 'SCANNING'
                      ? 'Scanning fingerprint biometric pattern...'
                      : bioState === 'VERIFIED'
                      ? '✓ Identity Verified'
                      : bioState === 'FAILED'
                      ? 'Biometric Mismatch. Please Retry.'
                      : 'Place finger on sensor'}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.fingerprintSensor,
                      bioState === 'SCANNING' && styles.sensorScanning,
                      bioState === 'VERIFIED' && styles.sensorVerified,
                      bioState === 'FAILED' && styles.sensorFailed,
                    ]}
                    onPress={handleTriggerBiometricScan}
                  >
                    <Text style={styles.fingerprintGraphic}>👆</Text>
                    {bioState === 'SCANNING' && (
                      <Animated.View
                        style={[
                          styles.scanningLine,
                          {
                            transform: [
                              {
                                translateY: scanAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-30, 30],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.sensorSubtext}>
                    {bioState === 'SCANNING'
                      ? 'Verifying against state PMU cryptographic ledger...'
                      : bioState === 'VERIFIED'
                      ? 'Officer Priya Verma (PMU-DEMO-004) Authenticated'
                      : '[ Tap sensor above to verify ]'}
                  </Text>

                  {/* Failure / Retry Simulation Helper */}
                  {bioState === 'IDLE' && (
                    <TouchableOpacity
                      style={styles.simulateFailLink}
                      onPress={handleTriggerBiometricFail}
                    >
                      <Text style={styles.simulateFailText}>Simulate Verification Failure</Text>
                    </TouchableOpacity>
                  )}

                  {bioState === 'FAILED' && (
                    <Button
                      title="RETRY BIOMETRIC SCAN 🔄"
                      variant="primary"
                      onPress={() => setBioState('IDLE')}
                      style={{ width: '100%', marginTop: spacing.md }}
                    />
                  )}
                </View>
              )}

              {/* FACIAL VERIFICATION INTERFACE */}
              {selectedBioMethod === 'FACIAL' && (
                <View style={styles.facialContainer}>
                  <Text style={styles.sensorInstruction}>
                    {bioState === 'SCANNING'
                      ? 'Scanning facial geometry...'
                      : bioState === 'VERIFIED'
                      ? '✓ Identity Verified'
                      : 'Align your face inside the frame'}
                  </Text>

                  <View style={styles.viewfinderFrame}>
                    {/* Viewfinder Corner Markers */}
                    <View style={[styles.vfCorner, styles.vfCornerTL]} />
                    <View style={[styles.vfCorner, styles.vfCornerTR]} />
                    <View style={[styles.vfCorner, styles.vfCornerBL]} />
                    <View style={[styles.vfCorner, styles.vfCornerBR]} />

                    <Text style={styles.facialEmoji}>👤</Text>
                    <Text style={styles.cameraPreviewText}>[ CAMERA PREVIEW ]</Text>

                    {bioState === 'SCANNING' && (
                      <Animated.View
                        style={[
                          styles.facialScanBeam,
                          {
                            transform: [
                              {
                                translateY: scanAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-60, 60],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    )}
                  </View>

                  <Button
                    title={
                      bioState === 'SCANNING'
                        ? 'Scanning...'
                        : bioState === 'VERIFIED'
                        ? '✓ Verified'
                        : 'SCAN FACE ➔'
                    }
                    variant="primary"
                    disabled={bioState === 'SCANNING'}
                    onPress={handleTriggerBiometricScan}
                    style={{ width: '100%', marginTop: spacing.md }}
                  />
                </View>
              )}

              {/* Transparent Demo Notice */}
              <View style={styles.protoBanner}>
                <Text style={styles.protoBannerText}>
                  ℹ Simulated Verification Prototype: Validates biometric workflow logic for hackathon demonstration.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.backStepBtn}
                onPress={() => setWorkflowStep('GEOFENCE')}
              >
                <Text style={styles.backStepBtnText}>⬅ Back to Geofence Radar</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* STEP 3: INSPECTION START AUTHORIZATION */}
        {workflowStep === 'AUTHORIZED' && (
          <View>
            <Card style={styles.authCard}>
              <View style={styles.authHeaderBadge}>
                <Text style={styles.authHeaderBadgeText}>START AUTHORIZATION CLEARED</Text>
              </View>

              <Text style={styles.authTitle}>Inspection Launch Permit</Text>
              <Text style={styles.authSubtitle}>
                All pre-inspection verification criteria have been strictly corroborated.
              </Text>

              {/* Verification Checklist */}
              <View style={styles.authChecklist}>
                <View style={styles.authCheckItem}>
                  <Text style={styles.authCheckIcon}>✓</Text>
                  <View style={styles.authCheckCol}>
                    <Text style={styles.authCheckTitle}>Assignment confirmed</Text>
                    <Text style={styles.authCheckDesc}>
                      Order #{activeInspectionId} for {projectName}
                    </Text>
                  </View>
                </View>

                <View style={styles.authDivider} />

                <View style={styles.authCheckItem}>
                  <Text style={styles.authCheckIcon}>✓</Text>
                  <View style={styles.authCheckCol}>
                    <Text style={styles.authCheckTitle}>Location verified</Text>
                    <Text style={styles.authCheckDesc}>
                      Distance: {distanceMeters}m (Inside 100m authorized perimeter)
                    </Text>
                  </View>
                </View>

                <View style={styles.authDivider} />

                <View style={styles.authCheckItem}>
                  <Text style={styles.authCheckIcon}>✓</Text>
                  <View style={styles.authCheckCol}>
                    <Text style={styles.authCheckTitle}>Inspector identity verified</Text>
                    <Text style={styles.authCheckDesc}>
                      {user?.name || 'Priya Verma'} authenticated via {biometricType || 'Fingerprint'}
                    </Text>
                  </View>
                </View>
              </View>

              <Button
                title="START INSPECTION 🚀"
                variant="primary"
                onPress={handleStartInspection}
                style={styles.startInspectionBtn}
              />
            </Card>
          </View>
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
    paddingBottom: spacing.xxl + 24,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBubbleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepBubbleCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepBubbleText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    marginLeft: 6,
  },
  stepLabelActive: {
    color: colors.primary,
  },
  stepConnector: {
    width: 24,
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  mapCanvas: {
    height: 220,
    backgroundColor: '#0F2744',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    ...shadows.md,
  },
  geofenceCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: 'rgba(46, 125, 50, 0.7)',
    backgroundColor: 'rgba(46, 125, 50, 0.15)',
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
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
    maxWidth: 120,
    textAlign: 'center',
    marginTop: 2,
  },
  inspectorPin: {
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  pinInside: {
    top: 75,
    right: 85,
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
  },
  pinOutside: {
    top: 15,
    right: 25,
    backgroundColor: 'rgba(198, 40, 40, 0.9)',
  },
  pinIcon: {
    fontSize: 14,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
    marginLeft: 4,
  },
  hudBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  hudText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  modePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  modePillText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  statusCard: {
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  locationProjectName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  locationAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  coordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  coordItem: {
    width: '48%',
  },
  coordLabel: {
    fontSize: 9,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  coordVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  outsideWarningBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  outsideWarningTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.danger,
    textTransform: 'uppercase',
  },
  outsideWarningText: {
    fontSize: 11,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 16,
  },
  retryLocationBtn: {
    backgroundColor: colors.danger,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  retryLocationBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  toggleBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  btnInsideActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  btnOutsideActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  btnInactive: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  toggleBtnTextActive: {
    color: colors.text,
    fontWeight: '800',
  },
  proceedBtn: {
    marginTop: spacing.base,
  },

  // Biometric Styles
  biometricCard: {
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
  },
  biometricHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  biometricHeaderSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.base,
  },
  bioMethodTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  bioMethodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioMethodTabActive: {
    backgroundColor: '#E0F2FE',
    borderColor: colors.primary,
  },
  bioMethodIcon: {
    fontSize: 16,
  },
  bioMethodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  bioMethodLabelActive: {
    color: colors.primary,
  },
  sensorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  sensorInstruction: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.base,
  },
  fingerprintSensor: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  sensorScanning: {
    borderColor: colors.warning,
    backgroundColor: '#FEF3C7',
  },
  sensorVerified: {
    borderColor: colors.success,
    backgroundColor: '#DCFCE7',
  },
  sensorFailed: {
    borderColor: colors.danger,
    backgroundColor: '#FEE2E2',
  },
  fingerprintGraphic: {
    fontSize: 48,
  },
  scanningLine: {
    position: 'absolute',
    width: '80%',
    height: 3,
    backgroundColor: colors.warning,
  },
  sensorSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  simulateFailLink: {
    marginTop: spacing.base,
  },
  simulateFailText: {
    fontSize: 11,
    color: colors.danger,
    textDecorationLine: 'underline',
  },
  facialContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  viewfinderFrame: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.lg,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  vfCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#38BDF8',
  },
  vfCornerTL: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  vfCornerTR: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  vfCornerBL: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 },
  vfCornerBR: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 },
  facialEmoji: {
    fontSize: 54,
  },
  cameraPreviewText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '700',
  },
  facialScanBeam: {
    position: 'absolute',
    width: '90%',
    height: 3,
    backgroundColor: '#38BDF8',
  },
  protoBanner: {
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  protoBannerText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  backStepBtn: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: 6,
  },
  backStepBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },

  // Authorized Card Styles
  authCard: {
    padding: spacing.base,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 4,
    borderTopColor: colors.success,
  },
  authHeaderBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  authHeaderBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.5,
  },
  authTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  authSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.base,
  },
  authChecklist: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  authCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  authCheckIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.success,
  },
  authCheckCol: {
    flex: 1,
  },
  authCheckTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  authCheckDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  authDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  startInspectionBtn: {
    width: '100%',
  },
});
