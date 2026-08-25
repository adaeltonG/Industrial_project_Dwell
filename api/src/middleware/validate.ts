import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validate(
  schemas: Partial<Record<"body" | "params" | "query", ZodType>>
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const key of ["params", "query", "body"] as const) {
      const schema = schemas[key];
      if (schema) {
        req[key] = schema.parse(req[key]);
      }
    }
    next();
  };
}
