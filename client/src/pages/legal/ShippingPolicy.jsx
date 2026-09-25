import React from 'react';
import { businessConfig } from '../../config/businessConfig';

export default function ShippingPolicy() {
  return (
    <div className="bg-[#FFF5FA] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-brand-primaryPink/25 shadow-sm space-y-6 text-brand-darkPurple text-xs sm:text-sm leading-relaxed">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deepPurple">
          Shipping & Delivery Policy
        </h1>
        <p className="text-[#805A82] text-xs">Last updated: September 2026 • {businessConfig.legalEntityName}</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">1. Discreet Packaging Guaranteed</h2>
          <p>
            All {businessConfig.brandName} orders are shipped in 100% confidential, plain, tamper-proof packaging without any sensitive brand or product markings on the outer box. Your privacy is always our priority.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">2. Delivery Timelines</h2>
          <p>
            Orders are dispatched within 24 business hours from our fulfillment center in {businessConfig.address.city}, {businessConfig.address.state}. Typical delivery timelines:
            <br />• Metro cities: 2 - 4 business days
            <br />• Rest of India: 3 - 6 business days
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">3. Shipping Rates</h2>
          <p>
            • Orders of <strong>₹{businessConfig.commerce.freeShippingThreshold} and above</strong> qualify for <strong>FREE Standard Shipping</strong>.
            <br />• Orders below ₹{businessConfig.commerce.freeShippingThreshold} incur a nominal shipping fee of ₹{businessConfig.commerce.standardShippingFee}.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">4. Tracking Your Order</h2>
          <p>
            As soon as your parcel is handed over to our courier partner, tracking details are sent via SMS, WhatsApp, and registered email. You can also view live tracking anytime under your <a href="/account" className="text-brand-brightPink font-bold underline">Customer Account</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
