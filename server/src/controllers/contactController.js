import { query } from '../config/db.js';
import { config } from '../config/env.js';
import { sendContactInquiryEmails } from '../services/notificationService.js';

export async function submitContactMessage(req, res, next) {
  try {
    const { name, email, phone, inquiryType, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone?.trim() || null;
    const cleanCategory = (inquiryType || 'General / Order Support').trim();
    const cleanMessage = message.trim();

    const result = await query(
      `INSERT INTO contact_messages (name, email, phone, inquiry_type, message, status)
       VALUES ($1, $2, $3, $4, $5, 'unread') RETURNING id, created_at`,
      [cleanName, cleanEmail, cleanPhone, cleanCategory, cleanMessage]
    );

    const inquiryId = result.rows[0].id;
    const createdAt = result.rows[0].created_at;

    // Await transactional emails dispatch so Vercel Serverless does not freeze before SMTP dispatch finishes
    try {
      const emailRes = await sendContactInquiryEmails({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        inquiryType: cleanCategory,
        message: cleanMessage,
        inquiryId
      });
      console.log(`📧 Contact inquiry #${inquiryId} emails processed:`, emailRes);
    } catch (err) {
      console.error(`⚠️ Failed to send emails for contact inquiry #${inquiryId}:`, err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to ZEBA! Our care team has received your message and sent a confirmation to your email.',
      inquiryId,
      createdAt
    });
  } catch (err) {
    next(err);
  }
}

export function getPublicContactConfig(req, res) {
  res.json({
    success: true,
    contact: {
      brandName: 'ZEBA',
      tagline: 'Soothing Period Pain Relief Heating Pads',
      whatsappNumber: config.WHATSAPP_NUMBER,
      whatsappDisplay: config.WHATSAPP_DISPLAY,
      email: config.CONTACT_EMAIL,
      phone: config.CONTACT_PHONE,
      instagramUrl: config.INSTAGRAM_URL,
      facebookUrl: config.FACEBOOK_URL,
      freeShippingThreshold: config.FREE_SHIPPING_THRESHOLD,
      standardShippingFee: config.STANDARD_SHIPPING_FEE
    }
  });
}
