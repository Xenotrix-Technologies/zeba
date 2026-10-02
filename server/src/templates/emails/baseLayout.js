import { config } from '../../config/env.js';

/**
 * Clean & bulletproof HTML email base layout
 * Compatible with Gmail, Apple Mail, Outlook, Yahoo, and Mobile clients
 */
export function renderEmailLayout({
  title,
  preheader = '',
  badge = 'PERIODS PAIN RELIEF • HEAT THERAPY',
  headerBg = 'linear-gradient(135deg, #0E1B4D 0%, #1A2B6B 100%)',
  headerColor = '#FFFFFF',
  contentHtml,
  ctaText = '',
  ctaUrl = '',
  secondaryCtaText = '',
  secondaryCtaUrl = '',
  footerNote = ''
}) {
  const brandName = config.business?.brandName || 'ZEBA';
  const appUrl = config.APP_URL || 'https://www.zebaofficial.in';
  const supportEmail = config.CONTACT_EMAIL || 'care@zebaofficial.in';
  const supportPhone = config.CONTACT_PHONE || '+91 70259 61509';
  const whatsappDisplay = config.WHATSAPP_DISPLAY || '+91 70259 61509';
  const year = new Date().getFullYear();

  const ctaButtonHtml = ctaText && ctaUrl ? `
    <div style="text-align: center; margin: 32px 0 20px 0;">
      <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #FF2D78 0%, #D00A52 100%); color: #FFFFFF; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(255, 45, 120, 0.35); text-align: center;">
        ${ctaText} &rarr;
      </a>
      ${secondaryCtaText && secondaryCtaUrl ? `
        <div style="margin-top: 12px;">
          <a href="${secondaryCtaUrl}" target="_blank" style="color: #0E1B4D; text-decoration: underline; font-size: 13px; font-weight: 600;">
            ${secondaryCtaText}
          </a>
        </div>
      ` : ''}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title || brandName}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .email-card { padding: 20px 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .table-responsive { width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2D3748;">
  ${preheader ? `<div style="display: none; font-size: 1px; color: #FAF8FB; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</div>` : ''}

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8F6FA; padding: 24px 0;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto;" class="email-container">
          
          <!-- Header Banner -->
          <tr>
            <td>
              <div style="background: ${headerBg}; padding: 30px 24px; border-radius: 20px 20px 0 0; text-align: center; color: ${headerColor}; box-shadow: 0 4px 20px rgba(14, 27, 77, 0.15);">
                <div style="display: inline-block; padding: 4px 16px; background-color: rgba(255, 255, 255, 0.12); border-radius: 20px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
                  <span style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #FDF1C7;">${badge}</span>
                </div>
                <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #E5C06E; font-family: Georgia, 'Times New Roman', serif;">${brandName}</h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #E2E8F0; letter-spacing: 0.5px;">Natural Soothing Heat Therapy for Menstrual Relief</p>
              </div>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td>
              <div style="background-color: #FFFFFF; padding: 32px 28px; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);" class="email-card">
                ${contentHtml}
                ${ctaButtonHtml}

                ${footerNote ? `
                  <div style="background-color: #FFF5F7; border-left: 3px solid #FF2D78; padding: 14px 16px; border-radius: 8px; margin-top: 24px; font-size: 12px; color: #718096; line-height: 1.5;">
                    ${footerNote}
                  </div>
                ` : ''}
              </div>
            </td>
          </tr>

          <!-- Help & Support Box -->
          <tr>
            <td>
              <div style="background-color: #F3EEF5; padding: 20px 24px; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; border-top: 1px solid #EFE8F2; font-size: 13px; color: #4A5568; line-height: 1.6;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <p style="margin: 0 0 8px 0; font-weight: 700; color: #0E1B4D; font-size: 14px;">Need Assistance with Your Order?</p>
                      <p style="margin: 0; font-size: 12px; color: #718096;">
                        💬 WhatsApp: <a href="https://wa.me/${whatsappDisplay.replace(/[^0-9]/g, '')}" target="_blank" style="color: #2F855A; font-weight: 700; text-decoration: none;">${whatsappDisplay}</a>
                        &nbsp;&bull;&nbsp;
                        ✉️ Email: <a href="mailto:${supportEmail}" style="color: #FF2D78; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <div style="background-color: #0E1B4D; padding: 24px; border-radius: 0 0 20px 20px; text-align: center; color: #A0AEC0; font-size: 11px; line-height: 1.6;">
                <p style="margin: 0 0 8px 0; color: #CBD5E0;">
                  <a href="${appUrl}" target="_blank" style="color: #E5C06E; text-decoration: none; font-weight: 700;">Visit ZEBA Official Store</a>
                  &nbsp;&bull;&nbsp;
                  <a href="${appUrl}/track" target="_blank" style="color: #CBD5E0; text-decoration: none;">Track Order</a>
                  &nbsp;&bull;&nbsp;
                  <a href="${appUrl}/contact" target="_blank" style="color: #CBD5E0; text-decoration: none;">Contact Support</a>
                </p>
                <p style="margin: 0; color: #718096;">
                  &copy; ${year} ${brandName} (ZEBA). All rights reserved.<br>
                  Discreet, Air-Activated Heating Pads for Menstrual Care. Delivered across India. Developed by <a href="https://www.xenotrix.in" target="_blank" style="color: #E5C06E; text-decoration: none; font-weight: 700;">Xenotrix Technologies</a>.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
