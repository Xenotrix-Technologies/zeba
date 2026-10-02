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
  History,
  Calendar,
  RefreshCw,
  XCircle
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
  const [selectedRefundStatus, setSelectedRefundStatus] = useState('not_applicable');
  const [courierPartner, setCourierPartner] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/admin/orders/${id}`);
      if (res.success && res.order) {
        const o = res.order;
        setOrder(o);
        setSelectedStatus(o.status);
        setSelectedPaymentStatus(o.payment_status);
        setSelectedRefundStatus(o.refund_status || 'not_applicable');
        setCourierPartner(o.courier_partner || '');
        setTrackingNumber(o.tracking_number || '');
        setEstimatedDeliveryDate(o.estimated_delivery_date ? o.estimated_delivery_date.split('T')[0] : '');
        setOrderNotes(o.notes || '');
        setCancellationReason(o.cancellation_reason || '');
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
        refund_status: selectedRefundStatus,
        courier_partner: courierPartner,
        tracking_number: trackingNumber,
        estimated_delivery_date: estimatedDeliveryDate || null,
        notes: orderNotes,
        cancellation_reason: cancellationReason,
        notify_customer: notifyCustomer
      });

      if (res.success) {
        addToast(
          notifyCustomer && selectedStatus !== order.status
            ? `Order updated to "${selectedStatus}" & notification dispatched to customer!`
            : 'Order details saved successfully.',
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

  const [retrying, setRetrying] = useState(false);
  const [sendingType, setSendingType] = useState(null);

  const handleResendEmail = async (emailType) => {
    setSendingType(emailType);
    try {
      const res = await api.post(`/admin/orders/${order.id}/resend-email`, { emailType });
      if (res.success) {
        addToast(`Email [${emailType}] successfully sent to customer and admin!`, 'success');
        await fetchOrderDetail();
      } else {
        addToast(res.message || 'Failed to send email.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to send email.', 'error');
    } finally {
      setSendingType(null);
    }
  };

  const handleRetryEmails = async () => {
    setRetrying(true);
    try {
      const res = await api.post('/admin/emails/retry', { limit: 5 });
      if (res.success) {
        addToast(`Email retry completed (${res.processedCount || 0} processed).`, 'success');
        await fetchOrderDetail();
      } else {
        addToast(res.error || 'Email retry failed.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to retry emails.', 'error');
    } finally {
      setRetrying(false);
    }
  };


  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-brand-plum/70">
        Loading order details...
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
              <span className={`capitalize px-3 py-0.5 rounded-full text-xs font-bold border ${
                order.status === 'delivered'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : order.status === 'cancelled'
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-brand-softPink text-brand-plum border-brand-primaryPink/30'
              }`}>
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
        
        {/* Left Column: Items, Customer, Address, Payment, Timeline History, Notifications */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Ordered Products */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-brand-dark flex items-center space-x-2">
              <Package className="w-4 h-4 text-brand-brightPink" />
              <span>Ordered Products (Historical Frozen Prices)</span>
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

          {/* Payment & Refund Details */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-plum/70 flex items-center space-x-2">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payment & Gateway Status</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-brand-plum">
              <div>
                <span className="text-[11px] text-brand-plum/60 block">Payment Mode</span>
                <span className="font-bold text-brand-dark">{order.payment_method || 'Razorpay Gateway'}</span>
              </div>
              <div>
                <span className="text-[11px] text-brand-plum/60 block">Payment Status</span>
                <span className="font-bold uppercase text-emerald-700">{order.payment_status}</span>
              </div>
              <div>
                <span className="text-[11px] text-brand-plum/60 block">Refund Status</span>
                <span className="font-bold uppercase text-purple-700">{order.refund_status || 'NOT_APPLICABLE'}</span>
              </div>
              <div>
                <span className="text-[11px] text-brand-plum/60 block">Razorpay Payment ID</span>
                <span className="font-mono text-emerald-600 font-semibold text-[11px]">{order.razorpay_payment_id || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Status History Audit Timeline */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-brand-dark flex items-center space-x-2">
              <History className="w-4 h-4 text-brand-brightPink" />
              <span>Order Status Audit Trail ({order.statusHistory?.length || 0})</span>
            </h3>

            {(!order.statusHistory || order.statusHistory.length === 0) ? (
              <p className="text-xs text-brand-plum/60">No status transitions logged yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-primaryPink/30">
                {order.statusHistory.map((hist, idx) => (
                  <div key={hist.id || idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-brand-brightPink border-2 border-white shadow-sm" />
                    <div className="text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold uppercase text-brand-dark">{hist.new_status}</span>
                        {hist.previous_status && (
                          <span className="text-[10px] text-brand-plum/60">(from {hist.previous_status})</span>
                        )}
                        <span className="text-[10px] bg-brand-softPink px-2 py-0.5 rounded-full font-semibold text-brand-deepPurple">
                          by {hist.changed_by}
                        </span>
                      </div>
                      <span className="text-[10px] text-brand-plum/60 block mt-0.5">
                        {new Date(hist.created_at).toLocaleString('en-IN')}
                      </span>
                      {hist.notes && (
                        <p className="text-xs text-brand-darkPurple mt-1 bg-[#FFF5FA] p-2 rounded-lg border border-brand-primaryPink/15">
                          {hist.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Notifications Status Matrix (Section 10) */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-brand-dark flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-brightPink" />
                <span>Email Notifications</span>
              </h3>
              {order.emailNotifications?.some(e => e.status === 'failed') && (
                <button
                  onClick={handleRetryEmails}
                  disabled={retrying}
                  className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                  <span>Retry Failed</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Order Confirmation */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8FA] border border-brand-primaryPink/15 flex flex-col justify-between gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">Order Confirmation</span>
                    <span className="text-[10px] text-brand-plum/60">Sent to customer & admin</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shrink-0 ${
                    order.emailStatusSummary?.orderConfirmation === 'sent' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    order.emailStatusSummary?.orderConfirmation === 'failed' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                    'bg-brand-softPink text-brand-plum border-brand-primaryPink/30'
                  }`}>
                    {order.emailStatusSummary?.orderConfirmation || 'Not Sent'}
                  </span>
                </div>
                <div className="flex justify-end pt-1 border-t border-brand-primaryPink/10">
                  <button
                    onClick={() => handleResendEmail('order_confirmation')}
                    disabled={sendingType === 'order_confirmation'}
                    className="px-2.5 py-1 rounded-lg bg-brand-softPink hover:bg-brand-primaryPink/20 text-brand-deepPurple text-[11px] font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className={`w-3 h-3 ${sendingType === 'order_confirmation' ? 'animate-spin' : ''}`} />
                    <span>{sendingType === 'order_confirmation' ? 'Sending...' : 'Send / Resend'}</span>
                  </button>
                </div>
              </div>

              {/* Payment Confirmation */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8FA] border border-brand-primaryPink/15 flex flex-col justify-between gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">Payment Confirmation</span>
                    <span className="text-[10px] text-brand-plum/60">Sent to customer & admin</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shrink-0 ${
                    order.emailStatusSummary?.paymentConfirmation === 'sent' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    order.emailStatusSummary?.paymentConfirmation === 'failed' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                    'bg-brand-softPink text-brand-plum border-brand-primaryPink/30'
                  }`}>
                    {order.emailStatusSummary?.paymentConfirmation || 'Not Sent'}
                  </span>
                </div>
                <div className="flex justify-end pt-1 border-t border-brand-primaryPink/10">
                  <button
                    onClick={() => handleResendEmail('payment_confirmation')}
                    disabled={sendingType === 'payment_confirmation'}
                    className="px-2.5 py-1 rounded-lg bg-brand-softPink hover:bg-brand-primaryPink/20 text-brand-deepPurple text-[11px] font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className={`w-3 h-3 ${sendingType === 'payment_confirmation' ? 'animate-spin' : ''}`} />
                    <span>{sendingType === 'payment_confirmation' ? 'Sending...' : 'Send / Resend'}</span>
                  </button>
                </div>
              </div>

              {/* Status Update */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8FA] border border-brand-primaryPink/15 flex flex-col justify-between gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">Status Update</span>
                    <span className="text-[10px] text-brand-plum/60">Sent upon status change</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shrink-0 ${
                    order.emailStatusSummary?.statusUpdate === 'sent' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    order.emailStatusSummary?.statusUpdate === 'failed' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                    'bg-brand-softPink text-brand-plum border-brand-primaryPink/30'
                  }`}>
                    {order.emailStatusSummary?.statusUpdate || 'Not Sent'}
                  </span>
                </div>
                <div className="flex justify-end pt-1 border-t border-brand-primaryPink/10">
                  <button
                    onClick={() => handleResendEmail('status_update')}
                    disabled={sendingType === 'status_update'}
                    className="px-2.5 py-1 rounded-lg bg-brand-softPink hover:bg-brand-primaryPink/20 text-brand-deepPurple text-[11px] font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className={`w-3 h-3 ${sendingType === 'status_update' ? 'animate-spin' : ''}`} />
                    <span>{sendingType === 'status_update' ? 'Sending...' : 'Send / Resend'}</span>
                  </button>
                </div>
              </div>

              {/* Cancellation */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8FA] border border-brand-primaryPink/15 flex flex-col justify-between gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">Order Cancellation</span>
                    <span className="text-[10px] text-brand-plum/60">Sent if cancelled</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shrink-0 ${
                    order.emailStatusSummary?.cancellation === 'sent' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    order.emailStatusSummary?.cancellation === 'failed' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                    'bg-brand-softPink text-brand-plum border-brand-primaryPink/30'
                  }`}>
                    {order.emailStatusSummary?.cancellation || 'Not Applicable'}
                  </span>
                </div>
                {order.status === 'cancelled' && (
                  <div className="flex justify-end pt-1 border-t border-brand-primaryPink/10">
                    <button
                      onClick={() => handleResendEmail('cancellation')}
                      disabled={sendingType === 'cancellation'}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                    >
                      <Send className={`w-3 h-3 ${sendingType === 'cancellation' ? 'animate-spin' : ''}`} />
                      <span>{sendingType === 'cancellation' ? 'Sending...' : 'Resend Cancellation'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Individual Email Event Logs */}
            {order.emailNotifications && order.emailNotifications.length > 0 && (
              <div className="pt-2 border-t border-brand-primaryPink/15 space-y-2">
                <span className="text-[11px] font-bold text-brand-plum block uppercase tracking-wider">Email Dispatch Logs</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {order.emailNotifications.map(evt => (
                    <div key={evt.id} className="p-2.5 rounded-xl bg-brand-softPink/30 border border-brand-primaryPink/15 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <strong className="text-brand-dark truncate">{evt.notification_type || evt.event_type}</strong>
                          <span className="text-[10px] text-brand-plum/60">&bull; {evt.recipient_email}</span>
                        </div>
                        {evt.error_message && (
                          <p className="text-[11px] text-rose-600 mt-0.5 break-words">
                            ⚠️ {evt.error_message}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          evt.status === 'sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          evt.status === 'failed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {evt.status}
                        </span>
                        <span className="text-[10px] text-brand-plum/50 block mt-0.5">
                          {new Date(evt.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Notifications Dispatch History Log */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/20 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-brand-dark flex items-center space-x-2">
              <BellRing className="w-4 h-4 text-brand-gold" />
              <span>Transactional Notifications Dispatch History ({order.notifications?.length || 0})</span>
            </h3>

            {(!order.notifications || order.notifications.length === 0) ? (
              <p className="text-xs text-brand-plum/60">
                No notification logged yet. When order status updates are triggered, records appear here.
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {order.notifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 rounded-2xl bg-brand-softPink/60 border border-brand-primaryPink/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          notif.notification_type?.includes('whatsapp')
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

        {/* Right Column: Update Order & Payment Status + Courier Dispatch */}
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
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out For Delivery</option>
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
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Refund Status</label>
              <select
                value={selectedRefundStatus}
                onChange={(e) => setSelectedRefundStatus(e.target.value)}
                className="w-full bg-brand-softPink/40 border border-brand-primaryPink/30 text-brand-dark rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-brightPink font-semibold"
              >
                <option value="not_applicable">Not Applicable</option>
                <option value="requested">Requested</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Courier Dispatch Tracking Fields */}
            <div className="pt-2 border-t border-brand-primaryPink/15 space-y-3">
              <h3 className="text-xs font-bold text-brand-dark flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-brightPink" />
                <span>Courier Tracking Details</span>
              </h3>

              <div>
                <label className="block text-[11px] font-semibold text-brand-plum mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  placeholder="e.g. DTDC, Blue Dart, Delhivery"
                  className="w-full bg-brand-softPink/40 border border-brand-primaryPink/30 text-brand-dark rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-brightPink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-plum mb-1">AWB / Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 748291039"
                  className="w-full bg-brand-softPink/40 border border-brand-primaryPink/30 text-brand-dark rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-brightPink font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-plum mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="w-full bg-brand-softPink/40 border border-brand-primaryPink/30 text-brand-dark rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-brightPink"
                />
              </div>
            </div>

            {selectedStatus === 'cancelled' && (
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">Cancellation Reason</label>
                <input
                  type="text"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Reason for order cancellation..."
                  className="w-full bg-rose-50 border border-rose-200 text-rose-900 rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Admin Notes / Remarks</label>
              <textarea
                rows="2"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Internal notes or customer notes..."
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
                Send email & WhatsApp status update to {order.customer_name}
              </label>
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={saving}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-brightPink/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Send Status Alert'}</span>
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
