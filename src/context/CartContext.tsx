"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const fetchCart = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        console.log("Cart data:", data); // Debug log
        
        // Map API response (which uses 'qty') to our CartItem format (which uses 'quantity')
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
  };

  const addToCart = async (item: CartItem) => {
    if (!session?.user) return;
    
    setIsLoading(true);
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
        const data = await response.json();
        // Map the response items
        const items = (data.items || []).map((cartItem: any) => ({
          productId: cartItem.productId?.toString() || cartItem.productId,
          name: cartItem.name,
          brand: cartItem.brand || "",
          price: Number(cartItem.price) || 0,
          quantity: cartItem.qty || 1,
          size: cartItem.size || "Standard",
          image: cartItem.image || null,
        }));
        setCartItems(items);
      } else {
        const error = await response.json();
        console.error("Add to cart error:", error);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size }),
      });

      if (response.ok) {
        const data = await response.json();
        const items = (data.items || []).map((cartItem: any) => ({
          productId: cartItem.productId?.toString() || cartItem.productId,
          name: cartItem.name,
          brand: cartItem.brand || "",
          price: Number(cartItem.price) || 0,
          quantity: cartItem.qty || 1,
          size: cartItem.size || "Standard",
          image: cartItem.image || null,
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
    }
  };

  const updateQuantity = async (productId: string, size: string, quantity: number) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size, qty: quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        const items = (data.items || []).map((cartItem: any) => ({
          productId: cartItem.productId?.toString() || cartItem.productId,
          name: cartItem.name,
          brand: cartItem.brand || "",
          price: Number(cartItem.price) || 0,
          quantity: cartItem.qty || 1,
          size: cartItem.size || "Standard",
          image: cartItem.image || null,
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  const clearCart = async () => {
    if (!session?.user) return;
    
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
  };

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [session]);

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