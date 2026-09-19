import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  product: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  vendor: { findMany: vi.fn(), findUnique: vi.fn() },
  category: { findMany: vi.fn() },
  user: { findUnique: vi.fn(), create: vi.fn() },
  $transaction: vi.fn((queries: unknown[]) => Promise.all(queries))
}));
vi.mock("./db.js", () => ({ prisma: db }));
import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();
const id = "10000000-0000-4000-8000-000000000001";
const vendorId = "20000000-0000-4000-8000-000000000001";
const categoryId = "30000000-0000-4000-8000-000000000001";
const input = { slug: "test-product", title: "Test Product", shortTitle: "Test Product", description: "A useful test product description.", shortDescription: "A useful test product.", price: 25, currency: "GBP", availability: "IN_STOCK", imageUrl: "https://example.com/image.png", externalUrl: "https://example.com/product", vendorId, categoryId };
const vendor = { id: vendorId, slug: "test-vendor", name: "Test Vendor", products: [] };
const category = { id: categoryId, slug: "test-category", name: "Test Category" };
const product = { ...input, id, price: new Prisma.Decimal(25), vendor, category };
const token = (role = "ADMIN") => jwt.sign({ role }, config.JWT_SECRET, { subject: id, expiresIn: "1h" });

beforeEach(() => { vi.clearAllMocks(); });

