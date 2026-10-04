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
 * 2.B Payment Confirmation Email Template (Customer & Admin)
 * Triggered only when payment is authoritatively verified on the backend.
 */
export function renderPaymentConfirmationEmail({ order, transactionId, razorpayPaymentId, paymentMethod, isAdmin = false }) {
  const brandName = config.business?.brandName || 'ZEBA';
  const customerName = escapeHtml(order.customer?.name || order.customer_name || 'Valued Customer');
  const customerEmail = escapeHtml(order.customer?.email || order.customer_email || 'N/A');
  const customerPhone = escapeHtml(order.customer?.phone || order.customer_phone || 'N/A');
  const orderNumber = escapeHtml(order.orderNumber || order.order_number || '');
  const totalAmount = parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2);
  const payId = escapeHtml(transactionId || razorpayPaymentId || order.razorpayPaymentId || order.razorpay_payment_id || 'VERIFIED');
  const method = escapeHtml(paymentMethod || order.paymentMethod || order.payment_method || 'Razorpay Online');
  const paymentStatus = 'PAID (VERIFIED)';
  const items = order.items || [];
  const address = order.address || {};
  
  const paymentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });

  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const trackUrl = `${appUrl}/track?order=${encodeURIComponent(orderNumber)}`;
  const adminUrl = `${appUrl}/admin/orders/${order.id || orderNumber}`;

  const itemsHtml = items.map(item => {
    const name = escapeHtml(item.productName || item.product_name || 'ZEBA Heating Pad');
    const pack = escapeHtml(item.packSize || item.pack_size || '1 Pack');
    const qty = parseInt(item.quantity || 1, 10);
    const linePrice = parseFloat(item.subtotalPrice || item.subtotal_price || (item.unitPrice * qty) || 0).toFixed(2);

    return `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0E1B4D;">
          <strong>${name}</strong> (${pack})
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; text-align: center; color: #4A5568;">
          x${qty}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; text-align: right; font-weight: 700; color: #0E1B4D;">
          &#8377;${linePrice}
        </td>
      </tr>
    `;
  }).join('');

  const itemsText = items.map(item => {
    const name = item.productName || item.product_name || 'ZEBA Heating Pad';
    const pack = item.packSize || item.pack_size || '1 Pack';
    const qty = item.quantity || 1;
    const price = parseFloat(item.subtotalPrice || item.subtotal_price || (item.unitPrice * qty) || 0).toFixed(2);
    return ` - ${name} (${pack}) x ${qty} = Rs. ${price}`;
  }).join('\n');

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #E6FFFA; color: #047481; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #B2F5EA; margin-bottom: 10px;">
        &#10003; Payment Verified &bull; Order #${orderNumber}
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">
        ${isAdmin ? 'New Payment Verified (Admin Alert)' : 'Payment Received Successfully!'}
      </h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">Verified on: <strong style="color: #0E1B4D;">${paymentDate}</strong></p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      ${isAdmin
        ? `A new payment of <strong>&#8377;${totalAmount}</strong> has been successfully captured for order <strong>#${orderNumber}</strong> from <strong>${customerName}</strong>.`
        : `Hi <strong>${customerName}</strong>,<br>Your payment of <strong>&#8377;${totalAmount}</strong> for order <strong>#${orderNumber}</strong> has been successfully processed and confirmed. We are now preparing your parcel for dispatch.`
      }
    </p>

    <!-- Verified Payment Details Box -->
    <div style="background-color: #F7FAFC; border: 1px solid #E2E8F0; padding: 18px 20px; border-radius: 12px; margin-bottom: 22px; font-size: 13px; color: #4A5568;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Order Number:</span>
        <strong style="color: #0E1B4D; font-family: monospace;">#${orderNumber}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Transaction / Payment ID:</span>
        <span style="font-family: monospace; font-weight: 700; color: #2B6CB0; background: #EBF8FF; padding: 2px 6px; border-radius: 4px;">${payId}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Payment Amount:</span>
        <strong style="color: #38A169; font-size: 15px;">&#8377;${totalAmount}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Payment Method:</span>
        <strong style="color: #0E1B4D;">${method}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;">
        <span style="color: #718096;">Payment Date:</span>
        <strong style="color: #0E1B4D;">${paymentDate}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #718096;">Payment Status:</span>
        <strong style="color: #2F855A; text-transform: uppercase;">${paymentStatus}</strong>
      </div>
    </div>

    ${isAdmin ? `
      <!-- Admin Customer Summary & Delivery Address -->
      <div style="background-color: #FFF0F6; border: 1px solid #FED7E2; padding: 16px 20px; border-radius: 12px; margin-bottom: 22px; font-size: 13px;">
        <h4 style="color: #D00A52; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800;">
          Customer &amp; Shipping Information
        </h4>
        <div style="margin-bottom: 12px; color: #4A5568; line-height: 1.6;">
          <strong>Name:</strong> ${customerName}<br>
          <strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #2B6CB0; text-decoration: none;">${customerEmail}</a><br>
          <strong>Phone:</strong> <a href="tel:${customerPhone}" style="color: #D00A52; font-weight: 700; text-decoration: none;">${customerPhone}</a>
        </div>
        ${hasAddress ? `
        <div style="border-top: 1px dashed #FEB2B2; padding-top: 10px; margin-top: 10px; color: #2D3748; line-height: 1.5;">
          <strong style="color: #D00A52; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">📍 Delivery Address:</strong>
          ${addressLine1 ? `<span>${addressLine1}</span><br>` : ''}
          ${addressLine2 ? `<span>${addressLine2}</span><br>` : ''}
          <strong>${addressLine3}</strong><br>
          <span>${addressCountry}</span>
        </div>
        ` : ''}
      </div>
    ` : `
      ${hasAddress ? `
      <!-- Customer Delivery Address Card -->
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-size: 13px;">
        <h4 style="color: #2D3748; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
          📍 Delivery Address
        </h4>
        <p style="margin: 0; color: #4A5568; line-height: 1.5;">
          <strong style="color: #0E1B4D;">${customerName}</strong> &bull; ${customerPhone}<br>
          ${addressLine1 ? `${addressLine1}<br>` : ''}
          ${addressLine2 ? `${addressLine2}<br>` : ''}
          ${addressLine3}<br>
          ${addressCountry}
        </p>
      </div>
      ` : ''}
    `}

    <!-- Order Items Summary Table -->
    <div style="margin-bottom: 20px;">
      <h3 style="color: #0E1B4D; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0; border-bottom: 2px solid #FF2D78; padding-bottom: 6px;">
        Order Items
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>
  `;

  const html = renderEmailLayout({
    title: `Payment Confirmed — Order #${orderNumber}`,
    preheader: `Payment of ₹${totalAmount} for order #${orderNumber} has been successfully confirmed.`,
    badge: 'PAYMENT CONFIRMED',
    contentHtml,
    ctaText: isAdmin ? 'View in Admin Dashboard' : 'Track Your Order Live',
    ctaUrl: isAdmin ? adminUrl : trackUrl,
    footerNote: 'All ZEBA orders are packaged with 100% plain, discreet boxes for your privacy.'
  });

  const text = `Payment Confirmed — Order #${orderNumber}
Store: ${brandName}
Order Number: ${orderNumber}
Transaction / Payment ID: ${payId}
Payment Amount: Rs. ${totalAmount}
Payment Method: ${method}
Payment Date: ${paymentDate}
Payment Status: ${paymentStatus}
Customer: ${order.customer?.name || order.customer_name || 'Customer'} (${order.customer?.email || order.customer_email || ''}, ${order.customer?.phone || order.customer_phone || ''})

Shipping Address:
${order.customer?.name || order.customer_name || ''}
${address.houseBuilding || address.house_building || ''}
${[address.street, address.area].filter(Boolean).join(', ')}
${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}
${address.country || 'India'}

Items:
${itemsText}

${isAdmin ? `Admin Portal: ${adminUrl}` : `Track your order: ${trackUrl}`}
Support Contact: ${config.CONTACT_EMAIL || 'care@zebaofficial.in'}`;

  return {
    subject: `Payment Confirmed — Order #${orderNumber}`,
    html,
    text
  };
}
