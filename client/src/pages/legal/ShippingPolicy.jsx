import React from 'react';

export default function ShippingPolicy() {
  return (
    <div className="bg-[#FCFCFE] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-navy">
          Shipping & Delivery Policy
        </h1>
        <p className="text-slate-500 text-xs">Last updated: September 2026</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">1. Discreet Packaging Guaranteed</h2>
          <p>
            All ZEBA orders are shipped in 100% confidential, plain, tamper-proof packaging without any sensitive brand or product markings on the outer box.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">2. Delivery Timelines</h2>
          <p>
            Orders are dispatched within 24-48 business hours. Typical delivery timelines:
            <br />• Metro cities: 2 - 4 business days
            <br />• Rest of India: 4 - 7 business days
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">3. Shipping Rates</h2>
          <p>
            • Orders above ₹499 qualify for <strong>FREE Standard Shipping</strong>.
            <br />• Orders below ₹499 incur a nominal shipping fee of ₹49.
          </p>
        </section>
      </div>
    </div>
  );
}
