import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, Database, Info, X, ChevronDown, ChevronUp, Check, Lock } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';

export default function CookieConsentBanner() {
  const {
    isPending,
    isModalOpen,
    consentStatus,
    acceptCookies,
    denyCookies,
    closeConsentModal
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);

  // If already decided and modal is not explicitly requested, don't show
  if (!isPending && !isModalOpen) {
    return null;
  }

  const isExplicitModal = isModalOpen && !isPending;

  return (
    <>
      {/* Dimmed backdrop when opened as an explicit modal from footer */}
      {isExplicitModal && (
        <div
          onClick={closeConsentModal}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-label="Cookie and Cache Storage Preferences"
        className={`fixed z-50 transition-all duration-300 ${
          isExplicitModal
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-xl'
            : 'bottom-20 md:bottom-6 left-3 right-3 sm:left-6 sm:right-6 max-w-3xl mx-auto'
        }`}
      >
        <div className="bg-[#2B1B30]/95 backdrop-blur-xl border border-brand-primaryPink/35 text-white rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.55)]">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-brightPink/30 to-brand-gold/20 border border-brand-primaryPink/40 flex items-center justify-center text-brand-lightGold flex-shrink-0 shadow-inner">
                <Cookie className="w-5 h-5 text-brand-primaryPink" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
                    Cookies & Browser Cache Preferences
                  </h3>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-brand-lightGold border border-white/10 uppercase tracking-wider">
                    Privacy Controls
                  </span>
                </div>
                <p className="text-[11px] text-pink-200/70 mt-0.5">
                  {consentStatus === 'accepted'
                    ? 'Current status: Accepted (Cookies & cache enabled)'
                    : consentStatus === 'denied'
                    ? 'Current status: Denied (No cookies or cache saved)'
                    : 'Choose how ZEBA stores cookies and cache on your device.'}
                </p>
              </div>
            </div>

            {/* Close button if opened via footer */}
            {isExplicitModal && (
              <button
                onClick={closeConsentModal}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-pink-200 transition-colors"
                aria-label="Close preferences"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Description */}
          <div className="mt-3.5 text-xs text-pink-100/85 leading-relaxed space-y-2">
            <p>
              We use cookies and browser cache to keep your shopping bag saved between visits, speed up page load times, and offer a smooth checkout.
            </p>
            <p className="text-pink-200/70 text-[11px]">
              If you click <strong>"Deny & Don't Store"</strong>, we will <strong className="text-white">not store any non-essential cookies, persistent local storage, or browser cache</strong> on your device.
            </p>
          </div>

          {/* Expandable Technical Details */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] font-semibold text-brand-lightGold hover:text-white flex items-center space-x-1 transition-colors"
            >
              <span>{showDetails ? 'Hide Details' : 'View Storage & Cookie Breakdown'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDetails && (
              <div className="mt-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-[11px]">
                <div className="flex items-start space-x-2.5">
                  <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Strictly Necessary (Session-only):</span>
                    <p className="text-pink-100/70 text-[10.5px]">Essential security and transaction verification while navigating. Wiped when the tab closes.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Database className="w-4 h-4 text-brand-primaryPink flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Persistent Bag & Asset Cache (Optional):</span>
                    <p className="text-pink-100/70 text-[10.5px]">Preserves items in your cart across days and caches relief pad images locally so pages open instantly. <em>Disabled when denied.</em></p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Zero Third-Party Advertising Trackers:</span>
                    <p className="text-pink-100/70 text-[10.5px]">ZEBA never sells your data or allows cross-site marketing trackers.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 pt-3.5 border-t border-white/10 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <Link
              to="/privacy-policy"
              className="text-[11px] text-pink-300/80 hover:text-white underline underline-offset-2 self-center sm:self-auto"
            >
              Learn more in our Privacy Policy
            </Link>

            <div className="flex items-center space-x-2.5 sm:self-end">
              <button
                type="button"
                onClick={denyCookies}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-pink-100 text-xs font-bold transition-all active:scale-[0.98]"
              >
                Deny & Don't Store
              </button>

              <button
                type="button"
                onClick={acceptCookies}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-brand-brightPink/30 flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept & Allow</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
