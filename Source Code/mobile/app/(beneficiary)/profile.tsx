import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/constants/theme';
import { GovHeader, Card, Button, RoleBadge } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function BeneficiaryProfile() {
  const router = useRouter();
  const { user, role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="CITIZEN PROFILE" subtitle="Registered Beneficiary Welfare Identity" />

      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🧑</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Ramesh Kumar'}</Text>
          <Text style={styles.designation}>
            Registered Scheme Beneficiary • ID #BEN-2026-881
          </Text>
          <View style={styles.badgeRow}>
            {role && <RoleBadge role={role} />}
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Scheme</Text>
              <Text style={styles.infoVal}>DoSJE Rehabilitation & Care Scheme</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Facility Site</Text>
              <Text style={styles.infoVal}>Demo Welfare Institute - Coimbatore</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoVal}>{user?.phone || '+919876543213'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Citizen State</Text>
              <Text style={styles.infoVal}>Tamil Nadu</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Enrolled Since</Text>
              <Text style={styles.infoVal}>March 2025</Text>
            </View>
          </View>

          <Button
            title="Sign Out of Session"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutBtn}
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 32,
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  designation: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  badgeRow: {
    marginVertical: spacing.sm,
  },
  infoList: {
    width: '100%',
    marginVertical: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  infoVal: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  logoutBtn: {
    width: '100%',
    marginTop: spacing.md,
  },
});
