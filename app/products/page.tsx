"use client";

import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiRequest, type Category, type Product, type Vendor } from "@/lib/api";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";

function ProductListing() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const update = useCallback((changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value); else next.delete(key);
    }
    router.push(`${pathname}${next.size ? `?${next}` : ""}`);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    Promise.all([apiRequest<Category[]>("/categories"), apiRequest<Vendor[]>("/vendors")])
      .then(([categoryData, vendorData]) => { setCategories(categoryData); setVendors(vendorData); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load filters"));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams(searchParams.toString());
    query.set("limit", "100");
    apiRequest<Product[]>(`/products?${query}`)
      .then(setProducts)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load products"))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const selectedSort = searchParams.get("sort") ?? "newest";
  const sorts = ["newest", "price_asc", "price_desc"];

  return (
    <>
      <Header searchPlaceholder="Search products across all vendors..." />
      <main className="page page--catalog">
        <div className="mobile-search"><SearchBar placeholder="Search products..." /></div>
        <div className="mobile-catalog-actions">
          <button className="btn btn--ghost" type="button" onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal aria-hidden="true" size={22} />Filters</button>
          <button className="btn btn--ghost" type="button" onClick={() => update({ sort: sorts[(sorts.indexOf(selectedSort) + 1) % sorts.length] })}><ArrowUpDown aria-hidden="true" size={19} />Sort</button>
        </div>

        <div className="catalog-top">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
          <div className="sort-panel" aria-label="Sort products">
            <strong>Sort:</strong>
            <button aria-pressed={selectedSort === "price_asc"} onClick={() => update({ sort: "price_asc" })}>Price ↑</button><span>·</span>
            <button aria-pressed={selectedSort === "price_desc"} onClick={() => update({ sort: "price_desc" })}>Price ↓</button><span>·</span>
            <button aria-pressed={selectedSort === "newest"} onClick={() => update({ sort: "newest" })}>Newest</button>
          </div>
        </div>

        <div className="catalog-layout">
          <aside className={`filter-card ${filtersOpen ? "filter-card--open" : ""}`} aria-label="Product filters">
            <h2>Filters</h2>
            <div className="filter-group"><h3>Category</h3>
              <label className="check-row"><input type="radio" name="category" checked={!searchParams.get("category")} onChange={() => update({ category: undefined })} /><span>All categories</span></label>
              {categories.map((category) => <label key={category.id} className="check-row"><input type="radio" name="category" checked={searchParams.get("category") === category.slug} onChange={() => update({ category: category.slug })} /><span>{category.name}</span></label>)}
            </div>
            <div className="filter-divider" />
            <div className="filter-group"><h3>Price range</h3><div className="price-inputs">
              <label>Min £<input aria-label="Minimum price" type="number" min="0" value={searchParams.get("minPrice") ?? ""} onChange={(event) => update({ minPrice: event.target.value || undefined })} /></label>
              <label>Max £<input aria-label="Maximum price" type="number" min="0" value={searchParams.get("maxPrice") ?? ""} onChange={(event) => update({ maxPrice: event.target.value || undefined })} /></label>
            </div></div>
            <div className="filter-divider" />
            <div className="filter-group"><h3>Vendor</h3>
              <label className="check-row"><input type="radio" name="vendor" checked={!searchParams.get("vendor")} onChange={() => update({ vendor: undefined })} /><span>All vendors</span></label>
              {vendors.map((vendor) => <label key={vendor.id} className="check-row"><input type="radio" name="vendor" checked={searchParams.get("vendor") === vendor.slug} onChange={() => update({ vendor: vendor.slug })} /><span>{vendor.name}</span></label>)}
            </div>
          </aside>

          <section aria-label="Products">
            <p className="results-summary">{loading ? "Loading products…" : `${products.length} product${products.length === 1 ? "" : "s"}`}</p>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            {!loading && !error && products.length === 0 ? <p className="empty-note">No products match these filters.</p> : null}
            <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          </section>
        </div>
      </main>
    </>
  );
}

export default function ProductListingPage() {
  return <Suspense fallback={<p className="page">Loading products…</p>}><ProductListing /></Suspense>;
}
