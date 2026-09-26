import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useAuth } from '../context/AuthContext';

export default function CustomerLogin() {
  const [identifier, setIdentifier] = useState('zebaofficial2013@gmail.com');
  const [password, setPassword] = useState('Zeba@2026.?');
  const [loading, setLoading] = useState(false);

  const { login: customerLogin } = useCustomerAuth();
  const { login: adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/account';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanId = identifier.trim().toLowerCase();
    
    // If admin is signing in via this portal, authenticate with admin API seamlessly
    if (cleanId === 'zebaofficial2013@gmail.com' || cleanId === 'zeba_admin') {
      const adminRes = await adminLogin(identifier, password);
      setLoading(false);
      if (adminRes.success) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
    }

    const res = await customerLogin(identifier, password);
    setLoading(false);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <div className="bg-[#FFF5FA] min-h-[75vh] flex items-center justify-center py-12 sm:py-16">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-primaryPink/30 shadow-xl space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block">
              <img 
                src="/images/zeba-logo.png" 
                alt="ZEBA" 
                className="h-12 w-auto mx-auto object-contain hover:opacity-90 transition-opacity" 
              />
            </Link>
            <h1 className="font-display font-extrabold text-2xl text-brand-deepPurple">
              Customer Sign In
            </h1>
            <p className="text-xs text-[#805A82]">
              Sign in with your email and password to access your dashboard and account
            </p>
          </div>

          {/* Clean Single Sign In Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-darkPurple mb-1">
                Email Address or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#805A82] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="zebaofficial2013@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple bg-brand-softPink/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-darkPurple mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#805A82] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium text-brand-darkPurple bg-brand-softPink/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 btn-tactile"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-[#805A82] flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted with bcrypt & secure token authentication</span>
          </div>

          <div className="text-center pt-2 flex items-center justify-center space-x-4 text-xs">
            <Link to="/admin/login" className="text-brand-deepPurple hover:text-brand-brightPink font-bold transition-colors underline">
              Admin Portal
            </Link>
            <span className="text-[#805A82]">•</span>
            <Link to="/" className="text-[#805A82] hover:text-brand-deepPurple transition-colors">
              Return to Store
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
