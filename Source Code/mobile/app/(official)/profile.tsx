import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/constants/theme';
import { GovHeader, Card, Button, RoleBadge } from '../../src/components/common';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function OfficialProfile() {
  const router = useRouter();
  const { user, role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="OFFICER PROFILE" subtitle="DoSJE Official Credentials & Jurisdiction" />

      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🏛️</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Dr. Rajesh Sharma'}</Text>
          <Text style={styles.designation}>
            Director - Central Monitoring & Inspections
          </Text>
          <View style={styles.badgeRow}>
            {role && <RoleBadge role={role} />}
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Official Email</Text>
              <Text style={styles.infoVal}>{user?.email || 'official@dosje.gov.in'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Contact Mobile</Text>
              <Text style={styles.infoVal}>{user?.phone || '+919876543210'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Jurisdiction</Text>
              <Text style={styles.infoVal}>All India (Central Directorate)</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Security Level</Text>
              <Text style={styles.infoVal}>Level 4 (Supervisory & Escalation)</Text>
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
    backgroundColor: '#E0F2FE',
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
