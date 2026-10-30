import React, { useState, useEffect, useRef } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '284422563306-jdmmb2ng15nh96eev8plf8dpg2q0o1kn.apps.googleusercontent.com';

export default function GoogleAuthButton({
  mode = 'register', // 'register' | 'login'
  onSuccess,
  onError,
  className = ''
}) {
  const { loginWithGoogle } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const containerRef = useRef(null);

  // Handle successful Google credential response
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      if (onError) onError('Google sign-in did not return credentials. Please try again.');
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
      if (onError) onError(err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;

    const renderButton = () => {
      if (!isMounted || !containerRef.current || !window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          context: mode === 'register' ? 'signup' : 'signin',
          cancel_on_tap_outside: true
        });

        const containerWidth = containerRef.current.clientWidth || 360;
        const buttonWidth = Math.min(Math.max(containerWidth, 240), 400);

        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: buttonWidth
        });

        setGsiReady(true);
      } catch (err) {
        console.warn('[GoogleAuth] Initialization note:', err.message);
      }
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      let attempts = 0;
      pollTimer = setInterval(() => {
        attempts += 1;
        if (window.google?.accounts?.id) {
          clearInterval(pollTimer);
          renderButton();
        } else if (attempts > 30) {
          clearInterval(pollTimer);
        }
      }, 150);
    }

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [mode]);

  const label = mode === 'register' ? 'Sign up with Google' : 'Sign in with Google';

  return (
    <div className={`w-full ${className}`}>
      {loading ? (
        <div className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-gray-50/80 text-gray-600 font-semibold text-xs shadow-sm flex items-center justify-center space-x-2 animate-pulse">
          <div className="w-4 h-4 border-2 border-brand-brightPink border-t-transparent rounded-full animate-spin" />
          <span>Signing in with Google...</span>
        </div>
      ) : (
        <div className="w-full relative min-h-[44px] flex items-center justify-center">
          {/* Official Google GSI Render Container */}
          <div
            ref={containerRef}
            className={`w-full flex justify-center transition-opacity duration-200 ${
              gsiReady ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          />

          {/* Clean Branded Placeholder while GSI renders */}
          {!gsiReady && (
            <div className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs shadow-sm flex items-center justify-center space-x-3">
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
              <span className="tracking-wide">{label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
