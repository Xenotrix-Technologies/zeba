import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, Flame, Users, Target, Eye, ArrowRight, MessageCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-[#FCFCFE] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-brand-softPink px-3 py-1 rounded-full">
            Our Story & Philosophy
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-brand-navy leading-tight">
            Empowering Women to Live Free From Menstrual Discomfort
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            ZEBA was founded with a single, clear objective: to reimagine menstrual cramp care with effortless, discreet, and natural heat therapy that fits seamlessly into your daily life.
          </p>
        </div>

        {/* Story & Visual split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-navy">
              Redefining the Comfort Experience
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              For generations, coping with period cramps meant carrying heavy hot water bags, wrestling with microwave packs, or having your day disrupted at work or school. We knew there had to be a smarter, more elegant solution.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              We developed the <strong>ZEBA Heating Pad</strong> — an ultra-thin, wearable, air-activated thermal patch that delivers over 8 hours of continuous, soothing warmth directly where you need it most. It adheres discreetly to your clothing, giving you the freedom to move, travel, and conquer your day without interruption.
            </p>
            <div className="pt-2 flex items-center space-x-6">
              <div>
                <span className="font-display font-black text-3xl text-brand-pink block">8+ Hrs</span>
                <span className="text-xs text-slate-500 font-semibold">Continuous Warmth</span>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <span className="font-display font-black text-3xl text-brand-gold block">100%</span>
                <span className="text-xs text-slate-500 font-semibold">Air-Activated</span>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <span className="font-display font-black text-3xl text-brand-navy block">0 Cords</span>
                <span className="text-xs text-slate-500 font-semibold">Mess-Free Portability</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-brand-pink/20 bg-white p-3">
              <img
                src="/images/zeba-hero-lifestyle.jpg"
                alt="ZEBA Brand Lifestyle"
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-brand-roseBg border border-brand-pink/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-pink text-white flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-brand-navy">Our Mission</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To make high-performance, comfortable, and safe period pain relief accessible to every woman across India, replacing inconvenient traditional hot water bottles with modern, discreet self-heating care.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#0A192F] text-white border border-brand-gold/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 text-brand-gold flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-white">Our Vision</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A world where periods never pause life's ambitions. We envision ZEBA as the gold standard in modern feminine wellness, combining thoughtful design with honest, dependable care.
            </p>
          </div>
        </div>

        {/* Why Choose ZEBA */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-extrabold text-3xl text-brand-navy">The ZEBA Difference</h2>
            <p className="text-xs text-slate-500">Quality, convenience, and care built into every single pad.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50">
              <ShieldCheck className="w-6 h-6 text-brand-pink" />
              <h4 className="font-bold text-sm text-brand-navy">Skin-First Safety</h4>
              <p className="text-xs text-slate-600">
                Adhesive wings stick firmly to the outside of undergarments, eliminating skin irritation while providing gentle heat transfer.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50">
              <Sparkles className="w-6 h-6 text-brand-gold" />
              <h4 className="font-bold text-sm text-brand-navy">Pocket-Sized Convenience</h4>
              <p className="text-xs text-slate-600">
                Slim individual foil pouches slip effortlessly into your handbag, gym tote, backpack, or desk drawer.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50">
              <Users className="w-6 h-6 text-emerald-600" />
              <h4 className="font-bold text-sm text-brand-navy">Customer-Centric Care</h4>
              <p className="text-xs text-slate-600">
                Our support team is always available via WhatsApp for questions, cycle advice, and rapid delivery support.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-8 space-y-4">
          <h3 className="font-display font-bold text-2xl text-brand-navy">Ready to experience soothing comfort?</h3>
          <div className="flex justify-center gap-4">
            <Link
              to="/products"
              className="px-8 py-3.5 rounded-2xl bg-brand-pink hover:bg-brand-deepPink text-white font-bold text-sm shadow-md"
            >
              Explore Heating Pads
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
