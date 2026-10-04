import { query } from '../config/db.js';
import { sendCustomerStatusNotification, generateWhatsAppMessage } from '../services/notificationService.js';
import {
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancelledEmail,
  sendAdminNewOrderAlert,
  sendRefundEmail,
  getEmailNotifications,
  getEmailEvents,
  retryFailedEmails,
  verifySmtpConnection,
  sendTestEmail
} from '../services/emailService.js';


/**
 * Valid state transitions for order lifecycle
 */
export const VALID_ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [], // Terminal state
  cancelled: []  // Terminal state
};

/**
 * Helper to validate state transitions
 */
export function validateStatusTransition(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) {
    return { valid: false, message: 'Current and target statuses are required.' };
  }
  const curr = currentStatus.toLowerCase().trim();
  const target = targetStatus.toLowerCase().trim();

  if (curr === target) {
    return { valid: true, isNoOp: true };
  }

  const allowed = VALID_ORDER_TRANSITIONS[curr] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      message: `Invalid order status transition from "${curr}" to "${target}". Allowed transitions: ${allowed.length > 0 ? allowed.join(', ') : 'None (Terminal status)'}.`
    };
  }

  return { valid: true, isNoOp: false };
}

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
        COUNT(*) FILTER (WHERE status = 'out_for_delivery') AS out_for_delivery_orders,
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
      LEFT JOIN customers c ON o.customer_id = c.id
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
        outForDeliveryOrders: parseInt(stats.out_for_delivery_orders || 0, 10),
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
 * Filter, search, paginate, and sort orders
 */
