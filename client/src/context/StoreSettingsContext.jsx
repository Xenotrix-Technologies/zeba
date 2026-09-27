import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { businessConfig as defaultFallbackConfig } from '../config/businessConfig';

const StoreSettingsContext = createContext({
  settings: defaultFallbackConfig,
  loading: true,
  refreshSettings: async () => {},
  getWhatsAppUrl: () => ''
});

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultFallbackConfig);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.success && res.settings) {
        setSettings((prev) => ({
          ...prev,
          ...res.settings,
          whatsapp: {
            ...prev.whatsapp,
            ...res.settings.whatsapp,
            getWhatsAppUrl: function (customMessage) {
              const msg = encodeURIComponent(customMessage || this.defaultMessage || 'Hi ZEBA Team, I would like to inquire about the Period Pain Relief Heating Pads.');
              const num = this.numberRaw || (this.number ? this.number.replace(/[^0-9]/g, '') : '917025961509');
              return `https://wa.me/${num}?text=${msg}`;
            }
          }
        }));
      }
    } catch (err) {
      console.warn('Could not fetch dynamic database settings, using fallback configuration', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getWhatsAppUrl = useCallback((customMessage) => {
    const defaultMsg = 'Hi ZEBA Team, I would like to inquire about the Period Pain Relief Heating Pads.';
    const msg = encodeURIComponent(customMessage || settings.whatsapp?.defaultMessage || defaultMsg);
    const num = settings.whatsapp?.numberRaw || (settings.whatsapp?.number ? settings.whatsapp.number.replace(/[^0-9]/g, '') : '917025961509');
    return `https://wa.me/${num}?text=${msg}`;
  }, [settings]);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        getWhatsAppUrl
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    return {
      settings: defaultFallbackConfig,
      loading: false,
      refreshSettings: async () => {},
      getWhatsAppUrl: (msg) => `https://wa.me/917025961509?text=${encodeURIComponent(msg || 'Hi ZEBA Team')}`
    };
  }
  return context;
}
