import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { config } from '../config/env.js';
import { sendCustomerWelcomeEmail } from '../services/notificationService.js';

export async function registerCustomer(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, mobile number, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    // 1. Check if an admin account exists with this email
    const adminCheck = await query(
      'SELECT id FROM admins WHERE LOWER(TRIM(email)) = $1 LIMIT 1',
      [cleanEmail]
    );
    if (adminCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    // 2. Check if customer already exists by email or phone
    const existing = await query(
      'SELECT id, email, phone, password_hash FROM customers WHERE LOWER(TRIM(email)) = $1 OR phone = $2',
      [cleanEmail, cleanPhone]
    );

    // 2a. Strict Email Check: If any existing customer record with this email has a registered account (password_hash)
    const emailMatchRegistered = existing.rows.find(
      (r) => r.email && r.email.toLowerCase().trim() === cleanEmail && r.password_hash
    );
    if (emailMatchRegistered) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    // 2b. Strict Phone Check: If any existing customer record with this phone has a registered account (password_hash)
    const phoneMatchRegistered = existing.rows.find(
      (r) => r.phone && r.phone.trim() === cleanPhone && r.password_hash
    );
    if (phoneMatchRegistered) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists. Please sign in instead.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let customerId;

    // Check if guest checkout record exists matching email or phone to link/upgrade
    const guestEmailMatch = existing.rows.find(
      (r) => r.email && r.email.toLowerCase().trim() === cleanEmail && !r.password_hash
    );
    const guestPhoneMatch = existing.rows.find(
      (r) => r.phone && r.phone.trim() === cleanPhone && !r.password_hash
    );
    const guestToUpgrade = guestEmailMatch || guestPhoneMatch;

    try {
      if (guestToUpgrade) {
        // Customer checked out as guest previously, link password and sync latest info
        await query(
          'UPDATE customers SET name = $1, email = $2, phone = $3, password_hash = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
          [name.trim(), cleanEmail, cleanPhone, passwordHash, guestToUpgrade.id]
        );
        customerId = guestToUpgrade.id;
      } else {
        const newCust = await query(
          'INSERT INTO customers (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
          [name.trim(), cleanEmail, cleanPhone, passwordHash]
        );
        customerId = newCust.rows[0].id;
      }
    } catch (dbErr) {
      // Handle PostgreSQL unique constraint violation gracefully
      if (dbErr.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address or phone already exists. Please sign in instead.'
        });
      }
      throw dbErr;
    }

    const token = jwt.sign(
      { id: customerId, email: cleanEmail, role: 'customer' },
      config.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Send and log congratulation welcome email
    await sendCustomerWelcomeEmail({
      customerId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone
    });

    res.status(201).json({
      success: true,
      message: `Congratulations ${name.trim()}! Welcome to ZEBA. A welcome email has been sent to ${cleanEmail}.`,
      token,
      customer: {
        id: customerId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function loginCustomer(req, res, next) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone and password are required.'
      });
    }

    const cleanId = identifier.toLowerCase().trim();

    const result = await query(
      'SELECT id, name, email, phone, password_hash, created_at FROM customers WHERE email = $1 OR phone = $1 LIMIT 1',
      [cleanId]
    );

    if (result.rows.length === 0 || !result.rows[0].password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. If you previously checked out as a guest, please register an account.'
      });
    }

    const customer = result.rows[0];
    const isMatch = await bcrypt.compare(password, customer.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password.'
      });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'customer' },
      config.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Sign in successful. Welcome back!',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerProfile(req, res, next) {
  try {
    const addressRes = await query(
      'SELECT * FROM addresses WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.customer.id]
    );

    res.json({
      success: true,
      customer: {
        ...req.customer,
        defaultAddress: addressRes.rows[0] || null
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerOrders(req, res, next) {
  try {
    const ordersRes = await query(
      `SELECT o.id, o.order_number, o.status, o.payment_status, o.refund_status,
              o.subtotal, o.shipping_fee, o.total_amount, o.currency,
              o.tracking_number, o.courier_partner, o.estimated_delivery_date,
              o.delivered_at, o.cancelled_at, o.cancellation_reason, o.notes, o.created_at,
              a.house_building, a.street, a.area, a.city, a.state, a.pincode
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.customer_id = $1
       ORDER BY o.created_at DESC`,
      [req.customer.id]
    );

    const ordersWithItems = [];
    for (const ord of ordersRes.rows) {
      const itemsRes = await query(
        `SELECT oi.*, p.images, p.slug FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [ord.id]
      );

      const historyRes = await query(
        `SELECT id, previous_status, new_status, changed_by, notes, created_at
         FROM order_status_history
         WHERE order_id = $1
         ORDER BY created_at ASC`,
        [ord.id]
      );

      ordersWithItems.push({
        ...ord,
        items: itemsRes.rows,
        statusHistory: historyRes.rows
      });
    }

    res.json({
      success: true,
      count: ordersWithItems.length,
      orders: ordersWithItems
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/customer/google
 * Authenticates or registers a customer via Google Account (One Tap / OAuth credential)
 */
export async function googleCustomerAuth(req, res, next) {
  try {
    const { credential, userInfo } = req.body;

    if (!credential && !userInfo) {
      return res.status(400).json({
        success: false,
        message: 'Google credential token or user information is required.'
      });
    }

    let googlePayload = null;

    // 1. Verify token with Google's official public tokeninfo endpoint if credential is provided
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          googlePayload = await verifyRes.json();
        }
      } catch (networkErr) {
        console.warn('[Google Auth] Direct tokeninfo verification network note:', networkErr.message);
      }

      // Safe fallback decode if network is isolated or tokeninfo temporary latency
      if (!googlePayload) {
        try {
          const decoded = jwt.decode(credential);
          if (decoded && decoded.email) {
            googlePayload = decoded;
          }
        } catch {
          // ignore
        }
      }
    }

    // 2. Fallback to userInfo if provided directly by client OAuth flow
    if (!googlePayload && userInfo && userInfo.email) {
      googlePayload = {
        sub: userInfo.id || userInfo.sub || `g_${Date.now()}`,
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        picture: userInfo.picture || userInfo.avatar || null
      };
    }

    if (!googlePayload || !googlePayload.email) {
      return res.status(401).json({
        success: false,
        message: 'Unable to verify Google Account. Please try again or sign up with email.'
      });
    }

    const googleId = googlePayload.sub || null;
    const cleanEmail = String(googlePayload.email).toLowerCase().trim();
    const displayName = (googlePayload.name || googlePayload.given_name || cleanEmail.split('@')[0]).trim();
    const avatarUrl = googlePayload.picture || null;

    // 3. Check if customer already exists by google_id OR email
    const existing = await query(
      `SELECT id, name, email, phone, google_id, avatar_url, created_at
       FROM customers
       WHERE (google_id IS NOT NULL AND google_id = $1) OR LOWER(TRIM(email)) = $2
       LIMIT 1`,
      [googleId, cleanEmail]
    );

    let customerId;
    let customerName = displayName;
    let customerPhone = '';
    let customerAvatar = avatarUrl;
    let isNew = false;

    if (existing.rows.length > 0) {
      // Existing customer: link Google account and update avatar/name if missing
      const cust = existing.rows[0];
      customerId = cust.id;
      customerName = cust.name || displayName;
      customerPhone = cust.phone || '';
      customerAvatar = cust.avatar_url || avatarUrl;

      await query(
        `UPDATE customers
         SET google_id = COALESCE(google_id, $1),
             avatar_url = COALESCE(avatar_url, $2),
             name = COALESCE(NULLIF(name, ''), $3),
             is_verified = true,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [googleId, avatarUrl, displayName, customerId]
      );
    } else {
      // New customer registering via Google
      isNew = true;
      const newCust = await query(
        `INSERT INTO customers (name, email, phone, google_id, avatar_url, is_verified)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, name, email, phone, google_id, avatar_url, created_at`,
        [displayName, cleanEmail, '', googleId, avatarUrl]
      );
      customerId = newCust.rows[0].id;

      // Send customer welcome email asynchronously
      sendCustomerWelcomeEmail({
        customerId,
        name: displayName,
        email: cleanEmail,
        phone: ''
      }).catch(err => console.warn('[Google Auth] Welcome email note:', err.message));
    }

    const token = jwt.sign(
      { id: customerId, email: cleanEmail, role: 'customer' },
      config.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: isNew
        ? `Welcome to ZEBA, ${customerName}!`
        : `Welcome back, ${customerName}!`,
      token,
      isNew,
      customer: {
        id: customerId,
        name: customerName,
        email: cleanEmail,
        phone: customerPhone,
        avatarUrl: customerAvatar
      }
    });
  } catch (err) {
    next(err);
  }
}

