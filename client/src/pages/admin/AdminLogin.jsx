import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('zebaofficial2013@gmail.com');
  const [password, setPassword] = useState('ZebaMundath#2026!');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5FA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primaryPink/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-deepPurple/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-md w-full bg-white border-2 border-brand-primaryPink/30 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Brand Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5F3F68] to-[#805A82] flex items-center justify-center text-brand-gold font-serif-brand font-black text-2xl mx-auto shadow-md border border-brand-gold/40">
            Z
          </div>
          <h1 className="font-display font-black text-2xl text-brand-deepPurple">ZEBA Admin Portal</h1>
          <p className="text-xs text-[#805A82]">Sign in with your secure administrator credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-darkPurple mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#805A82] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="zebaofficial2013@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple placeholder-[#805A82]/50 focus:border-brand-brightPink focus:bg-white focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-darkPurple mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#805A82] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple placeholder-[#805A82]/50 focus:border-brand-brightPink focus:bg-white focus:ring-2 focus:ring-brand-pink/20 outline-none text-xs font-medium transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 btn-tactile"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#805A82] flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by bcrypt & JWT token authorization</span>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-brand-deepPurple hover:text-brand-brightPink font-bold hover:underline transition-colors">
            ← Return to ZEBA Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