describe.each(["/api", "/api/v1"])("%s API compatibility", (prefix) => {
  it("lists and filters products with pagination and sorting", async () => {
    db.product.findMany.mockResolvedValue([product]); db.product.count.mockResolvedValue(1);
    const result = await request(app).get(`${prefix}/products?search=useful&category=test-category&vendor=test-vendor&minPrice=10&maxPrice=30&sort=price_asc`);
    expect(result.status).toBe(200);
    expect(result.body.data[0].price).toBe("25.00");
    expect(result.body.meta.total).toBe(1);
    expect(db.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: [{ price: "asc" }, { id: "asc" }], where: expect.objectContaining({ category: { slug: "test-category" }, vendor: { slug: "test-vendor" }, price: { gte: 10, lte: 30 }, OR: expect.any(Array) })
    }));
  });
  it.each([id, "test-product"])("fetches product identifier %s", async (identifier) => {
    db.product.findUnique.mockResolvedValue(product);
    expect((await request(app).get(`${prefix}/products/${identifier}`)).status).toBe(200);
    expect(db.product.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: identifier === id ? { id } : { slug: identifier } }));
  });
  it("returns 404 for a missing product", async () => {
    db.product.findUnique.mockResolvedValue(null);
    expect((await request(app).get(`${prefix}/products/missing`)).status).toBe(404);
  });
  it("lists vendors and categories with counts", async () => {
    db.vendor.findMany.mockResolvedValue([{ ...vendor, _count: { products: 3 } }]);
    db.category.findMany.mockResolvedValue([{ ...category, _count: { products: 3 } }]);
    for (const path of ["vendors", "categories"]) {
      const result = await request(app).get(`${prefix}/${path}`);
      expect(result.status).toBe(200); expect(result.body.data[0].productCount).toBe(3);
    }
  });
  it.each([vendorId, "test-vendor"])("fetches vendor identifier %s", async (identifier) => {
    db.vendor.findUnique.mockResolvedValue(vendor);
    expect((await request(app).get(`${prefix}/vendors/${identifier}`)).status).toBe(200);
    expect(db.vendor.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: identifier === vendorId ? { id: vendorId } : { slug: identifier } }));
  });
  it.each(["post", "put", "patch", "delete"] as const)("protects %s product writes from visitors and users", async (method) => {
    const path = `${prefix}/products${method === "post" ? "" : `/${id}`}`;
    expect((await request(app)[method](path).send(input)).status).toBe(401);
    expect((await request(app)[method](path).set("Authorization", `Bearer ${token("USER")}`).send(input)).status).toBe(403);
    expect(db.product.create).not.toHaveBeenCalled(); expect(db.product.update).not.toHaveBeenCalled(); expect(db.product.delete).not.toHaveBeenCalled();
  });
  it("allows administrator create, replace, patch and delete", async () => {
    db.product.create.mockResolvedValue(product); db.product.update.mockResolvedValue(product); db.product.delete.mockResolvedValue(product);
    for (const [method, status] of [["post", 201], ["put", 200], ["patch", 200], ["delete", 204]] as const) {
      const result = await request(app)[method](`${prefix}/products${method === "post" ? "" : `/${id}`}`).set("Authorization", `Bearer ${token()}`).send(input);
      expect(result.status).toBe(status);
    }
  });
  it("allows a vendor to manage only products in its own catalogue", async () => {
    db.user.findUnique.mockResolvedValue({ vendorId });
    db.product.findUnique.mockResolvedValue({ vendorId });
    db.product.create.mockResolvedValue(product); db.product.update.mockResolvedValue(product); db.product.delete.mockResolvedValue(product);
    const vendorToken = token("VENDOR");
    expect((await request(app).post(`${prefix}/products`).set("Authorization", `Bearer ${vendorToken}`).send(input)).status).toBe(201);
    expect((await request(app).put(`${prefix}/products/${id}`).set("Authorization", `Bearer ${vendorToken}`).send(input)).status).toBe(200);
    expect((await request(app).delete(`${prefix}/products/${id}`).set("Authorization", `Bearer ${vendorToken}`)).status).toBe(204);
    db.product.findUnique.mockResolvedValue({ vendorId: "40000000-0000-4000-8000-000000000001" });
    expect((await request(app).delete(`${prefix}/products/${id}`).set("Authorization", `Bearer ${vendorToken}`)).status).toBe(403);
  });
  it("requires a complete PUT body but supports partial PATCH", async () => {
    db.product.update.mockResolvedValue(product);
    expect((await request(app).put(`${prefix}/products/${id}`).set("Authorization", `Bearer ${token()}`).send({ price: 30 })).status).toBe(400);
    expect((await request(app).patch(`${prefix}/products/${id}`).set("Authorization", `Bearer ${token()}`).send({ price: 30 })).status).toBe(200);
  });
  it("hashes registered passwords and cannot register an administrator", async () => {
    db.user.create.mockImplementation(async ({ data }) => ({ ...data, id, role: "USER" }));
    const result = await request(app).post(`${prefix}/auth/register`).send({ name: "Test User", email: "test@example.com", password: "a-strong-test-password", role: "ADMIN" });
    expect(result.status).toBe(201); expect(result.body.data.user.role).toBe("USER");
    expect(result.body.data.user.passwordHash).toBeUndefined();
    const data = db.user.create.mock.calls[0][0].data;
    expect(await bcrypt.compare("a-strong-test-password", data.passwordHash)).toBe(true);
    expect(jwt.verify(result.body.data.token, config.JWT_SECRET)).toMatchObject({ sub: id, role: "USER" });
  });
  it("logs in with correct credentials and rejects wrong credentials", async () => {
    db.user.findUnique.mockResolvedValue({ id, name: "Test User", email: "test@example.com", role: "USER", passwordHash: await bcrypt.hash("a-strong-test-password", 4) });
    const success = await request(app).post(`${prefix}/auth/login`).send({ email: "test@example.com", password: "a-strong-test-password" });
    expect(success.status).toBe(200); expect(success.body.data.user.passwordHash).toBeUndefined();
    expect((await request(app).post(`${prefix}/auth/login`).send({ email: "test@example.com", password: "wrong" })).status).toBe(401);
  });
  it("rejects expired and tampered tokens", async () => {
    const expired = jwt.sign({ role: "ADMIN" }, config.JWT_SECRET, { subject: id, expiresIn: -1 });
    for (const invalid of [expired, `${token()}tampered`]) {
      expect((await request(app).delete(`${prefix}/products/${id}`).set("Authorization", `Bearer ${invalid}`)).status).toBe(401);
    }
  });
  it("rejects invalid price ranges", async () => {
    expect((await request(app).get(`${prefix}/products?minPrice=50&maxPrice=10`)).status).toBe(400);
    expect(db.product.findMany).not.toHaveBeenCalled();
  });
});
