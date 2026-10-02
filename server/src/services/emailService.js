import nodemailer from 'nodemailer';
import { query } from '../config/db.js';
import { config } from '../config/env.js';
import {
  renderOrderConfirmationEmail,
  renderPaymentConfirmationEmail,
  renderOrderStatusUpdateEmail,
  renderOrderCancelledEmail,
  renderPaymentFailedEmail,
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
  let address = (config.EMAIL_FROM || config.EMAIL_FROM_ADDRESS || config.ADMIN_EMAIL || config.EMAIL_USER || 'zebaofficial2013@gmail.com').trim();

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

  const host = (config.EMAIL_HOST || config.SMTP_HOST || process.env.EMAIL_HOST || process.env.SMTP_HOST || '').trim();
  const user = (config.EMAIL_USER || config.SMTP_USER || process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  let pass = (config.EMAIL_PASSWORD || config.SMTP_PASSWORD || config.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '').trim();
  
  // Normalize Google App Password format (strip any internal spaces)
  if (host.includes('gmail') && pass.includes(' ')) {
    pass = pass.replace(/\s+/g, '');
  }

  const port = parseInt(config.EMAIL_PORT || config.SMTP_PORT || process.env.EMAIL_PORT || process.env.SMTP_PORT || '465', 10);
  const secure = port === 465 || config.SMTP_SECURE === true || process.env.SMTP_SECURE === 'true';

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      tls: {
        rejectUnauthorized: false
      }
    });

    return cachedTransporter;
  }

  return null;
}

/**
 * Verify SMTP connection credentials & deliverability
 */
export async function verifySmtpConnection() {
  const transporter = getEmailTransporter();
  const host = config.EMAIL_HOST || config.SMTP_HOST || process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = config.EMAIL_PORT || config.SMTP_PORT || process.env.EMAIL_PORT || process.env.SMTP_PORT || 587;
  const from = getSenderAddress();

  if (!transporter) {
    return {
      connected: false,
      configured: false,
      host: host || 'Not Configured',
      port,
      from,
      message: 'SMTP credentials not configured in environment variables (EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD).'
    };
  }

  try {
    await transporter.verify();
    return {
      connected: true,
      configured: true,
      host,
      port,
      from,
      message: 'SMTP server connection verified successfully.'
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      host,
      port,
      from,
      error: err.message,
      message: `SMTP connection failed: ${err.message}`
    };
  }
}

