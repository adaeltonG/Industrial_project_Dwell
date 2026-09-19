export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/dwell/api/v1";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "VENDOR" | "ADMIN";
  vendorId?: string | null;
  vendor?: Vendor | null;
};

export type Vendor = {
  id: string;
  slug: string;
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl: string | null;
  verifiedSince: string | null;
  productCount?: number;
  products?: Product[];
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  productCount: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  price: string;
  currency: string;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  imageUrl: string | null;
  externalUrl: string;
  vendorId: string;
  categoryId: string;
  vendor: Vendor;
  category: Category;
};

export type ProductInput = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  availability: Product["availability"];
  imageUrl: string | null;
  externalUrl: string;
  vendorId: string;
  categoryId: string;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...requestOptions,
    headers: {
      ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null) as
    | { data?: T; error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new ApiError(response.status, payload?.error?.message ?? "Something went wrong");
  }

  return payload?.data as T;
}

export function formatPrice(price: string, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency
  }).format(Number(price));
}

// Admin must also show inventory beyond the API's 100-item page limit.
export async function allProducts(token: string, vendor?: string): Promise<Product[]> {
  const products: Product[] = [];
  for (let page = 1; ; page++) {
    const items = await apiRequest<Product[]>(`/products?limit=100&page=${page}${vendor ? `&vendor=${encodeURIComponent(vendor)}` : ""}`, { token });
    products.push(...items);
    if (items.length < 100) return products;
  }
}

export function availabilityLabel(value: Product["availability"]) {
  return value === "IN_STOCK" ? "In stock" : value === "PREORDER" ? "Pre-order" : "Out of stock";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
