/**
 * Mock Authentication Service
 * SIH26095 | MoSJE
 *
 * FRONTEND DEMO ONLY. Provides zero-friction role switching.
 */

import { UserRole, UserProfile, RoleConfig } from '../../types/role';
import { DEMO_ROLES, DEMO_PROFILES } from '../../data/mockData';

export class MockAuthService {
  async getAvailableRoles(): Promise<RoleConfig[]> {
    return DEMO_ROLES;
  }

  async loginAsRole(role: UserRole): Promise<UserProfile> {
    const profile = DEMO_PROFILES[role];
    if (!profile) {
      throw new Error(`Invalid role selected: ${role}`);
    }
    return profile;
  }

  async getProfile(role: UserRole): Promise<UserProfile> {
    return DEMO_PROFILES[role] || DEMO_PROFILES.official;
  }

  async logout(): Promise<void> {
    // Demo cleanup
    return Promise.resolve();
  }
}

export const mockAuthService = new MockAuthService();
