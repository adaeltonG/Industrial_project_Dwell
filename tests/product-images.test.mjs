import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const seed = readFileSync(new URL("../api/prisma/seed.ts", import.meta.url), "utf8");
const slugs = [
  ...[...seed.matchAll(/\{ slug: "([^"]+)", title:/g)].map((match) => match[1]),
  ...[...seed.matchAll(/^  \["([^"]+)",/gm)].map((match) => match[1])
];
test("all 30 seeded products have distinct, valid bundled PNG images", () => {
  assert.equal(slugs.length, 30);
  assert.equal(new Set(slugs).size, 30);
  const hashes = new Set();
  for (const slug of slugs) {
    const image = readFileSync(new URL(`../public/images/products/${slug}.png`, import.meta.url));
    assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${slug}: PNG signature`);
    assert.ok(image.readUInt32BE(16) >= 500 && image.readUInt32BE(20) >= 500, `${slug}: useful resolution`);
    hashes.add(createHash("sha256").update(image).digest("hex"));
  }
  assert.equal(hashes.size, 30, "Each product has a distinct asset");
});
test("stock photographs have source and licence records", () => {
  const sources = JSON.parse(readFileSync(new URL("../public/images/products/stock-sources.json", import.meta.url), "utf8"));
  assert.equal(sources.length, 11);
  for (const { slug, source, download, license } of sources) {
    assert.ok(slugs.includes(slug));
    for (const link of [source, download, license]) assert.equal(new URL(link).protocol, "https:");
  }
});
test("ER diagram is available as a high-resolution PNG", () => {
  const image = readFileSync(new URL("../docs/database-erd.png", import.meta.url));
  assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(image.readUInt32BE(16), 3600);
  assert.equal(image.readUInt32BE(20), 2240);
});
