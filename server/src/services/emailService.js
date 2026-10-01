import nodemailer from 'nodemailer';
import { query } from '../config/db.js';
import { config } from '../config/env.js';
import {
  renderOrderReceivedEmail,
  renderPaymentSuccessEmail,
  renderPaymentFailedEmail,
  renderOrderStatusEmail,
  renderRefundEmail,
  renderAdminNewOrderEmail,
  renderWelcomeEmail,
  renderEmailLayout
} from '../templates/emails/index.js';

let cachedTransporter = null;

/**
 * Validate email address format strictly
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Build configured sender string (e.g. "ZEBA <orders@zebaofficial.in>")
 */
export function getSenderAddress() {
  const name = config.EMAIL_FROM_NAME || 'ZEBA';
  let address = (config.EMAIL_FROM_ADDRESS || config.CONTACT_EMAIL || 'orders@zebaofficial.in').trim();

  // Extract pure email address if wrapped in angle brackets
  const match = address.match(/<([^>]+)>/);
  if (match) {
    address = match[1].trim();
  }

  return `"${name}" <${address}>`;
}

/**
 * Get or create cached Nodemailer SMTP transporter
 */
export function getEmailTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = config.SMTP_HOST || process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = config.SMTP_USER || process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = config.SMTP_PASSWORD || config.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const port = parseInt(config.SMTP_PORT || process.env.SMTP_PORT || '587', 10);
  const secure = config.SMTP_SECURE || process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false
      }
    });

    return cachedTransporter;
  }

  return null;
}

/**
 * Verify SMTP connection credentials
 */
export async function verifySmtpConnection() {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return {
      connected: false,
      configured: false,
      message: 'SMTP credentials not configured in environment variables (SMTP_HOST, SMTP_USER, SMTP_PASSWORD).'
    };
  }

  try {
    await transporter.verify();
    return {
      connected: true,
      configured: true,
      host: config.SMTP_HOST || process.env.SMTP_HOST,
      port: config.SMTP_PORT || process.env.SMTP_PORT || 587,
      from: getSenderAddress(),
      message: 'SMTP server connection verified successfully.'
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      host: config.SMTP_HOST || process.env.SMTP_HOST,
      error: err.message,
      message: `SMTP connection failed: ${err.message}`
    };
  }
}

