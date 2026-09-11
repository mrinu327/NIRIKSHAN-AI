import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Role, User } from '@nirikshan/shared-types';

export interface DemoAccount {
  role: Role;
  label: string;
  sublabel: string;
  designation: string;
  user: User;
}

export const DEMO_ACCOUNTS: Record<Role, DemoAccount> = {
  [Role.OFFICIAL]: {
    role: Role.OFFICIAL,
    label: 'DoSJE Official',
    sublabel: 'Central Monitoring Division',
    designation: 'Director - Monitoring & Inspection, DoSJE',
    user: {
      id: 'usr-official-001',
      name: 'Dr. Rajesh Sharma',
      role: Role.OFFICIAL,
      phone: '+919876543210',
      email: 'official@dosje.gov.in',
      state: 'Delhi',
      district: 'New Delhi',
      active: true,
    },
  },
  [Role.INSPECTOR]: {
    role: Role.INSPECTOR,
    label: 'Field Inspector / PMU',
    sublabel: 'Surprise Field Inspection Unit',
    designation: 'Senior PMU Field Verification Officer',
    user: {
      id: 'usr-inspector-001',
      name: 'Priya Verma',
      role: Role.INSPECTOR,
      phone: '+919876543211',
      email: 'inspector@pmu.gov.in',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      active: true,
    },
  },
  [Role.NGO]: {
    role: Role.NGO,
    label: 'NGO / Institute In-charge',
    sublabel: 'Scheme-Supported Partner Facility',
    designation: 'Managing Trustee, Hope Foundation Trust',
    user: {
      id: 'usr-ngo-001',
      name: 'Amit Sundaram',
      role: Role.NGO,
      phone: '+919876543212',
      email: 'incharge@welfaretrust.org',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      active: true,
    },
  },
  [Role.BENEFICIARY]: {
    role: Role.BENEFICIARY,
    label: 'Beneficiary',
    sublabel: 'Verified Direct Citizen Participant',
    designation: 'Registered Scheme Beneficiary (#BEN-2026-881)',
    user: {
      id: 'usr-beneficiary-001',
      name: 'Ramesh Kumar',
      role: Role.BENEFICIARY,
      phone: '+919876543213',
      email: 'ramesh.kumar@beneficiary.in',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      active: true,
    },
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  isDemoMode: boolean;
  login: (emailOrPhone: string, password?: string) => Promise<boolean>;
  loginDemo: (role: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      isDemoMode: true,

      login: async (emailOrPhone: string, _password?: string) => {
        // Find matching demo account or default to Official
        const lower = emailOrPhone.toLowerCase();
        let matchedRole = Role.OFFICIAL;

        if (lower.includes('inspector') || lower.includes('pmu')) {
          matchedRole = Role.INSPECTOR;
        } else if (lower.includes('ngo') || lower.includes('incharge')) {
          matchedRole = Role.NGO;
        } else if (lower.includes('beneficiary') || lower.includes('citizen')) {
          matchedRole = Role.BENEFICIARY;
        }

        const demoAccount = DEMO_ACCOUNTS[matchedRole];
        set({
          user: demoAccount.user,
          token: `demo-token-${demoAccount.role.toLowerCase()}-${Date.now()}`,
          isAuthenticated: true,
          role: demoAccount.role,
          isDemoMode: true,
        });
        return true;
      },

      loginDemo: (role: Role) => {
        const demoAccount = DEMO_ACCOUNTS[role];
        set({
          user: demoAccount.user,
          token: `demo-token-${role.toLowerCase()}-${Date.now()}`,
          isAuthenticated: true,
          role: role,
          isDemoMode: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null,
        });
      },

      switchRole: (role: Role) => {
        const demoAccount = DEMO_ACCOUNTS[role];
        set({
          user: demoAccount.user,
          token: `demo-token-${role.toLowerCase()}-${Date.now()}`,
          role: role,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'nirikshan-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
