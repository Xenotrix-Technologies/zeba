import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Instagram, Facebook, Send, CheckCircle2, MapPin, Briefcase } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { businessConfig } from '../config/businessConfig';

export default function Contact() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'General / Order Support',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please provide your name, email, and message.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contact', formData);
      if (res.success) {
        setSubmitted(true);
        addToast(res.message || 'Message received! We will reply promptly.', 'success');
        setFormData({ name: '', email: '', phone: '', inquiryType: 'General / Order Support', message: '' });
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit inquiry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFF5FA] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-brightPink bg-white px-3 py-1 rounded-full border border-brand-primaryPink/30 shadow-sm">
            We're Here For You
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-deepPurple">
            Get in Touch With {businessConfig.brandName} Care
          </h1>
          <p className="text-xs sm:text-sm text-[#805A82]">
            Have questions about pack sizing, usage recommendations, corporate wellness orders, or your delivery? Reach out anytime!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Contact Methods */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Card */}
            <div className="bg-emerald-50/90 p-6 rounded-3xl border border-emerald-200/80 space-y-3 shadow-sm">
              <div className="flex items-center space-x-3 text-emerald-800">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">Instant WhatsApp Support</h3>
                  <p className="text-[11px] text-emerald-700">Fastest response for order & delivery questions</p>
                </div>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Connect directly with our care specialists on WhatsApp for personalized support and instant order assistance.
              </p>
              <a
                href={businessConfig.whatsapp.getWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors btn-tactile"
              >
                Chat on WhatsApp ({businessConfig.whatsapp.displayNumber})
              </a>
            </div>

            {/* Email, Phone & Office Address Cards */}
            <div className="bg-white p-6 rounded-3xl border border-brand-primaryPink/25 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-brand-deepPurple">Contact & Business Details</h3>
              
              <div className="space-y-3 text-xs text-brand-darkPurple">
                <a
                  href={`mailto:${businessConfig.supportEmail}`}
                  className="flex items-center space-x-3 p-3 rounded-2xl bg-[#FFF5FA] hover:bg-brand-softPink transition-colors group border border-brand-primaryPink/15"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-softPink text-brand-brightPink flex items-center justify-center group-hover:bg-brand-brightPink group-hover:text-white transition-colors flex-shrink-0 border border-brand-primaryPink/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-deepPurple block">Customer Support Email</span>
                    <span className="text-[#805A82]">{businessConfig.supportEmail}</span>
                  </div>
                </a>

                <a
                  href={`tel:${businessConfig.supportPhone.replace(/\s+/g, '')}`}
                  className="flex items-center space-x-3 p-3 rounded-2xl bg-[#FFF5FA] hover:bg-brand-softPink transition-colors group border border-brand-primaryPink/15"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FDF5D6] text-brand-gold flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors flex-shrink-0 border border-brand-gold/40">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-deepPurple block">Helpline / Call Us</span>
                    <span className="text-[#805A82]">{businessConfig.supportPhone} ({businessConfig.supportHours})</span>
                  </div>
                </a>

                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/15">
                  <div className="w-8 h-8 rounded-xl bg-white text-brand-deepPurple border border-brand-primaryPink/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-brand-brightPink" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-deepPurple block">Registered & Fulfillment Address</span>
                    <span className="text-[#805A82] text-[11px] leading-relaxed block mt-0.5">
                      {businessConfig.address.formatted}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-softPink border border-brand-primaryPink/20 text-[11px]">
                  <span className="text-brand-darkPurple font-medium">GSTIN: <strong className="text-brand-deepPurple">{businessConfig.tax.gstin}</strong></span>
                  <span className="text-brand-darkPurple font-medium">CIN: <strong className="text-brand-deepPurple">{businessConfig.tax.cin}</strong></span>
                </div>
              </div>

              {/* B2B / Wholesale Box */}
              {businessConfig.b2b.enableB2BInquiries && (
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#38283D] to-[#5F3F68] text-white space-y-2 border border-brand-gold/30">
                  <div className="flex items-center space-x-2 text-brand-gold">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Corporate & B2B Orders</span>
                  </div>
                  <p className="text-[11px] text-pink-100/80">
                    Planning corporate wellness gifts or wholesale procurement (Min: {businessConfig.b2b.minOrderQuantity} units)? Reach our B2B desk directly:
                  </p>
                  <a
                    href={`mailto:${businessConfig.b2b.inquiryEmail}`}
                    className="inline-block text-xs font-bold text-brand-lightGold hover:underline"
                  >
                    ✉️ {businessConfig.b2b.inquiryEmail}
                  </a>
                </div>
              )}

              {/* Social Channels */}
              <div className="pt-4 border-t border-brand-primaryPink/15 flex items-center space-x-3">
                <span className="text-xs font-bold text-[#805A82]">Follow us:</span>
                {businessConfig.social.instagram && (
                  <a
                    href={businessConfig.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-brand-softPink hover:bg-brand-brightPink hover:text-white text-brand-deepPurple transition-colors border border-brand-primaryPink/20"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {businessConfig.social.facebook && (
                  <a
                    href={businessConfig.social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-brand-softPink hover:bg-brand-brightPink hover:text-white text-brand-deepPurple transition-colors border border-brand-primaryPink/20"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Inquiries Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-brand-primaryPink/25 shadow-lg">
            <h2 className="font-display font-extrabold text-2xl text-brand-deepPurple mb-2">
              Send Us a Message
            </h2>
            <p className="text-xs text-[#805A82] mb-6">
              Fill out this form and our customer support team will reply via email/phone within 24 hours.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-base text-emerald-900">Message Received!</h3>
                <p className="text-xs text-emerald-700">
                  Thank you for contacting ZEBA. Our care team will review your inquiry and reach out shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-brand-brightPink underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-darkPurple mb-1">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Pooja Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="pooja@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876500000"
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-darkPurple mb-1">Inquiry Category</label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs bg-white text-brand-darkPurple"
                  >
                    <option value="General / Order Support">General / Order & Delivery Support</option>
                    <option value="Product Sizing & Usage Guidance">Product Sizing & Usage Guidance</option>
                    <option value="Corporate / Bulk Order Inquiry">Corporate / Bulk Order Inquiry (B2B)</option>
                    <option value="Distribution & Retail Partnership">Distribution & Retail Partnership</option>
                    <option value="Feedback / Other">Feedback / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-darkPurple mb-1">Your Message / Question *</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can our care specialists assist you today?"
                    className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 btn-tactile"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
