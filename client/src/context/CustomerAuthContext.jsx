import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
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
        const res = await axios.get('/api/customer/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success && res.data?.customer) {
          setCustomer(res.data.customer);
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
      const res = await axios.post('/api/customer/login', { identifier, password });
      if (res.data?.success && res.data?.token) {
        localStorage.setItem('zeba_customer_token', res.data.token);
        setToken(res.data.token);
        setCustomer(res.data.customer);
        addToast(res.data.message || 'Welcome back to ZEBA!', 'success');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Sign in failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await axios.post('/api/customer/register', { name, email, phone, password });
      if (res.data?.success && res.data?.token) {
        localStorage.setItem('zeba_customer_token', res.data.token);
        setToken(res.data.token);
        setCustomer(res.data.customer);
        addToast(res.data.message || 'Welcome to ZEBA!', 'success');
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
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
