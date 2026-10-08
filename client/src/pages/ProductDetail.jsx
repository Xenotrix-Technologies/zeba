import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Star,
  Truck,
  Flame,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  MessageCircle,
  CheckCircle,
  User,
  Send
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useToast } from '../context/ToastContext';
import { parseProductImages, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

export default function ProductDetail() {
  const { slug } = useParams();
  const { settings, getWhatsAppUrl } = useStoreSettings();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('how_to_use');
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ count: 0, average: 5.0 });
  const [faqs, setFaqs] = useState([]);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    author_name: '',
    rating: 5,
    title: '',
    comment: '',
    location: ''
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProductAndReviews() {
      try {
        const [prodRes, revRes, faqRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/reviews'),
          api.get('/faqs')
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value?.success && prodRes.value.products?.length > 0) {
          const prods = prodRes.value.products;
          setProducts(prods);

          let initialProd = null;
          if (slug) {
            initialProd = prods.find(p => p.slug === slug);
          }
          if (!initialProd) {
            initialProd = prods.find(p => p.pack_count > 1) || prods[0];
          }
          setSelectedProduct(initialProd);
        }

        if (revRes.status === 'fulfilled' && revRes.value?.success) {
          setReviews(revRes.value.reviews || []);
          setReviewStats({
            count: revRes.value.totalReviews || revRes.value.count || 0,
            average: revRes.value.averageRating || '5.0'
          });
        }

        if (faqRes.status === 'fulfilled' && faqRes.value?.success) {
          setFaqs(faqRes.value.faqs || []);
        }
      } catch (err) {
        console.error('Failed to load product details from database', err);
      } finally {
        setLoading(false);
      }
    }

    loadProductAndReviews();
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.author_name || !reviewForm.comment) {
      addToast('Please provide your name and review comments.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        ...reviewForm,
        product_id: selectedProduct?.id
      });
      if (res.success) {
        addToast('Thank you! Your review has been submitted successfully.', 'success');
        if (res.review) {
          setReviews(prev => [res.review, ...prev]);
        }
        setShowReviewForm(false);
        setReviewForm({ author_name: '', rating: 5, title: '', comment: '', location: '' });
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

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
        <div className="w-12 h-12 border-4 border-brand-brightPink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-[#805A82]">Loading ZEBA Heating Pads...</p>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-brand-deepPurple">Product not found.</h2>
      </div>
    );
  }

  // Exclude unwanted packaging renders and ingredients graphic from the product gallery
  const unwantedImages = [
    'zeba-real-packaging-1',
    'zeba-real-packaging-2',
    'zeba-whats-inside-ingredients'
  ];

  const baseImages = parseProductImages(selectedProduct.images).filter(
    (img) => !unwantedImages.some((unwanted) => img.includes(unwanted))
  );

  // Curate clean product gallery with primary product shots, lifestyle photo, and how-to-use guide
  const allImages = [
    ...baseImages,
    '/images/zeba-how-to-use-guide.png'
  ].filter((img, idx, arr) => arr.indexOf(img) === idx && !unwantedImages.some((u) => img.includes(u)));

  const currentPrice = parseFloat(selectedProduct.price) || 0;
  const originalPrice = parseFloat(selectedProduct.original_price) || 0;
  const discountPercent = originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-[#FFF5FA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Product Hero Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Image View */}
            <div className="rounded-3xl bg-white border-2 border-brand-primaryPink/30 shadow-lg relative overflow-hidden aspect-square flex items-center justify-center">
              {selectedProduct.badge_text && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider pack-pink-gradient text-white shadow-md">
                    {selectedProduct.badge_text}
                  </span>
                </div>
              )}
              <img
                src={allImages[activeImageIndex] || allImages[0]}
                alt={selectedProduct.name}
                width="600"
                height="600"
                fetchPriority="high"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                }}
                className="w-full h-full object-cover transition-all duration-300 transform hover:scale-105"
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
                      ? 'border-brand-brightPink ring-2 ring-brand-brightPink/40 shadow-md'
                      : 'border-brand-primaryPink/25 hover:border-brand-primaryPink opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    width="100"
                    height="100"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </button>
              ))}
            </div>

            {/* Discreet Packaging Guarantee */}
            <div className="p-4 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm flex items-center space-x-3 text-xs text-[#805A82]">
              <Truck className="w-5 h-5 text-brand-deepPurple flex-shrink-0" />
              <div>
                <span className="font-bold text-brand-deepPurple">100% Discreet Packaging:</span>
                <span className="ml-1">Delivered in plain confidential packaging with zero product markings.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Product Selector & Purchase Controls */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Reviews & Stock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-brand-gold text-sm font-bold">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <span className="text-brand-darkPurple">4.9 / 5.0</span>
                <span className="text-[#805A82] font-normal text-xs">(520+ Reviews)</span>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ● In Stock & Ready to Ship
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-brand-deepPurple">
                {selectedProduct.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#805A82] mt-2 leading-relaxed">
                {selectedProduct.short_description}
              </p>
            </div>

            {/* Price Card */}
            <div className="p-4 rounded-2xl bg-white border-2 border-brand-primaryPink/30 shadow-sm flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline space-x-3">
                  <span className="font-display font-black text-3xl sm:text-4xl text-brand-deepPurple">
                    ₹{parseFloat(selectedProduct.price).toFixed(0)}
                  </span>
                  {parseFloat(selectedProduct.original_price) > parseFloat(selectedProduct.price) && (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        ₹{parseFloat(selectedProduct.original_price).toFixed(0)}
                      </span>
                      <span className="text-xs font-extrabold text-white bg-brand-brightPink px-2.5 py-0.5 rounded-full shadow-sm">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[#805A82] mt-1">
                  Inclusive of all taxes. {settings.commerce?.standardShippingFee === 0 ? 'Free shipping on all orders.' : `Free shipping on orders above ₹${settings.commerce?.freeShippingThreshold || 1000}.`}
                </p>
              </div>
            </div>

            {/* DYNAMIC PACK SELECTOR */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-deepPurple">
                Select Pack Size:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map(prod => {
                  const isSelected = selectedProduct.id === prod.id;
                  const pPrice = parseFloat(prod.price) || 0;
                  const pOrigPrice = parseFloat(prod.original_price) || 0;
                  const savings = pOrigPrice > pPrice ? (pOrigPrice - pPrice) : 0;
                  const pDiscount = pOrigPrice > 0 ? Math.round((savings / pOrigPrice) * 100) : 0;
                  
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleVariantSelect(prod)}
                      className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-brand-brightPink bg-brand-softPink ring-2 ring-brand-brightPink/40 shadow-md'
                          : 'border-brand-primaryPink/20 bg-white hover:border-brand-primaryPink'
                      }`}
                    >
                      {prod.pack_count > 1 && (
                        <span className="absolute -top-2.5 right-3 bg-brand-brightPink text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                          Best Value
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-brand-deepPurple">{prod.pack_size}</span>
                        <span className="text-sm font-extrabold text-brand-deepPurple">
                          ₹{pPrice.toFixed(0)}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#805A82] mt-1">
                        {prod.pack_count === 1 ? '1 Single Use Heating Pad' : '3 Individually Sealed Heating Pads'}
                      </div>

                      {savings > 0 && (
                        <div className="text-[10px] font-bold text-emerald-700 mt-1.5">
                          Save ₹{savings.toFixed(0)} ({pDiscount}% off)
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
                <span className="text-xs font-bold uppercase tracking-wider text-brand-deepPurple">Quantity:</span>
                <div className="flex items-center border border-brand-primaryPink/30 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-brand-deepPurple hover:text-brand-brightPink rounded-lg hover:bg-brand-softPink transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-brand-deepPurple">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-brand-deepPurple hover:text-brand-brightPink rounded-lg hover:bg-brand-softPink transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-brand-brightPink text-brand-brightPink hover:bg-brand-softPink font-bold text-sm flex items-center justify-center space-x-2 transition-all btn-tactile"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-sm shadow-xl shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 btn-tactile"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now • ₹{(selectedProduct.price * quantity).toFixed(0)}</span>
                </button>
              </div>

              {/* WhatsApp Support Button */}
              <a
                href={getWhatsAppUrl(`Hi ZEBA Team, I have a question about the ${selectedProduct.name}`)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Need Advice? Chat with ZEBA Care on WhatsApp</span>
              </a>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-brand-primaryPink/20 text-center">
              <div className="p-3 rounded-2xl bg-white border border-brand-primaryPink/20 shadow-sm">
                <Flame className="w-4 h-4 text-brand-brightPink mx-auto mb-1" />
                <span className="text-[11px] font-bold text-brand-deepPurple block">Heats in 10-15 Mins</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-brand-primaryPink/20 shadow-sm">
                <Clock className="w-4 h-4 text-brand-gold mx-auto mb-1" />
                <span className="text-[11px] font-bold text-brand-deepPurple block">Up to 8 Hours</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-brand-primaryPink/20 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-brand-deepPurple block">100% Safe Natural</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Interactive Deep-Dive Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-primaryPink/25 shadow-md space-y-8">
          <div className="flex border-b border-brand-primaryPink/20 space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('how_to_use')}
              className={`pb-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'how_to_use'
                  ? 'border-brand-brightPink text-brand-brightPink font-extrabold'
                  : 'border-transparent text-[#805A82] hover:text-brand-deepPurple'
              }`}
            >
              How to Use (4 Steps)
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'reviews'
                  ? 'border-brand-brightPink text-brand-brightPink font-extrabold'
                  : 'border-transparent text-[#805A82] hover:text-brand-deepPurple'
              }`}
            >
              Customer Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'timeline'
                  ? 'border-brand-brightPink text-brand-brightPink font-extrabold'
                  : 'border-transparent text-[#805A82] hover:text-brand-deepPurple'
              }`}
            >
              How It Works Over Time
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'ingredients'
                  ? 'border-brand-brightPink text-brand-brightPink font-extrabold'
                  : 'border-transparent text-[#805A82] hover:text-brand-deepPurple'
              }`}
            >
              What's Inside (Ingredients)
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`pb-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'faq'
                  ? 'border-brand-brightPink text-brand-brightPink font-extrabold'
                  : 'border-transparent text-[#805A82] hover:text-brand-deepPurple'
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
                  <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border border-brand-primaryPink/25 shadow-sm">
                    <img
                      src="/images/zeba-how-to-use-guide.png"
                      alt="ZEBA How to Use It"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-4">
                    <h3 className="font-display font-extrabold text-xl text-brand-deepPurple">
                      4 Simple Steps to Period Relief
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-brand-softPink border border-brand-primaryPink/30">
                        <strong className="text-brand-brightPink font-bold block mb-0.5">Step 1: Peel & Stick</strong>
                        <span className="text-brand-darkPurple">Apply to underwear, NOT skin. Stick adhesive backing to undergarments.</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#FDF5D6] border border-brand-gold/40">
                        <strong className="text-brand-darkPurple font-bold block mb-0.5">Step 2: It Warms Up</strong>
                        <span className="text-brand-darkPurple">Starts heating in 10-15 minutes upon air contact.</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-brand-softPink border border-brand-primaryPink/30">
                        <strong className="text-brand-deepPurple font-bold block mb-0.5">Step 3: Enjoy Relief</strong>
                        <span className="text-brand-darkPurple">Soothes for up to 8 continuous hours of uninterrupted comfort.</span>
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

            {/* TAB: REVIEWS (Live Database Powered) */}
            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-[#FFF5FA] rounded-2xl border border-brand-primaryPink/25">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <span className="font-display font-black text-4xl text-brand-deepPurple">
                        {reviewStats.average}
                      </span>
                      <div className="flex items-center space-x-0.5 text-brand-gold mt-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#805A82] block mt-0.5">
                        Based on {reviews.length} verified ratings
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
                  >
                    {showReviewForm ? 'Close Form' : 'Write a Review'}
                  </button>
                </div>

                {/* Review Submission Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="p-6 bg-white rounded-2xl border-2 border-brand-brightPink/30 shadow-md space-y-4">
                    <h4 className="font-display font-bold text-base text-brand-deepPurple">
                      Share Your Experience with ZEBA
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-deepPurple mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.author_name}
                          onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                          placeholder="e.g. Priya Sharma"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-deepPurple mb-1">City / Location</label>
                        <input
                          type="text"
                          value={reviewForm.location}
                          onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                          placeholder="e.g. Mumbai, Maharashtra"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-deepPurple mb-1">Rating *</label>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value, 10) })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                          <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                          <option value="3">⭐⭐⭐ (3 - Average)</option>
                          <option value="2">⭐⭐ (2 - Below Expectations)</option>
                          <option value="1">⭐ (1 - Disappointed)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-deepPurple mb-1">Review Title</label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          placeholder="e.g. Amazing relief during work"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-deepPurple mb-1">Your Detailed Feedback *</label>
                      <textarea
                        rows={3}
                        required
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        placeholder="Tell others how ZEBA helped with your period cramps..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-brand-primaryPink/30 text-xs focus:outline-none focus:border-brand-brightPink"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 rounded-xl bg-brand-deepPurple hover:bg-brand-brightPink text-white font-bold text-xs flex items-center space-x-2 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/20 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-brand-gold">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#805A82]">
                          {new Date(rev.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {rev.title && (
                        <h5 className="font-display font-bold text-sm text-brand-deepPurple">
                          "{rev.title}"
                        </h5>
                      )}

                      <p className="text-xs text-[#805A82] leading-relaxed">
                        {rev.comment}
                      </p>

                      <div className="pt-2 border-t border-brand-primaryPink/15 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-brand-deepPurple">{rev.author_name}</span>
                        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Verified Buyer</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1 text-center max-w-xl mx-auto">
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-brand-deepPurple">
                    Timeline of Thermal Heat Relief
                  </h3>
                  <p className="text-xs sm:text-sm text-[#805A82]">
                    Continuous natural warmth designed to soothe cramp discomfort over 8 hours
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/30 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-softPink text-brand-brightPink font-bold text-xs">
                        <Flame className="w-3.5 h-3.5" /> Phase 1
                      </span>
                      <span className="text-xs font-mono font-bold text-[#805A82]">0–15 Mins</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-brand-deepPurple uppercase">
                      Early Activation
                    </h4>
                    <p className="text-xs text-[#805A82] leading-relaxed">
                      Rapid warmth begins to penetrate, initiating circulation boost and initial muscle relaxation.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border-2 border-brand-primaryPink/50 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primaryPink/30 text-brand-deepPurple font-bold text-xs">
                        <Zap className="w-3.5 h-3.5 text-brand-brightPink" /> Phase 2
                      </span>
                      <span className="text-xs font-mono font-bold text-[#805A82]">1 Hour</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-brand-deepPurple uppercase">
                      Peak Soothing Comfort
                    </h4>
                    <p className="text-xs text-[#805A82] leading-relaxed">
                      Maximum heat intensity reached for deep muscle relief. Significant reduction in cramp discomfort and a feeling of calm.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/30 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF5D6] text-amber-800 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-brand-gold" /> Phase 3
                      </span>
                      <span className="text-xs font-mono font-bold text-[#805A82]">Up to 8 Hours</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-brand-deepPurple uppercase">
                      Continuous Warmth
                    </h4>
                    <p className="text-xs text-[#805A82] leading-relaxed">
                      Consistent, gentle warmth maintained for up to 8 hours. Prolonged comfort and continuous relief from period cramps.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INGREDIENTS */}
            {activeTab === 'ingredients' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border border-brand-primaryPink/25 shadow-sm">
                    <img
                      src="/images/zeba-whats-inside-ingredients.jpg?v=4"
                      alt="ZEBA What's Inside Pure Natural Goodness"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/zeba-whats-inside-ingredients.png?v=4';
                      }}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-3 text-xs">
                    <h3 className="font-display font-extrabold text-xl text-brand-deepPurple">
                      100% Pure Natural Formula
                    </h3>
                    <ul className="space-y-2.5">
                      <li className="p-3 rounded-xl bg-white border border-brand-primaryPink/25">
                        <strong className="text-brand-deepPurple font-bold">1. Iron Powder:</strong> Creates gentle, consistent heat when exposed to air.
                      </li>
                      <li className="p-3 rounded-xl bg-white border border-brand-primaryPink/25">
                        <strong className="text-brand-deepPurple font-bold">2. Vermiculite:</strong> Natural mineral that retains and distributes heat evenly.
                      </li>
                      <li className="p-3 rounded-xl bg-white border border-brand-primaryPink/25">
                        <strong className="text-brand-deepPurple font-bold">3. Salt:</strong> Catalyst for heat reaction, ensures 8+ hours of relief.
                      </li>
                      <li className="p-3 rounded-xl bg-white border border-brand-primaryPink/25">
                        <strong className="text-brand-deepPurple font-bold">4. Activated Carbon:</strong> Regulates temperature for consistent warmth.
                      </li>
                    </ul>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                      ✓ Dermatologically tested • Drug-free • No artificial fragrance • No parabens
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FAQ (Dynamic from Database) */}
            {activeTab === 'faq' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3 text-xs">
                  {faqs.map((f, i) => (
                    <div key={f.id || i} className="p-4 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/25 space-y-1">
                      <strong className="text-brand-deepPurple font-bold text-sm block">Q: {f.question}</strong>
                      <p className="text-[#805A82] leading-relaxed">A: {f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
