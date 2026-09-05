/**
 * Authentication & Role Context
 * SIH26095 | MoSJE
 *
 * Provides active role state, role switching, and user profile data across the app.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserProfile } from '../types/role';
import { mockAuthService } from '../services/mock/mockAuthService';

interface AuthContextType {
  currentRole: UserRole | null;
  currentUser: UserProfile | null;
  isLoading: boolean;
  selectRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const profile = await mockAuthService.loginAsRole(role);
      setCurrentRole(role);
      setCurrentUser(profile);
    } catch (err) {
      console.error('Failed to select role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await mockAuthService.logout();
      setCurrentRole(null);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = () => {
    setCurrentRole(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUser,
        isLoading,
        selectRole,
        logout,
        switchRole,
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
