import React from 'react';
import { businessConfig } from '../../config/businessConfig';

export default function TermsAndConditions() {
  return (
    <div className="bg-[#FFF5FA] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-brand-primaryPink/25 shadow-sm space-y-6 text-brand-darkPurple text-xs sm:text-sm leading-relaxed">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deepPurple">
          Terms & Conditions
        </h1>
        <p className="text-[#805A82] text-xs">Last updated: September 2026 • {businessConfig.legalEntityName}</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">1. Acceptance of Terms</h2>
          <p>
            By accessing and purchasing from the {businessConfig.brandName} website ({businessConfig.websiteUrl}), you agree to comply with and be bound by these Terms and Conditions established by {businessConfig.legalEntityName}.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">2. Product Usage & Safety Notice</h2>
          <p>
            {businessConfig.brandName} Period Pain Relief Heating Pads are non-medicated thermal self-heating patches for external menstrual comfort. They are designed strictly to be stuck onto the outside of underwear and NOT applied directly to bare skin.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">3. Pricing & Payment</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are inclusive of applicable Goods & Services Tax (GST: {businessConfig.tax.gstPercentage}%). Payments are securely processed via {businessConfig.payments.gatewayName}. We reserve the right to modify prices or promotional bundles without prior notice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">4. Governing Law & Jurisdiction</h2>
          <p>
            These terms shall be governed by and constructed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in {businessConfig.address.city}, {businessConfig.address.state}.
          </p>
        </section>
      </div>
    </div>
  );
}
