import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Phone, Mail, ShoppingBag, DollarSign, Calendar, Eye, X, RefreshCw, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import Pagination from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);

  const { addToast } = useToast();

  const fetchCustomers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (search.trim()) {
        params.append('search', search.trim());
      }
      const res = await api.get(`/admin/customers?${params.toString()}`);
      if (res.success && Array.isArray(res.customers)) {
        setCustomers(res.customers);
        setTotal(res.total ?? res.count ?? res.customers.length);
        setTotalPages(res.totalPages || Math.max(1, Math.ceil((res.total || res.customers.length) / limit)));
      }
    } catch (err) {
      console.error('Failed to load customers from database', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  /**
   * Export customers matching current filters directly to an Excel (.xlsx) file
   */
  const handleExportExcel = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10000',
        export: 'true'
      });
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await api.get(`/admin/customers?${params.toString()}`);
      const rawCustomers = (res.success && Array.isArray(res.customers)) ? res.customers : customers;

      if (!rawCustomers || rawCustomers.length === 0) {
        if (addToast) addToast('No customers found to export', 'error');
        return;
      }

      // Format data cleanly for spreadsheet columns
      const excelData = rawCustomers.map((c, idx) => {
        const joinedDate = c.created_at ? new Date(c.created_at) : new Date();
        const formattedJoined = joinedDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        const latestOrder = c.latest_order_date
          ? new Date(c.latest_order_date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          : 'No orders yet';

        return {
          '#': idx + 1,
          'Customer ID': c.id,
          'Customer Name': c.name || 'N/A',
          'Phone': c.phone || 'N/A',
          'Email': c.email || 'N/A',
          'Primary Address': c.primary_address || 'N/A',
          'City': c.city || 'N/A',
          'State': c.state || 'N/A',
          'Pincode': c.pincode || 'N/A',
          'Total Orders': Number(c.total_orders) || 0,
          'Total Spent (₹)': Number(c.total_spent) || 0,
          'Latest Order Date': latestOrder,
          'Joined Date': formattedJoined
        };
      });

      // Build worksheet and set column widths
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet['!cols'] = [
        { wch: 5 },  // #
        { wch: 14 }, // Customer ID
        { wch: 24 }, // Customer Name
        { wch: 16 }, // Phone
        { wch: 28 }, // Email
        { wch: 42 }, // Primary Address
        { wch: 16 }, // City
        { wch: 16 }, // State
        { wch: 12 }, // Pincode
        { wch: 14 }, // Total Orders
        { wch: 16 }, // Total Spent (₹)
        { wch: 18 }, // Latest Order Date
        { wch: 16 }  // Joined Date
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

      const nowStr = new Date().toISOString().slice(0, 10);
      const filename = search.trim()
        ? `Zeba_Customers_${search.trim()}_${nowStr}.xlsx`
        : `Zeba_Customers_Export_${nowStr}.xlsx`;

      XLSX.writeFile(workbook, filename);

      if (addToast) {
        addToast(`Successfully exported ${excelData.length} customer${excelData.length === 1 ? '' : 's'} to Excel!`, 'success');
      }
    } catch (err) {
      console.error('Failed to export customers to excel:', err);
      if (addToast) {
        addToast('Export failed: ' + (err.message || 'Unknown error'), 'error');
      }
    } finally {
      setExporting(false);
    }
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
          <h1 className="font-display font-black text-2xl text-brand-dark">Customer Directory</h1>
          <p className="text-xs text-brand-plum/70 mt-0.5">Verified buyers and registered accounts</p>
        </div>
        <div className="flex items-center space-x-2.5 flex-wrap sm:flex-nowrap">
          {/* Export to Excel Button */}
          <button
            onClick={handleExportExcel}
            disabled={exporting || total === 0}
            className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border shadow-sm transition-all cursor-pointer ${
              exporting
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-80 cursor-wait'
                : total === 0
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-emerald-600 hover:shadow-md active:scale-95'
            }`}
            title={total === 0 ? 'No customers to export' : 'Export customer directory to Excel (.xlsx)'}
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>

          <button
            onClick={() => fetchCustomers()}
            disabled={refreshing || loading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-brand-softPink text-brand-deepPurple text-xs font-bold border border-brand-primaryPink/30 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh customer list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-brightPink ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <span className="text-xs font-bold text-brand-deepPurple bg-brand-softPink border border-brand-primaryPink/30 px-3.5 py-1.5 rounded-full shadow-sm">
            Total Customers: {total}
          </span>
        </div>
      </div>

      {/* Search toolbar */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="w-4 h-4 text-brand-plum/50 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by customer name, email, phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-brand-primaryPink/25 text-xs text-brand-dark placeholder-brand-plum/50 focus:border-brand-brightPink outline-none shadow-sm transition-all"
        />
      </form>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-brand-primaryPink/20 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-brand-plum/70">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-xs text-brand-plum/60">
            No customers registered yet. Customer profiles are automatically created upon checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-plum">
              <thead className="bg-brand-softPink/60 text-brand-deepPurple uppercase font-bold text-[10px] tracking-wider border-b border-brand-primaryPink/15">
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
              <tbody className="divide-y divide-brand-primaryPink/15">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-softPink/30 transition-colors">
                    <td className="p-4 font-bold text-brand-dark">{c.name}</td>
                    <td className="p-4 text-brand-plum">{c.phone}</td>
                    <td className="p-4 text-brand-plum/70">{c.email}</td>
                    <td className="p-4 font-bold text-brand-dark">{c.total_orders}</td>
                    <td className="p-4 font-extrabold text-emerald-700">
                      ₹{parseFloat(c.total_spent).toFixed(2)}
                    </td>
                    <td className="p-4 text-brand-plum/70 whitespace-nowrap">
                      {c.latest_order_date
                        ? new Date(c.latest_order_date).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleViewCustomer(c.id)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-brand-brightPink hover:text-white px-3 py-1.5 rounded-xl bg-brand-softPink hover:bg-brand-brightPink border border-brand-primaryPink/30 transition-colors"
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

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          label="customers"
        />
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <div className="bg-white border border-brand-primaryPink/25 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-brand-primaryPink/15">
              <div>
                <h3 className="font-display font-bold text-lg text-brand-dark">{selectedCustomer.name}</h3>
                <p className="text-xs text-brand-plum/70">{selectedCustomer.email} • {selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg bg-brand-softPink text-brand-plum hover:text-brand-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-plum/70">
                Customer Purchase History ({selectedCustomer.orders?.length || 0})
              </h4>

              {selectedCustomer.orders?.length === 0 ? (
                <p className="text-xs text-brand-plum/60">No previous orders found.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedCustomer.orders?.map((o) => (
                    <div key={o.id} className="p-3 rounded-xl bg-brand-softPink/40 border border-brand-primaryPink/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-brand-dark block">{o.order_number}</span>
                        <span className="text-[11px] text-brand-plum/70">
                          {new Date(o.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-brand-dark block">₹{parseFloat(o.total_amount).toFixed(2)}</span>
                        <span className="capitalize text-[10px] text-brand-brightPink font-bold">{o.status}</span>
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
