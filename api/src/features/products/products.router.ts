import { Prisma, UserRole } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../db.js";
import { ApiError } from "../../lib/api-error.js";
import { serializeProduct } from "../../lib/serializers.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { idParams, productInput, productListQuery, productUpdate, slugParams } from "./products.schemas.js";

export const productsRouter = Router();
productsRouter.get("/", validate({ query: productListQuery }), async (req, res) => {
  const { page, limit, search, category, vendor, minPrice, maxPrice, availability, sort } = req.query as unknown as {
    page: number; limit: number; search?: string; category?: string; vendor?: string;
    minPrice?: number; maxPrice?: number; availability?: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";
    sort: "newest" | "price_asc" | "price_desc" | "title_asc";
  };
  const where: Prisma.ProductWhereInput = {
    ...(search && { OR: [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ] }),
    ...(category && { category: { slug: category } }),
    ...(vendor && { vendor: { slug: vendor } }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) }
    }),
    ...(availability && { availability })
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc" ? { price: "asc" } :
    sort === "price_desc" ? { price: "desc" } :
    sort === "title_asc" ? { title: "asc" } : { createdAt: "desc" };
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { vendor: true, category: true } }),
    prisma.product.count({ where })
  ]);
  res.json({
    data: items.map(serializeProduct),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

productsRouter.get("/:slug", validate({ params: slugParams }), async (req, res) => {
  const product = await prisma.product.findUnique({ where: { slug: String(req.params.slug) }, include: { vendor: true, category: true } });
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found");
  res.json({ data: serializeProduct(product) });
});

productsRouter.post("/", authenticate, requireRole(UserRole.ADMIN), validate({ body: productInput }), async (req, res) => {
  const product = await prisma.product.create({ data: req.body, include: { vendor: true, category: true } });
  res.status(201).location(`/api/v1/products/${product.slug}`).json({ data: serializeProduct(product) });
});

productsRouter.patch("/:id", authenticate, requireRole(UserRole.ADMIN), validate({ params: idParams, body: productUpdate }), async (req, res) => {
  const product = await prisma.product.update({ where: { id: String(req.params.id) }, data: req.body, include: { vendor: true, category: true } });
  res.json({ data: serializeProduct(product) });
});

productsRouter.delete("/:id", authenticate, requireRole(UserRole.ADMIN), validate({ params: idParams }), async (req, res) => {
  await prisma.product.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
});
