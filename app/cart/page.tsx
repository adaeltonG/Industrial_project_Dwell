"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/components/CartProvider";
import { cartTotal, MAX_QUANTITY, toMinorUnits } from "@/lib/cart";
import { formatPrice } from "@/lib/api";

function QuantityInput({ title, quantity, onChange }: { title: string; quantity: number; onChange: (quantity: number) => void }) {
  const [draft, setDraft] = useState(String(quantity));
  useEffect(() => setDraft(String(quantity)), [quantity]);
  return <input aria-label={`Quantity for ${title}`} type="number" min={1} max={MAX_QUANTITY} step={1} value={draft} onChange={(event) => {
    const next = event.target.value;
    setDraft(next);
    const value = Number(next);
    if (next !== "" && Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY) onChange(value);
  }} onBlur={() => setDraft(String(quantity))} />;
}

export default function CartPage() {
  const { items, ready, count, setQuantity, removeItem } = useCart();
  const [feedback, setFeedback] = useState("");
  const currency = items[0]?.product.currency ?? "GBP";
  return <><Header /><main className="page shopping-page">
    <Link href="/products" className="shopping-back">← Continue shopping</Link>
    <div className="shopping-heading"><p className="shopping-eyebrow">Your considered collection</p><h1>Your cart <span>({count})</span></h1><p>Review your favourites before trying our demo checkout.</p></div>
    {!ready ? <p role="status">Loading your cart…</p> : !items.length ? <section className="shopping-empty"><ShoppingBag size={42} aria-hidden="true" /><h2>A little room for something good.</h2><p>Your cart is empty. Explore products from our independent vendors.</p><Link href="/products" className="btn btn--primary">Explore products</Link></section> : <div className="shopping-layout">
      <section aria-label="Cart items"><ul className="cart-items">{items.map(({ product, quantity }) => <li className="cart-row" key={product.id}>
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.title}`}><ProductImage product={product} className="cart-row__image" /></Link>
        <div className="cart-row__info"><p className="shopping-eyebrow">{product.vendor.name}</p><h2><Link href={`/products/${product.slug}`}>{product.title}</Link></h2><p>{formatPrice(product.price, product.currency)} each{product.availability === "PREORDER" ? " · Pre-order" : ""}</p>
          <div className="cart-row__controls"><label>Quantity<QuantityInput title={product.title} quantity={quantity} onChange={(value) => setQuantity(product.id, value)} /></label><button type="button" className="shopping-text-button" onClick={() => { removeItem(product.id); setFeedback(`${product.title} removed from cart.`); }}>Remove</button></div>
        </div><strong className="cart-row__total">{formatPrice((toMinorUnits(product.price) * quantity / 100).toFixed(2), product.currency)}</strong>
      </li>)}</ul><p role="status" className="cart-feedback">{feedback}</p></section>
      <aside className="shopping-summary"><h2>Order summary</h2><dl><div><dt>Subtotal</dt><dd>{formatPrice((cartTotal(items) / 100).toFixed(2), currency)}</dd></div><div><dt>Demo delivery</dt><dd>Free</dd></div><div className="shopping-summary__total"><dt>Total</dt><dd>{formatPrice((cartTotal(items) / 100).toFixed(2), currency)}</dd></div></dl><Link href="/checkout" className="btn btn--primary">Try demo checkout →</Link><p>This is a simulation. No payment is taken and no real order is placed.</p></aside>
    </div>}
  </main></>;
}
