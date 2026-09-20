import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, ShoppingBag, DollarSign, Calendar, Eye, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/customers?search=${encodeURIComponent(search)}`);
      if (res.success) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleViewCustomer = async (id) => {
    setCustomerDetailLoading(true);
    try {
      const res = await api.get(`/admin/customers/${id}`);
      if (res.success) {
        setSelectedCustomer(res.customer);
      }
    } catch (err) {
      console.error('Failed to load customer details', err);
    } finally {
      setCustomerDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white">Customer Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">Verified buyers stored in PostgreSQL database</p>
        </div>
        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3.5 py-1.5 rounded-full">
          Total Customers: {customers.length}
        </span>
      </div>

      {/* Search toolbar */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by customer name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-brand-pink outline-none"
        />
      </form>

      {/* Customers Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No customers registered yet. Customer profiles are automatically created upon checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Last Order</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">{c.name}</td>
                    <td className="p-4 text-slate-300">{c.phone}</td>
                    <td className="p-4 text-slate-400">{c.email}</td>
                    <td className="p-4 font-bold text-white">{c.total_orders}</td>
                    <td className="p-4 font-extrabold text-emerald-400">
                      ₹{parseFloat(c.total_spent).toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {c.latest_order_date
                        ? new Date(c.latest_order_date).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleViewCustomer(c.id)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-brand-pink hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-brand-pink transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-lg text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400">{selectedCustomer.email} • {selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Customer Purchase History ({selectedCustomer.orders?.length || 0})
              </h4>

              {selectedCustomer.orders?.length === 0 ? (
                <p className="text-xs text-slate-500">No previous orders found.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedCustomer.orders?.map((o) => (
                    <div key={o.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-white block">{o.order_number}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(o.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-white block">₹{parseFloat(o.total_amount).toFixed(2)}</span>
                        <span className="capitalize text-[10px] text-brand-gold font-bold">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
