import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  CheckCircle2,
  ArrowRight,
  Package,
  Eye
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-brightPink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#805A82]">Loading PostgreSQL live metrics...</p>
      </div>
    );
  }

  const { metrics, recentOrders } = data || { metrics: {}, recentOrders: [] };

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-deepPurple">Live Store Overview</h1>
          <p className="text-xs text-[#805A82] mt-0.5">Real-time metrics calculated dynamically from PostgreSQL database</p>
        </div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-brand-softPink text-brand-deepPurple text-xs font-bold border border-brand-primaryPink/30 transition-colors shadow-sm w-fit btn-tactile"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-4 h-4 text-brand-brightPink" />
        </Link>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#805A82] text-xs font-bold">
            <span>Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-brand-deepPurple">
            ₹{metrics.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> From {metrics.paidOrders} verified paid orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#805A82] text-xs font-bold">
            <span>Total Orders</span>
            <div className="p-2 rounded-xl bg-brand-softPink text-brand-brightPink border border-brand-primaryPink/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-brand-deepPurple">
            {metrics.totalOrders}
          </div>
          <span className="text-[11px] text-[#805A82]">
            {metrics.confirmedOrders + metrics.processingOrders} in progress
          </span>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#805A82] text-xs font-bold">
            <span>Total Customers</span>
            <div className="p-2 rounded-xl bg-purple-50 text-brand-deepPurple border border-purple-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-brand-deepPurple">
            {metrics.totalCustomers}
          </div>
          <span className="text-[11px] text-[#805A82]">
            Unique verified buyers
          </span>
        </div>

        {/* Active Products */}
        <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#805A82] text-xs font-bold">
            <span>Active Products</span>
            <div className="p-2 rounded-xl bg-[#FDF5D6] text-brand-gold border border-brand-gold/40">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-brand-deepPurple">
            {metrics.totalProducts} <span className="text-xs font-normal text-[#805A82]">(1-Pack & 3-Pack)</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            All variants in stock
          </span>
        </div>

      </div>

      {/* Orders Status Grid */}
      <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/25 shadow-sm space-y-4">
        <h2 className="font-display font-bold text-base text-brand-deepPurple">Orders Breakdown by Status</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/20 text-center">
            <span className="text-xs text-[#805A82] block font-semibold">Pending</span>
            <span className="text-xl font-extrabold text-amber-600 mt-1 block">{metrics.pendingOrders}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/20 text-center">
            <span className="text-xs text-[#805A82] block font-semibold">Confirmed</span>
            <span className="text-xl font-extrabold text-brand-deepPurple mt-1 block">{metrics.confirmedOrders}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/20 text-center">
            <span className="text-xs text-[#805A82] block font-semibold">Processing</span>
            <span className="text-xl font-extrabold text-purple-700 mt-1 block">{metrics.processingOrders}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/20 text-center">
            <span className="text-xs text-[#805A82] block font-semibold">Shipped</span>
            <span className="text-xl font-extrabold text-teal-700 mt-1 block">{metrics.shippedOrders}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/20 text-center">
            <span className="text-xs text-[#805A82] block font-semibold">Delivered</span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{metrics.deliveredOrders}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/20 text-center">
            <span className="text-xs text-[#805A82] block font-semibold">Cancelled</span>
            <span className="text-xl font-extrabold text-rose-600 mt-1 block">{metrics.cancelledOrders}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-brand-primaryPink/25 overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex items-center justify-between pb-2 border-b border-brand-primaryPink/15">
          <div>
            <h2 className="font-display font-bold text-base text-brand-deepPurple">Recent Store Orders</h2>
            <p className="text-xs text-[#805A82]">Latest customer checkouts placed in PostgreSQL</p>
          </div>
          <Link to="/admin/orders" className="text-xs text-brand-brightPink hover:underline font-bold">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-[#805A82] text-xs">
            No customer orders placed yet. As customers complete checkout, their orders will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-darkPurple">
              <thead className="bg-[#FFF5FA] text-[#805A82] uppercase font-bold text-[10px] tracking-wider border-b border-brand-primaryPink/20">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Order Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-primaryPink/15">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-softPink/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-deepPurple">{order.order_number}</td>
                    <td className="p-3">
                      <div className="font-bold text-brand-deepPurple">{order.customer_name}</div>
                      <div className="text-[#805A82] text-[11px]">{order.customer_phone}</div>
                    </td>
                    <td className="p-3 font-extrabold text-brand-deepPurple">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-softPink text-brand-deepPurple border border-brand-primaryPink/30">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#805A82]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center space-x-1 text-brand-brightPink hover:text-brand-deepPink font-bold p-1 rounded-lg hover:bg-brand-softPink transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
