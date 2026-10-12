import { renderEmailLayout } from './baseLayout.js';
import { config } from '../../config/env.js';

/**
 * 1. Admin Alert Email Template
 * Sent to the store admin / care team when a customer submits a contact inquiry.
 */
export function renderContactAdminAlert({ name, email, phone, inquiryType, message, inquiryId, createdAt }) {
  const brandName = config.business?.brandName || 'ZEBA';
  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const category = inquiryType || 'General / Order Support';
  const dateFormatted = new Date(createdAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const rawPhone = (phone || '').replace(/\D/g, '');
  const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const whatsappUrl = rawPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${name}, thank you for contacting ${brandName}. Regarding your inquiry...`)}` : null;

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #FEF3C7; color: #92400E; padding: 4px 14px; border-radius: 20px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border: 1px solid #FDE68A;">
        📬 New Customer Message #${inquiryId || 'NEW'}
      </div>
      <h2 style="color: #0E1B4D; font-size: 22px; margin: 4px 0 6px 0; font-weight: 800;">
        Inquiry from ${name}
      </h2>
      <p style="color: #64748B; font-size: 13px; margin: 0;">
        Received on ${dateFormatted} IST &bull; Category: <strong style="color: #FF2D78;">${category}</strong>
      </p>
    </div>

    <!-- Customer Information Card -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748B; width: 140px; font-weight: 600;">Customer Name:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0E1B4D; font-weight: 700;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748B; font-weight: 600;">Email Address:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0E1B4D;">
            <a href="mailto:${email}" style="color: #FF2D78; font-weight: 700; text-decoration: none;">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748B; font-weight: 600;">Phone Number:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0E1B4D; font-weight: 600;">
            ${phone ? `<a href="tel:${phone}" style="color: #0E1B4D; text-decoration: none;">${phone}</a>` : '<span style="color: #94A3B8; font-style: italic;">Not provided</span>'}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748B; font-weight: 600;">Inquiry Category:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #7C3AED; font-weight: 700;">${category}</td>
        </tr>
      </table>
    </div>

    <!-- Message Content Box -->
    <div style="background: #FFF5F9; border-left: 4px solid #FF2D78; border-radius: 0 12px 12px 0; padding: 20px; margin-bottom: 24px;">
      <h3 style="color: #831843; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; font-weight: 800;">
        Customer Question / Message:
      </h3>
      <p style="color: #1E293B; font-size: 14px; line-height: 1.65; margin: 0; white-space: pre-wrap; font-weight: 500;">${message}</p>
    </div>

    <!-- Quick Action Bar -->
    <div style="background-color: #F1F5F9; border-radius: 12px; padding: 16px; text-align: center;">
      <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
        Quick Response Options
      </p>
      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <a href="mailto:${email}?subject=Re: ZEBA Care - ${encodeURIComponent(category)}" target="_blank" style="display: inline-block; background-color: #0E1B4D; color: #FFFFFF; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13px;">
          ✉️ Reply via Email
        </a>
        ${whatsappUrl ? `
          <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #10B981; color: #FFFFFF; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13px; margin-left: 8px;">
            💬 Chat on WhatsApp
          </a>
        ` : ''}
      </div>
    </div>
  `;

  const html = renderEmailLayout({
    title: `New Inquiry from ${name} - ${brandName} Care`,
    preheader: `New customer inquiry from ${name} (${category}): "${message.substring(0, 60)}..."`,
    badge: 'CUSTOMER INQUIRY ALERT',
    contentHtml,
    ctaText: 'Open Store Admin',
    ctaUrl: `${appUrl}/admin`,
    footerNote: 'You can reply directly to this email to respond to the customer immediately.'
  });

  const text = `New Customer Inquiry:
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Category: ${category}
Date: ${dateFormatted}

Message:
${message}

Reply via Email: mailto:${email}`;

  return {
    subject: `📬 [ZEBA Inquiry] ${category} from ${name}`,
    html,
    text
  };
}

/**
 * 2. Customer Confirmation Email Template
 * Sent to the customer immediately after submitting the form to confirm receipt.
 */
export function renderContactCustomerConfirmation({ name, email, phone, inquiryType, message, inquiryId }) {
  const brandName = config.business?.brandName || 'ZEBA';
  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const category = inquiryType || 'General / Order Support';
  const rawNum = String(config.WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const cleanNum = (!rawNum || rawNum.includes('98765') || rawNum.includes('70259')) ? '917560961509' : (rawNum.length === 10 ? `91${rawNum}` : rawNum);
  const whatsappUrl = `https://wa.me/${cleanNum}`;
  const rawDisplay = String(config.WHATSAPP_DISPLAY || '');
  const whatsappDisplay = (!rawDisplay || rawDisplay.includes('98765') || rawDisplay.includes('70259')) ? '+91 75609 61509' : rawDisplay;

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #ECFDF5; color: #065F46; padding: 6px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #A7F3D0; margin-bottom: 12px;">
        ✨ Inquiry Received
      </div>
      <h2 style="color: #0E1B4D; font-size: 24px; margin: 4px 0 6px 0; font-weight: 800;">
        We've Received Your Message!
      </h2>
      <p style="color: #64748B; font-size: 14px; margin: 0;">
        Hi ${name}, our customer care team is reviewing your question.
      </p>
    </div>

    <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      Thank you for getting in touch with <strong>${brandName}</strong>. A dedicated care specialist will review your details and get back to you within <strong>24 business hours</strong>.
    </p>

    <!-- Copy of Message Box -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
      <h4 style="color: #0E1B4D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; font-weight: 800;">
        Summary of Your Inquiry:
      </h4>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748B;">
        <strong>Category:</strong> <span style="color: #7C3AED; font-weight: 700;">${category}</span>
      </p>
      <div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px 14px; margin-top: 8px;">
        <p style="color: #1E293B; font-size: 13px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    </div>

    <!-- Need Urgent Help / WhatsApp Card -->
    <div style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border: 1px solid #A7F3D0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div>
          <h4 style="color: #065F46; font-size: 14px; margin: 0 0 4px 0; font-weight: 800;">
            Need Faster Assistance?
          </h4>
          <p style="color: #047857; font-size: 13px; margin: 0; line-height: 1.5;">
            For urgent delivery questions, order adjustments, or instant usage guidance, connect directly with our care specialists on WhatsApp.
          </p>
          ${whatsappUrl ? `
            <div style="margin-top: 12px;">
              <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #059669; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">
                Chat on WhatsApp (${whatsappDisplay}) &rarr;
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  const html = renderEmailLayout({
    title: `We've Received Your Inquiry - ${brandName} Care`,
    preheader: `Hi ${name}, thank you for contacting ${brandName}. Our team will reply within 24 hours.`,
    badge: 'CUSTOMER CARE CONFIRMATION',
    contentHtml,
    ctaText: 'Visit ZEBA Store',
    ctaUrl: appUrl,
    footerNote: 'Have additional questions? Simply reply to this email or reach us anytime.'
  });

  const text = `Hi ${name},

Thank you for reaching out to ZEBA! We have received your inquiry regarding "${category}".

Our customer care specialists will review your message and reply within 24 hours.

Your message summary:
${message}

Need immediate support? Chat with us on WhatsApp at ${whatsappDisplay}.

Warm regards,
ZEBA Period Care Team
${appUrl}`;

  return {
    subject: `🌸 We've received your message — ZEBA Care Team`,
    html,
    text
  };
}
