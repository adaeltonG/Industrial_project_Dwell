import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

// Browser/UI tests use a deterministic API fixture; PostgreSQL is tested separately.
const base = process.env.TEST_BASE_URL ?? "http://localhost:3100/dwell";
const categories = [{ id: "category-1", slug: "home-garden", name: "Home & Garden" }, { id: "category-2", slug: "electronics", name: "Electronics" }];
const vendors = Array.from({ length: 5 }, (_, i) => ({ id: `vendor-${i}`, slug: `vendor-${i}`, name: `Vendor ${i + 1}`, description: "Independent demonstration vendor.", websiteUrl: "https://example.com", logoUrl: null, productCount: 6 }));
let products = Array.from({ length: 30 }, (_, i) => ({ id: `product-${i}`, slug: i === 0 ? "ceramic-pour-over-kettle" : `product-${i}`, title: i === 0 ? "Ceramic Pour-Over Kettle" : `Product ${i + 1}`, shortTitle: i === 0 ? "Ceramic Kettle" : `Product ${i + 1}`, description: "A useful demonstration product for the home.", shortDescription: "A useful demonstration product.", price: `${i + 10}.00`, currency: "GBP", availability: "IN_STOCK", imageUrl: null, externalUrl: "https://example.com/product", vendorId: vendors[i % 5].id, categoryId: categories[i % 2].id, vendor: vendors[i % 5], category: categories[i % 2] }));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
let currentUser = null;
const requests = [];
await context.route("**/api/v1/**", async (route) => {
  const req = route.request();
  const url = new URL(req.url());
  const path = url.pathname.split("/api/v1")[1];
  requests.push({ method: req.method(), path, search: url.search });
  const send = (data, status = 200) => route.fulfill({ status, json: { data } });
  if (path === "/auth/login" || path === "/auth/register") {
    const body = req.postDataJSON();
    currentUser = { id: "user-1", name: body.name ?? "Test Admin", email: body.email, role: body.email.startsWith("admin") ? "ADMIN" : "USER" };
    return send({ user: currentUser, token: "test-browser-token" }, path.endsWith("register") ? 201 : 200);
  }
  if (path === "/auth/me") return currentUser ? send(currentUser) : route.fulfill({ status: 401, json: { error: { message: "Unauthenticated" } } });
  if (path === "/categories") return send(categories);
  if (path === "/vendors") return send(vendors);
  if (path.startsWith("/vendors/")) {
    const vendor = vendors.find((v) => v.slug === path.split("/")[2]);
    return send({ ...vendor, products: products.filter((p) => p.vendorId === vendor.id) });
  }
  if (path === "/products" && req.method() === "POST") {
    const data = req.postDataJSON();
    const product = { ...data, id: "created-product", price: Number(data.price).toFixed(2), vendor: vendors.find((v) => v.id === data.vendorId), category: categories.find((c) => c.id === data.categoryId) };
    products.push(product); return send(product, 201);
  }
  if (path.startsWith("/products/")) {
    const identifier = path.split("/")[2];
    const index = products.findIndex((p) => p.id === identifier || p.slug === identifier);
    if (req.method() === "DELETE") { products.splice(index, 1); return route.fulfill({ status: 204 }); }
    if (req.method() === "PUT") {
      const data = req.postDataJSON();
      products[index] = { ...products[index], ...data, price: Number(data.price).toFixed(2), vendor: vendors.find((v) => v.id === data.vendorId), category: categories.find((c) => c.id === data.categoryId) };
    }
    return send(products[index]);
  }
  if (path === "/products") {
    const q = url.searchParams;
    let items = products.filter((p) => (!q.get("search") || p.title.toLowerCase().includes(q.get("search").toLowerCase())) && (!q.get("category") || p.category.slug === q.get("category")) && (!q.get("vendor") || p.vendor.slug === q.get("vendor")) && (!q.has("minPrice") || Number(p.price) >= Number(q.get("minPrice"))) && (!q.has("maxPrice") || Number(p.price) <= Number(q.get("maxPrice"))));
    if (q.get("sort")?.startsWith("price")) items = [...items].sort((a, b) => (Number(a.price) - Number(b.price)) * (q.get("sort") === "price_desc" ? -1 : 1));
    return send(items);
  }
  return send([]);
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
mkdirSync("tmp/marketplace-qa", { recursive: true });
async function waitCards(count) { await page.waitForFunction((n) => document.querySelectorAll(".product-card").length === n, count); }
async function mobileFit() { assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Page must fit mobile viewport"); }
try {
  await page.goto(base);
  await page.getByRole("heading", { name: "Find it. Compare it. Buy with confidence." }).waitFor();
  await page.locator(".category-card").first().waitFor();
  await page.screenshot({ path: "tmp/marketplace-qa/home-desktop.png", fullPage: true });
  await page.goto(`${base}/products`); await waitCards(30);
  assert.equal(await page.locator(".product-card__category").count(), 30);
  assert.equal(await page.locator(".product-card__vendor").count(), 30);
  assert.equal(await page.getByRole("link", { name: "View details", exact: true }).count(), 30);
  await page.getByRole("radio", { name: "Electronics", exact: true }).click(); await waitCards(15);
  await page.getByRole("radio", { name: "Vendor 1", exact: true }).click(); await waitCards(3);
  await page.getByLabel("Minimum price").fill("20"); await waitCards(2);
  await page.getByLabel("Maximum price").fill("30"); await waitCards(1);
  await page.goto(`${base}/products`); await waitCards(30);
  await page.getByRole("button", { name: "Price ↓", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".product-card .price")?.textContent.includes("39.00"));
  await page.getByRole("button", { name: "Newest", exact: true }).click();
  await page.waitForURL(/sort=newest/);
  const search = page.getByPlaceholder("Search products across all vendors...");
  await search.fill("Kettle"); await search.press("Enter"); await waitCards(1);
  await page.getByRole("link", { name: "View details", exact: true }).click();
  await page.getByRole("heading", { name: "Ceramic Pour-Over Kettle", exact: true }).waitFor();
  assert.equal(await page.getByRole("link", { name: "Visit vendor website" }).getAttribute("href"), "https://example.com/product");
  await page.goto(`${base}/vendors/vendor-0`); await waitCards(6);
  assert.equal(await page.getByRole("link", { name: "Visit website", exact: true }).getAttribute("href"), "https://example.com");
  for (const path of ["", "/products", "/products/ceramic-pour-over-kettle", "/vendors/vendor-0", "/login", "/register"]) {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${base}${path}`);
    if (path === "/products") {
      await waitCards(30);
      assert.ok(await page.locator(".product-card__vendor").first().isVisible(), "Vendor remains visible on mobile cards");
      assert.ok(await page.locator(".product-card__category").first().isVisible(), "Category remains visible on mobile cards");
      await page.getByRole("button", { name: "Filters", exact: true }).click(); await page.getByRole("radio", { name: "Electronics", exact: true }).click(); await waitCards(15);
    }
    if (path.startsWith("/products/")) await page.locator(".details-info").waitFor();
    if (path.startsWith("/vendors/")) await page.locator(".vendor-profile").waitFor();
    await mobileFit();
    await page.screenshot({ path: `tmp/marketplace-qa/${path.replaceAll("/", "-") || "home"}-mobile.png`, fullPage: true });
  }
  await page.goto(`${base}/admin`); await page.waitForURL(`${base}/login`);
  await page.goto(`${base}/register`);
  await page.getByLabel("Name", { exact: true }).fill("Test User");
  await page.getByLabel("Email", { exact: true }).fill("user@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-browser-password");
  await page.getByRole("button", { name: "Create account", exact: true }).click(); await page.waitForURL(`${base}/products`);
  await page.goto(`${base}/admin`); await page.waitForURL(`${base}/products`);
  await page.goto(`${base}/login`);
  await page.getByLabel("Email", { exact: true }).fill("admin@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-browser-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click(); await page.waitForURL(`${base}/admin`);
  await page.getByRole("heading", { name: "Add product", exact: true }).waitFor();
  await page.getByLabel("Title", { exact: true }).fill("Browser Created Product");
  await page.getByLabel("Short title", { exact: true }).fill("Created Product");
  await page.getByLabel("Price", { exact: true }).fill("25.50");
  await page.getByLabel("Vendor", { exact: true }).selectOption(vendors[1].id);
  await page.getByLabel("Category", { exact: true }).selectOption(categories[1].id);
  await page.getByLabel("Image URL", { exact: true }).fill("https://example.com/image.png");
  await page.getByLabel("External product URL", { exact: true }).fill("https://example.com/new-product");
  await page.getByLabel("Description", { exact: true }).fill("A useful product created during browser verification.");
  await page.getByLabel("Short description", { exact: true }).fill("A useful browser test product.");
  await page.getByRole("button", { name: "Create product", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "Browser Created Product" });
  await row.waitFor(); assert.match(await row.innerText(), /Vendor 2/);
  await mobileFit(); await page.screenshot({ path: "tmp/marketplace-qa/admin-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Price", { exact: true }).fill("35.50");
  await page.getByRole("button", { name: "Update product", exact: true }).click();
  await page.waitForFunction(() => [...document.querySelectorAll("tr")].some((row) => row.textContent.includes("Browser Created Product") && row.textContent.includes("35.50")));
  await page.screenshot({ path: "tmp/marketplace-qa/admin-desktop.png", fullPage: true });
  page.once("dialog", (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Delete", exact: true }).click(); await row.waitFor({ state: "detached" });
  assert.ok(requests.some((r) => r.method === "PUT" && r.path === "/products/created-product"));
  assert.ok(requests.some((r) => r.method === "DELETE" && r.path === "/products/created-product"));
  assert.deepEqual(errors, []);
  console.log("PASS: homepage, search, category/vendor/price filters, sorting, all card fields, detail/vendor links, mobile layout, registration, visitor/user admin redirects, administrator create/PUT/edit/delete, no browser errors.");
} catch (error) {
  await page.screenshot({ path: "tmp/marketplace-qa/failure.png", fullPage: true });
  throw error;
} finally { await browser.close(); }
