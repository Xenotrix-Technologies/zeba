/**
 * ZEBA Business Configuration & Options
 * 
 * Synchronized with server environment configuration (.env).
 * All storefront components dynamically read from this configuration.
 */

const env = (typeof __APP_ENV__ !== 'undefined' ? __APP_ENV__ : (typeof process !== 'undefined' ? process.env : {})) || {};

export const businessConfig = {
  // Brand & Legal Entity
  brandName: env.BUSINESS_BRAND_NAME || 'ZEBA',
  brandFullName: env.BUSINESS_FULL_NAME || 'ZEBA Period Care',
  logoUrl: '/images/zeba-logo.png',
  legalEntityName: env.BUSINESS_LEGAL_NAME || 'ZEBA Wellness Technologies Private Limited',
  tagline: env.BUSINESS_TAGLINE || 'Fast-Acting Natural Heat Therapy for Period Cramp Relief',
  description: env.BUSINESS_DESCRIPTION || 'Ultra-thin, air-activated natural warming pads providing up to 8 hours of discreet, soothing menstrual cramp comfort on the go.',
  establishedYear: Number(env.BUSINESS_ESTABLISHED_YEAR || 2026),
  websiteUrl: env.WEBSITE_URL || env.APP_URL || 'https://www.zebaofficial.in',
  domain: env.WEBSITE_DOMAIN || 'zebaofficial.in',

  // Contact & Customer Support
  supportEmail: env.CONTACT_EMAIL || env.BUSINESS_EMAIL || 'info@zebaofficial.in',
  businessEmail: env.BUSINESS_EMAIL || env.CONTACT_EMAIL || 'info@zebaofficial.in',
  salesEmail: env.SALES_EMAIL || env.CONTACT_EMAIL || 'info@zebaofficial.in',
  b2bEmail: env.B2B_EMAIL || env.CONTACT_EMAIL || 'info@zebaofficial.in',
  ownerEmail: env.OWNER_EMAIL || env.ADMIN_DEFAULT_EMAIL || 'zebaofficial2013@gmail.com',
  
  supportPhone: env.CONTACT_PHONE || '+91 98765 00000',
  supportPhoneRaw: env.CONTACT_PHONE_RAW || (env.CONTACT_PHONE ? env.CONTACT_PHONE.replace(/[^0-9]/g, '') : '9876500000'),
  supportHours: env.SUPPORT_HOURS || 'Monday – Saturday: 9:00 AM – 7:00 PM IST',

  // WhatsApp Support Channel
  whatsapp: {
    number: env.WHATSAPP_NUMBER || '+919876500000',
    numberRaw: (env.WHATSAPP_NUMBER ? env.WHATSAPP_NUMBER.replace(/[^0-9]/g, '') : (env.CONTACT_PHONE ? env.CONTACT_PHONE.replace(/[^0-9]/g, '') : '919876500000')),
    displayNumber: env.WHATSAPP_DISPLAY || env.CONTACT_PHONE || '+91 98765 00000',
    defaultMessage: 'Hi ZEBA Team, I would like to inquire about the Period Pain Relief Heating Pads.',
    orderQueryMessage: (orderNumber) => 
      `Hi ZEBA Team, I have a question regarding my order #${orderNumber || ''}.`,
    productQueryMessage: (productName) => 
      `Hi ZEBA Team, I have a question about ${productName}.`,
    getWhatsAppUrl: function (customMessage) {
      const msg = encodeURIComponent(customMessage || this.defaultMessage);
      return `https://wa.me/${this.numberRaw}?text=${msg}`;
    }
  },

  // Registered Business & Fulfillment Office
  address: {
    company: env.BUSINESS_COMPANY || 'ZEBA Wellness Pvt. Ltd.',
    building: (env.BUSINESS_BUILDING || 'MM Trading, 7-93 G Mundath Arcade').trim().replace(/,+$/, ''),
    street: (env.BUSINESS_STREET || 'Melattur').trim().replace(/,+$/, ''),
    city: (env.BUSINESS_CITY || 'Malappuram').trim().replace(/,+$/, ''),
    state: (env.BUSINESS_STATE || 'Kerala').trim().replace(/,+$/, ''),
    pincode: (env.BUSINESS_PINCODE || '679326').trim(),
    country: (env.BUSINESS_COUNTRY || 'India').trim(),
    get formatted() {
      return `${this.building}, ${this.street}, ${this.city}, ${this.state} - ${this.pincode}, ${this.country}`;
    }
  },

  // Regulatory & Tax Compliance
  tax: {
    gstin: env.BUSINESS_GSTIN || '29AAACZ1234F1Z5',
    cin: env.BUSINESS_CIN || 'U24239KA2026PTC123456',
    pan: env.BUSINESS_PAN || 'AAACZ1234F',
    hsnCode: env.BUSINESS_HSN || '30059090',
    gstPercentage: Number(env.BUSINESS_GST_PERCENTAGE || 18)
  },

  // Social Channels
  social: {
    instagram: env.INSTAGRAM_URL || 'https://instagram.com/zeba.care',
    facebook: env.FACEBOOK_URL || 'https://facebook.com/zeba.care',
    youtube: env.YOUTUBE_URL || 'https://youtube.com/@zeba.care',
    twitter: env.TWITTER_URL || 'https://x.com/zeba_care',
    linkedin: env.LINKEDIN_URL || 'https://linkedin.com/company/zeba-care'
  },

  // E-Commerce, Pricing & Shipping Rules
  commerce: {
    currency: '₹',
    currencyCode: 'INR',
    freeShippingThreshold: Number(env.FREE_SHIPPING_THRESHOLD || 499),
    standardShippingFee: Number(env.STANDARD_SHIPPING_FEE || 49),
    codAvailable: String(env.COD_AVAILABLE).toLowerCase() !== 'false',
    codFee: Number(env.COD_FEE || 0),
    estimatedDeliveryDays: '3 - 5 business days',
    dispatchTime: 'Dispatched within 24 hours in discreet, unmarked packaging',
    returnWindowDays: Number(env.RETURN_WINDOW_DAYS || 7)
  },

  // Corporate & B2B / Wholesale Options
  b2b: {
    enableB2BInquiries: true,
    minOrderQuantity: 50,
    corporateGiftingEnabled: true,
    inquiryEmail: env.CONTACT_EMAIL || 'info@zebaofficial.in',
    contactPerson: 'Corporate Wellness Team'
  },

  // Payment Gateway Configuration
  payments: {
    gatewayName: 'Razorpay',
    methods: ['UPI (GPay, PhonePe, Paytm)', 'Credit/Debit Cards', 'NetBanking', 'Wallets', 'Cash on Delivery (COD)'],
    securityNotice: '256-Bit SSL Encrypted Razorpay Checkout'
  }
};

export default businessConfig;
