export type Product = {
  slug: string;
  title: string;
  shortTitle: string;
  vendor: string;
  vendorSlug: string;
  category: string;
  price: string;
  description: string;
  shortDescription: string;
  availability: string;
};

export type Category = {
  title: string;
  count: string;
};

export type Vendor = {
  slug: string;
  name: string;
  description: string;
  meta: string;
  website: string;
};

export const categories: Category[] = [
  { title: "Electronics", count: "180+ products" },
  { title: "Home & Garden", count: "140+ products" },
  { title: "Fashion", count: "260+ products" },
  { title: "Sports & Outdoors", count: "95+ products" }
];

export const products: Product[] = [
  {
    slug: "ceramic-pour-over-kettle",
    title: "Ceramic Pour-Over Kettle",
    shortTitle: "Ceramic Kettle",
    vendor: "North & Co.",
    vendorSlug: "north-co",
    category: "Home & Garden",
    price: "\u00A338.00",
    description:
      "Hand-finished ceramic pour-over kettle with a precision gooseneck spout for controlled brewing. Holds 900ml and is dishwasher-safe. Designed and quality-checked by North & Co., an independent vendor verified on Dwell.",
    shortDescription:
      "Hand-finished ceramic pour-over kettle with a precision gooseneck spout. Holds 900ml and is dishwasher-safe.",
    availability: "In stock"
  },
  {
    slug: "woven-storage-basket",
    title: "Woven Storage Basket",
    shortTitle: "Storage Basket",
    vendor: "Willowbrook",
    vendorSlug: "willowbrook",
    category: "Home & Garden",
    price: "\u00A324.50",
    description:
      "A woven storage basket for blankets, toys, and everyday household essentials.",
    shortDescription: "A woven storage basket for everyday household essentials.",
    availability: "In stock"
  },
  {
    slug: "recycled-wool-throw",
    title: "Recycled Wool Throw",
    shortTitle: "Wool Throw",
    vendor: "Fernway Supply",
    vendorSlug: "fernway-supply",
    category: "Fashion",
    price: "\u00A362.00",
    description:
      "A soft recycled wool throw designed for cool evenings and layered interiors.",
    shortDescription: "A soft recycled wool throw for cool evenings.",
    availability: "In stock"
  },
  {
    slug: "bamboo-desk-organiser",
    title: "Bamboo Desk Organiser",
    shortTitle: "Desk Organiser",
    vendor: "North & Co.",
    vendorSlug: "north-co",
    category: "Home & Garden",
    price: "\u00A319.00",
    description:
      "A compact bamboo organiser for notebooks, stationery, and desk accessories.",
    shortDescription: "A compact bamboo organiser for stationery.",
    availability: "In stock"
  },
  {
    slug: "linen-cushion-cover",
    title: "Linen Cushion Cover",
    shortTitle: "Linen Cover",
    vendor: "Willowbrook",
    vendorSlug: "willowbrook",
    category: "Home & Garden",
    price: "\u00A316.50",
    description:
      "A breathable linen cushion cover with a relaxed, natural texture.",
    shortDescription: "A breathable linen cushion cover.",
    availability: "In stock"
  },
  {
    slug: "cast-iron-plant-stand",
    title: "Cast Iron Plant Stand",
    shortTitle: "Plant Stand",
    vendor: "Fernway Supply",
    vendorSlug: "fernway-supply",
    category: "Home & Garden",
    price: "\u00A345.00",
    description:
      "A sturdy cast iron plant stand for indoor greenery and small planters.",
    shortDescription: "A sturdy cast iron plant stand.",
    availability: "In stock"
  },
  {
    slug: "oak-serving-board",
    title: "Oak Serving Board",
    shortTitle: "Serving Board",
    vendor: "North & Co.",
    vendorSlug: "north-co",
    category: "Home & Garden",
    price: "\u00A329.50",
    description:
      "An oak serving board for hosting, grazing plates, and everyday prep.",
    shortDescription: "An oak serving board for hosting and prep.",
    availability: "In stock"
  }
];

export const vendors: Vendor[] = [
  {
    slug: "north-co",
    name: "North & Co.",
    description:
      "Independent homeware & kitchen goods maker, based in Bristol, UK.",
    meta: "Verified vendor since 2022 · 42 products listed",
    website: "https://example.com"
  },
  {
    slug: "willowbrook",
    name: "Willowbrook",
    description: "Soft furnishings and storage essentials for calm homes.",
    meta: "Verified vendor since 2021 · 35 products listed",
    website: "https://example.com"
  },
  {
    slug: "fernway-supply",
    name: "Fernway Supply",
    description: "Useful everyday objects made with durable materials.",
    meta: "Verified vendor since 2023 · 28 products listed",
    website: "https://example.com"
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getVendor(slug: string) {
  return vendors.find((vendor) => vendor.slug === slug);
}

export function getProductsByVendor(slug: string) {
  return products.filter((product) => product.vendorSlug === slug);
}
