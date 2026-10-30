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
  const tokenClientRef = useRef(null);
  const isInitializingRef = useRef(false);

  // Initialize Google OAuth Token Client & One Tap
  useEffect(() => {
    let isMounted = true;
    let pollInterval = null;

    const setupGoogleAuth = () => {
      if (!isMounted || !window.google) return;

      try {
        // 1. Initialize OAuth 2.0 Token Client for direct popup authentication
        if (window.google.accounts?.oauth2 && !tokenClientRef.current) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                if (isMounted) setLoading(false);
                if (tokenResponse.error !== 'popup_closed_by_user') {
                  onError?.('Google sign-in was canceled or encountered an issue.');
                }
                return;
              }

              if (tokenResponse.access_token) {
                try {
                  // Fetch verified profile directly from Google
                  const userInfoRes = await fetch(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    {
                      headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`
                      }
                    }
                  );
                  const profile = await userInfoRes.json();

                  if (!profile || !profile.email) {
                    throw new Error('Unable to retrieve Google profile email.');
                  }

                  const res = await loginWithGoogle(null, {
                    email: profile.email,
                    name: profile.name || profile.given_name || profile.email.split('@')[0],
                    picture: profile.picture || null,
                    id: profile.sub
                  });

                  if (res.success) {
                    onSuccess?.(res);
                  } else {
                    onError?.(res.message || 'Authentication failed. Please try again.');
                  }
                } catch (err) {
                  onError?.(err.message || 'Unable to connect to ZEBA servers. Please try again.');
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            }
          });
        }

        // 2. Also register One Tap / credential listener if available
        if (window.google.accounts?.id && !isInitializingRef.current) {
          isInitializingRef.current = true;
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
              if (!response?.credential) return;
              if (isMounted) setLoading(true);
              try {
                const res = await loginWithGoogle(response.credential);
                if (res.success) {
                  onSuccess?.(res);
                } else {
                  onError?.(res.message || 'Google sign-in failed.');
                }
              } catch (err) {
                onError?.(err.message || 'Authentication error.');
              } finally {
                if (isMounted) setLoading(false);
              }
            },
            auto_select: false,
            context: mode === 'register' ? 'signup' : 'signin',
            cancel_on_tap_outside: true
          });
        }
      } catch (err) {
        console.warn('[GoogleAuth] Init notice:', err.message);
      }
    };

    if (window.google?.accounts?.oauth2) {
      setupGoogleAuth();
    } else {
      let attempts = 0;
      pollInterval = setInterval(() => {
        attempts += 1;
        if (window.google?.accounts?.oauth2) {
          clearInterval(pollInterval);
          setupGoogleAuth();
        } else if (attempts > 40) {
          clearInterval(pollInterval);
        }
      }, 100);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [mode]);

  const handleButtonClick = () => {
    if (loading) return;

    if (tokenClientRef.current) {
      setLoading(true);
      try {
        // Trigger standard Google OAuth popup window
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        setLoading(false);
        onError?.('Unable to open Google sign-in window. Please try again.');
      }
      return;
    }

    // If script is still loading, wait a moment and retry
    setLoading(true);
    setTimeout(() => {
      if (tokenClientRef.current) {
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      } else if (window.google?.accounts?.oauth2) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: () => {}
        });
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      } else {
        setLoading(false);
        onError?.('Google authentication is loading. Please check connection or continue with email.');
      }
    }, 400);
  };

  const label = mode === 'register' ? 'Sign up with Google' : 'Sign in with Google';

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        className="w-full h-11 px-4 rounded-xl border border-brand-primaryPink/35 bg-white hover:bg-brand-softPink/25 active:bg-brand-softPink/40 text-[#38283D] font-semibold text-xs tracking-wide shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center space-x-3 cursor-pointer disabled:cursor-wait relative overflow-hidden group select-none"
        title={label}
        aria-label={label}
      >
        {/* Normal Button Content */}
        <div
          className={`flex items-center justify-center space-x-3 transition-opacity duration-200 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Official Crisp 4-Color Google "G" Logo */}
          <svg
            className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
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
          <span className="font-medium text-xs text-[#38283D] tracking-wide">
            {label}
          </span>
        </div>

        {/* Professional Luxury Loading Overlay (Zero Layout Shift) */}
        {loading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex items-center justify-center space-x-2.5 transition-opacity duration-200">
            <div className="w-3.5 h-3.5 border-2 border-brand-brightPink border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-xs font-semibold text-brand-deepPurple tracking-wide">
              Connecting to Google...
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
