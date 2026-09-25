import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, Star, Flame, Clock } from 'lucide-react';
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
    : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : ['/images/zeba-1pack.jpg']);

  const mainImage = images[0] || '/images/zeba-1pack.jpg';
  const discountPercent = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div
      className={`relative rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
        isFeatured
          ? 'border-brand-primaryPink/60 shadow-brand-lg ring-2 ring-brand-primaryPink/20 hover:shadow-2xl hover:border-brand-brightPink'
          : 'border-brand-primaryPink/20 shadow-sm hover:shadow-xl hover:border-brand-primaryPink/50'
      }`}
    >
      {/* Top Badge matching packaging visual hierarchy */}
      {product.badge_text && (
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
              product.pack_count > 1
                ? 'pack-pink-gradient text-white'
                : 'bg-brand-deepPurple text-brand-lightGold border border-brand-gold/40'
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
        className="relative block bg-gradient-to-b from-[#FFF5FA] to-white overflow-hidden aspect-square flex items-center justify-center p-6"
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
            <div className="flex items-center space-x-1 text-brand-gold font-bold">
              <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
              <span className="text-brand-darkPurple">4.9</span>
              <span className="text-[#805A82] font-normal">
                ({product.pack_count > 1 ? '380+' : '140+'} verified)
              </span>
            </div>
            <span className="font-bold text-brand-deepPurple bg-brand-softPink px-2.5 py-0.5 rounded-full text-[11px] border border-brand-primaryPink/20">
              {product.pack_size}
            </span>
          </div>

          {/* Title */}
          <Link to="/products">
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-brand-deepPurple group-hover:text-brand-brightPink transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-[#805A82] mt-2 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>

          {/* Key Packaging Highlights */}
          <div className="mt-4 pt-3 border-t border-brand-pink/15 grid grid-cols-2 gap-2 text-[11px] text-brand-darkPurple">
            <div className="flex items-center space-x-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-brand-brightPink flex-shrink-0" />
              <span>50–55°C Heat</span>
            </div>
            <div className="flex items-center space-x-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>8+ Hours Warmth</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTAs */}
        <div className="pt-4 border-t border-brand-pink/15 space-y-3">
          <div className="flex items-baseline space-x-2">
            <span className="font-display font-black text-2xl text-brand-deepPurple">
              ₹{parseFloat(product.price).toFixed(0)}
            </span>
            {parseFloat(product.original_price) > parseFloat(product.price) && (
              <>
                <span className="text-sm text-slate-400 line-through">
                  ₹{parseFloat(product.original_price).toFixed(0)}
                </span>
                <span className="text-[11px] font-extrabold text-brand-deepPink bg-brand-softPink px-2 py-0.5 rounded-md border border-brand-primaryPink/30">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => addToCart(product, 1, true)}
              className="py-2.5 px-3 rounded-xl border-2 border-brand-brightPink/40 text-brand-brightPink hover:bg-brand-softPink font-bold text-xs flex items-center justify-center space-x-1.5 btn-tactile whitespace-nowrap transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-brand-brightPink" />
              <span>Add to Bag</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="py-2.5 px-3 rounded-xl pack-pink-gradient hover:opacity-95 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md shadow-brand-pink/25 btn-tactile whitespace-nowrap"
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
