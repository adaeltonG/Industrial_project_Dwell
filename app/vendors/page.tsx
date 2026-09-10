"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest, type Vendor } from "@/lib/api";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    apiRequest<Vendor[]>("/vendors").then(setVendors).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load vendors")).finally(() => setLoading(false));
  }, []);

  return <><Header searchPlaceholder="Search..." showVendors={false} /><main className="page page--vendors">
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Vendors" }]} />
    {loading ? <p className="empty-note">Loading vendors…</p> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <section className="vendor-list">
      {vendors.map((vendor) => <article className="vendor-card" key={vendor.id}>
        {vendor.logoUrl ? <div className="image-placeholder vendor-card__logo"><img src={vendor.logoUrl} alt={`${vendor.name} logo`} /></div> : <ImagePlaceholder className="vendor-card__logo" label="logo" />}
        <div><h1>{vendor.name}</h1><p>{vendor.description}</p><p className="vendor-card__meta">{vendor.verifiedSince ? `Verified since ${new Date(vendor.verifiedSince).getFullYear()} · ` : ""}{vendor.productCount ?? 0} products listed</p></div>
        <Link href={`/vendors/${vendor.slug}`} className="btn btn--outline">View vendor <ExternalLink aria-hidden="true" size={18} /></Link>
      </article>)}
    </section>
    {!loading && !error && vendors.length === 0 ? <p className="empty-note">No vendors are listed yet.</p> : null}
  </main></>;
}
