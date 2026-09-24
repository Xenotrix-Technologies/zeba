import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Truck,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { businessConfig } from '../../config/businessConfig';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const { addToast } = useToast();
  const [copiedSection, setCopiedSection] = useState(null);

  const handleCopy = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    addToast(`${sectionName} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-brand-pink text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Store Configuration & Business Options</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Business Settings & Options
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage brand identity, customer support channels, registered address, tax/GSTIN compliance, and shipping rules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleCopy(JSON.stringify(businessConfig, null, 2), 'Full Business JSON Config')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 transition-all border border-slate-700"
          >
            {copiedSection === 'Full Business JSON Config' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copy Business JSON</span>
          </button>
        </div>
      </div>

      {/* Grid of Business Option Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Brand & Legal Entity */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5 text-brand-gold">
              <Building2 className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Brand & Legal Entity</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-gold/10 text-brand-gold border border-brand-gold/30">
              Identity
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Brand Name:</span>
              <p className="text-white font-bold text-sm mt-0.5">{businessConfig.brandName} ({businessConfig.brandFullName})</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Legal Entity Name:</span>
              <p className="text-slate-200 font-semibold mt-0.5">{businessConfig.legalEntityName}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Brand Tagline:</span>
              <p className="text-slate-300 italic mt-0.5">"{businessConfig.tagline}"</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Website URL & Domain:</span>
              <a href={businessConfig.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-pink hover:underline font-semibold flex items-center space-x-1 mt-0.5">
                <span>{businessConfig.websiteUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 2. Customer Support & Contact Channels */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5 text-emerald-400">
              <Phone className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Contact & Support Channels</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block font-medium">Support Email:</span>
                <p className="text-white font-bold mt-0.5">{businessConfig.supportEmail}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Helpline Phone:</span>
                <p className="text-white font-bold mt-0.5">{businessConfig.supportPhone}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">WhatsApp Support Channel:</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  {businessConfig.whatsapp.displayNumber}
                </span>
                <a
                  href={businessConfig.whatsapp.getWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center space-x-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Link</span>
                </a>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Customer Support Hours:</span>
              <p className="text-slate-300 mt-0.5">{businessConfig.supportHours}</p>
            </div>
          </div>
        </div>

        {/* 3. Registered Office & Tax Compliance */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5 text-brand-pink">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Registered Address & GSTIN</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-pink/10 text-brand-pink border border-brand-pink/30">
              Tax & Legal
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Fulfillment & Registered Office:</span>
              <p className="text-slate-200 mt-0.5 leading-relaxed bg-slate-950 p-3 rounded-2xl border border-slate-800">
                {businessConfig.address.formatted}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 block font-medium">GSTIN Tax ID:</span>
                <p className="text-white font-mono font-bold mt-0.5">{businessConfig.tax.gstin}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">CIN Registration:</span>
                <p className="text-white font-mono font-bold mt-0.5">{businessConfig.tax.cin}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Shipping & Pricing Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5 text-blue-400">
              <Truck className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Shipping & Commerce Rules</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
              E-Commerce
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Free Shipping Threshold:</span>
                <span className="text-emerald-400 font-display font-black text-lg">₹{businessConfig.commerce.freeShippingThreshold}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Standard Shipping Fee:</span>
                <span className="text-slate-200 font-display font-black text-lg">₹{businessConfig.commerce.standardShippingFee}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Delivery & Dispatch Commitment:</span>
              <p className="text-slate-300 mt-0.5">{businessConfig.commerce.dispatchTime}</p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Cash on Delivery (COD):</span>
              <span className="text-emerald-400 font-bold uppercase">{businessConfig.commerce.codAvailable ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>

        {/* 5. Corporate B2B & Wholesale Options */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5 text-amber-400">
              <Briefcase className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Corporate B2B & Wholesale Configuration</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              B2B Desk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">B2B Inquiries:</span>
              <span className="text-emerald-400 font-bold text-sm block mt-0.5">
                {businessConfig.b2b.enableB2BInquiries ? 'Accepting Inquiries' : 'Disabled'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Dedicated B2B Email:</span>
              <span className="text-white font-bold text-sm block mt-0.5">{businessConfig.b2b.inquiryEmail}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Minimum Wholesale Order:</span>
              <span className="text-brand-gold font-bold text-sm block mt-0.5">{businessConfig.b2b.minOrderQuantity} Units</span>
            </div>
          </div>
        </div>

      </div>

      {/* Code Config File Guide */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-start space-x-4">
        <div className="w-10 h-10 rounded-2xl bg-brand-pink/10 border border-brand-pink/30 flex items-center justify-center text-brand-pink flex-shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-slate-300">
          <h4 className="font-bold text-sm text-white">How to edit Business Options in code:</h4>
          <p className="text-slate-400 leading-relaxed">
            All business variables, addresses, phone numbers, and WhatsApp links are centrally managed in:
          </p>
          <code className="inline-block px-3 py-1.5 rounded-lg bg-slate-950 text-brand-pink font-mono text-xs border border-slate-800 mt-1">
            client/src/config/businessConfig.js & server/src/config/businessConfig.js
          </code>
          <p className="text-slate-400 pt-1">
            You can also override any value at runtime using environment variables in your root or server <code>.env</code> file.
          </p>
        </div>
      </div>

    </div>
  );
}
