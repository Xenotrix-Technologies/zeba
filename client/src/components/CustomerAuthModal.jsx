import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Package,
  Sparkles
} from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useAuth } from '../context/AuthContext';

export default function CustomerAuthModal({
  isOpen,
  onClose,
  initialData = {},
  totalAmount = 0,
  onAuthenticatedAndProceed,
  onContinueAsGuest
}) {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'login'
  const { login: customerLogin, register: customerRegister } = useCustomerAuth();
  const { login: adminLogin } = useAuth();

  // Create Account State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Sign In State
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync initial checkout form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setRegName(initialData.name || '');
      setRegEmail(initialData.email || '');
      setRegPhone(initialData.phone || '');
      setIdentifier(initialData.email || initialData.phone || '');
      setErrorMsg('');
      setRegPassword('');
      setLoginPassword('');
    }
  }, [isOpen, initialData]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await customerRegister(
        regName.trim(),
        regEmail.trim(),
        regPhone.trim(),
        regPassword
      );

      if (res.success) {
        onClose();
        if (onAuthenticatedAndProceed) {
          onAuthenticatedAndProceed();
        }
      } else {
        const msg = res.message || 'Registration failed. Please try again.';
        setErrorMsg(msg);
        if (msg.toLowerCase().includes('already exists')) {
          setIdentifier(regEmail.trim());
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim() || !loginPassword) {
      setErrorMsg('Please enter your email/phone and password.');
      return;
    }

    setLoading(true);
    try {
      const cleanId = identifier.trim().toLowerCase();

      // Check if admin is signing in
      if (cleanId === 'zebaofficial2013@gmail.com' || cleanId === 'zeba_admin') {
        const adminRes = await adminLogin(identifier.trim(), loginPassword.trim());
        if (adminRes.success) {
          onClose();
          if (onAuthenticatedAndProceed) {
            onAuthenticatedAndProceed();
          }
          return;
        }
      }

      const res = await customerLogin(identifier.trim(), loginPassword);
      if (res.success) {
        onClose();
        if (onAuthenticatedAndProceed) {
          onAuthenticatedAndProceed();
        }
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Sign in failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestProceed = () => {
    onClose();
    if (onContinueAsGuest) {
      onContinueAsGuest();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-[390px] bg-white rounded-2xl shadow-2xl border border-brand-primaryPink/30 overflow-hidden my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Top Header */}
        <div className="bg-gradient-to-r from-[#5F3F68] via-brand-deepPurple to-brand-brightPink px-4 py-3.5 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors focus:outline-none"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-brand-lightGold mb-0.5">
            <Sparkles className="w-3 h-3 text-brand-gold animate-pulse" />
            <span>Live Order Tracking</span>
          </div>

          <h2 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
            {activeTab === 'register' ? 'Track Your Order in Real-Time' : 'Sign In to Your Account'}
          </h2>
          <p className="text-[11px] text-pink-100/90 leading-tight mt-0.5">
            {activeTab === 'register'
              ? 'Create a password to get live GPS tracking & delivery alerts.'
              : 'Sign in to sync this order with your ZEBA history.'}
          </p>
        </div>

        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Compact Tab Switcher */}
          <div className="grid grid-cols-2 p-0.5 bg-brand-softPink/70 rounded-xl border border-brand-primaryPink/25 text-xs">
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
              className={`py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-brand-brightPink shadow-sm'
                  : 'text-[#805A82] hover:text-brand-deepPurple'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              className={`py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-brand-brightPink shadow-sm'
                  : 'text-[#805A82] hover:text-brand-deepPurple'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium leading-tight">
              <div>{errorMsg}</div>
              {errorMsg.toLowerCase().includes('already exists') && activeTab === 'register' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-brand-brightPink underline hover:text-brand-deepPink block pt-1"
                >
                  Switch to Sign In →
                </button>
              )}
            </div>
          )}

          {activeTab === 'register' ? (
            /* Compact Create Account Form */
            <form onSubmit={handleRegister} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-brand-darkPurple mb-0.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#805A82] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Pooja Sharma"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-1 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple bg-brand-softPink/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-brand-darkPurple mb-0.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#805A82] absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="pooja@domain.com"
                      className="w-full pl-7 pr-2 py-2 rounded-lg border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-1 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple bg-brand-softPink/15 truncate"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-darkPurple mb-0.5">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#805A82] absolute left-2.5 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-7 pr-2 py-2 rounded-lg border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-1 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple bg-brand-softPink/15"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-darkPurple mb-0.5">
                  Create Password (min 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#805A82] absolute left-3 top-2.5" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-8 py-2 rounded-lg border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-1 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple bg-brand-softPink/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-2.5 text-[#805A82] hover:text-brand-brightPink"
                    aria-label="Toggle password visibility"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wide shadow-md shadow-brand-pink/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 btn-tactile mt-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {loading
                    ? 'Creating...'
                    : `Create & Pay ₹${Math.round(totalAmount)}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </form>
          ) : (
            /* Compact Sign In Form */
            <form onSubmit={handleLogin} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-brand-darkPurple mb-0.5">
                  Email or Mobile Number *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#805A82] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="yourname@domain.com or 9876543210"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-1 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple bg-brand-softPink/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-darkPurple mb-0.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#805A82] absolute left-3 top-2.5" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-8 py-2 rounded-lg border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-1 focus:ring-brand-pink/20 outline-none text-xs text-brand-darkPurple bg-brand-softPink/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-2.5 text-[#805A82] hover:text-brand-brightPink"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wide shadow-md shadow-brand-pink/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 btn-tactile mt-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {loading
                    ? 'Signing In...'
                    : `Sign In & Pay ₹${Math.round(totalAmount)}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
