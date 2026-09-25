import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Clock,
  Feather,
  Heart,
  ChevronDown,
  ArrowRight,
  Zap,
  MessageCircle,
  Star,
  Layers,
  Check,
  Award,
  TrendingDown,
  Sun,
  Activity,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { businessConfig } from '../config/businessConfig';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(1);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get('/products');
        if (res.success && res.products) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const timelineStages = [
    {
      time: 'Minute 0',
      title: 'Easy Application',
      temp: 'Ambient',
      reliefLevel: '0%',
      desc: 'Peel adhesive and stick firmly to the outside of underwear over lower abdomen or back.',
      action: 'Zero bare-skin contact required'
    },
    {
      time: 'Minute 15',
      title: 'Thermal Activation',
      temp: '50°C',
      reliefLevel: '45%',
      desc: 'Natural minerals react gently with ambient air to release continuous therapeutic warmth.',
      action: 'Uterine spasms begin to calm'
    },
    {
      time: 'Hour 1',
      title: 'Peak Muscle Relief',
      temp: '53°C',
      reliefLevel: '90%',
      desc: 'Blood flow increases and deep oxygenation melts away pain for hours of uninterrupted ease.',
      action: 'Pain drops from severe to comfortable'
    },
    {
      time: 'Hour 8+',
      title: 'All-Day Freedom',
      temp: '52°C',
      reliefLevel: '100%',
      desc: 'Sustained warmth keeps you active throughout work, college, travel, or restful sleep.',
      action: 'Full-day worry-free comfort'
    }
  ];

  const howToUseSteps = [
    {
      step: '01',
      title: 'Peel & Stick',
      subtitle: 'Apply to underwear exterior',
      desc: 'Peel the protective backing and press firmly onto the outside of your underwear.',
      badge: 'Zero Skin Irritation',
      icon: Layers,
      accent: 'text-zeba-magenta bg-zeba-softPink'
    },
    {
      step: '02',
      title: 'Air-Activated Heat',
      subtitle: 'Reaches 50–55°C in 15 mins',
      desc: 'Exposed to air, the 100% natural mineral thermal core activates rapidly without microwaves or cords.',
      badge: 'Instant Thermal Core',
      icon: Flame,
      accent: 'text-amber-500 bg-amber-50'
    },
    {
      step: '03',
      title: '8+ Hours Relief',
      subtitle: 'Continuous muscle relaxation',
      desc: 'Continuous therapeutic heat dilates blood vessels, increasing oxygen flow to soothe pelvic cramps.',
      badge: 'Clinically Proven Heat',
      icon: Heart,
      accent: 'text-purple-600 bg-purple-50'
    },
    {
      step: '04',
      title: 'Conquer Your Day',
      subtitle: 'Ultra-thin and invisible',
      desc: 'Slip into tight jeans, formal wear, or workout clothes with complete discretion and zero bulk.',
      badge: 'All-Day Mobility',
      icon: Sun,
      accent: 'text-emerald-600 bg-emerald-50'
    }
  ];

  const naturalIngredients = [
    {
      num: '01',
      name: 'Iron Powder',
      role: 'Core Thermal Source',
      desc: 'Creates gentle, consistent therapeutic heat when naturally oxidised by air contact.'
    },
    {
      num: '02',
      name: 'Vermiculite',
      role: 'Mineral Heat Insulator',
      desc: 'Natural mineral that locks in heat and disperses steady warmth evenly across the pad surface.'
    },
    {
      num: '03',
      name: 'Purified Salt',
      role: 'Thermal Catalyst',
      desc: 'Natural catalyst that accelerates and stabilizes the heat curve for 8+ uninterrupted hours.'
    },
    {
      num: '04',
      name: 'Activated Carbon',
      role: 'Temperature Regulator',
      desc: 'Porous carbon ensures safe temperature moderation preventing hot spots or skin irritation.'
    }
  ];

  const faqs = [
    {
      q: 'Can teenagers and young girls use ZEBA Heating Pads?',
      a: 'Yes, absolutely! ZEBA is 100% drug-free, non-invasive, and contains pure natural minerals. It is ideal for teenagers experiencing painful menstrual cycles without relying on painkillers.'
    },
    {
      q: 'Will the heating pad be visible under tight clothing?',
      a: 'Not at all. ZEBA pads are engineered with an ultra-thin, flexible contour that adheres smoothly to undergarments. They remain completely invisible under leggings, jeans, uniforms, and dresses.'
    },
    {
      q: 'How long does the soothing heat last?',
      a: 'Each ZEBA pad provides up to 8+ hours of continuous, steady therapeutic warmth between 50°C and 55°C, sustaining you through a full school or work day.'
    },
    {
      q: 'Do I stick the pad directly onto my skin?',
      a: 'No. For maximum safety and optimal heat diffusion, always stick the adhesive side to the OUTSIDE of your undergarments, never directly onto bare skin.'
    },
    {
      q: 'What is your satisfaction & return guarantee?',
      a: 'We stand 100% behind ZEBA. If you are not satisfied with your purchase, contact us within 7 days for prompt support and assistance.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF5FA] text-[#241133]">
      
      {/* 1. HERO SECTION (Anti-Slop: Viewport Optimized, Stack Disciplined) */}
      <section className="relative overflow-hidden pt-8 pb-14 md:pt-12 md:pb-18">
        {/* Subtle Ambient Illumination */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-brand-gold/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Text & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Eyebrow badge (Restrained, max 1 per 3 sections) */}
              <div className="inline-flex items-center space-x-2 bg-white/90 border border-brand-pink/30 rounded-full px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-brand-pink animate-ping" />
                <span className="text-xs font-bold text-brand-navy tracking-wide">
                  Air-Activated • Up to 8 Hours Natural Warmth
                </span>
              </div>

              {/* 2-Line High-Impact Headline */}
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#241133] tracking-tight leading-[1.1]">
                Menstrual Cramps Shouldn’t Stop You.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-brand-deepPink to-brand-gold">
                  Feel Soothed in Minutes.
                </span>
              </h1>

              {/* Subtext (Tight, < 20 words) */}
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Wearable, air-activated natural heat therapy delivering up to 8 hours of soothing period relief wherever you go.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-pink to-brand-deepPink hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-brand-pink/25 flex items-center justify-center space-x-2 btn-tactile animate-shimmer"
                >
                  <span>Shop Heating Pads</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-to-use"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-pink/40 text-brand-navy hover:text-brand-pink font-bold text-sm shadow-sm hover:shadow transition-all text-center btn-tactile"
                >
                  How It Works
                </a>
              </div>

              {/* Micro Trust Strip */}
              <div className="pt-3 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 text-center">
                <div className="p-3 rounded-2xl bg-white/90 border border-purple-100 shadow-sm backdrop-blur-sm">
                  <Flame className="w-4 h-4 text-brand-pink mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 block">50–55°C Warmth</span>
                  <span className="text-[9px] text-slate-500">Heats in 5-6 mins</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-purple-100 shadow-sm backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 block">8+ Hours Relief</span>
                  <span className="text-[9px] text-slate-500">Continuous heat</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-purple-100 shadow-sm backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 block">100% Safe</span>
                  <span className="text-[9px] text-slate-500">Natural minerals</span>
                </div>
              </div>

            </div>

            {/* Hero Image Showcase (Rich Packaging Presentation) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                
                {/* Main Authentic Packaging Card */}
                <div className="rounded-3xl bg-white p-3.5 shadow-2xl border border-brand-pink/25 relative group overflow-hidden">
                  <img
                    src="/images/zeba-real-packaging-1.jpg"
                    alt="ZEBA Periods Pain Relief Heating Pad Official Packaging"
                    className="w-full h-auto rounded-2xl object-cover transform group-hover:scale-[1.02] transition-transform duration-500 shadow-sm"
                  />

                  {/* Stamp Badge */}
                  <div className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full pack-safe-stamp text-[#3C1B50] flex flex-col items-center justify-center text-center p-0.5 shadow-lg ring-2 ring-white">
                    <span className="text-[7px] font-black uppercase tracking-wider">SAFE</span>
                    <span className="text-[9px] font-extrabold leading-tight">100%</span>
                    <span className="text-[6px] uppercase font-bold">Natural</span>
                  </div>

                  {/* Floating Rating & Pack Pill */}
                  <div className="absolute bottom-5 right-5 bg-[#260E36]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-brand-gold/40 flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    <div>
                      <span className="text-[11px] font-bold text-white block leading-tight">Authentic ZEBA Box</span>
                      <span className="text-[9px] text-brand-gold font-semibold">1-Pack & 3-Pack Value Box</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TICKER BANNER (Continuous Streamlined Strip) */}
      <div className="bg-[#260E36] text-white py-3 overflow-hidden border-y border-brand-pink/25">
        <div className="animate-ticker text-xs font-bold tracking-wider uppercase flex items-center space-x-8 text-brand-lightGold">
          <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-brand-pink" /> ULTRA THIN DESIGN</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Flame className="w-3.5 h-3.5 text-brand-gold" /> AIR-ACTIVATED HEAT THERAPY</span>
          <span>•</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% NATURAL MINERAL CORE</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-brand-pink" /> UP TO 8 HOURS CONTINUOUS COMFORT</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Feather className="w-3.5 h-3.5 text-brand-gold" /> ZERO BULK & DISCREET WEAR</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Heart className="w-3.5 h-3.5 text-rose-400" /> SOOTHES PERIOD CRAMPS NATURALLY</span>
        </div>
      </div>

      {/* 3. PRODUCT SHOWCASE (1-Pack Starter & 3-Pack Value Box) */}
      <section className="py-16 sm:py-20 bg-white" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-navy">
              Choose the Right Pack for Your Cycle
            </h2>
            <p className="text-sm text-slate-600">
              Select our single starter pack or the multi-day 3-Pack Value Box for complete menstrual cycle comfort.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[1, 2].map(n => (
                <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFeatured={product.pack_count > 1}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 4. INTERACTIVE WARMTH & CRAMP RELIEF SIMULATOR (Anti-Slop: Interactive Progression) */}
      <section className="py-16 sm:py-20 bg-[#FAF5FA] border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy">
              How Relief Unfolds Over Time
            </h2>
            <p className="text-sm text-slate-600">
              Experience the natural thermal reaction melting away muscular spasms from first application to all-day comfort.
            </p>
          </div>

          {/* Interactive Stepper Navigation */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {timelineStages.map((stage, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTimelineIdx(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all btn-tactile ${
                    activeTimelineIdx === idx
                      ? 'bg-brand-navy text-white border-brand-navy shadow-lg ring-2 ring-brand-pink/30'
                      : 'bg-white text-slate-700 border-purple-100 hover:border-brand-pink/30'
                  }`}
                >
                  <span className={`text-[11px] font-mono font-bold block ${activeTimelineIdx === idx ? 'text-brand-gold' : 'text-slate-400'}`}>
                    {stage.time}
                  </span>
                  <span className="font-display font-bold text-sm block mt-0.5">
                    {stage.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Stage Deep-Dive Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-purple-100 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full bg-brand-softPink text-brand-pink font-bold text-xs">
                    {timelineStages[activeTimelineIdx].time}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Phase {activeTimelineIdx + 1} of 4
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-navy">
                  {timelineStages[activeTimelineIdx].title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {timelineStages[activeTimelineIdx].desc}
                </p>

                <div className="pt-2 flex items-center space-x-2 text-xs font-bold text-brand-deepPink bg-brand-softPink/60 px-3.5 py-2 rounded-xl">
                  <TrendingDown className="w-4 h-4 text-brand-pink flex-shrink-0" />
                  <span>{timelineStages[activeTimelineIdx].action}</span>
                </div>
              </div>

              {/* Gauge & Metrics Card */}
              <div className="md:col-span-5 rounded-2xl bg-gradient-to-br from-[#3C1B50] to-[#260E36] p-6 text-white text-center space-y-4 shadow-md border border-brand-gold/30">
                <div className="flex items-center justify-between text-xs text-purple-200 border-b border-white/10 pb-3">
                  <span>Target Temp</span>
                  <span className="font-mono font-bold text-brand-gold">{timelineStages[activeTimelineIdx].temp}</span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-purple-200 block mb-1">Cramp Ease Level</span>
                  <span className="font-display font-black text-4xl text-brand-gold">
                    {timelineStages[activeTimelineIdx].reliefLevel}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-gold to-brand-pink h-full rounded-full transition-all duration-500"
                    style={{ width: timelineStages[activeTimelineIdx].reliefLevel }}
                  />
                </div>

                <p className="text-[10px] text-purple-200 pt-1">
                  Continuous soothing thermal distribution
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. HOW TO USE IT (4-Step Infographic Routine) */}
      <section className="py-16 sm:py-20 bg-white border-t border-purple-100" id="how-to-use">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy">
              How to Use It
            </h2>
            <p className="text-sm text-slate-600">
              Four effortless steps to soothing, uninterrupted period comfort anywhere.
            </p>
          </div>

          {/* Official Visual Infographic */}
          <div className="rounded-3xl bg-slate-50 p-4 sm:p-6 border border-purple-100 shadow-sm max-w-5xl mx-auto overflow-hidden">
            <img
              src="/images/zeba-how-to-use-guide.jpg"
              alt="ZEBA How to Use It - 4 Step Visual Guide"
              className="w-full h-auto rounded-2xl object-cover shadow-sm"
            />
          </div>

          {/* 4 Interactive Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {howToUseSteps.map((s, idx) => {
              const IconComp = s.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#FAF5FA] border border-purple-100 shadow-sm space-y-4 hover:shadow-md hover:border-brand-pink/30 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-brand-navy text-white text-xs font-mono font-bold flex items-center justify-center">
                        {s.step}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {s.badge}
                      </span>
                    </div>

                    <div className={`w-11 h-11 rounded-2xl ${s.accent} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <h3 className="font-display font-extrabold text-lg text-brand-navy">
                      {s.title}
                    </h3>
                    <p className="text-xs font-semibold text-brand-pink">
                      {s.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Crucial Safety Reminder */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium text-center max-w-2xl mx-auto flex items-center justify-center space-x-2">
            <span className="font-bold">⚠️ Safety Notice:</span>
            <span>Always apply to the outside of your undergarments — never stick directly onto bare skin!</span>
          </div>

        </div>
      </section>

      {/* 6. WHAT'S INSIDE? PURE NATURAL GOODNESS (Ingredients Breakdown) */}
      <section className="py-16 sm:py-20 bg-[#FAF5FA] border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy">
              What’s Inside? Pure Natural Goodness.
            </h2>
            <p className="text-sm text-slate-600">
              Formulated with 100% safe, non-toxic mineral components that generate natural heat upon contact with air.
            </p>
          </div>

          {/* Official Ingredients Infographic */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 border border-purple-100 shadow-sm max-w-5xl mx-auto overflow-hidden">
            <img
              src="/images/zeba-whats-inside-ingredients.jpg"
              alt="ZEBA What's Inside Pure Natural Goodness Ingredients"
              className="w-full h-auto rounded-2xl object-cover shadow-sm"
            />
          </div>

          {/* 4 Mineral Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {naturalIngredients.map((ing, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-3 hover:shadow-md hover:border-brand-pink/30 transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-xl bg-brand-pink text-white font-mono font-bold text-xs flex items-center justify-center">
                    {ing.num}
                  </span>
                  <h3 className="font-display font-extrabold text-base text-brand-navy">{ing.name}</h3>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-brand-navy">
                  {ing.role}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{ing.desc}</p>
              </div>
            ))}
          </div>

          {/* Guarantee Seal Box */}
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-[#260E36] text-white text-center shadow-xl border border-brand-gold/40 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-brand-gold font-bold text-sm uppercase tracking-wider">
              <Award className="w-5 h-5 text-brand-gold" />
              <span>Safe & Gentle Formula Guarantee</span>
            </div>
            <p className="text-xs text-purple-200">
              100% Safe Ingredients • Air-Activated • Odourless • Zero Harsh Chemicals
            </p>
          </div>

        </div>
      </section>

      {/* 7. GOT QUESTIONS? WE GOT ANSWERS (Clean Accordion) */}
      <section className="py-16 sm:py-20 bg-white border-t border-purple-100" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy">
              Got Questions? We Got Answers.
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to know about wearability, safety, and our satisfaction guarantee.
            </p>
          </div>

          {/* Interactive Accordion List */}
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? 'border-brand-pink/40 bg-[#FFF9FB] shadow-sm' : 'border-purple-100 bg-white'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between space-x-4 focus:outline-none"
                  >
                    <span className="font-display font-bold text-sm sm:text-base text-brand-navy">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-brand-pink flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-brand-pink/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="py-20 bg-[#260E36] text-white text-center relative overflow-hidden border-t border-purple-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold bg-white/10 px-4 py-1.5 rounded-full border border-brand-gold/30">
            India's 1st Periods Pain Relief Heating Pad
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white">
            Ready for Worry-Free Period Comfort?
          </h2>
          <p className="text-purple-200 text-sm sm:text-base max-w-xl mx-auto">
            Order your ZEBA Periods Pain Relief Heating Pads today and experience gentle soothing warmth whenever you need it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-pink to-brand-deepPink hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-brand-pink/30 flex items-center justify-center space-x-2 btn-tactile animate-shimmer"
            >
              <span>Shop Heating Pads</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={businessConfig.whatsapp.getWhatsAppUrl('Hi ZEBA Team, I want to order ZEBA Heating Pads')}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg flex items-center justify-center space-x-2 btn-tactile"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
