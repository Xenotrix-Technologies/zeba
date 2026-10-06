import { query } from '../config/db.js';
import { sendCustomerStatusNotification } from '../services/notificationService.js';
import { sendOrderCancelledEmail } from '../services/emailService.js';

/**
 * GET /api/orders/:orderNumber
 * Fetch order details by human-readable order number or internal ID
 */
export async function getOrderByNumber(req, res, next) {
  try {
    const { orderNumber } = req.params;

    const isNumeric = /^\d+$/.test(orderNumber);
    const orderRes = isNumeric
      ? await query(
          `SELECT o.*,
                  c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
                  a.house_building, a.street, a.area, a.city, a.state, a.pincode, a.country,
                  p.razorpay_order_id, p.razorpay_payment_id, p.payment_method
           FROM orders o
           JOIN customers c ON o.customer_id = c.id
           LEFT JOIN addresses a ON o.address_id = a.id
           LEFT JOIN payments p ON o.id = p.order_id
           WHERE o.id = $1`,
          [parseInt(orderNumber, 10)]
        )
      : await query(
          `SELECT o.*,
                  c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
                  a.house_building, a.street, a.area, a.city, a.state, a.pincode, a.country,
                  p.razorpay_order_id, p.razorpay_payment_id, p.payment_method
           FROM orders o
           JOIN customers c ON o.customer_id = c.id
           LEFT JOIN addresses a ON o.address_id = a.id
           LEFT JOIN payments p ON o.id = p.order_id
           WHERE o.order_number = $1`,
          [orderNumber]
        );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = orderRes.rows[0];

    // IDOR Protection: Validate authorization before exposing customer order details
    if (isNumeric) {
      if (req.admin) {
        // Admin allowed
      } else if (req.customer) {
        if (order.customer_id !== req.customer.id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You are not authorized to view this order.'
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to access order by ID. Please sign in or use your reference number.'
        });
      }
    } else {
      if (req.customer && order.customer_id !== req.customer.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This order belongs to a different customer account.'
        });
      }
    }

    const itemsRes = await query(
      `SELECT oi.id, oi.product_id, oi.product_name, oi.pack_size,
              oi.unit_price, oi.quantity, oi.subtotal_price,
              p.images, p.slug
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    // Fetch status history timeline
    let statusHistory = [];
    try {
      const historyRes = await query(
        `SELECT id, previous_status, new_status, changed_by, notes, created_at
         FROM order_status_history
         WHERE order_id = $1
         ORDER BY created_at ASC`,
        [order.id]
      );
      statusHistory = historyRes.rows;
    } catch (e) {
      statusHistory = [];
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        refundStatus: order.refund_status || 'not_applicable',
        subtotal: parseFloat(order.subtotal),
        shippingFee: parseFloat(order.shipping_fee),
        totalAmount: parseFloat(order.total_amount),
        currency: order.currency || 'INR',
        notes: order.notes,
        trackingNumber: order.tracking_number,
        courierPartner: order.courier_partner,
        estimatedDeliveryDate: order.estimated_delivery_date,
        deliveredAt: order.delivered_at,
        cancelledAt: order.cancelled_at,
        cancellationReason: order.cancellation_reason,
        createdAt: order.created_at,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone
        },
        address: {
          houseBuilding: order.house_building,
          street: order.street,
          area: order.area,
          city: order.city,
          state: order.state,
          pincode: order.pincode,
          country: order.country
        },
        payment: {
          razorpayOrderId: order.razorpay_order_id,
          razorpayPaymentId: order.razorpay_payment_id,
          method: order.payment_method || 'Razorpay Online'
        },
        items: itemsRes.rows.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          packSize: item.pack_size,
          unitPrice: parseFloat(item.unit_price),
          quantity: item.quantity,
          subtotalPrice: parseFloat(item.subtotal_price),
          image: item.images && item.images.length > 0 ? item.images[0] : '/images/zeba-1pack.jpg'
        })),
        statusHistory
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/track/:orderNumber
 * Public order tracking endpoint
 */
export async function trackOrder(req, res, next) {
  try {
    const { orderNumber } = req.params;

    const orderRes = await query(
      `SELECT o.id, o.order_number, o.status, o.payment_status, o.refund_status,
              o.tracking_number, o.courier_partner, o.estimated_delivery_date,
              o.delivered_at, o.cancelled_at, o.created_at, o.notes,
              c.name AS customer_name, a.city, a.state
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.order_number = $1`,
      [orderNumber]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No order found with reference "${orderNumber}". Please check the order number.`
      });
    }

    const order = orderRes.rows[0];

    const itemsRes = await query(
      `SELECT product_name, pack_size, quantity FROM order_items WHERE order_id = $1`,
      [order.id]
    );

    const historyRes = await query(
      `SELECT new_status, notes, created_at FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC`,
      [order.id]
    );

    res.json({
      success: true,
      tracking: {
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        courierPartner: order.courier_partner || 'ZEBA Express Courier Partner',
        trackingNumber: order.tracking_number || null,
        estimatedDeliveryDate: order.estimated_delivery_date || null,
        destination: `${order.city}, ${order.state}`,
        placedAt: order.created_at,
        deliveredAt: order.delivered_at,
        cancelledAt: order.cancelled_at,
        items: itemsRes.rows,
        timeline: historyRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/orders/:orderNumber/cancel
 * Customer-initiated cancellation workflow
 */
export async function cancelCustomerOrder(req, res, next) {
  try {
    const { orderNumber } = req.params;
    const { reason, phone, email } = req.body;

    const orderRes = await query(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.order_number = $1`,
      [orderNumber]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    // Security Verification: Allow if admin, authenticated customer (by id or matching email/phone), or guest verification (by body email/phone)
    const isOwner = req.customer && (
      order.customer_id === req.customer.id ||
      (order.customer_email && req.customer.email && order.customer_email.toLowerCase().trim() === req.customer.email.toLowerCase().trim()) ||
      (order.customer_phone && req.customer.phone && order.customer_phone.trim() === req.customer.phone.trim())
    );

    const isAdmin = Boolean(req.admin);

    if (!isAdmin && !isOwner) {
      const matchPhone = phone && order.customer_phone && phone.trim() === order.customer_phone.trim();
      const matchEmail = email && order.customer_email && email.toLowerCase().trim() === order.customer_email.toLowerCase().trim();
      if (!matchPhone && !matchEmail) {
        return res.status(403).json({
          success: false,
          message: 'Verification failed. Please provide the customer phone or email associated with this order.'
        });
      }
    }

    // Eligibility check: Order can only be cancelled by customer before dispatch (pending or confirmed)
    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This order is already cancelled.' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order #${orderNumber} is currently "${order.status.toUpperCase()}" and cannot be cancelled automatically. Please contact ZEBA Care support on WhatsApp.`
      });
    }

    const cancellationReason = reason || 'Cancelled by customer';

    // 1. Update order status to cancelled
    const updateRes = await query(
      `UPDATE orders
       SET status = 'cancelled',
           cancelled_at = CURRENT_TIMESTAMP,
           cancellation_reason = $1,
           refund_status = CASE WHEN payment_status = 'paid' THEN 'requested' ELSE refund_status END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [cancellationReason, order.id]
    );

    const updatedOrder = updateRes.rows[0];

    // 2. Restore product inventory stock if order was confirmed
    if (order.status === 'confirmed') {
      const itemsRes = await query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [order.id]);
      for (const itm of itemsRes.rows) {
        await query(
          'UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [itm.quantity, itm.product_id]
        );
      }
    }

    // 3. Append to order_status_history
    await query(
      `INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes)
       VALUES ($1, $2, 'cancelled', 'customer', $3)`,
      [order.id, order.status, cancellationReason]
    );

    // 4. Dispatch transactional notification (Customer & Admin)
    try {
      await sendOrderCancelledEmail({
        order: {
          ...updatedOrder,
          customer: {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone
          }
        },
        reason: cancellationReason,
        refundStatus: updatedOrder.refund_status
      });
    } catch (notifErr) {
      console.error('Customer cancellation email dispatch note:', notifErr.message);
    }

    try {
      await sendCustomerStatusNotification({
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        status: 'cancelled',
        paymentStatus: updatedOrder.payment_status,
        notes: cancellationReason,
        totalAmount: updatedOrder.total_amount
      });
    } catch (_) {}

    res.json({
      success: true,
      message: `Order #${orderNumber} has been successfully cancelled.`,
      order: updatedOrder
    });
  } catch (err) {
    next(err);
  }
}
