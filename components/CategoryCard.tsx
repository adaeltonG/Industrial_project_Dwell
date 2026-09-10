import Link from "next/link";
import type { Category } from "@/lib/api";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/products?category=${category.slug}`} className="category-card">
      <ImagePlaceholder className="category-card__image" label="" />
      <h3>{category.name}</h3>
      <p>{category.productCount} {category.productCount === 1 ? "product" : "products"}</p>
    </Link>
  );
}
