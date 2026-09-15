import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Role } from '@nirikshan/shared-types';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { useAuthStore, DEMO_ACCOUNTS } from '../../src/store/useAuthStore';
import { Button, DemoBanner, RoleBadge } from '../../src/components/common';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginDemo } = useAuthStore();

  const [identifier, setIdentifier] = useState('official@dosje.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'credentials'>('demo');

  const handleCredentialsLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Validation Error', 'Please enter your registered Email or Mobile Number');
      return;
    }
    setLoading(true);
    try {
      await login(identifier, password);
      // Route based on role
      const currentRole = useAuthStore.getState().role;
      navigateToRole(currentRole || Role.OFFICIAL);
    } catch (err) {
      Alert.alert('Login Failed', 'Invalid credentials or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (role: Role) => {
    loginDemo(role);
    navigateToRole(role);
  };

  const navigateToRole = (role: Role) => {
    switch (role) {
      case Role.OFFICIAL:
        router.replace('/(official)/dashboard');
        break;
      case Role.INSPECTOR:
        router.replace('/(inspector)/dashboard' as any);
        break;
      case Role.NGO:
        router.replace('/(ngo)/home');
        break;
      case Role.BENEFICIARY:
        router.replace('/(beneficiary)/verification');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DemoBanner customText="SIH26095 PROTOTYPE DEMO MODE — Select a demo persona below for 1-click login" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* National Emblem & Ministry Branding */}
          <View style={styles.govBrandHeader}>
            <View style={styles.emblemBadge}>
              <Text style={styles.emblemIcon}>🏛️</Text>
            </View>
            <Text style={styles.govTitle}>GOVERNMENT OF INDIA</Text>
            <Text style={styles.ministryTitle}>
              Department of Social Justice and Empowerment (DoSJE)
            </Text>
            <View style={styles.accentDivider} />
            <Text style={styles.appTitle}>NIRIKSHAN AI</Text>
            <Text style={styles.tagline}>Monitor. Verify. Act.</Text>
            <Text style={styles.subtext}>
              Centralized Monitoring & Surprise Inspection Platform
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.tab, activeTab === 'demo' && styles.tabActive]}
              onPress={() => setActiveTab('demo')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'demo' && styles.tabTextActive,
                ]}
              >
                ⚡ 1-Click Demo Persona
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tab,
                activeTab === 'credentials' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('credentials')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'credentials' && styles.tabTextActive,
                ]}
              >
                🔒 Officer Login
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: 1-Click Demo Personas */}
          {activeTab === 'demo' ? (
            <View style={styles.demoSection}>
              <Text style={styles.sectionHeader}>
                Select an authorized persona for instant demonstration:
              </Text>

              {Object.values(DEMO_ACCOUNTS).map((item) => (
                <TouchableOpacity
                  key={item.role}
                  activeOpacity={0.85}
                  style={styles.personaCard}
                  onPress={() => handleDemoSelect(item.role)}
                >
                  <View style={styles.personaTop}>
                    <RoleBadge role={item.role} />
                    <View style={styles.loginArrowPill}>
                      <Text style={styles.loginArrowText}>Enter ➔</Text>
                    </View>
                  </View>

                  <Text style={styles.personaName}>{item.user.name}</Text>
                  <Text style={styles.personaDesignation}>{item.designation}</Text>

                  <View style={styles.personaMetaRow}>
                    <Text style={styles.personaEmail}>📧 {item.user.email}</Text>
                    <Text style={styles.personaLocation}>
                      📍 {item.user.district}, {item.user.state}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            /* Tab 2: Standard Credentials Login */
            <View style={styles.credentialsCard}>
              <Text style={styles.credentialsHeading}>Official Sign-In</Text>
              <Text style={styles.credentialsSub}>
                Enter your authorized DoSJE NIC credentials or mobile number
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Registered Email or Mobile</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@gov.in or +91..."
                  placeholderTextColor={colors.textLight}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Security Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Button
                title="Authenticate with DoSJE Gateway"
                onPress={handleCredentialsLogin}
                loading={loading}
                style={styles.loginBtn}
              />

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotBtnText}>
                  Forgot Password / Request OTP
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer Security Notice */}
          <View style={styles.footerNotice}>
            <Text style={styles.footerNoticeText}>
              🔒 Secure Government Telemetry & Inspection System
            </Text>
            <Text style={styles.footerNoticeSub}>
              Unauthorized access is punishable under Section 43 & 66 of the IT Act, 2000.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    backgroundColor: colors.background,
    minHeight: '100%',
  },
  govBrandHeader: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadows.md,
  },
  emblemBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emblemIcon: {
    fontSize: 24,
  },
  govTitle: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.5,
  },
  ministryTitle: {
    color: '#CBD5E1',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  accentDivider: {
    width: 40,
    height: 2,
    backgroundColor: colors.secondary,
    marginVertical: spacing.xs + 2,
  },
  appTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.5,
  },
  tagline: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
  },
  subtext: {
    color: '#E2E8F0',
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xs,
    opacity: 0.85,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: borderRadius.lg,
    padding: 3,
    marginBottom: spacing.base,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  demoSection: {
    marginBottom: spacing.base,
  },
  sectionHeader: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  personaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  personaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  loginArrowPill: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  loginArrowText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  personaName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  personaDesignation: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  personaMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  personaEmail: {
    fontSize: 11,
    color: colors.textLight,
  },
  personaLocation: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '500',
  },
  credentialsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  credentialsHeading: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  credentialsSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.base,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  loginBtn: {
    marginTop: spacing.sm,
  },
  forgotBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  forgotBtnText: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  footerNotice: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  footerNoticeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
  },
  footerNoticeSub: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 280,
  },
});
