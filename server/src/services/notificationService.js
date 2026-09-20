import { query } from '../config/db.js';

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

  message += `Need help? Contact ZEBA Care at +91 98765 43210 or reply to this message.`;

  return message;
}

/**
 * Send / Log Order Status Notification to Customer
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
    // 1. Ensure order_notifications table exists
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

    // 2. Log Email Notification Record
    const emailSubject = `Update on your ZEBA Order #${orderNumber}: ${status.toUpperCase()}`;
    const emailBody = `Dear ${customerName},\n\nYour order #${orderNumber} status has been updated to: ${status.toUpperCase()}.\n${notes ? `Notes: ${notes}\n` : ''}\nThank you for choosing ZEBA Periods Pain Relief.`;

    await query(
      `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
       VALUES ($1, 'email', $2, $3, $4)`,
      [orderId, customerEmail, status, `${emailSubject}\n\n${emailBody}`]
    );

    // 3. Log WhatsApp / SMS Notification Record
    await query(
      `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
       VALUES ($1, 'whatsapp', $2, $3, $4)`,
      [orderId, customerPhone, status, whatsappMessage]
    );

    console.log(`📨 Dispatched customer notification for Order ${orderNumber} -> Status: ${status} to ${customerEmail} & ${customerPhone}`);

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
