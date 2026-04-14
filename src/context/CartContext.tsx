"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  size: string;
  image: string | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "guest_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Load guest cart from localStorage
  const loadGuestCart = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          setCartItems(items);
        } catch (e) {
          console.error("Failed to parse guest cart:", e);
        }
      }
    }
  }, []);

  // Save guest cart to localStorage
  const saveGuestCart = useCallback((items: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, []);

  // Sync guest cart to database when user logs in
  const syncGuestCartToServer = useCallback(async () => {
    const guestItems = cartItems;
    if (guestItems.length === 0) return;

    console.log("Syncing guest cart to server:", guestItems);

    for (const item of guestItems) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            name: item.name,
            brand: item.brand,
            price: Number(item.price),
            qty: item.quantity,
            size: item.size,
            image: item.image,
          }),
        });
      } catch (error) {
        console.error("Failed to sync item:", error);
      }
    }

    // Clear guest cart after sync
    localStorage.removeItem(STORAGE_KEY);
    setCartItems([]);
    
    // Fetch server cart
    await fetchCart();
  }, [cartItems]);

  const fetchCart = useCallback(async () => {
    if (session?.user) {
      // Logged in: fetch from server
      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = await response.json();
          console.log("Cart data:", data);
          
          const items = (data.items || []).map((item: any) => ({
            productId: item.productId?.toString() || item.productId,
            name: item.name,
            brand: item.brand || "",
            price: Number(item.price) || 0,
            quantity: item.qty || 1,
            size: item.size || "Standard",
            image: item.image || null,
          }));
          
          setCartItems(items);
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    } else {
      // Guest: load from localStorage
      loadGuestCart();
    }
  }, [session?.user, loadGuestCart]);

  const addToCart = async (item: CartItem) => {
    setIsLoading(true);
    
    if (session?.user) {
      // Logged in: add to server cart
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            name: item.name,
            brand: item.brand,
            price: Number(item.price),
            qty: item.quantity,
            size: item.size,
            image: item.image,
          }),
        });

        if (response.ok) {
          await fetchCart();
        } else {
          const error = await response.json();
          console.error("Add to cart error:", error);
        }
      } catch (error) {
        console.error("Add to cart error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest: add to localStorage
      const existingItemIndex = cartItems.findIndex(
        (i) => i.productId === item.productId && i.size === item.size
      );

      let newItems: CartItem[];
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        newItems = [...cartItems];
        newItems[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item
        newItems = [...cartItems, item];
      }
      
      setCartItems(newItems);
      saveGuestCart(newItems);
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    if (session?.user) {
      // Logged in: remove from server
      try {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, size }),
        });

        if (response.ok) {
          await fetchCart();
        }
      } catch (error) {
        console.error("Remove from cart error:", error);
      }
    } else {
      // Guest: remove from localStorage
      const newItems = cartItems.filter(
        (item) => !(item.productId === productId && item.size === size)
      );
      setCartItems(newItems);
      saveGuestCart(newItems);
    }
  };

  const updateQuantity = async (productId: string, size: string, quantity: number) => {
    if (session?.user) {
      // Logged in: update on server
      try {
        const response = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, size, qty: quantity }),
        });

        if (response.ok) {
          await fetchCart();
        }
      } catch (error) {
        console.error("Update quantity error:", error);
      }
    } else {
      // Guest: update in localStorage
      const newItems = cartItems.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );
      setCartItems(newItems);
      saveGuestCart(newItems);
    }
  };

  const clearCart = async () => {
    if (session?.user) {
      // Logged in: clear server cart
      try {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clearAll: true }),
        });
        if (response.ok) {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Clear cart error:", error);
      }
    } else {
      // Guest: clear localStorage
      setCartItems([]);
      saveGuestCart([]);
    }
  };

  // Sync guest cart to server when user logs in
  useEffect(() => {
    if (session?.user && !isInitialized) {
      syncGuestCartToServer();
      setIsInitialized(true);
    }
  }, [session?.user, isInitialized, syncGuestCartToServer]);

  // Initial load
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        isLoading,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}