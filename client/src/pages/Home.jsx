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
  MessageCircle,
  Star,
  Layers,
  Award,
  TrendingDown,
  Sun
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useStoreSettings } from '../context/StoreSettingsContext';

const DEFAULT_TIMELINE = [
  {
    time: 'Minute 0',
    title: 'Easy Application',
    temp: 'Ambient',
    reliefLevel: '0%',
    desc: 'Peel adhesive and stick firmly to the outside of underwear over lower abdomen or back.',
    action: 'Zero bare-skin contact required'
  },
  {
    time: 'Minute 5',
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

const DEFAULT_STEPS = [
  {
    step: '01',
    title: 'Peel & Stick',
    subtitle: 'Apply to underwear exterior',
    desc: 'Peel the protective backing and press firmly onto the outside of your underwear.',
    badge: 'Zero Skin Irritation',
    icon: Layers,
    accent: 'text-brand-brightPink bg-brand-softPink'
  },
  {
    step: '02',
    title: 'Air-Activated Heat',
    subtitle: 'Reaches 50–55°C in 5 mins',
    desc: 'Exposed to air, the 100% natural mineral thermal core activates rapidly without microwaves or cords.',
    badge: 'Instant Thermal Core',
    icon: Flame,
    accent: 'text-brand-gold bg-[#FDF5D6]'
  },
  {
    step: '03',
    title: '8+ Hours Relief',
    subtitle: 'Continuous muscle relaxation',
    desc: 'Continuous therapeutic heat dilates blood vessels, increasing oxygen flow to soothe pelvic cramps.',
    badge: 'Clinically Proven Heat',
    icon: Heart,
    accent: 'text-brand-brightPink bg-brand-softPink'
  },
  {
    step: '04',
    title: 'Conquer Your Day',
    subtitle: 'Ultra-thin and invisible',
    desc: 'Slip into tight jeans, formal wear, or workout clothes with complete discretion and zero bulk.',
    badge: 'All-Day Mobility',
    icon: Sun,
    accent: 'text-brand-gold bg-[#FDF5D6]'
  }
];

const DEFAULT_INGREDIENTS = [
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

const DEFAULT_REVIEWS = [
  {
    id: 1,
    author_name: 'Fathima Noureen',
    rating: 5,
    title: 'No more popping painkillers every month',
    comment: 'I was looking for a 100% drug-free solution and ZEBA exceeded my expectations. The temperature is consistent and very soothing.',
    location: 'Calicut, Kerala',
    is_verified_purchase: true
  },
  {
    id: 2,
    author_name: 'Drishya K.',
    rating: 5,
    title: 'Must-have for travel and college',
    comment: 'Ordered the 3-pack bundle and it arrived in 2 days. The lavender packaging is so premium and pretty. Highly recommended to all girls!',
    location: 'Malappuram, Kerala',
    is_verified_purchase: true
  },
  {
    id: 3,
    author_name: 'Pooja Nair',
    rating: 5,
    title: 'Gentle warmth with zero skin irritation',
    comment: 'Since you stick it on the outside of your underwear, there is zero itching or red marks. Heats up so fast and feels like a warm comforting hug.',
    location: 'Kochi, Kerala',
    is_verified_purchase: true
  },
  {
    id: 4,
    author_name: 'Ananya Sharma',
    rating: 5,
    title: 'Life Saver During Long Work Days!',
    comment: 'I usually have crippling cramps on day 1 and 2. ZEBA is so discreet under my formal pants and keeps warming for more than 8 hours straight. Completely replaced my bulky hot water bag.',
    location: 'Bengaluru, Karnataka',
    is_verified_purchase: true
  }
];

export default function Home() {
  const { settings, getWhatsAppUrl } = useStoreSettings();
  const [products, setProducts] = useState([]);
  const [timelineStages, setTimelineStages] = useState(DEFAULT_TIMELINE);
  const [howToUseSteps, setHowToUseSteps] = useState(DEFAULT_STEPS);
  const [naturalIngredients, setNaturalIngredients] = useState(DEFAULT_INGREDIENTS);
  const [faqs, setFaqs] = useState([]);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(1);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  useEffect(() => {
    async function loadAllDatabaseData() {
      try {
        const [prodRes, contentRes, faqRes, revRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/content'),
          api.get('/faqs'),
          api.get('/reviews')
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value?.success && prodRes.value.products?.length > 0) {
          setProducts(prodRes.value.products);
        }

        if (contentRes.status === 'fulfilled' && contentRes.value?.success && contentRes.value.content) {
          const c = contentRes.value.content;
          if (c.timeline_stages?.items) setTimelineStages(c.timeline_stages.items);
          if (c.natural_ingredients?.items) setNaturalIngredients(c.natural_ingredients.items);
          if (c.how_to_use_steps?.items) {
            const icons = [Layers, Flame, Heart, Sun];
            const accents = [
              'text-brand-brightPink bg-brand-softPink',
              'text-brand-gold bg-[#FDF5D6]',
              'text-brand-brightPink bg-brand-softPink',
              'text-brand-gold bg-[#FDF5D6]'
            ];
            setHowToUseSteps(c.how_to_use_steps.items.map((item, idx) => ({
              ...item,
              icon: icons[idx % icons.length],
              accent: accents[idx % accents.length]
            })));
          }
        }

        if (faqRes.status === 'fulfilled' && faqRes.value?.success && faqRes.value.faqs?.length > 0) {
          setFaqs(faqRes.value.faqs.map(f => ({ q: f.question, a: f.answer })));
        }

        if (revRes.status === 'fulfilled' && revRes.value?.success && revRes.value.reviews?.length > 0) {
          setReviews(revRes.value.reviews);
        }
      } catch (err) {
        console.error('Failed to load database content', err);
      } finally {
        setLoading(false);
      }
    }

    loadAllDatabaseData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF5FA] text-[#38283D]">
      
      {/* 1. HERO SECTION (Product-Focused, Soft Pink Gradient, Packaging Details) */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-20 bg-gradient-to-b from-[#FFF5FA] via-[#FFEAF4]/60 to-[#FFF5FA]">
        {/* Subtle Decorative Pink/Purple Ambient Shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primaryPink/15 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-brand-deepPurple/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Text & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Modern Trust & Innovation Eyebrow */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-brightPink/10 border border-brand-brightPink/25 text-brand-brightPink font-black text-[11px] tracking-wide shadow-xs">
                  <Sparkles className="w-3 h-3 text-brand-gold animate-pulse" />
                  India’s 1st
                </span>
                <span className="inline-flex items-center gap-1.5 text-brand-darkPurple font-bold text-xs">
                  <Award className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                  Premium Imported Quality
                </span>
                <span className="hidden sm:inline text-brand-primaryPink/40">•</span>
                <span className="inline-flex items-center gap-1.5 text-[#805A82] font-semibold text-xs">
                  <Flame className="w-3.5 h-3.5 text-brand-brightPink flex-shrink-0" />
                  Air-Activated 8H Heat
                </span>
              </div>

              {/* Large Dark-Purple Heading */}
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#38283D] tracking-tight leading-[1.1]">
                Menstrual Cramps Shouldn’t Stop You.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-brightPink via-brand-deepPink to-[#805A82]">
                  Feel Soothed in Minutes.
                </span>
              </h1>

              {/* Supporting text in muted plum tone */}
              <p className="text-sm sm:text-base text-[#805A82] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Wearable, air-activated natural heat therapy delivering up to 8 hours of soothing period relief wherever you go.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-brand-pink/25 flex items-center justify-center space-x-2 btn-tactile animate-shimmer"
                >
                  <span>Shop Heating Pads</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-to-use"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border-2 border-brand-purple/30 hover:border-brand-gold text-brand-deepPurple hover:text-brand-brightPink font-bold text-sm shadow-sm hover:shadow transition-all text-center btn-tactile"
                >
                  How It Works
                </a>
              </div>

              {/* Micro Trust Strip */}
              <div className="pt-3 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 text-center">
                <div className="p-3 rounded-2xl bg-white/90 border border-brand-primaryPink/20 shadow-sm backdrop-blur-sm">
                  <Flame className="w-4 h-4 text-brand-brightPink mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-brand-deepPurple block">50–55°C Warmth</span>
                  <span className="text-[9px] text-[#805A82]">Heats in 5 mins</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-brand-primaryPink/20 shadow-sm backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-brand-gold mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-brand-deepPurple block">8+ Hours Relief</span>
                  <span className="text-[9px] text-[#805A82]">Continuous heat</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/90 border border-brand-primaryPink/20 shadow-sm backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-brand-deepPurple block">100% Drug-Free</span>
                  <span className="text-[9px] text-[#805A82]">Natural minerals</span>
                </div>
              </div>

            </div>

            {/* Hero Image Showcase (Prominent Authentic Packaging) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                
                {/* Main Authentic Packaging Card */}
                <div className="rounded-3xl bg-white p-3.5 shadow-2xl border-2 border-brand-primaryPink/30 relative group overflow-hidden">
                  <img
                    src="/images/zeba-1pack.webp"
                    alt="ZEBA Periods Pain Relief Heating Pad Official Packaging"
                    width="500"
                    height="500"
                    fetchPriority="high"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/zeba-1pack.jpg';
                    }}
                    className="w-full h-auto rounded-2xl object-cover transform group-hover:scale-[1.02] transition-transform duration-500 shadow-sm"
                  />

                  {/* Stamp Badge */}
                  <div className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full pack-safe-stamp text-white flex flex-col items-center justify-center text-center p-0.5 shadow-lg ring-2 ring-white">
                    <span className="text-[7px] font-black uppercase tracking-wider">SAFE</span>
                    <span className="text-[9px] font-extrabold leading-tight">100%</span>
                    <span className="text-[6px] uppercase font-bold">Natural</span>
                  </div>

                  {/* Floating Rating & Pack Pill */}
                  <div className="absolute bottom-5 right-5 bg-[#38283D]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-brand-gold/50 flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    <div>
                      <span className="text-[11px] font-bold text-white block leading-tight">Authentic ZEBA Box</span>
                      <span className="text-[9px] text-brand-lightGold font-semibold">1-Pack & 3-Pack Value Box</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TICKER BANNER (Deep Purple & Gold Packaging Aesthetic) */}
      <div className="bg-[#5F3F68] text-white py-3 overflow-hidden border-y border-brand-gold/30 shadow-sm">
        <div className="animate-ticker text-xs font-bold tracking-wider uppercase flex items-center space-x-8 text-brand-lightGold">
          <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-brand-primaryPink" /> ULTRA THIN DESIGN</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Flame className="w-3.5 h-3.5 text-brand-gold" /> AIR-ACTIVATED HEAT THERAPY</span>
          <span>•</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> 100% NATURAL MINERAL CORE</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-brand-primaryPink" /> UP TO 8 HOURS CONTINUOUS COMFORT</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Feather className="w-3.5 h-3.5 text-brand-gold" /> ZERO BULK & DISCREET WEAR</span>
          <span>•</span>
          <span className="flex items-center gap-2"><Heart className="w-3.5 h-3.5 text-pink-300" /> SOOTHES PERIOD CRAMPS NATURALLY</span>
        </div>
      </div>

      {/* 3. PRODUCT SHOWCASE (1-Pack Starter & 3-Pack Value Box) */}
      <section className="py-16 sm:py-20 bg-white" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-brightPink bg-brand-softPink px-3 py-1 rounded-full border border-brand-primaryPink/30">
              Natural Cramp Care
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-deepPurple">
              Choose the Right Pack for Your Cycle
            </h2>
            <p className="text-sm text-[#805A82]">
              Select our single starter pack or the multi-day 3-Pack Value Box for complete menstrual cycle comfort.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[1, 2].map(n => (
                <div key={n} className="h-96 rounded-3xl bg-brand-softPink/60 animate-pulse border border-brand-pink/20" />
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

      {/* 4. INTERACTIVE WARMTH & CRAMP RELIEF SIMULATOR */}
      <section className="py-16 sm:py-20 bg-[#FFF5FA] border-t border-brand-primaryPink/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-brightPink bg-white px-3 py-1 rounded-full border border-brand-primaryPink/30">
              Therapeutic Action
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-deepPurple">
              How Relief Unfolds Over Time
            </h2>
            <p className="text-sm text-[#805A82]">
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
                      ? 'bg-brand-deepPurple text-white border-brand-deepPurple shadow-lg ring-2 ring-brand-brightPink/40'
                      : 'bg-white text-brand-darkPurple border-brand-primaryPink/20 hover:border-brand-primaryPink'
                  }`}
                >
                  <span className={`text-[11px] font-mono font-bold block ${activeTimelineIdx === idx ? 'text-brand-lightGold' : 'text-brand-purple'}`}>
                    {stage.time}
                  </span>
                  <span className="font-display font-bold text-sm block mt-0.5">
                    {stage.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Stage Deep-Dive Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-brand-primaryPink/30 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full bg-brand-softPink text-brand-brightPink font-bold text-xs border border-brand-primaryPink/30">
                    {timelineStages[activeTimelineIdx].time}
                  </span>
                  <span className="text-xs font-semibold text-[#805A82]">
                    Phase {activeTimelineIdx + 1} of 4
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deepPurple">
                  {timelineStages[activeTimelineIdx].title}
                </h3>

                <p className="text-sm text-[#805A82] leading-relaxed">
                  {timelineStages[activeTimelineIdx].desc}
                </p>

                <div className="pt-2 flex items-center space-x-2 text-xs font-bold text-brand-deepPink bg-brand-softPink px-3.5 py-2 rounded-xl border border-brand-primaryPink/30">
                  <TrendingDown className="w-4 h-4 text-brand-brightPink flex-shrink-0" />
                  <span>{timelineStages[activeTimelineIdx].action}</span>
                </div>
              </div>

              {/* Gauge & Metrics Card (Packaging Plum/Purple) */}
              <div className="md:col-span-5 rounded-2xl bg-gradient-to-br from-[#5F3F68] to-[#38283D] p-6 text-white text-center space-y-4 shadow-md border border-brand-gold/40">
                <div className="flex items-center justify-between text-xs text-pink-200 border-b border-white/10 pb-3">
                  <span>Target Temp</span>
                  <span className="font-mono font-bold text-brand-gold">{timelineStages[activeTimelineIdx].temp}</span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-pink-200 block mb-1">Cramp Ease Level</span>
                  <span className="font-display font-black text-4xl text-brand-gold">
                    {timelineStages[activeTimelineIdx].reliefLevel}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-gold to-brand-brightPink h-full rounded-full transition-all duration-500"
                    style={{ width: timelineStages[activeTimelineIdx].reliefLevel }}
                  />
                </div>

                <p className="text-[10px] text-pink-200/80 pt-1">
                  Continuous soothing thermal distribution
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. HOW TO USE IT (Packaging Deep Purple Section Background) */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#5F3F68] to-[#4A2F52] text-white border-t border-brand-pink/20" id="how-to-use">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-lightGold bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Simple Application
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
              How to Use It
            </h2>
            <p className="text-sm text-pink-100/80">
              Four effortless steps to soothing, uninterrupted period comfort anywhere.
            </p>
          </div>

          {/* Official Visual Infographic */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 border-2 border-brand-gold/40 shadow-2xl max-w-5xl mx-auto overflow-hidden">
            <img
              src="/images/zeba-how-to-use-guide.webp"
              alt="ZEBA How to Use It - 4 Step Visual Guide"
              width="1000"
              height="600"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/zeba-how-to-use-guide.jpg';
              }}
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
                  className="p-6 rounded-3xl bg-white text-[#38283D] border border-brand-primaryPink/30 shadow-lg space-y-4 hover:shadow-2xl hover:border-brand-gold transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-brand-deepPurple text-brand-gold text-xs font-mono font-bold flex items-center justify-center border border-brand-gold/30">
                        {s.step}
                      </span>
                      <span className="text-[10px] font-bold text-brand-deepPurple uppercase tracking-wider">
                        {s.badge}
                      </span>
                    </div>

                    <div className={`w-11 h-11 rounded-2xl ${s.accent} flex items-center justify-center transition-transform group-hover:scale-105 border border-brand-primaryPink/20`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <h3 className="font-display font-extrabold text-lg text-brand-deepPurple">
                      {s.title}
                    </h3>
                    <p className="text-xs font-semibold text-brand-brightPink">
                      {s.subtitle}
                    </p>
                    <p className="text-xs text-[#805A82] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Crucial Safety Reminder */}
          <div className="p-4 rounded-2xl bg-white/10 border border-brand-gold/40 text-brand-lightGold text-xs font-medium text-center max-w-2xl mx-auto flex items-center justify-center space-x-2 backdrop-blur-md">
            <span className="font-bold text-brand-gold">⚠️ Safety Notice:</span>
            <span>Always apply to the outside of your undergarments — never stick directly onto bare skin!</span>
          </div>

        </div>
      </section>

      {/* 6. WHAT'S INSIDE? PURE NATURAL GOODNESS (Ingredients Breakdown) */}
      <section className="py-16 sm:py-20 bg-[#FFF5FA] border-t border-brand-primaryPink/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-brightPink bg-white px-3 py-1 rounded-full border border-brand-primaryPink/30">
              Clean Formulation
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-deepPurple">
              What’s Inside? Pure Natural Goodness.
            </h2>
            <p className="text-sm text-[#805A82]">
              Formulated with 100% safe, non-toxic mineral components that generate natural heat upon contact with air.
            </p>
          </div>

          {/* Official Ingredients Infographic */}
          <div className="rounded-3xl bg-white p-4 sm:p-6 border-2 border-brand-primaryPink/30 shadow-lg max-w-5xl mx-auto overflow-hidden">
            <img
              src="/images/zeba-whats-inside-ingredients.webp"
              alt="ZEBA What's Inside Pure Natural Goodness Ingredients"
              width="1000"
              height="600"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/zeba-whats-inside-ingredients.jpg';
              }}
              className="w-full h-auto rounded-2xl object-cover shadow-sm"
            />
          </div>

          {/* 4 Mineral Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {naturalIngredients.map((ing, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-brand-primaryPink/30 shadow-sm space-y-3 hover:shadow-md hover:border-brand-brightPink transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-xl bg-brand-brightPink text-white font-mono font-bold text-xs flex items-center justify-center">
                    {ing.num}
                  </span>
                  <h3 className="font-display font-extrabold text-base text-brand-deepPurple">{ing.name}</h3>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-softPink text-brand-deepPurple border border-brand-primaryPink/30">
                  {ing.role}
                </span>
                <p className="text-xs text-[#805A82] leading-relaxed">{ing.desc}</p>
              </div>
            ))}
          </div>

          {/* Guarantee Seal Box (Packaging Deep Purple) */}
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-[#5F3F68] text-white text-center shadow-xl border-2 border-brand-gold/50 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-brand-gold font-bold text-sm uppercase tracking-wider">
              <Award className="w-5 h-5 text-brand-gold" />
              <span>Safe & Gentle Formula Guarantee</span>
            </div>
            <p className="text-xs text-pink-100">
              100% Drug-Free • Fragrance-Free • Hypoallergenic • Zero Harsh Chemicals
            </p>
          </div>

        </div>
      </section>

      {/* 6.5 REAL CUSTOMER REVIEWS (Loaded from Database) */}
      {reviews.length > 0 && (
        <section className="py-16 sm:py-20 bg-white border-t border-brand-primaryPink/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-brightPink bg-brand-softPink px-3 py-1 rounded-full border border-brand-primaryPink/30">
                Real Customer Stories
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-deepPurple">
                Loved by Women Across India
              </h2>
              <p className="text-sm text-[#805A82]">
                Real verified reviews from students, professionals, and mothers who trust ZEBA every month.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-3xl bg-[#FFF5FA] border border-brand-primaryPink/25 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1 text-brand-gold">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                      ))}
                    </div>

                    {rev.title && (
                      <h4 className="font-display font-bold text-sm text-brand-deepPurple">
                        "{rev.title}"
                      </h4>
                    )}

                    <p className="text-xs text-[#805A82] leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-brand-primaryPink/20 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-brand-deepPurple block">
                        {rev.author_name}
                      </span>
                      <span className="text-[10px] text-[#805A82] block">
                        {rev.location || 'India'}
                      </span>
                    </div>
                    {rev.is_verified_purchase && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. GOT QUESTIONS? WE GOT ANSWERS (Clean Accordion) */}
      <section className="py-16 sm:py-20 bg-[#FFF5FA] border-t border-brand-primaryPink/20" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-brightPink bg-brand-softPink px-3 py-1 rounded-full border border-brand-primaryPink/30">
              Support & Guidance
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-deepPurple">
              Got Questions? We Got Answers.
            </h2>
            <p className="text-sm text-[#805A82]">
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
                    isOpen ? 'border-brand-brightPink/50 bg-white shadow-sm' : 'border-brand-primaryPink/20 bg-white/90'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between space-x-4 focus:outline-none"
                  >
                    <span className="font-display font-bold text-sm sm:text-base text-brand-deepPurple">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-brand-brightPink flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#805A82] leading-relaxed border-t border-brand-primaryPink/15">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. FINAL HIGH-CONVERTING CTA BANNER WITH FULL BACKGROUND VIDEO */}
      <section className="py-24 sm:py-28 text-white text-center relative overflow-hidden border-t border-brand-gold/30 bg-[#2A1D2E]">
        
        {/* Full-Bleed Ambient Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            poster="/videos/zeba-video-poster.webp"
            className="w-full h-full object-cover scale-105 filter brightness-75"
          >
            <source src="/videos/zeba-comfort-video.mp4" type="video/mp4" />
          </video>
          {/* Deep plum & dark purple gradient overlays for contrast and brand harmony */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A1730]/95 via-[#38283D]/80 to-[#5F3F68]/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>

        {/* Floating Brand Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-brightPink/15 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] drop-shadow-md">
            Ready for Worry-Free Period Comfort?
          </h2>

          <p className="text-pink-100/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-sm">
            Order your ZEBA Periods Pain Relief Heating Pads today and experience gentle soothing warmth whenever you need it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-brand-pink/35 flex items-center justify-center space-x-2 btn-tactile animate-shimmer"
            >
              <span>Shop Heating Pads</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={getWhatsAppUrl('Hi ZEBA Team, I want to order ZEBA Heating Pads')}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 flex items-center justify-center space-x-2 btn-tactile"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Micro Trust Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-pink-200/90 font-medium">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Drug-Free</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-brand-brightPink" />
              <span>8H Air-Activated Warmth</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>Discreet & Odorless</span>
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
