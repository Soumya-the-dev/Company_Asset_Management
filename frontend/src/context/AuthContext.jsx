/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const current = authService.getCurrentUser();
    if (current) {
      setUser(current);
    }
  }, []);

  async function login(identifier, password, preferredRole = 'admin') {
    setLoading(true);
    try {
      const authenticatedUser = await authService.login(identifier, password, preferredRole);
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  }

  async function registerEmployee(data) {
    setLoading(true);
    try {
      const registeredUser = await authService.registerEmployee(data);
      setUser(registeredUser);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  const role = user?.role || null;
  const isAuthenticated = !!user;
  const isAdmin = role === 'admin';
  const isEmployee = role === 'employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isEmployee,
        login,
        registerEmployee,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
