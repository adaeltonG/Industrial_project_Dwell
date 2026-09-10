import type { Product } from "./api";

export type CartItem = { product: Product; quantity: number };
export const MAX_QUANTITY = 99;
export const CART_STORAGE_KEY = "dwell-cart-v1";

// Dwell's demo checkout supports currencies with two decimal places.
export function toMinorUnits(price: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(price)) throw new Error("Invalid product price");
  const [whole, fraction = ""] = price.split(".");
  const value = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(value) || value > 9_999_999_999) throw new Error("Invalid product price");
  return value;
}

export function isCartProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const p = value as Product;
  if (![p.id, p.slug, p.title, p.shortTitle, p.price].every((v) => typeof v === "string" && v.length > 0)) return false;
  if (typeof p.currency !== "string" || !/^[A-Z]{3}$/.test(p.currency)) return false;
  if (new Intl.NumberFormat("en", { style: "currency", currency: p.currency }).resolvedOptions().maximumFractionDigits !== 2) return false;
  if (!["IN_STOCK", "PREORDER", "OUT_OF_STOCK"].includes(p.availability)) return false;
  if (!p.vendor || typeof p.vendor.name !== "string" || typeof p.vendor.slug !== "string") return false;
  if (p.imageUrl !== null && typeof p.imageUrl !== "string") return false;
  try { toMinorUnits(p.price); return true; } catch { return false; }
}

export function readCart(raw: string | null): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const items: CartItem[] = [];
    for (const value of parsed.slice(0, 100)) {
      if (!value || !isCartProduct(value.product) || !Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > MAX_QUANTITY) continue;
      if (items.some((item) => item.product.id === value.product.id)) continue;
      if (items.length && items[0].product.currency !== value.product.currency) continue;
      items.push({ product: value.product, quantity: value.quantity });
    }
    return items;
  } catch { return []; }
}

export function addToCart(items: CartItem[], product: Product): { items: CartItem[]; error: string | null } {
  if (!isCartProduct(product)) return { items, error: "This product cannot be added to the demo cart." };
  if (product.availability === "OUT_OF_STOCK") return { items, error: "This item is out of stock." };
  if (items.length && items[0].product.currency !== product.currency) return { items, error: "Please check out your current cart before adding a different currency." };
  const existing = items.find((item) => item.product.id === product.id);
  if (existing && existing.quantity >= MAX_QUANTITY) return { items, error: `You can add up to ${MAX_QUANTITY} of each item.` };
  if (!existing && items.length >= 100) return { items, error: "Your cart is full. Please check out before adding more items." };
  return {
    items: existing ? items.map((item) => item.product.id === product.id ? { product, quantity: item.quantity + 1 } : item) : [...items, { product, quantity: 1 }],
    error: null
  };
}

export function updateQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return items;
  return items.map((item) => item.product.id === id ? { ...item, quantity } : item);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + toMinorUnits(item.product.price) * item.quantity, 0);
}
