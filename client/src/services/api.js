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

    // Do not attach tokens to public login/register endpoints
    if (
      url.endsWith('/login') ||
      url.endsWith('/register') ||
      url.includes('/auth/login') ||
      url.includes('/customer/login') ||
      url.includes('/customer/register')
    ) {
      return config;
    }

    const isAdminPath = typeof window !== 'undefined' && window.location && window.location.pathname.startsWith('/admin');
    const isAdminEndpoint = (
      url.startsWith('/admin') ||
      url.includes('/admin/') ||
      url.startsWith('/auth') ||
      url.includes('/auth/') ||
      url === '/auth/me' ||
      url === '/auth/change-password' ||
      (isAdminPath && (url.includes('/settings') || url.startsWith('/settings')))
    );
    const isCustomerEndpoint = (
      url.startsWith('/customer') ||
      url.includes('/customer/') ||
      url === '/customer/me' ||
      url === '/customer/orders'
    );

    if (isAdminEndpoint) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else if (isCustomerEndpoint) {
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }
    } else if (isAdminPath) {
      // Any request initiated while on admin panel pages
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      } else if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }
    } else {
      // General storefront routes (/orders, /payments, /reviews, etc.)
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
  (response) => {
    // Invalidate caches when mutations occur
    const method = response.config?.method?.toLowerCase();
    const url = response.config?.url || '';
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      if (url.includes('/reviews')) api.invalidateCache('/reviews');
      if (url.includes('/products')) api.invalidateCache('/products');
      if (url.includes('/settings')) api.invalidateCache('/settings');
      if (url.includes('/faqs')) api.invalidateCache('/faqs');
      if (url.includes('/content')) api.invalidateCache('/content');
    }
    return response.data;
  },
  (error) => {
    // Pass through aborted requests cleanly
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

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

// In-Flight Request Deduplication & In-Memory Response Caching
const inFlightRequests = new Map();
const responseCache = new Map();

function isCacheable(url, config = {}) {
  if (config.cache === false || config.noCache) return false;
  const cleanUrl = url.split('?')[0];
  // Strictly public storefront read endpoints only
  return (
    cleanUrl === '/products' ||
    cleanUrl.startsWith('/products/') ||
    cleanUrl === '/faqs' ||
    cleanUrl === '/content' ||
    cleanUrl === '/settings' ||
    cleanUrl === '/reviews'
  );
}

function getTtl(url) {
  const cleanUrl = url.split('?')[0];
  if (cleanUrl === '/settings' || cleanUrl === '/content' || cleanUrl === '/faqs') {
    return 5 * 60 * 1000; // 5 minutes
  }
  if (cleanUrl === '/reviews') {
    return 30 * 1000; // 30 seconds
  }
  return 60 * 1000; // 1 minute for products
}

const originalGet = api.get.bind(api);

api.get = function (url, config = {}) {
  const paramsKey = config.params ? JSON.stringify(config.params) : '';
  const cacheKey = `${url}__${paramsKey}`;
  const now = Date.now();

  // 1. In-memory Cache check
  if (isCacheable(url, config)) {
    const cached = responseCache.get(cacheKey);
    if (cached && now - cached.timestamp < cached.ttl) {
      return Promise.resolve(cached.data);
    }
  }

  // 2. In-flight request deduplication
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Network Request
  const requestPromise = originalGet(url, config)
    .then((data) => {
      if (isCacheable(url, config)) {
        responseCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: config.ttl || getTtl(url)
        });
      }
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

api.invalidateCache = function (prefix) {
  if (!prefix) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) {
      responseCache.delete(key);
    }
  }
};

api.getCachedData = function (url, params) {
  const paramsKey = params ? JSON.stringify(params) : '';
  const cacheKey = `${url}__${paramsKey}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
};

api.setCachedData = function (url, data, ttl = 60000, params) {
  const paramsKey = params ? JSON.stringify(params) : '';
  const cacheKey = `${url}__${paramsKey}`;
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl
  });
};

export default api;
