/**
 * Role definitions for SIH26095
 */

export type UserRole = 'official' | 'inspector' | 'ngo';
export type UserRoleUppercase = 'OFFICIAL' | 'INSPECTOR' | 'NGO';

export interface RoleConfig {
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  department: string;
  badgeLabel: string;
  iconName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  department?: string;
  organization: string;
  email: string;
  assignedLocation?: string;
  badgeId: string;
  institutionScope?: string;
}

export interface AuthSession {
  userId: string;
  displayName: string;
  role: UserRole;
  designation: string;
  department?: string;
  organization: string;
  email: string;
  badgeId: string;
  assignedLocation?: string;
  institutionScope?: string;
  loginTimestamp: string;
  isAuthenticated: boolean;
}
