import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalSavings,
    freeShippingThreshold,
    freeShippingProgress
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#38283D]/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-brand-pink/15 flex items-center justify-between bg-[#FFF5FA]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-brightPink" />
              <h2 className="text-lg font-bold text-brand-deepPurple">Your Shopping Bag</h2>
              <span className="text-xs bg-brand-brightPink text-white font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-brand-purple hover:text-brand-darkPurple rounded-lg hover:bg-white transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#FFF5FA] px-4 py-3 border-b border-brand-pink/15">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-darkPurple mb-1.5">
              <span>
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Congratulations! You unlocked Free Shipping!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-brand-deepPurple">₹{remainingForFreeShipping.toFixed(0)}</strong> more to unlock <strong className="text-brand-brightPink">FREE Shipping</strong>
                  </span>
                )}
              </span>
              <span className="text-brand-brightPink font-bold text-[11px]">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full bg-brand-pink/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-brightPink h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-softPink text-brand-brightPink flex items-center justify-center mx-auto border border-brand-primaryPink/20">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-brand-deepPurple">Your bag is empty</h3>
                <p className="text-xs text-[#805A82] max-w-xs mx-auto">
                  Choose between our 1-Pack starter pad or best-selling 3-Pack value box for all-day period comfort.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/products');
                  }}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-brightPink text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-deepPink shadow-md transition-colors"
                >
                  Explore Heating Pads
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-3.5 rounded-2xl bg-white border border-brand-pink/20 shadow-sm hover:border-brand-primaryPink transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/zeba-1pack.jpg';
                    }}
                    className="w-20 h-20 object-cover rounded-xl border border-brand-pink/15 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-brand-deepPurple truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="inline-block text-[10px] font-bold text-brand-brightPink bg-brand-softPink px-2 py-0.5 rounded-md mt-0.5 border border-brand-primaryPink/20">
                      {item.pack_size}
                    </span>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity adjuster */}
                      <div className="flex items-center border border-brand-pink/30 rounded-lg bg-brand-softPink/50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-brand-deepPurple hover:text-brand-brightPink hover:bg-brand-softPink rounded-l-lg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-brand-deepPurple">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-brand-deepPurple hover:text-brand-brightPink hover:bg-brand-softPink rounded-r-lg transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Price */}
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-brand-deepPurple">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        {parseFloat(item.original_price) > parseFloat(item.price) && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{(parseFloat(item.original_price) * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-brand-pink/15 bg-[#FFF5FA] space-y-3">
              {totalSavings > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg font-semibold border border-emerald-200/80">
                  <span>You're saving on this bundle:</span>
                  <span className="font-bold">₹{totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#805A82] font-semibold">Subtotal</span>
                <span className="font-display font-extrabold text-lg text-brand-deepPurple">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-[#805A82]">
                Taxes & shipping calculated at checkout.
              </p>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-sm shadow-lg shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all transform active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-[#805A82] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Safe & Secure 256-bit Encrypted Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
