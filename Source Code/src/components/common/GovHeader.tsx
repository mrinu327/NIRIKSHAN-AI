import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Role } from '@nirikshan/shared-types';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { useAuthStore, DEMO_ACCOUNTS } from '../../store/useAuthStore';
import { RoleBadge } from './RoleBadge';
import { DemoBanner } from './DemoBanner';

interface GovHeaderProps {
  title?: string;
  subtitle?: string;
  showUserSnippet?: boolean;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  title = 'NIRIKSHAN AI',
  subtitle = 'Centralized Monitoring & Surprise Inspection',
  showUserSnippet = true,
}) => {
  const router = useRouter();
  const { user, role, logout, switchRole } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);

  const handleRoleSelect = (newRole: Role) => {
    switchRole(newRole);
    setModalVisible(false);
    // Route to appropriate role screen
    switch (newRole) {
      case Role.OFFICIAL:
        router.replace('/(official)/dashboard');
        break;
      case Role.INSPECTOR:
        router.replace('/(inspector)/assignments');
        break;
      case Role.NGO:
        router.replace('/(ngo)/home');
        break;
      case Role.BENEFICIARY:
        router.replace('/(beneficiary)/verification');
        break;
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.wrapper}>
      <DemoBanner />

      <View style={styles.header}>
        <View style={styles.leftContainer}>
          <View style={styles.govPill}>
            <Text style={styles.govPillText}>GOVT OF INDIA • DoSJE</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {showUserSnippet && (
          <View style={styles.rightContainer}>
            {role && <RoleBadge role={role} size="sm" />}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.switchButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.switchButtonText}>Switch Role</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Role Switcher Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Switch Active Role</Text>
                <Text style={styles.modalSubtitle}>
                  Choose a demo persona to test role-specific workflows
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.roleList}>
              {Object.values(DEMO_ACCOUNTS).map((item) => {
                const isCurrent = role === item.role;
                return (
                  <TouchableOpacity
                    key={item.role}
                    activeOpacity={0.8}
                    style={[
                      styles.roleCard,
                      isCurrent && styles.roleCardActive,
                    ]}
                    onPress={() => handleRoleSelect(item.role)}
                  >
                    <View style={styles.roleCardTop}>
                      <RoleBadge role={item.role} />
                      {isCurrent && (
                        <View style={styles.activePill}>
                          <Text style={styles.activePillText}>Active</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.roleName}>{item.user.name}</Text>
                    <Text style={styles.roleDesignation}>
                      {item.designation}
                    </Text>
                    <Text style={styles.roleDistrict}>
                      📍 {item.user.district}, {item.user.state}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
              >
                <Text style={styles.logoutBtnText}>Logout to Login Screen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.primary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftContainer: {
    flex: 1,
  },
  govPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  govPillText: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  title: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  switchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  switchButtonText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: spacing.base,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    maxHeight: '85%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  roleList: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  roleCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  roleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  activePillText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  roleName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  roleDesignation: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleDistrict: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    fontWeight: '500',
    marginTop: 4,
  },
  modalFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
});
