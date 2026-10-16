import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  CheckCircle2,
  ArrowRight,
  Package,
  Eye,
  BarChart3,
  Calendar,
  CalendarDays,
  TrendingUp,
  Sparkles,
  Layers,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Filter,
  Clock,
  RotateCcw
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all'); // 'day' | 'month' | 'year' | 'all'
  const [chartTab, setChartTab] = useState('monthly'); // 'monthly' | 'daily' | 'yearly' | 'hourly'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Sorting state for Recent Orders table
  const [orderSortBy, setOrderSortBy] = useState('created_at');
  const [orderSortOrder, setOrderSortOrder] = useState('desc');

  const fetchDashboard = async (selectedRange = range) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/dashboard?range=${selectedRange}`);
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(range);
  }, [range]);

  const { metrics = {}, chartData = {}, recentOrders = [] } = data || {};

  // Sort Recent Orders dynamically
  const sortedOrders = useMemo(() => {
    if (!recentOrders || !recentOrders.length) return [];
    return [...recentOrders].sort((a, b) => {
      let valA, valB;
      if (orderSortBy === 'created_at' || orderSortBy === 'date') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (orderSortBy === 'total_amount' || orderSortBy === 'amount') {
        valA = parseFloat(a.total_amount || 0);
        valB = parseFloat(b.total_amount || 0);
      } else if (orderSortBy === 'status') {
        valA = (a.status || '').toLowerCase();
        valB = (b.status || '').toLowerCase();
      } else if (orderSortBy === 'payment_status') {
        valA = (a.payment_status || '').toLowerCase();
        valB = (b.payment_status || '').toLowerCase();
      } else if (orderSortBy === 'order_number') {
        valA = (a.order_number || '').toLowerCase();
        valB = (b.order_number || '').toLowerCase();
      } else if (orderSortBy === 'customer_name') {
        valA = (a.customer_name || '').toLowerCase();
        valB = (b.customer_name || '').toLowerCase();
      } else {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }

      if (valA < valB) return orderSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return orderSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [recentOrders, orderSortBy, orderSortOrder]);

  const handleSort = (field) => {
    if (orderSortBy === field) {
      setOrderSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderSortBy(field);
      setOrderSortOrder(field === 'created_at' || field === 'total_amount' ? 'desc' : 'asc');
    }
  };

  const renderSortIcon = (field) => {
    if (orderSortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#805A82]/40 group-hover:text-brand-deepPurple inline-block ml-1" />;
    }
    return orderSortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-brand-brightPink inline-block ml-1 font-bold" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-brand-brightPink inline-block ml-1 font-bold" />
    );
  };

  // Compute points for the Revenue Chart
  const chartPoints = useMemo(() => {
    const raw = (chartData && chartData[chartTab]) || [];

    if (chartTab === 'hourly') {
      const hourlyRaw = (chartData && chartData.hourly) || [];
      const map = new Map();
      hourlyRaw.forEach((item) => map.set(item.key, item));

      // 8 time intervals across 24h: 12 AM, 3 AM, 6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
      const buckets = [
        { key: '00', shortLabel: '12 AM', label: '12:00 AM - 03:00 AM' },
        { key: '03', shortLabel: '3 AM', label: '03:00 AM - 06:00 AM' },
        { key: '06', shortLabel: '6 AM', label: '06:00 AM - 09:00 AM' },
        { key: '09', shortLabel: '9 AM', label: '09:00 AM - 12:00 PM' },
        { key: '12', shortLabel: '12 PM', label: '12:00 PM - 03:00 PM' },
        { key: '15', shortLabel: '3 PM', label: '03:00 PM - 06:00 PM' },
        { key: '18', shortLabel: '6 PM', label: '06:00 PM - 09:00 PM' },
        { key: '21', shortLabel: '9 PM', label: '09:00 PM - 11:59 PM' }
      ];

      return buckets.map((b) => {
        let totalRevenue = 0;
        let paidRevenue = 0;
        let orders = 0;
        const startH = parseInt(b.key, 10);
        for (let h = startH; h < startH + 3; h++) {
          const hk = String(h).padStart(2, '0');
          const entry = map.get(hk);
          if (entry) {
            totalRevenue += parseFloat(entry.totalRevenue || 0);
            paidRevenue += parseFloat(entry.paidRevenue || 0);
            orders += parseInt(entry.orders || 0, 10);
          }
        }
        return {
          key: b.key,
          label: b.label,
          shortLabel: b.shortLabel,
          totalRevenue,
          paidRevenue,
          orders
        };
      });
    }

    if (chartTab === 'monthly') {
      const map = new Map();
      raw.forEach((item) => map.set(item.key, item));

      // Rolling last 6 months window
      const now = new Date();
      const rolling = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const shortLabel = d.toLocaleString('en-US', { month: 'short' });
        const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        const existing = map.get(key);

        rolling.push({
          key,
          label,
          shortLabel,
          totalRevenue: existing ? parseFloat(existing.totalRevenue) : 0,
          paidRevenue: existing ? parseFloat(existing.paidRevenue) : 0,
          orders: existing ? parseInt(existing.orders, 10) : 0,
          paidOrders: existing ? parseInt(existing.paidOrders, 10) : 0
        });
      }
      return rolling;
    }

    if (chartTab === 'daily') {
      return raw.slice(-14).map((d) => ({
        key: d.key,
        label: d.label,
        shortLabel: d.shortLabel,
        totalRevenue: parseFloat(d.totalRevenue || 0),
        paidRevenue: parseFloat(d.paidRevenue || 0),
        orders: parseInt(d.orders || 0, 10)
      }));
    }

    // Yearly
    return raw.map((y) => ({
      key: y.key,
      label: y.label,
      shortLabel: y.shortLabel,
      totalRevenue: parseFloat(y.totalRevenue || 0),
      paidRevenue: parseFloat(y.paidRevenue || 0),
      orders: parseInt(y.orders || 0, 10)
    }));
  }, [chartData, chartTab]);

  // Max value for chart scaling
  const maxRevenueVal = useMemo(() => {
    const maxVal = Math.max(...chartPoints.map((p) => p.totalRevenue), 0);
    return maxVal > 0 ? Math.ceil(maxVal * 1.25 / 100) * 100 : 500;
  }, [chartPoints]);

  const rangeLabel = {
    day: 'Today',
    month: 'This Month',
    year: 'This Year',
    all: 'All Time'
  }[range];

  const rangeScopeText = {
    day: "today's live store activity",
    month: "this month's orders & revenue",
    year: "this calendar year's performance",
    all: "entire store history"
  }[range];

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    if (newRange === 'day') {
      setChartTab('hourly');
    } else if (newRange === 'month') {
      setChartTab('daily');
    } else if (newRange === 'year') {
      setChartTab('monthly');
    } else {
      setChartTab('monthly');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Title & Day/Month/Year Sorting Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-deepPurple">
            Live Store Overview
          </h1>
          <p className="text-xs text-[#805A82] mt-0.5">
            Real-time store performance, revenue analytics & order metrics
          </p>
        </div>

        {/* Date Timeframe Sorting / Filter (Day, Month, Year, All) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center p-1 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm text-xs font-semibold">
            <button
              onClick={() => handleRangeChange('day')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                range === 'day'
                  ? 'bg-brand-brightPink text-white font-bold shadow-sm'
                  : 'text-[#805A82] hover:bg-brand-softPink hover:text-brand-deepPurple'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => handleRangeChange('month')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                range === 'month'
                  ? 'bg-brand-brightPink text-white font-bold shadow-sm'
                  : 'text-[#805A82] hover:bg-brand-softPink hover:text-brand-deepPurple'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handleRangeChange('year')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                range === 'year'
                  ? 'bg-brand-brightPink text-white font-bold shadow-sm'
                  : 'text-[#805A82] hover:bg-brand-softPink hover:text-brand-deepPurple'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => handleRangeChange('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                range === 'all'
                  ? 'bg-brand-brightPink text-white font-bold shadow-sm'
                  : 'text-[#805A82] hover:bg-brand-softPink hover:text-brand-deepPurple'
              }`}
            >
              All Time
            </button>
          </div>

          <Link
            to="/admin/orders"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-brand-softPink text-brand-deepPurple text-xs font-bold border border-brand-primaryPink/30 transition-colors shadow-sm btn-tactile"
          >
            <span>Orders</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-brightPink" />
          </Link>
        </div>
      </div>

      {/* Scope Badge indicator */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#805A82]">
        <span className="font-semibold text-brand-deepPurple">Active Timeframe:</span>
        <span className="px-2.5 py-0.5 rounded-full bg-brand-softPink text-brand-brightPink font-bold border border-brand-primaryPink/30 text-[11px]">
          {rangeLabel}
        </span>
        <span className="text-[11px] text-[#805A82]">
          • Scoped overview for {rangeScopeText}
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-brand-brightPink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-[#805A82]">Updating store metrics...</p>
        </div>
      ) : (
        <>
          {/* Main KPI Stat Cards - ALL 4 CARDS DYNAMICALLY UPDATED BY THE SELECTED SORT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Revenue */}
            <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm space-y-2 relative overflow-hidden group hover:border-brand-primaryPink/60 transition-all">
              <div className="flex items-center justify-between text-[#805A82] text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span>Total Revenue</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-brand-softPink text-brand-brightPink font-semibold">
                    {rangeLabel}
                  </span>
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display font-black text-2xl text-brand-deepPurple">
                ₹{metrics.totalBookedRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>₹{metrics.totalRevenue?.toFixed(2)} realized paid</span>
              </div>
            </div>

            {/* Card 2: Total Orders */}
            <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm space-y-2 relative overflow-hidden group hover:border-brand-primaryPink/60 transition-all">
              <div className="flex items-center justify-between text-[#805A82] text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span>Total Orders</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-brand-softPink text-brand-brightPink font-semibold">
                    {rangeLabel}
                  </span>
                </span>
                <div className="p-2 rounded-xl bg-brand-softPink text-brand-brightPink border border-brand-primaryPink/30">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display font-black text-2xl text-brand-deepPurple">
                {metrics.totalOrders}
              </div>
              <div className="text-[11px] text-[#805A82]">
                {metrics.confirmedOrders + metrics.processingOrders} in fulfillment
              </div>
            </div>

            {/* Card 3: Customer Activity */}
            <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm space-y-2 relative overflow-hidden group hover:border-brand-primaryPink/60 transition-all">
              <div className="flex items-center justify-between text-[#805A82] text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span>Customer Activity</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-50 text-brand-deepPurple font-semibold">
                    {rangeLabel}
                  </span>
                </span>
                <div className="p-2 rounded-xl bg-purple-50 text-brand-deepPurple border border-purple-200">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display font-black text-2xl text-brand-deepPurple">
                {range === 'all' ? metrics.totalCustomers : (metrics.activeBuyers || 0)}
              </div>
              <div className="text-[11px] text-[#805A82]">
                {range === 'day' ? (
                  <span>{metrics.activeBuyers || 0} buyers · {metrics.newCustomersToday || 0} new account today</span>
                ) : range === 'month' ? (
                  <span>{metrics.activeBuyers || 0} active buyer(s) this month</span>
                ) : range === 'year' ? (
                  <span>{metrics.activeBuyers || 0} active buyer(s) this year</span>
                ) : (
                  <span>{metrics.totalCustomers} unique customer accounts</span>
                )}
              </div>
            </div>

            {/* Card 4: Products & Units Sold */}
            <div className="p-5 rounded-2xl bg-white border border-brand-primaryPink/25 shadow-sm space-y-2 relative overflow-hidden group hover:border-brand-primaryPink/60 transition-all">
              <div className="flex items-center justify-between text-[#805A82] text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span>Products Sold</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#FDF5D6] text-brand-gold font-semibold">
                    {rangeLabel}
                  </span>
                </span>
                <div className="p-2 rounded-xl bg-[#FDF5D6] text-brand-gold border border-brand-gold/40">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display font-black text-2xl text-brand-deepPurple">
                {metrics.totalUnitsSold || 0} <span className="text-sm font-bold text-[#805A82]">Units</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold">
                Across {metrics.totalProducts} catalog products (in stock)
              </div>
            </div>

          </div>

          {/* MONTHLY BASED REVENUE CHART */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/25 shadow-sm space-y-6">
            
            {/* Chart Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-primaryPink/15">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-xl bg-brand-softPink text-brand-brightPink">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-bold text-lg text-brand-deepPurple">
                    Revenue Analytics
                  </h2>
                </div>
                <p className="text-xs text-[#805A82] mt-0.5">
                  Visual performance breakdown and order revenue trend analysis
                </p>
              </div>

              {/* Chart Granularity Switcher (Hourly, Daily, Monthly, Yearly) */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/25 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setChartTab('hourly')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all ${
                    chartTab === 'hourly'
                      ? 'bg-brand-brightPink text-white font-bold shadow-sm'
                      : 'text-[#805A82] hover:text-brand-deepPurple'
                  }`}
                >
                  Today (Hourly)
                </button>
                <button
                  type="button"
                  onClick={() => setChartTab('daily')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all ${
                    chartTab === 'daily'
                      ? 'bg-brand-brightPink text-white font-bold shadow-sm'
                      : 'text-[#805A82] hover:text-brand-deepPurple'
                  }`}
                >
                  Daily (Last 14d)
                </button>
                <button
                  type="button"
                  onClick={() => setChartTab('monthly')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all ${
                    chartTab === 'monthly'
                      ? 'bg-brand-brightPink text-white font-bold shadow-sm'
                      : 'text-[#805A82] hover:text-brand-deepPurple'
                  }`}
                >
                  Monthly View
                </button>
                <button
                  type="button"
                  onClick={() => setChartTab('yearly')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all ${
                    chartTab === 'yearly'
                      ? 'bg-brand-brightPink text-white font-bold shadow-sm'
                      : 'text-[#805A82] hover:text-brand-deepPurple'
                  }`}
                >
                  Yearly View
                </button>
              </div>
            </div>

            {/* Quick Chart KPI Summaries - SCOPED TO SELECTED TIMEFRAME */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/20">
                <div className="flex items-center justify-between text-[11px] text-[#805A82] font-semibold">
                  <span>Revenue In Period</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand-softPink text-brand-brightPink font-bold">
                    {rangeLabel}
                  </span>
                </div>
                <span className="font-display font-black text-lg sm:text-xl text-brand-deepPurple mt-0.5 block">
                  ₹{metrics.totalBookedRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) ?? '0.00'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/20">
                <div className="flex items-center justify-between text-[11px] text-[#805A82] font-semibold">
                  <span>Total Orders</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand-softPink text-brand-brightPink font-bold">
                    {rangeLabel}
                  </span>
                </div>
                <span className="font-display font-black text-lg sm:text-xl text-brand-deepPurple mt-0.5 block">
                  {metrics.totalOrders ?? 0}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/20 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-[11px] text-[#805A82] font-semibold">
                  <span>Avg Order Value (AOV)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand-softPink text-brand-brightPink font-bold">
                    {rangeLabel}
                  </span>
                </div>
                <span className="font-display font-black text-lg sm:text-xl text-brand-deepPurple mt-0.5 block">
                  ₹{metrics.totalOrders > 0 ? (metrics.totalBookedRevenue / metrics.totalOrders).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            {/* Interactive SVG/CSS Bar Chart */}
            <div className="relative pt-4 pb-2">
              
              {/* Tooltip Popup on Hover */}
              {hoveredPoint && (
                <div className="absolute top-0 right-4 z-20 bg-brand-deepPurple text-white px-3.5 py-2 rounded-xl text-xs shadow-xl border border-brand-primaryPink/30 flex items-center space-x-3 pointer-events-none transition-all">
                  <div>
                    <span className="font-bold text-brand-lightGold block">{hoveredPoint.label}</span>
                    <span className="text-[11px] text-pink-200">
                      ₹{hoveredPoint.totalRevenue.toFixed(2)} revenue
                    </span>
                  </div>
                  <div className="border-l border-white/20 pl-3 text-[11px]">
                    <span className="block font-bold">{hoveredPoint.orders} order(s)</span>
                    <span className="text-emerald-300">₹{hoveredPoint.paidRevenue.toFixed(2)} paid</span>
                  </div>
                </div>
              )}

              {/* Chart Grid Area */}
              <div className="relative h-64 sm:h-72 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6 border-b border-brand-primaryPink/25">
                
                {/* Horizontal Background Reference Lines */}
                <div className="absolute inset-x-0 top-0 border-b border-dashed border-brand-primaryPink/15 pointer-events-none flex justify-between text-[10px] text-[#805A82]/50 px-2">
                  <span>₹{maxRevenueVal.toFixed(0)}</span>
                </div>
                <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-brand-primaryPink/15 pointer-events-none flex justify-between text-[10px] text-[#805A82]/50 px-2">
                  <span>₹{(maxRevenueVal / 2).toFixed(0)}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 pointer-events-none flex justify-between text-[10px] text-[#805A82]/50 px-2">
                  <span>₹0</span>
                </div>

                {/* Bars */}
                {chartPoints.map((point) => {
                  const barHeightPercent = Math.max(
                    4,
                    Math.round((point.totalRevenue / maxRevenueVal) * 100)
                  );
                  const isHovered = hoveredPoint?.key === point.key;
                  const hasData = point.totalRevenue > 0;

                  return (
                    <div
                      key={point.key}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {/* Bar Value on top if has data */}
                      {hasData && (
                        <span className={`text-[10px] font-bold mb-1 transition-colors ${
                          isHovered ? 'text-brand-brightPink scale-110' : 'text-brand-deepPurple'
                        }`}>
                          ₹{point.totalRevenue >= 1000 ? `${(point.totalRevenue / 1000).toFixed(1)}k` : point.totalRevenue.toFixed(0)}
                        </span>
                      )}

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[48px] flex items-end justify-center h-full">
                        <div
                          style={{ height: `${barHeightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-300 relative ${
                            hasData
                              ? (isHovered
                                  ? 'bg-gradient-to-t from-brand-deepPink to-brand-brightPink shadow-lg ring-2 ring-brand-brightPink/40'
                                  : 'bg-gradient-to-t from-brand-deepPurple to-brand-brightPink shadow-sm hover:from-brand-brightPink hover:to-brand-deepPink')
                              : 'bg-brand-softPink/60 hover:bg-brand-softPink'
                          }`}
                        >
                          {/* Inner paid portion if paid revenue exists */}
                          {point.paidRevenue > 0 && point.totalRevenue > 0 && (
                            <div
                              style={{ height: `${Math.round((point.paidRevenue / point.totalRevenue) * 100)}%` }}
                              className="w-full bg-emerald-500 rounded-t-xl absolute bottom-0 left-0 opacity-80"
                            />
                          )}
                        </div>
                      </div>

                      {/* X-axis Label */}
                      <span className={`text-[11px] font-bold mt-2 transition-colors ${
                        isHovered ? 'text-brand-brightPink' : 'text-[#805A82]'
                      }`}>
                        {point.shortLabel}
                      </span>
                    </div>
                  );
                })}

              </div>

              {/* Chart Legend */}
              <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[#805A82]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-t from-brand-deepPurple to-brand-brightPink" />
                  <span>Total Revenue (Booked)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Realized Paid Revenue</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-brand-softPink border border-brand-primaryPink/40" />
                  <span>Zero Activity</span>
                </div>
              </div>

            </div>

          </div>

          {/* Orders Status Grid */}
          <div className="bg-white rounded-3xl p-6 border border-brand-primaryPink/25 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-brand-deepPurple">
                Orders Breakdown by Status ({rangeLabel})
              </h2>
              <span className="text-xs text-[#805A82]">
                Total: <span className="font-bold text-brand-deepPurple">{metrics.totalOrders}</span> orders
              </span>
            </div>
            
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

          {/* Recent Orders Table with Sort Controls */}
          <div className="bg-white rounded-3xl border border-brand-primaryPink/25 overflow-hidden shadow-sm space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-primaryPink/15">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-base text-brand-deepPurple">
                    Recent Store Orders ({rangeLabel})
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-brand-softPink text-brand-brightPink text-[10px] font-bold">
                    {sortedOrders.length} order{sortedOrders.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-xs text-[#805A82]">
                  {range === 'day' 
                    ? "Orders placed today" 
                    : range === 'month' 
                    ? "Orders placed this month" 
                    : range === 'year' 
                    ? "Orders placed this calendar year" 
                    : "Latest customer orders placed on storefront"}
                </p>
              </div>

              {/* Sort controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[#805A82]">
                  <ArrowUpDown className="w-3.5 h-3.5 text-brand-brightPink" />
                  <span className="font-semibold hidden md:inline">Sort:</span>
                  <select
                    value={`${orderSortBy}-${orderSortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setOrderSortBy(field);
                      setOrderSortOrder(order);
                    }}
                    className="text-xs bg-[#FFF5FA] border border-brand-primaryPink/30 rounded-xl px-2.5 py-1.5 text-brand-deepPurple font-semibold focus:outline-none focus:ring-1 focus:ring-brand-brightPink cursor-pointer"
                  >
                    <option value="created_at-desc">Newest First (Date ↓)</option>
                    <option value="created_at-asc">Oldest First (Date ↑)</option>
                    <option value="total_amount-desc">Amount: High to Low (₹ ↓)</option>
                    <option value="total_amount-asc">Amount: Low to High (₹ ↑)</option>
                    <option value="status-asc">Status: A to Z</option>
                    <option value="customer_name-asc">Customer: A to Z</option>
                  </select>
                </div>

                <Link to="/admin/orders" className="text-xs text-brand-brightPink hover:underline font-bold whitespace-nowrap ml-1">
                  View All Orders →
                </Link>
              </div>
            </div>

            {sortedOrders.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF5FA] border border-brand-primaryPink/30 flex items-center justify-center mx-auto text-brand-brightPink">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-display font-bold text-sm text-brand-deepPurple">
                    No orders recorded for {rangeLabel.toLowerCase()}
                  </p>
                  <p className="text-xs text-[#805A82] max-w-sm mx-auto">
                    {range === 'day' 
                      ? "There have been no orders placed today yet. New live customer orders will automatically appear here." 
                      : `No orders found matching the ${rangeLabel.toLowerCase()} timeframe filter.`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => handleRangeChange('all')}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-softPink hover:bg-brand-primaryPink/25 text-brand-deepPurple text-xs font-bold transition-colors shadow-sm"
                  >
                    View All-Time Orders
                  </button>
                  <button
                    onClick={() => handleRangeChange('month')}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-brand-primaryPink/30 hover:bg-brand-softPink text-[#805A82] hover:text-brand-deepPurple text-xs font-semibold transition-colors shadow-sm"
                  >
                    View This Month
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-brand-darkPurple">
                  <thead className="bg-[#FFF5FA] text-[#805A82] uppercase font-bold text-[10px] tracking-wider border-b border-brand-primaryPink/20 select-none">
                    <tr>
                      <th 
                        className="p-3 cursor-pointer hover:text-brand-deepPurple transition-colors group"
                        onClick={() => handleSort('order_number')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Order Number</span>
                          {renderSortIcon('order_number')}
                        </div>
                      </th>
                      <th 
                        className="p-3 cursor-pointer hover:text-brand-deepPurple transition-colors group"
                        onClick={() => handleSort('customer_name')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Customer</span>
                          {renderSortIcon('customer_name')}
                        </div>
                      </th>
                      <th 
                        className="p-3 cursor-pointer hover:text-brand-deepPurple transition-colors group"
                        onClick={() => handleSort('total_amount')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Total Amount</span>
                          {renderSortIcon('total_amount')}
                        </div>
                      </th>
                      <th 
                        className="p-3 cursor-pointer hover:text-brand-deepPurple transition-colors group"
                        onClick={() => handleSort('payment_status')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Payment</span>
                          {renderSortIcon('payment_status')}
                        </div>
                      </th>
                      <th 
                        className="p-3 cursor-pointer hover:text-brand-deepPurple transition-colors group"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Order Status</span>
                          {renderSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="p-3 cursor-pointer hover:text-brand-deepPurple transition-colors group"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Date</span>
                          {renderSortIcon('created_at')}
                        </div>
                      </th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-primaryPink/15">
                    {sortedOrders.map((order) => (
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
        </>
      )}

    </div>
  );
}
