import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Gift,
  Tag,
  Bell,
  Heart,
  ShieldCheck,
  Megaphone,
  Eye,
  Smartphone,
  Monitor,
  Save,
  RotateCcw,
  Check,
  Copy,
  ArrowRight,
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';


const AVAILABLE_ICONS = [
  { id: 'Sparkles', label: 'Sparkles (✨)', icon: Sparkles },
  { id: 'Flame', label: 'Fire / Deal (🔥)', icon: Flame },
  { id: 'Tag', label: 'Discount Tag (🏷️)', icon: Tag },
  { id: 'Gift', label: 'Gift Box (🎁)', icon: Gift },
  { id: 'Bell', label: 'Notification (🔔)', icon: Bell },
  { id: 'Heart', label: 'Love / Care (💖)', icon: Heart },
  { id: 'ShieldCheck', label: 'Safe / Natural (🛡️)', icon: ShieldCheck },
  { id: 'None', label: 'No Icon', icon: null }
];

const DEFAULT_OFFER_BAR = {
  enabled: true,
  message: 'Special Offer: Free Fast Shipping on orders above ₹1000!',
  secondaryText: '• 100% Safe Natural Minerals • Discreet Packaging',
  linkUrl: '',
  bgColor: '#e60e8c',
  textColor: '#FFFFFF',
  accentColor: '#FFFFFF',
  icon: 'Sparkles',
  pulseEffect: true,
  showSecondaryOnMobile: false
};

