import { config } from '../../config/env.js';

export function renderAdminNewOrderEmail({ order, razorpayPaymentId, razorpayOrderId }) {
  const brandName = config.business?.brandName || 'ZEBA';
  const customer = order.customer || {};
  const customerName = customer.name || order.customer_name || 'Customer';
  const customerEmail = customer.email || order.customer_email || 'N/A';
  const customerPhone = customer.phone || order.customer_phone || 'N/A';
  const orderNumber = order.orderNumber || order.order_number;
  const orderId = order.id;
  const totalAmount = parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2);
  const paymentStatus = (order.paymentStatus || order.payment_status || 'paid').toUpperCase();
  const rzpPayId = razorpayPaymentId || order.razorpayPaymentId || order.razorpay_payment_id || 'VERIFIED';
  const address = order.address || {};
  const items = order.items || [];
  const orderDate = new Date(order.createdAt || order.created_at || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const adminOrderUrl = `${appUrl}/admin/orders/${orderId || orderNumber}`;

  const itemsRows = items.map(item => {
    const name = item.productName || item.product_name || 'ZEBA Heating Pad';
    const pack = item.packSize || item.pack_size || '1 Pack';
    const qty = item.quantity || 1;
    const price = parseFloat(item.subtotalPrice || item.subtotal_price || (item.unitPrice * qty) || 0).toFixed(2);

    return `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #1E3170; padding-bottom: 8px;">
        <div>
          <strong style="color: #FFFFFF; font-size: 13px;">${name}</strong><br>
          <span style="color: #E5C06E; font-size: 11px; font-weight: 700;">${pack}</span>
        </div>
        <div style="text-align: right;">
          <span style="color: #CBD5E0; font-size: 12px;">Qty: ${qty}</span><br>
          <strong style="color: #FF2D78; font-size: 13px;">&#8377;${price}</strong>
        </div>
      </div>
    `;
  }).join('');

  const addressLine1 = address.houseBuilding || address.house_building || '';
  const addressLine2 = [address.street, address.area].filter(Boolean).join(', ');
  const addressLine3 = `${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Order Alert: #${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #081033; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FFFFFF;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #081033; padding: 24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 0 auto; background-color: #0E1B4D; border-radius: 20px; overflow: hidden; border: 1px solid #1E3170; box-shadow: 0 8px 30px rgba(0,0,0,0.4);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #172A6B 0%, #0E1B4D 100%); padding: 28px 24px; text-align: center; border-bottom: 2px solid #FF2D78;">
              <div style="display: inline-block; padding: 4px 14px; background-color: rgba(255, 45, 120, 0.2); border-radius: 20px; margin-bottom: 10px; border: 1px solid rgba(255, 45, 120, 0.4);">
                <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #FF2D78;">🚨 NEW STORE ORDER</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #E5C06E; letter-spacing: 1px;">New Customer Order Placed</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #CBD5E0;">${brandName} Fulfillment System &bull; ${orderDate}</p>
            </td>
          </tr>

          <!-- Summary Highlights -->
          <tr>
            <td style="padding: 24px;">
              <div style="background-color: #10235C; padding: 18px 22px; border-radius: 14px; margin-bottom: 20px; border: 1px solid #1E3170;">
                <div style="font-size: 18px; font-weight: 800; color: #E5C06E; margin-bottom: 4px;">
                  Order Reference: #${orderNumber}
                </div>
                <div style="color: #A0AEC0; font-size: 14px; margin-bottom: 6px;">
                  Total Amount: <strong style="color: #FFFFFF; font-size: 18px;">&#8377;${totalAmount}</strong> &bull; <span style="color: #48BB78; font-weight: 700;">${paymentStatus}</span>
                </div>
                <div style="color: #718096; font-size: 11px;">
                  Razorpay Payment ID: <span style="color: #63B3ED; font-family: monospace;">${rzpPayId}</span>
                </div>
              </div>

              <!-- Customer Details -->
              <div style="margin-bottom: 20px;">
                <h3 style="color: #FF2D78; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; border-bottom: 1px solid #1E3170; padding-bottom: 4px;">
                  👤 Customer Information
                </h3>
                <p style="margin: 0; color: #CBD5E0; font-size: 13px; line-height: 1.6;">
                  <strong>Name:</strong> ${customerName}<br>
                  <strong>Mobile Phone:</strong> <a href="tel:${customerPhone}" style="color: #E5C06E; font-weight: 700; text-decoration: none;">${customerPhone}</a><br>
                  <strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #63B3ED; text-decoration: none;">${customerEmail}</a>
                </p>
              </div>

              <!-- Shipping Address -->
              <div style="margin-bottom: 20px;">
                <h3 style="color: #FF2D78; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; border-bottom: 1px solid #1E3170; padding-bottom: 4px;">
                  📍 Delivery Address
                </h3>
                <div style="background-color: #10235C; padding: 14px 18px; border-radius: 10px; color: #E2E8F0; font-size: 13px; line-height: 1.5;">
                  ${addressLine1 ? `<strong>${addressLine1}</strong><br>` : ''}
                  ${addressLine2 ? `${addressLine2}<br>` : ''}
                  <strong>${addressLine3}</strong><br>
                  India
                </div>
              </div>

              <!-- Ordered Products -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #FF2D78; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; border-bottom: 1px solid #1E3170; padding-bottom: 4px;">
                  📦 Ordered Items
                </h3>
                <div style="background-color: #10235C; padding: 16px 18px; border-radius: 10px;">
                  ${itemsRows}
                </div>
              </div>

              <!-- Admin Action CTA -->
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="${adminOrderUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #FF2D78 0%, #D00A52 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 14px rgba(255, 45, 120, 0.4);">
                  Open in Admin Portal &amp; Dispatch &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #081033; padding: 16px; text-align: center; color: #718096; font-size: 11px;">
              ${brandName} E-Commerce Fulfillment Engine &bull; Automated Security Notification
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `NEW ZEBA ORDER: #${orderNumber} for ₹${totalAmount} from ${customerName} (${customerPhone}, ${customerEmail}). Admin link: ${adminOrderUrl}`;

  return {
    subject: `🚨 New ZEBA Order — #${orderNumber} (₹${totalAmount}) from ${customerName}`,
    html,
    text
  };
}
