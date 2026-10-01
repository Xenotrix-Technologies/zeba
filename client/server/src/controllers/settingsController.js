import { query } from '../config/db.js';

/**
 * GET /api/settings
 * Public endpoint returning all consolidated store settings from PostgreSQL
 */
export async function getPublicSettings(req, res, next) {
  try {
    const result = await query('SELECT setting_key, setting_value FROM store_settings');
    
    const settingsMap = {};
    for (const row of result.rows) {
      let val = row.setting_value;
      if (typeof val === 'string') {
        try {
          val = JSON.parse(val);
        } catch {
          // Keep raw string if not JSON
        }
      }
      settingsMap[row.setting_key] = val;
    }

    // Consolidated business configuration structure
    const brand = typeof settingsMap.brand_info === 'object' && settingsMap.brand_info !== null ? settingsMap.brand_info : {};
    const contact = typeof settingsMap.contact_channels === 'object' && settingsMap.contact_channels !== null ? settingsMap.contact_channels : {};
    const address = typeof settingsMap.business_address === 'object' && settingsMap.business_address !== null ? settingsMap.business_address : {};
    const tax = typeof settingsMap.tax_compliance === 'object' && settingsMap.tax_compliance !== null ? settingsMap.tax_compliance : {};
    const commerce = typeof settingsMap.shipping_commerce === 'object' && settingsMap.shipping_commerce !== null ? settingsMap.shipping_commerce : {};
    const social = typeof settingsMap.social_channels === 'object' && settingsMap.social_channels !== null ? settingsMap.social_channels : {};
    const b2b = typeof settingsMap.b2b_wholesale === 'object' && settingsMap.b2b_wholesale !== null ? settingsMap.b2b_wholesale : {};

    res.json({
      success: true,
      settings: {
        brandName: brand.brandName || 'ZEBA',
        brandFullName: brand.brandFullName || 'ZEBA Period Care',
        logoUrl: brand.logoUrl || '/images/zeba-logo.png',
        legalEntityName: brand.legalEntityName || 'ZEBA Wellness Technologies Private Limited',
        tagline: brand.tagline || 'Fast-Acting Natural Heat Therapy for Period Cramp Relief',
        description: brand.description || 'Ultra-thin, air-activated natural warming pads providing up to 8 hours of discreet, soothing menstrual cramp comfort on the go.',
        establishedYear: brand.establishedYear || 2026,
        websiteUrl: brand.websiteUrl || 'https://www.zebaofficial.in',
        domain: brand.domain || 'zebaofficial.in',

        // Support & WhatsApp
        supportEmail: contact.supportEmail || 'info@zebaofficial.in',
        businessEmail: contact.businessEmail || 'info@zebaofficial.in',
        salesEmail: contact.salesEmail || 'info@zebaofficial.in',
        ownerEmail: contact.ownerEmail || 'zebaofficial2013@gmail.com',
        supportPhone: contact.supportPhone || '+91 70259 61509',
        supportPhoneRaw: contact.supportPhoneRaw || '7025961509',
        supportHours: contact.supportHours || 'Monday – Saturday: 9:00 AM – 7:00 PM IST',
        whatsapp: contact.whatsapp || {
          number: '+917025961509',
          numberRaw: '917025961509',
          displayNumber: '+91 70259 61509',
          defaultMessage: 'Hi ZEBA Team, I would like to inquire about the Period Pain Relief Heating Pads.'
        },

        // Address
        address: address || {
          company: 'ZEBA Wellness Pvt. Ltd.',
          building: 'MM Trading, 7-93 G Mundath Arcade',
          street: 'Melattur',
          city: 'Malappuram',
          state: 'Kerala',
          pincode: '679326',
          country: 'India',
          formatted: 'MM Trading, 7-93 G Mundath Arcade, Melattur, Malappuram, Kerala - 679326, India'
        },

        // Tax
        tax: tax || {
          pan: 'AAACZ1234F',
          hsnCode: '30059090',
          gstPercentage: 18
        },

        // Shipping & Commerce
        commerce: {
          currency: commerce.currency || '₹',
          currencyCode: commerce.currencyCode || 'INR',
          freeShippingThreshold: commerce.freeShippingThreshold !== undefined && commerce.freeShippingThreshold !== null ? Number(commerce.freeShippingThreshold) : null,
          standardShippingFee: commerce.standardShippingFee !== undefined && commerce.standardShippingFee !== null ? Number(commerce.standardShippingFee) : null,
          codAvailable: commerce.codAvailable !== undefined ? Boolean(commerce.codAvailable) : true,
          codFee: commerce.codFee !== undefined ? Number(commerce.codFee) : 0,
          estimatedDeliveryDays: commerce.estimatedDeliveryDays || '3 - 5 business days',
          dispatchTime: commerce.dispatchTime || 'Dispatched within 24 hours in discreet, unmarked packaging',
          returnWindowDays: commerce.returnWindowDays !== undefined ? Number(commerce.returnWindowDays) : 7
        },

        // Social
        social: {
          instagram: (social?.instagram && !social.instagram.includes('zeba.care')) ? social.instagram : 'https://www.instagram.com/zebaofficial.in/?hl=en',
          facebook: (social?.facebook && !social.facebook.includes('zeba.care')) ? social.facebook : 'https://www.facebook.com/profile.php?id=61594599914786',
          youtube: social?.youtube || 'https://youtube.com/@zeba.care',
          twitter: social?.twitter || 'https://x.com/zeba_care',
          linkedin: social?.linkedin || 'https://linkedin.com/company/zeba-care'
        },

        // B2B
        b2b: b2b || {
          enableB2BInquiries: true,
          minOrderQuantity: 50,
          corporateGiftingEnabled: true,
          inquiryEmail: 'info@zebaofficial.in',
          contactPerson: 'Corporate Wellness Team'
        }
      },
      raw: settingsMap
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/settings/:key
 * Admin update for store settings
 */
export async function updateStoreSetting(req, res, next) {
  try {
    const { key } = req.params;
    const { value, category, description } = req.body;

    if (!value) {
      return res.status(400).json({ success: false, message: 'Value payload is required' });
    }

    const result = await query(
      `INSERT INTO store_settings (setting_key, setting_value, category, description)
       VALUES ($1, $2, COALESCE($3, 'general'), $4)
       ON CONFLICT (setting_key) DO UPDATE
       SET setting_value = $2,
           category = COALESCE($3, store_settings.category),
           description = COALESCE($4, store_settings.description),
           updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, typeof value === 'string' ? value : JSON.stringify(value), category, description]
    );

    res.json({
      success: true,
      message: `Setting '${key}' updated successfully.`,
      setting: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}
