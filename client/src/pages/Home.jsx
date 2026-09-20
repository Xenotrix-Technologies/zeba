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
  Award
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

  const faqs = [
    {
      q: 'How does the ZEBA Heating Pad work?',
      a: 'The ZEBA Heating Pad uses 100% safe, air-activated natural thermal technology. As soon as you remove it from the sealed pouch, it begins warming up within 5-6 minutes upon exposure to air, providing a steady soothing heat (approx 50°C - 55°C) that lasts up to 8 hours.'
    },
    {
      q: 'Can I stick the heating pad directly on my bare skin?',
      a: 'No, for safety and maximum comfort, always stick the adhesive backing to the OUTSIDE of your underwear or undergarment over the lower abdomen or lower back. Do not apply directly onto bare skin.'
    },
    {
      q: 'Is the heat pad visible under tight clothes?',
      a: 'Not at all. ZEBA pads are ultra-thin, lightweight, and curved to match your body contour. You can wear them seamlessly under jeans, dresses, leggings, or office formals without anyone noticing.'
    },
    {
      q: 'What is the difference between the 1-Pack and 3-Pack?',
      a: 'The 1-Pack is our starter pack containing 1 single-use pad. The 3-Pack Value Box contains 3 individually sealed heating pads for multi-day period comfort at a discounted bundle price (Save over 37%).'
    },
    {
      q: 'How quickly does it get delivered?',
      a: 'All orders are dispatched within 24 hours in 100% confidential, plain discreet packaging with no external markings. Delivery takes 2-4 days for metro cities across India.'
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
                Discover the authentic <strong>ZEBA Periods Pain Relief Heating Pad</strong>. Ultra-thin, wearable, and air-activated in 5 minutes with 100% safe ingredients for all-day period comfort.
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
                  href="#how-it-works"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 text-brand-navy hover:text-brand-pink hover:border-brand-pink/40 font-bold text-base shadow-sm hover:shadow transition-all text-center"
                >
                  How It Works
                </a>
              </div>

              {/* Micro Trust Points matching packaging icons */}
              <div className="pt-4 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 text-center">
                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Flame className="w-5 h-5 text-brand-pink mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 block">Soothing Heat</span>
                  <span className="text-[9px] text-slate-500">Heats in 5-6 mins</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 block">Up to 8 Hours</span>
                  <span className="text-[9px] text-slate-500">Continuous use</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-slate-800 block">100% Safe</span>
                  <span className="text-[9px] text-slate-500">Natural Ingredients</span>
                </div>
              </div>

            </div>

            {/* Hero Product Images Showcase with Authentic Packaging Photos */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                
                {/* Main Authentic Packaging Image Card */}
                <div className="rounded-3xl bg-white p-3 shadow-2xl border border-brand-pink/20 relative group overflow-hidden">
                  <img
                    src="/images/zeba-real-packaging-1.jpg"
                    alt="ZEBA Periods Pain Relief Heating Pad Packaging"
                    className="w-full h-auto rounded-2xl object-cover transform group-hover:scale-[1.02] transition-transform duration-500 shadow-sm"
                  />

                  {/* Stamp Badge: Safe 100% Ingredients */}
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

      {/* 2. TICKER BANNER (Matching side of box) */}
      <div className="bg-[#0A192F] text-white py-3 overflow-hidden border-y border-brand-pink/20">
        <div className="animate-ticker text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center space-x-8 text-brand-lightGold">
          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-pink" /> ULTRA THIN</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-brand-gold" /> AIR-ACTIVATED IN 5 MINS</span>
          <span>•</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% SAFE INGREDIENTS</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-pink" /> UP TO 8 HOURS CONTINUOUS WARMTH</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Feather className="w-4 h-4 text-brand-gold" /> SAFE & CONVENIENT</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> RELIEVES PERIOD PAIN</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-pink" /> ULTRA THIN</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-brand-gold" /> AIR-ACTIVATED IN 5 MINS</span>
          <span>•</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% SAFE INGREDIENTS</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-pink" /> UP TO 8 HOURS CONTINUOUS WARMTH</span>
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
              Select our single starter pack or choose the 3-Pack Value Box for complete period cycle comfort.
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

      {/* 4. PRODUCT ANATOMY (The Lavender Comfort Patch) */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-navy bg-slate-100 px-3.5 py-1 rounded-full">
              Product Anatomy
            </span>
            <h2 className="font-display font-extrabold text-3xl text-brand-navy">
              Engineered For Maximum Comfort & Discreet Wear
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Each ZEBA pad features a gentle waffle-weave texture and air-activated thermal core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Feature 1 */}
            <div className="space-y-4 text-center md:text-right">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="inline-block p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Layers className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-brand-navy">Soft Waffle-Weave Layer</h4>
                <p className="text-xs text-slate-600">
                  Breathable textured top sheet provides uniform heat distribution without hot spots.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="inline-block p-2 rounded-xl bg-rose-50 text-brand-pink">
                  <Flame className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-brand-navy">Air-Activated Thermal Core</h4>
                <p className="text-xs text-slate-600">
                  Natural iron & mineral formula activates on air contact to reach 50°C - 55°C within 5 minutes.
                </p>
              </div>
            </div>

            {/* Center: Real Packaging Showcase with Patch */}
            <div className="p-4 rounded-3xl bg-white border border-brand-pink/20 shadow-xl text-center">
              <img
                src="/images/zeba-real-packaging-2.jpg"
                alt="ZEBA Heating Pad Patch View"
                className="w-full h-auto rounded-2xl object-cover shadow-sm"
              />
              <span className="inline-block mt-3 text-xs font-bold text-brand-navy bg-brand-softPink px-3 py-1 rounded-full">
                Ultra-Thin Lavender Soft Pad
              </span>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 text-center md:text-left">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="inline-block p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-brand-navy">Underwear Adhesive Wings</h4>
                <p className="text-xs text-slate-600">
                  Sticks securely to the outside of your undergarments for zero direct skin contact.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="inline-block p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-brand-navy">Up to 8 Hours Sustained Heat</h4>
                <p className="text-xs text-slate-600">
                  Continuous steady warmth to relax uterine muscles throughout work and sleep.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS (Direct from the Back of Box) */}
      <section className="py-20 bg-white border-t border-slate-100" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-brand-softPink px-3.5 py-1 rounded-full">
              Official Box Instructions
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-navy">
              How To Use ZEBA Heating Pad
            </h2>
            <p className="text-sm text-slate-600">
              Simple 3-step application for instant menstrual cramp relief anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-brand-roseBg border border-brand-pink/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink text-white font-display font-extrabold text-lg flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="font-display font-bold text-xl text-brand-navy">Remove from Packaging</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simple and convenient to use, the ZEBA Pain Relief Heating Pad heats up within 5-6 minutes when exposed to air. The pad should feel soft when it is working.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-brand-roseBg border border-brand-pink/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink text-white font-display font-extrabold text-lg flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="font-display font-bold text-xl text-brand-navy">Stick it On</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stick the pad securely to your underwear and enjoy soothing warmth and relief. Every few hours, remove it for 5 minutes to give your skin a short break, then reattach.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-brand-roseBg border border-brand-pink/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink text-white font-display font-extrabold text-lg flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="font-display font-bold text-xl text-brand-navy">Go Forth, Worry-Free</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designed for life on the go, the ZEBA Period Pain Relief Heating Pad provides discreet, soothing relief from cramps so you can stay comfortable and carry on with your day.
              </p>
            </div>

          </div>

          <div className="mt-10 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium text-center max-w-2xl mx-auto flex items-center justify-center space-x-2">
            <span className="font-bold">⚠️ Safety Notice:</span>
            <span>External use only. Always adhere to underwear; never stick directly to bare skin.</span>
          </div>

        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-20 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-brand-softPink px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="font-display font-extrabold text-3xl text-brand-navy">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-brand-navy hover:text-brand-pink transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-brand-pink' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. FINAL HIGH-CONVERTING CTA BANNER */}
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
