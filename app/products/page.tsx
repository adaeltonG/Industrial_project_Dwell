import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { products } from "@/lib/data";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";

export default function ProductListingPage() {
  return (
    <>
      <Header searchPlaceholder="Search products across all vendors..." />
      <main className="page page--catalog">
        <div className="mobile-search">
          <SearchBar placeholder="Search products..." />
        </div>
        <div className="mobile-catalog-actions">
          <button className="btn btn--ghost" type="button">
            <SlidersHorizontal aria-hidden="true" size={22} />
            Filters
          </button>
          <button className="btn btn--ghost" type="button">
            <ArrowUpDown aria-hidden="true" size={19} />
            Sort
          </button>
        </div>

        <div className="catalog-top">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
          <div className="sort-panel" aria-label="Sort products">
            <strong>Sort:</strong>
            <button type="button">Price ↑</button>
            <span>·</span>
            <button type="button">Price ↓</button>
            <span>·</span>
            <button type="button">Newest</button>
          </div>
        </div>

        <div className="catalog-layout">
          <aside className="filter-card" aria-label="Product filters">
            <h2>Filters</h2>
            <div className="filter-group">
              <h3>Category</h3>
              {["Electronics", "Home & Garden", "Fashion", "Sports & Outdoors"].map(
                (category) => (
                  <label key={category} className="check-row">
                    <input type="checkbox" />
                    <span>{category}</span>
                  </label>
                )
              )}
            </div>
            <div className="filter-divider" />
            <div className="filter-group">
              <h3>Price range</h3>
              <div className="range-track" aria-hidden="true">
                <span />
                <i />
                <i />
              </div>
              <div className="range-labels">
                <span>£10</span>
                <span>£250</span>
              </div>
            </div>
            <div className="filter-divider" />
            <div className="filter-group">
              <h3>Vendor</h3>
              {["North & Co.", "Willowbrook", "Fernway Supply"].map((vendor) => (
                <label key={vendor} className="check-row">
                  <input type="checkbox" />
                  <span>{vendor}</span>
                </label>
              ))}
            </div>
          </aside>

          <section className="product-grid" aria-label="Products">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
