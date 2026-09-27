import nodemailer from 'nodemailer';
import { query } from '../config/db.js';
import { config } from '../config/env.js';

/**
 * Configure Nodemailer Transporter
 * Works with any SMTP provider (Gmail, SendGrid, Amazon SES, Brevo, Mailgun, or custom SMTP)
 */
function getEmailTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  return null;
}

/**
 * Helper to dispatch an email via Nodemailer or log locally
 */
async function dispatchEmail({ to, subject, html, text }) {
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM || `ZEBA Wellness <${config.CONTACT_EMAIL}>`;
  const transporter = getEmailTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text: text || subject,
        html
      });
      console.log(`📧 Live email dispatched to [${to}] via SMTP: ${info.messageId}`);
      return { sentLive: true, messageId: info.messageId };
    } catch (err) {
      console.warn(`⚠️ SMTP live dispatch error to [${to}]:`, err.message);
      return { sentLive: false, error: err.message };
    }
  } else {
    console.log(`ℹ️ [Email Dispatch Simulator - No SMTP credentials configured]`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   (Full email saved into PostgreSQL notification records)`);
    return { sentLive: false, simulated: true };
  }
}

/**
 * Generate formatted WhatsApp message for order status update
 */
export function generateWhatsAppMessage(order, newStatus, trackingNotes) {
  const statusLabels = {
    pending: '⏳ Pending Confirmation',
    confirmed: '✅ Order Confirmed',
    processing: '📦 Order Being Packed',
    shipped: '🚚 Order Dispatched & On The Way',
    delivered: '🎉 Delivered Successfully',
    cancelled: '❌ Order Cancelled'
  };

  const statusEmoji = statusLabels[newStatus] || newStatus;

  let message = `Hi ${order.customer_name},\n\n`;
  message += `Here is an update on your *ZEBA Period Pain Relief Heating Pad* order:\n\n`;
  message += `*Order Reference:* ${order.order_number}\n`;
  message += `*Current Status:* ${statusEmoji}\n`;
  message += `*Total Amount:* ₹${parseFloat(order.total_amount).toFixed(2)}\n\n`;

  if (trackingNotes && trackingNotes.trim()) {
    message += `*Tracking / Delivery Notes:* ${trackingNotes.trim()}\n\n`;
  }

  if (newStatus === 'shipped') {
    message += `Your parcel has been dispatched in 100% plain, discreet packaging.\n\n`;
  } else if (newStatus === 'delivered') {
    message += `We hope ZEBA brings you soothing warmth and comfort! Feel free to reach out to us anytime.\n\n`;
  }

  message += `Need help? Contact ZEBA Care at ${config.WHATSAPP_DISPLAY || config.CONTACT_PHONE} or reply to this message.`;

  return message;
}

/**
 * 1. Send Congratulation / Welcome Email to newly registered customer
 */
export async function sendCustomerWelcomeEmail({ customerId, name, email, phone }) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS customer_notifications (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const subject = `🎉 Congratulations ${name}! Welcome to ZEBA Period Care`;
    
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF8FB; padding: 28px; border-radius: 20px; border: 1px solid #FFE4EF;">
        
        {/* Brand Header */}
        <div style="background: linear-gradient(135deg, #0E1B4D 0%, #172A6B 100%); padding: 28px; border-radius: 16px; text-align: center; color: #FFFFFF; box-shadow: 0 4px 14px rgba(14, 27, 77, 0.25);">
          <h1 style="color: #E5C06E; margin: 0; font-size: 28px; letter-spacing: 3px; font-family: Georgia, serif;">ZEBA</h1>
          <p style="color: #FDF1C7; font-size: 12px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Periods Pain Relief • Self-Heating Care</p>
        </div>

        <div style="background-color: #FFFFFF; padding: 28px; border-radius: 16px; margin-top: 18px; border: 1px solid #F1EBF3;">
          <h2 style="color: #0E1B4D; font-size: 22px; margin-top: 0;">Congratulations & Welcome, ${name}! 🌸</h2>
          <p style="color: #4A5568; font-size: 14px; line-height: 1.6;">
            Thank you for creating your account with <strong>ZEBA</strong>. We are dedicated to providing women across India with safe, ultra-thin, and air-activated soothing heat therapy for comfortable, worry-free periods.
          </p>

          <div style="background-color: #FFF0F6; border-left: 4px solid #FF2D78; padding: 18px; border-radius: 10px; margin: 22px 0;">
            <p style="margin: 0; font-weight: bold; color: #D00A52; font-size: 14px;">Your Account Benefits:</p>
            <ul style="color: #4A5568; font-size: 13px; margin: 10px 0 0 0; padding-left: 20px; line-height: 1.7;">
              <li><strong>Live Order Tracking:</strong> Track dispatch & courier status in real-time.</li>
              <li><strong>1-Click Quick Checkout:</strong> Saved addresses for fast ordering.</li>
              <li><strong>Free Delivery:</strong> Free Shipping on all orders of ₹499+.</li>
              <li><strong>Discreet Packaging:</strong> 100% confidential plain boxes delivered to your doorstep.</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${config.APP_URL || 'https://www.zebaofficial.in'}/account" style="display: inline-block; background: linear-gradient(135deg, #FF2D78 0%, #D00A52 100%); color: #FFFFFF; text-decoration: none; padding: 13px 32px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(255, 45, 120, 0.35);">
              Access Your Account Dashboard →
            </a>
          </div>

          <p style="color: #718096; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
            Have questions about our 1-Pack or 3-Pack heating pads? Reply directly to this email or chat with us on WhatsApp at <strong>${config.WHATSAPP_DISPLAY || '+91 70259 61509'}</strong>.
          </p>
        </div>

        <div style="text-align: center; color: #A0AEC0; font-size: 11px; margin-top: 18px;">
          © ${new Date().getFullYear()} ZEBA Wellness. All rights reserved. • Designed for Menstrual Comfort.
        </div>
      </div>
    `;

    // Save in PostgreSQL
    await query(
      `INSERT INTO customer_notifications (customer_id, notification_type, recipient, subject, message)
       VALUES ($1, 'email_welcome', $2, $3, $4)`,
      [customerId, email, subject, emailHtml]
    );

    // Dispatch via SMTP if available
    await dispatchEmail({
      to: email,
      subject,
      html: emailHtml,
      text: `Congratulations ${name}! Welcome to ZEBA Period Pain Relief. Visit ${config.APP_URL || 'https://www.zebaofficial.in'}/account to manage your account and orders.`
    });

    console.log(`🎉 Congratulation welcome email sent and logged for ${name} (${email})`);

    return { success: true, subject, emailHtml };
  } catch (err) {
    console.error('Welcome email dispatch error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 2. Send Order Confirmation Email to Customer upon payment/order confirmation
 */
export async function sendOrderConfirmationToCustomer({
  orderId,
  orderNumber,
  customer,
  address,
  items,
  subtotal,
  shippingFee,
  totalAmount,
  razorpayPaymentId
}) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS order_notifications (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        status_sent VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const subject = `✅ Order Confirmed: ZEBA Order #${orderNumber}`;

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0E1B4D;">
          <strong>${item.productName}</strong><br>
          <span style="font-size: 11px; color: #FF2D78; font-weight: 600;">${item.packSize}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; text-align: center; color: #4A5568;">
          Qty: ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; text-align: right; font-weight: bold; color: #0E1B4D;">
          ₹${parseFloat(item.subtotalPrice).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF8FB; padding: 28px; border-radius: 20px; border: 1px solid #FFE4EF;">
        
        {/* Brand Header */}
        <div style="background: linear-gradient(135deg, #0E1B4D 0%, #172A6B 100%); padding: 26px; border-radius: 16px; text-align: center; color: #FFFFFF; box-shadow: 0 4px 14px rgba(14, 27, 77, 0.25);">
          <h1 style="color: #E5C06E; margin: 0; font-size: 28px; letter-spacing: 3px; font-family: Georgia, serif;">ZEBA</h1>
          <p style="color: #FDF1C7; font-size: 12px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Order Confirmed • Discreet Packaging</p>
        </div>

        <div style="background-color: #FFFFFF; padding: 28px; border-radius: 16px; margin-top: 18px; border: 1px solid #F1EBF3;">
          <div style="text-align: center; margin-bottom: 22px;">
            <div style="display: inline-block; background-color: #E6FFFA; color: #047481; padding: 6px 18px; border-radius: 20px; font-weight: bold; font-size: 12px; border: 1px solid #B2F5EA;">
              ✓ Payment Verified (Razorpay)
            </div>
            <h2 style="color: #0E1B4D; font-size: 22px; margin: 12px 0 4px 0;">Thank You for Your Order, ${customer.name}!</h2>
            <p style="color: #718096; font-size: 13px; margin: 0;">Order Reference: <strong style="color: #0E1B4D;">${orderNumber}</strong></p>
          </div>

          {/* Ordered Products Table */}
          <h3 style="color: #0E1B4D; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 2px solid #FF2D78; padding-bottom: 6px;">
            Order Items
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          {/* Pricing Totals */}
          <div style="background-color: #F7FAFC; padding: 18px; border-radius: 12px; margin-bottom: 22px; font-size: 13px; border: 1px solid #EDF2F7;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #4A5568;">
              <span>Subtotal:</span>
              <span style="font-weight: bold; color: #0E1B4D;">₹${parseFloat(subtotal).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #4A5568;">
              <span>Discreet Shipping:</span>
              <span style="font-weight: bold; color: #38A169;">${shippingFee === 0 ? 'FREE' : `₹${parseFloat(shippingFee).toFixed(2)}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #E2E8F0; font-size: 16px; font-weight: bold; color: #FF2D78;">
              <span>Total Paid:</span>
              <span>₹${parseFloat(totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div style="background-color: #FFF0F6; border: 1px solid #FED7E2; padding: 18px; border-radius: 12px; margin-bottom: 22px;">
            <h4 style="color: #D00A52; margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</h4>
            <p style="margin: 0; font-size: 13px; color: #4A5568; line-height: 1.6;">
              <strong style="color: #0E1B4D;">${customer.name}</strong> (${customer.phone})<br>
              ${address.house_building || address.houseBuilding}, ${address.street ? `${address.street}, ` : ''}${address.area ? `${address.area}, ` : ''}<br>
              ${address.city}, ${address.state} - ${address.pincode}, India
            </p>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${config.APP_URL || 'https://www.zebaofficial.in'}/account" style="display: inline-block; background: linear-gradient(135deg, #FF2D78 0%, #D00A52 100%); color: #FFFFFF; text-decoration: none; padding: 13px 32px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(255, 45, 120, 0.35);">
              Track Your Order Live →
            </a>
          </div>

          <p style="color: #718096; font-size: 12px; line-height: 1.5; text-align: center; margin-bottom: 0;">
            Our team is preparing your package in 100% plain, discreet boxes. If you have questions, reach us on WhatsApp at <strong>${config.WHATSAPP_DISPLAY || config.CONTACT_PHONE}</strong> or email <strong>${config.CONTACT_EMAIL}</strong>.
          </p>
        </div>

        <div style="text-align: center; color: #A0AEC0; font-size: 11px; margin-top: 18px;">
          © ${new Date().getFullYear()} ZEBA Wellness. All rights reserved.
        </div>
      </div>
    `;

    // Save in PostgreSQL
    await query(
      `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
       VALUES ($1, 'email_order_confirmed_customer', $2, 'confirmed', $3)`,
      [orderId, customer.email, `${subject}\n\n${emailHtml}`]
    );

    // Send Live Email
    await dispatchEmail({
      to: customer.email,
      subject,
      html: emailHtml,
      text: `Order Confirmed: ZEBA Order #${orderNumber}. Total: ₹${parseFloat(totalAmount).toFixed(2)}. Track your parcel at ${config.APP_URL || 'https://www.zebaofficial.in'}/account`
    });

    console.log(`✉️ Dispatched Order Confirmation email to customer: ${customer.email} (Order: ${orderNumber})`);
    return { success: true, subject, emailHtml };
  } catch (err) {
    console.error('Customer order confirmation dispatch error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Send New Order Alert Email to Owner / Admin with full order & address details
 */
export async function sendNewOrderAlertToOwner({
  orderId,
  orderNumber,
  customer,
  address,
  items,
  subtotal,
  shippingFee,
  totalAmount,
  razorpayPaymentId,
  razorpayOrderId
}) {
  try {
    const ownerEmail = process.env.OWNER_EMAIL || process.env.ADMIN_DEFAULT_EMAIL || config.CONTACT_EMAIL || 'admin@zeba.com';
    const subject = `🚨 [NEW ORDER RECEIVED] #${orderNumber} - ₹${parseFloat(totalAmount).toFixed(2)} from ${customer.name}`;

    const itemsRows = items.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #1E3170; padding-bottom: 8px;">
        <div>
          <strong style="color: #FFFFFF; font-size: 14px;">${item.productName}</strong><br>
          <span style="color: #E5C06E; font-size: 12px; font-weight: bold;">${item.packSize}</span>
        </div>
        <div style="text-align: right;">
          <span style="color: #CBD5E0; font-size: 13px;">Qty: ${item.quantity}</span><br>
          <strong style="color: #FF2D78; font-size: 14px;">₹${parseFloat(item.subtotalPrice).toFixed(2)}</strong>
        </div>
      </div>
    `).join('');

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #0E1B4D; padding: 28px; border-radius: 20px; color: #FFFFFF;">
        
        {/* Header */}
        <div style="background-color: #172A6B; padding: 22px; border-radius: 14px; border: 1px solid #FF2D78; text-align: center;">
          <h2 style="color: #E5C06E; margin: 0; font-size: 22px; letter-spacing: 1px;">🚨 NEW CUSTOMER ORDER RECEIVED</h2>
          <p style="color: #FDF1C7; font-size: 13px; margin: 6px 0 0 0;">ZEBA Periods Pain Relief Store • PostgreSQL Live</p>
        </div>

        <div style="background-color: #081033; padding: 26px; border-radius: 16px; margin-top: 18px; border: 1px solid #1E3170; font-size: 13px; line-height: 1.6;">
          
          <div style="background-color: #10235C; padding: 18px; border-radius: 12px; margin-bottom: 22px;">
            <div style="font-size: 18px; font-weight: bold; color: #E5C06E; margin-bottom: 4px;">
              Order Ref: ${orderNumber}
            </div>
            <div style="color: #A0AEC0; font-size: 14px;">
              Total Amount: <strong style="color: #FFFFFF; font-size: 18px;">₹${parseFloat(totalAmount).toFixed(2)}</strong> (PAID via Razorpay)
            </div>
            <div style="color: #718096; font-size: 11px; margin-top: 4px;">
              Razorpay Payment ID: <span style="color: #48BB78; font-family: monospace;">${razorpayPaymentId || 'TEST_VERIFIED'}</span>
            </div>
          </div>

          {/* Customer Details */}
          <h3 style="color: #FF2D78; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; border-bottom: 1px solid #1E3170; padding-bottom: 4px;">
            👤 Customer Information
          </h3>
          <p style="margin: 0 0 18px 0; color: #CBD5E0; line-height: 1.7;">
            <strong>Name:</strong> ${customer.name}<br>
            <strong>Mobile Phone:</strong> <a href="tel:${customer.phone}" style="color: #E5C06E; text-decoration: none; font-weight: bold;">${customer.phone}</a><br>
            <strong>Email:</strong> <a href="mailto:${customer.email}" style="color: #63B3ED; text-decoration: none;">${customer.email}</a>
          </p>

          {/* Shipping Address */}
          <h3 style="color: #FF2D78; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; border-bottom: 1px solid #1E3170; padding-bottom: 4px;">
            📍 Shipping & Delivery Address
          </h3>
          <div style="background-color: #10235C; padding: 16px; border-radius: 10px; margin-bottom: 20px; color: #E2E8F0; line-height: 1.6;">
            <strong>${address.house_building || address.houseBuilding}</strong><br>
            ${address.street ? `${address.street}, ` : ''}${address.area ? `${address.area}, ` : ''}<br>
            <strong>${address.city}, ${address.state} - ${address.pincode}</strong><br>
            ${address.country || 'India'}
          </div>

          {/* Ordered Products */}
          <h3 style="color: #FF2D78; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; border-bottom: 1px solid #1E3170; padding-bottom: 4px;">
            📦 Ordered Products
          </h3>
          <div style="background-color: #10235C; padding: 16px; border-radius: 10px; margin-bottom: 24px;">
            ${itemsRows}
          </div>

          {/* Action CTA */}
          <div style="text-align: center; margin: 26px 0;">
            <a href="${config.APP_URL || 'https://www.zebaofficial.in'}/admin/orders/${orderId}" style="display: inline-block; background: linear-gradient(135deg, #FF2D78 0%, #D00A52 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(255, 45, 120, 0.4);">
              Open in Admin Portal & Dispatch Parcel →
            </a>
          </div>

        </div>

        <div style="text-align: center; color: #718096; font-size: 11px; margin-top: 18px;">
          ZEBA Automated Order Fulfillment System • PostgreSQL Engine
        </div>
      </div>
    `;

    // Save in PostgreSQL
    await query(
      `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
       VALUES ($1, 'email_new_order_owner', $2, 'confirmed', $3)`,
      [orderId, ownerEmail, `${subject}\n\n${emailHtml}`]
    );

    // Send Live Email
    await dispatchEmail({
      to: ownerEmail,
      subject,
      html: emailHtml,
      text: `NEW ORDER #${orderNumber} - ₹${parseFloat(totalAmount).toFixed(2)} from ${customer.name} (${customer.phone}). Delivery to: ${address.house_building || address.houseBuilding}, ${address.city}, ${address.state} - ${address.pincode}. View: ${config.APP_URL || 'https://www.zebaofficial.in'}/admin/orders/${orderId}`
    });

    console.log(`🚨 Dispatched New Order alert email to Owner: ${ownerEmail} (Order: ${orderNumber} - ₹${totalAmount})`);
    return { success: true, subject, ownerEmail };
  } catch (err) {
    console.error('Owner order alert dispatch error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. Send Status Notification to Customer when Admin updates order status
 */
export async function sendCustomerStatusNotification({
  orderId,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  status,
  paymentStatus,
  notes,
  totalAmount
}) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS order_notifications (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        status_sent VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const orderObj = {
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      total_amount: totalAmount
    };

    const whatsappMessage = generateWhatsAppMessage(orderObj, status, notes);

    const emailSubject = `🔔 Status Update: Your ZEBA Order #${orderNumber} is ${status.toUpperCase()}`;
    const emailBody = `Dear ${customerName},\n\nYour order #${orderNumber} status has been updated to: ${status.toUpperCase()}.\n${notes ? `Delivery / Tracking Notes: ${notes}\n` : ''}\nTotal Amount: ₹${parseFloat(totalAmount).toFixed(2)}\n\nThank you for choosing ZEBA Periods Pain Relief.\nTrack your order anytime: ${config.APP_URL || 'https://www.zebaofficial.in'}/account`;

    const statusHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF8FB; padding: 28px; border-radius: 20px; border: 1px solid #FFE4EF;">
        <div style="background: linear-gradient(135deg, #0E1B4D 0%, #172A6B 100%); padding: 26px; border-radius: 16px; text-align: center; color: #FFFFFF;">
          <h1 style="color: #E5C06E; margin: 0; font-size: 28px; letter-spacing: 3px; font-family: Georgia, serif;">ZEBA</h1>
          <p style="color: #FDF1C7; font-size: 12px; margin: 6px 0 0 0; text-transform: uppercase;">Order Status Update</p>
        </div>

        <div style="background-color: #FFFFFF; padding: 28px; border-radius: 16px; margin-top: 18px; border: 1px solid #F1EBF3;">
          <h2 style="color: #0E1B4D; font-size: 20px; margin-top: 0;">Hi ${customerName},</h2>
          <p style="color: #4A5568; font-size: 14px; line-height: 1.6;">
            Your ZEBA order <strong>#${orderNumber}</strong> has a new update:
          </p>

          <div style="background-color: #FFF0F6; border-left: 4px solid #FF2D78; padding: 16px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; font-size: 15px; color: #0E1B4D;">
              Current Status: <strong style="color: #FF2D78; text-transform: uppercase;">${status}</strong>
            </p>
            ${notes ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #4A5568;"><strong>Tracking / Delivery Notes:</strong> ${notes}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${config.APP_URL || 'https://www.zebaofficial.in'}/account" style="display: inline-block; background: linear-gradient(135deg, #FF2D78 0%, #D00A52 100%); color: #FFFFFF; text-decoration: none; padding: 13px 32px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(255, 45, 120, 0.35);">
              View Order in Account Portal →
            </a>
          </div>

          <p style="color: #718096; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
            Thank you for choosing ZEBA Periods Pain Relief. Contact us on WhatsApp at <strong>${config.WHATSAPP_DISPLAY || '+91 70259 61509'}</strong> if you need any assistance.
          </p>
        </div>

        <div style="text-align: center; color: #A0AEC0; font-size: 11px; margin-top: 18px;">
          © ${new Date().getFullYear()} ZEBA Wellness. All rights reserved.
        </div>
      </div>
    `;

    // Save in PostgreSQL
    await query(
      `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
       VALUES ($1, 'email_status_update', $2, $3, $4)`,
      [orderId, customerEmail, status, `${emailSubject}\n\n${statusHtml}`]
    );

    await query(
      `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
       VALUES ($1, 'whatsapp_status_update', $2, $3, $4)`,
      [orderId, customerPhone, status, whatsappMessage]
    );

    // Send Live Email
    await dispatchEmail({
      to: customerEmail,
      subject: emailSubject,
      html: statusHtml,
      text: emailBody
    });

    console.log(`📨 Dispatched status notification for Order ${orderNumber} -> Status: ${status} to ${customerEmail} & ${customerPhone}`);

    return {
      success: true,
      whatsappMessage,
      customerPhone,
      customerEmail
    };
  } catch (err) {
    console.error('Notification dispatch error:', err);
    return { success: false, error: err.message };
  }
}
