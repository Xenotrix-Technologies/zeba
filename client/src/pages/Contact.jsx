import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Instagram, Facebook, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit inquiry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FCFCFE] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-brand-softPink px-3 py-1 rounded-full">
            We're Here For You
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-navy">
            Get in Touch With ZEBA Care
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Have questions about pack sizing, usage recommendations, or your order? Reach out anytime!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Contact Methods */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Card */}
            <div className="bg-emerald-50/70 p-6 rounded-3xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center space-x-3 text-emerald-800">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Instant WhatsApp Support</h3>
                  <p className="text-[11px] text-emerald-700">Quickest response for order queries</p>
                </div>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Connect directly with our menstrual wellness care specialists on WhatsApp for personalized support.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hi%20ZEBA%20Team%2C%20I%20have%20an%20inquiry%20regarding%20the%20Heating%20Pads"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors"
              >
                Chat on WhatsApp Now
              </a>
            </div>

            {/* Email & Phone Cards */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-brand-navy">Contact Information</h3>
              
              <div className="space-y-3 text-xs text-slate-700">
                <a
                  href="mailto:care@zeba.com"
                  className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 hover:bg-brand-softPink transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-pink/10 text-brand-pink flex items-center justify-center group-hover:bg-brand-pink group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block">Email Support</span>
                    <span className="text-slate-500">care@zeba.com</span>
                  </div>
                </a>

                <a
                  href="tel:+919876543210"
                  className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 hover:bg-brand-softPink transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block">Helpline / Call Us</span>
                    <span className="text-slate-500">+91 98765 43210 (Mon-Sat, 9am-7pm)</span>
                  </div>
                </a>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-500">Follow us:</span>
                <a
                  href="https://instagram.com/zeba.care"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-brand-pink hover:text-white text-slate-600 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com/zeba.care"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-brand-pink hover:text-white text-slate-600 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Inquiries Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-lg">
            <h2 className="font-display font-extrabold text-2xl text-brand-navy mb-2">
              Send Us a Message
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Fill out this form and our customer support team will reply via email/phone within 24 hours.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-base text-emerald-900">Message Received!</h3>
                <p className="text-xs text-emerald-700">
                  Thank you for contacting ZEBA. Our team will review your inquiry and reach out shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-brand-pink underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ananya Verma"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ananya@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Message / Question *</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you today?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-pink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-pink text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
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
