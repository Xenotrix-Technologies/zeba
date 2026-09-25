import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Truck, Lock, Phone, Mail, MessageCircle, Instagram, Facebook, MapPin } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';

export default function Footer() {
  return (
    <footer className="bg-[#260E36] text-slate-300 pt-16 pb-24 md:pb-12 border-t border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-purple-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-pink/15 border border-brand-pink/40 flex items-center justify-center text-brand-pink flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">100% Safe Ingredients</h4>
              <p className="text-[11px] text-slate-300">Natural air-activated relief</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-center text-brand-gold flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">Discreet Shipping</h4>
              <p className="text-[11px] text-slate-300">Plain unmarked packaging</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-pink/15 border border-brand-pink/40 flex items-center justify-center text-brand-pink flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">Secure Checkout</h4>
              <p className="text-[11px] text-slate-300">{businessConfig.payments.gatewayName} 256-bit encryption</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">WhatsApp Support</h4>
              <p className="text-[11px] text-slate-300">Instant customer care</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3C1B50] to-[#A83B8F] flex items-center justify-center border border-brand-gold/40">
                <span className="text-brand-gold font-serif-brand font-black text-lg">Z</span>
              </div>
              <span className="font-serif-brand font-extrabold text-2xl text-white tracking-wider gold-gradient-text">
                {businessConfig.brandName}
              </span>
            </div>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              {businessConfig.description}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              {businessConfig.social.instagram && (
                <a
                  href={businessConfig.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#3C1B50] hover:bg-brand-pink text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-purple-800/40"
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
                  className="w-9 h-9 rounded-lg bg-[#3C1B50] hover:bg-brand-pink text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-purple-800/40"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              <a
                href={businessConfig.whatsapp.getWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#3C1B50] hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-purple-800/40"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Shop Products</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-brand-pink transition-colors">
                  ZEBA Heating Pad – 1 Pack
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-brand-pink transition-colors">
                  ZEBA Heating Pad – 3 Pack (Value Pack)
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-brand-pink transition-colors">
                  View Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-brand-pink transition-colors">
                  Express Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Policies */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Company & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-brand-pink transition-colors">
                  About {businessConfig.brandName}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-pink transition-colors">
                  Contact Us & B2B Inquiries
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-pink transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-brand-pink transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-brand-pink transition-colors">
                  Shipping & Discreet Delivery
                </Link>
              </li>
              <li>
                <Link to="/refund-return-policy" className="hover:text-brand-pink transition-colors">
                  Refund & Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Care */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Customer Care</h4>
            <p className="text-xs text-purple-200/70">
              Need assistance with an order, tracking, or guidance? We are here for you.
            </p>
            <div className="space-y-2.5 text-xs pt-1">
              <a
                href={`mailto:${businessConfig.supportEmail}`}
                className="flex items-center space-x-2 hover:text-brand-pink transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-pink flex-shrink-0" />
                <span className="truncate">{businessConfig.supportEmail}</span>
              </a>
              <a
                href={`tel:${businessConfig.supportPhone.replace(/\s+/g, '')}`}
                className="flex items-center space-x-2 hover:text-brand-pink transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span>{businessConfig.supportPhone}</span>
              </a>
              <div className="flex items-start space-x-2 text-purple-200/70">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{businessConfig.address.city}, {businessConfig.address.state}, {businessConfig.address.country}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-block text-[11px] text-purple-300/60 hover:text-white transition-colors underline"
              >
                Admin Portal Login
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Entity notice */}
        <div className="pt-8 mt-4 border-t border-purple-900/40 text-center text-xs text-purple-300/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {businessConfig.legalEntityName}. All rights reserved.</p>
          <p className="text-[11px] text-purple-300/60">
            GSTIN: {businessConfig.tax.gstin} • CIN: {businessConfig.tax.cin} • India's 1st Periods Pain Relief Heating Pad
          </p>
        </div>

      </div>
    </footer>
  );
}

