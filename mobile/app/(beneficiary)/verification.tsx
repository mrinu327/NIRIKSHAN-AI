import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';
import { api } from '../../src/services/api';
import { VideoVerification } from '@nirikshan/shared-types';

export default function BeneficiaryVerification() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [callActive, setCallActive] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [activeCall, setActiveCall] = useState<VideoVerification | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [endingCall, setEndingCall] = useState(false);
  const [auditStatus, setAuditStatus] = useState('Recorded in central DoSJE audit trail');

  // Load existing requested call or create a verification session
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const calls = await api.getVideoVerifications({
          projectId: 'proj-001',
          participantType: 'BENEFICIARY',
        });
        const pending = calls.find((c) => c.status === 'REQUESTED');
        if (isMounted) {
          if (pending) {
            setActiveCall(pending);
          } else {
            const newCall = await api.requestVideoVerification({
              projectId: 'proj-001',
              participantType: 'BENEFICIARY',
              participantName: user?.name || 'Ramesh Kumar (Beneficiary)',
              participantPhone: user?.phone || '+919876543213',
            });
            if (isMounted) setActiveCall(newCall.videoCall);
          }
        }
      } catch (e) {
        // Handled by api fallback
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Live timer simulation while in call
  useEffect(() => {
    if (!callActive) return;
    const timer = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callActive]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleEndCall = async () => {
    setEndingCall(true);
    const callId = activeCall?.id || 'vc-001';
    try {
      await api.completeVideoVerification(callId, {
        status: 'ANSWERED',
        result: 'VERIFIED',
        feedbackNotes: 'Citizen verbal confirmation recorded via live video verification stream.',
      });
      setAuditStatus(`Verified & logged in central DoSJE audit trail (Session #${callId.slice(-6)})`);
    } catch (e) {
      setAuditStatus('Recorded in central DoSJE audit trail (Demo Mode)');
    } finally {
      setEndingCall(false);
      setCallActive(false);
    }
  };

  const handleRestart = async () => {
    setTimerSeconds(0);
    setCallActive(true);
    try {
      const res = await api.requestVideoVerification({
        projectId: 'proj-001',
        participantType: 'BENEFICIARY',
        participantName: user?.name || 'Ramesh Kumar (Beneficiary)',
        participantPhone: user?.phone || '+919876543213',
      });
      setActiveCall(res.videoCall);
    } catch (e) {
      // Handled by fallback
    }
  };

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
                  <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
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
                <Text style={styles.selfName}>You ({user?.name?.split(' ')[0] || 'Citizen'})</Text>
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
                onPress={handleEndCall}
                disabled={endingCall}
              >
                {endingCall ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.controlIcon}>📞</Text>
                    <Text style={styles.endCallText}>End Call</Text>
                  </>
                )}
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
            <View style={styles.auditPill}>
              <Text style={styles.auditPillText}>🔒 {auditStatus}</Text>
            </View>

            <Button
              title="⭐ Provide Confidential Detailed Feedback"
              onPress={() => router.push('/(beneficiary)/feedback')}
              style={styles.feedbackBtn}
            />

            <Button
              title="Restart Demo Verification Call"
              variant="outline"
              onPress={handleRestart}
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
    marginTop: spacing.md,
  },
  feedbackBtn: {
    marginTop: spacing.lg,
    width: '100%',
  },
  auditPill: {
    marginTop: spacing.md,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  auditPillText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
