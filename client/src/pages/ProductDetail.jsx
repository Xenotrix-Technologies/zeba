import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
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
  Send,
  RefreshCw,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useToast } from '../context/ToastContext';
import { parseProductImages, DEFAULT_PRODUCT_IMAGE, DEFAULT_DETAIL_IMAGE } from '../utils/imageUtils';
import { DEFAULT_PRODUCTS, DEFAULT_PRODUCT_REVIEWS, DEFAULT_PRODUCT_FAQS } from '../utils/defaultProducts';

export function resolveProduct(prods, targetSlug, searchParams) {
  if (!prods || prods.length === 0) return null;

  // 1. By slug in URL path (/products/:slug)
  if (targetSlug) {
    const match = prods.find(p => p.slug === targetSlug);
    if (match) return match;
  }

  // 2. By pack count in query parameter (/products?pack=1 or /products?pack=3)
  const packParam = searchParams?.get('pack');
  if (packParam) {
    const match = prods.find(p => String(p.pack_count) === String(packParam));
    if (match) return match;
  }

  // 3. By ID query parameter (/products?id=1)
  const idParam = searchParams?.get('id');
  if (idParam) {
    const match = prods.find(p => String(p.id) === String(idParam));
    if (match) return match;
  }

  // 4. Default fallback when no specific pack requested: 3-pack or first product
  return prods.find(p => p.pack_count > 1) || prods[0];
}

/**
 * High-performance loading skeleton matching product layout to prevent CLS
 */
