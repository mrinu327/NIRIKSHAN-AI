/**
 * Role definitions for SIH26095
 */

export type UserRole = 'official' | 'inspector' | 'ngo';

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
}
