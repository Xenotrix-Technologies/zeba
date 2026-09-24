import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Phone, User, ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function CustomerLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const { login, register } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/account';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(name, email, phone, regPassword);
    setLoading(false);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <div className="bg-[#FAF8FB] py-12 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl pack-navy-gradient flex items-center justify-center text-zeba-gold mx-auto shadow-md border border-zeba-gold/40">
              <span className="font-serif-brand font-black text-2xl">Z</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-zeba-navy">
              {isRegister ? 'Create Your ZEBA Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-slate-500">
              {isRegister
                ? 'Sign up to track orders, save shipping addresses, and manage your cycle care'
                : 'Sign in to access your orders, track shipments, and express checkout'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`py-2.5 rounded-xl transition-all ${
                !isRegister
                  ? 'bg-white text-zeba-navy shadow-sm'
                  : 'text-slate-500 hover:text-zeba-navy'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`py-2.5 rounded-xl transition-all ${
                isRegister
                  ? 'bg-white text-zeba-navy shadow-sm'
                  : 'text-slate-500 hover:text-zeba-navy'
              }`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or 10-digit mobile"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-zeba-magenta focus:ring-2 focus:ring-zeba-magenta/20 outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-zeba-magenta focus:ring-2 focus:ring-zeba-magenta/20 outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl pack-magenta-gradient hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-zeba-magenta/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Verma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-zeba-magenta focus:ring-2 focus:ring-zeba-magenta/20 outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-zeba-magenta focus:ring-2 focus:ring-zeba-magenta/20 outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-zeba-magenta focus:ring-2 focus:ring-zeba-magenta/20 outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password (min 6 chars) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-zeba-magenta focus:ring-2 focus:ring-zeba-magenta/20 outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl pack-magenta-gradient hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-zeba-magenta/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted with bcrypt & secure token authentication</span>
          </div>

        </div>

      </div>
    </div>
  );
}
