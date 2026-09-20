import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="bg-[#FCFCFE] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-navy">
          Refund & Return Policy
        </h1>
        <p className="text-slate-500 text-xs">Last updated: September 2026</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">1. Hygiene & Wellness Products</h2>
          <p>
            Due to the intimate healthcare and hygiene nature of period heating pads, opened or tampered product packages cannot be returned or restocked once delivered.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">2. Damaged or Incorrect Orders</h2>
          <p>
            If you received a damaged package or incorrect pack size, please contact us on WhatsApp (+91 98765 43210) or via email (care@zeba.com) within 48 hours of delivery with photos of the outer box and product. We will immediately dispatch a free replacement or issue a full refund to your original payment method.
          </p>
        </section>
      </div>
    </div>
  );
}
