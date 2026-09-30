import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { getProductMainImage } from '../utils/imageUtils';

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', description: 'Order received & verified with 100% natural stock' },
  { key: 'processing', label: 'Processing', description: 'Carefully packaged in discreet, unmarked packaging' },
  { key: 'shipped', label: 'Shipped', description: 'Handed over to express courier partner' },
  { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Courier agent is on the way to your address' },
  { key: 'delivered', label: 'Delivered', description: 'Successfully delivered to customer' }
];

export default function OrderTracking() {
  const { orderNumber: paramOrderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const queryOrderNumber = searchParams.get('order');

  const { settings, getWhatsAppUrl } = useStoreSettings();
  const [searchInput, setSearchInput] = useState(paramOrderNumber || queryOrderNumber || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchTrackingData = async (ordNum) => {
    if (!ordNum || !ordNum.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setHasSearched(true);

    try {
      const cleanNum = ordNum.trim();
      const res = await api.get(`/orders/track/${cleanNum}`);
      if (res.success && res.tracking) {
        setOrder(res.tracking);
      } else {
        setErrorMsg(res.message || 'Order not found. Please verify your order number.');
        setOrder(null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to find tracking details. Please check your order reference.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialNum = paramOrderNumber || queryOrderNumber;
    if (initialNum) {
      setSearchInput(initialNum);
      fetchTrackingData(initialNum);
    }
  }, [paramOrderNumber, queryOrderNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrackingData(searchInput);
  };

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
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="bg-[#FFF5FA] min-h-[85vh] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-brightPink bg-white px-3 py-1 rounded-full border border-brand-primaryPink/30 shadow-sm">
            Live Delivery Updates
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-deepPurple">
            Track Your ZEBA Order
          </h1>
          <p className="text-xs sm:text-sm text-[#805A82]">
            Enter your ZEBA Order Number (sent via SMS/Email) to check real-time courier and delivery status.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-primaryPink/25 shadow-md">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Package className="w-5 h-5 text-brand-purple absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. ZEBA-20260929-1001"
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-semibold text-brand-darkPurple"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 btn-tactile"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Tracking...' : 'Track Order'}</span>
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-brand-brightPink border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#805A82]">Fetching authoritative tracking records...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && errorMsg && (
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-3 shadow-sm">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="font-bold text-sm">Order Lookup Failed</h3>
            <p className="text-xs max-w-md mx-auto">{errorMsg}</p>
            <div className="pt-2">
              <a
                href={getWhatsAppUrl(`Hi ZEBA Team, I need help tracking my order: ${searchInput}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-white px-4 py-2 rounded-xl border border-emerald-300 hover:bg-emerald-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Contact ZEBA WhatsApp Support</span>
              </a>
            </div>
          </div>
        )}

        {/* Order Details and Live Timeline */}
        {!loading && order && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-primaryPink/30 shadow-xl space-y-8">
            
            {/* Top Order Information Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-primaryPink/20 gap-4">
              <div>
                <span className="text-xs text-[#805A82] font-semibold block">Order Reference</span>
                <span className="font-display font-black text-2xl text-brand-deepPurple">{order.orderNumber}</span>
                <p className="text-xs text-[#805A82] mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isCancelled ? (
                  <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                    Order Cancelled
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase bg-brand-softPink text-brand-brightPink border border-brand-primaryPink/30">
                    Status: {order.status.replace(/_/g, ' ')}
                  </span>
                )}
                <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Cancelled Notice */}
            {isCancelled && (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-rose-800 text-sm">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>This order has been cancelled</span>
                </div>
                {order.cancellationReason && (
                  <p className="text-rose-700"><strong>Cancellation Reason:</strong> {order.cancellationReason}</p>
                )}
                {order.refundStatus && order.refundStatus !== 'not_applicable' && (
                  <p className="text-rose-600 font-semibold">
                    <strong>Refund Status:</strong> {order.refundStatus.toUpperCase()}
                  </p>
                )}
              </div>
            )}

            {/* Status Step Timeline */}
            {!isCancelled && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-brand-deepPurple">Delivery Timeline</h3>
                
                <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-primaryPink/25">
                  {STATUS_STEPS.map((step, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step.key} className="relative flex items-start space-x-3 sm:space-x-4">
                        <div
                          className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                            isPassed
                              ? 'bg-brand-brightPink text-white ring-4 ring-brand-pink/20'
                              : 'bg-white text-slate-400 border border-slate-300'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : idx + 1}
                        </div>

                        <div className="space-y-0.5 pt-0.5">
                          <h4 className={`font-display font-bold text-xs sm:text-sm ${isCurrent ? 'text-brand-brightPink font-extrabold' : isPassed ? 'text-brand-deepPurple' : 'text-slate-400'}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-[#805A82] leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courier & Tracking Details Card */}
            {(order.trackingNumber || order.courierPartner || order.estimatedDeliveryDate) && (
              <div className="p-5 rounded-2xl bg-brand-softPink/60 border border-brand-primaryPink/25 text-xs text-brand-darkPurple space-y-2">
                <div className="flex items-center space-x-2 font-bold text-brand-deepPurple">
                  <Truck className="w-4 h-4 text-brand-brightPink" />
                  <span>Courier & Dispatch Details</span>
                </div>
                {order.courierPartner && (
                  <p><strong>Courier Partner:</strong> {order.courierPartner}</p>
                )}
                {order.trackingNumber && (
                  <p><strong>Waybill / Tracking No.:</strong> <span className="font-mono font-bold text-brand-deepPurple">{order.trackingNumber}</span></p>
                )}
                {order.estimatedDeliveryDate && (
                  <p className="text-emerald-700 font-semibold">
                    <strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            {/* Items and Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-brand-primaryPink/20 text-xs">
              <div>
                <span className="text-[#805A82] font-bold block mb-1">Delivering to:</span>
                <p className="font-bold text-brand-deepPurple">{order.customerName}</p>
                <p className="text-[#805A82]">{order.city}, {order.state}</p>
              </div>

              <div>
                <span className="text-[#805A82] font-bold block mb-1">Ordered Items:</span>
                <div className="space-y-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-brand-deepPurple">
                      <span>{item.productName} ({item.packSize})</span>
                      <span className="font-bold">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-brand-primaryPink/20">
              <Link
                to="/products"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-deepPurple hover:bg-brand-darkPurple text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all btn-tactile"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>

              <a
                href={getWhatsAppUrl(`Hi ZEBA Team, I have a question regarding my order #${order.orderNumber}`)}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md btn-tactile"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Care</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
