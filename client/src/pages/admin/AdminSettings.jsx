import React, { useState, useEffect } from 'react';
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
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export default function AdminSettings() {
  const { addToast } = useToast();
  const { refreshSettings } = useStoreSettings();
  const [copiedSection, setCopiedSection] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states for sections
  const [brandForm, setBrandForm] = useState({
    brandName: 'ZEBA',
    brandFullName: 'ZEBA Period Care',
    legalEntityName: 'ZEBA Wellness Technologies Private Limited',
    tagline: 'Fast-Acting Natural Heat Therapy for Period Cramp Relief',
    description: 'Ultra-thin, air-activated natural warming pads providing up to 8 hours of discreet, soothing menstrual cramp comfort on the go.',
    websiteUrl: 'https://www.zebaofficial.in'
  });

  const [contactForm, setContactForm] = useState({
    supportEmail: 'info@zebaofficial.in',
    supportPhone: '+91 70259 61509',
    supportHours: 'Monday – Saturday: 9:00 AM – 7:00 PM IST',
    whatsappNumber: '+917025961509',
    whatsappDisplay: '+91 70259 61509'
  });

  const [addressForm, setAddressForm] = useState({
    company: 'ZEBA Wellness Pvt. Ltd.',
    building: 'MM Trading, 7-93 G Mundath Arcade',
    street: 'Melattur',
    city: 'Malappuram',
    state: 'Kerala',
    pincode: '679326',
    country: 'India'
  });

  const [shippingForm, setShippingForm] = useState({
    freeShippingThreshold: '',
    standardShippingFee: '',
    codAvailable: true,
    dispatchTime: 'Dispatched within 24 hours in discreet, unmarked packaging',
    returnWindowDays: 7
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/settings');
        if (res.success && res.settings) {
          const s = res.settings;
          setBrandForm({
            brandName: s.brandName || 'ZEBA',
            brandFullName: s.brandFullName || 'ZEBA Period Care',
            legalEntityName: s.legalEntityName || 'ZEBA Wellness Technologies Private Limited',
            tagline: s.tagline || '',
            description: s.description || '',
            websiteUrl: s.websiteUrl || 'https://www.zebaofficial.in'
          });
          setContactForm({
            supportEmail: s.supportEmail || 'info@zebaofficial.in',
            supportPhone: s.supportPhone || '+91 70259 61509',
            supportHours: s.supportHours || 'Monday – Saturday: 9:00 AM – 7:00 PM IST',
            whatsappNumber: s.whatsapp?.number || '+917025961509',
            whatsappDisplay: s.whatsapp?.displayNumber || '+91 70259 61509'
          });
          setAddressForm({
            company: s.address?.company || 'ZEBA Wellness Pvt. Ltd.',
            building: s.address?.building || 'MM Trading, 7-93 G Mundath Arcade',
            street: s.address?.street || 'Melattur',
            city: s.address?.city || 'Malappuram',
            state: s.address?.state || 'Kerala',
            pincode: s.address?.pincode || '679326',
            country: s.address?.country || 'India'
          });
          setShippingForm({
            freeShippingThreshold: s.commerce?.freeShippingThreshold !== undefined && s.commerce?.freeShippingThreshold !== null ? s.commerce.freeShippingThreshold : '',
            standardShippingFee: s.commerce?.standardShippingFee !== undefined && s.commerce?.standardShippingFee !== null ? s.commerce.standardShippingFee : '',
            codAvailable: Boolean(s.commerce?.codAvailable),
            dispatchTime: s.commerce?.dispatchTime || 'Dispatched within 24 hours',
            returnWindowDays: Number(s.commerce?.returnWindowDays || 7)
          });
        }
      } catch (err) {
        console.error('Failed to load settings from DB', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSection = async (settingKey, category, payload, description) => {
    setSavingKey(settingKey);
    try {
      const res = await api.put(`/settings/${settingKey}`, {
        value: payload,
        category,
        description
      });
      if (res.success) {
        addToast(`Section '${description || settingKey}' saved successfully!`, 'success');
        await refreshSettings();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update setting', 'error');
    } finally {
      setSavingKey(null);
    }
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
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-primaryPink/20 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-brand-brightPink text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Store Settings & Live Configuration</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-dark">
            Business & Store Settings
          </h1>
          <p className="text-xs text-brand-plum/70 mt-1">
            Configure your official brand identity, contact channels, delivery rules, and store information in real time.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleClearTestData}
            disabled={clearing}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center space-x-2 transition-all border border-rose-200 shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>{clearing ? 'Purging...' : 'Purge Dummy Orders'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Editable Business Option Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Brand & Legal Entity */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-primaryPink/15">
            <div className="flex items-center space-x-2.5 text-brand-gold">
              <Building2 className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-brand-dark">Brand & Legal Entity</h3>
            </div>
            <button
              onClick={() => handleSaveSection('brand_info', 'general', brandForm, 'Brand Identity')}
              disabled={savingKey === 'brand_info'}
              className="px-3 py-1.5 rounded-xl bg-brand-deepPurple hover:bg-brand-brightPink text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingKey === 'brand_info' ? 'Saving...' : 'Save Brand'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">Brand Name:</label>
                <input
                  type="text"
                  value={brandForm.brandName}
                  onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
              </div>
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">Full Brand Name:</label>
                <input
                  type="text"
                  value={brandForm.brandFullName}
                  onChange={(e) => setBrandForm({ ...brandForm, brandFullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
              </div>
            </div>

            <div>
              <label className="text-brand-plum/70 block font-bold mb-1">Legal Entity Name:</label>
              <input
                type="text"
                value={brandForm.legalEntityName}
                onChange={(e) => setBrandForm({ ...brandForm, legalEntityName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
              />
            </div>

            <div>
              <label className="text-brand-plum/70 block font-bold mb-1">Brand Tagline:</label>
              <input
                type="text"
                value={brandForm.tagline}
                onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
              />
            </div>

            <div>
              <label className="text-brand-plum/70 block font-bold mb-1">Website URL:</label>
              <input
                type="text"
                value={brandForm.websiteUrl}
                onChange={(e) => setBrandForm({ ...brandForm, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
              />
            </div>
          </div>
        </div>

        {/* 2. Customer Support & WhatsApp Channels */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-primaryPink/15">
            <div className="flex items-center space-x-2.5 text-emerald-600">
              <Phone className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-brand-dark">Contact & WhatsApp Channels</h3>
            </div>
            <button
              onClick={() => handleSaveSection('contact_channels', 'support', {
                supportEmail: contactForm.supportEmail,
                supportPhone: contactForm.supportPhone,
                supportPhoneRaw: contactForm.supportPhone.replace(/[^0-9]/g, ''),
                supportHours: contactForm.supportHours,
                whatsapp: {
                  number: contactForm.whatsappNumber,
                  numberRaw: contactForm.whatsappNumber.replace(/[^0-9]/g, ''),
                  displayNumber: contactForm.whatsappDisplay,
                  defaultMessage: 'Hi ZEBA Team, I would like to inquire about the Period Pain Relief Heating Pads.'
                }
              }, 'Support & WhatsApp')}
              disabled={savingKey === 'contact_channels'}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingKey === 'contact_channels' ? 'Saving...' : 'Save Support'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">Support Email:</label>
                <input
                  type="email"
                  value={contactForm.supportEmail}
                  onChange={(e) => setContactForm({ ...contactForm, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
              </div>
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">Helpline Phone:</label>
                <input
                  type="text"
                  value={contactForm.supportPhone}
                  onChange={(e) => setContactForm({ ...contactForm, supportPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">WhatsApp Raw Number:</label>
                <input
                  type="text"
                  value={contactForm.whatsappNumber}
                  onChange={(e) => setContactForm({ ...contactForm, whatsappNumber: e.target.value })}
                  placeholder="+917025961509"
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
              </div>
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">WhatsApp Display Number:</label>
                <input
                  type="text"
                  value={contactForm.whatsappDisplay}
                  onChange={(e) => setContactForm({ ...contactForm, whatsappDisplay: e.target.value })}
                  placeholder="+91 70259 61509"
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
              </div>
            </div>

            <div>
              <label className="text-brand-plum/70 block font-bold mb-1">Support Operating Hours:</label>
              <input
                type="text"
                value={contactForm.supportHours}
                onChange={(e) => setContactForm({ ...contactForm, supportHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
              />
            </div>
          </div>
        </div>

        {/* 3. Registered Office Address */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-primaryPink/15">
            <div className="flex items-center space-x-2.5 text-brand-brightPink">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-brand-dark">Registered Address</h3>
            </div>
            <button
              onClick={() => {
                const formatted = `${addressForm.building}, ${addressForm.street}, ${addressForm.city}, ${addressForm.state} - ${addressForm.pincode}, ${addressForm.country}`;
                handleSaveSection('business_address', 'address', { ...addressForm, formatted }, 'Office Address');
              }}
              disabled={savingKey === 'business_address'}
              className="px-3 py-1.5 rounded-xl bg-brand-deepPurple hover:bg-brand-brightPink text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingKey ? 'Saving...' : 'Save Address'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-brand-plum/70 block font-bold mb-1">Building & Arcade:</label>
              <input
                type="text"
                value={addressForm.building}
                onChange={(e) => setAddressForm({ ...addressForm, building: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">Street / Locality:</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
              </div>
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">City:</label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">State:</label>
                <input
                  type="text"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
              </div>
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">Pincode:</label>
                <input
                  type="text"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                />
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
            <button
              onClick={() => handleSaveSection('shipping_commerce', 'commerce', {
                currency: '₹',
                currencyCode: 'INR',
                freeShippingThreshold: shippingForm.freeShippingThreshold !== '' && shippingForm.freeShippingThreshold !== null ? Number(shippingForm.freeShippingThreshold) : 1000,
                standardShippingFee: shippingForm.standardShippingFee !== '' && shippingForm.standardShippingFee !== null ? Number(shippingForm.standardShippingFee) : 49,
                codAvailable: Boolean(shippingForm.codAvailable),
                codFee: 0,
                estimatedDeliveryDays: '3 - 5 business days',
                dispatchTime: shippingForm.dispatchTime,
                returnWindowDays: Number(shippingForm.returnWindowDays || 7)
              }, 'Shipping Rules')}
              disabled={savingKey === 'shipping_commerce'}
              className="px-3 py-1.5 rounded-xl bg-brand-deepPurple hover:bg-brand-brightPink text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingKey === 'shipping_commerce' ? 'Saving...' : 'Save Shipping'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">Free Shipping Min (₹):</label>
                <input
                  type="number"
                  value={shippingForm.freeShippingThreshold}
                  onChange={(e) => setShippingForm({ ...shippingForm, freeShippingThreshold: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs font-bold text-emerald-600 focus:outline-none focus:border-brand-brightPink"
                />
              </div>
              <div>
                <label className="text-brand-plum/70 block font-bold mb-1">Standard Shipping Fee (₹):</label>
                <input
                  type="number"
                  value={shippingForm.standardShippingFee}
                  onChange={(e) => setShippingForm({ ...shippingForm, standardShippingFee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs font-bold text-brand-dark focus:outline-none focus:border-brand-brightPink"
                />
              </div>
            </div>

            <div>
              <label className="text-brand-plum/70 block font-bold mb-1">Dispatch & Delivery Commitment:</label>
              <input
                type="text"
                value={shippingForm.dispatchTime}
                onChange={(e) => setShippingForm({ ...shippingForm, dispatchTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-brand-primaryPink/15">
              <span className="text-brand-plum/80 font-medium">Cash on Delivery (COD):</span>
              <button
                type="button"
                onClick={() => setShippingForm({ ...shippingForm, codAvailable: !shippingForm.codAvailable })}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  shippingForm.codAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {shippingForm.codAvailable ? '✓ Enabled' : '✕ Disabled'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Live Synchronization Info */}
      <div className="p-6 rounded-3xl bg-white border border-brand-primaryPink/25 shadow-sm flex items-start space-x-4">
        <div className="p-3 rounded-2xl bg-brand-softPink text-brand-brightPink flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-bold text-sm text-brand-dark">
            Live Storefront Synchronization
          </h4>
          <p className="text-xs text-brand-plum/80 leading-relaxed">
            Every update in these panels takes effect across your storefront immediately. Headers, announcement bars, WhatsApp support links, pricing thresholds, and customer notifications update in real time.
          </p>
        </div>
      </div>

    </div>
  );
}
