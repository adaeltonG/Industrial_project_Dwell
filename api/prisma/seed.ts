import { PrismaClient, ProductAvailability, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { slug: "electronics", name: "Electronics" },
  { slug: "home-garden", name: "Home & Garden" },
  { slug: "fashion", name: "Fashion" },
  { slug: "sports-outdoors", name: "Sports & Outdoors" }
];

const vendors = [
  { slug: "north-co", name: "North & Co.", description: "Independent homeware & kitchen goods maker, based in Bristol, UK.", websiteUrl: "https://example.com", verifiedSince: new Date("2022-01-01") },
  { slug: "willowbrook", name: "Willowbrook", description: "Soft furnishings and storage essentials for calm homes.", websiteUrl: "https://example.com", verifiedSince: new Date("2021-01-01") },
  { slug: "fernway-supply", name: "Fernway Supply", description: "Useful everyday objects made with durable materials.", websiteUrl: "https://example.com", verifiedSince: new Date("2023-01-01") },
  { slug: "circuit-studio", name: "Circuit Studio", description: "Demo vendor offering considered electronics for work and home.", websiteUrl: "https://example.com", verifiedSince: new Date("2024-01-01") },
  { slug: "trail-and-tide", name: "Trail & Tide", description: "Demo vendor offering practical equipment for outdoor adventures.", websiteUrl: "https://example.com", verifiedSince: new Date("2024-06-01") }
];

const products = [
  { slug: "ceramic-pour-over-kettle", title: "Ceramic Pour-Over Kettle", shortTitle: "Ceramic Kettle", vendor: "north-co", category: "home-garden", price: "38.00", description: "Hand-finished ceramic pour-over kettle with a precision gooseneck spout for controlled brewing. Holds 900ml and is dishwasher-safe. Designed and quality-checked by North & Co., an independent vendor verified on Dwell.", shortDescription: "Hand-finished ceramic pour-over kettle with a precision gooseneck spout. Holds 900ml and is dishwasher-safe." },
  { slug: "woven-storage-basket", title: "Woven Storage Basket", shortTitle: "Storage Basket", vendor: "willowbrook", category: "home-garden", price: "24.50", description: "A woven storage basket for blankets, toys, and everyday household essentials.", shortDescription: "A woven storage basket for everyday household essentials." },
  { slug: "recycled-wool-throw", title: "Recycled Wool Throw", shortTitle: "Wool Throw", vendor: "fernway-supply", category: "fashion", price: "62.00", description: "A soft recycled wool throw designed for cool evenings and layered interiors.", shortDescription: "A soft recycled wool throw for cool evenings." },
  { slug: "bamboo-desk-organiser", title: "Bamboo Desk Organiser", shortTitle: "Desk Organiser", vendor: "north-co", category: "home-garden", price: "19.00", description: "A compact bamboo organiser for notebooks, stationery, and desk accessories.", shortDescription: "A compact bamboo organiser for stationery." },
  { slug: "linen-cushion-cover", title: "Linen Cushion Cover", shortTitle: "Linen Cover", vendor: "willowbrook", category: "home-garden", price: "16.50", description: "A breathable linen cushion cover with a relaxed, natural texture.", shortDescription: "A breathable linen cushion cover." },
  { slug: "cast-iron-plant-stand", title: "Cast Iron Plant Stand", shortTitle: "Plant Stand", vendor: "fernway-supply", category: "home-garden", price: "45.00", description: "A sturdy cast iron plant stand for indoor greenery and small planters.", shortDescription: "A sturdy cast iron plant stand." },
  { slug: "oak-serving-board", title: "Oak Serving Board", shortTitle: "Serving Board", vendor: "north-co", category: "home-garden", price: "29.50", description: "An oak serving board for hosting, grazing plates, and everyday prep.", shortDescription: "An oak serving board for hosting and prep." }
];

