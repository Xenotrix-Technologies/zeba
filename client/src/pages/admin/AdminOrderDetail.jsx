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
      <div className="py-20 text-center text-xs text-brand-plum/70">
        Loading order details from PostgreSQL...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-dark">Order not found.</h2>
        <Link to="/admin/orders" className="text-brand-brightPink text-xs underline font-semibold">
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
            className="p-2.5 rounded-xl bg-white border border-brand-primaryPink/25 text-brand-plum hover:text-brand-brightPink hover:border-brand-primaryPink transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-black text-2xl text-brand-dark">{order.order_number}</h1>
              <span className="capitalize px-3 py-0.5 rounded-full text-xs font-bold bg-brand-softPink text-brand-plum border border-brand-primaryPink/30">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-brand-plum/70 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Quick WhatsApp Action Button */}
        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all w-fit"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Customer Update</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Items, Customer, Address, Payment, Notifications */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Ordered Products */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-brand-dark flex items-center space-x-2">
              <Package className="w-4 h-4 text-brand-brightPink" />
              <span>Ordered Products</span>
            </h2>

            <div className="divide-y divide-brand-primaryPink/15">
              {order.items?.map((item) => {
                let itemImage = '/images/zeba-1pack.jpg';
                if (Array.isArray(item.images) && item.images.length > 0) {
                  itemImage = item.images[0];
                } else if (typeof item.images === 'string') {
                  if (item.images.startsWith('[')) {
                    try {
                      const parsed = JSON.parse(item.images);
                      if (Array.isArray(parsed) && parsed.length > 0) itemImage = parsed[0];
                    } catch (e) {
                      itemImage = item.images;
                    }
                  } else {
                    itemImage = item.images;
                  }
                }

                return (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={itemImage || '/images/zeba-1pack.jpg'}
                        alt={item.product_name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/zeba-1pack.jpg';
                        }}
                        className="w-14 h-14 object-cover rounded-xl border border-brand-primaryPink/20 flex-shrink-0 bg-brand-softPink"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-brand-dark">{item.product_name}</h4>
                        <span className="text-[11px] text-brand-brightPink font-semibold block">{item.pack_size}</span>
                        <span className="text-[11px] text-brand-plum/70">Qty: {item.quantity} × ₹{parseFloat(item.unit_price || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right font-extrabold text-sm text-brand-dark">
                      ₹{parseFloat(item.subtotal_price || (item.quantity * item.unit_price) || 0).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-brand-primaryPink/15 space-y-2 text-xs text-brand-plum/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-brand-dark font-bold">₹{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-brand-dark font-bold">₹{parseFloat(order.shipping_fee).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-brand-primaryPink/15 flex justify-between text-sm font-bold text-brand-dark">
                <span>Total Amount</span>
                <span className="font-display font-black text-brand-brightPink text-base">
                  ₹{parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Details */}
            <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-brand-plum/70 flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-brand-brightPink" />
                <span>Customer Info</span>
              </h3>
              <div className="text-xs text-brand-plum space-y-1.5">
                <p className="font-bold text-brand-dark text-sm">{order.customer_name}</p>
                <p className="flex items-center space-x-1.5 text-brand-plum/80">
                  <Phone className="w-3.5 h-3.5 text-brand-primaryPink" />
                  <span>{order.customer_phone}</span>
                </p>
                <p className="flex items-center space-x-1.5 text-brand-plum/80">
                  <Mail className="w-3.5 h-3.5 text-brand-primaryPink" />
                  <span>{order.customer_email}</span>
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-brand-plum/70 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                <span>Shipping Address</span>
              </h3>
              <div className="text-xs text-brand-plum space-y-1">
                <p>{order.house_building}</p>
                {order.street && <p>{order.street}</p>}
                {order.area && <p>{order.area}</p>}
                <p className="font-semibold text-brand-dark">
                  {order.city}, {order.state} - {order.pincode}
                </p>
                <p className="text-[11px] text-brand-plum/60">{order.country || 'India'}</p>
              </div>
            </div>

          </div>

          {/* Payment & Transaction Info */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-plum/70 flex items-center space-x-2">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Transaction Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-brand-plum">
              <div>
                <span className="text-[11px] text-brand-plum/60 block">Payment Mode</span>
                <span className="font-bold text-brand-dark">{order.payment_method || 'Razorpay Gateway'}</span>
              </div>
              <div>
                <span className="text-[11px] text-brand-plum/60 block">Razorpay Order ID</span>
                <span className="font-mono text-brand-plum/80 text-[11px]">{order.razorpay_order_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[11px] text-brand-plum/60 block">Razorpay Payment ID</span>
                <span className="font-mono text-emerald-600 font-semibold text-[11px]">{order.razorpay_payment_id || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Customer Notifications Dispatch History Log */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-brand-dark flex items-center space-x-2">
              <BellRing className="w-4 h-4 text-brand-gold" />
              <span>Customer Status Notifications Log ({order.notifications?.length || 0})</span>
            </h3>

            {(!order.notifications || order.notifications.length === 0) ? (
              <p className="text-xs text-brand-plum/60">
                No notification logged yet. When you update the order status above with notification enabled, dispatch records appear here.
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {order.notifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 rounded-2xl bg-brand-softPink/60 border border-brand-primaryPink/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          notif.notification_type === 'whatsapp'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-brand-primaryPink/20 text-brand-deepPurple border border-brand-primaryPink/40'
                        }`}>
                          {notif.notification_type}
                        </span>
                        <span className="font-bold text-brand-dark uppercase text-[11px]">
                          Status: {notif.status_sent}
                        </span>
                      </div>
                      <span className="text-brand-plum/60 text-[10px]">
                        {new Date(notif.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-brand-dark font-mono text-[11px] whitespace-pre-line bg-white p-2.5 rounded-xl border border-brand-primaryPink/15 mt-1.5">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Update Order & Payment Status + Notification Dispatch */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-6">
          <h2 className="font-display font-bold text-base text-brand-dark border-b border-brand-primaryPink/15 pb-3">
            Update Order Status
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Fulfillment Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-brand-softPink/40 border border-brand-primaryPink/30 text-brand-dark rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-brightPink font-semibold"
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
              <label className="block text-xs font-bold text-brand-dark mb-1">Payment Status</label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full bg-brand-softPink/40 border border-brand-primaryPink/30 text-brand-dark rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-brightPink font-semibold"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Tracking Number / Customer Note</label>
              <textarea
                rows="3"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. DTDC AWB #8492049, estimated delivery in 2 days..."
                className="w-full bg-brand-softPink/40 border border-brand-primaryPink/30 text-brand-dark rounded-xl p-3 text-xs outline-none focus:border-brand-brightPink"
              />
            </div>

            {/* Notification Checkbox */}
            <div className="p-3 rounded-xl bg-brand-softPink/60 border border-brand-primaryPink/25 flex items-start space-x-2.5">
              <input
                type="checkbox"
                id="notifyCust"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="mt-0.5 rounded text-brand-brightPink focus:ring-brand-brightPink accent-brand-brightPink"
              />
              <label htmlFor="notifyCust" className="text-[11px] text-brand-plum font-medium cursor-pointer">
                <strong className="text-brand-dark block">Notify Customer Automatically</strong>
                Send email & WhatsApp status update to {order.customer_name} ({order.customer_phone})
              </label>
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={saving}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-brightPink/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating & Notifying...' : 'Save & Send Status Alert'}</span>
            </button>

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
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
