import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Calendar, ArrowUpDown, X, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import Pagination from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState(''); // 'YYYY-MM-DD'
  const [sortOrder, setSortOrder] = useState('DESC'); // 'DESC' | 'ASC'
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const { addToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
        payment_status: paymentFilter,
        search,
        sortBy: 'created_at',
        sortOrder
      });

      if (dateFilter && dateFilter.trim() !== '') {
        params.append('date', dateFilter);
      }

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
  }, [page, limit, statusFilter, paymentFilter, dateFilter, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  /**
   * Export orders matching current filters directly to an Excel (.xlsx) file
   */
  const handleExportExcel = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      // Request all matching orders (with export=true flag and high limit)
      const params = new URLSearchParams({
        page: '1',
        limit: '10000',
        export: 'true',
        status: statusFilter,
        payment_status: paymentFilter,
        search,
        sortBy: 'created_at',
        sortOrder
      });

      if (dateFilter && dateFilter.trim() !== '') {
        params.append('date', dateFilter);
      }

      const res = await api.get(`/admin/orders?${params.toString()}`);
      const rawOrders = (res.success && Array.isArray(res.orders)) ? res.orders : orders;

      if (!rawOrders || rawOrders.length === 0) {
        if (addToast) addToast('No orders found to export', 'error');
        return;
      }

      // Format data neatly for spreadsheet columns
      const excelData = rawOrders.map((o, idx) => {
        const orderDate = o.created_at ? new Date(o.created_at) : new Date();
        const formattedDate = orderDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const formattedTime = orderDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const addressParts = [
          o.house_building,
          o.street,
          o.area,
          o.city,
          o.state,
          o.pincode
        ].filter(Boolean);

        return {
          '#': idx + 1,
          'Order Number': o.order_number || `ZEBA-${o.id}`,
          'Date': `${formattedDate} ${formattedTime}`,
          'Customer Name': o.customer_name || 'Customer',
          'Phone': o.customer_phone || 'N/A',
          'Email': o.customer_email || 'N/A',
          'Shipping Address': addressParts.join(', ') || 'N/A',
          'City': o.city || 'N/A',
          'State': o.state || 'N/A',
          'Pincode': o.pincode || 'N/A',
          'Products Ordered': o.products_summary || 'N/A',
          'Total Items': Number(o.total_items) || 1,
          'Subtotal (₹)': Number(o.subtotal || o.total_amount || 0),
          'Discount (₹)': Number(o.discount_amount || 0),
          'Shipping Fee (₹)': Number(o.shipping_fee || 0),
          'Total Amount (₹)': Number(o.total_amount || 0),
          'Payment Status': (o.payment_status || 'PENDING').toUpperCase(),
          'Payment Mode': o.payment_method || (o.payment_status === 'paid' ? 'Online / UPI' : 'COD'),
          'Order Status': (o.status || 'pending').toUpperCase(),
          'Courier Partner': o.courier_partner || 'N/A',
          'Tracking Number': o.tracking_number || 'N/A',
          'Customer Notes': o.notes || ''
        };
      });

      // Build worksheet and apply optimal column widths
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet['!cols'] = [
        { wch: 5 },  // #
        { wch: 20 }, // Order Number
        { wch: 22 }, // Date
        { wch: 22 }, // Customer Name
        { wch: 15 }, // Phone
        { wch: 26 }, // Email
        { wch: 40 }, // Shipping Address
        { wch: 16 }, // City
        { wch: 16 }, // State
        { wch: 10 }, // Pincode
        { wch: 48 }, // Products Ordered
        { wch: 12 }, // Total Items
        { wch: 14 }, // Subtotal
        { wch: 14 }, // Discount
        { wch: 14 }, // Shipping Fee
        { wch: 16 }, // Total Amount
        { wch: 16 }, // Payment Status
        { wch: 16 }, // Payment Mode
        { wch: 16 }, // Order Status
        { wch: 18 }, // Courier Partner
        { wch: 22 }, // Tracking Number
        { wch: 25 }  // Notes
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      const nowStr = new Date().toISOString().slice(0, 10);
      const filename = dateFilter 
        ? `Zeba_Orders_${dateFilter}.xlsx`
        : `Zeba_Orders_Export_${nowStr}.xlsx`;

      XLSX.writeFile(workbook, filename);

      if (addToast) {
        addToast(`Successfully exported ${excelData.length} order${excelData.length === 1 ? '' : 's'} to Excel!`, 'success');
      }
    } catch (err) {
      console.error('Failed to export orders to excel:', err);
      if (addToast) {
        addToast('Export failed: ' + (err.message || 'Unknown error'), 'error');
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-deepPurple">Order Management</h1>
          <p className="text-xs text-[#805A82] mt-0.5">Manage customer orders, track shipments, and review payments</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {dateFilter && (
            <button
              onClick={() => { setDateFilter(''); setPage(1); }}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-brightPink bg-brand-softPink px-3 py-1.5 rounded-full border border-brand-primaryPink/30 hover:bg-brand-brightPink hover:text-white transition-colors cursor-pointer"
              title="Click to clear date filter"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Date: {new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Export to Excel Button (positioned right next to Total Orders) */}
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
            title={total === 0 ? 'No orders to export' : 'Export order data to Excel spreadsheet (.xlsx)'}
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>

          <span className="text-xs font-bold text-brand-deepPurple bg-white border border-brand-primaryPink/30 px-3.5 py-1.5 rounded-full shadow-sm">
            Total Orders: {total}
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-brand-primaryPink/20 shadow-sm flex flex-col md:flex-row gap-3 md:items-center justify-between">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px] max-w-sm lg:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-8 rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-brightPink/15 text-sm text-slate-800 outline-none shadow-sm transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-brightPink p-1 rounded-full transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Dropdown Filters (Calendar Date, Status, Payment, Sort) - No scroll, fits perfectly */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Calendar Date Picker */}
          <div className="flex items-center space-x-1.5 text-xs whitespace-nowrap">
            <span className="text-slate-500 font-semibold text-[11px]">Date:</span>
            <div className="relative flex items-center">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                className="h-10 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-2.5 text-xs outline-none focus:border-brand-brightPink focus:ring-2 focus:ring-brand-brightPink/15 font-medium cursor-pointer shadow-sm transition-all"
                title="Choose order date"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => { setDateFilter(''); setPage(1); }}
                  className="ml-1 text-slate-400 hover:text-brand-brightPink p-0.5 rounded-full transition-colors"
                  title="Clear date"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 text-xs whitespace-nowrap">
            <span className="text-slate-500 font-semibold text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-2.5 text-xs outline-none focus:border-brand-brightPink focus:ring-2 focus:ring-brand-brightPink/15 font-medium cursor-pointer shadow-sm transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out For Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center space-x-1.5 text-xs whitespace-nowrap">
            <span className="text-slate-500 font-semibold text-[11px]">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="h-10 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-2.5 text-xs outline-none focus:border-brand-brightPink focus:ring-2 focus:ring-brand-brightPink/15 font-medium cursor-pointer shadow-sm transition-all"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center space-x-1.5 text-xs whitespace-nowrap">
            <span className="text-slate-500 font-semibold text-[11px]">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
              className="h-10 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-2.5 text-xs outline-none focus:border-brand-brightPink focus:ring-2 focus:ring-brand-brightPink/15 font-medium cursor-pointer shadow-sm transition-all"
            >
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>
          </div>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-brand-primaryPink/25 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#805A82]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#805A82] space-y-2">
            <p>
              {dateFilter
                ? `No orders found for ${new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                : 'No matching orders found.'}
            </p>
            {dateFilter && (
              <button
                type="button"
                onClick={() => { setDateFilter(''); setPage(1); }}
                className="text-xs text-brand-brightPink font-bold hover:underline"
              >
                Clear date filter
              </button>
            )}
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
                  <th 
                    className="p-4 cursor-pointer hover:text-brand-brightPink transition-colors select-none"
                    onClick={() => { setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC'); setPage(1); }}
                    title="Click to sort by date"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 text-[#805A82]" />
                    </div>
                  </th>
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
          label="orders"
        />
      </div>

    </div>
  );
}
