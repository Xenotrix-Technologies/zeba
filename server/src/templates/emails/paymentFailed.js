import { renderEmailLayout } from './baseLayout.js';
import { config } from '../../config/env.js';

export function renderPaymentFailedEmail({ order, errorMessage, retryUrl }) {
  const customerName = order.customer?.name || order.customer_name || 'Valued Customer';
  const orderNumber = order.orderNumber || order.order_number;
  const totalAmount = parseFloat(order.totalAmount || order.total_amount || 0).toFixed(2);
  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const checkoutRetryUrl = retryUrl || `${appUrl}/checkout?retry=${encodeURIComponent(orderNumber)}`;

  const safeError = errorMessage && !errorMessage.includes('secret') && !errorMessage.includes('sql')
    ? errorMessage
    : 'The payment transaction could not be completed by your issuing bank or UPI application.';

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #FFF5F5; color: #C53030; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #FEB2B2; margin-bottom: 10px;">
        &#9888; Payment Incomplete &bull; Action Required
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">Payment Notice</h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">Order Reference: <strong style="color: #0E1B4D;">${orderNumber}</strong></p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      Hi <strong>${customerName}</strong>,<br>
      We noticed that your recent payment attempt of <strong>&#8377;${totalAmount}</strong> for order <strong>#${orderNumber}</strong> was not completed.
    </p>

    <!-- Error Reason Box -->
    <div style="background-color: #FFF5F5; border-left: 4px solid #E53E3E; padding: 16px 18px; border-radius: 8px; margin-bottom: 22px;">
      <p style="margin: 0; font-size: 13px; color: #9B2C2C; line-height: 1.5;">
        <strong>Transaction Status:</strong> ${safeError}
      </p>
    </div>

    <!-- Assurance Note -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px 18px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; color: #4A5568; line-height: 1.6;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #0E1B4D;">Was your bank account debited?</p>
      <p style="margin: 0; color: #718096; font-size: 12px;">
        If money was deducted from your account, it will be automatically refunded by your bank or UPI provider within 3&ndash;5 business days. No money was captured by ZEBA for this order.
      </p>
    </div>

    <p style="color: #4A5568; font-size: 13px; line-height: 1.6;">
      Your selected items are still saved. You can securely retry checkout anytime with cards, UPI, or Net Banking.
    </p>
  `;

  const html = renderEmailLayout({
    title: `Payment Incomplete: ZEBA Order #${orderNumber}`,
    preheader: `Payment attempt for ZEBA order #${orderNumber} was not completed. Click to safely retry.`,
    badge: 'PAYMENT INCOMPLETE',
    headerBg: 'linear-gradient(135deg, #742A2A 0%, #9B2C2C 100%)',
    contentHtml,
    ctaText: 'Retry Checkout & Complete Order',
    ctaUrl: checkoutRetryUrl,
    footerNote: 'Need help completing your order? Reach out on WhatsApp or email our support team directly.'
  });

  const text = `Payment Incomplete for ZEBA Order #${orderNumber} (₹${totalAmount}). Reason: ${safeError}. Retry checkout: ${checkoutRetryUrl}`;

  return {
    subject: `⚠️ Payment Incomplete: ZEBA Order #${orderNumber}`,
    html,
    text
  };
}
