import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthSession } from '../types';

export const GUEST_DURATION_SECONDS = 120; // 2 minutes maximum guest session

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  // Guest Mode Features
  isGuest: boolean;
  guestSecondsRemaining: number;
  isGuestExpired: boolean;
  resetGuestSession: () => void;
  // Auth Operations
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
  }) => Promise<{ success: boolean; error?: string }>;
  forgotPasswordVerify: (
    identifier: string,
    securityAnswer?: string
  ) => Promise<{ step: 'QUESTION' | 'VERIFIED'; securityQuestion?: string; resetToken?: string; error?: string }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
    securityQuestion?: string;
    securityAnswer?: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  quickDemoLogin: (role: 'admin' | 'user') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vsa_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Guest Mode State (120 seconds default, stored in sessionStorage for persistence across tab refresh)
  const [guestSecondsRemaining, setGuestSecondsRemaining] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem('vsa_guest_remaining_seconds');
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        return isNaN(parsed) ? GUEST_DURATION_SECONDS : Math.max(0, parsed);
      }
    } catch (_) {}
    return GUEST_DURATION_SECONDS;
  });

  const isAuthenticated = Boolean(user);
  const isGuest = !isAuthenticated;
  const isGuestExpired = !isAuthenticated && !loading && guestSecondsRemaining <= 0;

  // Countdown timer for Guest Mode
  useEffect(() => {
    if (isAuthenticated || loading) return;

    if (guestSecondsRemaining <= 0) {
      sessionStorage.setItem('vsa_guest_remaining_seconds', '0');
      return;
    }

    const interval = setInterval(() => {
      setGuestSecondsRemaining((prev) => {
        const nextVal = Math.max(0, prev - 1);
        try {
          sessionStorage.setItem('vsa_guest_remaining_seconds', nextVal.toString());
        } catch (_) {}
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loading, guestSecondsRemaining]);

  const resetGuestSession = () => {
    setGuestSecondsRemaining(GUEST_DURATION_SECONDS);
    try {
      sessionStorage.setItem('vsa_guest_remaining_seconds', GUEST_DURATION_SECONDS.toString());
    } catch (_) {}
  };

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('vsa_auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
          // User authenticated: remove guest timer
          sessionStorage.removeItem('vsa_guest_remaining_seconds');
        } else {
          // Token expired or invalid
          localStorage.removeItem('vsa_auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify authentication token:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem('vsa_auth_token', data.token);
      sessionStorage.removeItem('vsa_guest_remaining_seconds');
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const signup = async (formData: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
  }) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      localStorage.setItem('vsa_auth_token', data.token);
      sessionStorage.removeItem('vsa_guest_remaining_seconds');
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during signup' };
    }
  };

  const forgotPasswordVerify = async (identifier: string, securityAnswer?: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, securityAnswer }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { step: 'QUESTION', error: data.error || 'Verification failed' };
      }

      return data;
    } catch (err: any) {
      return { step: 'QUESTION', error: err.message || 'Network error' };
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Password reset failed' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Profile update failed' };
      }

      setUser(resData.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
    securityQuestion?: string;
    securityAnswer?: string;
  }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to change password' };
      }

      return { success: true, message: resData.message || 'Password updated successfully' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('vsa_auth_token');
    sessionStorage.removeItem('vsa_guest_remaining_seconds');
    setToken(null);
    setUser(null);
    setGuestSecondsRemaining(GUEST_DURATION_SECONDS);
  };

  const isSuperAdmin = Boolean(
    user && (user.role === 'super_admin' || user.email?.toLowerCase() === 'vishalkumar20102009@gmail.com')
  );
  const isAdmin = Boolean(
    user && (user.role === 'super_admin' || user.role === 'admin' || user.email?.toLowerCase() === 'vishalkumar20102009@gmail.com')
  );

  const quickDemoLogin = async (role: 'admin' | 'user') => {
    if (role === 'user') {
      await login('user@vsa.ai', 'User@123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        isSuperAdmin,
        loading,
        isGuest,
        guestSecondsRemaining,
        isGuestExpired,
        resetGuestSession,
        login,
        signup,
        forgotPasswordVerify,
        resetPassword,
        updateProfile,
        changePassword,
        logout,
        quickDemoLogin,
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
