import { renderEmailLayout } from './baseLayout.js';
import { config } from '../../config/env.js';

export function renderOrderStatusEmail({
  order,
  newStatus,
  previousStatus,
  notes,
  courierPartner,
  trackingNumber,
  trackingUrl,
  cancellationReason,
  refundStatus
}) {
  const customerName = order.customer?.name || order.customer_name || 'Valued Customer';
  const orderNumber = order.orderNumber || order.order_number;
  const totalAmount = parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2);
  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const orderTrackUrl = trackingUrl || `${appUrl}/track?order=${encodeURIComponent(orderNumber)}`;
  const status = (newStatus || order.status || 'confirmed').toLowerCase().trim();

  // Status configuration definitions
  const statusConfig = {
    confirmed: {
      badge: 'ORDER CONFIRMED',
      title: 'Order Confirmed',
      icon: '✅',
      color: '#0E1B4D',
      bgGradient: 'linear-gradient(135deg, #0E1B4D 0%, #172A6B 100%)',
      statusPill: { bg: '#E6FFFA', text: '#047481', border: '#B2F5EA', label: 'Confirmed & In Queue' },
      description: `Your order <strong>#${orderNumber}</strong> has been confirmed! Our warehouse team has received your order and queued it for packing.`
    },
    processing: {
      badge: 'ORDER IN PROCESSING',
      title: 'Order Being Packed',
      icon: '📦',
      color: '#7B341E',
      bgGradient: 'linear-gradient(135deg, #5F370E 0%, #975A16 100%)',
      statusPill: { bg: '#FFFAF0', text: '#975A16', border: '#FEEBC8', label: 'Packing & Preparing' },
      description: `Great news! Your ZEBA Period Pain Relief Heating Pads are now being carefully inspected, boxed, and prepared for dispatch in 100% plain, discreet packaging.`
    },
    shipped: {
      badge: 'PARCEL DISPATCHED',
      title: 'Your Order is on the Way!',
      icon: '🚚',
      color: '#1A365D',
      bgGradient: 'linear-gradient(135deg, #1A365D 0%, #2A4365 100%)',
      statusPill: { bg: '#EBF8FF', text: '#2B6CB0', border: '#BEE3F8', label: 'Dispatched & In Transit' },
      description: `Your parcel has been handed over to our courier partner. It is now speeding its way to your delivery address in 100% plain, unmarked packaging.`
    },
    out_for_delivery: {
      badge: 'OUT FOR DELIVERY',
      title: 'Out for Delivery Today!',
      icon: '🛵',
      color: '#2C5282',
      bgGradient: 'linear-gradient(135deg, #2B6CB0 0%, #3182CE 100%)',
      statusPill: { bg: '#EBF8FF', text: '#2C5282', border: '#BEE3F8', label: 'Out for Delivery Today' },
      description: `Your ZEBA package is out for delivery today with the courier agent. Please ensure someone is available at your doorstep to receive the parcel.`
    },
    delivered: {
      badge: 'DELIVERED SUCCESSFULLY',
      title: 'Package Delivered!',
      icon: '🎉',
      color: '#22543D',
      bgGradient: 'linear-gradient(135deg, #1C4532 0%, #276749 100%)',
      statusPill: { bg: '#F0FFF4', text: '#276749', border: '#C6F6D5', label: 'Delivered Successfully' },
      description: `Your ZEBA Period Pain Relief Heating Pads have been successfully delivered! We hope our gentle, air-activated heat therapy brings you soothing warmth and comforting relief.`
    },
    cancelled: {
      badge: 'ORDER CANCELLED',
      title: 'Order Cancelled',
      icon: '❌',
      color: '#742A2A',
      bgGradient: 'linear-gradient(135deg, #742A2A 0%, #9B2C2C 100%)',
      statusPill: { bg: '#FFF5F5', text: '#C53030', border: '#FEB2B2', label: 'Order Cancelled' },
      description: `Your order <strong>#${orderNumber}</strong> has been cancelled.${cancellationReason ? `<br><strong>Reason:</strong> ${cancellationReason}` : ''}`
    }
  };

  const currentCfg = statusConfig[status] || statusConfig.confirmed;

  // Tracking information box (only rendered when courier/tracking info is present)
  const courier = courierPartner || order.courierPartner || order.courier_partner;
  const trackingNum = trackingNumber || order.trackingNumber || order.tracking_number;
  const trackingNotes = notes || order.notes;

  const trackingInfoHtml = (courier || trackingNum || trackingNotes) && status !== 'cancelled' ? `
    <div style="background-color: #F7FAFC; border: 1px solid #E2E8F0; padding: 16px 20px; border-radius: 12px; margin: 20px 0; font-size: 13px;">
      <h4 style="color: #0E1B4D; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        Courier &amp; Tracking Information
      </h4>
      ${courier ? `
        <div style="margin-bottom: 6px; color: #4A5568;">
          <strong style="color: #0E1B4D;">Courier Partner:</strong> ${courier}
        </div>
      ` : ''}
      ${trackingNum ? `
        <div style="margin-bottom: 6px; color: #4A5568;">
          <strong style="color: #0E1B4D;">Tracking / AWB Number:</strong> 
          <span style="font-family: monospace; font-weight: 700; color: #FF2D78; background: #FFF0F6; padding: 2px 8px; border-radius: 4px; border: 1px solid #FED7E2;">${trackingNum}</span>
        </div>
      ` : ''}
      ${trackingNotes ? `
        <div style="margin-top: 6px; color: #718096; font-size: 12px;">
          <strong>Notes:</strong> ${trackingNotes}
        </div>
      ` : ''}
    </div>
  ` : '';

  // Cancellation refund note if applicable
  const refundNoteHtml = status === 'cancelled' ? `
    <div style="background-color: #FFF5F5; border-left: 4px solid #E53E3E; padding: 14px 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #9B2C2C;">
      <p style="margin: 0 0 4px 0; font-weight: 700;">Refund Status: ${refundStatus === 'completed' ? 'Refund Processed' : refundStatus === 'requested' || refundStatus === 'processing' ? 'Refund in Progress' : 'Under Review'}</p>
      <p style="margin: 0; font-size: 12px;">
        If you made an online payment, any applicable refund will be processed back to your original payment method in 3&ndash;5 business days.
      </p>
    </div>
  ` : '';

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: ${currentCfg.statusPill.bg}; color: ${currentCfg.statusPill.text}; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid ${currentCfg.statusPill.border}; margin-bottom: 10px;">
        ${currentCfg.icon} ${currentCfg.statusPill.label}
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">${currentCfg.title}</h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">Order Reference: <strong style="color: #0E1B4D;">${orderNumber}</strong> &bull; Total: <strong style="color: #FF2D78;">&#8377;${totalAmount}</strong></p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
      Hi <strong>${customerName}</strong>,<br>
      ${currentCfg.description}
    </p>

    ${trackingInfoHtml}
    ${refundNoteHtml}
  `;

  const html = renderEmailLayout({
    title: `Order #${orderNumber}: ${currentCfg.title}`,
    preheader: `Update on your ZEBA order #${orderNumber}: ${currentCfg.title}.`,
    badge: currentCfg.badge,
    headerBg: currentCfg.bgGradient,
    contentHtml,
    ctaText: status === 'cancelled' ? 'Visit ZEBA Store' : 'Track Order Status Live',
    ctaUrl: status === 'cancelled' ? appUrl : orderTrackUrl,
    footerNote: status === 'delivered'
      ? 'We love hearing from you! Please consider sharing your feedback or reaching out to us on WhatsApp.'
      : 'All ZEBA parcels are shipped in 100% plain, discreet boxes for your privacy.'
  });

  const text = `ZEBA Order #${orderNumber} Update: ${currentCfg.title}. Current Status: ${status.toUpperCase()}. Track: ${orderTrackUrl}`;

  return {
    subject: `${currentCfg.icon} ZEBA Order #${orderNumber} Update: ${currentCfg.title}`,
    html,
    text
  };
}
