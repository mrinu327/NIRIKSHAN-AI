import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Role } from '@nirikshan/shared-types';
import { useAuthStore } from '../src/store/useAuthStore';
import { colors, typography } from '../src/constants/theme';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    // Small timeout to allow Zustand hydrate from AsyncStorage
    const timer = setTimeout(() => {
      if (isAuthenticated && role) {
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
          default:
            router.replace('/(auth)/login');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isAuthenticated, role]);

  return (
    <View style={styles.container}>
      <View style={styles.emblemBadge}>
        <Text style={styles.emblemText}>🏛️</Text>
      </View>
      <Text style={styles.govText}>GOVERNMENT OF INDIA</Text>
      <Text style={styles.title}>NIRIKSHAN AI</Text>
      <Text style={styles.subtitle}>Monitor. Verify. Act.</Text>
      <ActivityIndicator size="large" color={colors.white} style={styles.spinner} />
      <Text style={styles.loadingText}>Initializing Government Gateway...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emblemBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emblemText: {
    fontSize: 32,
  },
  govText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  spinner: {
    marginTop: 36,
    marginBottom: 12,
  },
  loadingText: {
    color: '#E2E8F0',
    fontSize: typography.fontSize.xs,
    letterSpacing: 0.5,
  },
});
