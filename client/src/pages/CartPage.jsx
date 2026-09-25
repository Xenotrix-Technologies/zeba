import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalSavings,
    freeShippingThreshold,
    freeShippingProgress
  } = useCart();

  const navigate = useNavigate();
  const shippingFee = subtotal >= freeShippingThreshold ? 0.00 : (cart.length > 0 ? 49.00 : 0.00);
  const grandTotal = subtotal + shippingFee;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-softPink text-brand-brightPink flex items-center justify-center mx-auto shadow-inner border border-brand-primaryPink/25">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-display font-black text-3xl text-brand-deepPurple">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-[#805A82] max-w-md mx-auto leading-relaxed">
          Looks like you haven't added any ZEBA Period Pain Relief Heating Pads to your bag yet. Choose a pack to begin!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white font-bold text-sm shadow-xl shadow-brand-pink/30 hover:shadow-brand-pink/50 transition-all btn-tactile"
        >
          <span>Shop Heating Pads</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF5FA] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-deepPurple">
              Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
            </h1>
            <p className="text-xs text-[#805A82] mt-1">Review your selected items before proceeding to checkout</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-[#805A82] hover:text-rose-600 transition-colors font-semibold"
          >
            Clear Bag
          </button>
        </div>

        {/* Free Shipping Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-brand-primaryPink/30 max-w-4xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-brand-deepPurple mb-2">
            <span>
              {remainingForFreeShipping === 0 ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-gold" /> You've unlocked FREE Shipping!
                </span>
              ) : (
                <span>Add ₹{remainingForFreeShipping.toFixed(0)} more for FREE Standard Shipping</span>
              )}
            </span>
            <span className="text-brand-brightPink font-extrabold">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full bg-brand-softPink h-2.5 rounded-full overflow-hidden border border-brand-primaryPink/20">
            <div
              className="bg-brand-brightPink h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Grid: Items & Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white border border-brand-primaryPink/25 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-2xl border border-brand-primaryPink/15 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-display font-bold text-base text-brand-deepPurple">{item.name}</h3>
                    <span className="inline-block text-[11px] font-bold text-brand-brightPink bg-brand-softPink px-2.5 py-0.5 rounded-full mt-1 border border-brand-primaryPink/20">
                      {item.pack_size}
                    </span>
                    <div className="text-xs text-[#805A82] mt-1">
                      Unit Price: ₹{item.price.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                  <div className="flex items-center border border-brand-primaryPink/30 rounded-xl bg-brand-softPink/40 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1.5 text-brand-deepPurple hover:text-brand-brightPink rounded-lg hover:bg-brand-softPink transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-brand-deepPurple">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1.5 text-brand-deepPurple hover:text-brand-brightPink rounded-lg hover:bg-brand-softPink transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-display font-extrabold text-base text-brand-deepPurple">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    {item.original_price > item.price && (
                      <div className="text-[11px] text-slate-400 line-through">
                        ₹{(item.original_price * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-2 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-brand-primaryPink/30 shadow-lg space-y-5">
            <h2 className="font-display font-bold text-lg text-brand-deepPurple border-b border-brand-primaryPink/20 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-[#805A82]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-brand-deepPurple">₹{subtotal.toFixed(2)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex items-center justify-between text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                  <span>Pack Savings</span>
                  <span>-₹{totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase">FREE</span>
                  ) : (
                    `₹${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="border-t border-brand-primaryPink/20 pt-3 flex items-center justify-between text-base">
                <span className="font-bold text-brand-deepPurple">Grand Total</span>
                <span className="font-display font-black text-xl text-brand-deepPurple">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-sm shadow-xl shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 btn-tactile"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 space-y-2 text-[11px] text-[#805A82]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Genuine, tested, safe self-heating patches</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-brand-deepPurple flex-shrink-0" />
                <span>Plain, discreet, tamper-proof packaging</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
