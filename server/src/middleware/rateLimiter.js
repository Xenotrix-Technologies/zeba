/**
 * Lightweight sliding-window rate limiter middleware
 * Provides IP-based protection against brute-force and DDoS attacks
 */

export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // default 15 minutes
  const max = options.max || 100; // default 100 requests per window
  const message = options.message || 'Too many requests from this IP, please try again later.';
  
  // Store: Map<ip, { count: number, resetTime: number }>
  const hits = new Map();

  // Periodic cleanup of expired entries every 5 minutes to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Unref cleanup interval so it doesn't prevent process termination in tests/serverless
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return function rateLimiter(req, res, next) {
    // In test environment or health checks, bypass rate limiting if requested
    if (process.env.NODE_ENV === 'test' && req.headers['x-bypass-rate-limit']) {
      return next();
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
               req.headers['x-real-ip'] ||
               req.socket.remoteAddress ||
               '127.0.0.1';

    const now = Date.now();
    let record = hits.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      hits.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: resetSeconds
      });
    }

    next();
  };
}

// Preset Limiters for different sensitive workflows
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // 20 attempts
  message: 'Too many login or registration attempts. Please try again after 15 minutes.'
});

export const checkoutLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: 'Too many checkout or payment creation attempts. Please wait a few moments.'
});

export const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many messages submitted. Please try again after 15 minutes.'
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: 'Too many requests. Please slow down.'
});
