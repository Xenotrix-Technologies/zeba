import { query } from '../config/db.js';
import { sendCustomerStatusNotification, generateWhatsAppMessage } from '../services/notificationService.js';

/**
 * GET /api/admin/dashboard
 * Live PostgreSQL KPIs & metrics
 */
export async function getDashboardMetrics(req, res, next) {
  try {
    // 1. Order Status Counts & Total Revenue
    const orderStatsRes = await query(`
      SELECT 
        COUNT(*) AS total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
        COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_orders,
        COUNT(*) FILTER (WHERE status = 'processing') AS processing_orders,
        COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_orders,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
        COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid_orders,
        COUNT(*) FILTER (WHERE payment_status = 'failed') AS failed_payments,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) AS total_revenue
      FROM orders
    `);

    // 2. Total Customers Count
    const customerCountRes = await query('SELECT COUNT(*) AS total_customers FROM customers');

    // 3. Total Products Count & Low Stock Count
    const productCountRes = await query(`
      SELECT 
        COUNT(*) AS total_products,
        COUNT(*) FILTER (WHERE stock_quantity < 20) AS low_stock_products
      FROM products
      WHERE is_active = true
    `);

    // 4. Recent Orders (Last 6)
    const recentOrdersRes = await query(`
      SELECT o.id, o.order_number, o.status, o.payment_status, o.total_amount, o.created_at,
             c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    // 5. Contact Inquiries summary
    const msgStatsRes = await query(`
      SELECT 
        COUNT(*) AS total_messages,
        COUNT(*) FILTER (WHERE status = 'unread') AS unread_messages
      FROM contact_messages
    `);

    const stats = orderStatsRes.rows[0];

    res.json({
      success: true,
      metrics: {
        totalRevenue: parseFloat(stats.total_revenue || 0),
        totalOrders: parseInt(stats.total_orders || 0, 10),
        paidOrders: parseInt(stats.paid_orders || 0, 10),
        failedPayments: parseInt(stats.failed_payments || 0, 10),
        pendingOrders: parseInt(stats.pending_orders || 0, 10),
        confirmedOrders: parseInt(stats.confirmed_orders || 0, 10),
        processingOrders: parseInt(stats.processing_orders || 0, 10),
        shippedOrders: parseInt(stats.shipped_orders || 0, 10),
        deliveredOrders: parseInt(stats.delivered_orders || 0, 10),
        cancelledOrders: parseInt(stats.cancelled_orders || 0, 10),
        totalCustomers: parseInt(customerCountRes.rows[0]?.total_customers || 0, 10),
        totalProducts: parseInt(productCountRes.rows[0]?.total_products || 0, 10),
        lowStockProducts: parseInt(productCountRes.rows[0]?.low_stock_products || 0, 10),
        unreadMessages: parseInt(msgStatsRes.rows[0]?.unread_messages || 0, 10),
        totalMessages: parseInt(msgStatsRes.rows[0]?.total_messages || 0, 10)
      },
      recentOrders: recentOrdersRes.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/orders
 * Filter, search, paginate orders
 */
export async function getAdminOrders(req, res, next) {
  try {
    const { status, payment_status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      conditions.push(`o.status = $${paramIndex++}`);
      params.push(status);
    }

    if (payment_status && payment_status !== 'all') {
      conditions.push(`o.payment_status = $${paramIndex++}`);
      params.push(payment_status);
    }

    if (search && search.trim() !== '') {
      conditions.push(`(
        o.order_number ILIKE $${paramIndex} OR
        c.name ILIKE $${paramIndex} OR
        c.email ILIKE $${paramIndex} OR
        c.phone ILIKE $${paramIndex}
      )`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ${whereClause}
    `;
    const countRes = await query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    const ordersQuery = `
      SELECT o.id, o.order_number, o.status, o.payment_status, o.subtotal,
             o.shipping_fee, o.total_amount, o.created_at, o.updated_at,
             c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS total_items,
             (SELECT string_agg(product_name, ', ') FROM order_items WHERE order_id = o.id) AS products_summary
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const ordersRes = await query(ordersQuery, [...params, parseInt(limit, 10), offset]);

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      orders: ordersRes.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/orders/:id
 * Full detailed order view including customer notification history
 */
export async function getAdminOrderDetail(req, res, next) {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    const orderRes = isNumeric
      ? await query(
          `SELECT o.*,
                  c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
                  a.house_building, a.street, a.area, a.city, a.state, a.pincode, a.country,
                  p.razorpay_order_id, p.razorpay_payment_id, p.payment_method, p.status AS payment_record_status
           FROM orders o
           JOIN customers c ON o.customer_id = c.id
           LEFT JOIN addresses a ON o.address_id = a.id
           LEFT JOIN payments p ON o.id = p.order_id
           WHERE o.id = $1`,
          [parseInt(id, 10)]
        )
      : await query(
          `SELECT o.*,
                  c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
                  a.house_building, a.street, a.area, a.city, a.state, a.pincode, a.country,
                  p.razorpay_order_id, p.razorpay_payment_id, p.payment_method, p.status AS payment_record_status
           FROM orders o
           JOIN customers c ON o.customer_id = c.id
           LEFT JOIN addresses a ON o.address_id = a.id
           LEFT JOIN payments p ON o.id = p.order_id
           WHERE o.order_number = $1`,
          [id]
        );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = orderRes.rows[0];

    const itemsRes = await query(
      `SELECT oi.*, p.images, p.slug
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    // Fetch notification history
    let notifications = [];
    try {
      const notifRes = await query(
        `SELECT * FROM order_notifications WHERE order_id = $1 ORDER BY created_at DESC`,
        [order.id]
      );
      notifications = notifRes.rows;
    } catch (e) {
      notifications = [];
    }

    res.json({
      success: true,
      order: {
        ...order,
        items: itemsRes.rows,
        notifications
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/orders/:id/status
 * Update order status and automatically dispatch status notifications to customer
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, payment_status, notes, notify_customer = true } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (payment_status) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({ success: false, message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}` });
      }
      updates.push(`payment_status = $${paramIndex++}`);
      params.push(payment_status);
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(notes);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const updateQuery = `
      UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updatedOrder = result.rows[0];

    // Fetch customer details to send notification
    const custRes = await query(
      'SELECT name, email, phone FROM customers WHERE id = $1',
      [updatedOrder.customer_id]
    );

    let notificationResult = null;
    let whatsappLink = '';

    if (custRes.rows.length > 0) {
      const customer = custRes.rows[0];

      if (notify_customer && status) {
        notificationResult = await sendCustomerStatusNotification({
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.order_number,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          status: status || updatedOrder.status,
          paymentStatus: payment_status || updatedOrder.payment_status,
          notes: notes || updatedOrder.notes,
          totalAmount: updatedOrder.total_amount
        });
      }

      // Generate WhatsApp Direct Send Link
      const msg = generateWhatsAppMessage(
        {
          order_number: updatedOrder.order_number,
          customer_name: customer.name,
          total_amount: updatedOrder.total_amount
        },
        status || updatedOrder.status,
        notes || updatedOrder.notes
      );

      const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      whatsappLink = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    }

    res.json({
      success: true,
      message: `Order status updated to "${status || updatedOrder.status}". Customer notified successfully.`,
      order: updatedOrder,
      notification: notificationResult,
      whatsappLink
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/customers
 */
export async function getAdminCustomers(req, res, next) {
  try {
    const { search } = req.query;
    let whereClause = '';
    const params = [];

    if (search && search.trim() !== '') {
      whereClause = 'WHERE c.name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1';
      params.push(`%${search.trim()}%`);
    }

    const customersRes = await query(`
      SELECT c.id, c.name, c.email, c.phone, c.created_at,
             COUNT(o.id) AS total_orders,
             COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_spent,
             MAX(o.created_at) AS latest_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      ${whereClause}
      GROUP BY c.id, c.name, c.email, c.phone, c.created_at
      ORDER BY c.created_at DESC
    `, params);

    res.json({
      success: true,
      count: customersRes.rows.length,
      customers: customersRes.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/customers/:id
 */
export async function getAdminCustomerDetail(req, res, next) {
  try {
    const { id } = req.params;

    const customerRes = await query(
      'SELECT id, name, email, phone, created_at FROM customers WHERE id = $1',
      [id]
    );

    if (customerRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const addressesRes = await query(
      'SELECT * FROM addresses WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );

    const ordersRes = await query(
      `SELECT o.id, o.order_number, o.status, o.payment_status, o.total_amount, o.created_at,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS items_count
       FROM orders o
       WHERE o.customer_id = $1
       ORDER BY o.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      customer: {
        ...customerRes.rows[0],
        addresses: addressesRes.rows,
        orders: ordersRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/products
 */
export async function getAdminProducts(req, res, next) {
  try {
    const result = await query(`
      SELECT * FROM products
      ORDER BY pack_count ASC
    `);

    res.json({
      success: true,
      products: result.rows.map(prod => ({
        ...prod,
        price: parseFloat(prod.price),
        original_price: parseFloat(prod.original_price),
        stock_quantity: parseInt(prod.stock_quantity, 10),
        pack_count: parseInt(prod.pack_count, 10),
        images: Array.isArray(prod.images) ? prod.images : (typeof prod.images === 'string' ? JSON.parse(prod.images || '[]') : [])
      }))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/products/:id
 */
export async function updateAdminProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      pack_size,
      pack_count,
      price,
      original_price,
      stock_quantity,
      badge_text,
      short_description,
      description,
      benefits,
      how_to_use,
      features,
      images,
      is_active,
      is_featured
    } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) { updates.push(`name = $${paramIndex++}`); params.push(name); }
    if (pack_size !== undefined) { updates.push(`pack_size = $${paramIndex++}`); params.push(pack_size); }
    if (pack_count !== undefined) { updates.push(`pack_count = $${paramIndex++}`); params.push(parseInt(pack_count, 10)); }
    if (price !== undefined) { updates.push(`price = $${paramIndex++}`); params.push(parseFloat(price)); }
    if (original_price !== undefined) { updates.push(`original_price = $${paramIndex++}`); params.push(parseFloat(original_price)); }
    if (stock_quantity !== undefined) { updates.push(`stock_quantity = $${paramIndex++}`); params.push(parseInt(stock_quantity, 10)); }
    if (badge_text !== undefined) { updates.push(`badge_text = $${paramIndex++}`); params.push(badge_text); }
    if (short_description !== undefined) { updates.push(`short_description = $${paramIndex++}`); params.push(short_description); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); params.push(description); }
    if (benefits !== undefined) { updates.push(`benefits = $${paramIndex++}`); params.push(typeof benefits === 'string' ? benefits : JSON.stringify(benefits)); }
    if (how_to_use !== undefined) { updates.push(`how_to_use = $${paramIndex++}`); params.push(typeof how_to_use === 'string' ? how_to_use : JSON.stringify(how_to_use)); }
    if (features !== undefined) { updates.push(`features = $${paramIndex++}`); params.push(typeof features === 'string' ? features : JSON.stringify(features)); }
    if (images !== undefined) { updates.push(`images = $${paramIndex++}`); params.push(typeof images === 'string' ? images : JSON.stringify(images)); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramIndex++}`); params.push(Boolean(is_active)); }
    if (is_featured !== undefined) { updates.push(`is_featured = $${paramIndex++}`); params.push(Boolean(is_featured)); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update.' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const updateQuery = `
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/messages
 */
export async function getAdminMessages(req, res, next) {
  try {
    const result = await query(`
      SELECT * FROM contact_messages
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      messages: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/messages/:id/status
 */
export async function updateAdminMessageStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      'UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    res.json({
      success: true,
      message: 'Message status updated.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/clear-test-data
 * Clears all dummy test orders, order items, addresses, customer records, and messages.
 */
export async function clearAllTestData(req, res, next) {
  try {
    await query('DELETE FROM payments');
    try { await query('DELETE FROM order_notifications'); } catch (_) {}
    await query('DELETE FROM order_items');
    await query('DELETE FROM orders');
    await query('DELETE FROM addresses');
    await query('DELETE FROM customers');
    await query('DELETE FROM contact_messages');

    try {
      await query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE order_items_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE customers_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE addresses_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE payments_id_seq RESTART WITH 1');
    } catch (_) {}

    res.json({
      success: true,
      message: 'All dummy test data has been completely wiped from the database.'
    });
  } catch (err) {
    next(err);
  }
}
