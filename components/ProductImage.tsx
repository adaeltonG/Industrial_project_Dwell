"use client";

import { useState } from "react";
import type { Product } from "@/lib/api";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

const bundled = new Set([
  "ceramic-pour-over-kettle", "woven-storage-basket", "recycled-wool-throw",
  "bamboo-desk-organiser", "linen-cushion-cover", "cast-iron-plant-stand", "oak-serving-board"
]);

export function ProductImage({ product, className = "" }: {
  product: Pick<Product, "slug" | "title" | "imageUrl">;
  className?: string;
}) {
  const fallback = bundled.has(product.slug) ? `/dwell/images/products/${product.slug}.png` : null;
  const [failed, setFailed] = useState<string[]>([]);
  const source = [product.imageUrl, fallback].find((url) => url && !failed.includes(url));
  if (!source) return <ImagePlaceholder className={className} label={`${product.title} image unavailable`} />;
  return <div className={`image-placeholder ${className}`}>
    <img src={source} alt={product.title} loading="lazy" onError={() => setFailed((urls) => [...urls, source])} />
  </div>;
}
