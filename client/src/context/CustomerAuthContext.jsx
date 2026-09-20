import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const { addToast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('zeba_customer_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyCustomer() {
      if (!token) {
        setCustomer(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/customer/me');
        if (res.success && res.customer) {
          setCustomer(res.customer);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Customer token verification failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifyCustomer();
  }, [token]);

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/customer/login', { identifier, password });
      if (res.success && res.token) {
        localStorage.setItem('zeba_customer_token', res.token);
        setToken(res.token);
        setCustomer(res.customer);
        addToast(res.message || 'Welcome back to ZEBA!', 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Sign in failed.' };
    } catch (err) {
      const msg = err.message || 'Invalid credentials.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await api.post('/customer/register', { name, email, phone, password });
      if (res.success && res.token) {
        localStorage.setItem('zeba_customer_token', res.token);
        setToken(res.token);
        setCustomer(res.customer);
        addToast(res.message || 'Welcome to ZEBA!', 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('zeba_customer_token');
    setToken(null);
    setCustomer(null);
    addToast('Signed out of your account.', 'info');
  };

  return (
    <CustomerAuthContext.Provider value={{
      customer,
      token,
      loading,
      isCustomerAuthenticated: Boolean(token && customer),
      login,
      register,
      logout
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
