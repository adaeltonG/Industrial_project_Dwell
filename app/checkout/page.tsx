"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Header } from "@/components/Header";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/components/CartProvider";
import { cartTotal, toMinorUnits } from "@/lib/cart";
import { apiRequest, formatPrice, type Product } from "@/lib/api";

type Receipt = { reference: string; items: { product: Product; quantity: number }[]; total: number; currency: string };

export default function CheckoutPage() {
  const { items, ready, clearCart } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const currentItems = useRef(items);
  currentItems.current = items;
  const submitting = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const currency = items[0]?.product.currency ?? "GBP";
  const total = cartTotal(items);

  async function simulateCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !ready || !items.length) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (["name", "email", "address", "postcode"].some((field) => !String(fields.get(field) ?? "").trim())) {
      setError("Please complete each delivery field using more than spaces.");
      return;
    }
    submitting.current = true;
    setPending(true);
    setError("");
    const snapshot = JSON.stringify(items);
    const orderItems = items.map((item) => ({ ...item }));
    try {
      const products = await Promise.all(orderItems.map(({ product }) => apiRequest<Product>(`/products/${encodeURIComponent(product.slug)}`, { cache: "no-store" })));
      if (!mounted.current) return;
      if (JSON.stringify(currentItems.current) !== snapshot) throw new Error("Your cart changed during checkout. Review your cart, then try again.");
      for (let index = 0; index < products.length; index++) {
        const latest = products[index];
        const previous = orderItems[index].product;
        if (!latest || latest.id !== previous.id || latest.availability !== previous.availability || latest.availability === "OUT_OF_STOCK" || latest.currency !== previous.currency || toMinorUnits(latest.price) !== toMinorUnits(previous.price)) {
          throw new Error(`${previous.title} has changed or is unavailable. Return to your cart, remove it, and add the current product again before retrying.`);
        }
      }
      const confirmedReceipt = { reference: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, items: orderItems, total, currency };
      if (!clearCart(orderItems)) throw new Error("Your cart changed during checkout. Review your cart, then try again.");
      setReceipt(confirmedReceipt);
      form.reset();
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? `${reason.message} Your cart has been kept.` : "We could not check the products. Your cart has been kept. Please try again.");
    } finally {
      submitting.current = false;
      if (mounted.current) setPending(false);
    }
  }

  return <><Header /><main className="page shopping-page">
    {receipt ? <section className="shopping-receipt" aria-labelledby="receipt-title"><CheckCircle2 size={48} aria-hidden="true" /><p className="shopping-eyebrow">{receipt.reference}</p><h1 id="receipt-title">Your demo is complete.</h1><div className="shopping-receipt__items"><h2>Simulated order</h2>{receipt.items.map(({ product, quantity }) => <div className="checkout-item" key={product.id}><ProductImage product={product} className="checkout-item__image" /><div><h3>{product.title}</h3><p>Quantity: {quantity}</p></div><strong>{formatPrice((toMinorUnits(product.price) * quantity / 100).toFixed(2), product.currency)}</strong></div>)}<p className="shopping-receipt__total">Demo total <strong>{formatPrice((receipt.total / 100).toFixed(2), receipt.currency)}</strong></p></div><Link href="/products" className="btn btn--primary">Continue shopping</Link></section> : <>
      <Link href="/cart" className="shopping-back">← Back to cart</Link><div className="shopping-heading"><h1>Demo checkout</h1><p>Try the checkout experience. No card details, payment or real order.</p></div>
      {!ready ? <p role="status">Loading your cart…</p> : !items.length ? <section className="shopping-empty"><h2>Your cart is empty.</h2><p>Add a product to try the checkout simulation.</p><Link href="/products" className="btn btn--primary">Explore products</Link></section> : <div className="shopping-layout">
        <form className="checkout-form" onSubmit={simulateCheckout}><h2>Demo delivery details</h2><fieldset disabled={pending}><legend className="sr-only">Demo delivery details</legend><label>Full name<input name="name" autoComplete="off" maxLength={120} required /></label><label>Email address<input name="email" type="email" autoComplete="off" maxLength={254} required /></label><label>Delivery address<input name="address" autoComplete="off" maxLength={300} required /></label><label>Postcode<input name="postcode" autoComplete="off" maxLength={20} required /></label></fieldset>{error ? <p className="form-error" role="alert">{error} <Link href="/cart">Review cart</Link></p> : null}<button className="btn btn--primary" disabled={pending} type="submit">{pending ? "Checking products…" : "Complete demo checkout"}</button><p className="checkout-assurance" role="status">{pending ? "Confirming current prices and availability. Please keep this page open." : "No payment will be taken."}</p></form>
        <aside className="shopping-summary"><h2>Your selection</h2><div>{items.map(({ product, quantity }) => <div className="checkout-item" key={product.id}><ProductImage product={product} className="checkout-item__image" /><div><h3>{product.title}</h3><p>Qty {quantity}{product.availability === "PREORDER" ? " · Pre-order" : ""}</p></div><strong>{formatPrice((toMinorUnits(product.price) * quantity / 100).toFixed(2), product.currency)}</strong></div>)}</div><dl><div><dt>Subtotal</dt><dd>{formatPrice((total / 100).toFixed(2), currency)}</dd></div><div><dt>Demo delivery</dt><dd>Free</dd></div><div className="shopping-summary__total"><dt>Demo total</dt><dd>{formatPrice((total / 100).toFixed(2), currency)}</dd></div></dl></aside>
      </div>}
    </>}
  </main></>;
}
