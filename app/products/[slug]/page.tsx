import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/data";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

type ProductDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Header searchPlaceholder="Search..." mobileAction="login" showVendors={false} />
      <main className="page page--details">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.title }
          ]}
        />

        <section className="details-layout">
          <ImagePlaceholder className="details-image" label="product image" />
          <div className="details-info">
            <p className="badge badge--soft">{product.category.toUpperCase()}</p>
            <h1>{product.title}</h1>
            <p className="vendor-line">
              Vendor:{" "}
              <Link href={`/vendors/${product.vendorSlug}`}>
                {product.vendor} <ExternalLink aria-hidden="true" size={18} />
              </Link>
            </p>
            <p className="details-price">{product.price}</p>
            <p className="stock-pill">{product.availability}</p>

            <div className="details-divider" />

            <div className="description">
              <h2>Description</h2>
              <p>
                <span className="desktop-copy">{product.description}</span>
                <span className="mobile-copy">{product.shortDescription}</span>
              </p>
            </div>

            <div className="details-actions">
              <a href="https://example.com" className="btn btn--primary">
                <ExternalLink aria-hidden="true" size={19} />
                Visit vendor website
              </a>
              <button className="btn btn--outline" type="button">
                Save for later
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
