/**
 * InspectionOverviewScreen
 * SIH26095 | MoSJE PMU Inspector Field Workflow
 *
 * Dedicated overview screen displaying target institute details,
 * protocol instructions, and 'Start Inspection' trigger.
 * Integrated native-style executive header with back navigation.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Modal,
  TextInput,
  ViewStyle,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InspectorStackParamList, InspectorStackNavigationProp } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { mockInspectionService } from '../../services/mock/mockInspectionService';
import { InspectionAssignment } from '../../types/inspection';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type OverviewRouteProp = RouteProp<InspectorStackParamList, 'InspectionOverview'>;

export const InspectionOverviewScreen: React.FC = () => {
  const navigation = useNavigation<InspectorStackNavigationProp>();
  const route = useRoute<OverviewRouteProp>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { currentRole, switchRole, currentUser } = useAuth();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<InspectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Geofence & Location State
  const [verifyingLocation, setVerifyingLocation] = useState(false);
  const [locationResult, setLocationResult] = useState<{
    verified: boolean;
    distanceMeters: number;
    radiusMeters: number;
    status: 'INSIDE' | 'OUTSIDE' | 'OVERRIDDEN';
    message: string;
  } | null>(null);

  // Authorized Exemption Modal State
  const [overrideModalVisible, setOverrideModalVisible] = useState(false);
  const [authorizingAuthority, setAuthorizingAuthority] = useState('Dr. Rajesh Sharma (Director - Central Monitoring PMU)');
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Biometric Verification State
  const [biometricStatus, setBiometricStatus] = useState<'IDLE' | 'SCANNING' | 'VERIFIED' | 'FAILED'>('IDLE');
  const [biometricTimestamp, setBiometricTimestamp] = useState<string | null>(null);
  const [biometricType, setBiometricType] = useState<'FINGERPRINT' | 'FACIAL'>('FINGERPRINT');

  // Animations
  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const skeletonPulse = useRef(new Animated.Value(0.35)).current;

  // Pulsing skeleton animation loop
  useEffect(() => {
    if (loading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, {
            toValue: 0.85,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonPulse, {
            toValue: 0.35,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [loading]);

  useEffect(() => {
    mockInspectionService.getInspectionById(inspectionId).then((data) => {
      setInspection(data || null);
      if (data?.isLocationVerified || data?.geofenceStatus) {
        setLocationResult({
          verified: Boolean(data.isLocationVerified),
          distanceMeters: data.distanceMeters || 38,
          radiusMeters: 100,
          status: data.geofenceStatus || 'INSIDE',
          message:
            data.geofenceStatus === 'OVERRIDDEN'
              ? `Authorized Geofence Exemption recorded (${data.overrideAuthorizingAuthority})`
              : `Location Verified: Within ${data.distanceMeters || 38}m of site.`,
        });
      }
      if (data?.isBiometricVerified) {
        setBiometricStatus('VERIFIED');
        setBiometricTimestamp(data.biometricTimestamp || 'Verified Today');
      }
      setLoading(false);
    });
  }, [inspectionId]);

  useEffect(() => {
    if (!loading && inspection) {
      Animated.parallel([
        Animated.timing(screenFade, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(screenSlide, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, inspection]);

  const handleVerifyLocation = async () => {
    if (!inspection) return;
    setVerifyingLocation(true);
    setValidationError(null);
    try {
      let lat = 28.7182; // Field test coordinates (close to Rohini site)
      let lon = 77.1238;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
        }
      } catch (locErr) {
        console.warn('GPS hardware access unavailable, using field coordinates:', locErr);
      }

      const res = await mockInspectionService.verifyInspectionLocation(inspection.id, lat, lon);
      setLocationResult(res);
      if (res.assignment) {
        setInspection(res.assignment);
      }
    } catch (err: any) {
      console.error('Failed to verify location:', err);
      setValidationError('Location verification failed. Please ensure GPS is enabled.');
    } finally {
      setVerifyingLocation(false);
    }
  };

  const handleApplyOverride = async () => {
    if (!inspection) return;
    if (!authorizingAuthority.trim() || !authorizationCode.trim() || !overrideReason.trim()) {
      setOverrideError('All authorization fields are mandatory for an official geofence override.');
      return;
    }

    try {
      const res = await mockInspectionService.verifyInspectionLocation(inspection.id, 0, 0, {
        override: true,
        authorizingAuthority: authorizingAuthority.trim(),
        authorizationCode: authorizationCode.trim(),
        reason: overrideReason.trim(),
      });
      setLocationResult(res);
      if (res.assignment) {
        setInspection(res.assignment);
      }
      setOverrideModalVisible(false);
      setOverrideError(null);
    } catch (err: any) {
      setOverrideError('Failed to record authorized override.');
    }
  };

  const handleVerifyBiometrics = async (type: 'FINGERPRINT' | 'FACIAL') => {
    if (!inspection) return;
    setBiometricType(type);
    setBiometricStatus('SCANNING');
    setValidationError(null);

    setTimeout(async () => {
      try {
        const updated = await mockInspectionService.recordBiometricVerification(inspection.id, type);
        if (updated) {
          setInspection(updated);
          setBiometricStatus('VERIFIED');
          setBiometricTimestamp(updated.biometricTimestamp || 'Verified Today');
        }
      } catch (err) {
        setBiometricStatus('FAILED');
      }
    }, 1200);
  };

  const isGeofenceSatisfied = Boolean(
    locationResult?.verified ||
    inspection?.isLocationVerified ||
    inspection?.geofenceStatus === 'INSIDE' ||
    inspection?.geofenceStatus === 'OVERRIDDEN'
  );
  const isBiometricSatisfied = Boolean(
    biometricStatus === 'VERIFIED' || inspection?.isBiometricVerified
  );
  const canStart = (isGeofenceSatisfied && isBiometricSatisfied) || inspection?.status === 'In Progress';

  const handleStartInspection = async () => {
    if (!inspection) return;
    if (!canStart) {
      setValidationError(
        'Mandatory Gatekeeping Check: Must verify location within 100m geofence (or obtain supervisor authorization) and complete officer biometric verification before starting.'
      );
      return;
    }
    setStarting(true);
    try {
      await mockInspectionService.startInspection(inspection.id);
      navigation.navigate('InspectionChecklist', { inspectionId: inspection.id });
    } catch (err: any) {
      console.error('Failed to start inspection:', err);
      setValidationError(err?.message || 'Failed to start inspection.');
    } finally {
      setStarting(false);
    }
  };

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'official':
        return 'MoSJE Official';
      case 'inspector':
        return 'PMU Inspection Officer';
      case 'ngo':
        return 'NGO / Institute';
      default:
        return 'MoSJE Portal';
    }
  };

  // Skeleton Loading Screen
  if (loading || !inspection) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

        {/* Integrated Skeleton Header */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
          <View style={styles.headerInner}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerBranding}>
                <View style={styles.headerEmblem}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
                </View>
                <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
              </View>
            </View>

            <View style={styles.headerMainRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBackBtn}
                accessibilityRole="button"
                accessibilityLabel="Back to previous screen"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Field Inspection Overview
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  Loading assignment details...
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skeleton Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Animated.View style={[styles.skeletonLine, { width: 140, height: 16, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonLine, { width: 80, height: 16, opacity: skeletonPulse }]} />
            </View>
            <Animated.View style={[styles.skeletonLine, { width: '80%', height: 22, marginTop: 12, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: '60%', height: 14, marginTop: 6, opacity: skeletonPulse }]} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Animated.View style={[styles.skeletonBox, { flex: 1, height: 44, opacity: skeletonPulse }]} />
              <Animated.View style={[styles.skeletonBox, { flex: 1, height: 44, opacity: skeletonPulse }]} />
            </View>
          </View>

          <View style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonLine, { width: 220, height: 18, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 12, marginTop: 6, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { width: '100%', height: 60, marginTop: 12, opacity: skeletonPulse }]} />
          </View>

          <View style={styles.skeletonCard}>
            <Animated.View style={[styles.skeletonLine, { width: 180, height: 18, opacity: skeletonPulse }]} />
            <Animated.View style={[styles.skeletonBox, { width: '100%', height: 120, marginTop: 12, opacity: skeletonPulse }]} />
          </View>
        </ScrollView>
      </View>
    );
  }

  const isSurprise = inspection.type === 'Surprise Inspection';
  const isInProgress = inspection.status === 'In Progress';
  const officerName = inspection.assignedOfficerName ? inspection.assignedOfficerName.replace('Demo ', '') : 'Officer';
  const badgeText = inspection.assignedOfficerDemoId ? inspection.assignedOfficerDemoId.replace('DEMO-', '') : '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.navy} />

      {/* Integrated Executive MoSJE Header with Native-Style Back Button */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + spacing.xs }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerBranding}>
              <View style={styles.headerEmblem}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
              </View>
              <Text style={styles.headerMinistry}>MoSJE • Government of India</Text>
            </View>

            <View style={styles.headerActionsRight}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{getRoleLabel()}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={switchRole}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.switchButton}
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.text.inverse} />
                <Text style={styles.switchText}>Switch Role</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerMainRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to previous screen"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text.inverse} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Field Inspection Overview
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Order #{inspection.id} • MoSJE PMU Dispatch
              </Text>
            </View>

            <View style={styles.headerStatusBadge}>
              <StatusBadge
                label={inspection.status}
                variant={isInProgress ? 'warning' : 'info'}
                size="sm"
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [{ translateY: screenSlide }],
          }}
        >
          {/* Target Institute Dossier Card */}
          <View style={[styles.targetCard, isSurprise && styles.targetCardSurprise]}>
            <View style={styles.targetTopRow}>
              <View style={styles.typeRow}>
                {isSurprise && (
                  <Ionicons name="flash" size={14} color={colors.status.highPriority} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.typeText, isSurprise && styles.typeTextSurprise]}>
                  {inspection.type}
                </Text>
              </View>
              <PriorityBadge priority={inspection.priority} />
            </View>

            <Text style={styles.projectName}>{inspection.projectName}</Text>

            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={15} color={colors.brand.primary} style={{ marginTop: 1 }} />
              <Text style={styles.addressText}>{inspection.projectAddress}</Text>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Order ID</Text>
                <Text style={styles.metaValue}>#{inspection.id}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Priority</Text>
                <Text style={styles.metaValue}>{inspection.priority}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Assigned Officer</Text>
                <Text style={styles.metaValue}>
                  {officerName}
                  {badgeText ? (
                    <Text style={{ color: colors.brand.primary }}> ({badgeText})</Text>
                  ) : null}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Dispatch Method</Text>
                <Text style={styles.metaValue}>{inspection.assignmentMethod || 'Automated Random Selection'}</Text>
              </View>
            </View>

            {inspection.triggerReason ? (
              <View style={styles.triggerAlertBox}>
                <Ionicons name="information-circle" size={16} color={colors.brand.navyLight} />
                <View style={styles.triggerAlertTextCol}>
                  <Text style={styles.triggerAlertTitle}>Dispatch Justification</Text>
                  <Text style={styles.triggerAlertDesc}>{inspection.triggerReason}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Protocol Instructions Banner */}
          <View style={styles.protocolCard}>
            <View style={styles.protocolHeader}>
              <View style={styles.protocolIconCircle}>
                <Ionicons name="shield-checkmark" size={18} color={colors.brand.primary} />
              </View>
              <View style={styles.protocolHeaderTextCol}>
                <Text style={styles.protocolTitle}>Verification Protocol Objective</Text>
                <Text style={styles.protocolSub}>Standard MoSJE Field Operating Procedure</Text>
              </View>
            </View>

            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                "Verify the project/institute's reported operational status against on-site observations and available evidence."
              </Text>
            </View>

            <Text style={styles.protocolNote}>
              • Conduct an unbiased, physical assessment of beneficiaries and facilities.{'\n'}
              • Record observations using neutral, factual language without premature conclusions.{'\n'}
              • Attach timestamped photo/document evidence for verification record.
            </Text>
          </View>

          {/* On-Site Gatekeeping: Geofence & Biometric Verification */}
          <SectionHeader
            title="On-Site Security Gatekeeping"
            subtitle="Mandatory 100m perimeter validation and officer biometric authentication"
          />

          {/* 1. GPS Geofence Verification Card */}
          <View
            style={[
              styles.gatekeepCard,
              locationResult?.status === 'INSIDE' && styles.gatekeepCardSuccess,
              locationResult?.status === 'OUTSIDE' && styles.gatekeepCardWarning,
              locationResult?.status === 'OVERRIDDEN' && styles.gatekeepCardOverride,
            ]}
          >
            <View style={styles.gatekeepHeader}>
              <View
                style={[
                  styles.gatekeepIconCircle,
                  locationResult?.status === 'INSIDE' && styles.gatekeepIconSuccess,
                  locationResult?.status === 'OUTSIDE' && styles.gatekeepIconWarning,
                  locationResult?.status === 'OVERRIDDEN' && styles.gatekeepIconOverride,
                ]}
              >
                <Ionicons
                  name={
                    locationResult?.status === 'INSIDE'
                      ? 'navigate-circle'
                      : locationResult?.status === 'OVERRIDDEN'
                      ? 'shield-checkmark'
                      : 'location'
                  }
                  size={20}
                  color={
                    locationResult?.status === 'INSIDE'
                      ? colors.status.normal
                      : locationResult?.status === 'OVERRIDDEN'
                      ? colors.brand.primary
                      : locationResult?.status === 'OUTSIDE'
                      ? colors.status.highPriority
                      : colors.text.muted
                  }
                />
              </View>
              <View style={styles.gatekeepHeaderTextCol}>
                <Text style={styles.gatekeepTitle}>GPS Geofence Perimeter</Text>
                <Text style={styles.gatekeepSub}>
                  {locationResult?.status === 'INSIDE'
                    ? `🟢 Location Verified (Within ${locationResult.distanceMeters}m of site, Limit: 100m)`
                    : locationResult?.status === 'OVERRIDDEN'
                    ? `🟣 Authorized Supervisor Exemption Active`
                    : locationResult?.status === 'OUTSIDE'
                    ? `🔴 Outside Geofence Perimeter (${locationResult.distanceMeters}m away, Limit: 100m)`
                    : '⚪ Location Check Required: Must be within 100m perimeter'}
                </Text>
              </View>
              <StatusBadge
                label={
                  locationResult?.status === 'INSIDE'
                    ? 'VERIFIED'
                    : locationResult?.status === 'OVERRIDDEN'
                    ? 'EXEMPTED'
                    : locationResult?.status === 'OUTSIDE'
                    ? 'OUTSIDE'
                    : 'PENDING'
                }
                variant={
                  locationResult?.status === 'INSIDE'
                    ? 'normal'
                    : locationResult?.status === 'OVERRIDDEN'
                    ? 'info'
                    : locationResult?.status === 'OUTSIDE'
                    ? 'highPriority'
                    : 'warning'
                }
                size="sm"
              />
            </View>

            {locationResult?.message ? (
              <View style={styles.gatekeepMessageRow}>
                <Text style={styles.gatekeepMessageText}>{locationResult.message}</Text>
              </View>
            ) : null}

            {locationResult?.status === 'OVERRIDDEN' && inspection?.overrideAuthorizingAuthority ? (
              <View style={styles.overrideInfoBox}>
                <Ionicons name="document-text-outline" size={14} color={colors.brand.navyLight} />
                <Text style={styles.overrideInfoText}>
                  Audit Record: Approved by {inspection.overrideAuthorizingAuthority} ({inspection.overrideAuthorizationCode}). Reason: "{inspection.overrideReason}"
                </Text>
              </View>
            ) : null}

            <View style={styles.gatekeepActionRow}>
              <TouchableOpacity
                style={[styles.gatekeepActionBtn, verifyingLocation && { opacity: 0.7 }]}
                onPress={handleVerifyLocation}
                disabled={verifyingLocation}
                activeOpacity={0.8}
              >
                <Ionicons name="locate" size={16} color={colors.text.inverse} style={{ marginRight: 6 }} />
                <Text style={styles.gatekeepActionBtnText}>
                  {verifyingLocation ? 'Acquiring GPS Signal...' : 'Verify Current Location'}
                </Text>
              </TouchableOpacity>

              {locationResult?.status === 'OUTSIDE' && (
                <TouchableOpacity
                  style={styles.overrideTriggerBtn}
                  onPress={() => {
                    setOverrideError(null);
                    setOverrideModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="lock-open-outline" size={15} color={colors.status.highPriority} style={{ marginRight: 5 }} />
                  <Text style={styles.overrideTriggerBtnText}>Supervisor Exemption</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 2. Biometric Verification Card */}
          <View
            style={[
              styles.gatekeepCard,
              biometricStatus === 'VERIFIED' && styles.gatekeepCardSuccess,
              biometricStatus === 'FAILED' && styles.gatekeepCardWarning,
            ]}
          >
            <View style={styles.gatekeepHeader}>
              <View
                style={[
                  styles.gatekeepIconCircle,
                  biometricStatus === 'VERIFIED' && styles.gatekeepIconSuccess,
                  biometricStatus === 'FAILED' && styles.gatekeepIconWarning,
                ]}
              >
                <Ionicons
                  name={biometricType === 'FACIAL' ? 'scan' : 'finger-print'}
                  size={20}
                  color={
                    biometricStatus === 'VERIFIED'
                      ? colors.status.normal
                      : biometricStatus === 'FAILED'
                      ? colors.status.highPriority
                      : colors.brand.primary
                  }
                />
              </View>
              <View style={styles.gatekeepHeaderTextCol}>
                <Text style={styles.gatekeepTitle}>Inspector Biometric Authentication</Text>
                <Text style={styles.gatekeepSub}>
                  {biometricStatus === 'VERIFIED'
                    ? `🟢 Identity Authenticated: ${currentUser?.name || officerName} (${badgeText || 'PMU-INSP-2026'})`
                    : biometricStatus === 'SCANNING'
                    ? '🟡 Sensor Active: Scanning credentials...'
                    : biometricStatus === 'FAILED'
                    ? '🔴 Authentication Failed: Biometric mismatch'
                    : '⚪ Authentication Required before field audit'}
                </Text>
              </View>
              <StatusBadge
                label={
                  biometricStatus === 'VERIFIED'
                    ? 'VERIFIED'
                    : biometricStatus === 'SCANNING'
                    ? 'SCANNING'
                    : biometricStatus === 'FAILED'
                    ? 'FAILED'
                    : 'REQUIRED'
                }
                variant={
                  biometricStatus === 'VERIFIED'
                    ? 'normal'
                    : biometricStatus === 'SCANNING'
                    ? 'warning'
                    : biometricStatus === 'FAILED'
                    ? 'highPriority'
                    : 'offline'
                }
                size="sm"
              />
            </View>

            {biometricTimestamp && (
              <View style={styles.gatekeepMessageRow}>
                <Text style={styles.gatekeepMessageText}>
                  Verified officer signature recorded at {biometricTimestamp}
                </Text>
              </View>
            )}

            <View style={styles.gatekeepActionRow}>
              <TouchableOpacity
                style={[
                  styles.gatekeepActionBtn,
                  styles.biometricBtn,
                  biometricStatus === 'VERIFIED' && styles.biometricBtnVerified,
                  biometricStatus === 'SCANNING' && { opacity: 0.7 },
                ]}
                onPress={() => handleVerifyBiometrics('FINGERPRINT')}
                disabled={biometricStatus === 'SCANNING' || biometricStatus === 'VERIFIED'}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={biometricStatus === 'VERIFIED' ? 'checkmark-circle' : 'finger-print'}
                  size={16}
                  color={colors.text.inverse}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.gatekeepActionBtnText}>
                  {biometricStatus === 'VERIFIED'
                    ? 'Officer Biometrics Authenticated'
                    : biometricStatus === 'SCANNING'
                    ? 'Scanning Sensor...'
                    : 'Scan Fingerprint Sensor'}
                </Text>
              </TouchableOpacity>

              {biometricStatus !== 'VERIFIED' && (
                <TouchableOpacity
                  style={styles.facialTriggerBtn}
                  onPress={() => handleVerifyBiometrics('FACIAL')}
                  disabled={biometricStatus === 'SCANNING'}
                  activeOpacity={0.8}
                >
                  <Ionicons name="scan-outline" size={15} color={colors.brand.primary} style={{ marginRight: 5 }} />
                  <Text style={styles.facialTriggerBtnText}>Face ID</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Workflow Steps Preview */}
          <SectionHeader
            title="Inspection Workflow Steps"
            subtitle="Complete sequentially before final submission"
          />

          <View style={styles.stepsCard}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumCircle, styles.stepNumActive]}>
                <Text style={styles.stepNumActiveText}>1</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Multi-Point Checklist</Text>
                <Text style={styles.stepDesc}>13 evaluation criteria across operations, beneficiaries, infrastructure, and records.</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Inspector Findings</Text>
                <Text style={styles.stepDesc}>Neutral narrative notes, key observations, and follow-up recommendations.</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Evidence Capture</Text>
                <Text style={styles.stepDesc}>Watermarked photo/video metadata registration.</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>4</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Review & MoSJE Submission</Text>
                <Text style={styles.stepDesc}>Pre-submission verification and audit docket dispatch.</Text>
              </View>
            </View>
          </View>

          {/* Validation Notice if Gatekeeping Incomplete */}
          {validationError && (
            <View style={styles.validationNotice}>
              <Ionicons name="alert-circle" size={16} color={colors.status.highPriority} />
              <Text style={styles.validationNoticeText}>{validationError}</Text>
            </View>
          )}

          {/* Primary Action Button */}
          <View style={styles.actionSection}>
            <PrimaryButton
              title={
                isInProgress
                  ? 'Resume Inspection'
                  : canStart
                  ? 'Start Inspection'
                  : 'Start Inspection (Locked — Geofence & Biometrics Required)'
              }
              iconName={canStart || isInProgress ? 'play-circle' : 'lock-closed'}
              onPress={handleStartInspection}
              loading={starting}
              style={StyleSheet.flatten([
                styles.primaryActionBtn,
                !canStart && !isInProgress && styles.primaryActionBtnDisabled,
              ]) as ViewStyle}
            />
            {!canStart && !isInProgress && (
              <Text style={styles.lockedHintText}>
                🔒 Security Protocol Enforced: Must be verified within 100m geofence and authenticated biometrically to unlock inspection.
              </Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Supervisor Geofence Exemption Modal */}
      <Modal
        visible={overrideModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOverrideModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="shield-outline" size={20} color={colors.status.highPriority} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Official Geofence Exemption</Text>
                <Text style={styles.modalSubtitle}>Section 4.2 MoSJE Field Inspection Override Protocol</Text>
              </View>
            </View>

            <Text style={styles.modalNotice}>
              An authorized override permanently records your supervisor's approval and mandatory field justification into the central MoSJE audit ledger.
            </Text>

            {overrideError && (
              <View style={styles.overrideErrorBox}>
                <Ionicons name="alert-circle" size={14} color={colors.status.highPriority} />
                <Text style={styles.overrideErrorText}>{overrideError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Authorizing Authority / Officer *</Text>
            <TextInput
              style={styles.modalInput}
              value={authorizingAuthority}
              onChangeText={setAuthorizingAuthority}
              placeholder="e.g. Dr. Rajesh Sharma, Director PMU"
              placeholderTextColor={colors.text.muted}
            />

            <Text style={styles.inputLabel}>Supervisor Authorization Code / Reference *</Text>
            <TextInput
              style={styles.modalInput}
              value={authorizationCode}
              onChangeText={setAuthorizationCode}
              placeholder="e.g. PMU-EXEMPT-2026-881"
              placeholderTextColor={colors.text.muted}
            />

            <Text style={styles.inputLabel}>Mandatory Field Reason / Justification *</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={overrideReason}
              onChangeText={setOverrideReason}
              placeholder="Detail reasons for external inspection (e.g. perimeter construction, flood hazard, road obstruction)..."
              placeholderTextColor={colors.text.muted}
              multiline={true}
              numberOfLines={3}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setOverrideModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleApplyOverride}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done" size={16} color={colors.text.inverse} style={{ marginRight: 6 }} />
                <Text style={styles.modalSubmitBtnText}>Record Authorization</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxxl + 32,
  },

  // Executive Header
  headerContainer: {
    backgroundColor: colors.brand.navy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    ...shadows.sm,
  },
  headerInner: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmblem: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerMinistry: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleBadgeText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  switchText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  headerStatusBadge: {
    marginLeft: 'auto',
  },

  // Target Institute Card
  targetCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  targetCardSurprise: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.highPriority,
  },
  targetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  typeTextSurprise: {
    color: colors.status.highPriority,
  },
  projectName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 4,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  addressText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: 4,
    flex: 1,
    lineHeight: 16,
  },
  metaGrid: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.sm + 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.xs,
  },
  metaItem: {
    minWidth: '45%',
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  triggerAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderColor: colors.status.infoBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
    gap: 8,
  },
  triggerAlertTextCol: {
    flex: 1,
  },
  triggerAlertTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
    marginBottom: 2,
  },
  triggerAlertDesc: {
    fontSize: 11,
    color: colors.brand.navyLight,
    lineHeight: 16,
  },

  // Protocol Instructions Card
  protocolCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  protocolIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolHeaderTextCol: {
    flex: 1,
  },
  protocolTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  protocolSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  instructionBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.primary,
    borderRadius: borderRadius.xs,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    lineHeight: 20,
  },
  protocolNote: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Workflow Steps Preview
  stepsCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  stepNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  stepNumText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
  },
  stepNumActiveText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  stepDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  stepConnector: {
    width: 2,
    height: 14,
    backgroundColor: colors.neutral.divider,
    marginLeft: 12,
    marginVertical: 2,
  },

  // Primary Action
  actionSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  primaryActionBtn: {
    minHeight: 48,
  },

  // Security Gatekeeping Cards
  gatekeepCard: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  gatekeepCardSuccess: {
    borderColor: colors.status.normalBorder,
    backgroundColor: colors.status.normalLight,
  },
  gatekeepCardWarning: {
    borderColor: colors.status.highPriorityBorder,
    backgroundColor: colors.status.highPriorityLight,
  },
  gatekeepCardOverride: {
    borderColor: colors.status.infoBorder,
    backgroundColor: colors.status.infoLight,
  },
  gatekeepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gatekeepIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatekeepIconSuccess: {
    backgroundColor: colors.status.normalLight,
  },
  gatekeepIconWarning: {
    backgroundColor: colors.status.highPriorityLight,
  },
  gatekeepIconOverride: {
    backgroundColor: colors.status.infoLight,
  },
  gatekeepHeaderTextCol: {
    flex: 1,
  },
  gatekeepTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  gatekeepSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  gatekeepMessageRow: {
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.sm,
  },
  gatekeepMessageText: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  overrideInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.status.infoLight,
    borderColor: colors.status.infoBorder,
    borderWidth: 1,
    borderRadius: borderRadius.xs,
    padding: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  overrideInfoText: {
    fontSize: 11,
    color: colors.brand.navy,
    flex: 1,
    lineHeight: 15,
  },
  gatekeepActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gatekeepActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: borderRadius.md,
  },
  gatekeepActionBtnText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  overrideTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.status.highPriorityBorder,
    backgroundColor: colors.status.highPriorityLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    minHeight: 44,
    borderRadius: borderRadius.md,
  },
  overrideTriggerBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
  },
  biometricBtn: {
    backgroundColor: colors.brand.primary,
  },
  biometricBtnVerified: {
    backgroundColor: colors.status.normal,
  },
  facialTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    minHeight: 44,
    borderRadius: borderRadius.md,
  },
  facialTriggerBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },

  // Validation Notice
  validationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.status.highPriorityLight,
    borderColor: colors.status.highPriorityBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  validationNoticeText: {
    fontSize: typography.sizes.xs,
    color: colors.status.highPriority,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  primaryActionBtnDisabled: {
    opacity: 0.65,
  },
  lockedHintText: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs + 2,
    lineHeight: 16,
  },

  // Supervisor Override Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalContent: {
    backgroundColor: colors.neutral.surface,
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.status.highPriorityLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.brand.navy,
  },
  modalSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 1,
  },
  modalNotice: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    backgroundColor: colors.neutral.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  overrideErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.status.highPriorityLight,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.sm,
  },
  overrideErrorText: {
    fontSize: 11,
    color: colors.status.highPriority,
    fontWeight: typography.weights.medium,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
    marginTop: spacing.xs,
  },
  modalInput: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modalTextArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  modalCancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  modalCancelBtnText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.highPriority,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    minHeight: 44,
  },
  modalSubmitBtnText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },

  // Skeleton Styles
  skeletonCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.xs,
  },
  skeletonLine: {
    backgroundColor: colors.neutral.border,
    borderRadius: borderRadius.xs,
  },
  skeletonBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
});
