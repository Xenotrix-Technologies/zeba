import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useStoreSettings } from './StoreSettingsContext';
import { getProductMainImage } from '../utils/imageUtils';
import { trackAddToCart } from '../utils/metaPixel';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { addToast } = useToast();
  const { settings } = useStoreSettings();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('zeba_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState(() => {
    try {
      const saved = sessionStorage.getItem('zeba_buynow');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const startBuyNow = (product, quantity = 1) => {
    const item = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      pack_size: product.pack_size,
      price: parseFloat(product.price) || 0,
      original_price: parseFloat(product.original_price || product.price) || 0,
      show_original_price: product.show_original_price !== false,
      image: getProductMainImage(product.images),
      quantity: Math.max(1, quantity)
    };
    setBuyNowItem(item);
    try {
      trackAddToCart(product, quantity);
    } catch {
      // ignore
    }
    try {
      sessionStorage.setItem('zeba_buynow', JSON.stringify(item));
    } catch (e) {
      console.error('Failed to save buyNowItem to sessionStorage', e);
    }
    return item;
  };

  const updateBuyNowQuantity = (delta) => {
    setBuyNowItem(prev => {
      if (!prev) return null;
      const newQty = prev.quantity + delta;
      if (newQty <= 0) {
        try {
          sessionStorage.removeItem('zeba_buynow');
        } catch (e) {
          console.error(e);
        }
        return null;
      }
      const updated = { ...prev, quantity: newQty };
      try {
        sessionStorage.setItem('zeba_buynow', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
    try {
      sessionStorage.removeItem('zeba_buynow');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('zeba_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1, openDrawer = true) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [...prev, {
          id: product.id,
          slug: product.slug,
          name: product.name,
          pack_size: product.pack_size,
          price: parseFloat(product.price) || 0,
          original_price: parseFloat(product.original_price || product.price) || 0,
          show_original_price: product.show_original_price !== false,
          image: getProductMainImage(product.images),
          quantity: Math.max(1, quantity)
        }];
      }
    });

    addToast(`Added ${product.pack_size || product.name} to your bag!`, 'success');
    try {
      trackAddToCart(product, quantity);
    } catch {
      // ignore
    }
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    addToast('Item removed from your cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const originalSubtotal = cart.reduce((acc, item) => {
    const isOrigActive = item.show_original_price !== false && (item.original_price || item.price) > item.price;
    const effectiveOrig = isOrigActive ? (item.original_price || item.price) : item.price;
    return acc + effectiveOrig * item.quantity;
  }, 0);
  const totalSavings = Math.max(0, originalSubtotal - subtotal);
  const freeShippingThreshold = settings.commerce?.freeShippingThreshold !== undefined && settings.commerce?.freeShippingThreshold !== null
    ? Number(settings.commerce.freeShippingThreshold)
    : 1000;
  const standardShippingFee = settings.commerce?.standardShippingFee !== undefined && settings.commerce?.standardShippingFee !== null
    ? Number(settings.commerce.standardShippingFee)
    : 49;
  const isAlwaysFreeShipping = standardShippingFee === 0 || freeShippingThreshold === 0;
  const isFreeShippingUnlocked = isAlwaysFreeShipping || subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShippingUnlocked
    ? 0.00
    : (cart.length > 0 ? standardShippingFee : 0.00);
  const remainingForFreeShipping = isAlwaysFreeShipping
    ? 0
    : Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = isAlwaysFreeShipping
    ? 100
    : (freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100);

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      subtotal,
      totalSavings,
      freeShippingThreshold,
      standardShippingFee,
      shippingFee,
      freeShippingProgress,
      isAlwaysFreeShipping,
      isFreeShippingUnlocked,
      remainingForFreeShipping,
      buyNowItem,
      startBuyNow,
      updateBuyNowQuantity,
      clearBuyNow
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
