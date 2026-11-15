import { config } from '../../config/env.js';
import { renderEmailLayout } from './baseLayout.js';

/**
 * Render Cash on Delivery (COD) Email OTP Verification Template
 *
 * Subject: ZEBA – Verify Your Cash on Delivery Order
 */
export function renderCodOtpEmail({ otp, customerName = '' }) {
  const brandName = config.business?.brandName || 'ZEBA';
  const supportEmail = config.CONTACT_EMAIL || 'info@zebaofficial.in';
  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';

  const subject = `ZEBA – Verify Your Cash on Delivery Order`;

  // Plain Text Version matching exact required specification
  const text = `Hello${customerName ? ` ${customerName}` : ''},

You have requested Cash on Delivery for your order at ZEBA.

Your OTP verification code is:

${otp}

This OTP is valid for 5 minutes.

Please do not share this OTP with anyone.

Thank you for shopping with ZEBA!

ZEBA Team`;

  // Luxury branded HTML Version
  const contentHtml = `
    <div style="font-family: Arial, sans-serif; color: #38283D; line-height: 1.6;">
      <h2 style="color: #38283D; font-size: 20px; margin-top: 0; font-weight: 800;">
        Hello${customerName ? ` ${customerName}` : ''},
      </h2>
      <p style="font-size: 15px; color: #5F3F68; margin-bottom: 24px;">
        You have requested <strong>Cash on Delivery (COD)</strong> for your order at <strong>${brandName}</strong>.
      </p>

      <div style="text-align: center; margin: 32px 0; background: #FFF5FA; border: 2px dashed #FF2D78; border-radius: 16px; padding: 24px 20px;">
        <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #805A82; display: block; margin-bottom: 8px;">
          Your OTP Verification Code
        </span>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #FF2D78; padding: 6px 0;">
          ${otp}
        </div>
        <span style="font-size: 12px; font-weight: 600; color: #D00A52; display: inline-block; margin-top: 8px; background: rgba(255, 45, 120, 0.1); padding: 4px 12px; rounded: 8px; border-radius: 6px;">
          ⏱ Valid for 5 minutes
        </span>
      </div>

      <div style="background: #FDF9FB; border-left: 4px solid #FF2D78; padding: 14px 16px; margin: 24px 0; border-radius: 0 10px 10px 0;">
        <p style="margin: 0; font-size: 13px; color: #5F3F68; font-weight: 600;">
          🔒 Security Notice: Please do not share this OTP with anyone. ZEBA team members will never ask for your OTP.
        </p>
      </div>

      <p style="font-size: 14px; color: #805A82; margin-top: 24px;">
        Thank you for shopping with ZEBA!
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #F2DCE5;">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #38283D;">
          ZEBA Team
        </p>
        <p style="margin: 2px 0 0 0; font-size: 12px; color: #805A82;">
          Natural Heat Therapy for Period Comfort
        </p>
      </div>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Your ZEBA COD verification code is ${otp}. Valid for 5 minutes.`,
    badge: 'CASH ON DELIVERY VERIFICATION',
    headerBg: 'linear-gradient(135deg, #38283D 0%, #5F3F68 100%)',
    contentHtml
  });

  return { subject, html, text };
}
