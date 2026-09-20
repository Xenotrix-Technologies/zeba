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
    if (adminToken && config.url?.includes('/admin')) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (customerToken && config.url?.includes('/customer')) {
      config.headers.Authorization = `Bearer ${customerToken}`;
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
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
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default api;
