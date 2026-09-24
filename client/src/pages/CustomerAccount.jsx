import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  User,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  LogOut,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCart } from '../context/CartContext';
import { businessConfig } from '../config/businessConfig';

export default function CustomerAccount() {
  const { customer, token, isCustomerAuthenticated, loading: authLoading, logout } = useCustomerAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
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
    }

    if (isCustomerAuthenticated) {
      fetchOrders();
    }
  }, [token, isCustomerAuthenticated]);

  if (authLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading your account...
      </div>
    );
  }

  if (!isCustomerAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-[#FAF8FB] py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl pack-navy-gradient text-zeba-gold font-serif-brand font-black text-2xl flex items-center justify-center border border-zeba-gold/40 shadow-md">
              {customer?.name?.charAt(0).toUpperCase() || 'Z'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-black text-2xl text-zeba-navy">
                  Hello, {customer?.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-zeba-lightLavender text-zeba-deepPurple border border-zeba-waffleLilac">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {customer?.email} • {customer?.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              to="/products"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl pack-magenta-gradient text-white font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 text-center transition-all"
            >
              Shop Heating Pads
            </Link>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-xl text-zeba-navy flex items-center space-x-2">
              <Package className="w-5 h-5 text-zeba-magenta" />
              <span>My Order History ({orders.length})</span>
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
            <div className="py-12 text-center text-xs text-slate-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-full bg-brand-softPink text-brand-pink flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-zeba-navy">No Orders Found Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ready to experience discreet, soothing period pain relief? Choose your pack today.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl pack-magenta-gradient text-white font-bold text-xs uppercase tracking-wider shadow-md"
              >
                <span>Browse ZEBA Heating Pads</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 hover:border-zeba-magenta/30 transition-all"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Order Number</span>
                      <span className="font-mono font-bold text-sm text-zeba-navy">{ord.order_number}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.status === 'shipped'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {ord.status}
                      </span>
                      <span className="text-xs font-bold text-zeba-navy">
                        ₹{parseFloat(ord.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="space-y-2">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                        <span className="font-semibold text-zeba-navy">
                          {item.product_name} ({item.pack_size}) × {item.quantity}
                        </span>
                        <span className="font-bold text-zeba-navy">₹{parseFloat(item.subtotal_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking / Notes */}
                  {ord.notes && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-zeba-navy">
                        <Truck className="w-3.5 h-3.5 text-zeba-magenta" />
                        <span>Courier / Tracking Information:</span>
                      </div>
                      <p className="text-slate-600">{ord.notes}</p>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="font-semibold text-emerald-600">Discreet Delivery</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
