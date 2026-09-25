import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        status: statusFilter,
        payment_status: paymentFilter,
        search
      });

      const res = await api.get(`/admin/orders?${params.toString()}`);
      if (res.success) {
        setOrders(res.orders);
        setTotal(res.total);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-deepPurple">Order Management</h1>
          <p className="text-xs text-[#805A82] mt-0.5">Manage customer orders, track shipments, and review payments</p>
        </div>
        <span className="text-xs font-bold text-brand-deepPurple bg-white border border-brand-primaryPink/30 px-3.5 py-1.5 rounded-full w-fit shadow-sm">
          Total Orders: {total}
        </span>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-primaryPink/25 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#805A82] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by order #, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/30 text-xs text-brand-darkPurple placeholder-[#805A82]/60 focus:border-brand-brightPink focus:bg-white outline-none transition-colors"
          />
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#805A82] font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-brightPink font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#805A82] font-semibold">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-brightPink font-medium"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-brand-primaryPink/25 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#805A82]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#805A82]">
            No matching orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-darkPurple">
              <thead className="bg-[#FFF5FA] text-[#805A82] uppercase font-bold text-[10px] tracking-wider border-b border-brand-primaryPink/20">
                <tr>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Product(s)</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-primaryPink/15">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-softPink/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-deepPurple">
                      <Link to={`/admin/orders/${order.id}`} className="hover:text-brand-brightPink transition-colors">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="p-4 font-bold text-brand-deepPurple">{order.customer_name}</td>
                    <td className="p-4 text-[#805A82]">{order.customer_phone}</td>
                    <td className="p-4 max-w-xs truncate text-brand-darkPurple">
                      {order.products_summary || `${order.total_items} item(s)`}
                    </td>
                    <td className="p-4 font-extrabold text-brand-deepPurple">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-softPink text-brand-deepPurple border border-brand-primaryPink/30">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-[#805A82] whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-brand-brightPink hover:text-white px-3 py-1.5 rounded-xl bg-brand-softPink hover:bg-brand-brightPink transition-colors border border-brand-primaryPink/25"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-brand-primaryPink/20 flex items-center justify-between text-xs text-[#805A82] bg-[#FFF5FA]">
            <span>Page {page} of {totalPages}</span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-white border border-brand-primaryPink/30 hover:bg-brand-softPink disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-white border border-brand-primaryPink/30 hover:bg-brand-softPink disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
