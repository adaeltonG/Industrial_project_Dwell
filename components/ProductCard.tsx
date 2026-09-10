"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, type Product } from "@/lib/api";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/components/CartProvider";

type ProductCardProps = {
  product: Product;
  variant?: "catalog" | "vendor";
};

export function ProductCard({ product, variant = "catalog" }: ProductCardProps) {
  const { addItem, ready } = useCart();
  const [feedback, setFeedback] = useState("");
  return (
    <article className={`product-card product-card--${variant}`}>
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.title}`}><ProductImage product={product} className="product-card__image" /></Link>
      <div className="product-card__body">
        <h3>
          <span className="desktop-title">{product.title}</span>
          <span className="mobile-title">{product.shortTitle}</span>
        </h3>
        {variant === "catalog" ? (
          <p className="product-card__vendor">{product.vendor.name}</p>
        ) : null}
        <div className="product-card__footer">
          <p className="price">{formatPrice(product.price, product.currency)}</p>
          <Link href={`/products/${product.slug}`} className="btn btn--outline btn--small">
            View
          </Link>
        </div>
        <button type="button" className="btn btn--primary product-card__add" disabled={!ready || product.availability === "OUT_OF_STOCK"} onClick={() => setFeedback(addItem(product) ?? "Added to cart.")}>{product.availability === "OUT_OF_STOCK" ? "Out of stock" : "Add to cart"}</button>
        <p className="cart-feedback" role="status">{feedback}</p>
      </div>
    </article>
  );
}
