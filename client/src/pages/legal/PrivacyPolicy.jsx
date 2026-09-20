import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#FCFCFE] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-navy">
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-xs">Last updated: September 2026</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">1. Information We Collect</h2>
          <p>
            When you purchase from ZEBA or interact with our services, we collect necessary personal details such as your full name, shipping address, mobile phone number, and email address. Payment data is processed securely through Razorpay; ZEBA does not store raw credit/debit card numbers on its servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">2. How We Use Your Information</h2>
          <p>
            We use collected data solely to process orders, arrange discreet parcel delivery, send order tracking updates via SMS/Email/WhatsApp, and provide customer support.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">3. Data Protection & Security</h2>
          <p>
            We employ industry-standard 256-bit SSL encryption and strict server-side authorization controls to safeguard customer information against unauthorized access.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-brand-navy">4. Contact Us</h2>
          <p>
            If you have questions about our privacy practices, contact us at <strong>care@zeba.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