/**
 * Central Idempotent & Resilient Email Dispatcher
 * - Validates recipient
 * - Checks email_events table to guarantee idempotency
 * - Dispatches live email via SMTP (or simulates when no SMTP is configured)
 * - Updates email_events audit status without throwing errors to protect order transactions
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  orderId = null,
  eventType = null,
  payload = null
}) {
  const cleanRecipient = (to || '').trim().toLowerCase();

  if (!isValidEmail(cleanRecipient)) {
    console.warn(`⚠️ Skipped email dispatch: Invalid recipient email address [${to}]`);
    return { success: false, error: 'Invalid recipient email address.' };
  }

  let eventRecordId = null;

  // 1. Idempotency Check & Event Registration
  if (orderId && eventType) {
    try {
      const existingRes = await query(
        'SELECT id, status, provider_message_id FROM email_events WHERE order_id = $1 AND event_type = $2 LIMIT 1',
        [orderId, eventType]
      );

      if (existingRes.rows.length > 0) {
        const existing = existingRes.rows[0];
        if (existing.status === 'sent') {
          console.log(`⏩ Notification [${eventType}] already sent for Order #${orderId}. Skipping duplicate.`);
          return {
            success: true,
            alreadySent: true,
            providerMessageId: existing.provider_message_id
          };
        }
        eventRecordId = existing.id;
      } else {
        const insertRes = await query(
          `INSERT INTO email_events (order_id, event_type, recipient, status, payload)
           VALUES ($1, $2, $3, 'pending', $4)
           ON CONFLICT (order_id, event_type) DO NOTHING
           RETURNING id`,
          [orderId, eventType, cleanRecipient, payload ? JSON.stringify(payload) : null]
        );
        if (insertRes.rows.length > 0) {
          eventRecordId = insertRes.rows[0].id;
        }
      }
    } catch (dbErr) {
      console.warn('Email event idempotency record note:', dbErr.message);
    }
  }

  const from = getSenderAddress();
  const transporter = getEmailTransporter();

  // 2. Dispatch live via Nodemailer or fallback to simulated log
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to: cleanRecipient,
        subject,
        text: text || subject,
        html
      });

      console.log(`📧 Live SMTP email dispatched to [${cleanRecipient}] (Event: ${eventType || 'direct'}): ${info.messageId}`);

      // Update email_events record to sent
      if (orderId && eventType) {
        try {
          await query(
            `UPDATE email_events
             SET status = 'sent', provider_message_id = $1, error_message = NULL, sent_at = CURRENT_TIMESTAMP
             WHERE order_id = $2 AND event_type = $3`,
            [info.messageId, orderId, eventType]
          );
        } catch (_) {}
      }

      // Legacy audit table sync
      if (orderId) {
        try {
          await query(
            `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
             VALUES ($1, $2, $3, 'sent', $4)
             ON CONFLICT (order_id, notification_type) DO NOTHING`,
            [orderId, `email_${eventType}`, cleanRecipient, `${subject}\n\n${html}`]
          );
        } catch (_) {}
      }

      return {
        success: true,
        sentLive: true,
        providerMessageId: info.messageId,
        recipient: cleanRecipient,
        subject
      };
    } catch (sendErr) {
      console.error(`⚠️ SMTP dispatch error to [${cleanRecipient}] (${eventType}):`, sendErr.message);

      // Record failure in email_events for retry
      if (orderId && eventType) {
        try {
          await query(
            `UPDATE email_events
             SET status = 'failed', error_message = $1, retry_count = retry_count + 1
             WHERE order_id = $2 AND event_type = $3`,
            [sendErr.message, orderId, eventType]
          );
        } catch (_) {}
      }

      // Resilient: never throw error
      return {
        success: false,
        sentLive: false,
        error: sendErr.message,
        recipient: cleanRecipient
      };
    }
  } else {
    // Simulated dispatch (when SMTP credentials are not yet configured in local environment)
    console.log(`ℹ️ [Email Dispatch - Development/Simulation Mode]`);
    console.log(`   To: ${cleanRecipient}`);
    console.log(`   From: ${from}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Event: ${eventType || 'general'}`);

    if (orderId && eventType) {
      try {
        await query(
          `UPDATE email_events
           SET status = 'sent', provider_message_id = 'SIMULATED_SUCCESS', sent_at = CURRENT_TIMESTAMP
           WHERE order_id = $1 AND event_type = $2`,
          [orderId, eventType]
        );
      } catch (_) {}
    }

    if (orderId) {
      try {
        await query(
          `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
           VALUES ($1, $2, $3, 'simulated', $4)
           ON CONFLICT (order_id, notification_type) DO NOTHING`,
          [orderId, `email_${eventType}`, cleanRecipient, `${subject}\n\n${html}`]
        );
      } catch (_) {}
    }

    return {
      success: true,
      sentLive: false,
      simulated: true,
      recipient: cleanRecipient,
      subject
    };
  }
}

/**
 * 1. Event A: Order Received Email
 */
