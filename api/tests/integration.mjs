// Run only against a disposable, migrated PostgreSQL database named dwell_verify_*.
import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import request from "supertest";

const database = new URL(process.env.DATABASE_URL ?? "postgresql://invalid/invalid");
assert.match(database.pathname, /^\/dwell_verify_[a-z0-9_]+$/, "Integration tests require a disposable dwell_verify_* database");
assert.equal(process.env.NODE_ENV, "test", "NODE_ENV must be test");
const { createApp } = await import("../dist/app.js");
const { prisma: applicationDb } = await import("../dist/db.js");
const db = new PrismaClient();
const app = createApp();
const password = `verification-${randomUUID()}`;
const email = "verification-admin@example.com";
const seed = () => execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"], {
  env: { ...process.env, ADMIN_EMAIL: email, ADMIN_PASSWORD: password }, stdio: "pipe"
});
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; }
try {
  seed();
  check(await db.product.count() === 30, "Seed creates 30 products");
  check(await db.vendor.count() === 5, "Seed creates five vendors");
  check(await db.category.count() === 4, "Seed creates four categories");
  check((await db.product.findMany()).every((product) => product.imageUrl?.endsWith(`/images/products/${product.slug}.png`)), "Every seeded product has its own bundled image URL");
  const original = await db.product.findFirstOrThrow();
  const admin = await db.user.findUniqueOrThrow({ where: { email } });
  await db.product.update({ where: { id: original.id }, data: { price: 123.45, imageUrl: "https://example.com/custom-admin-image.png" } });
  const mug = await db.product.findUniqueOrThrow({ where: { slug: "stoneware-mug" } });
  // Select another new product if the first product returned above was the mug.
  const backfillTarget = mug.id === original.id
    ? await db.product.findUniqueOrThrow({ where: { slug: "cotton-table-runner" } }) : mug;
  await db.product.update({ where: { id: backfillTarget.id }, data: { imageUrl: `https://placehold.co/640x480/f1f3ec/344538/png?text=${encodeURIComponent(backfillTarget.title)}` } });
  seed();
  check(await db.product.count() === 30, "Seed is idempotent");
  check((await db.product.findUniqueOrThrow({ where: { id: original.id } })).price.toFixed(2) === "123.45", "Seed preserves edited products");
  check((await db.user.findUniqueOrThrow({ where: { email } })).passwordHash === admin.passwordHash, "Seed preserves admin password hash");
  check((await db.product.findUniqueOrThrow({ where: { id: original.id } })).imageUrl === "https://example.com/custom-admin-image.png", "Seed preserves administrator image overrides");
  check((await db.product.findUniqueOrThrow({ where: { id: backfillTarget.id } })).imageUrl?.endsWith(`/images/products/${backfillTarget.slug}.png`), "Seed replaces legacy placeholder image URLs");
  await db.product.update({ where: { id: backfillTarget.id }, data: { imageUrl: null } });
  seed();
  check((await db.product.findUniqueOrThrow({ where: { id: backfillTarget.id } })).imageUrl?.endsWith(`/images/products/${backfillTarget.slug}.png`), "Seed backfills missing image URLs");

  const registered = await request(app).post("/api/auth/register").send({ name: "Verification User", email: "verification-user@example.com", password, role: "ADMIN" });
  check(registered.status === 201 && registered.body.data.user.role === "USER", "Registration cannot escalate role");
  check(!("passwordHash" in registered.body.data.user), "Passwords are not returned");
  const user = await db.user.findUniqueOrThrow({ where: { email: "verification-user@example.com" } });
  check(await bcrypt.compare(password, user.passwordHash), "Password hash is persisted");
  check((await request(app).post("/api/auth/register").send({ name: "Duplicate", email: user.email, password })).status === 409, "Duplicate registration rejected");
  check((await request(app).post("/api/auth/login").send({ email, password: "incorrect" })).status === 401, "Bad login rejected");
  const login = await request(app).post("/api/auth/login").send({ email, password });
  check(login.status === 200, "Administrator can log in");
  const auth = `Bearer ${login.body.data.token}`;
  const userAuth = `Bearer ${registered.body.data.token}`;
  const vendor = await db.vendor.findFirstOrThrow();
  const category = await db.category.findFirstOrThrow();
  for (const prefix of ["/api", "/api/v1"]) {
    check((await request(app).get(`${prefix}/products?limit=100`)).body.data.length === 30, `${prefix}: public product list`);
    check((await request(app).get(`${prefix}/vendors`)).body.data.length === 5, `${prefix}: vendor list`);
    check((await request(app).get(`${prefix}/categories`)).body.data.length === 4, `${prefix}: category list`);
    for (const identifier of [original.id, original.slug]) check((await request(app).get(`${prefix}/products/${identifier}`)).body.data.id === original.id, `${prefix}: product UUID/slug lookup`);
    for (const identifier of [vendor.id, vendor.slug]) check((await request(app).get(`${prefix}/vendors/${identifier}`)).body.data.id === vendor.id, `${prefix}: vendor UUID/slug lookup`);
  }
  const input = { slug: "verification-product", title: "Verification Product", shortTitle: "Verification", description: "A temporary verification product.", shortDescription: "Temporary verification.", vendorId: vendor.id, categoryId: category.id, price: 31.25, currency: "GBP", availability: "IN_STOCK", imageUrl: "https://example.com/test.png", externalUrl: "https://example.com/test" };
  check((await request(app).post("/api/products").send(input)).status === 401, "Visitor cannot create");
  check((await request(app).post("/api/products").set("Authorization", userAuth).send(input)).status === 403, "User cannot create");
  const created = await request(app).post("/api/products").set("Authorization", auth).send(input);
  check(created.status === 201, "Admin creates product");
  const id = created.body.data.id;
  check((await db.product.findUniqueOrThrow({ where: { id } })).price.toFixed(2) === "31.25", "Create persists");
  const replaced = await request(app).put(`/api/products/${id}`).set("Authorization", auth).send({ ...input, price: 44.5 });
  check(replaced.status === 200 && replaced.body.data.price === "44.50", "Admin PUT persists");
  check((await request(app).patch(`/api/v1/products/${id}`).set("Authorization", auth).send({ price: 45 })).status === 200, "Legacy PATCH works");
  for (const method of ["put", "delete"]) {
    check((await request(app)[method](`/api/products/${id}`).send(input)).status === 401, `Visitor cannot ${method}`);
    check((await request(app)[method](`/api/products/${id}`).set("Authorization", userAuth).send(input)).status === 403, `User cannot ${method}`);
  }
  const filtered = await request(app).get(`/api/products?search=Verification&vendor=${vendor.slug}&category=${category.slug}&minPrice=40&maxPrice=50&sort=price_desc`);
  check(filtered.status === 200 && filtered.body.data.length === 1 && filtered.body.data[0].id === id, "Combined search/category/vendor/price filters work");
  for (const sort of ["price_asc", "price_desc", "newest"]) {
    const result = await request(app).get(`/api/products?sort=${sort}&limit=100`);
    const values = result.body.data.map((p) => sort === "newest" ? Date.parse(p.createdAt) : Number(p.price));
    check(values.every((v, i) => i === 0 || (sort === "price_asc" ? values[i - 1] <= v : values[i - 1] >= v)), `${sort} order`);
  }
  const first = await request(app).get("/api/products?limit=10&page=1");
  const second = await request(app).get("/api/products?limit=10&page=2");
  check(first.body.data.length === 10 && second.body.data.length === 10 && !first.body.data.some((p) => second.body.data.some((q) => p.id === q.id)), "Pagination returns distinct pages");
  check((await request(app).put(`/api/users/me/saved-products/${id}`).set("Authorization", userAuth)).status === 200, "User saves product");
  check((await request(app).get("/api/users/me/saved-products").set("Authorization", userAuth)).body.data.length === 1, "Saved product persists");
  check((await request(app).delete(`/api/products/${id}`).set("Authorization", auth)).status === 204, "Admin deletes product");
  check(await db.product.findUnique({ where: { id } }) === null, "Delete persists");
  check(await db.savedProduct.count({ where: { productId: id } }) === 0, "Saved relation cascades on delete");
  check((await request(app).get(`/api/products/${id}`)).status === 404, "Deleted product returns 404");
  console.log(`PASS: ${checks} PostgreSQL integration checks (disposable database only).`);
} finally { await db.$disconnect(); await applicationDb.$disconnect(); }
