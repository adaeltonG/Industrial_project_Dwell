"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, type Category } from "@/lib/api";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";

const reasons = [
  "Every vendor is verified before their products are listed on the platform.",
  "Transparent pricing with no hidden markup - you pay the vendor's own price.",
  "Search, filter and compare across vendors before you click through to buy."
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<Category[]>("/categories").then(setCategories).catch((reason) => {
      setError(reason instanceof Error ? reason.message : "Could not load categories");
    });
  }, []);

  return (
    <>
      <Header />
      <main className="page page--home">
        <div className="mobile-search">
          <SearchBar placeholder="Search products..." />
        </div>

        <section className="hero">
      
          <h1>Find it. Compare it. Buy with confidence.</h1>
          <p>
            Search, compare and shop products from hundreds of independent vendors
            - all in one place.
          </p>
          <Link href="/products" className="btn btn--primary hero__cta">
            Browse products &rarr;
          </Link>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <h2>Featured categories</h2>
            <p>Explore the most popular product categories on Dwell</p>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {!error && categories.length === 0 ? <p className="empty-note">Loading categories…</p> : null}
        </section>

        <section className="trust-panel" id="about">
          <h2>Why shop with Dwell</h2>
          <ul>
            {reasons.map((reason) => (
              <li key={reason}>
                <span aria-hidden="true" />
                <p>{reason}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
