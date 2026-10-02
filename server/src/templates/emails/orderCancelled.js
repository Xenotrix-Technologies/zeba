import { renderEmailLayout } from './baseLayout.js';
import { config } from '../../config/env.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 2.D Order Cancellation Email Template (Customer & Admin)
 * Triggered when an order is cancelled by customer or admin.
 */
export function renderOrderCancelledEmail({
  order,
  reason,
  cancellationReason,
  refundStatus,
  isAdmin = false
}) {
  const brandName = config.business?.brandName || 'ZEBA';
  const customerName = escapeHtml(order.customer?.name || order.customer_name || 'Valued Customer');
  const customerEmail = escapeHtml(order.customer?.email || order.customer_email || 'N/A');
  const customerPhone = escapeHtml(order.customer?.phone || order.customer_phone || 'N/A');
  const orderNumber = escapeHtml(order.orderNumber || order.order_number || '');
  const totalAmount = parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2);
  const cancelReason = escapeHtml(reason || cancellationReason || order.cancellation_reason || order.cancellationReason || 'Cancelled upon request');
  const refStatus = (refundStatus || order.refund_status || (order.payment_status === 'paid' ? 'requested' : 'not_applicable')).toUpperCase();
  const paymentStatus = (order.payment_status || 'pending').toUpperCase();

  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const adminUrl = `${appUrl}/admin/orders/${order.id || orderNumber}`;

  const cancellationDate = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #FFF5F5; color: #C53030; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #FEB2B2; margin-bottom: 10px;">
        &#10005; Order Cancelled &bull; #${orderNumber}
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">
        ${isAdmin ? 'Order Cancellation Notice (Admin)' : 'Your Order Has Been Cancelled'}
      </h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">Cancelled on: <strong style="color: #0E1B4D;">${cancellationDate}</strong></p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      ${isAdmin
        ? `Order <strong>#${orderNumber}</strong> for <strong>&#8377;${totalAmount}</strong> from <strong>${customerName}</strong> has been cancelled.`
        : `Hi <strong>${customerName}</strong>,<br>This email confirms that your ZEBA order <strong>#${orderNumber}</strong> has been cancelled as requested.`
      }
    </p>

    <!-- Cancellation Breakdown Details -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 18px 20px; border-radius: 12px; margin-bottom: 22px; font-size: 13px; color: #4A5568;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Order Number:</span>
        <strong style="color: #0E1B4D; font-family: monospace;">#${orderNumber}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Cancellation Status:</span>
        <strong style="color: #E53E3E;">CANCELLED</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Cancellation Reason:</span>
        <strong style="color: #4A5568;">${cancelReason}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Order Total:</span>
        <strong style="color: #0E1B4D;">&#8377;${totalAmount}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Original Payment Status:</span>
        <strong style="color: #4A5568;">${paymentStatus}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #718096;">Refund Status:</span>
        <strong style="color: ${refStatus === 'COMPLETED' ? '#2F855A' : '#D69E2E'};">${refStatus}</strong>
      </div>
    </div>

    ${paymentStatus === 'PAID' ? `
      <div style="background-color: #FFF5F5; border-left: 4px solid #E53E3E; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #9B2C2C;">
        <p style="margin: 0 0 4px 0; font-weight: 700;">Refund Information</p>
        <p style="margin: 0; font-size: 12px; line-height: 1.5;">
          Since your payment was already captured, our system has queued a full refund of <strong>&#8377;${totalAmount}</strong> to your original payment method. The refund typically reflects in your bank account within 3&ndash;5 business days.
        </p>
      </div>
    ` : ''}

    ${isAdmin ? `
      <div style="background-color: #FFF0F6; border: 1px solid #FED7E2; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-size: 13px;">
        <h4 style="color: #D00A52; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase;">Customer Contact</h4>
        <p style="margin: 0; color: #4A5568; line-height: 1.5;">
          <strong>Name:</strong> ${customerName}<br>
          <strong>Email:</strong> ${customerEmail}<br>
          <strong>Phone:</strong> ${customerPhone}
        </p>
      </div>
    ` : ''}
  `;

  const html = renderEmailLayout({
    title: `Order Cancelled — #${orderNumber}`,
    preheader: `Order #${orderNumber} for ₹${totalAmount} has been cancelled.`,
    badge: 'ORDER CANCELLED',
    contentHtml,
    ctaText: isAdmin ? 'View in Admin Portal' : 'Visit ZEBA Store',
    ctaUrl: isAdmin ? adminUrl : appUrl,
    footerNote: 'Need help or have questions regarding your cancellation or refund? Feel free to contact our support team.'
  });

  const text = `Order Cancelled — #${orderNumber}
Store: ${brandName}
Order Number: ${orderNumber}
Customer: ${order.customer?.name || order.customer_name || 'Customer'}
Cancellation Status: CANCELLED
Cancellation Reason: ${cancelReason}
Order Total: Rs. ${totalAmount}
Payment Status: ${paymentStatus}
Refund Status: ${refStatus}
Cancelled At: ${cancellationDate}

${isAdmin ? `Admin Portal: ${adminUrl}` : `Visit Store: ${appUrl}`}
Support Contact: ${config.CONTACT_EMAIL || 'care@zebaofficial.in'} / WhatsApp: ${config.WHATSAPP_DISPLAY || '+91 70259 61509'}`;

  return {
    subject: `Order Cancelled — #${orderNumber}`,
    html,
    text
  };
}
