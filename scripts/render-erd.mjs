// Render the actual Prisma scalar fields and relationships into SVG and high-resolution PNG.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import sharp from "sharp";

const schema = readFileSync(new URL("../api/prisma/schema.prisma", import.meta.url), "utf8");
const scalarTypes = new Set(["String", "DateTime", "Decimal", "Int", "Boolean", ...[...schema.matchAll(/^enum (\w+)/gm)].map((match) => match[1])]);
const models = new Map();
for (const [, model, body] of schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)) {
  const name = body.match(/@@map\("([^"]+)"\)/)?.[1] ?? model;
  const composite = body.match(/@@id\(\[([^\]]+)\]/)?.[1].split(",").map((field) => field.trim()) ?? [];
  const foreign = new Set([...body.matchAll(/@relation\(fields: \[([^\]]+)\]/g)].flatMap((match) => match[1].split(",").map((field) => field.trim())));
  const fields = [];
  for (const line of body.split(/\r?\n/)) {
    const match = line.match(/^\s+(\w+)\s+([\w?\[\]]+)\s*(.*)$/);
    if (!match) continue;
    const [, property, prismaType, attrs] = match;
    if (!scalarTypes.has(prismaType.replace("?", ""))) continue;
    const field = attrs.match(/@map\("([^"]+)"\)/)?.[1] ?? property;
    const type = attrs.includes("@db.Uuid") ? "uuid" : attrs.includes("@db.Decimal") ? "decimal(10,2)" : attrs.includes("@db.Char") ? "char(3)" : attrs.includes("@db.Date") ? "date" : prismaType.startsWith("String") ? "text" : prismaType.startsWith("DateTime") ? "timestamp" : prismaType;
    const key = [attrs.includes("@id") || composite.includes(property) ? "PK" : "", foreign.has(property) ? "FK" : "", attrs.includes("@unique") ? "UK" : ""].filter(Boolean).join(",");
    fields.push({ field, type: type.replace("?", ""), key, nullable: prismaType.endsWith("?") });
  }
  models.set(name, fields);
}
assert.equal(models.size, 5);
const layout = {
  vendors: { x: 50, y: 160, w: 420 },
  categories: { x: 50, y: 650, w: 420 },
  products: { x: 650, y: 160, w: 540 },
  users: { x: 1330, y: 160, w: 420 },
  saved_products: { x: 1330, y: 720, w: 420 }
};
const rowHeight = 30;
const headerHeight = 86;
const height = (name) => headerHeight + models.get(name).length * rowHeight;
const fieldY = (name, field) => {
  const index = models.get(name).findIndex((value) => value.field === field);
  assert.ok(index >= 0, `Missing schema field ${name}.${field}`);
  return layout[name].y + headerHeight + index * rowHeight + rowHeight / 2;
};
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const text = (x, y, value, css = "", extra = "") => `<text x="${x}" y="${y}" class="${css}" ${extra}>${escape(value)}</text>`;
function table(name) {
  const { x, y, w } = layout[name];
  const fields = models.get(name);
  const column = name === "products" ? 300 : 245;
  return `<g transform="translate(${x},${y})">
    <rect width="${w}" height="${height(name)}" rx="12" fill="white" stroke="#bfd2c7" stroke-width="2"/>
    <path d="M12 0H${w - 12}Q${w} 0 ${w} 12V54H0V12Q0 0 12 0" fill="#254e3a"/>
    ${text(20, 35, name, "title")}
    <rect y="54" width="${w}" height="32" fill="#e9f0eb"/>
    ${text(16, 76, "KEY", "heading")}${text(82, 76, "COLUMN", "heading")}${text(column, 76, "TYPE", "heading")}
    ${fields.map((field, index) => `<g transform="translate(0,${headerHeight + index * rowHeight})">
      ${index % 2 === 0 ? `<rect x="1" width="${w - 2}" height="${rowHeight}" fill="#f5f8f5"/>` : ""}
      ${text(16, 21, field.key, "key")}${text(82, 21, field.field, "field")}${text(column, 21, field.type + (field.nullable ? " ?" : ""), "type")}
    </g>`).join("")}
  </g>`;
}
function connection(path, labels) {
  return `<path d="${path}" fill="none" stroke="#42715a" stroke-width="2.5" stroke-linejoin="round"/>${labels.map(([x, y, value]) => text(x, y, value, "relation")).join("")}`;
}
const vendorY = fieldY("products", "vendor_id");
const categoryY = fieldY("products", "category_id");
const productY = fieldY("products", "id");
const savedProductY = fieldY("saved_products", "product_id");
const usersBottom = layout.users.y + height("users");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1120" viewBox="0 0 1800 1120">
  <title>Dwell database entity relationship diagram</title>
  <desc>PostgreSQL schema with users, vendors, categories, products and saved products. Every product has one vendor and one category. Users and products are linked by saved_products.</desc>
  <style>
    text { font-family: Arial, Helvetica, sans-serif; fill: #233a2d; }
    .main { font-size: 38px; font-weight: 700; }
    .subtitle { font-size: 19px; fill: #5c6e61; }
    .title { fill: white; font-size: 25px; font-weight: 700; }
    .heading { font-size: 12px; font-weight: 700; letter-spacing: 1px; }
    .field { font-family: Consolas, monospace; font-size: 16px; }
    .type { font-size: 15px; fill: #5c6e61; }
    .key { font-size: 12px; font-weight: 700; fill: #277345; }
    .relation { font-size: 17px; font-weight: 700; paint-order: stroke; stroke: #fafbf8; stroke-width: 6px; stroke-linejoin: round; }
    .note { font-size: 17px; }
  </style>
  <rect width="1800" height="1120" fill="#fafbf8"/>
  ${text(50, 65, "Dwell | Database entity relationship diagram", "main")}
  ${text(50, 103, "PostgreSQL · Physical table and column names · Generated from api/prisma/schema.prisma", "subtitle")}
  ${connection(`M470 188H545V${vendorY}H650`, [[485, 178, "1"], [595, vendorY - 12, "0..*"], [495, 400, "supplies"]])}
  ${connection(`M470 678H580V${categoryY}H650`, [[485, 667, "1"], [595, categoryY - 12, "0..*"], [485, 710, "classifies"]])}
  ${connection(`M1190 ${productY}H1245V${savedProductY}H1330`, [[1205, productY - 12, "1"], [1275, savedProductY - 12, "0..*"], [1205, 580, "saved by"]])}
  ${connection(`M1540 ${usersBottom}V720`, [[1552, usersBottom + 24, "1"], [1552, 705, "0..*"], [1555, 590, "saves"]])}
  ${Object.keys(layout).map(table).join("")}
  <rect x="50" y="968" width="1700" height="122" rx="10" fill="#e9f0eb"/>
  ${text(72, 998, "PK = primary key    FK = foreign key    UK = unique    ? = nullable    1 → 0..* = one to zero or many", "note")}
  ${text(72, 1025, "UserRole: USER, ADMIN    |    ProductAvailability: IN_STOCK, OUT_OF_STOCK, PREORDER", "note")}
  ${text(72, 1052, "saved_products uses composite PK (user_id, product_id). Deleting a user or product cascades to its saved entries.", "note")}
  ${text(72, 1079, "Deleting referenced vendors/categories is restricted. No database tables or columns were renamed.", "note")}
</svg>`;
const svgPath = new URL("../docs/database-erd.svg", import.meta.url);
const pngPath = new URL("../docs/database-erd.png", import.meta.url);
writeFileSync(svgPath, svg);
await sharp(Buffer.from(svg), { density: 144 }).png().toFile(fileURLToPath(pngPath));
console.log(`Rendered ${models.size} tables / ${[...models.values()].reduce((sum, fields) => sum + fields.length, 0)} columns to ${fileURLToPath(pngPath)}`);
