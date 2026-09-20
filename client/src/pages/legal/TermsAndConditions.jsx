import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="bg-[#FCFCFE] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-navy">
          Terms & Conditions
        </h1>
        <p className="text-slate-500 text-xs">Last updated: September 2026</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">1. Acceptance of Terms</h2>
          <p>
            By accessing and purchasing from the ZEBA website, you agree to comply with and be bound by these Terms and Conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">2. Product Usage & Safety Notice</h2>
          <p>
            ZEBA Period Pain Relief Heating Pads are non-medicated thermal self-heating patches for external menstrual comfort. They are designed strictly to be stuck onto the outside of underwear and NOT applied directly to bare skin.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">3. Pricing & Payment</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Payments are securely processed via Razorpay. We reserve the right to modify prices or discontinue packs without prior notice.
          </p>
        </section>
      </div>
    </div>
  );
}
