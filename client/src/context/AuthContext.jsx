import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check current session from /api/auth/me using credentials (httpOnly cookie)
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSessionExpired(false);
      } else {
        if (user) {
          // If we had a user and now 401, session expired
          setSessionExpired(true);
        }
        setUser(null);
      }
    } catch (err) {
      console.warn('[Auth] Session check failed:', err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, []);

  // Register student account
  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      setSessionExpired(false);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Login student account
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setSessionExpired(false);
      return { success: true, user: data.user };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout student account
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (err) {
      console.error('[Auth] Logout error:', err);
    } finally {
      setUser(null);
      setSessionExpired(false);
    }
  };

  // Update student profile
  const updateProfile = async (profileData) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) setSessionExpired(true);
        throw new Error(data.message || 'Failed to update profile');
      }

      setUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) setSessionExpired(true);
        throw new Error(data.message || 'Failed to change password');
      }

      return { success: true, message: data.message };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const clearError = () => setAuthError(null);
  const dismissSessionExpired = () => setSessionExpired(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        sessionExpired,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        checkAuth,
        clearError,
        dismissSessionExpired,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
