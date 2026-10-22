import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const CookieConsentContext = createContext(null);

const STORAGE_KEY = 'zeba_cookie_consent';

export function CookieConsentProvider({ children }) {
  const { addToast } = useToast();

  // Status can be: 'accepted', 'denied', or null (pending)
  const [consentStatus, setConsentStatus] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (stored === 'accepted' || stored === 'denied') {
        return stored;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Deep purge function to clear non-essential storage, caches, and cookies
  const purgeNonEssentialStorage = useCallback(() => {
    try {
      // 1. Remove non-essential items from localStorage (e.g. persistent cart)
      localStorage.removeItem('zeba_cart');

      // 2. Clear browser Cache Storage API if supported
      if (typeof window !== 'undefined' && 'caches' in window) {
        window.caches.keys().then((names) => {
          names.forEach((name) => {
            window.caches.delete(name).catch(() => {});
          });
        }).catch(() => {});
      }

      // 3. Clear non-essential document cookies
      if (typeof document !== 'undefined' && document.cookie) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
          }
        }
      }
    } catch (err) {
      console.warn('Could not purge storage/cache:', err);
    }
  }, []);

  // Accept Cookies & Storage
  const acceptCookies = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      sessionStorage.setItem(STORAGE_KEY, 'accepted');
    } catch (e) {
      console.warn('Failed to store acceptance preference:', e);
    }
    setConsentStatus('accepted');
    setIsModalOpen(false);
    if (addToast) {
      addToast('Cookies & browser cache accepted. Your shopping bag and preferences will be preserved.', 'success');
    }
  }, [addToast]);

  // Deny Cookies & Storage
  const denyCookies = useCallback(() => {
    try {
      // Record user denial preference so we respect it and do not prompt again
      localStorage.setItem(STORAGE_KEY, 'denied');
      sessionStorage.setItem(STORAGE_KEY, 'denied');
    } catch (e) {
      console.warn('Failed to store denial preference:', e);
    }
    setConsentStatus('denied');
    setIsModalOpen(false);

    // Immediately purge all non-essential cookies and cache
    purgeNonEssentialStorage();

    if (addToast) {
      addToast('Cookies & cache storage denied. No cookies or persistent data will be stored.', 'info');
    }
  }, [addToast, purgeNonEssentialStorage]);

  const openConsentModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeConsentModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Enforce cleanup if status is currently denied
  useEffect(() => {
    if (consentStatus === 'denied') {
      purgeNonEssentialStorage();
    }
  }, [consentStatus, purgeNonEssentialStorage]);

  const value = {
    consentStatus,
    isConsentGiven: consentStatus === 'accepted',
    isConsentDenied: consentStatus === 'denied',
    isPending: consentStatus === null,
    isModalOpen,
    acceptCookies,
    denyCookies,
    openConsentModal,
    closeConsentModal
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
