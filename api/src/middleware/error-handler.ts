import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../lib/api-error.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "The request contains invalid data",
        details: error.issues
      }
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details }
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        error: { code: "CONFLICT", message: "A resource with this unique value already exists" }
      });
      return;
    }
    if (error.code === "P2003") {
      res.status(400).json({
        error: { code: "INVALID_RELATION", message: "A referenced resource does not exist" }
      });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Resource not found" } });
      return;
    }
  }

  console.error(error);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" }
  });
};
