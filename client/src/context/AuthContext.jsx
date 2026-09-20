import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { addToast } = useToast();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('zeba_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.admin) {
          setAdmin(res.admin);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Auth token verification failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('zeba_admin_token', res.token);
        setToken(res.token);
        setAdmin(res.admin);
        addToast('Admin login successful.', 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err) {
      addToast(err.message || 'Invalid credentials.', 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('zeba_admin_token');
    setToken(null);
    setAdmin(null);
    addToast('Logged out of Admin panel.', 'info');
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
