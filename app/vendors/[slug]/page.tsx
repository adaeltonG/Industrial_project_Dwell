"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, type Vendor } from "@/lib/api";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { ProductCard } from "@/components/ProductCard";

export default function VendorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest<Vendor>(`/vendors/${encodeURIComponent(slug)}`).then(setVendor).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load vendor")); }, [slug]);

  if (error) return <><Header /><main className="page"><p className="form-error" role="alert">{error}</p><Link href="/vendors">Back to vendors</Link></main></>;
  if (!vendor) return <><Header /><main className="page"><p>Loading vendor…</p></main></>;
  const products = vendor.products ?? [];

  return <><Header searchPlaceholder="Search..." showVendors={false} /><main className="page page--vendor">
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Vendors", href: "/vendors" }, { label: vendor.name }]} />
    <section className="vendor-profile">
      {vendor.logoUrl ? <div className="image-placeholder vendor-profile__logo"><img src={vendor.logoUrl} alt={`${vendor.name} logo`} /></div> : <ImagePlaceholder className="vendor-profile__logo" label="logo" />}
      <div className="vendor-profile__copy"><h1>{vendor.name}</h1><p>{vendor.description}</p><p>{vendor.verifiedSince ? `Verified since ${new Date(vendor.verifiedSince).getFullYear()} · ` : ""}{vendor.productCount ?? products.length} products listed</p></div>
      <a href={vendor.websiteUrl} target="_blank" rel="noreferrer" className="btn btn--outline vendor-profile__button">Visit website <ExternalLink aria-hidden="true" size={19} /></a>
    </section>
    <section className="section-block"><div className="section-heading"><h2>Products from this vendor</h2></div><div className="vendor-products">{products.map((product) => <ProductCard key={product.id} product={product} variant="vendor" />)}</div>
      {products.length === 0 ? <p className="empty-note">This vendor has no products yet.</p> : null}<div className="back-link"><Link href="/products">Browse all products</Link></div>
    </section>
  </main></>;
}
