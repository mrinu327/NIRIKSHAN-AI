/**
 * Mock Authentication Service
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Provides typed session management, zero-friction demo role switching,
 * event pub/sub, and cross-service demo reset orchestration.
 */

import { UserRole, UserRoleUppercase, UserProfile, RoleConfig, AuthSession } from '../../types/role';
import { DEMO_ROLES, DEMO_PROFILES } from '../../data/mockData';
import { mockInspectionService } from './mockInspectionService';
import { mockAttendanceService } from './mockAttendanceService';
import { mockAlertService } from './mockAlertService';
import { mockProjectService } from './mockProjectService';
import { mockNgoService } from './mockNgoService';
import { mockOfficialService } from './mockOfficialService';

export const DEMO_CREDENTIALS: Record<
  UserRole,
  { loginId: string; password: string; profileKey: string; role: UserRole }
> = {
  official: {
    loginId: 'official@nirikshan.gov',
    password: 'Official@123',
    profileKey: 'official',
    role: 'official',
  },
  inspector: {
    loginId: 'inspector@nirikshan.gov',
    password: 'Inspector@123',
    profileKey: 'inspector_a',
    role: 'inspector',
  },
  ngo: {
    loginId: 'ngo@nirikshan.org',
    password: 'NGO@123',
    profileKey: 'ngo',
    role: 'ngo',
  },
};

export class MockAuthService {
  private session: AuthSession | null = null;
  private listeners: Array<(session: AuthSession | null) => void> = [];

  subscribe(listener: (session: AuthSession | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l(this.session);
      } catch (err) {
        console.error('Auth listener error:', err);
      }
    });
  }

  getSession(): AuthSession | null {
    return this.session ? { ...this.session } : null;
  }

  getCurrentRole(): UserRole | null {
    return this.session ? this.session.role : null;
  }

  isAuthenticated(): boolean {
    return Boolean(this.session && this.session.isAuthenticated);
  }

  async getAvailableRoles(): Promise<RoleConfig[]> {
    return DEMO_ROLES;
  }

  /**
   * Validate role-specific credentials and authenticate session.
   * Throws 'Invalid Login ID or Password' on any mismatch, empty value, or cross-role credential attempt.
   */
  async loginWithCredentials(
    loginId: string,
    password: string,
    selectedRole: UserRole,
    specificProfileKey?: string
  ): Promise<AuthSession> {
    if (!loginId || !loginId.trim() || !password) {
      throw new Error('Invalid Login ID or Password');
    }

    const expectedCred = DEMO_CREDENTIALS[selectedRole];
    if (!expectedCred) {
      throw new Error('Invalid Login ID or Password');
    }

    // Role-specific credential validation
    const normalizedInput = loginId.trim().toLowerCase();
    const normalizedExpected = expectedCred.loginId.toLowerCase();

    // Password must match exactly (case-sensitive)
    if (normalizedInput !== normalizedExpected || password !== expectedCred.password) {
      throw new Error('Invalid Login ID or Password');
    }

    const lookupKey = specificProfileKey || expectedCred.profileKey || selectedRole;
    return this.login(selectedRole, lookupKey);
  }

  async login(roleInput: UserRole | UserRoleUppercase | string, specificProfileKey?: string): Promise<AuthSession> {
    const roleKey = (roleInput || '').toLowerCase() as UserRole;
    const lookupKey = specificProfileKey || roleKey;
    const profile = DEMO_PROFILES[lookupKey] || DEMO_PROFILES[roleKey];

    if (!profile) {
      throw new Error(`Invalid stakeholder role selected: ${roleInput}`);
    }

    const timeStr =
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' Today';

    this.session = {
      userId: profile.id,
      displayName: profile.name,
      role: profile.role,
      designation: profile.designation,
      department: profile.department,
      organization: profile.organization,
      email: profile.email,
      badgeId: profile.badgeId,
      assignedLocation: profile.assignedLocation,
      institutionScope:
        profile.institutionScope ||
        (profile.role === 'ngo' ? 'Sunrise Rehabilitation Centre (PRJ-101)' : undefined),
      loginTimestamp: timeStr,
      isAuthenticated: true,
    };

    this.notify();
    return { ...this.session };
  }

  // Backward-compatible role login returning UserProfile
  async loginAsRole(role: UserRole, specificProfileKey?: string): Promise<UserProfile> {
    await this.login(role, specificProfileKey);
    const profile = DEMO_PROFILES[specificProfileKey || role] || DEMO_PROFILES[role];
    return profile;
  }

  async loginAsProfile(profileKey: string): Promise<UserProfile> {
    const profile = DEMO_PROFILES[profileKey];
    if (!profile) {
      throw new Error(`Invalid profile selected: ${profileKey}`);
    }
    await this.login(profile.role, profileKey);
    return profile;
  }

  async getProfile(role: UserRole): Promise<UserProfile> {
    return DEMO_PROFILES[role] || DEMO_PROFILES.official;
  }

  async logout(): Promise<void> {
    this.session = null;
    this.notify();
  }

  /**
   * Safe Demo Reset: Restores baseline data state across all singleton services
   */
  async resetAllDemoData(): Promise<void> {
    await Promise.all([
      mockInspectionService.reset(),
      mockAttendanceService.reset(),
      mockAlertService.reset(),
      mockProjectService.reset(),
      mockNgoService.reset(),
      mockOfficialService.reset(),
    ]);

    // Keep active session intact if logged in, just refresh
    this.notify();
  }
}

export const mockAuthService = new MockAuthService();

