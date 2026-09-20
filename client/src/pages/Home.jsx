import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Clock,
  Feather,
  Heart,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Zap,
  MessageCircle,
  Star,
  Package,
  Layers,
  Check,
  Award,
  TrendingDown,
  Sun,
  Coffee,
  Smile,
  Leaf
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

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

  const howToUseSteps = [
    {
      step: 'Step 1',
      title: 'Peel & Stick',
      subtitle: 'Apply to underwear, NOT skin.',
      description: 'Peel away the adhesive backing strip and stick firmly to the outside of your underwear over your lower abdomen or back.',
      tag: 'Zero Bare-Skin Contact',
      icon: Layers,
      color: 'from-pink-500 to-rose-500',
      bg: 'bg-rose-50/80',
      border: 'border-rose-200'
    },
    {
      step: 'Step 2',
      title: 'It Warms Up',
      subtitle: 'Starts heating in 10-15 minutes.',
      description: 'Exposed to air, the 100% natural mineral thermal core activates rapidly, reaching a soothing therapeutic warmth.',
      tag: 'Air-Activated',
      icon: Flame,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200'
    },
    {
      step: 'Step 3',
      title: 'Enjoy Relief',
      subtitle: 'Soothes for up to 8 hours.',
      description: 'Continuous gentle heat dilates blood vessels, increasing oxygen flow and melting away painful uterine spasms.',
      tag: '8+ Hours Relief',
      icon: Heart,
      color: 'from-purple-500 to-indigo-500',
      bg: 'bg-purple-50/80',
      border: 'border-purple-200'
    },
    {
      step: 'Step 4',
      title: 'Live Your Day',
      subtitle: 'Forget the pain and get on with your life.',
      description: 'Go to work, attend college classes, travel, and sleep peacefully with ultra-thin, completely invisible comfort.',
      tag: 'All-Day Freedom',
      icon: Sun,
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200'
    }
  ];

  const timelineMilestones = [
    {
      time: 'Minute 0',
      title: 'Application',
      description: 'Apply the patch to your underwear.',
      badge: 'Easy & Clean',
      highlight: 'Peel & stick in seconds'
    },
    {
      time: 'Minute 15',
      title: 'Activation',
      description: 'The warmth kicks in and relief begins.',
      badge: 'Fast Acting',
      highlight: 'Spasms begin to relax'
    },
    {
      time: 'Hour 1',
      title: 'Peak Comfort',
      description: 'Pain can drop from a 10 down to a 2.',
      badge: 'Pain Drop Curve',
      highlight: 'Deep muscle relaxation'
    },
    {
      time: 'Hour 8',
      title: 'Full Day Care',
      description: 'Still working! Lasts for a full school or work day.',
      badge: '8+ Hours Steady',
      highlight: 'Worry-free mobility'
    }
  ];

  const ingredientsList = [
    {
      num: '1',
      name: 'Iron Powder',
      role: 'Core Thermal Source',
      description: 'Creates gentle, consistent therapeutic heat when naturally exposed to oxygen in the air.',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    {
      num: '2',
      name: 'Vermiculite',
      role: 'Heat Retainer & Distributor',
      description: 'Natural mineral insulator that retains heat and distributes warmth evenly across the entire pad surface.',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      num: '3',
      name: 'Salt',
      role: 'Reaction Catalyst',
      description: 'Natural catalyst that accelerates and stabilizes the heat reaction, ensuring 8+ hours of uninterrupted relief.',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      num: '4',
      name: 'Activated Carbon',
      role: 'Thermal Regulator',
      description: 'Porous carbon helps regulate internal temperature to maintain constant, comfortable warmth without spikes.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  ];

  const gotQuestionsFaqs = [
    {
      q: 'Is it safe for teenagers?',
      a: 'Yes, 13+. Natural heat, no drugs. Safe for young girls experiencing menstrual cramps without any pharmaceutical side effects.',
      color: 'border-orange-200 bg-orange-50/50 text-orange-950'
    },
    {
      q: 'Is it visible under clothes?',
      a: 'No, ultra-thin and blends naturally with your body contours. Completely invisible under jeans, dresses, or uniforms.',
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
    },
    {
      q: 'What if it doesn’t work?',
      a: 'Satisfaction guarantee. Refund within 7 days if not satisfied. We stand 100% behind our menstrual care products.',
      color: 'border-rose-200 bg-rose-50/50 text-rose-950'
    },
    {
      q: 'Is there fragrance?',
      a: 'Fragrance-free and hypoallergenic. Contains no artificial perfumes, parabens, or harsh chemicals.',
      color: 'border-purple-200 bg-purple-50/50 text-purple-950'
    }
  ];

  return (
    <div className="min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F5] via-[#FFF8FA] to-white pt-8 pb-16 md:pt-14 md:pb-24">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center space-x-2 bg-white/90 border border-brand-pink/30 rounded-full px-4 py-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-pink animate-ping" />
                <span className="text-xs font-bold text-brand-navy tracking-wide">
                  Air-Activated • Up to 8 Hours Soothing Warmth
                </span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0A192F] tracking-tight leading-[1.12]">
                Menstrual Cramps Shouldn’t Stop You.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-brand-deepPink to-amber-600">
                  Feel Soothed In Minutes.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover the authentic <strong>ZEBA Periods Pain Relief Heating Pad</strong>. Ultra-thin, wearable, and air-activated with 100% natural, safe ingredients for all-day menstrual freedom.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-pink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-pink text-white font-bold text-base shadow-xl shadow-brand-pink/30 hover:shadow-brand-pink/50 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Shop 1-Pack & 3-Pack</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#how-to-use"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 text-brand-navy hover:text-brand-pink hover:border-brand-pink/40 font-bold text-base shadow-sm hover:shadow transition-all text-center"
                >
                  How It Works
                </a>
              </div>

              {/* Micro Trust Points */}
              <div className="pt-4 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 text-center">
                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Flame className="w-5 h-5 text-brand-pink mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 block">Soothing Heat</span>
                  <span className="text-[9px] text-slate-500">Heats in 10-15 mins</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 block">Up to 8 Hours</span>
                  <span className="text-[9px] text-slate-500">Continuous warmth</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 block">100% Safe</span>
                  <span className="text-[9px] text-slate-500">Natural Ingredients</span>
                </div>
              </div>

            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                
                {/* Main Authentic Packaging Image Card */}
                <div className="rounded-3xl bg-white p-3 shadow-2xl border border-brand-pink/20 relative group overflow-hidden">
                  <img
                    src="/images/zeba-real-packaging-1.jpg"
                    alt="ZEBA Periods Pain Relief Heating Pad Packaging"
                    className="w-full h-auto rounded-2xl object-cover transform group-hover:scale-[1.02] transition-transform duration-500 shadow-sm"
                  />

                  {/* Stamp Badge */}
                  <div className="absolute top-6 left-6 z-10 bg-brand-pink text-white w-14 h-14 rounded-full flex flex-col items-center justify-center text-center p-1 shadow-lg ring-4 ring-white/80 animate-pulse-subtle">
                    <span className="text-[8px] font-black uppercase tracking-wider">SAFE</span>
                    <span className="text-[10px] font-extrabold leading-tight">100%</span>
                    <span className="text-[6px] uppercase font-bold tracking-tighter">Ingredients</span>
                  </div>

                  {/* Floating Value Pill */}
                  <div className="absolute bottom-5 right-5 bg-[#0D1B44]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-brand-gold/30 flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    <div>
                      <span className="text-[11px] font-bold text-white block">Official ZEBA Box</span>
                      <span className="text-[9px] text-brand-gold font-semibold">1-Pack & 3-Pack Available</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TICKER BANNER */}
      <div className="bg-[#0A192F] text-white py-3 overflow-hidden border-y border-brand-pink/20">
        <div className="animate-ticker text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center space-x-8 text-brand-lightGold">
          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-pink" /> ULTRA THIN</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-brand-gold" /> AIR-ACTIVATED HEAT</span>
          <span>•</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% NATURAL INGREDIENTS</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-pink" /> UP TO 8 HOURS SOOTHING COMFORT</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Feather className="w-4 h-4 text-brand-gold" /> SAFE & DISCREET</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> RELIEVES PERIOD PAIN</span>
        </div>
      </div>

      {/* 3. PRODUCT SHOWCASE (1-Pack and 3-Pack) */}
      <section className="py-20 bg-white" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-brand-softPink px-3.5 py-1 rounded-full">
              Authentic ZEBA Packs
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-navy">
              Choose The Right Pack For Your Cycle
            </h2>
            <p className="text-sm text-slate-600">
              Select our single starter pack or choose the 3-Pack Value Box for multi-day period comfort.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[1, 2].map(n => (
                <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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

      {/* 4. HOW TO USE IT (4-Step Infographic Routine) */}
      <section className="py-20 bg-[#FAF8FB] border-t border-slate-100" id="how-to-use">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-brand-softPink px-3.5 py-1 rounded-full">
              Step-by-Step Guide
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy">
              How to Use It
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Effortless 4-step routine to achieve soothing, uninterrupted period comfort anywhere.
            </p>
          </div>

          {/* Official Visual Infographic Banner */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200 shadow-md max-w-5xl mx-auto overflow-hidden">
            <img
              src="/images/zeba-how-to-use-guide.jpg"
              alt="ZEBA How to Use It - 4 Step Guide"
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
                  className={`p-6 rounded-3xl ${s.bg} border ${s.border} shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-brand-navy to-slate-800 shadow-sm">
                        {s.step}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {s.tag}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-brand-pink">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <h3 className="font-display font-extrabold text-xl text-brand-navy">
                      {s.title}
                    </h3>
                    <p className="text-xs font-bold text-brand-pink">
                      {s.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Safety Reminder Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium text-center max-w-2xl mx-auto flex items-center justify-center space-x-2">
            <span className="font-bold">⚠️ Crucial Tip:</span>
            <span>Always apply to the outside of your underwear — never stick directly onto bare skin!</span>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS OVER TIME (Relief Progression Timeline) */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-navy bg-slate-100 px-3.5 py-1 rounded-full">
              Real-Time Progression
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy">
              How It Works Over Time
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Watch your cramps melt away from peak intensity to gentle, lasting ease.
            </p>
          </div>

          {/* Timeline Visual Banner */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200 shadow-md max-w-5xl mx-auto overflow-hidden">
            <img
              src="/images/zeba-how-it-works-timeline.jpg"
              alt="ZEBA How It Works Over Time Timeline"
              className="w-full h-auto rounded-2xl object-cover shadow-sm"
            />
          </div>

          {/* Timeline Milestones Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {timelineMilestones.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-3 hover:border-brand-pink/30 hover:bg-white transition-all text-center"
              >
                <div className="inline-block px-4 py-1.5 rounded-full bg-brand-navy text-brand-gold font-mono font-black text-sm tracking-wide shadow-sm">
                  {m.time}
                </div>
                <h4 className="font-display font-bold text-lg text-brand-navy">{m.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-brand-pink bg-brand-softPink px-3 py-1 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{m.highlight}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. WHAT'S INSIDE? PURE NATURAL GOODNESS (Ingredients Breakdown) */}
      <section className="py-20 bg-gradient-to-b from-[#FAF8FB] to-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full">
              100% Safe Natural Ingredients
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy">
              What’s Inside? Pure Natural Goodness.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Inside is pure, natural goodness: <strong>Iron Powder, Vermiculite, Salt, and Activated Carbon</strong>.
            </p>
          </div>

          {/* Official Ingredients Infographic */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200 shadow-md max-w-5xl mx-auto overflow-hidden">
            <img
              src="/images/zeba-whats-inside-ingredients.jpg"
              alt="ZEBA What's Inside Pure Natural Goodness Ingredients"
              className="w-full h-auto rounded-2xl object-cover shadow-sm"
            />
          </div>

          {/* 4 Layer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {ingredientsList.map((ing, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-xl bg-brand-pink text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {ing.num}
                  </span>
                  <h4 className="font-display font-extrabold text-base text-brand-navy">{ing.name}</h4>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ing.badgeColor}`}>
                  {ing.role}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{ing.description}</p>
              </div>
            ))}
          </div>

          {/* Safe & Gentle Formula Badge */}
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-gradient-to-r from-brand-navy to-slate-900 text-white text-center shadow-xl border border-brand-gold/30 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-brand-gold font-bold text-sm uppercase tracking-wider">
              <Award className="w-5 h-5 text-brand-gold" />
              <span>Safe & Gentle Formula Guarantee</span>
            </div>
            <p className="text-xs text-slate-300">
              Dermatologically tested. 100% Drug-Free • No artificial fragrances • No parabens.
            </p>
          </div>

        </div>
      </section>

      {/* 7. GOT QUESTIONS? WE GOT ANSWERS (Conversational FAQs) */}
      <section className="py-20 bg-white border-t border-slate-100" id="faq">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-brand-softPink px-3.5 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy">
              Got Questions? We Got Answers.
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to know about comfort, safety, and our satisfaction guarantee.
            </p>
          </div>

          {/* Official FAQ Infographic Banner */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200 shadow-md max-w-4xl mx-auto overflow-hidden">
            <img
              src="/images/zeba-got-questions-faq.jpg"
              alt="ZEBA Got Questions We Got Answers Infographic"
              className="w-full h-auto rounded-2xl object-cover shadow-sm"
            />
          </div>

          {/* 4 Interactive Conversational Bubbles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gotQuestionsFaqs.map((faq, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl border ${faq.color} shadow-sm space-y-3 hover:shadow-md transition-all`}
              >
                <div className="flex items-start space-x-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-brand-navy text-white text-[11px] font-black uppercase flex-shrink-0">
                    Q
                  </span>
                  <h4 className="font-display font-bold text-sm text-brand-navy">
                    {faq.q}
                  </h4>
                </div>
                <div className="flex items-start space-x-2.5 pl-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-brand-pink text-white text-[11px] font-black uppercase flex-shrink-0">
                    A
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="py-20 bg-[#0D1B44] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-gold bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            Convenient Period Pain Relief
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white">
            Ready For Worry-Free Period Comfort?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Order your ZEBA Periods Pain Relief Heating Pads today and experience gentle soothing warmth whenever you need it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-pink hover:bg-brand-deepPink text-white font-bold text-sm shadow-xl shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Shop Heating Pads</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/919876543210?text=Hi%20ZEBA%20Team%2C%20I%20want%20to%20order%20ZEBA%20Heating%20Pads"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all"
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
