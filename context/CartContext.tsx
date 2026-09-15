'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[]; // product IDs or slugs
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: any, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  totalItemsCount: number;
  freeShippingProgress: number;
  freeShippingRemaining: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 1500;
const BASE_SHIPPING_FEE = 70;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const { success, info, error } = useToast();

  // Load from local storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('havitall_cart');
      const savedWishlist = localStorage.getItem('havitall_wishlist');
      const savedCoupon = localStorage.getItem('havitall_coupon');

      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      if (savedCoupon) setAppliedCoupon(savedCoupon);
    } catch (e) {
      console.error('Error loading cart state from localStorage:', e);
    }
    setMounted(true);
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('havitall_cart', JSON.stringify(cart));
      localStorage.setItem('havitall_wishlist', JSON.stringify(wishlist));
      if (appliedCoupon) {
        localStorage.setItem('havitall_coupon', appliedCoupon);
      } else {
        localStorage.removeItem('havitall_coupon');
      }
    } catch (e) {
      console.error('Error saving cart state to localStorage:', e);
    }
  }, [cart, wishlist, appliedCoupon, mounted]);

  const addToCart = (
    product: any,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    const itemKey = `${product._id || product.id || product.slug}-${selectedColor || 'default'}-${selectedSize || 'default'}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === itemKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        id: itemKey,
        productId: product._id || product.id || product.slug,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        image: product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
        quantity,
        selectedColor: selectedColor || product.variants?.colors?.[0],
        selectedSize: selectedSize || product.variants?.sizes?.[0],
        stock: product.stock,
      };

      return [...prev, newItem];
    });

    success(`Added "${product.name}" to cart!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    info('Item removed from cart');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        info('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        success('Added to wishlist ❤️');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : BASE_SHIPPING_FEE;

  // Coupon calculation
  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'HAVITALL20') {
      setAppliedCoupon(cleanCode);
      success('Coupon applied! 20% discount added.');
      return true;
    } else if (cleanCode === 'HAVITALL200') {
      setAppliedCoupon(cleanCode);
      success('Coupon applied! ৳200 flat discount added.');
      return true;
    } else if (cleanCode === 'WELCOME10') {
      setAppliedCoupon(cleanCode);
      success('Coupon applied! 10% welcome discount added.');
      return true;
    } else {
      error('Invalid promo code. Try HAVITALL20 or HAVITALL200');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    info('Coupon removed');
  };

  let discount = 0;
  if (appliedCoupon === 'HAVITALL20') {
    discount = Math.round(subtotal * 0.2);
  } else if (appliedCoupon === 'HAVITALL200') {
    discount = Math.min(subtotal, 200);
  } else if (appliedCoupon === 'WELCOME10') {
    discount = Math.round(subtotal * 0.1);
  }

  const total = Math.max(0, subtotal + shippingFee - discount);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        subtotal,
        shippingFee,
        discount,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        totalItemsCount,
        freeShippingProgress,
        freeShippingRemaining,
      }}
    >
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
