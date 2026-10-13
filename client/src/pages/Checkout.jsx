import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ShieldCheck, CreditCard, Banknote, CheckCircle2, Sparkles, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import api from '../services/api';
import RazorpayModal from '../components/RazorpayModal';
import CustomerAuthModal from '../components/CustomerAuthModal';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const location = useLocation();
  const {
    cart,
    freeShippingThreshold,
    clearCart,
    updateQuantity,
    buyNowItem,
    updateBuyNowQuantity,
    clearBuyNow
  } = useCart();
  const { settings } = useStoreSettings();
  const { customer, isCustomerAuthenticated } = useCustomerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // If explicitly navigated from the cart page/drawer, clear any lingering buyNow session
  useEffect(() => {
    if (location.state?.fromCart) {
      clearBuyNow();
    }
  }, [location.state]);

  // Determine if this checkout is for an instant "Buy Now" product or regular shopping cart
  const isBuyNow = Boolean(buyNowItem && !location.state?.fromCart);
  const checkoutItems = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cart;

  const subtotal = checkoutItems.reduce(
    (acc, item) => acc + (parseFloat(item.price) || 0) * item.quantity,
    0
  );

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    houseBuilding: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [loading, setLoading] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isCustomerAuthenticated && customer) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || customer.name || '',
        email: prev.email || customer.email || '',
        phone: prev.phone || customer.phone || '',
        ...(customer.defaultAddress ? {
          houseBuilding: customer.defaultAddress.house_building || '',
          street: customer.defaultAddress.street || '',
          area: customer.defaultAddress.area || '',
          city: customer.defaultAddress.city || '',
          state: customer.defaultAddress.state || '',
          pincode: customer.defaultAddress.pincode || ''
        } : {})
      }));
    }
  }, [customer, isCustomerAuthenticated]);

  const freeThreshold = settings.commerce?.freeShippingThreshold !== undefined && settings.commerce?.freeShippingThreshold !== null
    ? Number(settings.commerce.freeShippingThreshold)
    : (freeShippingThreshold || 1000);
  const standardShippingFee = settings.commerce?.standardShippingFee !== undefined && settings.commerce?.standardShippingFee !== null
    ? Number(settings.commerce.standardShippingFee)
    : 49.00;
  const isFreeShipping = standardShippingFee === 0 || freeThreshold === 0 || subtotal >= freeThreshold;
  const shippingFee = isFreeShipping
    ? 0.00
    : (checkoutItems.length > 0 ? standardShippingFee : 0.00);
  const isCod = paymentMethod === 'cod';
  const codFee = isCod ? Number(settings.commerce?.codFee || 0) : 0;
  const totalAmount = subtotal + shippingFee + codFee;

  const handleUpdateItemQuantity = (itemId, delta) => {
    if (isBuyNow) {
      updateBuyNowQuantity(delta);
    } else {
      updateQuantity(itemId, delta);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (checkoutItems.length === 0) {
      addToast('Your checkout is empty. Please add items to checkout.', 'error');
      navigate('/products');
      return false;
    }

    if (!formData.name || !formData.name.trim()) {
      addToast('Please enter your full name.', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      addToast('Please enter a valid email address.', 'error');
      return false;
    }

    const cleanPhone = (formData.phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      addToast('Please enter a valid phone number.', 'error');
      return false;
    }

    if (!formData.houseBuilding || !formData.houseBuilding.trim()) {
      addToast('Please enter your delivery address.', 'error');
      return false;
    }

    if (!formData.city || !formData.city.trim() || !formData.state || !formData.state.trim()) {
      addToast('Please enter your city and state.', 'error');
      return false;
    }

    if (!/^\d{6}$/.test((formData.pincode || '').trim())) {
      addToast('Please enter a valid 6-digit Indian PIN code.', 'error');
      return false;
    }

    return true;
  };

  const handleProceedToPayment = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // If customer is not authenticated, show popup to create account or login to track order
    if (!isCustomerAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Customer is already authenticated, proceed to create order
    await executePaymentOrder();
  };

  const executePaymentOrder = async () => {
    setLoading(true);

    try {
      // 1. Request backend to validate stock, calculate verified price & create order
      const orderPayload = {
        paymentMethod,
        items: checkoutItems.map(i => ({ productId: i.id, quantity: i.quantity })),
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim()
        },
        address: {
          house_building: formData.houseBuilding.trim(),
          street: formData.street.trim(),
          area: formData.area.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country || 'India'
        },
        notes: formData.notes?.trim() || ''
      };

      const res = await api.post('/payments/create-order', orderPayload);

      if (!res.success) {
        throw new Error(res.message || 'Failed to initialize order.');
      }

      // Handle Cash on Delivery order completion
      if (res.isCod) {
        if (isBuyNow) {
          clearBuyNow();
        } else {
          clearCart();
        }
        addToast('Order placed successfully! Pay cash upon delivery.', 'success');
        navigate(`/order-success?order=${res.orderNumber || res.order?.orderNumber}`);
        return;
      }

      if (!res.razorpayOrderId) {
        throw new Error(res.message || 'Failed to initialize Razorpay payment order.');
      }

      setRazorpayOrder(res);

      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Check if real window.Razorpay is available and keys are live
      if (window.Razorpay && res.keyId && !res.keyId.includes('placeholder') && !res.razorpayOrderId.startsWith('order_zeba_')) {
        const options = {
          key: res.keyId,
          amount: res.amount,
          currency: res.currency || 'INR',
          name: 'ZEBA Period Care',
          description: `Order ${res.orderNumber} - Period Pain Relief Heating Pads`,
          image: '/images/zeba-logo.png',
          order_id: res.razorpayOrderId,
          handler: async (response) => {
            await handlePaymentVerification({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: res.orderId,
              is_test_mode: false
            });
          },
          modal: {
            ondismiss: async () => {
              setLoading(false);
              addToast('Payment was cancelled. Your order has not been confirmed. You can retry anytime.', 'info');
              try {
                await api.post('/payments/cancel', {
                  razorpay_order_id: res.razorpayOrderId,
                  order_id: res.orderId,
                  reason: 'Customer closed the Razorpay payment window.'
                });
              } catch (e) {
                // Non-blocking
              }
            }
          },
          prefill: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            contact: formData.phone.trim()
          },
          theme: {
            color: '#E84FA5'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async (failRes) => {
          setLoading(false);
          const errorDesc = failRes.error?.description || 'Payment was not completed. Your order has not been confirmed. You can retry the payment.';
          addToast(errorDesc, 'error');
          try {
            await api.post('/payments/fail', {
              razorpay_order_id: res.razorpayOrderId,
              order_id: res.orderId,
              error_code: failRes.error?.code || 'PAYMENT_FAILED',
              error_description: failRes.error?.description || errorDesc
            });
          } catch (e) {
            // Non-blocking
          }
        });
        rzp.open();
      } else {
        // Show interactive test/preview checkout modal
        setShowSimulatedModal(true);
      }

    } catch (err) {
      addToast(err.message || 'Payment initialization failed.', 'error');
      setLoading(false);
    }
  };

  const handlePaymentVerification = async (paymentResult) => {
    setLoading(true);
    try {
      const verifyPayload = {
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
        order_id: paymentResult.order_id || razorpayOrder?.orderId,
        is_test_mode: paymentResult.is_test_mode
      };

      const res = await api.post('/payments/verify', verifyPayload);

      if (res.success && res.order) {
        if (isBuyNow) {
          clearBuyNow();
        } else {
          clearCart();
        }
        addToast('Order confirmed and paid successfully!', 'success');
        navigate(`/order-success?order=${res.order.orderNumber}`);
      } else {
        throw new Error(res.message || 'Payment verification failed.');
      }
    } catch (err) {
      addToast(err.message || 'Payment verification failed. If your account was debited, our team will confirm your order shortly.', 'error');
    } finally {
      setLoading(false);
      setShowSimulatedModal(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-deepPurple">Your checkout is empty.</h2>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 rounded-xl bg-brand-brightPink text-white font-bold text-xs uppercase tracking-wider"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF5FA] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted Razorpay Checkout</span>
          </div>
          <h1 className="font-display font-black text-3xl text-brand-deepPurple">Complete Your Order</h1>
          <p className="text-xs text-[#805A82]">
            Provide your delivery address and pay securely via Razorpay (UPI, Cards, NetBanking).
          </p>
        </div>

        <form onSubmit={handleProceedToPayment}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Customer and Shipping Information */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Contact Information */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-primaryPink/25 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-brand-deepPurple flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-brand-brightPink text-white text-xs font-bold flex items-center justify-center">1</span>
                    <span>Contact Information</span>
                  </h2>
                  {!isCustomerAuthenticated && (
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="text-xs font-bold text-brand-brightPink hover:text-brand-deepPink underline transition-colors"
                    >
                      Already have an account? Sign In
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Mobile Number (for delivery SMS/call) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Mobile Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Email Address (for order receipt) *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-primaryPink/25 shadow-sm space-y-4">
                <h2 className="font-display font-bold text-lg text-brand-deepPurple flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-brand-brightPink text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span>Shipping Address</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Flat / House No. / Building Name *</label>
                    <input
                      type="text"
                      name="houseBuilding"
                      required
                      placeholder="Flat / House No. / Building Name"
                      value={formData.houseBuilding}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Street / Landmark</label>
                    <input
                      type="text"
                      name="street"
                      placeholder="Street / Landmark"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Area / Locality</label>
                    <input
                      type="text"
                      name="area"
                      placeholder="Area / Locality"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">PIN Code (6 digits) *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength="6"
                      placeholder="PIN Code (6 digits)"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      disabled
                      value="India"
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/20 bg-brand-softPink/50 text-[#805A82] text-xs font-medium cursor-not-allowed"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Special Delivery Instructions (Optional)</label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="Special delivery instructions (optional)"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-primaryPink/25 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-brand-deepPurple flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-brand-brightPink text-white text-xs font-bold flex items-center justify-center">3</span>
                    <span>Payment Method</span>
                  </h2>
                  <span className="text-[11px] font-semibold text-brand-brightPink bg-brand-softPink/60 px-2.5 py-1 rounded-full border border-brand-primaryPink/20">
                    100% Safe & Secure
                  </span>
                </div>

                <div>
                  {/* Option 1: Razorpay Online Payment */}
                  <div className="rounded-2xl p-4 sm:p-5 border-2 border-brand-brightPink bg-[#FFF0F7] shadow-md ring-2 ring-brand-pink/20 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-brightPink text-white shadow-sm">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-brand-deepPurple">Online Payment (Razorpay)</h3>
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Instant Confirmation • All Payment Modes Supported</span>
                          </span>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-brand-brightPink bg-brand-brightPink text-white flex items-center justify-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>

                    <p className="text-xs text-[#805A82] mt-3 leading-relaxed">
                      Pay securely with UPI (Google Pay, PhonePe, Paytm, BHIM), Cards (Visa, Mastercard, RuPay), or NetBanking.
                    </p>

                    <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-brand-primaryPink/15 text-[11px] text-[#805A82] font-semibold">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Razorpay 256-Bit SSL Encrypted & RBI Compliant</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Trigger */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-primaryPink/30 shadow-xl space-y-6">
                <h2 className="font-display font-bold text-lg text-brand-deepPurple border-b border-brand-primaryPink/20 pb-3">
                  Order Breakdown
                </h2>

                {/* Items preview */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 py-2.5 border-b border-brand-primaryPink/15 last:border-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/zeba-1pack.webp';
                        }}
                        className="w-12 h-12 rounded-xl object-cover border border-brand-primaryPink/15 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-brand-deepPurple truncate leading-tight">
                            {item.name}
                          </h4>

                          {/* + and - quantity stepper */}
                          <div className="flex items-center border border-brand-primaryPink/30 rounded-lg bg-brand-softPink/50 p-0.5 flex-shrink-0 shadow-xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-brand-deepPurple hover:text-brand-brightPink hover:bg-brand-softPink rounded transition-colors"
                              aria-label="Decrease quantity"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-1.5 text-xs font-bold text-brand-deepPurple min-w-[1.25rem] text-center select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-brand-deepPurple hover:text-brand-brightPink hover:bg-brand-softPink rounded transition-colors"
                              aria-label="Increase quantity"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#805A82] mt-1">
                          <span>Qty: {item.quantity} × ₹{item.price.toFixed(0)}</span>
                          <span className="font-bold text-brand-deepPurple">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="space-y-2.5 text-xs text-[#805A82] pt-2 border-t border-brand-primaryPink/15">
                  <div className="flex items-center justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-brand-deepPurple">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Shipping Fee</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase">FREE</span>
                      ) : (
                        `₹${shippingFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Payment Mode</span>
                    <span className="font-semibold text-brand-deepPurple">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay Online'}
                    </span>
                  </div>

                  {isCod && codFee > 0 && (
                    <div className="flex items-center justify-between text-brand-deepPurple font-medium">
                      <span>COD Handling Fee</span>
                      <span>₹{codFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-brand-primaryPink/20 pt-3 flex items-center justify-between text-base">
                    <span className="font-bold text-brand-deepPurple">
                      {isCod ? 'Total Payable on Delivery' : 'Total Payable'}
                    </span>
                    <span className="font-display font-black text-2xl text-brand-brightPink">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-sm shadow-xl shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 btn-tactile"
                >
                  {isCod ? <Banknote className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  <span>
                    {loading
                      ? (isCod ? 'Placing your order...' : 'Processing payment...')
                      : (isCod
                          ? `Place Order (Cash on Delivery • ₹${totalAmount.toFixed(0)})`
                          : `Pay ₹${totalAmount.toFixed(0)} with Razorpay`
                        )
                    }
                  </span>
                </button>

                <div className="p-3.5 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/20 text-center space-y-1 text-[11px] text-[#805A82]">
                  <div className="flex items-center justify-center space-x-1.5 font-semibold text-brand-deepPurple">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isCod ? 'Verified Cash on Delivery Fulfillment' : 'Real-Time Razorpay Payment Gateway'}
                    </span>
                  </div>
                  <p>
                    {isCod
                      ? 'Keep exact cash ready. Delivered in 100% plain, discreet packaging.'
                      : 'Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and NetBanking.'
                    }
                  </p>
                </div>

              </div>

            </div>

          </div>
        </form>

      </div>

      {/* Simulated / Test Razorpay Modal */}
      <RazorpayModal
        isOpen={showSimulatedModal}
        onClose={() => setShowSimulatedModal(false)}
        orderData={{
          ...razorpayOrder,
          customer: { name: formData.name, email: formData.email, phone: formData.phone }
        }}
        onSuccess={handlePaymentVerification}
        onError={(err) => {
          addToast(err.message || 'Payment was cancelled.', 'error');
          setShowSimulatedModal(false);
        }}
      />

      {/* Customer Account / Sign In Modal for Order Tracking */}
      <CustomerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialData={{
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }}
        totalAmount={totalAmount}
        onAuthenticatedAndProceed={() => {
          setShowAuthModal(false);
          executePaymentOrder();
        }}
      />

    </div>
  );
}
