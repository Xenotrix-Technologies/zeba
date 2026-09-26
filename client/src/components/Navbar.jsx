import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sparkles, User, LogOut } from 'lucide-react';
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
      <div className="bg-[#5F3F68] text-white py-2 px-4 text-xs md:text-sm font-medium text-center border-b border-white/10 flex items-center justify-center space-x-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse flex-shrink-0" />
        <span>Special Offer: <strong>Free Fast Shipping</strong> on orders above ₹{businessConfig.commerce.freeShippingThreshold}!</span>
        <span className="hidden md:inline text-brand-lightGold font-semibold">• 100% Safe Natural Minerals • Discreet Packaging</span>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav shadow-md py-3 border-b border-brand-pink/20 bg-white/95'
            : 'bg-[#FFF5FA]/95 py-4 border-b border-brand-pink/15 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-darkPurple hover:text-brand-pink transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* ZEBA Official Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 group py-1">
            <img 
              src="/images/zeba-logo.png" 
              alt="ZEBA - Periods Pain Relief" 
              className="h-9 sm:h-10 md:h-11 w-auto object-contain group-hover:opacity-90 transition-opacity" 
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-brand-darkPurple">
            <Link
              to="/"
              className={`hover:text-brand-brightPink transition-colors relative py-1 ${
                location.pathname === '/' ? 'text-brand-brightPink font-bold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`hover:text-brand-brightPink transition-colors relative py-1 ${
                location.pathname.startsWith('/products') ? 'text-brand-brightPink font-bold' : ''
              }`}
            >
              Heating Pads
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-extrabold bg-brand-brightPink text-white rounded-full shadow-sm">
                1 & 3 Packs
              </span>
            </Link>
            <Link
              to="/about"
              className={`hover:text-brand-brightPink transition-colors relative py-1 ${
                location.pathname === '/about' ? 'text-brand-brightPink font-bold' : ''
              }`}
            >
              About ZEBA
            </Link>
            <Link
              to="/contact"
              className={`hover:text-brand-brightPink transition-colors relative py-1 ${
                location.pathname === '/contact' ? 'text-brand-brightPink font-bold' : ''
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
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-brand-softPink text-brand-deepPurple border border-brand-pink/20 transition-colors shadow-sm"
                >
                  <div className="w-7 h-7 rounded-lg pack-purple-gradient text-brand-gold flex items-center justify-center font-bold text-xs border border-brand-gold/30">
                    {customer?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-brand-darkPurple">{customer?.name?.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-brand-pink/20 py-2 z-50 animate-fade-in text-xs space-y-1">
                    <div className="px-4 py-2 border-b border-brand-pink/10">
                      <p className="font-bold text-brand-deepPurple truncate">{customer?.name}</p>
                      <p className="text-[10px] text-brand-purple truncate">{customer?.email}</p>
                    </div>
                    <Link
                      to="/account"
                      className="block px-4 py-2 hover:bg-brand-softPink text-brand-darkPurple font-semibold"
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
                className="flex items-center space-x-1.5 p-2.5 rounded-xl bg-white hover:bg-brand-softPink text-brand-deepPurple hover:text-brand-brightPink border border-brand-pink/20 transition-colors text-xs font-bold shadow-sm"
                title="Customer Login"
              >
                <User className="w-4 h-4 text-brand-deepPurple" />
                <span className="hidden sm:inline text-brand-darkPurple">Sign In</span>
              </Link>
            )}

            {/* Shop 3-Pack CTA */}
            <Link
              to="/products"
              className="hidden lg:inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink transition-all duration-200 shadow-md shadow-brand-pink/25 btn-tactile"
            >
              Shop 3-Pack
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-white hover:bg-brand-softPink text-brand-deepPurple hover:text-brand-brightPink border border-brand-pink/20 transition-all duration-200 focus:outline-none shadow-sm"
              aria-label="Open cart drawer"
            >
              <ShoppingBag className="w-5 h-5 text-brand-deepPurple" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-brightPink text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-up">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-pink/20 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
            <Link
              to="/"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-darkPurple hover:bg-brand-softPink hover:text-brand-brightPink"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-darkPurple hover:bg-brand-softPink hover:text-brand-brightPink"
            >
              Heating Pads (1 Pack & 3 Pack)
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-darkPurple hover:bg-brand-softPink hover:text-brand-brightPink"
            >
              About ZEBA
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-darkPurple hover:bg-brand-softPink hover:text-brand-brightPink"
            >
              Contact Us & Support
            </Link>
            <Link
              to={isCustomerAuthenticated ? "/account" : "/login"}
              className="block px-3 py-2 rounded-lg text-base font-medium text-brand-brightPink bg-brand-softPink font-bold"
            >
              {isCustomerAuthenticated ? `My Account (${customer?.name?.split(' ')[0]})` : "Customer Sign In / Register"}
            </Link>
            <div className="pt-2 border-t border-brand-pink/15 flex flex-col gap-2">
              <Link
                to="/products"
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white font-bold text-sm shadow-md"
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
