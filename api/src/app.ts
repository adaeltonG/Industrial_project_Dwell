import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { authRouter } from "./features/auth/auth.router.js";
import { categoriesRouter } from "./features/categories/categories.router.js";
import { productsRouter } from "./features/products/products.router.js";
import { usersRouter } from "./features/users/users.router.js";
import { vendorsRouter } from "./features/vendors/vendors.router.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN.split(",").map((origin) => origin.trim()) }));
  app.use(express.json({ limit: "100kb" }));
  if (config.NODE_ENV !== "test") app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ data: { status: "ok" } }));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/vendors", vendorsRouter);
  app.use("/api/v1/products", productsRouter);
  app.use("/api/v1/users", usersRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
