import React from 'react';
import { businessConfig } from '../../config/businessConfig';

export default function RefundPolicy() {
  return (
    <div className="bg-[#FFF5FA] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-brand-primaryPink/25 shadow-sm space-y-6 text-brand-darkPurple text-xs sm:text-sm leading-relaxed">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deepPurple">
          Refund & Return Policy
        </h1>
        <p className="text-[#805A82] text-xs">Last updated: September 2026 • {businessConfig.legalEntityName}</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">1. Hygiene & Wellness Products</h2>
          <p>
            Due to the intimate healthcare, self-heating nature, and hygiene standards of menstrual care products, opened or used heating pad pouches cannot be returned or restocked once delivered.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">2. Damaged, Defective, or Incorrect Deliveries</h2>
          <p>
            If your package arrived damaged, opened in transit, or with incorrect pack quantities, please notify our team within <strong>{businessConfig.commerce.returnWindowDays} days</strong> of delivery. Contact us via WhatsApp ({businessConfig.whatsapp.displayNumber}) or email (<strong>{businessConfig.supportEmail}</strong>) with photos of the outer box and product batch.
          </p>
          <p>
            Upon quick verification, we will immediately dispatch an expedited free replacement or process a 100% full refund to your original payment method within 3 - 5 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
