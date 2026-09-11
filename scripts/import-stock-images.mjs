// Downloads the explicitly reviewed stock sources, preserving framing and saving PNGs.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const directory = new URL("../public/images/products/", import.meta.url);
const sources = JSON.parse(readFileSync(new URL("stock-sources.json", directory), "utf8"));
await Promise.all(sources.map(async (source) => {
  const output = new URL(`${source.slug}.png`, directory);
  if (existsSync(output)) { console.log(`Already present: ${source.slug}`); return; }
  const response = await fetch(source.download, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${source.slug}: download failed (${response.status})`);
  const data = Buffer.from(await response.arrayBuffer());
  await sharp(data).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(fileURLToPath(output));
  console.log(`Downloaded: ${source.slug}`);
}));
