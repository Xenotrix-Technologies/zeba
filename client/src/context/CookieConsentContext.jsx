import React, { createContext, useContext } from 'react';

const CookieConsentContext = createContext({
  consentStatus: 'accepted',
  isPending: false,
  isConsentGiven: true,
  isConsentDenied: false,
  isModalOpen: false,
  acceptCookies: () => {},
  denyCookies: () => {},
  openConsentModal: () => {},
  closeConsentModal: () => {},
  resetConsent: () => {}
});

export function CookieConsentProvider({ children }) {
  return (
    <CookieConsentContext.Provider
      value={{
        consentStatus: 'accepted',
        isPending: false,
        isConsentGiven: true,
        isConsentDenied: false,
        isModalOpen: false,
        acceptCookies: () => {},
        denyCookies: () => {},
        openConsentModal: () => {},
        closeConsentModal: () => {},
        resetConsent: () => {}
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

export default CookieConsentContext;
