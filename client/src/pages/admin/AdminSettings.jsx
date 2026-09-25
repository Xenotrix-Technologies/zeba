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
  Info,
  Trash2
} from 'lucide-react';
import api from '../../services/api';
import { businessConfig } from '../../config/businessConfig';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const { addToast } = useToast();
  const [copiedSection, setCopiedSection] = useState(null);
  const [clearing, setClearing] = useState(false);

  const handleCopy = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    addToast(`${sectionName} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleClearTestData = async () => {
    if (!window.confirm('Are you sure you want to purge all dummy/test orders and customers? This will reset store metrics to zero.')) {
      return;
    }
    setClearing(true);
    try {
      const res = await api.post('/admin/clear-test-data');
      if (res.success) {
        addToast('All dummy test data and orders purged successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to clear dummy data', 'error');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-primaryPink/20 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-brand-brightPink text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Store Configuration & Business Options</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-dark">
            Business Settings & Options
          </h1>
          <p className="text-xs text-brand-plum/70 mt-1">
            Centrally manage brand identity, customer support channels, registered address, tax/GSTIN compliance, and shipping rules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleClearTestData}
            disabled={clearing}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center space-x-2 transition-all border border-rose-200 shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>{clearing ? 'Purging...' : 'Purge Dummy Orders & Data'}</span>
          </button>

          <button
            onClick={() => handleCopy(JSON.stringify(businessConfig, null, 2), 'Full Business JSON Config')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-brand-softPink text-brand-plum hover:text-brand-dark font-bold text-xs flex items-center space-x-2 transition-all border border-brand-primaryPink/30 shadow-sm"
          >
            {copiedSection === 'Full Business JSON Config' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>Copy Business JSON</span>
          </button>
        </div>
      </div>

      {/* Grid of Business Option Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Brand & Legal Entity */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-primaryPink/15">
            <div className="flex items-center space-x-2.5 text-brand-gold">
              <Building2 className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-brand-dark">Brand & Legal Entity</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-gold/15 text-brand-dark border border-brand-gold/30">
              Identity
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-brand-plum/70 block font-medium">Brand Name:</span>
              <p className="text-brand-dark font-bold text-sm mt-0.5">{businessConfig.brandName} ({businessConfig.brandFullName})</p>
            </div>
            <div>
              <span className="text-brand-plum/70 block font-medium">Legal Entity Name:</span>
              <p className="text-brand-plum font-semibold mt-0.5">{businessConfig.legalEntityName}</p>
            </div>
            <div>
              <span className="text-brand-plum/70 block font-medium">Brand Tagline:</span>
              <p className="text-brand-plum italic mt-0.5">"{businessConfig.tagline}"</p>
            </div>
            <div>
              <span className="text-brand-plum/70 block font-medium">Website URL & Domain:</span>
              <a href={businessConfig.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-brightPink hover:underline font-semibold flex items-center space-x-1 mt-0.5">
                <span>{businessConfig.websiteUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 2. Customer Support & Contact Channels */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-primaryPink/15">
            <div className="flex items-center space-x-2.5 text-emerald-600">
              <Phone className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-brand-dark">Contact & Support Channels</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-brand-plum/70 block font-medium">Support Email:</span>
                <p className="text-brand-dark font-bold mt-0.5">{businessConfig.supportEmail}</p>
              </div>
              <div>
                <span className="text-brand-plum/70 block font-medium">Helpline Phone:</span>
                <p className="text-brand-dark font-bold mt-0.5">{businessConfig.supportPhone}</p>
              </div>
            </div>

            <div>
              <span className="text-brand-plum/70 block font-medium">WhatsApp Support Channel:</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  {businessConfig.whatsapp.displayNumber}
                </span>
                <a
                  href={businessConfig.whatsapp.getWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-brand-softPink hover:bg-brand-primaryPink/20 text-xs font-semibold text-brand-plum flex items-center space-x-1 border border-brand-primaryPink/25 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test Link</span>
                </a>
              </div>
            </div>

            <div>
              <span className="text-brand-plum/70 block font-medium">Customer Support Hours:</span>
              <p className="text-brand-plum mt-0.5">{businessConfig.supportHours}</p>
            </div>
          </div>
        </div>

        {/* 3. Registered Office & Tax Compliance */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-primaryPink/15">
            <div className="flex items-center space-x-2.5 text-brand-brightPink">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-brand-dark">Registered Address & GSTIN</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-softPink text-brand-deepPurple border border-brand-primaryPink/30">
              Tax & Legal
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-brand-plum/70 block font-medium">Fulfillment & Registered Office:</span>
              <p className="text-brand-dark mt-0.5 leading-relaxed bg-brand-softPink/40 p-3 rounded-2xl border border-brand-primaryPink/20">
                {businessConfig.address.formatted}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-brand-plum/70 block font-medium">GSTIN Tax ID:</span>
                <p className="text-brand-dark font-mono font-bold mt-0.5">{businessConfig.tax.gstin}</p>
              </div>
              <div>
                <span className="text-brand-plum/70 block font-medium">CIN Registration:</span>
                <p className="text-brand-dark font-mono font-bold mt-0.5">{businessConfig.tax.cin}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Shipping & Pricing Rules */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-primaryPink/15">
            <div className="flex items-center space-x-2.5 text-brand-deepPurple">
              <Truck className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-brand-dark">Shipping & Commerce Rules</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-softPink text-brand-deepPurple border border-brand-primaryPink/30">
              E-Commerce
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-brand-softPink/40 border border-brand-primaryPink/20">
                <span className="text-brand-plum/70 block text-[11px]">Free Shipping Threshold:</span>
                <span className="text-emerald-600 font-display font-black text-lg">₹{businessConfig.commerce.freeShippingThreshold}</span>
              </div>
              <div className="p-3 rounded-2xl bg-brand-softPink/40 border border-brand-primaryPink/20">
                <span className="text-brand-plum/70 block text-[11px]">Standard Shipping Fee:</span>
                <span className="text-brand-dark font-display font-black text-lg">₹{businessConfig.commerce.standardShippingFee}</span>
              </div>
            </div>

            <div>
              <span className="text-brand-plum/70 block font-medium">Delivery & Dispatch Commitment:</span>
              <p className="text-brand-plum mt-0.5">{businessConfig.commerce.dispatchTime}</p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-brand-primaryPink/15">
              <span className="text-brand-plum/70">Cash on Delivery (COD):</span>
              <span className="text-emerald-600 font-bold uppercase">{businessConfig.commerce.codAvailable ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>

        {/* 5. Corporate B2B & Wholesale Options */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-brand-primaryPink/15">
            <div className="flex items-center space-x-2.5 text-brand-gold">
              <Briefcase className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-brand-dark">Corporate B2B & Wholesale Configuration</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              B2B Desk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-brand-softPink/40 border border-brand-primaryPink/20">
              <span className="text-brand-plum/70 block text-[11px]">B2B Inquiries:</span>
              <span className="text-emerald-600 font-bold text-sm block mt-0.5">
                {businessConfig.b2b.enableB2BInquiries ? 'Accepting Inquiries' : 'Disabled'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-softPink/40 border border-brand-primaryPink/20">
              <span className="text-brand-plum/70 block text-[11px]">Dedicated B2B Email:</span>
              <span className="text-brand-dark font-bold text-sm block mt-0.5">{businessConfig.b2b.inquiryEmail}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-softPink/40 border border-brand-primaryPink/20">
              <span className="text-brand-plum/70 block text-[11px]">Minimum Wholesale Order:</span>
              <span className="text-brand-gold font-bold text-sm block mt-0.5">{businessConfig.b2b.minOrderQuantity} Units</span>
            </div>
          </div>
        </div>

      </div>

      {/* Code Config File Guide */}
      <div className="p-6 rounded-3xl bg-white border border-brand-primaryPink/25 shadow-sm flex items-start space-x-4">
        <div className="p-3 rounded-2xl bg-brand-softPink text-brand-brightPink flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-bold text-sm text-brand-dark">
            Centralized Business Source of Truth
          </h4>
          <p className="text-xs text-brand-plum/80 leading-relaxed">
            All brand variables, GSTIN, WhatsApp links, legal entity designations, and fulfillment thresholds are defined in <code className="text-brand-brightPink font-mono font-bold bg-brand-softPink px-1.5 py-0.5 rounded">client/src/config/businessConfig.js</code>. Updating values there automatically cascades across the entire customer storefront, legal documents, admin dashboards, and WhatsApp invoice dispatchers.
          </p>
        </div>
      </div>

    </div>
  );
}
