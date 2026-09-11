"use client";

import { useState } from "react";
import type { Product } from "@/lib/api";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

const bundled = new Set([
  "ceramic-pour-over-kettle", "woven-storage-basket", "recycled-wool-throw",
  "bamboo-desk-organiser", "linen-cushion-cover", "cast-iron-plant-stand", "oak-serving-board",
  "stoneware-mug", "cotton-table-runner", "glass-storage-jars", "terracotta-planter",
  "reading-lamp", "wireless-keyboard", "usb-c-hub", "portable-speaker", "charging-stand",
  "laptop-sleeve", "canvas-tote-bag", "merino-scarf", "organic-cotton-tee", "knitted-beanie",
  "recycled-daypack", "insulated-water-bottle", "cork-yoga-mat", "camping-lantern",
  "picnic-blanket", "resistance-band-set", "linen-apron", "wooden-wall-hooks", "cotton-bath-towel"
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
