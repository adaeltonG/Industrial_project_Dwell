import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validate(
  schemas: Partial<Record<"body" | "params" | "query", ZodType>>
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const key of ["params", "query", "body"] as const) {
      const schema = schemas[key];
      if (schema) {
        const parsed = schema.parse(req[key]);

        // Express 5 exposes `req.query` as a getter, so direct assignment throws.
        // Define the validated value on the request instance instead.
        if (key === "query") {
          Object.defineProperty(req, key, {
            value: parsed,
            writable: true,
            configurable: true,
            enumerable: true
          });
        } else {
          req[key] = parsed;
        }
      }
    }
    next();
  };
}
