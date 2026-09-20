import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  Send,
  BellRing,
  History
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/admin/orders/${id}`);
      if (res.success && res.order) {
        setOrder(res.order);
        setSelectedStatus(res.order.status);
        setSelectedPaymentStatus(res.order.payment_status);
        setOrderNotes(res.order.notes || '');
      }
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/admin/orders/${id}/status`, {
        status: selectedStatus,
        payment_status: selectedPaymentStatus,
        notes: orderNotes,
        notify_customer: notifyCustomer
      });

      if (res.success) {
        addToast(
          notifyCustomer
            ? `Order updated to "${selectedStatus}" & notification dispatched to customer!`
            : 'Order status updated successfully.',
          'success'
        );
        if (res.whatsappLink) {
          setWhatsappLink(res.whatsappLink);
        }
        await fetchOrderDetail();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update order status.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading order details from PostgreSQL...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order not found.</h2>
        <Link to="/admin/orders" className="text-brand-pink text-xs underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const cleanPhone = (order.customer_phone || '').replace(/[^0-9]/g, '');
  const directWhatsAppPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const directWhatsAppUrl = `https://wa.me/${directWhatsAppPhone}?text=${encodeURIComponent(
    `Hi ${order.customer_name}, your ZEBA Order #${order.order_number} status is now: ${order.status.toUpperCase()}.\nTotal: ₹${parseFloat(order.total_amount).toFixed(2)}\n${order.notes ? `Tracking: ${order.notes}\n` : ''}Thank you for choosing ZEBA Periods Pain Relief!`
  )}`;

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/orders"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-black text-2xl text-white">{order.order_number}</h1>
              <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-brand-gold border border-slate-700">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Quick WhatsApp Action Button */}
        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors w-fit"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Customer Update</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Items, Customer, Address, Payment, Notifications */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Ordered Products */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
            <h2 className="font-display font-bold text-base text-white flex items-center space-x-2">
              <Package className="w-4 h-4 text-brand-pink" />
              <span>Ordered Products</span>
            </h2>

            <div className="divide-y divide-slate-800">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.images && item.images.length > 0 ? (typeof item.images === 'string' ? JSON.parse(item.images)[0] : item.images[0]) : '/images/zeba-real-packaging-1.jpg'}
                      alt={item.product_name}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-800 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.product_name}</h4>
                      <span className="text-[11px] text-brand-pink font-semibold block">{item.pack_size}</span>
                      <span className="text-[11px] text-slate-400">Qty: {item.quantity} × ₹{parseFloat(item.unit_price).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-sm text-white">
                    ₹{parseFloat(item.subtotal_price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-bold">₹{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-white font-bold">₹{parseFloat(order.shipping_fee).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="font-display font-black text-brand-pink text-base">
                  ₹{parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Details */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Customer Info</span>
              </h3>
              <div className="text-xs text-slate-300 space-y-1.5">
                <p className="font-bold text-white text-sm">{order.customer_name}</p>
                <p className="flex items-center space-x-1.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{order.customer_phone}</span>
                </p>
                <p className="flex items-center space-x-1.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{order.customer_email}</span>
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                <span>Shipping Address</span>
              </h3>
              <div className="text-xs text-slate-300 space-y-1">
                <p>{order.house_building}</p>
                {order.street && <p>{order.street}</p>}
                {order.area && <p>{order.area}</p>}
                <p className="font-semibold text-white">
                  {order.city}, {order.state} - {order.pincode}
                </p>
                <p className="text-[11px] text-slate-400">{order.country || 'India'}</p>
              </div>
            </div>

          </div>

          {/* Payment & Transaction Info */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Razorpay Transaction Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div>
                <span className="text-[11px] text-slate-500 block">Payment Mode</span>
                <span className="font-bold text-white">{order.payment_method || 'Razorpay Gateway'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Razorpay Order ID</span>
                <span className="font-mono text-slate-400 text-[11px]">{order.razorpay_order_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Razorpay Payment ID</span>
                <span className="font-mono text-emerald-400 text-[11px]">{order.razorpay_payment_id || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Customer Notifications Dispatch History Log */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center space-x-2">
              <BellRing className="w-4 h-4 text-brand-gold" />
              <span>Customer Status Notifications Log ({order.notifications?.length || 0})</span>
            </h3>

            {(!order.notifications || order.notifications.length === 0) ? (
              <p className="text-xs text-slate-500">
                No notification logged yet. When you update the order status above with notification enabled, dispatch records appear here.
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {order.notifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          notif.notification_type === 'whatsapp'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {notif.notification_type}
                        </span>
                        <span className="font-bold text-white uppercase text-[11px]">
                          Status: {notif.status_sent}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(notif.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px] whitespace-pre-line bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 mt-1.5">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Update Order & Payment Status + Notification Dispatch */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6">
          <h2 className="font-display font-bold text-base text-white border-b border-slate-800 pb-3">
            Update Order Status
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Fulfillment Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-pink font-semibold"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped (Dispatched)</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Payment Status</label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-pink font-semibold"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tracking Number / Customer Note</label>
              <textarea
                rows="3"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. DTDC AWB #8492049, estimated delivery in 2 days..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs outline-none focus:border-brand-pink"
              />
            </div>

            {/* Notification Checkbox */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start space-x-2.5">
              <input
                type="checkbox"
                id="notifyCust"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="mt-0.5 rounded text-brand-pink focus:ring-brand-pink"
              />
              <label htmlFor="notifyCust" className="text-[11px] text-slate-300 font-medium cursor-pointer">
                <strong className="text-white block">Notify Customer Automatically</strong>
                Send email & WhatsApp status update to {order.customer_name} ({order.customer_phone})
              </label>
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={saving}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-pink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-pink text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating & Notifying...' : 'Save & Send Status Alert'}</span>
            </button>

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open Sent WhatsApp Message</span>
              </a>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