function ProductDetailSkeleton() {
  return (
    <div className="bg-[#FFF5FA] py-8 sm:py-12 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl bg-white/80 border-2 border-brand-primaryPink/20 aspect-square shadow-md" />
            <div className="grid grid-cols-6 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square rounded-2xl bg-white/70 border border-brand-primaryPink/20" />
              ))}
            </div>
            <div className="h-14 rounded-2xl bg-white/70 border border-brand-primaryPink/20" />
          </div>

          {/* Details Skeleton */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-5 w-40 bg-brand-primaryPink/20 rounded-full" />
              <div className="h-6 w-32 bg-emerald-100 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-9 w-4/5 bg-brand-primaryPink/25 rounded-2xl" />
              <div className="h-4 w-full bg-brand-primaryPink/15 rounded-md" />
              <div className="h-4 w-3/4 bg-brand-primaryPink/15 rounded-md" />
            </div>
            <div className="h-24 bg-white/80 rounded-2xl border-2 border-brand-primaryPink/20" />
            <div className="space-y-3">
              <div className="h-4 w-28 bg-brand-primaryPink/20 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-24 bg-white/80 rounded-2xl border border-brand-primaryPink/20" />
                <div className="h-24 bg-white/80 rounded-2xl border border-brand-primaryPink/20" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="h-14 bg-white/80 rounded-2xl border-2 border-brand-primaryPink/30" />
              <div className="h-14 bg-brand-brightPink/30 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { settings, getWhatsAppUrl } = useStoreSettings();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Core Product State with Immediate Authentic Fallback
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(() => {
    return resolveProduct(DEFAULT_PRODUCTS, slug, searchParams) || DEFAULT_PRODUCTS[1] || DEFAULT_PRODUCTS[0];
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Tab & Form State
  const [activeTab, setActiveTab] = useState('how_to_use');

  // Independent Reviews State (Non-blocking with authentic defaults)
  const [reviews, setReviews] = useState(DEFAULT_PRODUCT_REVIEWS);
  const [reviewStats, setReviewStats] = useState({
    count: DEFAULT_PRODUCT_REVIEWS.length,
    average: 4.95
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Independent FAQs State (Non-blocking with authentic defaults)
  const [faqs, setFaqs] = useState(DEFAULT_PRODUCT_FAQS);
  const [faqsLoading, setFaqsLoading] = useState(false);

  // Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    author_name: '',
    rating: 5,
    title: '',
    comment: '',
    location: ''
  });

  const { addToCart, startBuyNow } = useCart();
  const activeControllerRef = useRef(null);

  /**
   * 1. Primary Product Loader
   * Immediately resolves product from defaults/cache so user NEVER sees a network error card.
   * Then silently fetches live database updates in background.
   */
  useEffect(() => {
    // 1. Immediately ensure active product matches current URL path without blocking
    if (slug) {
      const immediateMatch = (products.length > 0 ? products : DEFAULT_PRODUCTS).find(p => p.slug === slug) ||
                             DEFAULT_PRODUCTS.find(p => p.slug === slug);
      if (immediateMatch && (!selectedProduct || selectedProduct.slug !== slug)) {
        setSelectedProduct(immediateMatch);
        setActiveImageIndex(0);
      }
    } else {
      const immediateMatch = resolveProduct(products.length > 0 ? products : DEFAULT_PRODUCTS, null, searchParams);
      if (immediateMatch && (!selectedProduct || selectedProduct.id !== immediateMatch.id)) {
        setSelectedProduct(immediateMatch);
        setActiveImageIndex(0);
      }
    }

    // Cancel any previous in-flight product request
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;
    setNotFound(false);

    async function fetchProductData() {
      try {
        if (slug) {
          // Direct product lookup by slug from server
          const res = await api.get(`/products/${encodeURIComponent(slug)}`, {
            signal: controller.signal
          });

          if (res?.success && res.product) {
            setSelectedProduct(res.product);
            setActiveImageIndex(0);

            // Sibling variants returned by optimized endpoint or fallback to self
            if (res.variants && Array.isArray(res.variants) && res.variants.length > 0) {
              setProducts(res.variants);
            } else if (res.product.variants && Array.isArray(res.product.variants)) {
              setProducts(res.product.variants);
            } else {
              setProducts([res.product]);
            }
          } else {
            // Check default products before flagging not found
            const fallbackMatch = DEFAULT_PRODUCTS.find(p => p.slug === slug);
            if (fallbackMatch) {
              setSelectedProduct(fallbackMatch);
            } else {
              setNotFound(true);
            }
          }
        } else {
          // Collection-based fallback for /products, /products?pack=3, /products?id=1
          const res = await api.get('/products?full=true', {
            signal: controller.signal
          });

          if (res?.success && res.products?.length > 0) {
            setProducts(res.products);
            const resolved = resolveProduct(res.products, null, searchParams);
            if (resolved) {
              setSelectedProduct(resolved);
              setActiveImageIndex(0);
            }
          } else {
            // Keep default products active
            const resolved = resolveProduct(DEFAULT_PRODUCTS, null, searchParams);
            if (resolved) {
              setSelectedProduct(resolved);
            }
          }
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || controller.signal.aborted) {
          return;
        }

        // On network error or server hiccup, gracefully keep the authentic product active
        const fallbackMatch = resolveProduct(DEFAULT_PRODUCTS, slug, searchParams);
        if (fallbackMatch) {
          setSelectedProduct(prev => prev || fallbackMatch);
          console.warn('Product API note (serving local catalog):', err.message);
        } else if (err.message && err.message.includes('404')) {
          setNotFound(true);
        } else {
          setSelectedProduct(prev => prev || DEFAULT_PRODUCTS[1] || DEFAULT_PRODUCTS[0]);
          console.warn('Product API error handled gracefully:', err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProductData();

    return () => {
      controller.abort();
    };
  }, [slug, retryKey]);

  /**
   * 2. Synchronize selected variant when query params change while on fallback route (/products?pack=...)
   */
  useEffect(() => {
    if (!slug) {
      const targetProd = resolveProduct(products && products.length > 0 ? products : DEFAULT_PRODUCTS, null, searchParams);
      if (targetProd && targetProd.id !== selectedProduct?.id) {
        setSelectedProduct(targetProd);
        setActiveImageIndex(0);
      }
    }
  }, [slug, searchParams, products, selectedProduct?.id]);

  /**
   * 3. Independent Reviews Loader (Non-blocking: does not delay product hero)
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      try {
        const queryParams = selectedProduct?.id ? { productId: selectedProduct.id } : {};
        const revRes = await api.get('/reviews', {
          params: queryParams,
          signal: controller.signal
        });

        if (revRes?.success && revRes.reviews?.length > 0) {
          setReviews(revRes.reviews);
          setReviewStats({
            count: revRes.totalReviews || revRes.count || revRes.reviews.length,
            average: revRes.averageRating || '4.95'
          });
        }
      } catch (err) {
        if (err.name === 'CanceledError' || controller.signal.aborted) return;
        // Keep DEFAULT_PRODUCT_REVIEWS
      } finally {
        if (!controller.signal.aborted) {
          setReviewsLoading(false);
        }
      }
    }

    loadReviews();

    return () => controller.abort();
  }, [selectedProduct?.id]);

  /**
   * 4. Independent FAQs Loader (Non-blocking)
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadFaqs() {
      try {
        const faqRes = await api.get('/faqs', {
          signal: controller.signal
        });

        if (faqRes?.success && Array.isArray(faqRes.faqs) && faqRes.faqs.length > 0) {
          setFaqs(faqRes.faqs);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || controller.signal.aborted) return;
        // Keep DEFAULT_PRODUCT_FAQS
      } finally {
        if (!controller.signal.aborted) {
          setFaqsLoading(false);
        }
      }
    }

    loadFaqs();

    return () => controller.abort();
  }, []);

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
      if (res?.success) {
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

  /**
   * Instant Variant Selection
   * Updates state immediately without white flash, then syncs URL path
   */
  const handleVariantSelect = useCallback((product) => {
    if (!product || product.id === selectedProduct?.id) return;
    setSelectedProduct(product);
    setActiveImageIndex(0);
    if (product.slug) {
      navigate(`/products/${product.slug}`, { replace: true });
    }
  }, [navigate, selectedProduct?.id]);

  const currentProduct = selectedProduct || resolveProduct(DEFAULT_PRODUCTS, slug, searchParams) || DEFAULT_PRODUCTS[1] || DEFAULT_PRODUCTS[0];

  const handleAddToCart = () => {
    if (!currentProduct) return;
    addToCart(currentProduct, quantity, true);
  };

  const handleBuyNow = () => {
    if (!currentProduct) return;
    startBuyNow(currentProduct, quantity);
    navigate('/checkout', { state: { buyNow: true } });
  };

  // Loading skeleton screen - only shown if neither server nor fallback product is available
  if (loading && !currentProduct) {
    return <ProductDetailSkeleton />;
  }

  // Not Found State - only for truly unknown slugs not matching any known product
  if (notFound && !currentProduct) {
    return (
      <div className="min-h-[60vh] bg-[#FFF5FA] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-softPink flex items-center justify-center mb-4 text-brand-brightPink">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deepPurple">
          Product Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#805A82] mt-2 max-w-md">
          The requested ZEBA heating pad was not found or is currently unavailable.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Link
            to="/products"
            className="px-6 py-2.5 rounded-xl bg-brand-deepPurple text-white text-xs font-bold hover:bg-brand-brightPink transition-colors flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Packs</span>
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 rounded-xl border border-brand-primaryPink/40 text-brand-deepPurple text-xs font-bold hover:bg-white transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Curate product gallery with primary product shots, lifestyle photo, how-to-use guide, ingredients, and thermal heat relief timeline
  const productImages = parseProductImages(currentProduct.images);
  const infoImages = [
    DEFAULT_DETAIL_IMAGE,
    '/images/zeba-hero-lifestyle.webp',
    '/images/zeba-how-to-use-guide.webp',
    '/images/zeba-whats-inside-ingredients.webp',
    '/images/Thermal-Heat-Relief-Timeline.webp'
  ];
  const allImages = [...productImages, ...infoImages].filter((img, idx, arr) => arr.indexOf(img) === idx);

  const currentPrice = parseFloat(currentProduct.price) || 0;
  const originalPrice = parseFloat(currentProduct.original_price) || 0;
  const isOriginalPriceActive = currentProduct.show_original_price !== false && originalPrice > currentPrice;
  const discountPercent = isOriginalPriceActive
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-[#FFF5FA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Product Hero Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">

            {/* Main Image View with High Priority LCP */}
            {(() => {
              const currentImg = allImages[activeImageIndex] || allImages[0] || DEFAULT_PRODUCT_IMAGE;
              const isInfographic = currentImg.includes('guide') || currentImg.includes('how-to') || currentImg.includes('infographic') || currentImg.includes('ingredient') || currentImg.includes('whats-inside') || currentImg.includes('Timeline') || currentImg.includes('Thermal');

              return (
                <div className={`rounded-3xl bg-white border-2 border-brand-primaryPink/30 shadow-lg relative overflow-hidden aspect-square flex items-center justify-center ${
                  isInfographic ? 'p-2 sm:p-3' : ''
                }`}>
                  {!isInfographic && currentProduct.badge_text && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider pack-pink-gradient text-white shadow-md">
                        {currentProduct.badge_text}
                      </span>
                    </div>
                  )}
                  <img
                    src={currentImg}
                    alt={currentProduct.name}
                    width="600"
                    height="600"
                    fetchPriority="high"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                    className={`w-full h-full transition-all duration-300 transform hover:scale-105 ${
                      isInfographic ? 'object-contain' : 'object-cover'
                    }`}
                  />
                </div>
              );
            })()}

            {/* Thumbnail selector */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {allImages.slice(0, 6).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
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
                <span className="text-brand-darkPurple">{reviewStats.average || '4.9'} / 5.0</span>
                <span className="text-[#805A82] font-normal text-xs">
                  ({reviewStats.count > 0 ? `${reviewStats.count}+ Reviews` : 'Verified Reviews'})
                </span>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ● In Stock & Ready to Ship
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-brand-deepPurple">
                {currentProduct.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#805A82] mt-2 leading-relaxed">
                {currentProduct.short_description}
              </p>
            </div>

            {/* Price Card */}
            <div className="p-4 rounded-2xl bg-white border-2 border-brand-primaryPink/30 shadow-sm flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline space-x-3">
                  <span className="font-display font-black text-3xl sm:text-4xl text-brand-deepPurple">
                    ₹{currentPrice.toFixed(0)}
                  </span>
                  {isOriginalPriceActive && (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        ₹{originalPrice.toFixed(0)}
                      </span>
                      <span className="text-xs font-extrabold text-white bg-brand-brightPink px-2.5 py-0.5 rounded-full shadow-sm">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[#805A82] mt-1">
                  Inclusive of all taxes. {(Number(settings?.commerce?.freeShippingThreshold) > 0) ? `Free shipping on orders above ₹${settings.commerce.freeShippingThreshold}.` : 'Free shipping on all orders.'}
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
                  const isSelected = (selectedProduct?.id || currentProduct.id) === prod.id;
                  const pPrice = parseFloat(prod.price) || 0;
                  const pOrigPrice = parseFloat(prod.original_price) || 0;
                  const isPOrigActive = prod.show_original_price !== false && pOrigPrice > pPrice;
                  const savings = isPOrigActive ? (pOrigPrice - pPrice) : 0;
                  const pDiscount = isPOrigActive && pOrigPrice > 0 ? Math.round((savings / pOrigPrice) * 100) : 0;

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleVariantSelect(prod)}
                      className={`relative p-4 rounded-2xl border text-left transition-all duration-200 btn-tactile ${
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
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-brand-deepPurple hover:text-brand-brightPink rounded-lg hover:bg-brand-softPink transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-brand-deepPurple">{quantity}</span>
                  <button
                    type="button"
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
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-brand-brightPink text-brand-brightPink hover:bg-brand-softPink font-bold text-sm flex items-center justify-center space-x-2 transition-all btn-tactile"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-sm shadow-xl shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 btn-tactile"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now • ₹{(currentPrice * quantity).toFixed(0)}</span>
                </button>
              </div>

              {/* WhatsApp Support Button */}
              <a
                href={getWhatsAppUrl(`Hi ZEBA Team, I have a question about the ${currentProduct.name}`)}
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
              type="button"
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
              type="button"
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
              type="button"
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
              type="button"
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
              type="button"
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
                      src="/images/zeba-how-to-use-guide.webp"
                      alt="ZEBA How to Use It"
                      width="1536"
                      height="678"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="w-full lg:w-1/2 space-y-4">
                    <h3 className="font-display font-extrabold text-xl text-brand-deepPurple">
                      3 Simple Steps to Period Relief
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-brand-softPink border border-brand-primaryPink/30">
                        <strong className="text-brand-brightPink font-bold block mb-0.5">Step 1: Remove from packaging</strong>
                        <span className="text-brand-darkPurple">Simple and convenient to use, the ZEBA Pain Relief Heating Pad heats up within 5 minutes when exposed to air. The pad should feel soft when working.</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#FDF5D6] border border-brand-gold/40">
                        <strong className="text-brand-darkPurple font-bold block mb-0.5">Step 2: Stick it on</strong>
                        <span className="text-brand-darkPurple">Stick the pad securely to your underwear and enjoy soothing warmth. Every hour, remove it for 5 minutes to give your skin a short break, then reattach it.</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-brand-softPink border border-brand-primaryPink/30">
                        <strong className="text-brand-deepPurple font-bold block mb-0.5">Step 3: Go forth, worry-free</strong>
                        <span className="text-brand-darkPurple">Designed for life on the go, providing discreet, soothing relief from cramps so you can stay comfortable and carry on with your day.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REVIEWS (Live Database Powered with non-blocking loader) */}
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
                    type="button"
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

                {/* Reviews List & Skeleton State */}
                {reviewsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(n => (
                      <div key={n} className="h-32 rounded-2xl bg-brand-softPink/50 animate-pulse border border-brand-pink/20" />
                    ))}
                  </div>
                ) : reviewsError ? (
                  <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 text-center">
                    {reviewsError}
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-xs text-[#805A82] text-center py-6">
                    No customer reviews yet. Be the first to share your thoughts!
                  </p>
                ) : (
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
                )}
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
                      Maximum heat intensity reached for deep muscle relief. Significant reduction in cramp discomfort.
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
                      Consistent, gentle warmth maintained for up to 8 hours. Prolonged comfort and continuous relief.
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
                      src="/images/zeba-whats-inside-ingredients.webp"
                      alt="ZEBA What's Inside Pure Natural Goodness"
                      width="1363"
                      height="768"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/zeba-whats-inside-ingredients.jpg';
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

            {/* TAB 4: FAQ (Dynamic from Database with independent non-blocking loader) */}
            {activeTab === 'faq' && (
              <div className="space-y-6 animate-fade-in">
                {faqsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="h-16 rounded-xl bg-brand-softPink/40 animate-pulse border border-brand-pink/20" />
                    ))}
                  </div>
                ) : faqs.length === 0 ? (
                  <p className="text-xs text-[#805A82] text-center py-6">
                    Got questions? Chat with our team directly on WhatsApp.
                  </p>
                ) : (
                  <div className="space-y-3 text-xs">
                    {faqs.map((f, i) => (
                      <div key={f.id || i} className="p-4 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/25 space-y-1">
                        <strong className="text-brand-deepPurple font-bold text-sm block">Q: {f.question}</strong>
                        <p className="text-[#805A82] leading-relaxed">A: {f.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
