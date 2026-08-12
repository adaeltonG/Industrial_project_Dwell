import type { Category } from "@/lib/data";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="category-card">
      <ImagePlaceholder className="category-card__image" label="" />
      <h3>{category.title}</h3>
      <p>{category.count}</p>
    </article>
  );
}
