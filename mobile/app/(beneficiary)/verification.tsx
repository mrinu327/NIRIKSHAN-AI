import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function BeneficiaryVerification() {
  const user = useAuthStore((s) => s.user);
  const [callActive, setCallActive] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="CITIZEN VERIFICATION" subtitle="DoSJE Direct Beneficiary Verification" />

      <View style={styles.container}>
        {callActive ? (
          <View style={styles.callCard}>
            {/* Simulated Live VC Video Frame */}
            <View style={styles.videoFrame}>
              <View style={styles.callerHeader}>
                <View style={styles.callerPill}>
                  <Text style={styles.callerText}>🏛️ DoSJE Official: Dr. Rajesh Sharma</Text>
                </View>
                <View style={styles.liveTimerPill}>
                  <View style={styles.redDot} />
                  <Text style={styles.timerText}>02:14</Text>
                </View>
              </View>

              {/* Center simulated feed graphic */}
              <View style={styles.avatarFeed}>
                <Text style={styles.feedAvatar}>👨‍💼</Text>
                <Text style={styles.feedOfficialName}>Dr. Rajesh Sharma</Text>
                <Text style={styles.feedOfficialRole}>Official Video Stream (Verified)</Text>
              </View>

              {/* Beneficiary self-view thumbnail */}
              <View style={styles.selfViewThumb}>
                <Text style={styles.selfAvatar}>🧑</Text>
                <Text style={styles.selfName}>You (Beneficiary)</Text>
              </View>
            </View>

            {/* In-Call Controls */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.controlBtn, micMuted && styles.controlBtnMuted]}
                onPress={() => setMicMuted(!micMuted)}
              >
                <Text style={styles.controlIcon}>{micMuted ? '🔇' : '🎙️'}</Text>
                <Text style={styles.controlLabel}>{micMuted ? 'Muted' : 'Mute'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlBtn, camOff && styles.controlBtnMuted]}
                onPress={() => setCamOff(!camOff)}
              >
                <Text style={styles.controlIcon}>{camOff ? '🚫' : '📹'}</Text>
                <Text style={styles.controlLabel}>{camOff ? 'Cam Off' : 'Camera'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.endCallBtn}
                onPress={() => setCallActive(false)}
              >
                <Text style={styles.controlIcon}>📞</Text>
                <Text style={styles.endCallText}>End Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Card style={styles.endedCard}>
            <Text style={styles.endedIcon}>✓</Text>
            <Text style={styles.endedTitle}>Verification Call Completed</Text>
            <Text style={styles.endedDesc}>
              Thank you, {user?.name}. Your verbal confirmation has been recorded in the central DoSJE inspection audit trail.
            </Text>
            <Button
              title="Restart Demo Verification Call"
              onPress={() => setCallActive(true)}
              style={styles.restartBtn}
            />
          </Card>
        )}
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
  callCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  videoFrame: {
    flex: 1,
    padding: spacing.base,
    justifyContent: 'space-between',
    position: 'relative',
  },
  callerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callerPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  callerText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  liveTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(198, 40, 40, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    marginRight: 4,
  },
  timerText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  avatarFeed: {
    alignItems: 'center',
  },
  feedAvatar: {
    fontSize: 54,
    marginBottom: 8,
  },
  feedOfficialName: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: '700',
  },
  feedOfficialRole: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  selfViewThumb: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    width: 100,
  },
  selfAvatar: {
    fontSize: 24,
  },
  selfName: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 70,
  },
  controlBtnMuted: {
    backgroundColor: '#EF4444',
  },
  controlIcon: {
    fontSize: 20,
  },
  controlLabel: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  endCallBtn: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 80,
  },
  endCallText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  endedCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  endedIcon: {
    fontSize: 48,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  endedTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  endedDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  restartBtn: {
    marginTop: spacing.lg,
  },
});
