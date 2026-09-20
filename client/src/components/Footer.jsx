import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Truck, Lock, Phone, Mail, MessageCircle, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A192F] text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-pink/10 border border-brand-pink/30 flex items-center justify-center text-brand-pink flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">100% Skin Safe</h4>
              <p className="text-[11px] text-slate-400">Natural air-activated relief</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">Discreet Shipping</h4>
              <p className="text-[11px] text-slate-400">Plain unmarked packaging</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-pink/10 border border-brand-pink/30 flex items-center justify-center text-brand-pink flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">Secure Checkout</h4>
              <p className="text-[11px] text-slate-400">Razorpay 256-bit encryption</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-bold">WhatsApp Support</h4>
              <p className="text-[11px] text-slate-400">Instant customer care</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-brand-gold/40">
                <span className="text-brand-gold font-display font-black text-lg">Z</span>
              </div>
              <span className="font-display font-extrabold text-2xl text-white tracking-wider">
                ZEBA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for modern women who refuse to let menstrual cramps hold them back. Providing safe, continuous soothing heat therapy whenever and wherever you need it.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com/zeba.care"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-pink text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/zeba.care"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-pink text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919876543210?text=Hi%20ZEBA%20Team%2C%20I%20have%20a%20question%20about%20the%20Heating%20Pads"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
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
                  About ZEBA Brand
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-pink transition-colors">
                  Contact Us
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
                  Shipping Policy
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
            <p className="text-xs text-slate-400">
              Need assistance with an order or product guidance? We're here for you.
            </p>
            <div className="space-y-2 text-xs pt-1">
              <a
                href="mailto:care@zeba.com"
                className="flex items-center space-x-2 hover:text-brand-pink transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-pink" />
                <span>care@zeba.com</span>
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center space-x-2 hover:text-brand-pink transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-gold" />
                <span>+91 98765 43210</span>
              </a>
            </div>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-block text-[11px] text-slate-500 hover:text-slate-300 transition-colors underline"
              >
                Admin Portal Login
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 mt-4 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ZEBA Wellness. All rights reserved. Designed for menstrual comfort.</p>
          <p className="text-[11px] text-slate-500">
            Disclaimer: For external use only. Stick onto underwear, do not apply directly on bare skin.
          </p>
        </div>

      </div>
    </footer>
  );
}
