import { renderEmailLayout } from './baseLayout.js';
import { config } from '../../config/env.js';

export function renderWelcomeEmail({ name, email }) {
  const customerName = name || 'Friend';
  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const accountUrl = `${appUrl}/account`;

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #FFF0F6; color: #D00A52; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #FED7E2; margin-bottom: 10px;">
        🌸 Welcome to the ZEBA Family
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">Welcome, ${customerName}!</h2>
      <p style="color: #718096; font-size: 13px; margin: 0;">Your ZEBA Account is Ready</p>
    </div>

    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      Thank you for creating your account with <strong>ZEBA</strong>. We are on a mission to empower women with natural, air-activated heat therapy patches for soothing, uninterrupted period comfort anywhere.
    </p>

    <!-- Account Highlights Box -->
    <div style="background-color: #FFF0F6; border-left: 4px solid #FF2D78; padding: 18px 20px; border-radius: 10px; margin-bottom: 22px;">
      <p style="margin: 0 0 8px 0; font-weight: 800; color: #D00A52; font-size: 13px;">Your Account Privileges:</p>
      <ul style="color: #4A5568; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.7;">
        <li><strong>Live Order Tracking:</strong> Track delivery &amp; courier milestones in real-time.</li>
        <li><strong>Quick 1-Click Checkout:</strong> Saved addresses for effortless reorders.</li>
        <li><strong>Discreet Packaging:</strong> 100% confidential, plain boxes delivered safely.</li>
      </ul>
    </div>
  `;

  const html = renderEmailLayout({
    title: `Welcome to ZEBA Period Care, ${customerName}!`,
    preheader: `Welcome to ZEBA! Your account has been successfully created.`,
    badge: 'WELCOME TO ZEBA',
    contentHtml,
    ctaText: 'Access Your Account Dashboard',
    ctaUrl: accountUrl,
    footerNote: 'Have questions about how ZEBA works? Reply to this email or chat with our team on WhatsApp anytime.'
  });

  const text = `Welcome to ZEBA, ${customerName}! Access your account dashboard at: ${accountUrl}`;

  return {
    subject: `🌸 Welcome to ZEBA Period Care, ${customerName}!`,
    html,
    text
  };
}
