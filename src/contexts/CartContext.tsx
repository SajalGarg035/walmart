import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../data/products';
import toast from 'react-hot-toast';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: {
    size?: string;
    color?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variants?: { size?: string; color?: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getCartSubtotal: () => number;
  getTax: () => number;
  getShipping: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('walmart-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('walmart-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1, variants?: { size?: string; color?: string }) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => 
        item.product.id === product.id &&
        item.selectedVariants?.size === variants?.size &&
        item.selectedVariants?.color === variants?.color
      );
      
      if (existingItemIndex > -1) {
        const newQuantity = currentItems[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stock) {
          toast.error('Not enough stock available');
          return currentItems;
        }
        
        toast.success('Quantity updated in cart');
        return currentItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > product.stock) {
          toast.error('Not enough stock available');
          return currentItems;
        }
        
        toast.success('Product added to cart');
        return [...currentItems, {
          product,
          quantity,
          selectedVariants: variants
        }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.product.id !== productId);
      toast.success('Product removed from cart');
      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            toast.error('Not enough stock available');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Cart cleared');
  };

  const getCartSubtotal = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTax = () => {
    return getCartSubtotal() * 0.08; // 8% tax
  };

  const getShipping = () => {
    const subtotal = getCartSubtotal();
    return subtotal > 35 ? 0 : 5.99; // Free shipping over $35
  };

  const getCartTotal = () => {
    return getCartSubtotal() + getTax() + getShipping();
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getCartSubtotal,
      getTax,
      getShipping
    }}>
      {children}
    </CartContext.Provider>
  );
};