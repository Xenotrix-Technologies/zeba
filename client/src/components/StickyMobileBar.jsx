import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { businessConfig } from '../config/businessConfig';

export default function StickyMobileBar() {
  const location = useLocation();
  const { cartCount, setIsCartOpen } = useCart();

  // Hide on checkout, order success, and admin pages
  if (
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/order-success') ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-brand-pink/20 p-2.5 px-4 shadow-[0_-8px_20px_rgba(95,63,104,0.08)] flex items-center justify-between gap-3">
      {/* WhatsApp Quick Help */}
      <a
        href={businessConfig.whatsapp.getWhatsAppUrl('Hi ZEBA Team, I need help with Period Pain Relief Pads')}
        target="_blank"
        rel="noreferrer"
        className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-5 h-5" />
      </a>

      {/* Cart Quick Button */}
      {cartCount > 0 ? (
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex-1 py-3 px-4 rounded-xl bg-brand-deepPurple text-white text-xs font-bold flex items-center justify-between shadow-md"
        >
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-brand-primaryPink" />
            <span>Bag ({cartCount})</span>
          </div>
          <span className="text-brand-lightGold flex items-center gap-1 font-bold">
            View <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      ) : (
        <Link
          to="/products"
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md"
        >
          <span>Shop Heating Pads</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