/**
 * Central Reusable & Idempotent Email Dispatcher
 *
 * Requirements:
 * - Validate recipient email.
 * - Generate/send HTML email with plain-text fallback.
 * - Enforce strict idempotency via email_notifications / email_events table.
 * - Handle provider errors gracefully and record failed status for safe retry.
 * - Never throw or crash the caller (order creation / payment verification).
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  orderId = null,
  eventType = null,
  notificationType = null,
  payload = null
}) {
  const notifType = notificationType || eventType || 'general';
  const cleanRecipient = (to || '').trim().toLowerCase();

  // 1. Email validation
  if (!isValidEmail(cleanRecipient)) {
    console.warn(`⚠️ Skipped email dispatch: Invalid recipient email address [${to}]`);
    return { success: false, error: 'Invalid recipient email address.' };
  }

  const safeOrderId = orderId && /^\d+$/.test(String(orderId)) ? parseInt(orderId, 10) : null;

  // 2. Idempotency Check & Pre-registration
  if (safeOrderId && notifType) {
    try {
      // Check email_notifications table
      const existingNotif = await query(
        `SELECT id, status, provider_message_id FROM email_notifications
         WHERE order_id = $1 AND notification_type = $2 AND recipient_email = $3
         LIMIT 1`,
        [safeOrderId, notifType, cleanRecipient]
      );

      if (existingNotif.rows.length > 0) {
        const existing = existingNotif.rows[0];
        if (existing.status === 'sent') {
          console.log(`Notification skipped because already sent: [${notifType}] for Order #${safeOrderId} to [${cleanRecipient}].`);
          return {
            success: true,
            alreadySent: true,
            providerMessageId: existing.provider_message_id
          };
        }
      } else {
        // Register pending notification record
        await query(
          `INSERT INTO email_notifications (order_id, notification_type, recipient_email, subject, status, payload)
           VALUES ($1, $2, $3, $4, 'pending', $5)
           ON CONFLICT (order_id, notification_type, recipient_email) DO NOTHING`,
          [safeOrderId, notifType, cleanRecipient, subject, payload ? JSON.stringify(payload) : null]
        );
      }

      // Sync legacy email_events table
      await query(
        `INSERT INTO email_events (order_id, event_type, recipient, status, payload)
         VALUES ($1, $2, $3, 'pending', $4)
         ON CONFLICT (order_id, event_type) DO NOTHING`,
        [safeOrderId, notifType, cleanRecipient, payload ? JSON.stringify(payload) : null]
      );
    } catch (dbErr) {
      console.warn('Email idempotency registration note:', dbErr.message);
    }
  }

  const from = getSenderAddress();
  const replyTo = config.CONTACT_EMAIL || config.EMAIL_FROM || from;
  const transporter = getEmailTransporter();

  // 3. Dispatch Live SMTP or Simulated Fallback
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        replyTo,
        to: cleanRecipient,
        subject,
        text: text || subject,
        html
      });

      console.log(`Email sent: [${cleanRecipient}] (Event: ${notifType}, Provider ID: ${info.messageId})`);

      // Update email_notifications to sent
      if (safeOrderId && notifType) {
        try {
          await query(
            `UPDATE email_notifications
             SET status = 'sent', provider_message_id = $1, error_message = NULL, sent_at = CURRENT_TIMESTAMP
             WHERE order_id = $2 AND notification_type = $3 AND recipient_email = $4`,
            [info.messageId, safeOrderId, notifType, cleanRecipient]
          );

          await query(
            `UPDATE email_events
             SET status = 'sent', provider_message_id = $1, error_message = NULL, sent_at = CURRENT_TIMESTAMP
             WHERE order_id = $2 AND event_type = $3`,
            [info.messageId, safeOrderId, notifType]
          );

          await query(
            `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
             VALUES ($1, $2, $3, 'sent', $4)
             ON CONFLICT (order_id, notification_type) DO NOTHING`,
            [safeOrderId, `email_${notifType}`, cleanRecipient, `${subject}\n\n${html}`]
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
      console.error(`Email failed to [${cleanRecipient}] (${notifType}):`, sendErr.message);

      // Record failure for safe retry
      if (safeOrderId && notifType) {
        try {
          await query(
            `UPDATE email_notifications
             SET status = 'failed', error_message = $1, retry_count = retry_count + 1, failed_at = CURRENT_TIMESTAMP
             WHERE order_id = $2 AND notification_type = $3 AND recipient_email = $4`,
            [sendErr.message, safeOrderId, notifType, cleanRecipient]
          );

          await query(
            `UPDATE email_events
             SET status = 'failed', error_message = $1, retry_count = retry_count + 1
             WHERE order_id = $2 AND event_type = $3`,
            [sendErr.message, safeOrderId, notifType]
          );
        } catch (_) {}
      }

      return {
        success: false,
        sentLive: false,
        error: sendErr.message,
        recipient: cleanRecipient
      };
    }
  } else {
    // Simulated dispatch for local development without live SMTP credentials
    console.log(`ℹ️ [Email Service - Simulated Dispatch Mode]`);
    console.log(`   To: ${cleanRecipient}`);
    console.log(`   From: ${from}`);
    console.log(`   Reply-To: ${replyTo}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Notification: ${notifType}`);

    if (safeOrderId && notifType) {
      try {
        await query(
          `UPDATE email_notifications
           SET status = 'sent', provider_message_id = 'SIMULATED_SUCCESS', sent_at = CURRENT_TIMESTAMP
           WHERE order_id = $1 AND notification_type = $2 AND recipient_email = $3`,
          [safeOrderId, notifType, cleanRecipient]
        );

        await query(
          `UPDATE email_events
           SET status = 'sent', provider_message_id = 'SIMULATED_SUCCESS', sent_at = CURRENT_TIMESTAMP
           WHERE order_id = $1 AND event_type = $2`,
          [safeOrderId, notifType]
        );

        await query(
          `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
           VALUES ($1, $2, $3, 'simulated', $4)
           ON CONFLICT (order_id, notification_type) DO NOTHING`,
          [safeOrderId, `email_${notifType}`, cleanRecipient, `${subject}\n\n${html}`]
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
 * 2.A Customer Order Confirmation Email
 * Trigger: Order successfully created.
 * Send to: Customer
 */
