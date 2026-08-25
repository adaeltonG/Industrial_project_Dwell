import { ProductAvailability } from "@prisma/client";
import { z } from "zod";

export const slugParams = z.object({ slug: z.string().trim().min(1).max(160) });
export const idParams = z.object({ id: z.uuid() });

export const productListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  vendor: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  availability: z.enum(ProductAvailability).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "title_asc"]).default("newest")
}).refine((query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice, {
  message: "minPrice must not exceed maxPrice",
  path: ["minPrice"]
});

export const productInput = z.object({
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(2).max(200),
  shortTitle: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(5000),
  shortDescription: z.string().trim().min(5).max(500),
  price: z.coerce.number().positive().max(99999999.99),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()).default("GBP"),
  availability: z.enum(ProductAvailability).default(ProductAvailability.IN_STOCK),
  imageUrl: z.url().nullable().optional(),
  externalUrl: z.url(),
  vendorId: z.uuid(),
  categoryId: z.uuid()
});

export const productUpdate = productInput.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required"
});
