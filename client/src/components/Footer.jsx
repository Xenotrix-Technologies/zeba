import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Instagram, Facebook, MapPin, ExternalLink } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { AmazonIcon, FlipkartIcon, AMAZON_URL, FLIPKART_URL } from './MarketplaceButtons';
import { useStoreSettings } from '../context/StoreSettingsContext';

export default function Footer() {
  const { settings, getWhatsAppUrl } = useStoreSettings();
  return (
    <footer className="bg-[#38283D] text-slate-200 pt-12 pb-24 md:pb-12 border-t border-[#5F3F68]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block">
              <img 
                src="/images/zeba-logo.png" 
                alt={settings.brandName || "ZEBA"} 
                width="150"
                height="40"
                loading="lazy"
                decoding="async"
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
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>

            {/* Also Available On Marketplaces */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-lightGold block mb-2">
                Also Available On:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={FLIPKART_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#2874F0] hover:bg-[#1a5bc9] text-white text-xs font-bold transition-all shadow-sm border border-blue-400/30 group active:scale-95"
                  title="Buy ZEBA 1-Pack on Flipkart"
                >
                  <FlipkartIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Flipkart (1-Pack)</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href={AMAZON_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#131921] hover:bg-[#232F3E] text-white text-xs font-bold transition-all shadow-sm border border-white/10 group active:scale-95"
                  title="Buy ZEBA 3-Pack on Amazon"
                >
                  <AmazonIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Amazon (3-Pack)</span>
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider text-brand-lightGold">Shop Products</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products/zeba-heating-pad-1-pack" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
                  ZEBA Heating Pad – 1 Pack
                </Link>
              </li>
              <li>
                <Link to="/products/zeba-heating-pad-3-pack" className="hover:text-brand-primaryPink transition-colors text-pink-100/80">
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

        {/* Marketplace Stores, Secure Payments & Copyright */}
        <div className="pt-8 mt-4 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Marketplace Badges & Secure Payments */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs">
            {/* Also on Flipkart & Amazon */}
            <div className="flex items-center gap-1.5">
              <span className="text-pink-100/70 font-semibold text-xs sm:text-sm mr-0.5">Also on:</span>
              <a
                href={FLIPKART_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white transition-all shadow-sm select-none"
                title="ZEBA on Flipkart"
              >
                <FlipkartIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-bold text-[12px]">Flipkart</span>
              </a>
              <a
                href={AMAZON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white transition-all shadow-sm select-none"
                title="ZEBA on Amazon"
              >
                <AmazonIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-bold text-[12px]">Amazon</span>
              </a>
            </div>

            <span className="hidden sm:inline-block w-px h-4 bg-white/20" />

            {/* Secure Payments Icons */}
            <div className="flex flex-wrap items-center gap-2">
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
