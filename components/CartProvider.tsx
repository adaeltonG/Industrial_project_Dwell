"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/api";
import { addToCart, CART_STORAGE_KEY, readCart, updateQuantity, type CartItem } from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  addItem: (product: Product) => string | null;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: (expectedItems?: CartItem[]) => boolean;
};
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const current = useRef<CartItem[]>([]);
  const hydrated = useRef(false);

  const commit = useCallback((next: CartItem[]) => {
    current.current = next;
    setItems(next);
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next)); } catch { /* In-memory shopping remains available. */ }
  }, []);

  useEffect(() => {
    try { current.current = readCart(localStorage.getItem(CART_STORAGE_KEY)); } catch { current.current = []; }
    setItems(current.current);
    hydrated.current = true;
    setReady(true);
    function sync(event: StorageEvent) {
      if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
      current.current = readCart(event.newValue);
      setItems(current.current);
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const addItem = useCallback((product: Product) => {
    if (!hydrated.current) return "Your cart is loading. Please try again.";
    const result = addToCart(current.current, product);
    if (!result.error) commit(result.items);
    return result.error;
  }, [commit]);

  return <CartContext.Provider value={{
    items, ready, count: items.reduce((sum, item) => sum + item.quantity, 0), addItem,
    setQuantity: (id, quantity) => { if (hydrated.current) commit(updateQuantity(current.current, id, quantity)); },
    removeItem: (id) => { if (hydrated.current) commit(current.current.filter((item) => item.product.id !== id)); },
    clearCart: (expectedItems) => {
      if (!hydrated.current || (expectedItems && JSON.stringify(expectedItems) !== JSON.stringify(current.current))) return false;
      commit([]);
      return true;
    }
  }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
