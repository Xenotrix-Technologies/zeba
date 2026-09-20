import { query } from '../config/db.js';
import { config } from '../config/env.js';

export async function submitContactMessage(req, res, next) {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const result = await query(
      `INSERT INTO contact_messages (name, email, phone, message, status)
       VALUES ($1, $2, $3, $4, 'unread') RETURNING id, created_at`,
      [name.trim(), email.toLowerCase().trim(), phone?.trim() || null, message.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to ZEBA! Our care team will respond shortly.',
      inquiryId: result.rows[0].id
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
