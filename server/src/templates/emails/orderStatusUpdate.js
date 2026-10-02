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

function formatStatusName(status) {
  if (!status) return 'Updated';
  const clean = status.replace(/_/g, ' ').toLowerCase();
  return clean.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * 2.C Customer Order Status Update Email Template
 * Triggered whenever admin updates the order status.
 */
export function renderOrderStatusUpdateEmail({
  order,
  newStatus,
  previousStatus,
  notes,
  courierPartner,
  trackingNumber,
  trackingUrl
}) {
  const brandName = config.business?.brandName || 'ZEBA';
  const customerName = escapeHtml(order.customer?.name || order.customer_name || 'Valued Customer');
  const orderNumber = escapeHtml(order.orderNumber || order.order_number || '');
  const totalAmount = parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2);
  const statusKey = (newStatus || order.status || 'confirmed').toLowerCase().trim();
  const formattedNewStatus = formatStatusName(statusKey);
  const formattedPrevStatus = previousStatus ? formatStatusName(previousStatus) : null;

  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const orderTrackUrl = trackingUrl || `${appUrl}/track?order=${encodeURIComponent(orderNumber)}`;

  const updatedDateTime = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });

  // Status configs
  const statusMeta = {
    pending: {
      badge: 'ORDER PENDING',
      title: 'Order Awaiting Verification',
      icon: '⏳',
      color: '#B7791F',
      pillBg: '#FEFCBF',
      pillColor: '#744210',
      description: `Your order <strong>#${orderNumber}</strong> has been placed and is currently pending verification.`
    },
    confirmed: {
      badge: 'ORDER CONFIRMED',
      title: 'Order Confirmed',
      icon: '✅',
      color: '#0E1B4D',
      pillBg: '#E6FFFA',
      pillColor: '#047481',
      description: `Your order <strong>#${orderNumber}</strong> has been successfully confirmed. Our team has queued your package for fulfillment.`
    },
    processing: {
      badge: 'IN PROCESSING',
      title: 'Order In Processing',
      icon: '⚙️',
      color: '#7B341E',
      pillBg: '#FFFAF0',
      pillColor: '#975A16',
      description: `Great news! Your ZEBA Period Pain Relief Heating Pads are now being processed and readied for dispatch.`
    },
    packed: {
      badge: 'ORDER PACKED',
      title: 'Order Packed & Ready for Dispatch',
      icon: '📦',
      color: '#7B341E',
      pillBg: '#FFFAF0',
      pillColor: '#975A16',
      description: `Your order <strong>#${orderNumber}</strong> has been carefully packed in 100% plain, discreet packaging and is awaiting courier pickup.`
    },
    shipped: {
      badge: 'PARCEL DISPATCHED',
      title: 'Your Order Has Been Shipped!',
      icon: '🚚',
      color: '#1A365D',
      pillBg: '#EBF8FF',
      pillColor: '#2B6CB0',
      description: `Your package has been handed over to our courier partner and is on its way to your doorstep!`
    },
    out_for_delivery: {
      badge: 'OUT FOR DELIVERY',
      title: 'Out for Delivery Today',
      icon: '🛵',
      color: '#2C5282',
      pillBg: '#EBF8FF',
      pillColor: '#2C5282',
      description: `Your ZEBA parcel is out for delivery today with the delivery agent. Please be available to receive your order.`
    },
    delivered: {
      badge: 'DELIVERED SUCCESSFULLY',
      title: 'Order Delivered Successfully!',
      icon: '🎉',
      color: '#22543D',
      pillBg: '#F0FFF4',
      pillColor: '#276749',
      description: `Your order <strong>#${orderNumber}</strong> has been delivered! We hope our soothing, air-activated heat therapy brings you comforting relief.`
    },
    cancelled: {
      badge: 'ORDER CANCELLED',
      title: 'Order Cancelled',
      icon: '❌',
      color: '#742A2A',
      pillBg: '#FFF5F5',
      pillColor: '#C53030',
      description: `Your order <strong>#${orderNumber}</strong> has been cancelled.`
    }
  };

  const currentMeta = statusMeta[statusKey] || {
    badge: `ORDER ${formattedNewStatus.toUpperCase()}`,
    title: `Order is now ${formattedNewStatus}`,
    icon: 'ℹ️',
    color: '#0E1B4D',
    pillBg: '#EBF8FF',
    pillColor: '#2B6CB0',
    description: `Your order <strong>#${orderNumber}</strong> status has been updated to <strong>${formattedNewStatus}</strong>.`
  };

  const courier = courierPartner || order.courierPartner || order.courier_partner;
  const trackingNum = trackingNumber || order.trackingNumber || order.tracking_number;
  const trackingNotes = notes || order.notes;

  const items = order.items || [];
  const itemsHtml = items.length > 0 ? `
    <div style="margin: 20px 0;">
      <h4 style="color: #0E1B4D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; border-bottom: 1px solid #EDF2F7; padding-bottom: 4px;">Order Summary</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        ${items.map(i => `
          <tr>
            <td style="padding: 6px 0; color: #0E1B4D;"><strong>${escapeHtml(i.productName || i.product_name || 'ZEBA Pad')}</strong> (${escapeHtml(i.packSize || i.pack_size || '1 Pack')})</td>
            <td style="padding: 6px 0; text-align: center; color: #718096;">x${i.quantity || 1}</td>
            <td style="padding: 6px 0; text-align: right; color: #0E1B4D; font-weight: 700;">&#8377;${parseFloat(i.subtotalPrice || i.subtotal_price || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      <div style="text-align: right; margin-top: 8px; font-weight: 800; color: #FF2D78; font-size: 14px;">
        Total: &#8377;${totalAmount}
      </div>
    </div>
  ` : '';

  const itemsText = items.map(item => ` - ${item.productName || item.product_name} x ${item.quantity || 1}`).join('\n');

  const trackingHtml = (courier || trackingNum || trackingNotes) ? `
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px 20px; border-radius: 12px; margin: 20px 0; font-size: 13px;">
      <h4 style="color: #0E1B4D; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        🚚 Shipping &amp; Tracking Information
      </h4>
      ${courier ? `
        <div style="margin-bottom: 6px; color: #4A5568;">
          <strong style="color: #0E1B4D;">Courier Partner:</strong> ${escapeHtml(courier)}
        </div>
      ` : ''}
      ${trackingNum ? `
        <div style="margin-bottom: 6px; color: #4A5568;">
          <strong style="color: #0E1B4D;">Tracking / AWB Number:</strong> 
          <span style="font-family: monospace; font-weight: 700; color: #FF2D78; background: #FFF0F6; padding: 2px 8px; border-radius: 4px; border: 1px solid #FED7E2;">${escapeHtml(trackingNum)}</span>
        </div>
      ` : ''}
      ${trackingNotes ? `
        <div style="margin-top: 6px; color: #718096; font-size: 12px;">
          <strong>Notes:</strong> ${escapeHtml(trackingNotes)}
        </div>
      ` : ''}
    </div>
  ` : '';

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: ${currentMeta.pillBg}; color: ${currentMeta.pillColor}; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid rgba(0,0,0,0.08); margin-bottom: 10px;">
        ${currentMeta.icon} Status: ${formattedNewStatus}
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">${currentMeta.title}</h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">Order Reference: <strong style="color: #0E1B4D;">#${orderNumber}</strong> &bull; ${updatedDateTime}</p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
      Hi <strong>${customerName}</strong>,<br>
      ${currentMeta.description}
    </p>

    <!-- Transition info box -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px 18px; border-radius: 12px; margin-bottom: 16px; font-size: 13px; color: #4A5568;">
      ${formattedPrevStatus ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #718096;">Previous Status:</span>
          <strong>${formattedPrevStatus}</strong>
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #718096;">New Status:</span>
        <strong style="color: #FF2D78;">${formattedNewStatus}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #718096;">Updated At:</span>
        <span>${updatedDateTime}</span>
      </div>
    </div>

    ${trackingHtml}
    ${itemsHtml}
  `;

  const html = renderEmailLayout({
    title: `Order Update — #${orderNumber} is now ${formattedNewStatus}`,
    preheader: `Update on your ZEBA order #${orderNumber}: ${currentMeta.title}.`,
    badge: currentMeta.badge,
    contentHtml,
    ctaText: 'Track Your Order Live',
    ctaUrl: orderTrackUrl,
    footerNote: statusKey === 'delivered'
      ? 'We love hearing from you! Please reach out if you have any questions or feedback.'
      : 'All ZEBA parcels are shipped in 100% plain, discreet packaging for your privacy.'
  });

  const text = `Order Update — #${orderNumber} is now ${formattedNewStatus}
Store: ${brandName}
Order Number: ${orderNumber}
Customer: ${order.customer?.name || order.customer_name || 'Customer'}
Previous Status: ${formattedPrevStatus || 'N/A'}
New Status: ${formattedNewStatus}
Updated At: ${updatedDateTime}

${courier ? `Courier: ${courier}\n` : ''}${trackingNum ? `Tracking Number: ${trackingNum}\n` : ''}${trackingNotes ? `Notes: ${trackingNotes}\n` : ''}
${itemsText ? `Items:\n${itemsText}\n` : ''}Total Amount: Rs. ${totalAmount}

Track live: ${orderTrackUrl}
Support: ${config.CONTACT_EMAIL || 'care@zebaofficial.in'}`;

  return {
    subject: `Order Update — #${orderNumber} is now ${formattedNewStatus}`,
    html,
    text
  };
}
