import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

describe("HTTP application", () => {
  it("reports health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: "ok" } });
  });

  it("uses a consistent not-found response", async () => {
    const response = await request(app).get("/missing");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects malformed registration data before accessing the database", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({ email: "bad" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid product input for an authenticated administrator", async () => {
    const token = jwt.sign({ role: "ADMIN" }, config.JWT_SECRET, { subject: "00000000-0000-4000-8000-000000000000" });
    const response = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "x" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("requires authentication for saved products", async () => {
    const response = await request(app).get("/api/v1/users/me/saved-products");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });
});
