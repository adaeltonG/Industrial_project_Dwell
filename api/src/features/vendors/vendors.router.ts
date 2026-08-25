import { UserRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { ApiError } from "../../lib/api-error.js";
import { serializeProduct } from "../../lib/serializers.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { vendorInput, vendorUpdate } from "./vendors.schemas.js";

export const vendorsRouter = Router();
const slugParams = z.object({ slug: z.string().min(1).max(100) });
const idParams = z.object({ id: z.uuid() });

vendorsRouter.get("/", async (_req, res) => {
  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  res.json({ data: vendors.map(({ _count, ...vendor }) => ({ ...vendor, productCount: _count.products })) });
});

vendorsRouter.get("/:slug", validate({ params: slugParams }), async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: String(req.params.slug) },
    include: { products: { include: { vendor: true, category: true }, orderBy: { createdAt: "desc" } } }
  });
  if (!vendor) throw new ApiError(404, "NOT_FOUND", "Vendor not found");
  res.json({ data: { ...vendor, productCount: vendor.products.length, products: vendor.products.map(serializeProduct) } });
});

vendorsRouter.post("/", authenticate, requireRole(UserRole.ADMIN), validate({ body: vendorInput }), async (req, res) => {
  const vendor = await prisma.vendor.create({ data: req.body });
  res.status(201).location(`/api/v1/vendors/${vendor.slug}`).json({ data: vendor });
});

vendorsRouter.patch("/:id", authenticate, requireRole(UserRole.ADMIN), validate({ params: idParams, body: vendorUpdate }), async (req, res) => {
  res.json({ data: await prisma.vendor.update({ where: { id: String(req.params.id) }, data: req.body }) });
});

vendorsRouter.delete("/:id", authenticate, requireRole(UserRole.ADMIN), validate({ params: idParams }), async (req, res) => {
  await prisma.vendor.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
});
