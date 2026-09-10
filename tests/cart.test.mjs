import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Transpile the pure module in memory; no additional test dependency required.
const source = ts.transpileModule(readFileSync(new URL("../lib/cart.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
}).outputText;
const { addToCart, readCart, updateQuantity, cartTotal, toMinorUnits, MAX_QUANTITY } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const product = { id: "kettle", slug: "ceramic-pour-over-kettle", title: "Ceramic Kettle", shortTitle: "Kettle", price: "38.00", currency: "GBP", availability: "IN_STOCK", imageUrl: null, vendor: { name: "North & Co.", slug: "north-co" } };

test("adding duplicate items increases quantity and refreshes product data", () => {
  const first = addToCart([], product);
  const second = addToCart(first.items, { ...product, price: "39.00" });
  assert.equal(second.error, null);
  assert.equal(second.items.length, 1);
  assert.equal(second.items[0].quantity, 2);
  assert.equal(cartTotal(second.items), 7800);
});

test("totals use exact pennies", () => {
  assert.equal(toMinorUnits("0.29"), 29);
  assert.equal(toMinorUnits("24.5"), 2450);
  assert.equal(cartTotal([{ product: { ...product, price: "0.29" }, quantity: 3 }]), 87);
  for (const price of ["NaN", "-1", "1.001", "Infinity", "1e5", "999999999999999999"]) assert.throws(() => toMinorUnits(price));
});

test("cart rejects unavailable items, currency mixing, and excess quantity", () => {
  assert.ok(addToCart([], { ...product, availability: "OUT_OF_STOCK" }).error);
  const items = [{ product, quantity: MAX_QUANTITY }];
  assert.ok(addToCart(items, product).error);
  assert.ok(addToCart(items, { ...product, id: "other", currency: "USD" }).error);
  assert.equal(addToCart([], { ...product, availability: "PREORDER" }).error, null);
});

test("quantity edits reject invalid values and preserve other lines", () => {
  const items = [{ product, quantity: 1 }];
  for (const quantity of [0, -1, 1.5, NaN, 100]) assert.deepEqual(updateQuantity(items, product.id, quantity), items);
  assert.equal(updateQuantity(items, product.id, 4)[0].quantity, 4);
  assert.deepEqual(updateQuantity(items, "missing", 4), items);
});

test("storage roundtrip, malformed data, duplicates and mixed currencies", () => {
  const items = [{ product, quantity: 2 }];
  assert.deepEqual(readCart(JSON.stringify(items)), items);
  for (const raw of [null, "broken", "{}", "null", '[{"quantity":1}]']) assert.deepEqual(readCart(raw), []);
  assert.deepEqual(readCart(JSON.stringify([...items, ...items, { product, quantity: -3 }, { product: { ...product, id: "usd", currency: "USD" }, quantity: 1 }])), items);
  assert.deepEqual(readCart(JSON.stringify([{ product: { ...product, vendor: null }, quantity: 1 }])), []);
});
