/**
 * StakeholderLoginScreen
 * MoSJE Centralized Monitoring & Inspection System
 * Nirikshan AI | Smart India Hackathon 2026
 *
 * SCREEN 2: Stakeholder-Specific Login Page
 * Dynamically displays the selected stakeholder with:
 * - Back button (← Back) returning to Stakeholder Selection without logging in
 * - Stakeholder-specific branding, title, and access description
 * - Inspector auditor profile sub-selector (if PMU Inspector)
 * - Login ID / Official/Officer/Institute Email field
 * - Password field with eye toggle (masked by default)
 * - Login button with loading state
 * - Independent Auto-fill Demo helper
 * - Generic error handling: "Invalid Login ID or Password"
 * - Evaluator demo credentials reference box
 * - Prototype disclaimer and MoSJE government trust branding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/role';
import { AuthStackParamList, AuthStackNavigationProp } from '../../types/navigation';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface StakeholderLoginScreenProps {
  role?: UserRole;
  onBack?: () => void;
}

interface StakeholderConfig {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  emailLabel: string;
  emailPlaceholder: string;
  demoId: string;
  demoPassword: string;
  buttonTitle: string;
}

const STAKEHOLDER_CONFIGS: Record<UserRole, StakeholderConfig> = {
  official: {
    role: 'official',
    title: 'GOVERNMENT OFFICIAL',
    subtitle: 'MoSJE Oversight',
    description: 'National scheme oversight & inspection authorization',
    iconName: 'shield-checkmark-outline',
    iconBg: colors.brand.primaryLight,
    iconBorder: colors.brand.accent,
    iconColor: colors.brand.primary,
    emailLabel: 'LOGIN ID / OFFICIAL EMAIL',
    emailPlaceholder: 'official@nirikshan.gov',
    demoId: 'official@nirikshan.gov',
    demoPassword: 'Official@123',
    buttonTitle: 'Login as Government Official',
  },
  inspector: {
    role: 'inspector',
    title: 'PMU / INSPECTION OFFICER',
    subtitle: 'Field Operations',
    description: 'Field audit assignments & verification filing',
    iconName: 'clipboard-outline',
    iconBg: colors.status.warningLight,
    iconBorder: colors.status.warningBorder,
    iconColor: colors.status.warning,
    emailLabel: 'LOGIN ID / OFFICER EMAIL',
    emailPlaceholder: 'inspector@nirikshan.gov',
    demoId: 'inspector@nirikshan.gov',
    demoPassword: 'Inspector@123',
    buttonTitle: 'Login as PMU Inspector',
  },
  ngo: {
    role: 'ngo',
    title: 'NGO / INSTITUTE',
    subtitle: 'Implementing Agency',
    description: 'Beneficiary attendance & compliance records',
    iconName: 'business-outline',
    iconBg: colors.status.normalLight,
    iconBorder: colors.status.normalBorder,
    iconColor: colors.status.normal,
    emailLabel: 'LOGIN ID / INSTITUTE EMAIL',
    emailPlaceholder: 'ngo@nirikshan.org',
    demoId: 'ngo@nirikshan.org',
    demoPassword: 'NGO@123',
    buttonTitle: 'Login as NGO / Institute',
  },
};

export const StakeholderLoginScreen: React.FC<StakeholderLoginScreenProps> = (props) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;
  const navigation = useNavigation<AuthStackNavigationProp>();
  let routeParamsRole: UserRole | undefined;
  try {
    const route = useRoute<RouteProp<AuthStackParamList, 'StakeholderLogin'>>();
    routeParamsRole = route.params?.role;
  } catch {
    // Route not inside AuthStack
  }

  const effectiveRole: UserRole = props.role || routeParamsRole || 'official';
  const config = STAKEHOLDER_CONFIGS[effectiveRole];

  const { loginWithCredentials, isLoading } = useAuth();

  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectorSubProfile, setInspectorSubProfile] = useState<'inspector_a' | 'inspector_b'>('inspector_a');

  const handleBack = () => {
    if (props.onBack) {
      props.onBack();
      return;
    }
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleAutoFill = () => {
    setLoginId(config.demoId);
    setPassword(config.demoPassword);
    setError(null);
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      setError('Please enter your Login ID and Password');
      return;
    }

    try {
      setError(null);
      await loginWithCredentials(
        loginId.trim(),
        password,
        effectiveRole,
        effectiveRole === 'inspector' ? inspectorSubProfile : undefined
      );
      // Navigation is automatically handled by AuthContext state -> RootNavigator
    } catch (err: any) {
      setError(err?.message || 'Invalid Login ID or Password');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top MoSJE Identity Bar */}
      <View style={[styles.topIdentityBar, { paddingTop: Math.max(insets.top, 10) + spacing.xxs }]}>
        <View style={styles.identityInner}>
          <View style={styles.brandingGroup}>
            <View style={styles.nationalMark}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.text.inverse} />
            </View>
            <Text style={styles.ministryIdentityText}>MoSJE • Government of India</Text>
          </View>
          <View style={styles.systemStatusPill}>
            <View style={styles.systemStatusDot} />
            <Text style={styles.systemStatusText}>E-Governance Portal</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isDesktop && styles.scrollContainerDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentCardWrapper, isDesktop && styles.contentCardWrapperDesktop]}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to stakeholder selection"
          >
            <Ionicons name="arrow-back" size={18} color={colors.brand.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          {/* Stakeholder Login Card */}
          <View style={styles.loginCard}>
            {/* Header / Stakeholder Information */}
            <View style={styles.cardHeaderRow}>
              <View
                style={[
                  styles.cardIconBox,
                  { backgroundColor: config.iconBg, borderColor: config.iconBorder },
                ]}
              >
                <Ionicons name={config.iconName} size={22} color={config.iconColor} />
              </View>
              <View style={styles.cardHeaderInfo}>
                <Text style={styles.cardTitle}>{config.title}</Text>
                <Text style={styles.cardSubtitle}>{config.subtitle}</Text>
                <Text style={styles.cardPromptText}>Sign in to your workspace</Text>
              </View>
              <TouchableOpacity
                style={styles.autoFillBtn}
                onPress={handleAutoFill}
                activeOpacity={0.7}
              >
                <Ionicons name="flash-outline" size={12} color={colors.brand.primary} />
                <Text style={styles.autoFillBtnText}>Auto-fill Demo</Text>
              </TouchableOpacity>
            </View>

            {/* Inspector Auditor Profile Selector (Only for PMU Inspector) */}
            {effectiveRole === 'inspector' && (
              <View style={styles.subInspectorInlineBar}>
                <Text style={styles.subInspectorInlineLabel}>Auditor Profile:</Text>
                <View style={styles.subInspectorInlineOptions}>
                  <TouchableOpacity
                    style={[
                      styles.subOptionPill,
                      inspectorSubProfile === 'inspector_a' && styles.subOptionPillActive,
                    ]}
                    onPress={() => setInspectorSubProfile('inspector_a')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={inspectorSubProfile === 'inspector_a' ? 'radio-button-on' : 'radio-button-off'}
                      size={13}
                      color={inspectorSubProfile === 'inspector_a' ? colors.brand.primary : colors.text.muted}
                    />
                    <Text
                      style={[
                        styles.subOptionPillText,
                        inspectorSubProfile === 'inspector_a' && styles.subOptionPillTextActive,
                      ]}
                    >
                      Vikram Singh (INSP-DEL-042)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subOptionPill,
                      inspectorSubProfile === 'inspector_b' && styles.subOptionPillActive,
                    ]}
                    onPress={() => setInspectorSubProfile('inspector_b')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={inspectorSubProfile === 'inspector_b' ? 'radio-button-on' : 'radio-button-off'}
                      size={13}
                      color={inspectorSubProfile === 'inspector_b' ? colors.brand.primary : colors.text.muted}
                    />
                    <Text
                      style={[
                        styles.subOptionPillText,
                        inspectorSubProfile === 'inspector_b' && styles.subOptionPillTextActive,
                      ]}
                    >
                      Officer B (PMU-DEMO-005)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            {/* Error Banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.status.highPriority} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Login ID Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{config.emailLabel}</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={17}
                  color={colors.brand.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder={config.emailPlaceholder}
                  placeholderTextColor={colors.text.muted}
                  value={loginId}
                  onChangeText={(text) => {
                    setLoginId(text);
                    if (error) setError(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color={colors.brand.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.muted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Demo Credentials Box */}
            <View style={styles.demoCredentialsBox}>
              <View style={styles.demoBoxHeader}>
                <Ionicons name="information-circle-outline" size={13} color={colors.brand.primary} />
                <Text style={styles.demoBoxLabel}>Demo credentials:</Text>
              </View>
              <Text style={styles.demoBoxText}>{config.demoId}</Text>
              <Text style={styles.demoBoxText}>{config.demoPassword}</Text>
            </View>

            {/* Login Button */}
            <PrimaryButton
              title={isLoading ? 'Authenticating...' : config.buttonTitle}
              onPress={handleLogin}
              loading={isLoading}
              iconName="log-in-outline"
              style={styles.submitBtn}
            />

            {/* Prototype Disclaimer Banner */}
            <View style={styles.disclaimerBanner}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.brand.primary} style={{ marginTop: 1 }} />
              <View style={styles.disclaimerTextCol}>
                <Text style={styles.disclaimerTitle}>DEMO AUTHENTICATION</Text>
                <Text style={styles.disclaimerSubtitle}>
                  Prototype credentials only. No real government authentication is connected.
                </Text>
              </View>
            </View>
          </View>

          {/* Security Trust Footer */}
          <View style={styles.securityTrustRow}>
            <Ionicons name="shield-checkmark-outline" size={13} color={colors.text.muted} />
            <Text style={styles.securityTrustText}>
              Ministry of Social Justice & Empowerment • Government of India
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  topIdentityBar: {
    backgroundColor: colors.brand.navy,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  identityInner: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nationalMark: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  ministryIdentityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#D0D5DD',
    letterSpacing: 0.4,
  },
  systemStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  systemStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.normal,
    marginRight: 5,
  },
  systemStatusText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: typography.weights.medium,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  scrollContainerDesktop: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  contentCardWrapper: {
    width: '100%',
    maxWidth: 500,
  },
  contentCardWrapperDesktop: {
    maxWidth: 520,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: borderRadius.full,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.85)' : colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } as any) : {}),
    ...shadows.xs,
  },
  backButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  loginCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.92)' : colors.neutral.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(220, 214, 200, 0.85)',
    padding: spacing.xl,
    ...(Platform.OS === 'web' ? ({
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 20px 40px -15px rgba(40, 54, 24, 0.12), 0 0 1px 1px rgba(255, 255, 255, 0.8)',
    } as any) : shadows.md),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.brand.navyDark,
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
    marginTop: 2,
  },
  cardPromptText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 3,
  },
  autoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.brand.accent,
  },
  autoFillBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 10.5,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: spacing.md,
  },
  subInspectorInlineBar: {
    marginTop: spacing.xs,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  subInspectorInlineLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subInspectorInlineOptions: {
    gap: 6,
  },
  subOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  subOptionPillActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primaryLight,
  },
  subOptionPillText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  subOptionPillTextActive: {
    fontFamily: typography.fontFamily,
    color: colors.brand.navyDark,
    fontWeight: typography.weights.bold,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.highPriorityLight,
    borderWidth: 1,
    borderColor: colors.status.highPriorityBorder,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginBottom: spacing.md,
    gap: 7,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.status.highPriority,
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10.5,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 9,
  },
  textInput: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 6,
  },
  demoCredentialsBox: {
    backgroundColor: colors.neutral.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  demoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  demoBoxLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10.5,
    fontWeight: typography.weights.bold,
    color: colors.brand.navyDark,
    letterSpacing: 0.3,
  },
  demoBoxText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  submitBtn: {
    width: '100%',
    marginTop: 2,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.brand.primaryLight,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.brand.accent,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: spacing.md,
    gap: 8,
  },
  disclaimerTextCol: {
    flex: 1,
  },
  disclaimerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.brand.navyDark,
    letterSpacing: 0.5,
  },
  disclaimerSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.text.secondary,
    lineHeight: 14,
    marginTop: 1,
  },
  securityTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: 5,
  },
  securityTrustText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs - 1,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
});
