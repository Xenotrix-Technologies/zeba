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
    const adminToken = localStorage.getItem('zeba_admin_token');
    const customerToken = localStorage.getItem('zeba_customer_token');
    const url = config.url || '';

    if (url.includes('/customer')) {
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }
    } else if (url.includes('/admin') || url.includes('/auth')) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`;
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
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        message = 'Unable to connect to the server. Please check your internet connection or try again shortly.';
      } else {
        message = error.message || 'An unexpected error occurred.';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
