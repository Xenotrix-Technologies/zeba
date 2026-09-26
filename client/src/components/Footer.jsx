import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Lock, Phone, Mail, MessageCircle, Instagram, Facebook, MapPin } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';

export default function Footer() {
  return (
    <footer className="bg-[#38283D] text-slate-200 pt-16 pb-24 md:pb-12 border-t border-[#5F3F68]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-brightPink/15 border border-brand-brightPink/40 flex items-center justify-center text-brand-primaryPink flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">100% Skin Safe</h4>
              <p className="text-[11px] text-pink-200/80">Natural air-activated relief</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-center text-brand-gold flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">Discreet Shipping</h4>
              <p className="text-[11px] text-pink-200/80">Plain unmarked packaging</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-brightPink/15 border border-brand-brightPink/40 flex items-center justify-center text-brand-primaryPink flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">Secure Checkout</h4>
              <p className="text-[11px] text-pink-200/80">{businessConfig.payments.gatewayName} 256-bit encryption</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">WhatsApp Support</h4>
              <p className="text-[11px] text-pink-200/80">Instant customer care</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block">
              <img 
                src="/images/zeba-logo.png" 
                alt={businessConfig.brandName} 
                className="h-10 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
              />
            </Link>
            <p className="text-xs text-pink-100/75 leading-relaxed">
              {businessConfig.description}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              {businessConfig.social.instagram && (
                <a
                  href={businessConfig.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#5F3F68] hover:bg-brand-brightPink text-pink-100 hover:text-white flex items-center justify-center transition-colors border border-white/10"
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
                  className="w-9 h-9 rounded-lg bg-[#5F3F68] hover:bg-brand-brightPink text-pink-100 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              <a
                href={businessConfig.whatsapp.getWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#5F3F68] hover:bg-emerald-600 text-pink-100 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider text-brand-lightGold">Shop Products</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  ZEBA Heating Pad – 1 Pack
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  ZEBA Heating Pad – 3 Pack (Value Pack)
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  View Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  Express Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Policies */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider text-brand-lightGold">Company & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  About {businessConfig.brandName}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  Contact Us & B2B Inquiries
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  Shipping & Discreet Delivery
                </Link>
              </li>
              <li>
                <Link to="/refund-return-policy" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  Refund & Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Care */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider text-brand-lightGold">Customer Care</h4>
            <p className="text-xs text-pink-100/75 leading-relaxed">
              Need assistance with an order, tracking, or guidance? We are here for you.
            </p>
            <div className="space-y-2.5 text-xs pt-1">
              <a
                href={`mailto:${businessConfig.supportEmail}`}
                className="flex items-center space-x-2 hover:text-brand-primaryPink transition-colors text-pink-100/90"
              >
                <Mail className="w-4 h-4 text-brand-primaryPink flex-shrink-0" />
                <span className="truncate">{businessConfig.supportEmail}</span>
              </a>
              <a
                href={`tel:${businessConfig.supportPhone.replace(/\s+/g, '')}`}
                className="flex items-center space-x-2 hover:text-brand-primaryPink transition-colors text-pink-100/90"
              >
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span>{businessConfig.supportPhone}</span>
              </a>
              <div className="flex items-start space-x-2 text-pink-200/70">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{businessConfig.address.city}, {businessConfig.address.state}, {businessConfig.address.country}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-block text-[11px] text-pink-300/60 hover:text-brand-gold transition-colors underline"
              >
                Admin Portal Login
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Entity notice */}
        <div className="pt-8 mt-4 border-t border-white/10 text-center text-xs text-pink-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {businessConfig.legalEntityName}. All rights reserved.</p>
          <p className="text-[11px] text-pink-200/60">
            GSTIN: {businessConfig.tax.gstin} • CIN: {businessConfig.tax.cin} • Designed for Menstrual Comfort
          </p>
        </div>

      </div>
    </footer>
  );
}
