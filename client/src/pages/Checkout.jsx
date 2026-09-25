import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import api from '../services/api';
import RazorpayModal from '../components/RazorpayModal';

export default function Checkout() {
  const { cart, subtotal, freeShippingThreshold, clearCart } = useCart();
  const { customer, isCustomerAuthenticated } = useCustomerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);

  const shippingFee = subtotal >= freeShippingThreshold ? 0.00 : (cart.length > 0 ? 49.00 : 0.00);
  const totalAmount = subtotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      addToast('Your cart is empty. Please add items to checkout.', 'error');
      navigate('/products');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      addToast('Please provide your name, email, and mobile number.', 'error');
      return;
    }

    if (!formData.houseBuilding || !formData.city || !formData.state || !formData.pincode) {
      addToast('Please complete all required shipping address fields.', 'error');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      addToast('Please enter a valid 6-digit Indian PIN code.', 'error');
      return;
    }

    setLoading(true);

    try {
      // 1. Request backend to calculate PostgreSQL verified price & create Razorpay order
      const orderPayload = {
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        address: {
          house_building: formData.houseBuilding,
          street: formData.street,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country
        }
      };

      const res = await api.post('/payments/create-order', orderPayload);

      if (!res.success || !res.razorpayOrderId) {
        throw new Error(res.message || 'Failed to initialize payment order.');
      }

      setRazorpayOrder(res);

      // Check if real window.Razorpay is available and keys are live
      if (window.Razorpay && res.keyId && !res.keyId.includes('placeholder') && !res.razorpayOrderId.startsWith('order_zeba_')) {
        const options = {
          key: res.keyId,
          amount: res.amount,
          currency: res.currency || 'INR',
          name: 'ZEBA Period Care',
          description: 'Payment for ZEBA Period Pain Relief Heating Pad',
          image: '/images/zeba-1pack.jpg',
          order_id: res.razorpayOrderId,
          handler: async (response) => {
            await handlePaymentVerification({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              is_test_mode: false
            });
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: '#E84FA5'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (failRes) => {
          addToast(failRes.error?.description || 'Payment was unsuccessful.', 'error');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Show interactive test/preview checkout modal
        setShowSimulatedModal(true);
      }

    } catch (err) {
      addToast(err.message || 'Payment initialization failed.', 'error');
    } finally {
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
        is_test_mode: paymentResult.is_test_mode,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        address: {
          house_building: formData.houseBuilding,
          street: formData.street,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country
        },
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
        notes: formData.notes
      };

      const res = await api.post('/payments/verify', verifyPayload);

      if (res.success && res.order) {
        clearCart();
        addToast('Order confirmed and paid successfully!', 'success');
        navigate(`/order-success?order=${res.order.orderNumber}`);
      } else {
        throw new Error(res.message || 'Verification failed.');
      }
    } catch (err) {
      addToast(err.message || 'Payment verification failed.', 'error');
    } finally {
      setLoading(false);
      setShowSimulatedModal(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-deepPurple">Your cart is empty.</h2>
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
                <h2 className="font-display font-bold text-lg text-brand-deepPurple flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-brand-brightPink text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span>Contact Information</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-brand-darkPurple mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Pooja Sharma"
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
                      placeholder="10-digit mobile number"
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
                      placeholder="yourname@domain.com"
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
                      placeholder="Flat 402, Lotus Apartments"
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
                      placeholder="Near City Park, 12th Main"
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
                      placeholder="Indiranagar"
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
                      placeholder="Bengaluru"
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
                      placeholder="Karnataka"
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
                      placeholder="560038"
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
                      placeholder="Leave with security / Call before delivery"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Razorpay Trigger */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-primaryPink/30 shadow-xl space-y-6">
                <h2 className="font-display font-bold text-lg text-brand-deepPurple border-b border-brand-primaryPink/20 pb-3">
                  Order Breakdown
                </h2>

                {/* Items preview */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 py-2 border-b border-brand-primaryPink/15 last:border-0">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-brand-primaryPink/15 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-brand-deepPurple truncate">{item.name}</h4>
                        <div className="flex items-center justify-between text-[11px] text-[#805A82] mt-0.5">
                          <span>Qty: {item.quantity} × ₹{item.price.toFixed(0)}</span>
                          <span className="font-bold text-brand-deepPurple">₹{(item.price * item.quantity).toFixed(2)}</span>
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

                  <div className="border-t border-brand-primaryPink/20 pt-3 flex items-center justify-between text-base">
                    <span className="font-bold text-brand-deepPurple">Total Payable</span>
                    <span className="font-display font-black text-2xl text-brand-brightPink">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Razorpay Payment Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-sm shadow-xl shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 btn-tactile"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Initiating Razorpay...' : `Pay ₹${totalAmount.toFixed(0)} with Razorpay`}</span>
                </button>

                <div className="p-3.5 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/20 text-center space-y-1 text-[11px] text-[#805A82]">
                  <div className="flex items-center justify-center space-x-1.5 font-semibold text-brand-deepPurple">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Real-Time Razorpay Payment Gateway</span>
                  </div>
                  <p>Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and NetBanking.</p>
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

    </div>
  );
}
