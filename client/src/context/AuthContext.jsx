import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { addToast } = useToast();
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('zeba_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('zeba_admin_token') || null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('zeba_admin_token')));
  const freshlyLoggedInRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      if (!token) {
        if (isMounted) {
          setAdmin(null);
          setLoading(false);
        }
        return;
      }

      // If user just logged in this second, token & user payload are already verified from login()
      if (freshlyLoggedInRef.current) {
        freshlyLoggedInRef.current = false;
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (isMounted) {
          if (res && res.success && res.admin) {
            setAdmin(res.admin);
            localStorage.setItem('zeba_admin_user', JSON.stringify(res.admin));
          } else if (res && res.success === false) {
            logout(false);
          }
        }
      } catch (err) {
        console.warn('Auth token verification note:', err.message);
        const isExpiredOrInvalid = err.message && (
          err.message.toLowerCase().includes('token expired') ||
          err.message.toLowerCase().includes('invalid token') ||
          err.message.toLowerCase().includes('admin user not found')
        );
        if (isExpiredOrInvalid && isMounted) {
          logout(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        freshlyLoggedInRef.current = true;
        localStorage.setItem('zeba_admin_token', res.token);
        if (res.admin) {
          localStorage.setItem('zeba_admin_user', JSON.stringify(res.admin));
        }
        setAdmin(res.admin);
        setToken(res.token);
        setLoading(false);
        addToast('Admin login successful.', 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err) {
      addToast(err.message || 'Invalid credentials.', 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = (notify = true) => {
    localStorage.removeItem('zeba_admin_token');
    localStorage.removeItem('zeba_admin_user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    setToken(null);
    setAdmin(null);
    if (notify) {
      addToast('Logged out of Admin panel.', 'info');
    }
  };

  return (
    <AuthContext.Provider value={{
      admin,
      token,
      loading,
      isAuthenticated: Boolean(token && admin),
      login,
      logout
    }}>
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
