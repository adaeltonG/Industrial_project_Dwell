import { UserRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { ApiError } from "../../lib/api-error.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { categoryInput, categoryUpdate } from "../vendors/vendors.schemas.js";

export const categoriesRouter = Router();
const slugParams = z.object({ slug: z.string().min(1).max(100) });
const idParams = z.object({ id: z.uuid() });

categoriesRouter.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  res.json({ data: categories.map(({ _count, ...category }) => ({ ...category, productCount: _count.products })) });
});

categoriesRouter.get("/:slug", validate({ params: slugParams }), async (req, res) => {
  const category = await prisma.category.findUnique({ where: { slug: String(req.params.slug) }, include: { _count: { select: { products: true } } } });
  if (!category) throw new ApiError(404, "NOT_FOUND", "Category not found");
  const { _count, ...data } = category;
  res.json({ data: { ...data, productCount: _count.products } });
});

categoriesRouter.post("/", authenticate, requireRole(UserRole.ADMIN), validate({ body: categoryInput }), async (req, res) => {
  const category = await prisma.category.create({ data: req.body });
  res.status(201).location(`/api/v1/categories/${category.slug}`).json({ data: category });
});

categoriesRouter.patch("/:id", authenticate, requireRole(UserRole.ADMIN), validate({ params: idParams, body: categoryUpdate }), async (req, res) => {
  res.json({ data: await prisma.category.update({ where: { id: String(req.params.id) }, data: req.body }) });
});

categoriesRouter.delete("/:id", authenticate, requireRole(UserRole.ADMIN), validate({ params: idParams }), async (req, res) => {
  await prisma.category.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
});