// Fictional demonstration inventory; external links deliberately use example.com.
const additionalProducts = [
  ["stoneware-mug", "Stoneware Mug", "north-co", "home-garden", "14.00", "A hand-glazed stoneware mug with a comfortable handle for everyday tea and coffee."],
  ["cotton-table-runner", "Cotton Table Runner", "willowbrook", "home-garden", "22.00", "A washable cotton table runner for relaxed dining and everyday gatherings."],
  ["glass-storage-jars", "Glass Storage Jars", "north-co", "home-garden", "28.00", "A set of three reusable glass jars with fitted lids for dry pantry ingredients."],
  ["terracotta-planter", "Terracotta Planter", "fernway-supply", "home-garden", "18.00", "A classic terracotta planter with drainage for herbs and small indoor plants."],
  ["reading-lamp", "Reading Lamp", "circuit-studio", "electronics", "49.00", "An adjustable LED reading lamp with three brightness levels and a compact base."],
  ["wireless-keyboard", "Wireless Keyboard", "circuit-studio", "electronics", "55.00", "A compact wireless keyboard with quiet keys for everyday home office work."],
  ["usb-c-hub", "USB-C Hub", "circuit-studio", "electronics", "34.00", "A portable USB-C hub with additional connections for a flexible desktop setup."],
  ["portable-speaker", "Portable Speaker", "circuit-studio", "electronics", "65.00", "A rechargeable portable speaker with simple controls for music around the home."],
  ["charging-stand", "Charging Stand", "circuit-studio", "electronics", "27.00", "A compact charging stand designed to keep compatible devices upright on a desk."],
  ["laptop-sleeve", "Laptop Sleeve", "circuit-studio", "electronics", "25.00", "A padded laptop sleeve with a zipped accessory pocket for daily commuting."],
  ["canvas-tote-bag", "Canvas Tote Bag", "willowbrook", "fashion", "18.50", "A sturdy canvas tote with long handles for shopping and everyday essentials."],
  ["merino-scarf", "Merino Scarf", "willowbrook", "fashion", "42.00", "A soft merino wool scarf for layering through cooler days and evenings."],
  ["organic-cotton-tee", "Organic Cotton Tee", "willowbrook", "fashion", "24.00", "A breathable organic cotton T-shirt with a relaxed everyday fit."],
  ["knitted-beanie", "Knitted Beanie", "fernway-supply", "fashion", "21.00", "A warm knitted beanie with a folded brim for comfortable cold-weather wear."],
  ["recycled-daypack", "Recycled Daypack", "trail-and-tide", "sports-outdoors", "58.00", "A lightweight daypack with adjustable straps for short walks and commuting."],
  ["insulated-water-bottle", "Insulated Water Bottle", "trail-and-tide", "sports-outdoors", "26.00", "A reusable insulated water bottle with a secure lid for days on the move."],
  ["cork-yoga-mat", "Cork Yoga Mat", "trail-and-tide", "sports-outdoors", "48.00", "A cork-surface exercise mat designed for stretching and home yoga sessions."],
  ["camping-lantern", "Camping Lantern", "trail-and-tide", "sports-outdoors", "32.00", "A portable camping lantern with adjustable brightness and a hanging handle."],
  ["picnic-blanket", "Picnic Blanket", "trail-and-tide", "sports-outdoors", "36.00", "A foldable picnic blanket with a carry strap for parks and outdoor lunches."],
  ["resistance-band-set", "Resistance Band Set", "trail-and-tide", "sports-outdoors", "20.00", "A set of resistance bands with different tension levels for home workouts."],
  ["linen-apron", "Linen Apron", "north-co", "home-garden", "31.00", "A practical linen apron with a front pocket and adjustable neck strap."],
  ["wooden-wall-hooks", "Wooden Wall Hooks", "fernway-supply", "home-garden", "23.00", "A row of wooden wall hooks for organising coats and bags in an entrance hall."],
  ["cotton-bath-towel", "Cotton Bath Towel", "willowbrook", "home-garden", "29.00", "An absorbent cotton bath towel with a soft texture for daily use."]
].map(([slug, title, vendor, category, price, description]) => ({
  slug, title, shortTitle: title, vendor, category, price, description, shortDescription: description
}));

async function main() {
  const publicSiteUrl = (process.env.PUBLIC_SITE_URL ?? "http://localhost:3000/dwell").replace(/\/$/, "");
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const record = await prisma.category.upsert({ where: { slug: category.slug }, update: {}, create: category });
    categoryIds.set(category.slug, record.id);
  }

  const vendorIds = new Map<string, string>();
  for (const vendor of vendors) {
    const record = await prisma.vendor.upsert({ where: { slug: vendor.slug }, update: {}, create: vendor });
    vendorIds.set(vendor.slug, record.id);
  }

  for (const product of [...products, ...additionalProducts]) {
    const { vendor, category, ...fields } = product;
    const imageUrl = `${publicSiteUrl}/images/products/${product.slug}.png`;
    const data = {
      ...fields,
      currency: "GBP",
      availability: ProductAvailability.IN_STOCK,
      externalUrl: `https://example.com/products/${product.slug}`,
      imageUrl,
      vendorId: vendorIds.get(vendor)!,
      categoryId: categoryIds.get(category)!
    };
    await prisma.product.upsert({ where: { slug: product.slug }, update: {}, create: data });
    // Backfill only missing/bootstrap imagery, preserving administrator-supplied images
    // and every other field on records that already exist.
    await prisma.product.updateMany({
      where: {
        slug: product.slug,
        OR: [
          { imageUrl: null },
          { imageUrl: `https://placehold.co/640x480/f1f3ec/344538/png?text=${encodeURIComponent(product.title)}` },
          ...(publicSiteUrl !== "http://localhost:3000/dwell"
            ? [{ imageUrl: `http://localhost:3000/dwell/images/products/${product.slug}.png` }]
            : [])
        ]
      },
      data: { imageUrl }
    });
  }

  const email = (process.env.ADMIN_EMAIL ?? "admin@dwell.local").toLowerCase();
  // Re-running the seed must never reset an existing administrator's credentials.
  if (await prisma.user.findUnique({ where: { email } })) return;
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    console.log("Catalogue seeded. Set ADMIN_PASSWORD (12+ characters) to create the initial administrator.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "Dwell Admin", email, passwordHash, role: UserRole.ADMIN }
  });
}

main()
  .then(() => console.log("Dwell seed completed"))
  .finally(async () => prisma.$disconnect());
