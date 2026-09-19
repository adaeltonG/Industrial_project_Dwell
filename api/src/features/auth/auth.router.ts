import { Router } from "express";
import { prisma } from "../../db.js";
import { ApiError } from "../../lib/api-error.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import { login, publicUser, register } from "./auth.service.js";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), async (req, res) => {
  res.status(201).json({ data: await register(req.body) });
});

authRouter.post("/login", validate({ body: loginSchema }), async (req, res) => {
  res.json({ data: await login(req.body) });
});

authRouter.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { vendor: true } });
  if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");
  res.json({ data: publicUser(user) });
});
