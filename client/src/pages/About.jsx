import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Target, Eye, Users } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';

export default function About() {
  return (
    <div className="bg-[#FFF5FA] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-brightPink bg-white px-3 py-1 rounded-full border border-brand-primaryPink/30 shadow-sm">
            Our Story & Philosophy
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-brand-deepPurple leading-tight">
            Empowering Women to Live Free From Menstrual Discomfort
          </h1>
          <p className="text-base text-[#805A82] leading-relaxed">
            ZEBA was founded with a single, clear objective: to reimagine menstrual cramp care with effortless, discreet, and natural heat therapy that fits seamlessly into your daily life.
          </p>
        </div>

        {/* Story & Visual split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deepPurple">
              Redefining the Comfort Experience
            </h2>
            <p className="text-sm text-[#805A82] leading-relaxed">
              For generations, coping with period cramps meant carrying heavy hot water bags, wrestling with microwave packs, or having your day disrupted at work or school. We knew there had to be a smarter, more elegant solution.
            </p>
            <p className="text-sm text-[#805A82] leading-relaxed">
              We developed the <strong>ZEBA Heating Pad</strong> — an ultra-thin, wearable, air-activated thermal patch that delivers over 8 hours of continuous, soothing warmth directly where you need it most. It adheres discreetly to your clothing, giving you the freedom to move, travel, and conquer your day without interruption.
            </p>
            <div className="pt-2 flex items-center space-x-6">
              <div>
                <span className="font-display font-black text-3xl text-brand-brightPink block">8+ Hrs</span>
                <span className="text-xs text-[#805A82] font-semibold">Continuous Warmth</span>
              </div>
              <div className="w-px h-10 bg-brand-primaryPink/25" />
              <div>
                <span className="font-display font-black text-3xl text-brand-gold block">100%</span>
                <span className="text-xs text-[#805A82] font-semibold">Air-Activated</span>
              </div>
              <div className="w-px h-10 bg-brand-primaryPink/25" />
              <div>
                <span className="font-display font-black text-3xl text-brand-deepPurple block">0 Cords</span>
                <span className="text-xs text-[#805A82] font-semibold">Mess-Free Portability</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-primaryPink/30 bg-white p-3">
              <img
                src="/images/zeba-hero-lifestyle.jpg"
                alt="ZEBA Brand Lifestyle"
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision Cards (Alternating Pink & Purple) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white border-2 border-brand-primaryPink/30 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-softPink text-brand-brightPink flex items-center justify-center border border-brand-primaryPink/30">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-brand-deepPurple">Our Mission</h3>
            <p className="text-xs sm:text-sm text-[#805A82] leading-relaxed">
              To make high-performance, comfortable, and safe period pain relief accessible to every woman across India, replacing inconvenient traditional hot water bottles with modern, discreet self-heating care.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-tr from-[#38283D] to-[#5F3F68] text-white border border-brand-gold/40 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-brand-gold flex items-center justify-center border border-brand-gold/30">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-white">Our Vision</h3>
            <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed">
              A world where periods never pause life's ambitions. We envision ZEBA as the gold standard in modern feminine wellness, combining thoughtful design with honest, dependable care.
            </p>
          </div>
        </div>

        {/* Why Choose ZEBA */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-primaryPink/25 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-brightPink bg-brand-softPink px-3 py-1 rounded-full border border-brand-primaryPink/25">
              Care & Integrity
            </span>
            <h2 className="font-display font-extrabold text-3xl text-brand-deepPurple">The ZEBA Difference</h2>
            <p className="text-xs text-[#805A82]">Quality, convenience, and care built into every single pad.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-5 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/20">
              <ShieldCheck className="w-6 h-6 text-brand-brightPink" />
              <h4 className="font-bold text-sm text-brand-deepPurple">Skin-First Safety</h4>
              <p className="text-xs text-[#805A82]">
                Adhesive wings stick firmly to the outside of undergarments, eliminating skin irritation while providing gentle heat transfer.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/20">
              <Sparkles className="w-6 h-6 text-brand-gold" />
              <h4 className="font-bold text-sm text-brand-deepPurple">Pocket-Sized Convenience</h4>
              <p className="text-xs text-[#805A82]">
                Slim individual foil pouches slip effortlessly into your handbag, gym tote, backpack, or desk drawer.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/20">
              <Users className="w-6 h-6 text-emerald-600" />
              <h4 className="font-bold text-sm text-brand-deepPurple">Customer-Centric Care</h4>
              <p className="text-xs text-[#805A82]">
                Our support team is always available via WhatsApp for questions, cycle advice, and rapid delivery support.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-8 space-y-4">
          <h3 className="font-display font-bold text-2xl text-brand-deepPurple">Ready to experience soothing comfort?</h3>
          <div className="flex justify-center gap-4">
            <Link
              to="/products"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:opacity-95 text-white font-bold text-sm shadow-md shadow-brand-pink/30 btn-tactile"
            >
              Explore Heating Pads
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
