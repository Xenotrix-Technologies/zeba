import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization token
api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const adminToken = localStorage.getItem('zeba_admin_token') || localStorage.getItem('adminToken') || localStorage.getItem('token');
    const customerToken = localStorage.getItem('zeba_customer_token') || localStorage.getItem('customerToken');
    const url = config.url || '';

    // Do not attach tokens to public auth login/register endpoints
    if (url.includes('/login') || url.includes('/register')) {
      return config;
    }

    if (url.includes('/admin')) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      } else if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }
    } else if (url.includes('/customer')) {
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      } else if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // General routes (/orders, /payments, /reviews, etc.)
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      } else if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.response?.data?.message;
    if (!message) {
      if (error.response?.status === 404) {
        message = 'The requested service endpoint was not found (404).';
      } else if (error.response?.status === 500 && (!error.response.data || typeof error.response.data === 'string')) {
        message = 'Backend API is unreachable. Please verify that the backend server is running on port 5000.';
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        message = 'Unable to connect to the backend server. Please check your connection and ensure the server is running.';
      } else {
        message = error.message || 'An unexpected error occurred.';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
