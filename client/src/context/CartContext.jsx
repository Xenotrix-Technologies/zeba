import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { addToast } = useToast();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('zeba_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

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
          price: parseFloat(product.price),
          original_price: parseFloat(product.original_price || product.price),
          image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : (typeof product.images === 'string' ? JSON.parse(product.images)[0] : '/images/zeba-1pack.jpg'),
          quantity
        }];
      }
    });

    addToast(`Added ${product.pack_size || product.name} to your bag!`, 'success');
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
  const originalSubtotal = cart.reduce((acc, item) => acc + (item.original_price || item.price) * item.quantity, 0);
  const totalSavings = Math.max(0, originalSubtotal - subtotal);
  const freeShippingThreshold = 499;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

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
      freeShippingProgress
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
