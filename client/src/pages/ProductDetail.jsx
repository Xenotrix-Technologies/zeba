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
  Heart
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('benefits');

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

  const images = Array.isArray(selectedProduct.images)
    ? selectedProduct.images
    : (typeof selectedProduct.images === 'string' ? JSON.parse(selectedProduct.images || '[]') : ['/images/zeba-real-packaging-1.jpg']);

  const benefits = Array.isArray(selectedProduct.benefits)
    ? selectedProduct.benefits
    : (typeof selectedProduct.benefits === 'string' ? JSON.parse(selectedProduct.benefits || '[]') : []);

  const howToUse = Array.isArray(selectedProduct.how_to_use)
    ? selectedProduct.how_to_use
    : (typeof selectedProduct.how_to_use === 'string' ? JSON.parse(selectedProduct.how_to_use || '[]') : []);

  const features = Array.isArray(selectedProduct.features)
    ? selectedProduct.features
    : (typeof selectedProduct.features === 'string' ? JSON.parse(selectedProduct.features || '[]') : []);

  const discountPercent = selectedProduct.original_price > selectedProduct.price
    ? Math.round(((selectedProduct.original_price - selectedProduct.price) / selectedProduct.original_price) * 100)
    : 0;

  return (
    <div className="bg-[#FCFCFE] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Image */}
            <div className="rounded-3xl bg-white p-4 border border-slate-200/80 shadow-lg relative overflow-hidden aspect-square flex items-center justify-center">
              {selectedProduct.badge_text && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-brand-pink text-white shadow-md">
                    {selectedProduct.badge_text}
                  </span>
                </div>
              )}
              <img
                src={images[activeImageIndex] || images[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-contain transition-all duration-300 transform hover:scale-105"
              />
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`rounded-2xl p-1.5 bg-white border transition-all aspect-square flex items-center justify-center overflow-hidden ${
                      activeImageIndex === idx
                        ? 'border-brand-pink ring-2 ring-brand-pink/30 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}

            {/* Discreet Packaging Guarantee */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3 text-xs text-slate-600">
              <Truck className="w-5 h-5 text-[#0A192F] flex-shrink-0" />
              <div>
                <span className="font-bold text-[#0A192F]">100% Discreet Packaging:</span>
                <span className="ml-1">Delivered in a plain, confidential parcel with no external product markings.</span>
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
                <span className="text-slate-400 font-normal text-xs">(480+ Verified Reviews)</span>
              </div>

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                ● In Stock & Ready to Ship
              </span>
            </div>

            {/* Product Name */}
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-brand-navy">
                {selectedProduct.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                {selectedProduct.short_description}
              </p>
            </div>

            {/* Price Box */}
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
            <div className="space-y-3 pt-2">
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
                        {prod.pack_count === 1 ? '1 Single Use Pad' : '3 Individually Sealed Pads'}
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

            {/* Quantity Stepper & Add to Bag */}
            <div className="space-y-3 pt-2">
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

              {/* WhatsApp Quick Order Help */}
              <a
                href={`https://wa.me/919876543210?text=Hi%20ZEBA%20Team%2C%20I%20want%20to%20order%20the%20${encodeURIComponent(selectedProduct.name)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Need Help Choosing? Ask Us on WhatsApp</span>
              </a>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Flame className="w-4 h-4 text-brand-pink mx-auto mb-1" />
                <span className="text-[11px] font-bold text-brand-navy block">Heats in 5 Mins</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-brand-gold mx-auto mb-1" />
                <span className="text-[11px] font-bold text-brand-navy block">Up to 8 Hours</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-brand-navy block">100% Safe</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Product Details */}
        <div className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md">
          <div className="flex border-b border-slate-200 space-x-8">
            <button
              onClick={() => setActiveTab('benefits')}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 -mb-px ${
                activeTab === 'benefits'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Key Benefits
            </button>
            <button
              onClick={() => setActiveTab('how_to_use')}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 -mb-px ${
                activeTab === 'how_to_use'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              How to Use (Box Guide)
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 -mb-px ${
                activeTab === 'safety'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Ingredients & Safety Notice
            </button>
          </div>

          <div className="pt-6">
            {activeTab === 'benefits' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-bold text-lg text-brand-navy">Why Choose Authentic ZEBA Heating Pads?</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                  {benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-brand-pink flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'how_to_use' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-bold text-lg text-brand-navy">Official 3-Step Application Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {howToUse.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-brand-roseBg border border-brand-pink/20 space-y-2">
                      <span className="w-7 h-7 rounded-full bg-brand-pink text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-700 leading-relaxed max-w-3xl">
                <h3 className="font-display font-bold text-lg text-brand-navy">100% Safe Natural Ingredients</h3>
                <p>
                  ZEBA heating pads contain a safe, natural blend of <strong>Iron Powder, Activated Carbon, Vermiculite, Salt, and Purified Moisture</strong>. When exposed to oxygen, it produces gentle, continuous thermal energy.
                </p>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <span className="font-bold block">Important Safety Notice:</span>
                  <p>• External use only. Always stick the adhesive onto the outside of your underwear or undergarment.</p>
                  <p>• Do not stick directly to bare skin.</p>
                  <p>• Every few hours, remove for 5 minutes to allow skin to breathe, then reattach.</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
