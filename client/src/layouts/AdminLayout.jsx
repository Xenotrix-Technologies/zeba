import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { admin, isAuthenticated, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5FA] text-brand-deepPurple">
        <div className="w-10 h-10 border-4 border-brand-brightPink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Business Settings', path: '/admin/settings', icon: Sparkles }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FFF5FA] text-brand-darkPurple flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#5F3F68] border-b border-white/10 text-white">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#38283D] to-[#805A82] border border-brand-gold/40 flex items-center justify-center font-serif-brand font-black text-brand-gold">
            Z
          </div>
          <span className="font-display font-black text-lg text-white">ZEBA Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Deep Purple & Gold) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#5F3F68] border-r border-[#4A2F52] text-white flex flex-col justify-between transform transition-transform duration-200 ease-in-out shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-8">
          
          {/* Brand header */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#38283D] to-[#805A82] flex items-center justify-center text-brand-gold font-serif-brand font-black text-xl shadow-md border border-brand-gold/40 group-hover:scale-105 transition-transform">
              Z
            </div>
            <div>
              <h1 className="font-serif-brand font-black text-lg text-white tracking-widest gold-gradient-text">ZEBA</h1>
              <span className="text-[10px] text-brand-lightGold font-bold tracking-wider uppercase block -mt-0.5">
                Admin Control Hub
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white shadow-lg shadow-brand-pink/30'
                      : 'text-pink-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin user info & Logout */}
        <div className="p-6 border-t border-white/10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#38283D] text-brand-gold font-bold flex items-center justify-center text-sm border border-brand-gold/40">
              {admin?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{admin?.username || 'Admin'}</p>
              <p className="text-[11px] text-pink-200/70 truncate">{admin?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-rose-900/40 hover:text-rose-200 text-pink-100 text-xs font-bold flex items-center justify-center space-x-2 transition-colors border border-white/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area (Clean, light soft-pink background) */}
      <main className="flex-1 min-w-0 bg-[#FFF5FA] p-4 sm:p-8 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}
