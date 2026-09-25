import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageCircle, ShieldCheck, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { businessConfig } from '../config/businessConfig';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    async function fetchOrder() {
      if (!orderNumber) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/orders/${orderNumber}`);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Failed to load order details', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber]);

  return (
    <div className="bg-[#FFF5FA] py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-primaryPink/30 shadow-xl text-center space-y-8">
          
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Payment Verified • Order Confirmed
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-deepPurple">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-[#805A82] max-w-md mx-auto">
              Your ZEBA Period Pain Relief Heating Pads are being prepared for discreet dispatch.
            </p>
          </div>

          {/* Order Details Pill */}
          {order && (
            <div className="bg-[#FFF5FA] rounded-2xl p-6 border border-brand-primaryPink/25 text-left space-y-4 text-xs text-brand-darkPurple">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brand-primaryPink/20 gap-2">
                <div>
                  <span className="text-[#805A82] font-semibold block">Order Reference:</span>
                  <span className="font-display font-extrabold text-brand-deepPurple text-base">{order.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[#805A82] font-semibold block">Payment Status:</span>
                  <span className="inline-block font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                    {order.paymentStatus} (Razorpay)
                  </span>
                </div>
              </div>

              {/* Customer & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-brand-primaryPink/20">
                <div>
                  <span className="text-[#805A82] font-bold block mb-1">Delivering to:</span>
                  <p className="font-semibold text-brand-deepPurple">{order.customer.name}</p>
                  <p className="text-[#805A82]">{order.customer.phone}</p>
                  <p className="text-[#805A82]">{order.customer.email}</p>
                </div>
                <div>
                  <span className="text-[#805A82] font-bold block mb-1">Shipping Address:</span>
                  <p className="text-brand-darkPurple">
                    {order.address.houseBuilding}, {order.address.street && `${order.address.street}, `}
                    {order.address.area && `${order.address.area}, `}{order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2">
                <span className="text-[#805A82] font-bold block">Ordered Items:</span>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between font-medium">
                    <span className="text-brand-deepPurple">
                      {item.productName} ({item.packSize}) × {item.quantity}
                    </span>
                    <span className="font-bold text-brand-deepPurple">₹{item.subtotalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-brand-primaryPink/20 flex items-center justify-between text-sm">
                <span className="font-bold text-brand-deepPurple">Total Paid</span>
                <span className="font-display font-black text-lg text-brand-brightPink">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-deepPurple hover:bg-brand-darkPurple text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all btn-tactile"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <a
              href={businessConfig.whatsapp.getWhatsAppUrl(`Hi ZEBA Team, I just placed order ${orderNumber || ''} and wanted to confirm delivery`)}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md btn-tactile"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact on WhatsApp</span>
            </a>
          </div>

          <div className="text-[11px] text-[#805A82] flex items-center justify-center space-x-2 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>A confirmation receipt has been generated and stored in your account history.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
