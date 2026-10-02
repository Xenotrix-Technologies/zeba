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
 * 2.A Customer Order Confirmation Email Template
 * Triggered upon successful order creation.
 */
export function renderOrderConfirmationEmail({ order }) {
  const brandName = config.business?.brandName || 'ZEBA';
  const customerName = escapeHtml(order.customer?.name || order.customer_name || 'Valued Customer');
  const customerEmail = escapeHtml(order.customer?.email || order.customer_email || '');
  const customerPhone = escapeHtml(order.customer?.phone || order.customer_phone || '');
  const orderNumber = escapeHtml(order.orderNumber || order.order_number || '');
  const totalAmount = parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2);
  const subtotal = parseFloat(order.subtotal || 0).toFixed(2);
  const shippingFee = parseFloat(order.shippingFee ?? order.shipping_fee ?? 0);
  const discountAmount = parseFloat(order.discountAmount ?? order.discount_amount ?? 0);
  const paymentMethod = escapeHtml(order.paymentMethod || order.payment_method || order.payment?.method || 'Razorpay Online (UPI/Cards/NetBanking)');
  const paymentStatus = (order.paymentStatus || order.payment_status || 'pending').toUpperCase();
  const orderStatus = (order.status || 'confirmed').toUpperCase();
  const items = order.items || [];
  const address = order.address || {};
  
  const orderDate = new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });

  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const trackUrl = `${appUrl}/track?order=${encodeURIComponent(orderNumber)}`;

  const itemsHtml = items.map(item => {
    const name = escapeHtml(item.productName || item.product_name || 'ZEBA Heating Pad');
    const pack = escapeHtml(item.packSize || item.pack_size || '1 Pack');
    const qty = parseInt(item.quantity || 1, 10);
    const unitPrice = parseFloat(item.unitPrice || item.unit_price || 0).toFixed(2);
    const linePrice = parseFloat(item.subtotalPrice || item.subtotal_price || (unitPrice * qty)).toFixed(2);

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0E1B4D;">
          <strong style="color: #0E1B4D; font-size: 14px;">${name}</strong><br>
          <span style="font-size: 11px; color: #FF2D78; font-weight: 700; background: #FFF0F6; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 3px;">${pack}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; text-align: center; color: #4A5568;">
          Qty: <strong>${qty}</strong>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; text-align: right; font-weight: 700; color: #0E1B4D;">
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

  const addressLine1 = escapeHtml(address.houseBuilding || address.house_building || '');
  const addressLine2 = [address.street, address.area].filter(Boolean).map(escapeHtml).join(', ');
  const addressLine3 = `${escapeHtml(address.city || '')}, ${escapeHtml(address.state || '')} - ${escapeHtml(address.pincode || '')}`;
  const addressCountry = escapeHtml(address.country || 'India');

  const contentHtml = `
    <!-- Header Status Banner -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #E6FFFA; color: #047481; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #B2F5EA; margin-bottom: 10px;">
        &#10003; Order Confirmed &bull; Reference #${orderNumber}
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">Thank You for Your Order!</h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">Order Date: <strong style="color: #0E1B4D;">${orderDate}</strong></p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      Hi <strong>${customerName}</strong>,<br>
      We're delighted to confirm that your order <strong>#${orderNumber}</strong> has been received and registered in our fulfillment system. Our warehouse team is now preparing your items with 100% plain, discreet packaging.
    </p>

    <!-- Order Metadata Snapshot -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px 18px; border-radius: 12px; margin-bottom: 22px; font-size: 12px; color: #4A5568;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="color: #718096;">Order Number:</span>
        <strong style="color: #0E1B4D; font-family: monospace;">#${orderNumber}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="color: #718096;">Current Order Status:</span>
        <strong style="color: #2B6CB0; text-transform: uppercase;">${orderStatus}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="color: #718096;">Payment Method:</span>
        <strong style="color: #0E1B4D;">${paymentMethod}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #718096;">Payment Status:</span>
        <strong style="color: ${paymentStatus === 'PAID' ? '#2F855A' : '#D69E2E'};">${paymentStatus}</strong>
      </div>
    </div>

    <!-- Order Products Table -->
    <div style="margin-bottom: 22px;">
      <h3 style="color: #0E1B4D; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; border-bottom: 2px solid #FF2D78; padding-bottom: 6px;">
        Ordered Products
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Pricing Summary -->
    <div style="background-color: #F8FAFC; padding: 16px 20px; border-radius: 12px; margin-bottom: 22px; font-size: 13px; border: 1px solid #E2E8F0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #4A5568;">
        <span>Subtotal:</span>
        <span style="font-weight: 600; color: #0E1B4D;">&#8377;${subtotal}</span>
      </div>
      ${discountAmount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #38A169;">
          <span>Discount:</span>
          <span style="font-weight: 600;">-&#8377;${discountAmount.toFixed(2)}</span>
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #4A5568;">
        <span>Discreet Shipping:</span>
        <span style="font-weight: 600; color: #38A169;">${shippingFee === 0 ? 'FREE' : `&#8377;${shippingFee.toFixed(2)}`}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #CBD5E0; font-size: 16px; font-weight: 800; color: #FF2D78;">
        <span>Total Amount:</span>
        <span>&#8377;${totalAmount}</span>
      </div>
    </div>

    <!-- Delivery Address Card -->
    <div style="background-color: #FFF0F6; border: 1px solid #FED7E2; padding: 16px 18px; border-radius: 12px; margin-bottom: 20px;">
      <h4 style="color: #D00A52; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</h4>
      <p style="margin: 0; font-size: 13px; color: #4A5568; line-height: 1.5;">
        <strong style="color: #0E1B4D;">${customerName}</strong> ${customerPhone ? `(${customerPhone})` : ''}<br>
        ${addressLine1 ? `${addressLine1}<br>` : ''}
        ${addressLine2 ? `${addressLine2}<br>` : ''}
        ${addressLine3}<br>
        ${addressCountry}
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: `Order Confirmed — #${orderNumber}`,
    preheader: `Your ZEBA order #${orderNumber} for ₹${totalAmount} has been confirmed.`,
    badge: 'ORDER CONFIRMED',
    contentHtml,
    ctaText: 'Track Your Order Live',
    ctaUrl: trackUrl,
    footerNote: 'All ZEBA parcels are shipped in 100% plain, discreet boxes with zero external mentions of period care.'
  });

  const text = `Order Confirmed — #${orderNumber}
Store: ${brandName}
Order Date: ${orderDate}
Customer Name: ${order.customer?.name || order.customer_name || 'Customer'}
Customer Email: ${order.customer?.email || order.customer_email || ''}
Customer Phone: ${order.customer?.phone || order.customer_phone || ''}

Products:
${itemsText}

Subtotal: Rs. ${subtotal}
Shipping: ${shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee.toFixed(2)}`}
Discount: Rs. ${discountAmount.toFixed(2)}
Total Amount: Rs. ${totalAmount}

Payment Method: ${order.paymentMethod || order.payment_method || 'Razorpay Online'}
Payment Status: ${paymentStatus}
Current Order Status: ${orderStatus}

Shipping Address:
${order.customer?.name || order.customer_name || ''}
${address.houseBuilding || address.house_building || ''}
${[address.street, address.area].filter(Boolean).join(', ')}
${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}
${address.country || 'India'}

Track your order: ${trackUrl}
Support Contact: ${config.CONTACT_EMAIL || 'care@zebaofficial.in'} / WhatsApp: ${config.WHATSAPP_DISPLAY || '+91 70259 61509'}`;

  return {
    subject: `Order Confirmed — #${orderNumber}`,
    html,
    text
  };
}
