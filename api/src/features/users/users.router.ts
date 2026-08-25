import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { ApiError } from "../../lib/api-error.js";
import { serializeProduct } from "../../lib/serializers.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

export const usersRouter = Router();
const productParams = z.object({ productId: z.uuid() });
usersRouter.use(authenticate);

usersRouter.get("/me/saved-products", async (req, res) => {
  const saved = await prisma.savedProduct.findMany({
    where: { userId: req.user!.id },
    orderBy: { savedAt: "desc" },
    include: { product: { include: { vendor: true, category: true } } }
  });
  res.json({ data: saved.map((item) => ({ savedAt: item.savedAt, product: serializeProduct(item.product) })) });
});

usersRouter.put("/me/saved-products/:productId", validate({ params: productParams }), async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: String(req.params.productId) }, select: { id: true } });
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found");
  const saved = await prisma.savedProduct.upsert({
    where: { userId_productId: { userId: req.user!.id, productId: product.id } },
    update: {},
    create: { userId: req.user!.id, productId: product.id }
  });
  res.status(200).json({ data: saved });
});

usersRouter.delete("/me/saved-products/:productId", validate({ params: productParams }), async (req, res) => {
  await prisma.savedProduct.deleteMany({ where: { userId: req.user!.id, productId: String(req.params.productId) } });
  res.status(204).send();
});
