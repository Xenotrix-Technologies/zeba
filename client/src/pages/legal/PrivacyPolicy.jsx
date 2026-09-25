import React from 'react';
import { businessConfig } from '../../config/businessConfig';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#FFF5FA] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-brand-primaryPink/25 shadow-sm space-y-6 text-brand-darkPurple text-xs sm:text-sm leading-relaxed">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deepPurple">
          Privacy Policy
        </h1>
        <p className="text-[#805A82] text-xs">Last updated: September 2026 • {businessConfig.legalEntityName}</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">1. Information We Collect</h2>
          <p>
            When you purchase from {businessConfig.brandName} or interact with our services, we collect necessary personal details such as your full name, shipping address, mobile phone number, and email address. Payment data is processed securely through {businessConfig.payments.gatewayName}; {businessConfig.brandName} does not store raw credit/debit card numbers on its servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">2. How We Use Your Information</h2>
          <p>
            We use collected data solely to process orders, arrange discreet parcel delivery, send order tracking updates via SMS/Email/WhatsApp, and provide customer support.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">3. Data Protection & Security</h2>
          <p>
            We employ industry-standard 256-bit SSL encryption and strict server-side authorization controls to safeguard customer information against unauthorized access.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-deepPurple">4. Corporate & Legal Inquiries</h2>
          <p>
            If you have questions about our privacy practices, contact our Data Grievance Officer at <strong>{businessConfig.supportEmail}</strong> or by writing to our registered office:
          </p>
          <div className="p-3.5 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/20 text-xs text-[#805A82] mt-2">
            <strong className="text-brand-deepPurple">{businessConfig.legalEntityName}</strong><br />
            {businessConfig.address.formatted}<br />
            GSTIN: {businessConfig.tax.gstin} • CIN: {businessConfig.tax.cin}
          </div>
        </section>
      </div>
    </div>
  );
}
