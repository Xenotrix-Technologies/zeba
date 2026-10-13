import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sparkles, User, LogOut, Flame, Gift, Tag, Bell, Heart, ShieldCheck, Copy, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { settings } = useStoreSettings();
  const { addToast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { cartCount, setIsCartOpen } = useCart();
  const { customer, isCustomerAuthenticated, logout } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const offerBar = settings.offerBar || {
    enabled: true,
    mode: 'threshold',
    badgeText: 'Special Offer:',
    boldText: 'Free Fast Shipping',
    subText: '',
    autoThreshold: true,
    customText: '',
    secondaryText: '• 100% Safe Natural Minerals • Discreet Packaging',
    couponCode: '',
    linkUrl: '',
    bgColor: '#5F3F68',
    textColor: '#FFFFFF',
    accentColor: '#ECC695',
    icon: 'Sparkles',
    pulseEffect: true,
    showSecondaryOnMobile: false
  };

  const renderOfferIcon = () => {
    const iconClass = `w-3.5 h-3.5 flex-shrink-0 ${offerBar.pulseEffect ? 'animate-pulse' : ''}`;
    const iconStyle = { color: offerBar.accentColor || '#ECC695' };
    switch (offerBar.icon) {
      case 'Flame': return <Flame className={iconClass} style={iconStyle} />;
      case 'Gift': return <Gift className={iconClass} style={iconStyle} />;
      case 'Tag': return <Tag className={iconClass} style={iconStyle} />;
      case 'Bell': return <Bell className={iconClass} style={iconStyle} />;
      case 'Heart': return <Heart className={iconClass} style={iconStyle} />;
      case 'ShieldCheck': return <ShieldCheck className={iconClass} style={iconStyle} />;
      case 'None': return null;
      case 'Sparkles':
      default:
        return <Sparkles className={iconClass} style={iconStyle} />;
    }
  };

  const handleCopyCoupon = (e, code) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      addToast(`Promo code "${code}" copied to clipboard!`, 'success');
    }
  };

  const handleOfferBarClick = () => {
    if (!offerBar.linkUrl) return;
    if (offerBar.linkUrl.startsWith('http')) {
      window.open(offerBar.linkUrl, '_blank', 'noopener,noreferrer');
    } else if (offerBar.linkUrl.startsWith('#')) {
      const el = document.querySelector(offerBar.linkUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(offerBar.linkUrl);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  return (
    <>
      {/* Top Notification Announcement Bar */}
      {offerBar.enabled && (
        <div
          onClick={offerBar.linkUrl ? handleOfferBarClick : undefined}
          style={{
            backgroundColor: offerBar.bgColor || '#5F3F68',
            color: offerBar.textColor || '#FFFFFF'
          }}
          className={`py-2 px-4 text-xs md:text-sm font-brand font-medium tracking-wide text-center border-b border-white/10 flex items-center justify-center flex-wrap gap-x-2 gap-y-1 shadow-sm transition-opacity select-none ${
            offerBar.linkUrl ? 'cursor-pointer hover:opacity-95' : ''
          }`}
        >
          {renderOfferIcon()}

          {offerBar.mode === 'custom' && offerBar.customText ? (
            <span className="font-semibold">{offerBar.customText}</span>
          ) : (
            <span>
              {offerBar.badgeText && <span className="mr-1">{offerBar.badgeText}</span>}
              {offerBar.boldText && <strong>{offerBar.boldText} </strong>}
              <span>
                {offerBar.autoThreshold
                  ? (Number(settings.commerce?.standardShippingFee) === 0 || Number(settings.commerce?.freeShippingThreshold) === 0
                    ? 'on all orders!'
                    : (Number(settings.commerce?.freeShippingThreshold) > 0
                      ? `on orders above ₹${settings.commerce.freeShippingThreshold}!`
                      : 'on all orders!'))
                  : (offerBar.subText || '')}
              </span>
            </span>
          )}

          {offerBar.couponCode && (
            <button
              type="button"
              onClick={(e) => handleCopyCoupon(e, offerBar.couponCode)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase border border-white/20 bg-white/10 hover:bg-white/20 transition-colors shadow-sm ml-1"
              style={{ color: offerBar.accentColor || '#ECC695' }}
              title="Click to copy promo code"
            >
              <Tag className="w-3 h-3 flex-shrink-0" />
              <span>CODE: {offerBar.couponCode}</span>
              <Copy className="w-2.5 h-2.5 opacity-70 ml-0.5" />
            </button>
          )}

          {offerBar.secondaryText && (
            <span
              style={{ color: offerBar.accentColor || '#ECC695' }}
              className={`font-semibold ${offerBar.showSecondaryOnMobile ? 'inline' : 'hidden md:inline'}`}
            >
              {offerBar.secondaryText}
            </span>
          )}

          {offerBar.linkUrl && (
            <span className="hidden sm:inline-flex items-center text-[11px] opacity-80 hover:opacity-100 transition-opacity ml-1">
              <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      )}

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
              src="/images/zeba-logo.webp" 
              alt="ZEBA - Periods Pain Relief" 
              width="150"
              height="44"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/zeba-logo.png';
              }}
              className="h-9 sm:h-10 md:h-11 w-auto object-contain group-hover:opacity-90 transition-opacity" 
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 font-brand text-xs font-bold uppercase tracking-wider text-brand-darkPurple">
            <Link
              to="/"
              className={`hover:text-brand-brightPink transition-colors relative py-1 ${
                location.pathname === '/' ? 'text-brand-brightPink font-black' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`hover:text-brand-brightPink transition-colors relative py-1 ${
                location.pathname.startsWith('/products') ? 'text-brand-brightPink font-black' : ''
              }`}
            >
              Heating Pads
              <span className="ml-1.5 px-2 py-0.5 text-[9px] font-black bg-brand-brightPink text-white rounded-full shadow-sm tracking-normal">
                1 & 3 Packs
              </span>
            </Link>
            <Link
              to="/about"
              className={`hover:text-brand-brightPink transition-colors relative py-1 ${
                location.pathname === '/about' ? 'text-brand-brightPink font-black' : ''
              }`}
            >
              About ZEBA
            </Link>
            <Link
              to="/contact"
              className={`hover:text-brand-brightPink transition-colors relative py-1 ${
                location.pathname === '/contact' ? 'text-brand-brightPink font-black' : ''
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
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-brand-softPink text-brand-deepPurple border border-brand-pink/20 transition-colors shadow-sm font-brand"
                >
                  <div className="w-7 h-7 rounded-lg pack-purple-gradient text-brand-gold flex items-center justify-center font-bold text-xs border border-brand-gold/30">
                    {customer?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-brand-darkPurple tracking-wide">{customer?.name?.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-brand-pink/20 py-2 z-50 animate-fade-in text-xs space-y-1 font-brand">
                    <div className="px-4 py-2 border-b border-brand-pink/10">
                      <p className="font-bold text-brand-deepPurple truncate tracking-wide">{customer?.name}</p>
                      <p className="text-[10px] text-brand-purple truncate font-sans">{customer?.email}</p>
                    </div>
                    <Link
                      to="/account"
                      className="block px-4 py-2 hover:bg-brand-softPink text-brand-darkPurple font-bold tracking-wide"
                    >
                      My Orders & Account
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-bold tracking-wide flex items-center space-x-2"
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
                className="flex items-center space-x-1.5 p-2.5 rounded-xl bg-white hover:bg-brand-softPink text-brand-deepPurple hover:text-brand-brightPink border border-brand-pink/20 transition-colors text-xs font-brand font-bold tracking-wide shadow-sm"
                title="Customer Login"
              >
                <User className="w-4 h-4 text-brand-deepPurple" />
                <span className="hidden sm:inline text-brand-darkPurple">Sign In</span>
              </Link>
            )}

            {/* Shop 3-Pack CTA */}
            <Link
              to="/products/zeba-heating-pad-3-pack"
              className="hidden lg:inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-brand font-bold uppercase tracking-wider text-white bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink transition-all duration-200 shadow-md shadow-brand-pink/25 btn-tactile"
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
          <div className="md:hidden border-t border-brand-pink/20 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl font-brand">
            <Link
              to="/"
              className="block px-3 py-2 rounded-lg text-sm font-bold tracking-wider text-brand-darkPurple hover:bg-brand-softPink hover:text-brand-brightPink"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 rounded-lg text-sm font-bold tracking-wider text-brand-darkPurple hover:bg-brand-softPink hover:text-brand-brightPink"
            >
              Heating Pads (1 Pack & 3 Pack)
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-lg text-sm font-bold tracking-wider text-brand-darkPurple hover:bg-brand-softPink hover:text-brand-brightPink"
            >
              About ZEBA
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-lg text-sm font-bold tracking-wider text-brand-darkPurple hover:bg-brand-softPink hover:text-brand-brightPink"
            >
              Contact Us & Support
            </Link>
            <Link
              to={isCustomerAuthenticated ? "/account" : "/login"}
              className="block px-3 py-2 rounded-lg text-sm font-bold tracking-wider text-brand-brightPink bg-brand-softPink"
            >
              {isCustomerAuthenticated ? `My Account (${customer?.name?.split(' ')[0]})` : "Customer Sign In / Register"}
            </Link>
            <div className="pt-2 border-t border-brand-pink/15 flex flex-col gap-2">
              <Link
                to="/products"
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink text-white font-brand font-bold text-sm tracking-wider uppercase shadow-md"
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
