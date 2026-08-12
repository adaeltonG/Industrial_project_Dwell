import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductsByVendor, getVendor, vendors } from "@/lib/data";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { ProductCard } from "@/components/ProductCard";

type VendorPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return vendors.map((vendor) => ({ slug: vendor.slug }));
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { slug } = await params;
  const vendor = getVendor(slug);

  if (!vendor) {
    notFound();
  }

  const vendorProducts = getProductsByVendor(vendor.slug);

  return (
    <>
      <Header searchPlaceholder="Search..." showVendors={false} />
      <main className="page page--vendor">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Vendors", href: "/vendors" },
            { label: vendor.name }
          ]}
        />

        <section className="vendor-profile">
          <ImagePlaceholder className="vendor-profile__logo" label="logo" />
          <div className="vendor-profile__copy">
            <h1>{vendor.name}</h1>
            <p>{vendor.description}</p>
            <p>{vendor.meta}</p>
          </div>
          <a href={vendor.website} className="btn btn--outline vendor-profile__button">
            Visit website <ExternalLink aria-hidden="true" size={19} />
          </a>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <h2>Products from this vendor</h2>
          </div>
          <div className="vendor-products">
            {vendorProducts.map((product) => (
              <ProductCard key={product.slug} product={product} variant="vendor" />
            ))}
          </div>
          {vendorProducts.length === 0 ? (
            <p className="empty-note">
              This frontend prototype has no products for this vendor yet.
            </p>
          ) : null}
          <div className="back-link">
            <Link href="/products">Browse all products</Link>
          </div>
        </section>
      </main>
    </>
  );
}
