import dotenv from 'dotenv';
dotenv.config();

/**
 * ZEBA Server Business Configuration & Options
 * Reads customizable environment variables with fallback defaults.
 */
export const businessConfig = {
  // Brand Profile
  brandName: process.env.BUSINESS_BRAND_NAME || 'ZEBA',
  brandFullName: process.env.BUSINESS_FULL_NAME || 'ZEBA Period Care',
  legalEntityName: process.env.BUSINESS_LEGAL_NAME || 'ZEBA Wellness Technologies Private Limited',
  tagline: process.env.BUSINESS_TAGLINE || 'Fast-Acting Natural Heat Therapy for Period Cramp Relief',
  websiteUrl: process.env.APP_URL || process.env.WEBSITE_URL || 'https://www.zebaofficial.in',

  // Contact Information
  supportEmail: process.env.CONTACT_EMAIL || process.env.SUPPORT_EMAIL || 'care@zebaofficial.in',
  businessEmail: process.env.BUSINESS_EMAIL || 'business@zebaofficial.in',
  ownerEmail: process.env.OWNER_EMAIL || process.env.ADMIN_DEFAULT_EMAIL || 'admin@zebaofficial.in',
  supportPhone: process.env.CONTACT_PHONE || process.env.SUPPORT_PHONE || '+91 70259 61509',
  supportPhoneRaw: process.env.CONTACT_PHONE_RAW || '7025961509',
  supportHours: process.env.SUPPORT_HOURS || 'Monday – Saturday: 9:00 AM – 7:00 PM IST',

  // WhatsApp
  whatsappNumber: process.env.WHATSAPP_NUMBER || '+917025961509',
  whatsappDisplay: process.env.WHATSAPP_DISPLAY || '+91 70259 61509',

  // Address
  address: {
    company: process.env.BUSINESS_COMPANY || 'ZEBA Wellness Technologies Pvt. Ltd.',
    building: process.env.BUSINESS_BUILDING || 'ZEBA Corporate Center, 3rd Floor',
    street: process.env.BUSINESS_STREET || '100 Feet Road, Indiranagar',
    city: process.env.BUSINESS_CITY || 'Bengaluru',
    state: process.env.BUSINESS_STATE || 'Karnataka',
    pincode: process.env.BUSINESS_PINCODE || '560038',
    country: process.env.BUSINESS_COUNTRY || 'India',
    get full() {
      return `${this.building}, ${this.street}, ${this.city}, ${this.state} - ${this.pincode}, ${this.country}`;
    }
  },

  // Tax & Regulatory
  tax: {
    gstin: process.env.BUSINESS_GSTIN || '29AAACZ1234F1Z5',
    cin: process.env.BUSINESS_CIN || 'U24239KA2026PTC123456',
    pan: process.env.BUSINESS_PAN || 'AAACZ1234F'
  },

  // Social
  social: {
    instagram: process.env.INSTAGRAM_URL || 'https://instagram.com/zeba.care',
    facebook: process.env.FACEBOOK_URL || 'https://facebook.com/zeba.care',
    youtube: process.env.YOUTUBE_URL || 'https://youtube.com/@zeba.care',
    twitter: process.env.TWITTER_URL || 'https://x.com/zeba_care',
    linkedin: process.env.LINKEDIN_URL || 'https://linkedin.com/company/zeba-care'
  },

  // Shipping & Pricing Rules
  commerce: {
    currency: '₹',
    currencyCode: 'INR',
    freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD || 499),
    standardShippingFee: Number(process.env.STANDARD_SHIPPING_FEE || 49),
    codAvailable: process.env.COD_AVAILABLE !== 'false',
    codFee: Number(process.env.COD_FEE || 0),
    returnWindowDays: Number(process.env.RETURN_WINDOW_DAYS || 7)
  }
};

export default businessConfig;
