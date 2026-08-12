import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { vendors } from "@/lib/data";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export default function VendorsPage() {
  return (
    <>
      <Header searchPlaceholder="Search..." showVendors={false} />
      <main className="page page--vendors">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Vendors" }]} />
        <section className="vendor-list">
          {vendors.map((vendor) => (
            <article className="vendor-card" key={vendor.slug}>
              <ImagePlaceholder className="vendor-card__logo" label="logo" />
              <div>
                <h1>{vendor.name}</h1>
                <p>{vendor.description}</p>
                <p className="vendor-card__meta">{vendor.meta}</p>
              </div>
              <Link href={`/vendors/${vendor.slug}`} className="btn btn--outline">
                View vendor <ExternalLink aria-hidden="true" size={18} />
              </Link>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
