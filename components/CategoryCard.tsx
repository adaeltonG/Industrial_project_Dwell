import Link from "next/link";
import type { Category } from "@/lib/api";

const categoryImages: Record<string, string> = {
  electronics: "/dwell/images/products/wireless-keyboard.png",
  fashion: "/dwell/images/products/organic-cotton-tee.png",
  "home-garden": "/dwell/images/products/ceramic-pour-over-kettle.png",
  "sports-outdoors": "/dwell/images/products/camping-lantern.png"
};

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/products?category=${category.slug}`} className="category-card">
      <div className="image-placeholder category-card__image">
        <img
          src={categoryImages[category.slug] ?? "/dwell/images/products/woven-storage-basket.png"}
          alt={`${category.name} products`}
          loading="lazy"
        />
      </div>
      <h3>{category.name}</h3>
      <p>{category.productCount} {category.productCount === 1 ? "product" : "products"}</p>
    </Link>
  );
}
