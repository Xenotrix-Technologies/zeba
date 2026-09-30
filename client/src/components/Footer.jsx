import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Lock, Phone, Mail, MessageCircle, Instagram, Facebook, MapPin } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

export default function Footer() {
  const { settings, getWhatsAppUrl } = useStoreSettings();
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
              <p className="text-[11px] text-pink-200/80">{settings.payments?.gatewayName || 'Razorpay'} 256-bit encryption</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
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
                alt={settings.brandName} 
                className="h-10 w-auto object-contain hover:opacity-95 transition-opacity" 
              />
            </Link>
            <p className="text-xs text-pink-100/75 leading-relaxed">
              {settings.description}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={settings.social?.instagram && !settings.social.instagram.includes('zeba.care') ? settings.social.instagram : 'https://www.instagram.com/zebaofficial.in/?hl=en'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#5F3F68] hover:bg-brand-brightPink text-pink-100 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.social?.facebook && !settings.social.facebook.includes('zeba.care') ? settings.social.facebook : 'https://www.facebook.com/profile.php?id=61594599914786'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#5F3F68] hover:bg-brand-brightPink text-pink-100 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#5F3F68] hover:bg-[#25D366] text-pink-100 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                aria-label="WhatsApp Support"
                title="Chat with us on WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
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
                  About {settings.brandName}
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
                href={`mailto:${settings.supportEmail}`}
                className="flex items-center space-x-2 hover:text-brand-primaryPink transition-colors text-pink-100/90"
              >
                <Mail className="w-4 h-4 text-brand-primaryPink flex-shrink-0" />
                <span className="truncate">{settings.supportEmail}</span>
              </a>
              <a
                href={`tel:${(settings.supportPhone || '').replace(/\s+/g, '')}`}
                className="flex items-center space-x-2 hover:text-brand-primaryPink transition-colors text-pink-100/90"
              >
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span>{settings.supportPhone}</span>
              </a>
              <div className="flex items-start space-x-2 text-pink-200/70">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{settings.address?.city}, {settings.address?.state}, {settings.address?.country}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secure Payments & Copyright */}
        <div className="pt-8 mt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Secure Payments Icons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs">
            <span className="text-pink-100/70 font-semibold text-xs sm:text-sm mr-1">Secure Payments:</span>
            
            {/* Razorpay */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.06] border border-white/15 text-white shadow-sm hover:border-white/30 transition-all select-none">
              <span className="font-bold text-[13px] tracking-tight lowercase">razorpay</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#02a0e9] inline-block shadow-[0_0_6px_#02a0e9]"></span>
            </div>

            {/* UPI */}
            <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/[0.06] border border-white/15 text-white shadow-sm hover:border-white/30 transition-all select-none">
              <span className="font-black italic tracking-wider text-[12px]">UPI</span>
            </div>

            {/* VISA */}
            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-white text-[#1a1f71] shadow-sm hover:bg-slate-50 transition-all select-none">
              <span className="font-black italic tracking-tighter text-[13px] leading-none">VISA</span>
            </div>

            {/* Mastercard */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/15 text-white shadow-sm hover:border-white/30 transition-all select-none">
              <div className="flex items-center -space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#eb001b] inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f00] inline-block opacity-90"></span>
              </div>
              <span className="font-bold text-[12px] tracking-tight lowercase ml-0.5">mc</span>
            </div>

            {/* RuPay */}
            <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/[0.06] border border-white/15 text-white shadow-sm hover:border-white/30 transition-all select-none">
              <span className="font-bold text-[13px] tracking-tight text-white">RuPay</span>
            </div>
          </div>

          <div className="text-center md:text-right text-xs text-pink-200/60 space-y-1">
            <p>© {new Date().getFullYear()} {settings.legalEntityName}. All rights reserved.</p>
            <p className="text-[11px] text-pink-200/60">
              Designed for Menstrual Comfort • Developed by{' '}
              <a
                href="https://www.xenotrix.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-lightGold hover:text-white font-medium underline underline-offset-2 transition-colors"
              >
                Xenotrix
              </a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
