import Link from "next/link";
import type { Product } from "@/lib/data";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

type ProductCardProps = {
  product: Product;
  variant?: "catalog" | "vendor";
};

export function ProductCard({ product, variant = "catalog" }: ProductCardProps) {
  return (
    <article className={`product-card product-card--${variant}`}>
      <ImagePlaceholder className="product-card__image" />
      <div className="product-card__body">
        <h3>
          <span className="desktop-title">{product.title}</span>
          <span className="mobile-title">{product.shortTitle}</span>
        </h3>
        {variant === "catalog" ? (
          <p className="product-card__vendor">{product.vendor}</p>
        ) : null}
        <div className="product-card__footer">
          <p className="price">{product.price}</p>
          <Link href={`/products/${product.slug}`} className="btn btn--outline btn--small">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
