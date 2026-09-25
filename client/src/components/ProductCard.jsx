import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, Star, Flame, Clock, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, isFeatured = false }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (e) => {
    e.preventDefault();
    addToCart(product, 1, false);
    navigate('/checkout');
  };

  const images = Array.isArray(product.images)
    ? product.images
    : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : ['/images/zeba-real-packaging-1.jpg']);

  const mainImage = images[0] || '/images/zeba-real-packaging-1.jpg';
  const discountPercent = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div
      className={`relative rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
        isFeatured
          ? 'border-zeba-magenta/40 shadow-brand-lg ring-1 ring-zeba-magenta/20 hover:shadow-2xl hover:border-zeba-magenta'
          : 'border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300'
      }`}
    >
      {/* Top Badge matching box colors */}
      {product.badge_text && (
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
              product.pack_count > 1
                ? 'pack-magenta-gradient text-white'
                : 'bg-zeba-navy text-zeba-lightGold border border-zeba-gold/30'
            }`}
          >
            {product.badge_text}
          </span>
        </div>
      )}

      {/* Safe 100% Ingredients Stamp */}
      <div className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full pack-safe-stamp text-white flex flex-col items-center justify-center text-center p-0.5 shadow-md">
        <span className="text-[7px] font-black uppercase">SAFE</span>
        <span className="text-[9px] font-extrabold -mt-0.5">100%</span>
      </div>

      {/* Product Image Gallery Link */}
      <Link
        to={`/products`}
        className="relative block bg-gradient-to-b from-[#FFF5F8] to-slate-50/60 overflow-hidden aspect-square flex items-center justify-center p-6"
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-white">
        <div>
          {/* Rating stars & Pack info */}
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center space-x-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9</span>
              <span className="text-slate-400 font-normal">
                ({product.pack_count > 1 ? '380+' : '140+'} verified)
              </span>
            </div>
            <span className="font-bold text-zeba-navy bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
              {product.pack_size}
            </span>
          </div>

          {/* Title */}
          <Link to="/products">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-zeba-navy group-hover:text-zeba-magenta transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>

          {/* Key Packaging Highlights */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-zeba-magenta flex-shrink-0" />
              <span>50–55°C Heat</span>
            </div>
            <div className="flex items-center space-x-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>8+ Hours Warmth</span>
            </div>
          </div>
        </div>

        {/* Pricing & Single-Line CTAs */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline space-x-2">
            <span className="font-display font-black text-2xl text-zeba-navy">
              ₹{parseFloat(product.price).toFixed(0)}
            </span>
            {parseFloat(product.original_price) > parseFloat(product.price) && (
              <>
                <span className="text-sm text-slate-400 line-through">
                  ₹{parseFloat(product.original_price).toFixed(0)}
                </span>
                <span className="text-[11px] font-extrabold text-zeba-deepMagenta bg-zeba-softPink px-2 py-0.5 rounded-md">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => addToCart(product, 1, true)}
              className="py-2.5 px-3 rounded-xl border border-zeba-magenta text-zeba-magenta hover:bg-zeba-softPink font-bold text-xs flex items-center justify-center space-x-1.5 btn-tactile whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="py-2.5 px-3 rounded-xl pack-magenta-gradient hover:opacity-95 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md shadow-zeba-magenta/20 btn-tactile whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
