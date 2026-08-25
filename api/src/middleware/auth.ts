import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { ApiError } from "../lib/api-error.js";

type TokenPayload = jwt.JwtPayload & { sub: string; role: UserRole };

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const [scheme, token] = req.header("authorization")?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "UNAUTHENTICATED", "A valid bearer token is required");
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    if (!payload.sub || !payload.role) throw new Error("Invalid payload");
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new ApiError(401, "UNAUTHENTICATED", "The bearer token is invalid or expired");
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      throw new ApiError(403, "FORBIDDEN", "You do not have permission for this action");
    }
    next();
  };
}
