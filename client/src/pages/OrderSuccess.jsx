import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Truck,
  ArrowRight,
  Clock,
  Package
} from 'lucide-react';
import api from '../services/api';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { getProductMainImage } from '../utils/imageUtils';

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const { getWhatsAppUrl } = useStoreSettings();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
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

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="bg-[#FFF5FA] py-12 sm:py-20 min-h-[85vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-brand-primaryPink/30 shadow-xl text-center space-y-8">
          
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

          {loading && (
            <div className="py-8 space-y-2">
              <div className="w-8 h-8 border-3 border-brand-brightPink border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#805A82]">Loading your verified order summary...</p>
            </div>
          )}

          {/* Status Timeline */}
          {!loading && order && (
            <div className="p-4 sm:p-6 rounded-2xl bg-brand-softPink/50 border border-brand-primaryPink/25 text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-brand-deepPurple">
                  Live Status Timeline
                </span>
                <span className="text-[11px] font-bold text-brand-brightPink bg-white px-2.5 py-0.5 rounded-full border border-brand-primaryPink/25">
                  ● {order.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              {/* Step indicator bar */}
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {STATUS_STEPS.map((s, idx) => {
                  const isPassed = idx <= currentStepIdx;
                  return (
                    <div key={s.key} className="space-y-1">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isPassed ? 'bg-brand-brightPink shadow-xs' : 'bg-brand-primaryPink/20'
                        }`}
                      />
                      <span className={`text-[10px] block leading-tight font-semibold truncate ${
                        isPassed ? 'text-brand-deepPurple font-bold' : 'text-slate-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Details Pill */}
          {!loading && order && (
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
                  <p className="font-semibold text-brand-deepPurple">{order.customer?.name}</p>
                  <p className="text-[#805A82]">{order.customer?.phone}</p>
                  <p className="text-[#805A82]">{order.customer?.email}</p>
                </div>
                <div>
                  <span className="text-[#805A82] font-bold block mb-1">Shipping Address:</span>
                  <p className="text-brand-darkPurple">
                    {order.address?.houseBuilding}, {order.address?.street && `${order.address.street}, `}
                    {order.address?.area && `${order.address.area}, `}{order.address?.city}, {order.address?.state} - {order.address?.pincode}
                  </p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2">
                <span className="text-[#805A82] font-bold block">Ordered Items:</span>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between font-medium">
                    <span className="text-brand-deepPurple">
                      {item.productName} ({item.packSize}) × {item.quantity}
                    </span>
                    <span className="font-bold text-brand-deepPurple">₹{parseFloat(item.subtotalPrice || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-brand-primaryPink/20 flex items-center justify-between text-sm">
                <span className="font-bold text-brand-deepPurple">Total Paid</span>
                <span className="font-display font-black text-lg text-brand-brightPink">
                  ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {order && (
              <Link
                to={`/order-tracking?order=${order.orderNumber}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md btn-tactile"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order Live</span>
              </Link>
            )}

            <Link
              to="/products"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-deepPurple hover:bg-brand-darkPurple text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all btn-tactile"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <a
              href={getWhatsAppUrl(`Hi ZEBA Team, I just placed order ${orderNumber || ''} and wanted to confirm delivery`)}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md btn-tactile"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          <div className="text-[11px] text-[#805A82] flex items-center justify-center space-x-2 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>A confirmation receipt has been generated and stored in your customer account.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
