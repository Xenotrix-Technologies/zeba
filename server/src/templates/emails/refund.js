import { renderEmailLayout } from './baseLayout.js';
import { config } from '../../config/env.js';

export function renderRefundEmail({
  order,
  refundStatus = 'initiated',
  refundAmount,
  reason,
  transactionId
}) {
  const customerName = order.customer?.name || order.customer_name || 'Valued Customer';
  const orderNumber = order.orderNumber || order.order_number;
  const amount = parseFloat(refundAmount || order.totalAmount || order.total_amount || 0).toFixed(2);
  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const statusKey = refundStatus.toLowerCase().trim();

  let badge = 'REFUND INITIATED';
  let title = 'Refund Initiated';
  let icon = '💸';
  let headerBg = 'linear-gradient(135deg, #1A365D 0%, #2A4365 100%)';
  let pill = { bg: '#EBF8FF', text: '#2B6CB0', border: '#BEE3F8', label: 'Refund in Progress' };
  let description = `A refund of <strong>&#8377;${amount}</strong> for order <strong>#${orderNumber}</strong> has been initiated. The funds will be credited to your original payment method (bank account/UPI/card) within 3&ndash;5 business days.`;

  if (statusKey === 'completed' || statusKey === 'processed') {
    badge = 'REFUND COMPLETED';
    title = 'Refund Processed Successfully';
    icon = '✅';
    headerBg = 'linear-gradient(135deg, #1C4532 0%, #276749 100%)';
    pill = { bg: '#F0FFF4', text: '#276749', border: '#C6F6D5', label: 'Refund Completed' };
    description = `Your refund of <strong>&#8377;${amount}</strong> for order <strong>#${orderNumber}</strong> has been successfully processed and transferred to your payment provider.`;
  } else if (statusKey === 'failed') {
    badge = 'REFUND NOTICE';
    title = 'Refund Processing Delay';
    icon = '⚠️';
    headerBg = 'linear-gradient(135deg, #742A2A 0%, #9B2C2C 100%)';
    pill = { bg: '#FFF5F5', text: '#C53030', border: '#FEB2B2', label: 'Manual Review Required' };
    description = `We encountered an issue processing the automated refund for order <strong>#${orderNumber}</strong>. Our finance support team is manually reviewing your transaction and will contact you shortly.`;
  }

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: ${pill.bg}; color: ${pill.text}; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid ${pill.border}; margin-bottom: 10px;">
        ${icon} ${pill.label}
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">${title}</h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">Order Reference: <strong style="color: #0E1B4D;">${orderNumber}</strong> &bull; Refund Amount: <strong style="color: #38A169;">&#8377;${amount}</strong></p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      Hi <strong>${customerName}</strong>,<br>
      ${description}
    </p>

    <!-- Refund Details Box -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px 20px; border-radius: 12px; margin-bottom: 22px; font-size: 13px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #4A5568;">
        <span>Order Reference:</span>
        <strong style="color: #0E1B4D;">${orderNumber}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #4A5568;">
        <span>Refund Amount:</span>
        <strong style="color: #38A169; font-size: 15px;">&#8377;${amount}</strong>
      </div>
      ${transactionId ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #4A5568;">
          <span>Transaction / Refund ID:</span>
          <span style="font-family: monospace; font-weight: 600; color: #2B6CB0;">${transactionId}</span>
        </div>
      ` : ''}
      ${reason ? `
        <div style="display: flex; justify-content: space-between; color: #718096; font-size: 12px; margin-top: 6px; border-top: 1px dashed #E2E8F0; padding-top: 6px;">
          <span>Reason:</span>
          <span>${reason}</span>
        </div>
      ` : ''}
    </div>
  `;

  const html = renderEmailLayout({
    title: `Refund Update: ZEBA Order #${orderNumber}`,
    preheader: `${title} for ZEBA order #${orderNumber} (₹${amount}).`,
    badge,
    headerBg,
    contentHtml,
    ctaText: 'Visit ZEBA Store',
    ctaUrl: appUrl,
    footerNote: 'If your refund is not reflected in your bank statement after 5 business days, please message ZEBA Care on WhatsApp.'
  });

  const text = `Refund Update: ZEBA Order #${orderNumber}. Status: ${title}. Refund Amount: ₹${amount}.`;

  return {
    subject: `${icon} ${title}: ZEBA Order #${orderNumber}`,
    html,
    text
  };
}
