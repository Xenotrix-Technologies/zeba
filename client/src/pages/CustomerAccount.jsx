import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Package,
  Truck,
  LogOut,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useToast } from '../context/ToastContext';
import { businessConfig } from '../config/businessConfig';

export default function CustomerAccount() {
  const { customer, token, isCustomerAuthenticated, loading: authLoading, logout } = useCustomerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await api.get('/customer/orders');
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to load customer orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isCustomerAuthenticated) {
      fetchOrders();
    }
  }, [token, isCustomerAuthenticated]);

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setCancellingOrderId(cancelModalOrder.id);
    try {
      const res = await api.post(`/orders/${cancelModalOrder.order_number}/cancel`, {
        reason: cancelReason || 'Customer cancelled via account dashboard',
        phone: customer?.phone || cancelModalOrder?.customer_phone,
        email: customer?.email || cancelModalOrder?.customer_email
      });
      if (res.success) {
        addToast(`Order #${cancelModalOrder.order_number} has been cancelled.`, 'success');
        setCancelModalOrder(null);
        setCancelReason('');
        await fetchOrders();
      }
    } catch (err) {
      addToast(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="py-20 text-center text-xs text-[#805A82]">
        Loading your account...
      </div>
    );
  }

  if (!isCustomerAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-purple-50 text-brand-deepPurple border-purple-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'confirmed':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="bg-[#FFF5FA] py-10 sm:py-14 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-primaryPink/25 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5F3F68] to-[#805A82] text-brand-gold font-serif-brand font-black text-2xl flex items-center justify-center border border-brand-gold/40 shadow-md">
              {customer?.name?.charAt(0).toUpperCase() || 'Z'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-black text-2xl text-brand-deepPurple">
                  Hello, {customer?.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-softPink text-brand-deepPurple border border-brand-primaryPink/30">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-[#805A82] mt-1">
                {customer?.email} • {customer?.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              to="/products"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 text-center transition-all btn-tactile"
            >
              Shop Heating Pads
            </Link>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-2.5 rounded-xl bg-brand-softPink hover:bg-rose-50 text-[#805A82] hover:text-rose-600 transition-colors border border-brand-primaryPink/20"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-xl text-brand-deepPurple flex items-center space-x-2">
              <Package className="w-5 h-5 text-brand-brightPink" />
              <span>My Orders ({orders.length})</span>
            </h2>
            <a
              href={businessConfig.whatsapp.getWhatsAppUrl('Hi ZEBA Team, I have a question about my order')}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Need Help With An Order?</span>
            </a>
          </div>

          {loadingOrders ? (
            <div className="py-12 text-center text-xs text-[#805A82]">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-brand-primaryPink/25 shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-full bg-brand-softPink text-brand-brightPink flex items-center justify-center mx-auto border border-brand-primaryPink/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-deepPurple">No Orders Found Yet</h3>
              <p className="text-xs text-[#805A82] max-w-sm mx-auto">
                Ready to experience discreet, soothing period pain relief? Choose your pack today.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white font-bold text-xs uppercase tracking-wider shadow-md btn-tactile"
              >
                <span>Browse ZEBA Heating Pads</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const isEligibleForCancel = ['pending', 'confirmed'].includes(ord.status);
                const isExpanded = !!expandedOrders[ord.id];

                return (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl p-6 border border-brand-primaryPink/25 shadow-sm space-y-4 hover:border-brand-primaryPink transition-all"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brand-primaryPink/15 gap-2">
                      <div>
                        <span className="text-[11px] text-[#805A82] block font-semibold">Order Number</span>
                        <span className="font-mono font-bold text-sm text-brand-deepPurple">{ord.order_number}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                        <span className="text-sm font-extrabold text-brand-deepPurple">
                          ₹{parseFloat(ord.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Items in this order */}
                    <div className="space-y-2">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-brand-darkPurple">
                          <span className="font-semibold text-brand-deepPurple">
                            {item.product_name} ({item.pack_size}) × {item.quantity}
                          </span>
                          <span className="font-bold text-brand-deepPurple">₹{parseFloat(item.subtotal_price || (item.quantity * item.unit_price) || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking / Courier Information */}
                    {(ord.tracking_number || ord.courier_partner || ord.notes) && (
                      <div className="p-3.5 rounded-2xl bg-brand-softPink/50 border border-brand-primaryPink/20 text-xs text-brand-darkPurple space-y-1.5">
                        <div className="flex items-center space-x-1.5 font-bold text-brand-deepPurple">
                          <Truck className="w-3.5 h-3.5 text-brand-brightPink" />
                          <span>Delivery & Courier Information:</span>
                        </div>
                        {ord.courier_partner && (
                          <p className="text-xs text-[#805A82]"><strong>Courier:</strong> {ord.courier_partner}</p>
                        )}
                        {ord.tracking_number && (
                          <p className="text-xs text-[#805A82]"><strong>Tracking Number:</strong> <span className="font-mono font-bold text-brand-deepPurple">{ord.tracking_number}</span></p>
                        )}
                        {ord.estimated_delivery_date && (
                          <p className="text-xs text-emerald-700"><strong>Estimated Delivery:</strong> {new Date(ord.estimated_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        )}
                        {ord.notes && (
                          <p className="text-xs text-[#805A82]">{ord.notes}</p>
                        )}
                      </div>
                    )}

                    {/* Cancellation details if cancelled */}
                    {ord.status === 'cancelled' && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                        <div className="flex items-center space-x-1.5 font-bold text-rose-800">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Order Cancelled</span>
                        </div>
                        {ord.cancellation_reason && (
                          <p className="text-rose-700">Reason: {ord.cancellation_reason}</p>
                        )}
                        {ord.payment_status === 'paid' && (
                          <p className="text-rose-600 text-[11px] font-semibold">Refund Status: {ord.refund_status || 'REQUESTED'}</p>
                        )}
                      </div>
                    )}

                    {/* Order Timeline History Toggle */}
                    {ord.statusHistory && ord.statusHistory.length > 0 && (
                      <div className="pt-2 border-t border-brand-primaryPink/10">
                        <button
                          onClick={() => toggleExpand(ord.id)}
                          className="flex items-center space-x-1.5 text-xs font-bold text-brand-brightPink hover:underline"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Status Timeline' : 'View Status Timeline'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 pl-4 space-y-2.5 border-l-2 border-brand-primaryPink/30 text-xs">
                            {ord.statusHistory.map((h, hIdx) => (
                              <div key={h.id || hIdx} className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold uppercase text-brand-deepPurple text-[11px]">{h.new_status}</span>
                                  <span className="text-[10px] text-[#805A82]">
                                    {new Date(h.created_at).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                {h.notes && <p className="text-[11px] text-[#805A82]">{h.notes}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Row */}
                    <div className="text-[11px] text-[#805A82] flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-brand-primaryPink/10 gap-2">
                      <span>Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      
                      <div className="flex items-center space-x-3">
                        {isEligibleForCancel && (
                          <button
                            onClick={() => setCancelModalOrder(ord)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                        <span className="font-semibold text-emerald-600">Discreet Packaging</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-deepPurple/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-brand-primaryPink/30 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-brand-dark">Cancel Order?</h3>
                <p className="text-xs text-[#805A82]">Order #{cancelModalOrder.order_number}</p>
              </div>
            </div>

            <p className="text-xs text-brand-plum leading-relaxed">
              Are you sure you want to cancel this order? If you paid online, any eligible refund will be automatically scheduled.
            </p>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Reason for cancellation (optional)</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Ordered by mistake, changed mind..."
                className="w-full bg-brand-softPink/40 border border-brand-primaryPink/30 text-brand-dark rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-brightPink"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { setCancelModalOrder(null); setCancelReason(''); }}
                className="flex-1 py-2.5 rounded-xl border border-brand-primaryPink/30 text-xs font-bold text-brand-plum hover:bg-brand-softPink transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancellingOrderId === cancelModalOrder.id}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {cancellingOrderId === cancelModalOrder.id ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
