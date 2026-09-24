import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Flame,
  Clock,
  Feather,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Sparkles,
  MessageCircle,
  HelpCircle,
  Layers,
  Heart,
  Award,
  TrendingDown,
  Sun
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { businessConfig } from '../config/businessConfig';

export default function ProductDetail() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('how_to_use');

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get('/products');
        if (res.success && res.products && res.products.length > 0) {
          setProducts(res.products);
          // Default to the 3-Pack (Value Pack)
          const defaultProd = res.products.find(p => p.pack_count > 1) || res.products[0];
          setSelectedProduct(defaultProd);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleVariantSelect = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, quantity, true);
  };

  const handleBuyNow = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, quantity, false);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading ZEBA Heating Pads...</p>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-brand-navy">Product not found.</h2>
      </div>
    );
  }

  const baseImages = Array.isArray(selectedProduct.images)
    ? selectedProduct.images
    : (typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images || '[]') : ['/images/zeba-real-packaging-1.jpg']);

  // Combine authentic product packaging + official educational infographics
  const allImages = [
    ...baseImages,
    '/images/zeba-how-to-use-guide.jpg',
    '/images/zeba-how-it-works-timeline.jpg',
    '/images/zeba-whats-inside-ingredients.jpg',
    '/images/zeba-got-questions-faq.jpg'
  ];

  const benefits = Array.isArray(selectedProduct.benefits)
    ? selectedProduct.benefits
    : (typeof selectedProduct.benefits === 'string' ? JSON.parse(selectedProduct.benefits || '[]') : []);

  const discountPercent = selectedProduct.original_price > selectedProduct.price
    ? Math.round(((selectedProduct.original_price - selectedProduct.price) / selectedProduct.original_price) * 100)
    : 0;

  return (
    <div className="bg-[#FAF8FB] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Product Hero Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Image View */}
            <div className="rounded-3xl bg-white p-4 border border-slate-200/90 shadow-lg relative overflow-hidden aspect-square flex items-center justify-center">
              {selectedProduct.badge_text && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-brand-pink text-white shadow-md">
                    {selectedProduct.badge_text}
                  </span>
                </div>
              )}
              <img
                src={allImages[activeImageIndex] || allImages[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-contain transition-all duration-300 transform hover:scale-105"
              />
            </div>

            {/* Thumbnail selector */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {allImages.slice(0, 6).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`rounded-2xl p-1 bg-white border transition-all aspect-square flex items-center justify-center overflow-hidden ${
                    activeImageIndex === idx
                      ? 'border-brand-pink ring-2 ring-brand-pink/30 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>

            {/* Discreet Packaging Guarantee */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3 text-xs text-slate-600">
              <Truck className="w-5 h-5 text-brand-navy flex-shrink-0" />
              <div>
                <span className="font-bold text-brand-navy">100% Discreet Packaging:</span>
                <span className="ml-1">Delivered in plain confidential packaging with zero product markings.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Product Selector & Purchase Controls */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Reviews & Stock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-500 text-sm font-bold">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span>4.9 / 5.0</span>
                <span className="text-slate-400 font-normal text-xs">(520+ Reviews)</span>
              </div>

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                ● In Stock & Ready to Ship
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-brand-navy">
                {selectedProduct.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {selectedProduct.short_description}
              </p>
            </div>

            {/* Price Card */}
            <div className="p-4 rounded-2xl bg-brand-roseBg border border-brand-pink/20 flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline space-x-3">
                  <span className="font-display font-black text-3xl sm:text-4xl text-brand-navy">
                    ₹{parseFloat(selectedProduct.price).toFixed(0)}
                  </span>
                  {parseFloat(selectedProduct.original_price) > parseFloat(selectedProduct.price) && (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        ₹{parseFloat(selectedProduct.original_price).toFixed(0)}
                      </span>
                      <span className="text-xs font-extrabold text-white bg-brand-pink px-2.5 py-0.5 rounded-full">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Inclusive of all taxes. Free shipping on orders above ₹499.
                </p>
              </div>
            </div>

            {/* DYNAMIC PACK SELECTOR */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                Select Pack Size:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map(prod => {
                  const isSelected = selectedProduct.id === prod.id;
                  const savings = prod.original_price > prod.price ? (prod.original_price - prod.price) : 0;
                  
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleVariantSelect(prod)}
                      className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-brand-pink bg-brand-blush/60 ring-2 ring-brand-pink/30 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {prod.pack_count > 1 && (
                        <span className="absolute -top-2.5 right-3 bg-brand-pink text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                          Best Value
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-brand-navy">{prod.pack_size}</span>
                        <span className="text-sm font-extrabold text-brand-navy">
                          ₹{parseFloat(prod.price).toFixed(0)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1">
                        {prod.pack_count === 1 ? '1 Single Use Heating Pad' : '3 Individually Sealed Heating Pads'}
                      </div>

                      {savings > 0 && (
                        <div className="text-[10px] font-bold text-emerald-700 mt-1.5">
                          Save ₹{parseFloat(savings).toFixed(0)} ({Math.round((savings / prod.original_price) * 100)}% off)
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Buttons */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-slate-600 hover:text-brand-pink rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-brand-navy">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-slate-600 hover:text-brand-pink rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-brand-pink text-brand-pink hover:bg-brand-softPink font-bold text-sm flex items-center justify-center space-x-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-pink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-pink text-white font-bold text-sm shadow-xl shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now • ₹{(selectedProduct.price * quantity).toFixed(0)}</span>
                </button>
              </div>

              {/* WhatsApp Support Button */}
              <a
                href={businessConfig.whatsapp.getWhatsAppUrl(`Hi ZEBA Team, I have a question about the ${selectedProduct.name}`)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Need Advice? Chat with ZEBA Care on WhatsApp</span>
              </a>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 text-center">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <Flame className="w-4 h-4 text-brand-pink mx-auto mb-1" />
                <span className="text-[11px] font-bold text-brand-navy block">Heats in 10-15 Mins</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-brand-navy block">Up to 8 Hours</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-brand-navy block">100% Safe Natural</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Interactive Deep-Dive Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-md space-y-8">
          
          <div className="flex border-b border-slate-200 space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('how_to_use')}
              className={`pb-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'how_to_use'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              How to Use (4 Steps)
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'timeline'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              How It Works Over Time
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'ingredients'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              What's Inside (Ingredients)
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`pb-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'faq'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Got Questions (FAQ)
            </button>
          </div>

          <div>
            {/* TAB 1: HOW TO USE */}
            {activeTab === 'how_to_use' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img
                      src="/images/zeba-how-to-use-guide.jpg"
                      alt="ZEBA How to Use Guide"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-4">
                    <h3 className="font-display font-extrabold text-xl text-brand-navy">
                      4 Simple Steps to Period Relief
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                        <strong className="text-brand-pink font-bold block mb-0.5">Step 1: Peel & Stick</strong>
                        <span className="text-slate-700">Apply to underwear, NOT skin. Stick adhesive backing to undergarments.</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                        <strong className="text-amber-800 font-bold block mb-0.5">Step 2: It Warms Up</strong>
                        <span className="text-slate-700">Starts heating in 10-15 minutes upon air contact.</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                        <strong className="text-purple-800 font-bold block mb-0.5">Step 3: Enjoy Relief</strong>
                        <span className="text-slate-700">Soothes for up to 8 continuous hours of uninterrupted comfort.</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <strong className="text-emerald-800 font-bold block mb-0.5">Step 4: Live Your Day</strong>
                        <span className="text-slate-700">Forget the pain and get on with your work, study, and life.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img
                      src="/images/zeba-how-it-works-timeline.jpg"
                      alt="ZEBA How It Works Over Time"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-4">
                    <h3 className="font-display font-extrabold text-xl text-brand-navy">
                      Relief Progression Over Time
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <strong className="text-brand-navy font-mono font-bold block mb-1">Minute 0</strong>
                        <span className="text-slate-600">Apply patch to underwear</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                        <strong className="text-amber-800 font-mono font-bold block mb-1">Minute 15</strong>
                        <span className="text-slate-600">Warmth kicks in & relief begins</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                        <strong className="text-brand-pink font-mono font-bold block mb-1">Hour 1</strong>
                        <span className="text-slate-600">Pain drops from a 10 down to a 2</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                        <strong className="text-emerald-800 font-mono font-bold block mb-1">Hour 8</strong>
                        <span className="text-slate-600">Lasts for a full day</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INGREDIENTS */}
            {activeTab === 'ingredients' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img
                      src="/images/zeba-whats-inside-ingredients.jpg"
                      alt="ZEBA What's Inside Pure Natural Goodness"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-3 text-xs">
                    <h3 className="font-display font-extrabold text-xl text-brand-navy">
                      100% Pure Natural Formula
                    </h3>
                    <ul className="space-y-2.5">
                      <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-brand-navy font-bold">1. Iron Powder:</strong> Creates gentle, consistent heat when exposed to air.
                      </li>
                      <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-brand-navy font-bold">2. Vermiculite:</strong> Natural mineral that retains and distributes heat evenly.
                      </li>
                      <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-brand-navy font-bold">3. Salt:</strong> Catalyst for heat reaction, ensures 8+ hours of relief.
                      </li>
                      <li className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <strong className="text-brand-navy font-bold">4. Activated Carbon:</strong> Regulates temperature for consistent warmth.
                      </li>
                    </ul>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                      ✓ Dermatologically tested • Drug-free • No artificial fragrance • No parabens
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img
                      src="/images/zeba-got-questions-faq.jpg"
                      alt="ZEBA Got Questions We Got Answers"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200">
                      <strong className="text-orange-900 font-bold block">Q: Is it safe for teenagers?</strong>
                      <span className="text-slate-700">A: Yes, 13+. Natural heat, no drugs.</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <strong className="text-emerald-900 font-bold block">Q: Is it visible under clothes?</strong>
                      <span className="text-slate-700">A: No, ultra-thin and blends naturally.</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                      <strong className="text-rose-900 font-bold block">Q: What if it doesn’t work?</strong>
                      <span className="text-slate-700">A: Satisfaction guarantee. Refund within 7 days if not satisfied.</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                      <strong className="text-purple-900 font-bold block">Q: Is there fragrance?</strong>
                      <span className="text-slate-700">A: Fragrance-free and hypoallergenic.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
