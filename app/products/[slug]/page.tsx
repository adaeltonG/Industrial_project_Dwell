"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, availabilityLabel, formatPrice, type Product } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/components/CartProvider";

type SavedProduct = { product: Product };

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const { addItem, ready } = useCart();
  const [cartFeedback, setCartFeedback] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<Product>(`/products/${encodeURIComponent(slug)}`)
      .then(setProduct)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load product"));
  }, [slug]);

  useEffect(() => {
    if (authLoading || !token) return;
    apiRequest<SavedProduct[]>("/users/me/saved-products", { token })
      .then((items) => setSaved(items.some((item) => item.product.slug === slug)))
      .catch(() => undefined);
  }, [authLoading, slug, token]);

  async function toggleSaved() {
    if (!token) {
      router.push("/login");
      return;
    }
    if (!product) return;
    setPending(true);
    setError("");
    try {
      await apiRequest<void>(`/users/me/saved-products/${product.id}`, { method: saved ? "DELETE" : "PUT", token });
      setSaved(!saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update saved products");
    } finally {
      setPending(false);
    }
  }

  if (error && !product) return <><Header /><main className="page"><p className="form-error" role="alert">{error}</p><Link href="/products">Back to products</Link></main></>;
  if (!product) return <><Header /><main className="page"><p>Loading product…</p></main></>;

  return (
    <>
      <Header searchPlaceholder="Search..." mobileAction="login" showVendors={false} />
      <main className="page page--details">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.title }]} />
        <section className="details-layout">
          <ProductImage product={product} className="details-image" />
          <div className="details-info">
            <p className="badge badge--soft">{product.category.name.toUpperCase()}</p>
            <h1>{product.title}</h1>
            <p className="vendor-line">Vendor: <Link href={`/vendors/${product.vendor.slug}`}>{product.vendor.name} <ExternalLink aria-hidden="true" size={18} /></Link></p>
            <p className="details-price">{formatPrice(product.price, product.currency)}</p>
            <p className="stock-pill">{availabilityLabel(product.availability)}</p>
            <div className="details-divider" />
            <div className="description"><h2>Description</h2><p><span className="desktop-copy">{product.description}</span><span className="mobile-copy">{product.shortDescription}</span></p></div>
            <div className="details-actions">
              <button className="btn btn--primary" type="button" disabled={!ready || product.availability === "OUT_OF_STOCK"} onClick={() => setCartFeedback(addItem(product) ?? "Added to cart.")}>{product.availability === "OUT_OF_STOCK" ? "Out of stock" : "Add to cart"}</button>
              <p className="cart-feedback" role="status">{cartFeedback}</p>
              <a href={product.externalUrl} target="_blank" rel="noreferrer" className="btn btn--primary"><ExternalLink aria-hidden="true" size={19} />Visit vendor website</a>
              <button className="btn btn--outline" type="button" onClick={toggleSaved} disabled={pending}>{pending ? "Updating…" : saved ? "Saved — remove" : "Save for later"}</button>
              {error ? <p className="form-error" role="alert">{error}</p> : null}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
