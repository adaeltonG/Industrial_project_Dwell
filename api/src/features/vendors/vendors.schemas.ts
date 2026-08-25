import { z } from "zod";

export const vendorInput = z.object({
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(2000),
  websiteUrl: z.url(),
  logoUrl: z.url().nullable().optional(),
  verifiedSince: z.iso.date().nullable().optional().transform((value) => value ? new Date(`${value}T00:00:00.000Z`) : value)
});

export const vendorUpdate = vendorInput.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required"
});

export const categoryInput = z.object({
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).nullable().optional()
});

export const categoryUpdate = categoryInput.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required"
});