export async function sendOrderReceivedEmail({ order }) {
  try {
    const recipient = order.customer?.email || order.customer_email;
    if (!recipient) return { success: false, error: 'Customer email missing.' };

    const { subject, html, text } = renderOrderReceivedEmail({ order });

    return await sendEmail({
      to: recipient,
      subject,
      html,
      text,
      orderId: order.id,
      eventType: 'order_received',
      payload: { orderNumber: order.orderNumber || order.order_number }
    });
  } catch (err) {
    console.error('Error in sendOrderReceivedEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 2. Event B: Payment Successful Email
 */
export async function sendPaymentSuccessEmail({ order, razorpayPaymentId, paymentMethod }) {
  try {
    const recipient = order.customer?.email || order.customer_email;
    if (!recipient) return { success: false, error: 'Customer email missing.' };

    const { subject, html, text } = renderPaymentSuccessEmail({
      order,
      razorpayPaymentId,
      paymentMethod
    });

    return await sendEmail({
      to: recipient,
      subject,
      html,
      text,
      orderId: order.id,
      eventType: 'payment_success',
      payload: { razorpayPaymentId, paymentMethod }
    });
  } catch (err) {
    console.error('Error in sendPaymentSuccessEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Event C: Payment Failed Email
 */
export async function sendPaymentFailedEmail({ order, errorMessage, retryUrl }) {
  try {
    const recipient = order.customer?.email || order.customer_email;
    if (!recipient) return { success: false, error: 'Customer email missing.' };

    const { subject, html, text } = renderPaymentFailedEmail({
      order,
      errorMessage,
      retryUrl
    });

    return await sendEmail({
      to: recipient,
      subject,
      html,
      text,
      orderId: order.id,
      eventType: 'payment_failed',
      payload: { errorMessage }
    });
  } catch (err) {
    console.error('Error in sendPaymentFailedEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 4. Events D - H & I: Order Status Transitions (Confirmed, Processing, Shipped, Out for Delivery, Delivered, Cancelled)
 */
export async function sendOrderStatusEmail({
  order,
  newStatus,
  previousStatus,
  notes,
  courierPartner,
  trackingNumber,
  trackingUrl,
  cancellationReason,
  refundStatus
}) {
  try {
    const recipient = order.customer?.email || order.customer_email;
    if (!recipient) return { success: false, error: 'Customer email missing.' };

    const status = (newStatus || order.status || 'confirmed').toLowerCase().trim();
    const eventType = `order_status_${status}`;

    const { subject, html, text } = renderOrderStatusEmail({
      order,
      newStatus: status,
      previousStatus,
      notes,
      courierPartner,
      trackingNumber,
      trackingUrl,
      cancellationReason,
      refundStatus
    });

    return await sendEmail({
      to: recipient,
      subject,
      html,
      text,
      orderId: order.id,
      eventType,
      payload: { status, trackingNumber, courierPartner }
    });
  } catch (err) {
    console.error('Error in sendOrderStatusEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 5. Event I: Order Cancellation Email
 */
export async function sendCancellationEmail({ order, reason, refundStatus }) {
  return await sendOrderStatusEmail({
    order,
    newStatus: 'cancelled',
    cancellationReason: reason,
    refundStatus
  });
}

/**
 * 6. Event J: Refund Status Email (Initiated, Completed, Failed)
 */
export async function sendRefundEmail({
  order,
  refundStatus = 'initiated',
  refundAmount,
  reason,
  transactionId
}) {
  try {
    const recipient = order.customer?.email || order.customer_email;
    if (!recipient) return { success: false, error: 'Customer email missing.' };

    const { subject, html, text } = renderRefundEmail({
      order,
      refundStatus,
      refundAmount,
      reason,
      transactionId
    });

    const eventType = `refund_${refundStatus.toLowerCase().trim()}`;

    return await sendEmail({
      to: recipient,
      subject,
      html,
      text,
      orderId: order.id,
      eventType,
      payload: { refundStatus, refundAmount, transactionId }
    });
  } catch (err) {
    console.error('Error in sendRefundEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 7. Admin New Order Alert Email
 */
export async function sendAdminNewOrderEmail({ order, razorpayPaymentId, razorpayOrderId }) {
  try {
    const adminEmail = config.ADMIN_EMAIL || process.env.ADMIN_EMAIL || config.ADMIN_DEFAULT_EMAIL || 'admin@zebaofficial.in';
    const { subject, html, text } = renderAdminNewOrderEmail({
      order,
      razorpayPaymentId,
      razorpayOrderId
    });

    return await sendEmail({
      to: adminEmail,
      subject,
      html,
      text,
      orderId: order.id,
      eventType: 'admin_new_order',
      payload: { razorpayPaymentId, razorpayOrderId }
    });
  } catch (err) {
    console.error('Error in sendAdminNewOrderEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 8. Customer Welcome Email
 */
export async function sendCustomerWelcomeEmail({ customerId, name, email, phone }) {
  try {
    if (!email) return { success: false, error: 'Email missing.' };

    const { subject, html, text } = renderWelcomeEmail({ name, email });

    // Save in customer_notifications
    try {
      await query(
        `INSERT INTO customer_notifications (customer_id, notification_type, recipient, subject, message)
         VALUES ($1, 'email_welcome', $2, $3, $4)`,
        [customerId, email, subject, html]
      );
    } catch (_) {}

    return await sendEmail({
      to: email,
      subject,
      html,
      text,
      eventType: 'customer_welcome',
      payload: { customerId, name }
    });
  } catch (err) {
    console.error('Error in sendCustomerWelcomeEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 9. Send Test Email from Admin Portal
 */
export async function sendTestEmail({ to }) {
  const recipient = to || config.ADMIN_EMAIL || 'admin@zebaofficial.in';
  const subject = `🧪 ZEBA SMTP Test Email (${new Date().toLocaleTimeString('en-IN')})`;

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; background-color: #E6FFFA; color: #047481; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #B2F5EA;">
        &#10003; SMTP Live Test Successful
      </div>
      <h2 style="color: #0E1B4D; font-size: 22px; margin: 12px 0 4px 0;">SMTP Configuration is Working!</h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">ZEBA E-Commerce Automated Email Dispatcher</p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6;">
      This is a test message confirming that your SMTP server connection, sender address (<strong>${getSenderAddress()}</strong>), and HTML rendering pipeline are functioning properly in production.
    </p>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px 20px; border-radius: 12px; margin: 20px 0; font-size: 13px;">
      <div style="margin-bottom: 6px; color: #4A5568;"><strong>SMTP Host:</strong> ${config.SMTP_HOST || 'Standard Node SMTP'}</div>
      <div style="margin-bottom: 6px; color: #4A5568;"><strong>Port:</strong> ${config.SMTP_PORT || 587}</div>
      <div style="margin-bottom: 6px; color: #4A5568;"><strong>Timestamp:</strong> ${new Date().toISOString()}</div>
      <div style="color: #4A5568;"><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</div>
    </div>
  `;

  const html = renderEmailLayout({
    title: 'ZEBA SMTP Test Email',
    preheader: 'Test verification message from ZEBA E-Commerce SMTP engine.',
    badge: 'SMTP DIAGNOSTIC TEST',
    contentHtml,
    ctaText: 'Visit ZEBA Store',
    ctaUrl: config.APP_URL || 'https://www.zebaofficial.in'
  });

  return await sendEmail({
    to: recipient,
    subject,
    html,
    text: 'ZEBA SMTP Test Email. Your SMTP configuration is working properly.'
  });
}

/**
 * 10. Retry Failed Emails (Safe Batch Processor)
 */
export async function retryFailedEmails({ maxRetries = 3, limit = 10 } = {}) {
  try {
    const failedEventsRes = await query(
      `SELECT ee.*, o.order_number, o.total_amount, o.status AS current_order_status
       FROM email_events ee
       LEFT JOIN orders o ON ee.order_id = o.id
       WHERE ee.status = 'failed' AND ee.retry_count < $1
       ORDER BY ee.created_at ASC
       LIMIT $2`,
      [maxRetries, limit]
    );

    const results = [];

    for (const evt of failedEventsRes.rows) {
      console.log(`🔄 Retrying failed email event ID ${evt.id} (${evt.event_type}) for recipient [${evt.recipient}]...`);

      // Fetch order details
      const orderRes = await query(
        `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.id
         WHERE o.id = $1`,
        [evt.order_id]
      );

      if (orderRes.rows.length === 0) continue;
      const order = orderRes.rows[0];

      let retryRes = null;

      if (evt.event_type === 'order_received') {
        retryRes = await sendOrderReceivedEmail({ order });
      } else if (evt.event_type === 'payment_success') {
        retryRes = await sendPaymentSuccessEmail({ order });
      } else if (evt.event_type === 'payment_failed') {
        retryRes = await sendPaymentFailedEmail({ order });
      } else if (evt.event_type.startsWith('order_status_')) {
        const status = evt.event_type.replace('order_status_', '');
        retryRes = await sendOrderStatusEmail({ order, newStatus: status });
      } else if (evt.event_type.startsWith('refund_')) {
        const refundStatus = evt.event_type.replace('refund_', '');
        retryRes = await sendRefundEmail({ order, refundStatus });
      } else if (evt.event_type === 'admin_new_order') {
        retryRes = await sendAdminNewOrderEmail({ order });
      }

      results.push({
        id: evt.id,
        eventType: evt.event_type,
        recipient: evt.recipient,
        success: retryRes?.success || false,
        error: retryRes?.error || null
      });
    }

    return { success: true, processedCount: results.length, results };
  } catch (err) {
    console.error('Error retrying failed emails:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 11. Query Email Event Logs for Admin Dashboard
 */
export async function getEmailEvents({ page = 1, limit = 20, orderId, status, search } = {}) {
  try {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const conditions = [];
    const params = [];
    let idx = 1;

    if (orderId) {
      conditions.push(`ee.order_id = $${idx++}`);
      params.push(parseInt(orderId, 10));
    }

    if (status && status !== 'all') {
      conditions.push(`ee.status = $${idx++}`);
      params.push(status.toLowerCase().trim());
    }

    if (search && search.trim() !== '') {
      conditions.push(`(ee.recipient ILIKE $${idx} OR o.order_number ILIKE $${idx} OR ee.event_type ILIKE $${idx})`);
      params.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*) AS total
       FROM email_events ee
       LEFT JOIN orders o ON ee.order_id = o.id
       ${whereClause}`,
      params
    );

    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    const listParams = [...params, parseInt(limit, 10), offset];
    const eventsRes = await query(
      `SELECT ee.*, o.order_number, o.total_amount
       FROM email_events ee
       LEFT JOIN orders o ON ee.order_id = o.id
       ${whereClause}
       ORDER BY ee.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      listParams
    );

    return {
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      events: eventsRes.rows
    };
  } catch (err) {
    console.error('Error fetching email events:', err);
    return { success: false, error: err.message, events: [] };
  }
}
