import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { query } from '../config/db.js';

export async function requireCustomerAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to your ZEBA account.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (decoded.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Invalid customer token.'
      });
    }

    const result = await query(
      'SELECT id, name, email, phone, created_at FROM customers WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Customer account not found.'
      });
    }

    req.customer = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please sign in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
}

export async function optionalCustomerAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);
      if (decoded.role === 'customer') {
        const result = await query(
          'SELECT id, name, email, phone, created_at FROM customers WHERE id = $1',
          [decoded.id]
        );
        if (result.rows.length > 0) {
          req.customer = result.rows[0];
        }
      }
    }
  } catch (e) {
    // Ignore invalid optional tokens
  }
  next();
}

export async function optionalUserOrAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);

      if (decoded.role === 'admin' || decoded.role === 'superadmin') {
        const adminRes = await query(
          'SELECT id, username, email, role, created_at FROM admins WHERE id = $1',
          [decoded.id]
        );
        if (adminRes.rows.length > 0) {
          req.admin = adminRes.rows[0];
        }
      } else if (decoded.role === 'customer') {
        const custRes = await query(
          'SELECT id, name, email, phone, created_at FROM customers WHERE id = $1',
          [decoded.id]
        );
        if (custRes.rows.length > 0) {
          req.customer = custRes.rows[0];
        }
      }
    }
  } catch (e) {
    // Ignore invalid optional tokens
  }
  next();
}