export async function getAdminOrders(req, res, next) {
  try {
    const {
      status,
      payment_status,
      refund_status,
      search,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      conditions.push(`o.status = $${paramIndex++}`);
      params.push(status.toLowerCase().trim());
    }

    if (payment_status && payment_status !== 'all') {
      conditions.push(`o.payment_status = $${paramIndex++}`);
      params.push(payment_status.toLowerCase().trim());
    }

    if (refund_status && refund_status !== 'all') {
      conditions.push(`o.refund_status = $${paramIndex++}`);
      params.push(refund_status.toLowerCase().trim());
    }

    if (startDate) {
      conditions.push(`o.created_at >= $${paramIndex++}`);
      params.push(new Date(startDate).toISOString());
    }

    if (endDate) {
      conditions.push(`o.created_at <= $${paramIndex++}`);
      params.push(new Date(endDate).toISOString());
    }

    if (search && search.trim() !== '') {
      conditions.push(`(
        o.order_number ILIKE $${paramIndex} OR
        c.name ILIKE $${paramIndex} OR
        c.email ILIKE $${paramIndex} OR
        c.phone ILIKE $${paramIndex} OR
        o.tracking_number ILIKE $${paramIndex}
      )`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Allowed sort columns
    const allowedSortCols = {
      created_at: 'o.created_at',
      total_amount: 'o.total_amount',
      order_number: 'o.order_number',
      status: 'o.status'
    };
    const sortCol = allowedSortCols[sortBy] || 'o.created_at';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ${whereClause}
    `;
    const countRes = await query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    const ordersQuery = `
      SELECT o.id, o.order_number, o.status, o.payment_status, o.refund_status, o.subtotal,
             o.shipping_fee, o.total_amount, o.currency, o.tracking_number, o.courier_partner,
             o.estimated_delivery_date, o.delivered_at, o.cancelled_at, o.notes,
             o.created_at, o.updated_at,
             c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS total_items,
             (SELECT string_agg(product_name, ', ') FROM order_items WHERE order_id = o.id) AS products_summary
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ${whereClause}
      ORDER BY ${sortCol} ${orderDirection}
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
 * Full detailed order view including customer, address, items, transaction, timeline history, and notification logs
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
           LEFT JOIN customers c ON o.customer_id = c.id
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
           LEFT JOIN customers c ON o.customer_id = c.id
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

    // Fetch status history timeline
    let statusHistory = [];
    try {
      const historyRes = await query(
        `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC`,
        [order.id]
      );
      statusHistory = historyRes.rows;
    } catch (e) {
      statusHistory = [];
    }

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

    // Fetch email notification events & structured status matrix
    let emailNotifications = [];
    const emailStatusSummary = {
      orderConfirmation: 'not_sent',
      paymentConfirmation: 'not_sent',
      statusUpdate: 'not_sent',
      cancellation: order.status === 'cancelled' ? 'pending' : 'not_applicable'
    };

    try {
      const emailNotifRes = await query(
        `SELECT id, order_id, notification_type, recipient_email, subject, status, provider_message_id, error_message, retry_count, created_at, sent_at, failed_at
         FROM email_notifications
         WHERE order_id = $1
         ORDER BY created_at DESC`,
        [order.id]
      );
      emailNotifications = emailNotifRes.rows;

      for (const n of emailNotifications) {
        const type = (n.notification_type || '').toLowerCase();
        if (type.includes('order_confirmation') || type.includes('order_received')) {
          emailStatusSummary.orderConfirmation = n.status;
        } else if (type.includes('payment_confirmation') || type.includes('payment_success')) {
          emailStatusSummary.paymentConfirmation = n.status;
        } else if (type.includes('order_status_') || type.includes('status_')) {
          emailStatusSummary.statusUpdate = n.status;
        } else if (type.includes('order_cancelled') || type.includes('cancellation')) {
          emailStatusSummary.cancellation = n.status;
        }
      }

      // Fallback check on order_notifications table for historical continuity
      if (emailNotifications.length === 0 && notifications.length > 0) {
        for (const notif of notifications) {
          const type = (notif.notification_type || '').toLowerCase();
          if (type.includes('confirmation')) {
            emailStatusSummary.orderConfirmation = 'sent';
          }
          if (type.includes('payment')) {
            emailStatusSummary.paymentConfirmation = 'sent';
          }
          if (type.includes('status')) {
            emailStatusSummary.statusUpdate = 'sent';
          }
          if (type.includes('cancelled')) {
            emailStatusSummary.cancellation = 'sent';
          }
        }
      }
    } catch (e) {
      emailNotifications = [];
    }

    res.json({
      success: true,
      order: {
        ...order,
        items: itemsRes.rows,
        statusHistory,
        notifications,
        emailNotifications,
        emailStatusSummary
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/orders/:id/status
 * Authoritative Order Status Transition & Update
 * - Enforces valid state machine transition rules
 * - Appends audit record to order_status_history
 * - Handles inventory restoration on cancellation
 * - Triggers transactional notifications
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const {
      status,
      payment_status,
      refund_status,
      notes,
      cancellation_reason,
      tracking_number,
      courier_partner,
      estimated_delivery_date,
      notify_customer = true
    } = req.body;

    const isNumeric = /^\d+$/.test(id);
    const existingRes = isNumeric
      ? await query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [parseInt(id, 10)])
      : await query('SELECT * FROM orders WHERE order_number = $1 LIMIT 1', [id]);

    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentOrder = existingRes.rows[0];
    const updates = [];
    const params = [];
    let paramIndex = 1;

    let targetStatus = currentOrder.status;
    let isStatusChange = false;

    // 1. Validate Order Status Transition
    if (status && status !== currentOrder.status) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const check = validateStatusTransition(currentOrder.status, status);
      if (!check.valid) {
        return res.status(400).json({
          success: false,
          message: check.message
        });
      }

      targetStatus = status;
      isStatusChange = true;
      updates.push(`status = $${paramIndex++}`);
      params.push(status);

      // Status-specific timestamps & inventory adjustments
      if (status === 'delivered') {
        updates.push('delivered_at = CURRENT_TIMESTAMP');
      } else if (status === 'cancelled') {
        updates.push('cancelled_at = CURRENT_TIMESTAMP');
        const reason = cancellation_reason || notes || 'Cancelled by admin';
        updates.push(`cancellation_reason = $${paramIndex++}`);
        params.push(reason);

        // Restore Inventory Stock if order had deducted stock (confirmed/processing/shipped)
        if (['confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(currentOrder.status)) {
          const itemsRes = await query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [currentOrder.id]);
          for (const itm of itemsRes.rows) {
            await query(
              'UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
              [itm.quantity, itm.product_id]
            );
          }
        }
      }
    }

    // 2. Validate Payment Status
    if (payment_status && payment_status !== currentOrder.payment_status) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'cancelled', 'refunded'];
      if (!validPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
      updates.push(`payment_status = $${paramIndex++}`);
      params.push(payment_status);
    }

    // 3. Validate Refund Status
    if (refund_status && refund_status !== currentOrder.refund_status) {
      const validRefundStatuses = ['not_applicable', 'requested', 'processing', 'completed', 'failed'];
      if (!validRefundStatuses.includes(refund_status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid refund status. Must be one of: ${validRefundStatuses.join(', ')}`
        });
      }
      updates.push(`refund_status = $${paramIndex++}`);
      params.push(refund_status);
    }

    // 4. Shipping & Tracking Details
    if (tracking_number !== undefined) {
      updates.push(`tracking_number = $${paramIndex++}`);
      params.push(tracking_number?.trim() || null);
    }
    if (courier_partner !== undefined) {
      updates.push(`courier_partner = $${paramIndex++}`);
      params.push(courier_partner?.trim() || null);
    }
    if (estimated_delivery_date !== undefined) {
      updates.push(`estimated_delivery_date = $${paramIndex++}`);
      params.push(estimated_delivery_date || null);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(notes?.trim() || null);
    }

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: 'No changes required (idempotent update).',
        order: currentOrder
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(currentOrder.id);

    const updateQuery = `
      UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);
    const updatedOrder = result.rows[0];

    // 5. Append to order_status_history if status changed or notes provided
    if (isStatusChange) {
      await query(
        `INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          updatedOrder.id,
          currentOrder.status,
          targetStatus,
          req.admin?.username || 'admin',
          notes || cancellation_reason || null
        ]
      );
    }

    // 6. Fetch customer details to dispatch notification
    const custRes = await query(
      'SELECT name, email, phone FROM customers WHERE id = $1',
      [updatedOrder.customer_id]
    );

    let notificationResult = null;
    let whatsappLink = '';

    if (custRes.rows.length > 0) {
      const customer = custRes.rows[0];

      if (notify_customer && isStatusChange) {
        if (targetStatus === 'cancelled') {
          // Send Order Cancellation email to Customer & Admin
          try {
            await sendOrderCancelledEmail({
              order: {
                ...updatedOrder,
                customer
              },
              reason: cancellation_reason || notes || 'Cancelled by store administrator',
              refundStatus: updatedOrder.refund_status
            });
          } catch (cancelErr) {
            console.error('Admin cancellation email dispatch note:', cancelErr.message);
          }
        } else {
          // Send Status Update email to Customer
          try {
            await sendOrderStatusUpdateEmail({
              order: {
                ...updatedOrder,
                customer
              },
              newStatus: targetStatus,
              previousStatus: currentOrder.status,
              notes: notes || updatedOrder.notes,
              courierPartner: updatedOrder.courier_partner,
              trackingNumber: updatedOrder.tracking_number
            });
          } catch (statusErr) {
            console.error('Admin order status update email dispatch note:', statusErr.message);
          }
        }

        try {
          notificationResult = await sendCustomerStatusNotification({
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.order_number,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            status: targetStatus,
            paymentStatus: updatedOrder.payment_status,
            notes: notes || updatedOrder.notes,
            totalAmount: updatedOrder.total_amount,
            courierPartner: updatedOrder.courier_partner,
            trackingNumber: updatedOrder.tracking_number
          });
        } catch (_) {}
      }

      // Check if refund status changed to dispatch refund-specific emails
      if (notify_customer && refund_status && refund_status !== currentOrder.refund_status && ['requested', 'processing', 'completed', 'failed'].includes(refund_status)) {
        try {
          await sendRefundEmail({
            order: {
              ...updatedOrder,
              customer
            },
            refundStatus: refund_status,
            reason: notes || cancellation_reason || 'Admin processed refund update'
          });
        } catch (refundErr) {
          console.error('Admin refund email dispatch note:', refundErr.message);
        }
      }

      // Generate WhatsApp Direct Send Link
      const msg = generateWhatsAppMessage(
        {
          order_number: updatedOrder.order_number,
          customer_name: customer.name,
          total_amount: updatedOrder.total_amount
        },
        targetStatus,
        notes || updatedOrder.notes
      );

      const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      whatsappLink = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    }

    // Fetch updated status history
    const historyRes = await query(
      'SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC',
      [updatedOrder.id]
    );

    res.json({
      success: true,
      message: `Order status updated to "${targetStatus}".`,
      order: {
        ...updatedOrder,
        statusHistory: historyRes.rows
      },
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
 * Clears test orders, status history, payment events, and notifications
 */
export async function clearAllTestData(req, res, next) {
  try {
    try { await query('DELETE FROM email_notifications'); } catch (_) {}
    try { await query('DELETE FROM email_events'); } catch (_) {}
    try { await query('DELETE FROM payment_events'); } catch (_) {}
    try { await query('DELETE FROM order_status_history'); } catch (_) {}
    try { await query('DELETE FROM order_notifications'); } catch (_) {}
    await query('DELETE FROM payments');
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
      await query('ALTER SEQUENCE email_events_id_seq RESTART WITH 1');
      await query('ALTER SEQUENCE email_notifications_id_seq RESTART WITH 1');
    } catch (_) {}

    res.json({
      success: true,
      message: 'All dummy test data and email logs have been completely wiped from the database.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/emails
 * Retrieve paginated email events and delivery statuses
 */
export async function getAdminEmailEvents(req, res, next) {
  try {
    const { page = 1, limit = 20, orderId, status, search } = req.query;
    const result = await getEmailEvents({ page, limit, orderId, status, search });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/emails/retry
 * Safe admin-triggered retry for failed email notifications
 */
export async function retryAdminFailedEmails(req, res, next) {
  try {
    const { maxRetries = 3, limit = 10 } = req.body;
    const result = await retryFailedEmails({ maxRetries, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/emails/test-smtp
 * Verify SMTP connection and optionally send diagnostic test message
 */
export async function testAdminSmtp(req, res, next) {
  try {
    const { to, sendTest = false } = req.body;
    const connCheck = await verifySmtpConnection();

    let testSendResult = null;
    if (sendTest) {
      testSendResult = await sendTestEmail({ to });
    }

    res.json({
      success: true,
      connection: connCheck,
      testSend: testSendResult
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/orders/:id/resend-email
 * Direct manual single-click resend for any order email type from Admin Order Detail UI
 */
export async function resendAdminOrderEmail(req, res, next) {
  try {
    const { id } = req.params;
    const { emailType } = req.body; // 'order_confirmation' | 'payment_confirmation' | 'status_update' | 'cancellation'

    const isNumeric = /^\d+$/.test(id);
    const orderRes = isNumeric
      ? await query(`SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = $1`, [parseInt(id, 10)])
      : await query(`SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.order_number = $1`, [id]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const orderRow = orderRes.rows[0];
    const itemsRes = await query(`SELECT * FROM order_items WHERE order_id = $1`, [orderRow.id]);
    const addrRes = await query(`SELECT * FROM addresses WHERE id = $1`, [orderRow.address_id]);

    const fullOrder = {
      ...orderRow,
      customer: {
        name: orderRow.customer_name,
        email: orderRow.customer_email,
        phone: orderRow.customer_phone
      },
      address: addrRes.rows[0] || {},
      items: itemsRes.rows
    };

    let result = null;

    if (emailType === 'order_confirmation') {
      result = await sendOrderConfirmationEmail({ order: fullOrder, forceResend: true });
    } else if (emailType === 'payment_confirmation') {
      result = await sendPaymentConfirmationEmail({ order: fullOrder, forceResend: true });
    } else if (emailType === 'status_update') {
      result = await sendOrderStatusUpdateEmail({
        order: fullOrder,
        newStatus: fullOrder.status,
        courierPartner: fullOrder.courier_partner,
        trackingNumber: fullOrder.tracking_number,
        forceResend: true
      });
    } else if (emailType === 'cancellation') {
      result = await sendOrderCancelledEmail({
        order: fullOrder,
        reason: fullOrder.cancellation_reason || 'Order cancelled upon request',
        forceResend: true
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid emailType specified.' });
    }

    res.json({
      success: true,
      message: `Email [${emailType}] dispatched to customer and admin.`,
      result
    });
  } catch (err) {
    next(err);
  }
}


