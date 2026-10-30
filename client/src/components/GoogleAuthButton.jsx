import React, { useState, useEffect, useRef } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Sparkles, AlertCircle, CheckCircle, ExternalLink, X } from 'lucide-react';

export default function GoogleAuthButton({
  mode = 'register', // 'register' | 'login'
  onSuccess,
  onError,
  className = ''
}) {
  const { loginWithGoogle } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const googleBtnContainerRef = useRef(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Initialize Google Identity Services if client ID is configured and script loaded
  useEffect(() => {
    if (!clientId) return;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            context: mode === 'register' ? 'signup' : 'signin'
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: mode === 'register' ? 'signup_with' : 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: '100%'
            });
          }
        } catch (err) {
          console.warn('GSI init error:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGsi();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [clientId, mode]);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      if (onError) onError('Google sign in did not return credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.success) {
        if (onSuccess) onSuccess(res);
      } else {
        if (onError) onError(res.message || 'Google authentication failed.');
      }
    } catch (err) {
      if (onError) onError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomButtonClick = () => {
    // If client ID is present, trigger Google Identity prompt / one-tap
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt blocked, fallback to rendering button or showing guidance
          const btn = googleBtnContainerRef.current?.querySelector('div[role="button"]');
          if (btn) btn.click();
        }
      });
      return;
    }

    // If client ID is not set yet in environment, show instructions & quick test modal
    setShowConfigModal(true);
  };

  const handleSimulatedAuth = async (e) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) return;

    setLoading(true);
    try {
      const userInfo = {
        email: testEmail.trim().toLowerCase(),
        name: testName.trim() || testEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(testName || testEmail)}`,
        id: `google_${Date.now()}`
      };

      const res = await loginWithGoogle(null, userInfo);
      if (res.success) {
        setShowConfigModal(false);
        if (onSuccess) onSuccess(res);
      } else {
        if (onError) onError(res.message);
      }
    } catch (err) {
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const label = mode === 'register' ? 'Sign up with Google' : 'Sign in with Google';

  return (
    <>
      <div className={`w-full ${className}`}>
        {/* Hidden GSI container when native button is rendered */}
        {clientId ? (
          <div className="w-full relative">
            <div ref={googleBtnContainerRef} className="w-full flex justify-center" />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCustomButtonClick}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/80 active:bg-gray-100 text-gray-700 font-semibold text-xs shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center space-x-3 group cursor-pointer disabled:opacity-60"
            title={label}
          >
            {/* Official Google 4-color "G" SVG */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="tracking-wide">
              {loading ? 'Connecting to Google...' : label}
            </span>
          </button>
        )}
      </div>

      {/* Configuration & Quick Demo Modal when VITE_GOOGLE_CLIENT_ID is not yet set */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-primaryPink/30 overflow-hidden animate-scale-up p-5 sm:p-6 space-y-4">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute right-4 top-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-softPink/50 flex items-center justify-center border border-brand-primaryPink/25">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-deepPurple">Google Account Authentication</h3>
                <p className="text-[11px] text-[#805A82]">OAuth Integration Ready</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Production Setup Note:</span>
              </div>
              <p>
                To enable live 1-click Google OAuth popups for users on <code>zebaofficial.in</code>, add your Google OAuth Client ID to your Vercel / environment variables as:
              </p>
              <code className="block bg-white/80 p-1.5 rounded border border-amber-300 font-mono text-[10px] text-amber-800 break-all select-all">
                VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
              </code>
            </div>

            <div className="border-t border-brand-primaryPink/20 pt-3">
              <h4 className="text-xs font-bold text-brand-darkPurple mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-brightPink" />
                <span>Quick Test Google Sign In / Registration</span>
              </h4>
              <p className="text-[11px] text-[#805A82] mb-3">
                You can test creating an account with any Google email right now:
              </p>

              <form onSubmit={handleSimulatedAuth} className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="Your Name (e.g. Priya Sharma)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-1 focus:ring-brand-pink/20 outline-none"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Google Email (e.g. priya.sharma@gmail.com)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-brand-primaryPink/30 focus:border-brand-brightPink focus:ring-1 focus:ring-brand-pink/20 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !testEmail}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-deepPurple hover:bg-brand-deepPurple/90 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : `Continue as ${testName || 'Google User'}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

