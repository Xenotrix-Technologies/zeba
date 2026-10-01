import { renderEmailLayout } from './baseLayout.js';
import { config } from '../../config/env.js';

export function renderOrderReceivedEmail({ order }) {
  const customerName = order.customer?.name || order.customer_name || 'Valued Customer';
  const orderNumber = order.orderNumber || order.order_number;
  const totalAmount = parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2);
  const subtotal = parseFloat(order.subtotal || 0).toFixed(2);
  const shippingFee = parseFloat(order.shippingFee ?? order.shipping_fee ?? 0);
  const discountAmount = parseFloat(order.discountAmount ?? order.discount_amount ?? 0);
  const items = order.items || [];
  const address = order.address || {};
  const orderDate = new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const trackUrl = `${appUrl}/track?order=${encodeURIComponent(orderNumber)}`;

  const itemsHtml = items.map(item => {
    const name = item.productName || item.product_name || 'ZEBA Heating Pad';
    const pack = item.packSize || item.pack_size || '1 Pack';
    const qty = item.quantity || 1;
    const price = parseFloat(item.subtotalPrice || item.subtotal_price || (item.unitPrice * qty) || 0).toFixed(2);

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #0E1B4D;">
          <strong>${name}</strong><br>
          <span style="font-size: 11px; color: #FF2D78; font-weight: 600;">${pack}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; text-align: center; color: #4A5568;">
          Qty: ${qty}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; text-align: right; font-weight: 700; color: #0E1B4D;">
          &#8377;${price}
        </td>
      </tr>
    `;
  }).join('');

  const addressLine1 = address.houseBuilding || address.house_building || '';
  const addressLine2 = [address.street, address.area].filter(Boolean).join(', ');
  const addressLine3 = `${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`;
  const addressPhone = order.customer?.phone || order.customer_phone || '';

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #FFF5F7; color: #D00A52; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #FED7E2; margin-bottom: 10px;">
        &#9203; Order Created &bull; Awaiting Payment Confirmation
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">Order Received</h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">Order Reference: <strong style="color: #0E1B4D;">${orderNumber}</strong> &bull; ${orderDate}</p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      Hi <strong>${customerName}</strong>,<br>
      Thank you for placing your order with <strong>ZEBA</strong>. We have received your order details and it is currently recorded in our fulfillment system.
    </p>

    <!-- Order Items Table -->
    <div style="margin-bottom: 20px;">
      <h3 style="color: #0E1B4D; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0; border-bottom: 2px solid #FF2D78; padding-bottom: 6px;">
        Ordered Items
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Pricing Breakdown Box -->
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
        <span>Final Total:</span>
        <span>&#8377;${totalAmount}</span>
      </div>
    </div>

    <!-- Shipping Address Card -->
    <div style="background-color: #FFF0F6; border: 1px solid #FED7E2; padding: 16px 18px; border-radius: 12px; margin-bottom: 20px;">
      <h4 style="color: #D00A52; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</h4>
      <p style="margin: 0; font-size: 13px; color: #4A5568; line-height: 1.5;">
        <strong style="color: #0E1B4D;">${customerName}</strong> ${addressPhone ? `(${addressPhone})` : ''}<br>
        ${addressLine1 ? `${addressLine1}<br>` : ''}
        ${addressLine2 ? `${addressLine2}<br>` : ''}
        ${addressLine3}<br>
        India
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: `Order Received: ZEBA #${orderNumber}`,
    preheader: `We have received your order #${orderNumber} for ₹${totalAmount}.`,
    badge: 'ORDER RECEIVED',
    contentHtml,
    ctaText: 'View & Track Order',
    ctaUrl: trackUrl,
    footerNote: 'All ZEBA orders are packaged in 100% plain, discreet boxes with zero external mentions of period care.'
  });

  const text = `Order Received: ZEBA Order #${orderNumber} for ₹${totalAmount}. View details at: ${trackUrl}`;

  return {
    subject: `📋 Order Received: ZEBA Order #${orderNumber}`,
    html,
    text
  };
}
