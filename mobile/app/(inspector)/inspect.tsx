import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';

export default function InspectorInspect() {
  const [checklist, setChecklist] = useState({
    operational: true,
    staffPresent: true,
    cctvWorking: true,
    sanitationSatisfactory: true,
    foodQualityGood: true,
    registersMaintained: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="FIELD INSPECTION" subtitle="Checklist & Geo-Tagged Evidence Capture" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Project Target Badge */}
        <View style={styles.projectHeader}>
          <Text style={styles.projectTarget}>Target Institute:</Text>
          <Text style={styles.projectTitle}>Demo Welfare Institute - Coimbatore</Text>
          <View style={styles.geofenceVerifiedPill}>
            <Text style={styles.geofenceVerifiedText}>✓ GPS Geofence Verified (43m)</Text>
          </View>
        </View>

        {/* Verification Checklist */}
        <Card title="Physical Verification Checklist" subtitle="Verify on-site operational parameters">
          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Facility is Operational & Open</Text>
              <Text style={styles.checkDesc}>Institute active during scheduled working hours</Text>
            </View>
            <Switch
              value={checklist.operational}
              onValueChange={() => toggleCheck('operational')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Authorized Staff Present</Text>
              <Text style={styles.checkDesc}>Supervisors and medical staff available on site</Text>
            </View>
            <Switch
              value={checklist.staffPresent}
              onValueChange={() => toggleCheck('staffPresent')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>CCTV Feeds Functional</Text>
              <Text style={styles.checkDesc}>Cameras actively recording without blindspots</Text>
            </View>
            <Switch
              value={checklist.cctvWorking}
              onValueChange={() => toggleCheck('cctvWorking')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkTextWrap}>
              <Text style={styles.checkLabel}>Physical Registers Maintained</Text>
              <Text style={styles.checkDesc}>Daily physical sign-in corresponds to online claims</Text>
            </View>
            <Switch
              value={checklist.registersMaintained}
              onValueChange={() => toggleCheck('registersMaintained')}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        </Card>

        {/* Geo-tagged Evidence Capture */}
        <Card
          title="Capture Field Evidence"
          subtitle="All items stamped with GPS, timestamp & SHA-256 hash"
        >
          <View style={styles.mediaButtonsGrid}>
            <TouchableOpacity style={styles.mediaBtn}>
              <Text style={styles.mediaIcon}>📸</Text>
              <Text style={styles.mediaBtnTitle}>Capture Photo</Text>
              <Text style={styles.mediaBtnSub}>EXIF + GPS Hash</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaBtn}>
              <Text style={styles.mediaIcon}>🎥</Text>
              <Text style={styles.mediaBtnTitle}>Record Video</Text>
              <Text style={styles.mediaBtnSub}>Max 60 Seconds</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaBtn}>
              <Text style={styles.mediaIcon}>🎙️</Text>
              <Text style={styles.mediaBtnTitle}>Voice Statement</Text>
              <Text style={styles.mediaBtnSub}>Audio Note</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaBtn}>
              <Text style={styles.mediaIcon}>📄</Text>
              <Text style={styles.mediaBtnTitle}>Scan Register</Text>
              <Text style={styles.mediaBtnSub}>Document</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.capturedPreview}>
            <Text style={styles.previewTitle}>Captured Evidence (2 Items):</Text>
            <View style={styles.previewItem}>
              <Text style={styles.itemIcon}>📷</Text>
              <View style={styles.itemMeta}>
                <Text style={styles.itemTitle}>dining_hall_headcount.jpg</Text>
                <Text style={styles.itemHash}>SHA-256: e3b0c442...855 (Verified)</Text>
              </View>
            </View>
          </View>

          <Button
            title="Review & Submit Report ➔"
            onPress={() => {}}
            style={styles.submitReportBtn}
          />
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
  projectHeader: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  projectTarget: {
    fontSize: 11,
    color: colors.textMuted,
  },
  projectTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  geofenceVerifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  geofenceVerifiedText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  checkLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  checkDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  mediaButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  mediaBtn: {
    flexBasis: '48%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  mediaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  mediaBtnTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  mediaBtnSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  capturedPreview: {
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  itemMeta: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  itemHash: {
    fontSize: 9,
    color: colors.success,
  },
  submitReportBtn: {
    marginTop: spacing.xs,
  },
});
