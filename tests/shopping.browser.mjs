// Run with a local Next dev server and Playwright installed:
// node tests/shopping.browser.mjs [absolute path to playwright/index.mjs]
import assert from "node:assert/strict";
import { readFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import ts from "typescript";
const { chromium } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : "playwright");
const source = ts.transpileModule(readFileSync(new URL("../lib/data.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const data = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const products = data.products.map((p, i) => ({ ...p, id: `product-${i}`, price: p.price.replace(/[^0-9.]/g, ""), currency: "GBP", availability: "IN_STOCK", imageUrl: null, externalUrl: "https://example.com", vendor: { id: p.vendorSlug, name: p.vendor, slug: p.vendorSlug }, category: { id: "home", name: p.category, slug: "home-garden" } }));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
let priceChanged = false;
let unavailable = false;
let apiFailure = false;
await context.route("**/api/v1/**", async (route) => {
  const path = new URL(route.request().url()).pathname.split("/api/v1")[1];
  if (path.startsWith("/products/")) {
    if (apiFailure) return route.fulfill({ status: 503, json: { error: { message: "Service temporarily unavailable" } } });
    const product = products.find((p) => p.slug === path.split("/")[2]);
    return route.fulfill({ json: { data: { ...product, ...(priceChanged ? { price: "99.00" } : {}), ...(unavailable ? { availability: "OUT_OF_STOCK" } : {}) } } });
  }
  return route.fulfill({ json: { data: path === "/products" ? products : [] } });
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const base = process.env.TEST_BASE_URL ?? "http://localhost:3100/dwell";
mkdirSync("tmp/shopping-qa", { recursive: true });
async function fillCheckout() {
  await page.getByLabel("Full name", { exact: true }).fill("Alex Green");
  await page.getByLabel("Email address", { exact: true }).fill("alex@example.com");
  await page.getByLabel("Delivery address", { exact: true }).fill("12 Garden Lane, London");
  await page.getByLabel("Postcode", { exact: true }).fill("SW1A 1AA");
}
try {
  await page.goto(`${base}/products`);
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().waitFor();
  assert.equal(await page.locator(".product-card").count(), 7);
  await page.locator(".product-card img").evaluateAll(async (imgs) => Promise.all(imgs.map((img) => img.decode())));
  assert.equal(await page.locator(".product-card img").evaluateAll((imgs) => imgs.filter((img) => img.naturalWidth > 0).length), 7);
  await page.screenshot({ path: "tmp/shopping-qa/catalog-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  await page.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  await page.goto(`${base}/cart`);
  const quantity = page.getByRole("spinbutton");
  await quantity.waitFor();
  assert.equal(await quantity.inputValue(), "2");
  await page.reload();
  await quantity.waitFor();
  assert.equal(await quantity.inputValue(), "2");
  await quantity.fill("3");
  await quantity.blur();
  await page.waitForFunction(() => document.querySelector(".shopping-summary__total")?.textContent.includes("114.00"));
  await page.screenshot({ path: "tmp/shopping-qa/cart-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: "tmp/shopping-qa/cart-mobile.png", fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Cart must fit mobile viewport");
  await page.getByRole("link", { name: "Try demo checkout", exact: false }).click();
  await fillCheckout();
  await page.screenshot({ path: "tmp/shopping-qa/checkout-mobile.png", fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Checkout must fit mobile viewport");
  priceChanged = true;
  await page.getByRole("button", { name: "Complete demo checkout" }).click();
  await page.locator(".checkout-form").getByRole("alert").waitFor();
  assert.match(await page.locator(".checkout-form").getByRole("alert").innerText(), /has changed/);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("dwell-cart-v1"))[0].quantity), 3);
  priceChanged = false;
  unavailable = true;
  await page.getByRole("button", { name: "Complete demo checkout" }).click();
  await page.locator(".checkout-form").getByRole("alert").waitFor();
  assert.match(await page.locator(".checkout-form").getByRole("alert").innerText(), /unavailable/);
  unavailable = false;
  apiFailure = true;
  await page.getByRole("button", { name: "Complete demo checkout" }).click();
  await page.locator(".checkout-form").getByRole("alert").waitFor();
  assert.match(await page.locator(".checkout-form").getByRole("alert").innerText(), /temporarily unavailable/);
  apiFailure = false;
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "tmp/shopping-qa/checkout-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Complete demo checkout" }).click();
  await page.getByRole("heading", { name: "Your demo is complete." }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem("dwell-cart-v1")), "[]");
  await page.screenshot({ path: "tmp/shopping-qa/receipt-desktop.png", fullPage: true });
  await page.goto(`${base}/cart`);
  await page.getByRole("heading", { name: "A little room for something good." }).waitFor();
  await page.goto(`${base}/products/${products[0].slug}`);
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("link", { name: "Cart, 1 items", exact: true }).last().waitFor({ state: "visible" });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Detail header must fit mobile viewport");
  await page.goto(`${base}/cart`);
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.getByRole("heading", { name: "A little room for something good." }).waitFor();
  assert.deepEqual(errors, []);
  console.log("PASS: all seven images; add from catalogue/details; duplicate add; refresh persistence; quantity/total; mobile fit; price/stock/API failure preserves cart; successful receipt clears cart; removal/empty state; no browser errors.");
} finally { await browser.close(); }