export async function sendOrderConfirmationEmail({ order }) {
  try {
    const recipient = order.customer?.email || order.customer_email;
    if (!recipient) {
      console.warn(`⚠️ Customer email missing for Order #${order.id || order.order_number}`);
      return { success: false, error: 'Customer email address missing.' };
    }

    const { subject, html, text } = renderOrderConfirmationEmail({ order });
    const orderNumber = order.orderNumber || order.order_number;

    return await sendEmail({
      to: recipient,
      subject,
      html,
      text,
      orderId: order.id,
      eventType: 'order_confirmation',
      notificationType: 'order_confirmation',
      payload: { orderNumber }
    });
  } catch (err) {
    console.error('Error in sendOrderConfirmationEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 2.B Payment Confirmation Email
 * Trigger: Payment is successfully verified on backend.
 * Send to: Customer AND Admin
 */
export async function sendPaymentConfirmationEmail({ order, transactionId, razorpayPaymentId, paymentMethod }) {
  const results = { customer: null, admin: null };
  const payId = transactionId || razorpayPaymentId || order.razorpayPaymentId || order.razorpay_payment_id || 'VERIFIED';
  const method = paymentMethod || order.paymentMethod || order.payment_method || 'Razorpay Online';

  // 1. Send to Customer
  try {
    const customerRecipient = order.customer?.email || order.customer_email;
    if (customerRecipient) {
      const custRender = renderPaymentConfirmationEmail({
        order,
        transactionId: payId,
        paymentMethod: method,
        isAdmin: false
      });

      results.customer = await sendEmail({
        to: customerRecipient,
        subject: custRender.subject,
        html: custRender.html,
        text: custRender.text,
        orderId: order.id,
        eventType: 'payment_confirmation_customer',
        notificationType: 'payment_confirmation_customer',
        payload: { transactionId: payId, paymentMethod: method }
      });
    }
  } catch (custErr) {
    console.error('Error sending customer payment confirmation:', custErr.message);
    results.customer = { success: false, error: custErr.message };
  }

  // 2. Send to Admin
  try {
    const adminEmail = config.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@zebaofficial.in';
    const adminRender = renderPaymentConfirmationEmail({
      order,
      transactionId: payId,
      paymentMethod: method,
      isAdmin: true
    });

    results.admin = await sendEmail({
      to: adminEmail,
      subject: adminRender.subject,
      html: adminRender.html,
      text: adminRender.text,
      orderId: order.id,
      eventType: 'payment_confirmation_admin',
      notificationType: 'payment_confirmation_admin',
      payload: { transactionId: payId, paymentMethod: method }
    });
  } catch (adminErr) {
    console.error('Error sending admin payment confirmation:', adminErr.message);
    results.admin = { success: false, error: adminErr.message };
  }

  return {
    success: results.customer?.success || results.admin?.success || false,
    ...results
  };
}

/**
 * 2.C Customer Order Status Update Email
 * Trigger: Whenever admin changes order status.
 * Send to: Customer
 */
export async function sendOrderStatusUpdateEmail({
  order,
  newStatus,
  previousStatus,
  notes,
  courierPartner,
  trackingNumber,
  trackingUrl
}) {
  try {
    const recipient = order.customer?.email || order.customer_email;
    if (!recipient) {
      return { success: false, error: 'Customer email missing.' };
    }

    const status = (newStatus || order.status || 'confirmed').toLowerCase().trim();
    const eventType = `order_status_${status}`;

    const { subject, html, text } = renderOrderStatusUpdateEmail({
      order,
      newStatus: status,
      previousStatus,
      notes,
      courierPartner,
      trackingNumber,
      trackingUrl
    });

    return await sendEmail({
      to: recipient,
      subject,
      html,
      text,
      orderId: order.id,
      eventType,
      notificationType: eventType,
      payload: { status, trackingNumber, courierPartner }
    });
  } catch (err) {
    console.error('Error in sendOrderStatusUpdateEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 2.D Order Cancellation Email
 * Trigger: Order is cancelled (by customer or admin).
 * Send to: Customer AND Admin
 */
export async function sendOrderCancelledEmail({ order, reason, cancellationReason, refundStatus }) {
  const results = { customer: null, admin: null };
  const cancelReason = reason || cancellationReason || order.cancellation_reason || 'Order cancelled';

  // 1. Send to Customer
  try {
    const customerRecipient = order.customer?.email || order.customer_email;
    if (customerRecipient) {
      const custRender = renderOrderCancelledEmail({
        order,
        reason: cancelReason,
        refundStatus,
        isAdmin: false
      });

      results.customer = await sendEmail({
        to: customerRecipient,
        subject: custRender.subject,
        html: custRender.html,
        text: custRender.text,
        orderId: order.id,
        eventType: 'order_cancelled_customer',
        notificationType: 'order_cancelled_customer',
        payload: { reason: cancelReason, refundStatus }
      });
    }
  } catch (custErr) {
    console.error('Error sending customer cancellation email:', custErr.message);
    results.customer = { success: false, error: custErr.message };
  }

  // 2. Send to Admin
  try {
    const adminEmail = config.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@zebaofficial.in';
    const adminRender = renderOrderCancelledEmail({
      order,
      reason: cancelReason,
      refundStatus,
      isAdmin: true
    });

    results.admin = await sendEmail({
      to: adminEmail,
      subject: adminRender.subject,
      html: adminRender.html,
      text: adminRender.text,
      orderId: order.id,
      eventType: 'order_cancelled_admin',
      notificationType: 'order_cancelled_admin',
      payload: { reason: cancelReason, refundStatus }
    });
  } catch (adminErr) {
    console.error('Error sending admin cancellation email:', adminErr.message);
    results.admin = { success: false, error: adminErr.message };
  }

  return {
    success: results.customer?.success || results.admin?.success || false,
    ...results
  };
}

/**
 * 3. Admin New Order Alert Email
 * Trigger: New order is successfully created.
 * Send to: Admin
 */
export async function sendAdminNewOrderAlert({ order, razorpayPaymentId, razorpayOrderId }) {
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
      notificationType: 'admin_new_order',
      payload: { razorpayPaymentId, razorpayOrderId }
    });
  } catch (err) {
    console.error('Error in sendAdminNewOrderAlert:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Backward compatibility functions
 */
export async function sendOrderReceivedEmail({ order }) {
  return await sendOrderConfirmationEmail({ order });
}

export async function sendPaymentSuccessEmail({ order, razorpayPaymentId, paymentMethod }) {
  return await sendPaymentConfirmationEmail({ order, razorpayPaymentId, paymentMethod });
}

export async function sendOrderStatusEmail(params) {
  return await sendOrderStatusUpdateEmail(params);
}

export async function sendCancellationEmail(params) {
  return await sendOrderCancelledEmail(params);
}

export async function sendAdminNewOrderEmail(params) {
  return await sendAdminNewOrderAlert(params);
}

/**
 * Payment Failed Notification
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
      notificationType: 'payment_failed',
      payload: { errorMessage }
    });
  } catch (err) {
    console.error('Error in sendPaymentFailedEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Refund Status Email
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
      notificationType: eventType,
      payload: { refundStatus, refundAmount, transactionId }
    });
  } catch (err) {
    console.error('Error in sendRefundEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Customer Welcome Email
 */
export async function sendCustomerWelcomeEmail({ customerId, name, email, phone }) {
  try {
    if (!email) return { success: false, error: 'Email missing.' };

    const { subject, html, text } = renderWelcomeEmail({ name, email });

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
      notificationType: 'customer_welcome',
      payload: { customerId, name }
    });
  } catch (err) {
    console.error('Error in sendCustomerWelcomeEmail:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Test Email from Admin Portal
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
      <div style="margin-bottom: 6px; color: #4A5568;"><strong>Host:</strong> ${config.EMAIL_HOST || config.SMTP_HOST || 'Standard SMTP'}</div>
      <div style="margin-bottom: 6px; color: #4A5568;"><strong>Port:</strong> ${config.EMAIL_PORT || config.SMTP_PORT || 587}</div>
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
 * 11. Retry Handling: Safe Retry for Failed Emails
 */
export async function retryFailedEmails({ maxRetries = 3, limit = 10, orderId = null } = {}) {
  try {
    const conditions = [`en.status = 'failed'`, `en.retry_count < $1`];
    const params = [maxRetries];
    let pIdx = 2;

    if (orderId) {
      conditions.push(`en.order_id = $${pIdx++}`);
      params.push(parseInt(orderId, 10));
    }

    params.push(limit);

    const failedNotifsRes = await query(
      `SELECT en.*, o.order_number, o.total_amount, o.status AS current_order_status
       FROM email_notifications en
       LEFT JOIN orders o ON en.order_id = o.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY en.created_at ASC
       LIMIT $${pIdx}`,
      params
    );

    const results = [];

    for (const evt of failedNotifsRes.rows) {
      console.log(`🔄 Retrying failed email notification ID ${evt.id} (${evt.notification_type}) for [${evt.recipient_email}]...`);

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

      if (evt.notification_type === 'order_confirmation' || evt.notification_type === 'order_received') {
        retryRes = await sendOrderConfirmationEmail({ order });
      } else if (evt.notification_type === 'payment_confirmation_customer' || evt.notification_type === 'payment_confirmation_admin' || evt.notification_type === 'payment_success') {
        retryRes = await sendPaymentConfirmationEmail({ order });
      } else if (evt.notification_type === 'payment_failed') {
        retryRes = await sendPaymentFailedEmail({ order });
      } else if (evt.notification_type === 'order_cancelled_customer' || evt.notification_type === 'order_cancelled_admin') {
        retryRes = await sendOrderCancelledEmail({ order });
      } else if (evt.notification_type.startsWith('order_status_')) {
        const status = evt.notification_type.replace('order_status_', '');
        retryRes = await sendOrderStatusUpdateEmail({ order, newStatus: status });
      } else if (evt.notification_type.startsWith('refund_')) {
        const refundStatus = evt.notification_type.replace('refund_', '');
        retryRes = await sendRefundEmail({ order, refundStatus });
      } else if (evt.notification_type === 'admin_new_order') {
        retryRes = await sendAdminNewOrderAlert({ order });
      }

      results.push({
        id: evt.id,
        notificationType: evt.notification_type,
        recipient: evt.recipient_email,
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
 * 10. Query Email Notifications / Logs for Admin Dashboard
 */
export async function getEmailNotifications({ page = 1, limit = 20, orderId, status, search } = {}) {
  try {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const conditions = [];
    const params = [];
    let idx = 1;

    if (orderId) {
      conditions.push(`en.order_id = $${idx++}`);
      params.push(parseInt(orderId, 10));
    }

    if (status && status !== 'all') {
      conditions.push(`en.status = $${idx++}`);
      params.push(status.toLowerCase().trim());
    }

    if (search && search.trim() !== '') {
      conditions.push(`(en.recipient_email ILIKE $${idx} OR o.order_number ILIKE $${idx} OR en.notification_type ILIKE $${idx})`);
      params.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*) AS total
       FROM email_notifications en
       LEFT JOIN orders o ON en.order_id = o.id
       ${whereClause}`,
      params
    );

    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    const listParams = [...params, parseInt(limit, 10), offset];
    const eventsRes = await query(
      `SELECT en.*, o.order_number, o.total_amount
       FROM email_notifications en
       LEFT JOIN orders o ON en.order_id = o.id
       ${whereClause}
       ORDER BY en.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      listParams
    );

    return {
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      notifications: eventsRes.rows,
      events: eventsRes.rows
    };
  } catch (err) {
    console.error('Error fetching email notifications:', err);
    return { success: false, error: err.message, notifications: [], events: [] };
  }
}

export const getEmailEvents = getEmailNotifications;
