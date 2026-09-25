import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sparkles, ShieldCheck, Heart, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { businessConfig } from '../config/businessConfig';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { cartCount, setIsCartOpen } = useCart();
  const { customer, isCustomerAuthenticated, logout } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div className="bg-[#260E36] text-white py-2 px-4 text-xs md:text-sm font-medium text-center border-b border-brand-gold/20 flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
        <span>Special Offer: <strong>Free Fast Shipping</strong> on orders above ₹{businessConfig.commerce.freeShippingThreshold}!</span>
        <span className="hidden md:inline text-brand-lightGold font-semibold">• 100% Safe Ingredients • Discreet Packaging</span>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav shadow-sm py-3 border-b border-brand-magenta/15'
            : 'bg-white/95 py-4 border-b border-brand-magenta/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-navy hover:text-brand-magenta transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* ZEBA Logo matching exact box packaging */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3C1B50] via-[#A83B8F] to-[#B84E9E] flex items-center justify-center shadow-md border border-brand-gold/40 group-hover:scale-105 transition-transform">
              <span className="font-serif-brand font-black text-xl text-brand-gold tracking-widest">Z</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif-brand font-black text-2xl tracking-widest gold-gradient-text flex items-center">
                ZEBA
              </span>
              <span className="text-[9px] tracking-widest text-[#8A2574] uppercase font-bold -mt-0.5">
                Periods Pain Relief
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
            <Link
              to="/"
              className={`hover:text-brand-pink transition-colors relative py-1 ${
                location.pathname === '/' ? 'text-brand-pink font-bold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`hover:text-brand-pink transition-colors relative py-1 ${
                location.pathname.startsWith('/products') ? 'text-brand-pink font-bold' : ''
              }`}
            >
              Heating Pads
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-extrabold bg-brand-pink text-white rounded-full">
                1 & 3 Packs
              </span>
            </Link>
            <Link
              to="/about"
              className={`hover:text-brand-pink transition-colors relative py-1 ${
                location.pathname === '/about' ? 'text-brand-pink font-bold' : ''
              }`}
            >
              About ZEBA
            </Link>
            <Link
              to="/contact"
              className={`hover:text-brand-pink transition-colors relative py-1 ${
                location.pathname === '/contact' ? 'text-brand-pink font-bold' : ''
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Action CTAs, Customer Account & Cart */}
          <div className="flex items-center space-x-3">
            
            {/* Customer Account Button / Dropdown */}
            {isCustomerAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-slate-100 hover:bg-brand-softPink text-zeba-navy transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg pack-navy-gradient text-zeba-gold flex items-center justify-center font-bold text-xs">
                    {customer?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold">{customer?.name?.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in text-xs space-y-1">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-zeba-navy truncate">{customer?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{customer?.email}</p>
                    </div>
                    <Link
                      to="/account"
                      className="block px-4 py-2 hover:bg-brand-softPink text-slate-700 font-semibold"
                    >
                      My Orders & Account
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 p-2.5 rounded-xl bg-slate-100 hover:bg-brand-softPink text-zeba-navy hover:text-brand-pink transition-colors text-xs font-bold"
                title="Customer Login"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Shop 3-Pack CTA */}
            <Link
              to="/products"
              className="hidden lg:inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-brand-pink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-pink transition-all duration-200 shadow-sm"
            >
              Shop 3-Pack
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-brand-softPink text-brand-navy hover:text-brand-pink transition-all duration-200 focus:outline-none"
              aria-label="Open cart drawer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-up">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
            <Link
              to="/"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-brand-softPink hover:text-brand-pink"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-brand-softPink hover:text-brand-pink"
            >
              Heating Pads (1 Pack & 3 Pack)
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-brand-softPink hover:text-brand-pink"
            >
              About ZEBA
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-brand-softPink hover:text-brand-pink"
            >
              Contact Us & Support
            </Link>
            <Link
              to={isCustomerAuthenticated ? "/account" : "/login"}
              className="block px-3 py-2 rounded-lg text-base font-medium text-brand-pink bg-brand-softPink font-bold"
            >
              {isCustomerAuthenticated ? `My Account (${customer?.name?.split(' ')[0]})` : "Customer Sign In / Register"}
            </Link>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/products"
                className="w-full text-center py-2.5 rounded-xl bg-brand-pink text-white font-bold text-sm shadow-md"
              >
                Shop Heating Pads
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
