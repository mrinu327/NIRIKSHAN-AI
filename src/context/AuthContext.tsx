/**
 * Authentication & Role Context
 * SIH26095 | MoSJE
 *
 * Provides active role state, role switching, and user profile data across the app.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserRoleUppercase, UserProfile, AuthSession } from '../types/role';
import { mockAuthService } from '../services/mock/mockAuthService';
import { DEMO_PROFILES } from '../data/mockData';

interface AuthContextType {
  currentRole: UserRole | null;
  currentUser: UserProfile | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithCredentials: (
    loginId: string,
    password: string,
    selectedRole: UserRole,
    specificProfileKey?: string
  ) => Promise<boolean>;
  selectRole: (role: UserRole | UserRoleUppercase | string, specificProfileKey?: string) => Promise<void>;
  switchInspectorProfile: (profileKey: 'inspector_a' | 'inspector_b') => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (targetRole?: unknown) => Promise<void> | void;
  resetDemoData: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Sync with mockAuthService pub/sub
    const unsubscribe = mockAuthService.subscribe((activeSession) => {
      setSession(activeSession);
      if (activeSession) {
        setCurrentRole(activeSession.role);
        const profile = DEMO_PROFILES[activeSession.role];
        setCurrentUser(profile || null);
      } else {
        setCurrentRole(null);
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const loginWithCredentials = async (
    loginId: string,
    password: string,
    selectedRole: UserRole,
    specificProfileKey?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const activeSession = await mockAuthService.loginWithCredentials(
        loginId,
        password,
        selectedRole,
        specificProfileKey
      );
      setSession(activeSession);
      setCurrentRole(activeSession.role);
      const profile =
        DEMO_PROFILES[specificProfileKey || activeSession.role] ||
        DEMO_PROFILES[activeSession.role];
      setCurrentUser(profile);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const selectRole = async (roleInput: UserRole | UserRoleUppercase | string, specificProfileKey?: string) => {
    setIsLoading(true);
    try {
      const activeSession = await mockAuthService.login(roleInput, specificProfileKey);
      setSession(activeSession);
      setCurrentRole(activeSession.role);
      const profile = DEMO_PROFILES[specificProfileKey || activeSession.role] || DEMO_PROFILES[activeSession.role];
      setCurrentUser(profile);
    } catch (err) {
      console.error('Failed to select role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchInspectorProfile = async (profileKey: 'inspector_a' | 'inspector_b') => {
    setIsLoading(true);
    try {
      const activeSession = await mockAuthService.login('inspector', profileKey);
      setSession(activeSession);
      setCurrentRole('inspector');
      const profile = DEMO_PROFILES[profileKey];
      setCurrentUser(profile);
    } catch (err) {
      console.error('Failed to switch inspector profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await mockAuthService.logout();
      setSession(null);
      setCurrentRole(null);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async () => {
    setIsLoading(true);
    try {
      await mockAuthService.logout();
      setSession(null);
      setCurrentRole(null);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemoData = async () => {
    setIsLoading(true);
    try {
      await mockAuthService.resetAllDemoData();
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = Boolean(currentRole && currentUser && session?.isAuthenticated);

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUser,
        session,
        isAuthenticated,
        isLoading,
        loginWithCredentials,
        selectRole,
        switchInspectorProfile,
        logout,
        switchRole,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