export default function AdminOfferBar() {
  const { settings, refreshSettings } = useStoreSettings();
  const { addToast } = useToast();

  const [form, setForm] = useState(DEFAULT_OFFER_BAR);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' or 'mobile'
  const [copiedPreview, setCopiedPreview] = useState(false);

  const currentThreshold = Number(settings.commerce?.freeShippingThreshold || 1000);
  const thresholdSuffix = currentThreshold > 0 ? `on orders above ₹${currentThreshold}!` : 'on all orders!';

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/settings');
        if (res.success && res.settings) {
          const remoteOfferBar = res.settings.offerBar || res.raw?.offer_bar;
          if (remoteOfferBar) {
            let initialMessage = '';
            if (remoteOfferBar.message) {
              initialMessage = remoteOfferBar.message;
            } else if (remoteOfferBar.customText) {
              initialMessage = remoteOfferBar.customText;
            } else {
              const parts = [
                remoteOfferBar.badgeText,
                remoteOfferBar.boldText,
                remoteOfferBar.autoThreshold
                  ? (currentThreshold > 0 ? `on orders above ₹${currentThreshold}!` : 'on all orders!')
                  : remoteOfferBar.subText
              ].filter(Boolean);
              initialMessage = parts.join(' ').replace(/\s+/g, ' ').trim();
            }

            if (!initialMessage) {
              initialMessage = 'Special Offer: Free Fast Shipping on orders above ₹1000!';
            }

            setForm({
              enabled: remoteOfferBar.enabled !== undefined ? Boolean(remoteOfferBar.enabled) : true,
              message: initialMessage,
              secondaryText: remoteOfferBar.secondaryText !== undefined ? remoteOfferBar.secondaryText : '• 100% Safe Natural Minerals • Discreet Packaging',
              linkUrl: remoteOfferBar.linkUrl || '',
              bgColor: '#e60e8c',
              textColor: '#FFFFFF',
              accentColor: '#FFFFFF',
              icon: remoteOfferBar.icon || 'Sparkles',
              pulseEffect: remoteOfferBar.pulseEffect !== undefined ? Boolean(remoteOfferBar.pulseEffect) : true,
              showSecondaryOnMobile: remoteOfferBar.showSecondaryOnMobile !== undefined ? Boolean(remoteOfferBar.showSecondaryOnMobile) : false
            });
          }
        }
      } catch (err) {
        console.error('Failed to load offer bar settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [currentThreshold]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        enabled: Boolean(form.enabled),
        mode: 'custom',
        message: form.message,
        customText: form.message,
        badgeText: '',
        boldText: form.message,
        subText: '',
        autoThreshold: false,
        secondaryText: form.secondaryText || '',
        linkUrl: form.linkUrl || '',
        icon: form.icon || 'Sparkles',
        pulseEffect: Boolean(form.pulseEffect),
        showSecondaryOnMobile: Boolean(form.showSecondaryOnMobile),
        couponCode: '',
        bgColor: '#e60e8c',
        textColor: '#FFFFFF',
        accentColor: '#FFFFFF'
      };
      const res = await api.put('/settings/offer_bar', {
        value: payload,
        category: 'announcement',
        description: 'Top Announcement and Offer Bar'
      });
      if (res.success) {
        addToast('Offer Bar settings saved and applied to storefront!', 'success');
        await refreshSettings();
      }
    } catch (err) {
      addToast(err.message || 'Failed to save offer bar settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset offer bar settings back to ZEBA default configuration?')) {
      setForm(DEFAULT_OFFER_BAR);
      addToast('Reset to default values. Click "Save Changes" to apply.', 'info');
    }
  };

  const handleTestCopy = (code) => {
    if (!code) return;
    setCopiedPreview(true);
    addToast(`Test Copied: Promo code "${code}"!`, 'success');
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  const SelectedIconComponent = AVAILABLE_ICONS.find((i) => i.id === form.icon)?.icon;

  return (
    <div className="space-y-8 max-w-6xl pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-primaryPink/20 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-brand-brightPink text-xs font-bold uppercase tracking-wider mb-1">
            <Megaphone className="w-4 h-4" />
            <span>Storefront Top Announcement Banner</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-dark">
            Offer Bar Management
          </h1>
          <p className="text-xs text-brand-plum/70 mt-1">
            Manage the top notification bar across your store. Configure promotions, free shipping highlights, and discount coupon tags.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all border border-slate-200 shadow-sm disabled:opacity-50"
            title="Reset to default brand settings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-brand-deepPurple hover:bg-brand-brightPink text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Offer Bar'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Interactive Live Preview */}
      <div className="bg-white border border-brand-primaryPink/25 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-brand-primaryPink/15">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-brand-softPink text-brand-brightPink">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-sm text-brand-dark">
              Live Real-Time Preview
            </h3>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                form.enabled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {form.enabled ? '● Live on Store' : '○ Hidden (Disabled)'}
            </span>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-all ${
                previewMode === 'desktop' ? 'bg-white text-brand-deepPurple shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop View</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-all ${
                previewMode === 'mobile' ? 'bg-white text-brand-deepPurple shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>
          </div>
        </div>

        {/* The Preview Frame */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2 sm:p-4">
          <div className={`mx-auto transition-all ${previewMode === 'mobile' ? 'max-w-sm border border-slate-300 rounded-2xl overflow-hidden shadow-md bg-white' : 'w-full rounded-xl overflow-hidden shadow-sm'}`}>
            
            {/* The Actual Rendered Offer Bar */}
            {form.enabled ? (
              <div
                style={{
                  backgroundColor: form.bgColor || '#e60e8c',
                  color: form.textColor || '#FFFFFF'
                }}
                className={`py-2 px-4 text-xs md:text-sm font-brand font-medium tracking-wide text-center border-b border-white/10 flex items-center justify-center flex-wrap gap-x-2 gap-y-1 transition-all ${
                  form.linkUrl ? 'cursor-pointer hover:opacity-95' : ''
                }`}
                onClick={() => {
                  if (form.linkUrl) {
                    addToast(`Preview: Navigating to "${form.linkUrl}"`, 'info');
                  }
                }}
              >
                {SelectedIconComponent && (
                  <SelectedIconComponent
                    className={`w-3.5 h-3.5 flex-shrink-0 ${form.pulseEffect ? 'animate-pulse' : ''}`}
                    style={{ color: form.accentColor || '#ECC695' }}
                  />
                )}

                <span className="font-semibold">
                  {form.message || 'Special Offer: Free Fast Shipping on orders above ₹1000!'}
                </span>

                {form.secondaryText && (
                  <span
                    style={{ color: form.accentColor || '#ECC695' }}
                    className={`font-semibold ${
                      previewMode === 'mobile' && !form.showSecondaryOnMobile ? 'hidden' : form.showSecondaryOnMobile ? 'inline' : 'hidden md:inline'
                    }`}
                  >
                    {form.secondaryText}
                  </span>
                )}

                {form.linkUrl && (
                  <span className="hidden sm:inline-flex items-center text-[11px] opacity-80 ml-1">
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            ) : (
              <div className="py-4 px-4 text-center text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl border border-dashed border-slate-300">
                <AlertCircle className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                The Offer Bar is currently disabled. Toggle &quot;Enable Offer Bar&quot; below to display it.
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Announcement Message */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center space-x-2.5 text-brand-deepPurple pb-3 border-b border-brand-primaryPink/15">
            <Megaphone className="w-5 h-5 text-brand-brightPink" />
            <div>
              <h3 className="font-display font-bold text-base text-brand-dark">
                Announcement Message
              </h3>
              <p className="text-[11px] text-brand-plum/70">
                Write what customers see in the top announcement bar.
              </p>
            </div>
          </div>

          {/* Main Message Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-dark block">
              Offer / Announcement Text:
            </label>
            <textarea
              rows={2}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="e.g. Special Offer: 1 pack 4% off • 3 packs 5% off!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-primaryPink/30 text-xs text-brand-dark focus:outline-none focus:border-brand-brightPink focus:ring-1 focus:ring-brand-brightPink font-medium leading-relaxed"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-brand-plum/70 block uppercase tracking-wider">
              Quick Suggestions (Click to fill):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, message: `Special Offer: Free Fast Shipping on orders above ₹${currentThreshold}!` })}
                className="px-2.5 py-1.5 rounded-lg bg-brand-softPink/60 hover:bg-brand-softPink border border-brand-primaryPink/25 text-[11px] font-semibold text-brand-deepPurple transition-all text-left"
              >
                ✨ Free Shipping (₹{currentThreshold}+)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, message: 'Special Offer: 1 Pack 4% Off • 3 Packs 5% Off!' })}
                className="px-2.5 py-1.5 rounded-lg bg-brand-softPink/60 hover:bg-brand-softPink border border-brand-primaryPink/25 text-[11px] font-semibold text-brand-deepPurple transition-all text-left"
              >
                🏷️ Pack Discounts (1 Pack 4% / 3 Pack 5%)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, message: 'Limited Period Deal: Flat 10% OFF on all Period Care kits today!' })}
                className="px-2.5 py-1.5 rounded-lg bg-brand-softPink/60 hover:bg-brand-softPink border border-brand-primaryPink/25 text-[11px] font-semibold text-brand-deepPurple transition-all text-left"
              >
                🔥 Flash Sale Deal
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, message: '100% Natural Heat Therapy • Up to 8 Hours Period Relief' })}
                className="px-2.5 py-1.5 rounded-lg bg-brand-softPink/60 hover:bg-brand-softPink border border-brand-primaryPink/25 text-[11px] font-semibold text-brand-deepPurple transition-all text-left"
              >
                🌿 Natural Care Highlights
              </button>
            </div>
          </div>

          {/* Secondary Bullets / Highlights */}
          <div className="space-y-2 pt-3 border-t border-brand-primaryPink/15">
            <label className="text-xs font-bold text-brand-dark block">
              Secondary Highlights / Perks (Optional):
            </label>
            <input
              type="text"
              value={form.secondaryText}
              onChange={(e) => setForm({ ...form, secondaryText: e.target.value })}
              placeholder="• 100% Safe Natural Minerals • Discreet Packaging"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
            />
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="showSecondaryOnMobile"
                checked={form.showSecondaryOnMobile}
                onChange={(e) => setForm({ ...form, showSecondaryOnMobile: e.target.checked })}
                className="w-4 h-4 text-brand-brightPink rounded focus:ring-brand-brightPink cursor-pointer"
              />
              <label htmlFor="showSecondaryOnMobile" className="text-xs text-brand-plum/80 font-medium cursor-pointer">
                Show secondary highlights on mobile phones
              </label>
            </div>
          </div>
        </div>

        {/* 2. Display & Settings */}
        <div className="bg-white border border-brand-primaryPink/20 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center space-x-2.5 text-brand-deepPurple pb-3 border-b border-brand-primaryPink/15">
            <Sliders className="w-5 h-5 text-brand-brightPink" />
            <div>
              <h3 className="font-display font-bold text-base text-brand-dark">
                Display & Settings
              </h3>
              <p className="text-[11px] text-brand-plum/70">
                Manage banner visibility, click link, and icon animation.
              </p>
            </div>
          </div>

          {/* Master Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-brand-dark block">
                Show Offer Bar on Storefront
              </span>
              <span className="text-[11px] text-brand-plum/70">
                Turn the top announcement banner on or off globally.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, enabled: !form.enabled })}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                form.enabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Banner Clickable Link URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-dark block">
              Offer Link Destination (Optional):
            </label>
            <input
              type="text"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              placeholder="e.g. /products or /cart"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
            />
            <span className="text-[10px] text-brand-plum/60 block">
              If provided, clicking the offer bar redirects customers to this link.
            </span>
          </div>

          {/* Icon Selector & Animation */}
          <div className="space-y-3 pt-3 border-t border-brand-primaryPink/15">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-dark block">
                Offer Bar Icon:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pulseEffect"
                  checked={form.pulseEffect}
                  onChange={(e) => setForm({ ...form, pulseEffect: e.target.checked })}
                  className="w-4 h-4 text-brand-brightPink rounded focus:ring-brand-brightPink cursor-pointer"
                />
                <label htmlFor="pulseEffect" className="text-xs text-brand-plum/80 font-medium cursor-pointer">
                  Subtle pulse animation
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const Icon = item.icon;
                const isSelected = form.icon === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setForm({ ...form, icon: item.id })}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                      isSelected
                        ? 'border-brand-brightPink bg-brand-softPink/60 text-brand-deepPurple font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    {Icon ? <Icon className="w-4 h-4" /> : <span className="text-xs font-mono">—</span>}
                    <span className="text-[10px] truncate max-w-full">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Floating / Bottom Save Bar */}
      <div className="sticky bottom-6 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-brand-primaryPink/30 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-brand-plum">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">
            Changes to the offer bar take effect immediately across all storefront visitor sessions.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-deepPurple hover:bg-brand-brightPink text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
