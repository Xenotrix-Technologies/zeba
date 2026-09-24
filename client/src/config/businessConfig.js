/**
 * ZEBA Business Configuration & Options
 * 
 * Edit this centralized file to update your store's business details, 
 * contact information, shipping rules, social profiles, and B2B settings.
 * All storefront components dynamically read from this configuration.
 */

export const businessConfig = {
  // Brand & Legal Entity
  brandName: 'ZEBA',
  brandFullName: 'ZEBA Period Care',
  legalEntityName: 'ZEBA Wellness Technologies Private Limited',
  tagline: 'Fast-Acting Natural Heat Therapy for Period Cramp Relief',
  description: 'Ultra-thin, air-activated natural warming pads providing up to 8 hours of discreet, soothing menstrual cramp comfort on the go.',
  establishedYear: 2026,
  websiteUrl: 'https://www.zebaofficial.in',
  domain: 'zebaofficial.in',

  // Contact & Customer Support
  supportEmail: 'care@zebaofficial.in',
  businessEmail: 'business@zebaofficial.in',
  salesEmail: 'orders@zebaofficial.in',
  b2bEmail: 'b2b@zebaofficial.in',
  
  supportPhone: '+91 98765 00000',
  supportPhoneRaw: '9876500000',
  supportHours: 'Monday – Saturday: 9:00 AM – 7:00 PM IST',

  // WhatsApp Support Channel
  whatsapp: {
    number: '+919876500000',
    numberRaw: '919876500000',
    displayNumber: '+91 98765 00000',
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
    company: 'ZEBA Wellness Technologies Pvt. Ltd.',
    building: 'ZEBA Corporate Center, 3rd Floor',
    street: '100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    country: 'India',
    get formatted() {
      return `${this.building}, ${this.street}, ${this.city}, ${this.state} - ${this.pincode}, ${this.country}`;
    }
  },

  // Regulatory & Tax Compliance
  tax: {
    gstin: '29AAACZ1234F1Z5',
    cin: 'U24239KA2026PTC123456',
    pan: 'AAACZ1234F',
    hsnCode: '30059090', // Medical / Thermal Heating Pouches
    gstPercentage: 18
  },

  // Social Channels
  social: {
    instagram: 'https://instagram.com/zeba.care',
    facebook: 'https://facebook.com/zeba.care',
    youtube: 'https://youtube.com/@zeba.care',
    twitter: 'https://x.com/zeba_care',
    linkedin: 'https://linkedin.com/company/zeba-care'
  },

  // E-Commerce, Pricing & Shipping Rules
  commerce: {
    currency: '₹',
    currencyCode: 'INR',
    freeShippingThreshold: 499,
    standardShippingFee: 49,
    codAvailable: true,
    codFee: 0,
    estimatedDeliveryDays: '3 - 5 business days',
    dispatchTime: 'Dispatched within 24 hours in discreet, unmarked packaging',
    returnWindowDays: 7
  },

  // Corporate & B2B / Wholesale Options
  b2b: {
    enableB2BInquiries: true,
    minOrderQuantity: 50,
    corporateGiftingEnabled: true,
    inquiryEmail: 'b2b@zebaofficial.in',
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
