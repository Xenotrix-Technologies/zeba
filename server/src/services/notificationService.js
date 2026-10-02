import {
  sendEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancelledEmail,
  sendAdminNewOrderAlert,
  sendOrderReceivedEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendOrderStatusEmail,
  sendCancellationEmail,
  sendRefundEmail,
  sendAdminNewOrderEmail,
  sendCustomerWelcomeEmail,
  verifySmtpConnection,
  retryFailedEmails,
  getEmailNotifications,
  getEmailEvents,
  getEmailTransporter,
  getSenderAddress,
  isValidEmail
} from './emailService.js';
import { query } from '../config/db.js';
import { config } from '../config/env.js';

export {
  sendEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancelledEmail,
  sendAdminNewOrderAlert,
  sendOrderReceivedEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendOrderStatusEmail,
  sendCancellationEmail,
  sendRefundEmail,
  sendAdminNewOrderEmail,
  sendCustomerWelcomeEmail,
  verifySmtpConnection,
  retryFailedEmails,
  getEmailNotifications,
  getEmailEvents,
  getEmailTransporter,
  getSenderAddress,
  isValidEmail
};

/**
 * Generate formatted WhatsApp message for order status update
 */
export function generateWhatsAppMessage(order, newStatus, trackingNotes) {
  const statusLabels = {
    pending: '⏳ Pending Confirmation',
    confirmed: '✅ Order Confirmed',
    processing: '📦 Order Being Packed',
    shipped: '🚚 Order Dispatched & On The Way',
    out_for_delivery: '🛵 Out For Delivery Today',
    delivered: '🎉 Delivered Successfully',
    cancelled: '❌ Order Cancelled',
    refunded: '💸 Refund Processed'
  };

  const statusEmoji = statusLabels[newStatus] || newStatus;

  let message = `Hi ${order.customer_name || order.customer?.name || 'Customer'},\n\n`;
  message += `Here is an update on your *ZEBA Period Pain Relief Heating Pad* order:\n\n`;
  message += `*Order Reference:* ${order.order_number || order.orderNumber}\n`;
  message += `*Current Status:* ${statusEmoji}\n`;
  message += `*Total Amount:* ₹${parseFloat(order.total_amount || order.totalAmount || 0).toFixed(2)}\n\n`;

  if (trackingNotes && trackingNotes.trim()) {
    message += `*Tracking / Delivery Notes:* ${trackingNotes.trim()}\n\n`;
  }

  if (newStatus === 'shipped') {
    message += `Your parcel has been dispatched in 100% plain, discreet packaging.\n\n`;
  } else if (newStatus === 'delivered') {
    message += `We hope ZEBA brings you soothing warmth and comfort! Feel free to reach out to us anytime.\n\n`;
  } else if (newStatus === 'cancelled') {
    message += `If payment was deducted, any eligible refund will be processed according to our refund policy.\n\n`;
  }

  message += `Need help? Contact ZEBA Care at ${config.WHATSAPP_DISPLAY || config.CONTACT_PHONE} or reply to this message.`;

  return message;
}

/**
 * Backward compatibility wrapper: sendOrderConfirmationToCustomer
 */
export async function sendOrderConfirmationToCustomer(orderParams) {
  const orderObj = {
    id: orderParams.orderId,
    orderNumber: orderParams.orderNumber,
    customer: orderParams.customer,
    address: orderParams.address,
    items: orderParams.items,
    subtotal: orderParams.subtotal,
    shippingFee: orderParams.shippingFee,
    totalAmount: orderParams.totalAmount,
    createdAt: orderParams.createdAt || new Date()
  };

  return await sendPaymentSuccessEmail({
    order: orderObj,
    razorpayPaymentId: orderParams.razorpayPaymentId
  });
}

/**
 * Backward compatibility wrapper: sendNewOrderAlertToOwner
 */
export async function sendNewOrderAlertToOwner(orderParams) {
  const orderObj = {
    id: orderParams.orderId,
    orderNumber: orderParams.orderNumber,
    customer: orderParams.customer,
    address: orderParams.address,
    items: orderParams.items,
    subtotal: orderParams.subtotal,
    shippingFee: orderParams.shippingFee,
    totalAmount: orderParams.totalAmount,
    createdAt: orderParams.createdAt || new Date()
  };

  return await sendAdminNewOrderEmail({
    order: orderObj,
    razorpayPaymentId: orderParams.razorpayPaymentId,
    razorpayOrderId: orderParams.razorpayOrderId
  });
}

/**
 * Backward compatibility wrapper: sendPaymentFailedNotification
 */
export async function sendPaymentFailedNotification({
  orderId,
  orderNumber,
  customerName,
  customerEmail,
  totalAmount,
  errorMessage
}) {
  const orderObj = {
    id: orderId,
    orderNumber,
    customer: { name: customerName, email: customerEmail },
    totalAmount
  };

  return await sendPaymentFailedEmail({
    order: orderObj,
    errorMessage
  });
}

/**
 * Backward compatibility wrapper: sendCustomerStatusNotification
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
  totalAmount,
  courierPartner,
  trackingNumber
}) {
  const orderObj = {
    id: orderId,
    orderNumber,
    customer: { name: customerName, email: customerEmail, phone: customerPhone },
    totalAmount,
    paymentStatus,
    courierPartner,
    trackingNumber,
    notes
  };

  // WhatsApp record
  const whatsappMessage = generateWhatsAppMessage(orderObj, status, notes);
  try {
    await query(
      `INSERT INTO order_notifications (order_id, notification_type, recipient, status_sent, message)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (order_id, notification_type) DO NOTHING`,
      [orderId, `whatsapp_status_${status}`, customerPhone, status, whatsappMessage]
    );
  } catch (_) {}

  const emailRes = await sendOrderStatusEmail({
    order: orderObj,
    newStatus: status,
    notes,
    courierPartner,
    trackingNumber
  });

  return {
    success: emailRes.success,
    whatsappMessage,
    customerPhone,
    customerEmail,
    ...emailRes
  };
}
